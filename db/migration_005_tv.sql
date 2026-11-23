-- Phase 5 TV display. Run once in Supabase Dashboard -> SQL Editor.
-- Source of truth: db/schema.sql (this change is already merged there).
-- `solved` must count full solves, not merely positive scores.

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
group by p.id, p.display_name, p.room_id, b.points, b.awarded_at, v.solved;

grant select on public.leaderboard to anon, authenticated;
