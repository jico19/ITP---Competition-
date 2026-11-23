-- Player presence: auto-leave when the tab closes. Run once in Supabase Dashboard -> SQL Editor.
-- Source of truth: db/schema.sql (this change is already merged there).
-- Closing the tab marks the player left; their profile and scores are kept.
-- Reopening the tab (same browser) revives them with their points.
-- Players not seen for 90s are hidden from the leaderboard (TV).

alter table public.profiles
  add column if not exists last_seen_at timestamptz not null default now();

-- Heartbeat / mark-left. Called by the app every 20s and on tab close.
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

-- Rejoining also revives a player who was marked left.
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

-- Hide players who stopped heartbeating. Admin roster and judge still see everyone.
create or replace view public.leaderboard as
with bonus as (
  select user_id, room_id,
         sum(points)::int as points,
         max(awarded_at) as awarded_at
  from public.first_solves
  group by user_id, room_id
), solved as (
  select s.user_id, count(*)::int as solved
  from public.scores s
  join public.challenges c on c.id = s.challenge_id
  where s.points >= c.points
  group by s.user_id
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
left join public.scores s on s.user_id = p.id
left join bonus b on b.user_id = p.id and b.room_id = p.room_id
left join solved v on v.user_id = p.id
where p.last_seen_at > now() - interval '90 seconds'
group by p.id, p.display_name, p.room_id, b.points, b.awarded_at, v.solved;

grant select on public.leaderboard to anon, authenticated;
