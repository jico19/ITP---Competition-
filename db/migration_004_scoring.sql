-- Phase 4 scoring. Run once in Supabase Dashboard -> SQL Editor.
-- Source of truth: db/schema.sql (these changes are already merged there).

-- First-solve bonus: one +5 award per room per challenge.
create table if not exists public.first_solves (
  room_id      uuid not null references public.rooms(id) on delete cascade,
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  user_id      uuid not null references public.profiles(id) on delete cascade,
  points       int  not null default 5 check (points > 0),
  awarded_at   timestamptz not null default now(),
  primary key (room_id, challenge_id)
);
create index if not exists first_solves_user_idx on public.first_solves(user_id);

alter table public.first_solves enable row level security;
create policy "first solves read" on public.first_solves
  for select to anon, authenticated using (true);
grant select on public.first_solves to anon, authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'first_solves'
  ) then
    execute 'alter publication supabase_realtime add table public.first_solves';
  end if;
end $$;

-- Reject a client that claims a test count different from the stored challenge.
create or replace function public.before_submission()
returns trigger language plpgsql security definer set search_path = public
as $$
declare
  p public.profiles;
  r public.rooms;
  c public.challenges;
begin
  select * into p from public.profiles where id = auth.uid();
  if not found then raise exception 'Join a room first'; end if;

  select * into r from public.rooms where id = p.room_id;
  if r.status <> 'live' or (r.ends_at is not null and now() >= r.ends_at) then
    raise exception 'The competition is not live';
  end if;

  select * into c from public.challenges where id = new.challenge_id and published;
  if not found then raise exception 'Challenge not available'; end if;
  if c.type <> 'python' then raise exception 'This challenge is judged in person'; end if;

  if new.total <= 0 or new.passed < 0 or new.passed > new.total then
    raise exception 'Invalid test counts';
  end if;
  if new.total <> jsonb_array_length(c.tests) then
    raise exception 'Invalid test counts';
  end if;

  new.user_id := auth.uid();
  new.room_id := p.room_id;
  new.points  := floor(c.points * new.passed::numeric / new.total);
  return new;
end $$;

-- Keep best result and award first full solve.
create or replace function public.after_submission()
returns trigger language plpgsql security definer set search_path = public
as $$
declare
  v_max int;
begin
  insert into public.scores (user_id, room_id, challenge_id, points)
  values (new.user_id, new.room_id, new.challenge_id, new.points)
  on conflict (user_id, challenge_id) do update
    set points = excluded.points, updated_at = now()
    where excluded.points > scores.points;

  select points into v_max from public.challenges where id = new.challenge_id;

  insert into public.first_solves (room_id, challenge_id, user_id, points)
  select new.room_id, new.challenge_id, new.user_id, 5
  where new.points >= v_max
  on conflict (room_id, challenge_id) do nothing;

  return new;
end $$;

-- Judge points also count for a first full solve.
create or replace function public.after_judge_score()
returns trigger language plpgsql security definer set search_path = public
as $$
declare
  v_max int;
begin
  insert into public.scores (user_id, room_id, challenge_id, points)
  select new.user_id, p.room_id, new.challenge_id, new.points
  from public.profiles p where p.id = new.user_id
  on conflict (user_id, challenge_id) do update
    set points = excluded.points, updated_at = now();

  select points into v_max from public.challenges where id = new.challenge_id;

  insert into public.first_solves (room_id, challenge_id, user_id, points)
  select p.room_id, new.challenge_id, new.user_id, 5
  from public.profiles p
  where p.id = new.user_id and new.points >= v_max
  on conflict (room_id, challenge_id) do nothing;

  return new;
end $$;

-- Totals include bonuses; earliest time to final total breaks ties.
create or replace view public.leaderboard as
with bonus as (
  select user_id, room_id,
         sum(points)::int as points,
         max(awarded_at) as awarded_at
  from public.first_solves
  group by user_id, room_id
)
select
  p.id                                         as user_id,
  p.display_name,
  p.room_id,
  (coalesce(sum(s.points), 0) + coalesce(b.points, 0))::int as total_points,
  (count(*) filter (where s.points > 0))::int  as solved,
  greatest(max(s.updated_at), b.awarded_at)    as last_scored_at,
  rank() over (
    partition by p.room_id
    order by (coalesce(sum(s.points), 0) + coalesce(b.points, 0)) desc,
             greatest(max(s.updated_at), b.awarded_at) asc nulls last
  )::int                                       as rank
from public.profiles p
left join public.scores s on s.user_id = p.id
left join bonus b on b.user_id = p.id and b.room_id = p.room_id
group by p.id, p.display_name, p.room_id, b.points, b.awarded_at;

grant select on public.leaderboard to anon, authenticated;
