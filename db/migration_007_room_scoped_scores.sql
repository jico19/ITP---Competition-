-- Room-scoped scores. Source of truth: db/schema.sql (these changes are merged there).
-- Scores and judge scores must belong to the room the player joined; the old keys
-- were global per player/challenge, so points leaked into another room's leaderboard.

-- One best score per player, per room, per challenge.
-- Backfill before dropping the PK: scores publishes updates, so it needs a replica identity.
update public.scores s
   set room_id = p.room_id
  from public.profiles p
 where p.id = s.user_id;
alter table public.scores drop constraint if exists scores_pkey;
alter table public.scores add primary key (user_id, room_id, challenge_id);

-- Judge scores need the same room scope.
alter table public.judge_scores
  add column if not exists room_id uuid references public.rooms(id) on delete cascade;
update public.judge_scores j
   set room_id = p.room_id
  from public.profiles p
 where p.id = j.user_id;
alter table public.judge_scores alter column room_id set not null;
alter table public.judge_scores drop constraint if exists judge_scores_user_id_challenge_id_key;
alter table public.judge_scores
  add constraint judge_scores_room_user_challenge_key unique (room_id, user_id, challenge_id);

create or replace function public.after_submission()
returns trigger language plpgsql security definer set search_path = public
as $$
declare
  v_max int;
begin
  insert into public.scores (user_id, room_id, challenge_id, points)
  values (new.user_id, new.room_id, new.challenge_id, new.points)
  on conflict (user_id, room_id, challenge_id) do update
    set points = excluded.points, updated_at = now()
    where excluded.points > scores.points;

  select points into v_max from public.challenges where id = new.challenge_id;

  insert into public.first_solves (room_id, challenge_id, user_id, points)
  select new.room_id, new.challenge_id, new.user_id, 5
  where new.points >= v_max
  on conflict (room_id, challenge_id) do nothing;

  return new;
end $$;

create or replace function public.before_judge_score()
returns trigger language plpgsql security definer set search_path = public
as $$
declare
  c public.challenges;
  p public.profiles;
begin
  select * into c from public.challenges where id = new.challenge_id;
  if not found then raise exception 'Challenge not found'; end if;
  if new.points > c.points then
    raise exception 'Points exceed the challenge maximum (%)', c.points;
  end if;

  select * into p from public.profiles where id = new.user_id;
  if not found then raise exception 'Player not found'; end if;
  if p.room_id is distinct from new.room_id then
    raise exception 'Judge score must match the player room';
  end if;

  new.room_id := p.room_id;
  new.updated_at := now();
  return new;
end $$;

create or replace function public.after_judge_score()
returns trigger language plpgsql security definer set search_path = public
as $$
declare
  v_max int;
begin
  insert into public.scores (user_id, room_id, challenge_id, points)
  select new.user_id, p.room_id, new.challenge_id, new.points
  from public.profiles p where p.id = new.user_id
  on conflict (user_id, room_id, challenge_id) do update
    set points = excluded.points, updated_at = now();

  select points into v_max from public.challenges where id = new.challenge_id;

  insert into public.first_solves (room_id, challenge_id, user_id, points)
  select p.room_id, new.challenge_id, new.user_id, 5
  from public.profiles p
  where p.id = new.user_id and new.points >= v_max
  on conflict (room_id, challenge_id) do nothing;

  return new;
end $$;

-- Rank points and solves only inside the player's current room.
create or replace view public.leaderboard as
with bonus as (
  select user_id, room_id,
         sum(points)::int as points,
         max(awarded_at) as awarded_at
  from public.first_solves
  group by user_id, room_id
), solved as (
  select s.user_id, s.room_id, count(*)::int as solved
  from public.scores s
  join public.challenges c on c.id = s.challenge_id
  where s.points >= c.points
  group by s.user_id, s.room_id
)
select
  p.id                                         as user_id,
  p.display_name,
  p.room_id,
  (coalesce(sum(s.points), 0) + coalesce(b.points, 0))::int as total_points,
  coalesce(v.solved, 0)::int                   as solved,
  greatest(max(s.updated_at), b.awarded_at)    as last_scored_at,
  rank() over (
    partition by p.room_id
    order by (coalesce(sum(s.points), 0) + coalesce(b.points, 0)) desc,
             greatest(max(s.updated_at), b.awarded_at) asc nulls last
  )::int                                       as rank
from public.profiles p
left join public.scores s
       on s.user_id = p.id and s.room_id = p.room_id
left join bonus b on b.user_id = p.id and b.room_id = p.room_id
left join solved v on v.user_id = p.id and v.room_id = p.room_id
where p.last_seen_at > now() - interval '90 seconds'
group by p.id, p.display_name, p.room_id, b.points, b.awarded_at, v.solved;

grant select on public.leaderboard to anon, authenticated;
