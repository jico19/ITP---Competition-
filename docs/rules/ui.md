## UI rules

- `design.md` is the visual source of truth. Keep Tailwind classes inline and use its tokens.
- Monochrome only. No hue. Status is always glyph plus text label, never color alone.
- `lucide-react` is the only icon library, and only for action or navigation icons. Status, difficulty, and terminal markers stay glyphs.
- Editor: dark or light surface from tokens, monospace, grayscale syntax theme, keyboard escapable.
- Terminal panel: shows loading, stdout, errors, per-test `[✓]` / `[!]` / `[…]` with labels,
  and a final line like `Passed 3/4 tests  +15 points`. Disable the run button while running.
- TV page: 1080p landscape, large text, CSS-only rank changes using `steps(2)` and 120ms. No login.
- Handle loading, empty, and error states for every Supabase call.
- Theme tokens and texture utilities live only in `src/index.css`. No other CSS files.
- Admin nav sits in each admin page header; admin buttons and inputs use 44px height.
