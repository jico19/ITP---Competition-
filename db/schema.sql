-- =====================================================================
-- ITP Competition: Supabase schema
-- Run in: Supabase Dashboard -> SQL Editor.
-- Before using: Authentication -> Providers -> enable "Anonymous sign-ins".
-- =====================================================================

-- ---------- Admins ----------
-- Create your admin user in Authentication -> Users (email + password),
-- then run:  insert into public.admins (user_id) values ('<that user uuid>');
create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------- Rooms ----------
create table public.rooms (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  code       text not null unique default upper(substr(md5(random()::text), 1, 5)),
  status     text not null default 'lobby' check (status in ('lobby', 'live', 'ended')),
  ends_at    timestamptz,                       -- set when admin starts the round
  created_at timestamptz not null default now()
);

-- ---------- Profiles (one per player; id = anonymous auth user) ----------
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 24),
  room_id      uuid not null references public.rooms(id) on delete cascade,
  last_seen_at timestamptz not null default now(),   -- presence heartbeat
  created_at   timestamptz not null default now()
);
create index profiles_room_idx on public.profiles(room_id);

-- ---------- Challenges ----------
-- tests (python): [{"stdin":"5\n","expected":"1\n2\n","visible":true}, {"call":"add(2,3)","expected":"5"}]
-- rubric (web):   [{"label":"Add a task","points":10}, ...]
create table public.challenges (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  tier         text not null check (tier in ('easy', 'medium', 'hard')),
  type         text not null default 'python' check (type in ('python', 'web')),
  description  text not null,
  starter_code text not null default '',
  tests        jsonb not null default '[]'::jsonb,
  rubric       jsonb not null default '[]'::jsonb,
  points       int  not null default 10 check (points > 0),
  sort_order   int  not null default 0,
  published    boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------- Submissions (python attempts) ----------
create table public.submissions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  room_id      uuid not null references public.rooms(id) on delete cascade,
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  code         text not null check (char_length(code) <= 20000),
  passed       int  not null,
  total        int  not null,
  points       int  not null default 0,        -- computed by trigger
  created_at   timestamptz not null default now()
);
create index submissions_user_challenge_idx on public.submissions(user_id, challenge_id);

-- ---------- Judge scores (web challenges, entered by admin/judge) ----------
create table public.judge_scores (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  room_id        uuid not null references public.rooms(id) on delete cascade,
  challenge_id   uuid not null references public.challenges(id) on delete cascade,
  rubric_scores  jsonb not null default '{}'::jsonb,   -- {"Add a task":10,"Toggle done":5}
  points         int  not null check (points >= 0),
  judged_by      uuid default auth.uid(),
  updated_at     timestamptz not null default now(),
  unique (room_id, user_id, challenge_id)
);

-- ---------- Scores (best points per player per room per challenge; feeds leaderboard) ----------
-- Written only by triggers. Public read so the TV page can use Realtime.
create table public.scores (
  user_id      uuid not null references public.profiles(id) on delete cascade,
  room_id      uuid not null references public.rooms(id) on delete cascade,
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  points       int  not null default 0,
  updated_at   timestamptz not null default now(),
  primary key (user_id, room_id, challenge_id)
);
create index scores_room_idx on public.scores(room_id);

-- ---------- First solve bonuses (one per room per challenge) ----------
create table public.first_solves (
  room_id      uuid not null references public.rooms(id) on delete cascade,
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  user_id      uuid not null references public.profiles(id) on delete cascade,
  points       int  not null default 5 check (points > 0),
  awarded_at   timestamptz not null default now(),
  primary key (room_id, challenge_id)
);
create index first_solves_user_idx on public.first_solves(user_id);

-- =====================================================================
-- Functions & triggers
-- =====================================================================

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger challenges_touch before update on public.challenges
  for each row execute function public.touch_updated_at();

-- Join (or rejoin / rename) as the current anonymous user.
create or replace function public.join_room(p_code text, p_name text)
returns public.profiles
language plpgsql security definer set search_path = public
as $$
declare
  r      public.rooms;
  result public.profiles;
  v_name text := trim(p_name);
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  if char_length(v_name) < 1 or char_length(v_name) > 24 then
    raise exception 'Name must be 1-24 characters';
  end if;

  select * into r from public.rooms where upper(code) = upper(trim(p_code));
  if not found then raise exception 'Invalid room code'; end if;
  if r.status = 'ended' then raise exception 'This room has ended'; end if;

  insert into public.profiles (id, display_name, room_id)
  values (auth.uid(), v_name, r.id)
  on conflict (id) do update
    set display_name = excluded.display_name,
        room_id = excluded.room_id,
        last_seen_at = now()
  returning * into result;

  return result;
end $$;

revoke execute on function public.join_room(text, text) from public, anon;
grant  execute on function public.join_room(text, text) to authenticated;

-- Presence heartbeat. The app pings set_presence(true) every 20s while the
-- tab is open and set_presence(false) when it closes. Players not seen for
-- 90s are hidden from the leaderboard; their profiles and scores are kept,
-- so reopening the tab brings them back with their points.
create or replace function public.set_presence(p_online boolean)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;

  update public.profiles
     set last_seen_at = case when p_online then now()
                             else now() - interval '2 minutes' end
   where id = auth.uid();
end $$;

revoke execute on function public.set_presence(boolean) from public, anon;
grant  execute on function public.set_presence(boolean) to authenticated;

-- ---------- Admin player management ----------
-- Remove a player. Deleting the profile cascades submissions, scores,
-- judge_scores, and first_solves.
create or replace function public.admin_remove_player(p_player_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;

  delete from public.profiles where id = p_player_id;
end $$;

revoke execute on function public.admin_remove_player(uuid) from public, anon;
grant execute on function public.admin_remove_player(uuid) to authenticated;

-- Validate a python submission and compute its points server-side.
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

create trigger submissions_before before insert on public.submissions
  for each row execute function public.before_submission();

-- Keep only the best result per player per challenge.
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

create trigger submissions_after after insert on public.submissions
  for each row execute function public.after_submission();

-- Judge points: validate cap, then mirror into scores (judge may raise OR lower).
create or replace function public.before_judge_score()
returns trigger language plpgsql security definer set search_path = public
as $$
declare c public.challenges;
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

create trigger judge_scores_before before insert or update on public.judge_scores
  for each row execute function public.before_judge_score();

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

create trigger judge_scores_after after insert or update on public.judge_scores
  for each row execute function public.after_judge_score();

-- =====================================================================
-- Leaderboard view (public; runs with owner rights on purpose)
-- Ranking: total points desc, then who reached their score first.
-- Players who stopped heartbeating (>90s ago) are hidden as "left".
-- =====================================================================
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
left join public.scores s on s.user_id = p.id and s.room_id = p.room_id
left join bonus b on b.user_id = p.id and b.room_id = p.room_id
left join solved v on v.user_id = p.id and v.room_id = p.room_id
where p.last_seen_at > now() - interval '90 seconds'
group by p.id, p.display_name, p.room_id, b.points, b.awarded_at, v.solved;

grant select on public.leaderboard to anon, authenticated;

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.admins       enable row level security;
alter table public.rooms        enable row level security;
alter table public.profiles     enable row level security;
alter table public.challenges   enable row level security;
alter table public.submissions  enable row level security;
alter table public.judge_scores enable row level security;
alter table public.scores       enable row level security;
alter table public.first_solves enable row level security;

-- admins: you can check whether YOU are an admin
create policy "admins read self" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- rooms: anyone can read (timer + status); admin manages
create policy "rooms read" on public.rooms
  for select to anon, authenticated using (true);
create policy "rooms admin write" on public.rooms
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- profiles: readable by signed-in users; created/changed only via join_room()
create policy "profiles read" on public.profiles
  for select to authenticated using (true);
create policy "profiles admin write" on public.profiles
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- challenges: players see published only; admin sees/edits all
create policy "challenges read published" on public.challenges
  for select to authenticated using (published or public.is_admin());
create policy "challenges admin write" on public.challenges
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- submissions: insert as yourself (trigger validates), read your own; admin reads all
create policy "submissions insert own" on public.submissions
  for insert to authenticated with check (user_id = auth.uid());
create policy "submissions read own" on public.submissions
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

-- judge_scores: admin writes; players read their own
create policy "judge read" on public.judge_scores
  for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "judge admin write" on public.judge_scores
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- scores: public read (TV page + Realtime); no write policies (triggers only)
create policy "scores read" on public.scores
  for select to anon, authenticated using (true);

-- first_solves: public read for bonus display; no write policies (triggers only)
create policy "first solves read" on public.first_solves
  for select to anon, authenticated using (true);
grant select on public.first_solves to anon, authenticated;

-- =====================================================================
-- Realtime (TV page subscribes to scores + rooms)
-- =====================================================================
alter publication supabase_realtime add table public.scores, public.rooms, public.first_solves;