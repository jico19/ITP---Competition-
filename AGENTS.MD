# AGENTS.md: ITP Competition
 
Live coding competition web app for a college web dev team (event: Nov 27, ~20-40 players, used once).
**Simple and working beats clever.** Do not add features that are not requested.
 
## Stack (target; current repo is scaffold-only unless deps are installed)
- React (Vite, plain JS/JSX), TailwindCSS, `react-router-dom`
- Supabase: anonymous auth, Postgres, Realtime (`@supabase/supabase-js`)
- Editor: `@uiw/react-codemirror` + `@codemirror/lang-python`
- Python runs in the browser via **Pyodide in a Web Worker**. No backend server.
- State: Zustand for shared/client state; hooks for local/component logic.
- Ask before adding any other dependency.
## Commands
- `npm install`, `npm run dev`, `npm run build`
- Env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (keep `.env.example` updated; never commit `.env`)
## Source of truth
`db/schema.sql` defines the database. Read it before touching any Supabase code.
`db/seed.sql` has sample challenges and room `TEST1`.
Do not change the schema silently. If a change is needed, say so and propose the SQL.
 
## Player flow
1. Join with a display name (typed or suggested) + room code. No password.
2. Pick Easy / Medium / Hard challenge, read the problem.
3. Solve it in VS Code, paste the code into the app editor.
4. Click **Run tests**: all tests run in the browser, the result is saved, points shown in the terminal.
Web challenges (type `web`) are judged in person; the judge enters rubric points on `/admin/judge`.
## Routes
- Player: `/` (join), `/challenges`, `/challenge/:id`
- TV (public): `/tv/:roomCode` (timer, top-3 podium, ranked table)
- Admin: `/admin/login`, `/admin` (rooms), `/admin/challenges`, `/admin/judge`

## Rules
- General: `docs/rules/rules.md`
- DB/Supabase security & data flow: `docs/rules/security.md` (read before any Supabase code)
- UI: `docs/rules/ui.md`
- If rules conflict with the latest user message, follow the user and mention it.

## Test formats (`challenges.tests`, jsonb array)
- stdin test: `{"stdin": "5\n", "expected": "1\n2\n", "visible": true}`
- call test: `{"call": "add(2,3)", "expected": "5"}` where `expected` is `repr(result)`
- `visible: true` tests show expected vs got; hidden tests show only pass/fail.
- Web challenges use `rubric`: `[{"label": "Add a task", "points": 10}]`.
## Python runner rules (`src/lib/pyRunner.js`, `src/workers/pyWorker.js`)
- Load Pyodide once per worker; preload on app mount; show "Loading Python..." until ready.
- Each test runs in **fresh globals** with `__name__ == "__main__"`.
- stdin tests: replace `input()` with a reader over the test's stdin lines, capture stdout via `io.StringIO`.
  - `input(prompt)` must **ignore the prompt** (do not print it). Players paste code from VS Code.
  - Out of input raises `EOFError`.
- call tests: `exec` the code, then `eval` the call expression in the same globals, compare `repr(result)`.
- Compare output after trimming trailing whitespace per line and at the end.
- A Python exception fails only that test; return the message and line number if available.
- **5 second timeout** per run: `terminate()` the worker, show "Time limit exceeded (infinite loop?)",
  then start a fresh worker in the background.
## Folder structure (target)
```
src/
  lib/        supabase.js, pyRunner.js, names.js
  workers/    pyWorker.js
  hooks/      useSession.js, useRoom.js, useCountdown.js
  components/ Terminal.jsx, Podium.jsx, ChallengeCard.jsx, Countdown.jsx
  pages/      Join, Challenges, Challenge, Tv
  pages/admin/ Login, Rooms, ChallengeList, ChallengeForm, Judge
db/           schema.sql, seed.sql
```
 


## Working agreement
- Build in phases and **stop after each phase** with what to test:
  1. Scaffold + anonymous join. 2. Challenge list + editor. 3. Pyodide runner + terminal.
  4. TV page + Realtime. 5. Admin (rooms, challenge CRUD + "Test it", judge). 6. Polish + README.
- Do not refactor unrelated code or rename files unless asked.
- If something in this file conflicts with the user's latest message, follow the user and mention it.