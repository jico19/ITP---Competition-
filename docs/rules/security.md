## Database rules

- Sign in with `supabase.auth.signInAnonymously()`, then RPC `join_room(p_code, p_name)`.
  Never insert/update `profiles` directly.
- Insert into `submissions` only `challenge_id, code, passed, total`.
  Points, `user_id`, `room_id` are set by a trigger. Never compute or send points from the client.
- `scores` is written only by triggers. Never write to it from the app.
- Leaderboard = `leaderboard` view (public). TV page subscribes to Realtime on `scores` and `rooms`,
  refetches on change, with a 10s polling fallback.
- Admin = Supabase email/password user listed in `admins`. Check via `select` on `admins`.
- Rooms: `status` is `lobby | live | ended`; the DB rejects submissions unless live and before `ends_at`.
- Surface DB/RPC error messages to the user in readable form.