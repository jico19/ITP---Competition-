# ITP Competition rules

- use the `caveman` skills to save tokens. 
- Prioritize readability and maintainability over complexity.
- If logic can be modularized cleanly, extract it into a small function/module.
- Do not install dependencies without my permission.
- When touching Supabase, use the Supabase skills: `supabase` and `supabase-postgres-best-practices`.
- Small, readable components. Short comments only where logic is non-obvious.
- Functional components and hooks. Use Zustand for shared/client state; use hooks for local/component logic.
- Keep Tailwind classes inline. No custom CSS files beyond `src/index.css`, which holds the theme tokens and texture utilities required by `design.md`.
- `lucide-react` is approved for action/navigation icons. Status markers stay ASCII glyphs.
- No test framework needed.