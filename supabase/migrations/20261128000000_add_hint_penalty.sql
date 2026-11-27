-- Paid hints for Python challenges. Each revealed hint costs 1 point on
-- future submissions. First-solve bonus still requires all tests to pass.

create table public.hint_uses (
  room_id      uuid not null references public.rooms(id) on delete cascade,
  user_id      uuid not null references public.profiles(id) on delete cascade,
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  hints_used   int  not null default 0 check (hints_used >= 0),
  primary key (room_id, user_id, challenge_id)
);

alter table public.hint_uses enable row level security;

create policy "hint uses read own" on public.hint_uses
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "hint uses write own" on public.hint_uses
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, insert, update on public.hint_uses to authenticated;

-- Reveal one hint. Writes go through RLS, so the function stays invoker.
create or replace function public.use_hint(p_challenge_id uuid)
returns int
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_room  uuid;
  v_count int;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;

  select room_id into v_room from public.profiles where id = auth.uid();
  if not found then raise exception 'Join a room first'; end if;

  if not exists (
    select 1 from public.rooms r
     where r.id = v_room
       and r.status = 'live'
       and (r.ends_at is null or now() < r.ends_at)
  ) then raise exception 'The competition is not live'; end if;

  if not exists (
    select 1 from public.challenges c
     where c.id = p_challenge_id
       and c.published
       and c.type = 'python'
  ) then raise exception 'Hint not available'; end if;

  insert into public.hint_uses (room_id, user_id, challenge_id, hints_used)
  values (v_room, auth.uid(), p_challenge_id, 1)
  on conflict (room_id, user_id, challenge_id)
  do update set hints_used = public.hint_uses.hints_used + 1
  returning hints_used into v_count;

  return v_count;
end $$;

revoke execute on function public.use_hint(uuid) from public, anon;
grant execute on function public.use_hint(uuid) to authenticated;

-- Submission scoring now subtracts revealed hints, never below zero.
create or replace function public.before_submission()
returns trigger language plpgsql security definer set search_path = public
as $$
declare
  p public.profiles;
  r public.rooms;
  c public.challenges;
  v_hints int := 0;
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

  select coalesce(hints_used, 0) into v_hints
    from public.hint_uses
   where room_id = p.room_id
     and user_id = auth.uid()
     and challenge_id = new.challenge_id;

  new.user_id := auth.uid();
  new.room_id := p.room_id;
  new.points  := greatest(0, floor(c.points * new.passed::numeric / new.total)::int - v_hints);
  return new;
end $$;

-- First solve is now based on passing every test, not on keeping full points.
create or replace function public.after_submission()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.scores (user_id, room_id, challenge_id, points)
  values (new.user_id, new.room_id, new.challenge_id, new.points)
  on conflict (user_id, room_id, challenge_id) do update
    set points = excluded.points, updated_at = now()
    where excluded.points > scores.points;

  insert into public.first_solves (room_id, challenge_id, user_id, points)
  select new.room_id, new.challenge_id, new.user_id, 5
  where new.passed = new.total
  on conflict (room_id, challenge_id) do nothing;

  return new;
end $$;

-- Hinted full solves still count as solved on the leaderboard.
create or replace view public.leaderboard as
with bonus as (
  select user_id, room_id,
         sum(points)::int as points,
         max(awarded_at) as awarded_at
  from public.first_solves
  group by user_id, room_id
), solved as (
  select user_id, room_id, count(distinct challenge_id)::int as solved
  from (
    select s.user_id, s.room_id, s.challenge_id
      from public.submissions s
      join public.challenges c on c.id = s.challenge_id
     where s.passed = s.total and c.published and c.type = 'python'
    union
    select sc.user_id, sc.room_id, sc.challenge_id
      from public.scores sc
      join public.challenges c on c.id = sc.challenge_id
     where sc.points >= c.points and c.published and c.type = 'web'
  ) solved_rows
  group by user_id, room_id
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
left join public.scores s on s.user_id = p.id and s.room_id = p.room_id
left join bonus b on b.user_id = p.id and b.room_id = p.room_id
left join solved v on v.user_id = p.id and v.room_id = p.room_id
where p.last_seen_at > now() - interval '90 seconds'
group by p.id, p.display_name, p.room_id, b.points, b.awarded_at, v.solved;
