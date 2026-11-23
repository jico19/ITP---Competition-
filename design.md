# DESIGN.md: ITP Competition terminal UI

This is the visual specification for the routes that exist in this app:

- `/` join
- `/challenges` challenge board
- `/challenge/:id` solving view
- `/tv/:roomCode` public TV board
- `/admin/*` admin screens

It is subordinate to `AGENTS.md` for behavior and routes. Anything not listed under "Deferred" is in scope.

Dial: ENERGY 2 / RHYTHM 1 / MOTION 1. The uniform grid is deliberate because the event is a single-purpose competition tool, and motion is limited to feedback and rank changes.

## 1. Principles

1. **Monochrome only.** No hue. Hierarchy comes from lightness, weight, borders, and glyphs.
2. **Grid is the layout.** Everything snaps to an 8px grid, and the background grid makes that visible.
3. **Dots mark intersections.** Dots are for surfaces and empty states. Lines are for structure.
4. **Text is the interface.** Monospace everywhere. Use `lucide-react` for action and navigation icons only. Status markers, difficulty blocks, and terminal output stay as ASCII/Unicode glyphs.
5. **Sharp and flat.** No border radius, no blur, no gradients. Depth comes from offset hard shadows and inverted fills.
6. **State without color.** Every status is glyph plus text label. Never rely on lightness alone.
7. **Purpose before decoration.** Grid and dot textures are the identity motif for a coding competition. Do not add other decorative patterns.

## 2. Theme tokens

`data-theme` on `<html>` is `dark` or `light`. Default follows `prefers-color-scheme`. The toggle persists the choice and the pre-paint script in `index.html` applies it before first paint.

### 2.1 Dark theme (primary)

| Token | Value | Use |
|---|---|---|
| `--bg` | `#4A4A4A` | Page canvas |
| `--surface-1` | `#424242` | Panels, cards |
| `--surface-2` | `#383838` | Editor, inputs, output |
| `--surface-3` | `#2E2E2E` | Wells, pressed states |
| `--fg` | `#FFFFFF` | Primary text |
| `--fg-muted` | `#CFCFCF` | Secondary text |
| `--fg-faint` | `#BABABA` | Placeholders, hints, disabled |
| `--line` | `#6B6B6B` | Decorative grid and dividers |
| `--line-strong` | `#9A9A9A` | Control and panel boundaries |
| `--dot` | `#6B6B6B` | Dot texture |
| `--invert-bg` | `#FFFFFF` | Inverted blocks |
| `--invert-fg` | `#4A4A4A` | Text on inverted blocks |

### 2.2 Light theme

| Token | Value | Use |
|---|---|---|
| `--bg` | `#FFFFFF` | Page canvas |
| `--surface-1` | `#F6F6F6` | Panels, cards |
| `--surface-2` | `#EDEDED` | Editor, inputs, output |
| `--surface-3` | `#E2E2E2` | Wells, pressed states |
| `--fg` | `#4A4A4A` | Primary text |
| `--fg-muted` | `#6B6B6B` | Secondary text |
| `--fg-faint` | `#6B6B6B` | Placeholders, hints, disabled |
| `--line` | `#C4C4C4` | Decorative grid and dividers |
| `--line-strong` | `#4A4A4A` | Control and panel boundaries |
| `--dot` | `#C4C4C4` | Dot texture |
| `--invert-bg` | `#4A4A4A` | Inverted blocks |
| `--invert-fg` | `#FFFFFF` | Text on inverted blocks |

Notes:

- `--fg` on `--bg` is 8.86:1 in both themes. `--fg-muted` on `--bg` is 5.69:1 dark and 5.33:1 light. `--fg-faint` was raised above the original values so placeholders also pass 4.5:1.
- `--line` is a decorative rule and does not meet 3:1 on the page canvas. Use `--line-strong` for any boundary that identifies a control, panel, or focusable region.
- Inverted pairs are 8.86:1.

### 2.3 Tailwind v4 mapping

There is no `tailwind.config.js`. Tailwind v4 runs through `@tailwindcss/vite`. Token mapping lives in `src/index.css`:

```css
@import "tailwindcss";

@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));

@theme inline {
  --color-bg: var(--bg);
  --color-surface-1: var(--surface-1);
  --color-surface-2: var(--surface-2);
  --color-surface-3: var(--surface-3);
  --color-fg: var(--fg);
  --color-fg-muted: var(--fg-muted);
  --color-fg-faint: var(--fg-faint);
  --color-line: var(--line);
  --color-line-strong: var(--line-strong);
  --color-invert-bg: var(--invert-bg);
  --color-invert-fg: var(--invert-fg);
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
  --shadow-hard: 4px 4px 0 0 var(--line-strong);
  --shadow-hard-sm: 2px 2px 0 0 var(--line-strong);
}
```

Utilities therefore stay theme aware: `bg-surface-1 text-fg border-line-strong`. `dark:` variants are rarely needed because the variables swap.

## 3. Textures

Defined once in `src/index.css` with `@utility`. No other CSS files.

| Class | Use |
|---|---|
| `bg-grid-soft` | Page canvas, 24px squares at 35% line opacity |
| `bg-grid-dots` | Challenge board header well only, with radial mask fade |
| `bg-dots-dense` | Empty states, loading wells, locked overlays |
| `bg-hatch` | Locked or disabled controls |

Never place texture behind long-form text.

## 4. Typography

One family: the system monospace stack above. No webfont, no CDN, no new dependency. The stack is chosen so the app works offline during the event and keeps terminal alignment in the editor and tables.

| Role | Classes |
|---|---|
| Page title | `text-2xl font-bold tracking-tight` prefixed with `# ` |
| Section label | `text-sm font-bold uppercase tracking-widest` prefixed with `## ` |
| Body | `text-sm leading-6` |
| Meta | `text-xs text-fg-muted` |
| Code and output | `text-[13px] leading-6` |

Use `tabular-nums` on every timer, rank, score, and count. Avoid large decorative monospace headings outside the challenge board title.

## 5. Layout

- Base unit 8px. Grid cell 24px. Prefer `p-3`, `p-6`, `p-9`, `p-12`.
- Content width `max-w-6xl`, with `px-4 md:px-6`.
- Borders 1px. Decorative rules use `border-line`, controls and panels use `border-line-strong`, soft separators use `border-dashed border-line`.
- Radius always 0.
- Shadow only `shadow-hard` or `shadow-hard-sm` on hover-lift and modals.
- Titled panel pattern is allowed for the board header and TV podium.

## 6. Components

Keep Tailwind classes inline. Extract a component only when the same markup appears in three or more places.

### 6.1 Buttons

Primary: `h-10 border border-invert-bg bg-invert-bg px-4 text-xs font-bold uppercase tracking-wider text-invert-fg hover:shadow-hard-sm hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform active:translate-x-0 active:translate-y-0 active:shadow-none`

Secondary: `h-10 border border-line-strong bg-transparent px-4 text-xs font-bold uppercase tracking-wider text-fg hover:bg-surface-3`

Admin screens use `h-11` instead of `h-10` so admin controls meet the 44px touch target. Player screens keep the compact 40px terminal controls with at least 8px spacing between them.

Ghost: `text-fg-muted hover:text-fg underline-offset-4 hover:underline`

Disabled: `cursor-not-allowed opacity-50 bg-hatch`

Labels use a prompt glyph: `> run`, `> submit`, `$ join`. The glyph is text, not an icon.

### 6.2 Inputs

Visible `<label>` above each field. Control shell uses `border border-line-strong bg-surface-2 focus-within:border-fg`. Placeholder uses `placeholder:text-fg-faint`.

### 6.3 Icons

Use `lucide-react` for actions and navigation only. Recommended set: `Sun`, `Moon`, `ArrowLeft`, `Copy`, `Search`, `X`. Use `size={16}`, `strokeWidth={1.75}`, `currentColor`. Decorative icons get `aria-hidden="true"` when a visible text label exists. Icon-only buttons get `aria-label`. No sparkles, stars, or generic "AI" icons.

### 6.4 Blinking cursor

Class `blink-cursor` in `src/index.css`. 1.1s `steps(1)` blink, disabled under `prefers-reduced-motion`. Use on the join prompt only; the wordmark stays static.

### 6.5 Tags

`inline-flex h-6 items-center border border-line-strong px-2 text-[11px] uppercase tracking-widest`. Active tag swaps to `bg-invert-bg text-invert-fg border-invert-bg`. Puzzle types are text only: `[PY]`, `[WEB]`.

### 6.6 Terminal window

`border border-line-strong bg-surface-2`. Header row is `h-8 border-b border-line px-3 text-xs text-fg-muted` with square window glyphs and a path label. Body is a `pre` or log list in `text-[13px] leading-6 overflow-x-auto`. No fake typed demo in this app; terminal chrome is only used around real output or the editor.

### 6.7 Tables and toasts

Table headers are `text-xs uppercase tracking-widest text-fg-muted border-b border-line-strong`. Rows are `h-12 border-b border-dashed border-line hover:bg-surface-3`. Numeric columns are right aligned and tabular. No zebra striping. Toasts are one-line terminal messages at bottom left: `[ok] solution accepted · +120 pts`.

## 7. Status without color

Always pair glyph and text.

| State | Glyph | Treatment |
|---|---|---|
| Solved | `[✓]` | Inverted block |
| Attempted | `[~]` | Outlined, normal text |
| Unsolved | `[ ]` | Outlined, muted text |
| Locked | `[×]` | `bg-hatch`, muted, not clickable |
| First solve | `[★]` | Inverted block with `shadow-hard-sm` |
| Wrong answer | `[!]` | Dashed border, bold `WA` |
| Accepted | `[✓]` | Inverted block, bold `AC` |
| Time limit | `[…]` | Dashed border, bold `TLE` |
| Error | `[!]` | Dashed border, readable error text |
| Loading | `[…]` | Muted text, explicit "Loading..." label |
| Live | `[•]` | Pulsing glyph at 1.2s `steps(2)`, paired with "live round" |

Difficulty is filled blocks with `aria-label`: `■□□□□` easy, `■■■□□` medium, `■■■■■` hard. Progress is segmented: `[■■■■□□□□□□] 40%`.

## 8. Screens

### 8.1 Join (`/`)

Terminal-framed card. Label `ITP Competition`, title `# Join room`, one-line explanation, labeled display name and room code inputs, suggest-name button, error line, primary `$ join` button. Loading and error states are explicit. Countdown is not shown here because room data is not loaded yet.

### 8.2 Challenge board (`/challenges`)

Header `# Challenge Board` with segmented progress readout built from real data already in the store. Group by Easy, Medium, Hard as today. Cards use `border border-line-strong bg-surface-1 p-4 hover:shadow-hard hover:-translate-x-0.5 hover:-translate-y-0.5 transition`, number, type tag, status glyph, title, difficulty blocks, points, and solve count when present. Solved cards use an inverted header strip. Empty, loading, and error states use the dot well and glyph plus text.

Deferred here: type filters, search, sort, unlock times, first blood.

### 8.3 Solving view (`/challenge/:id`)

Desktop keeps the current stacked layout for phase one: problem panel, editor, output panel, countdown. A two-pane resizable layout is deferred.

- Problem panel: `surface-1`, title as `# title`, meta tags, difficulty, points, description in `whitespace-pre-wrap`.
- Editor: `surface-2` frame, grayscale CodeMirror theme. Keywords bold, comments italic and faint, strings dotted underline, numbers normal. Current line uses `surface-3`.
- Output: terminal window with rows `[✓]` / `[!]` / `[…]` plus case label and detail. Hidden tests show pass/fail only. Summary is an inverted or dashed block.
- Run button is `> run`. After all tests pass it becomes `> submit`. Disabled while running or loading Python, and hatched when the round is locked.
- Web challenges show the rubric as a dashed list and a note that judging happens in person.

Deferred here: tabs, hints, keyboard shortcuts, discussion, status bar with invented metrics.

### 8.4 TV (`/tv/:roomCode`)

1080p landscape, public, no login. Keep large text and the CSS-only rank transitions required by `docs/rules/ui.md`, but use `steps(2)` and 120ms. Header shows room name and a tabular timer in `fg`, not amber. First place gets an inverted header strip. Other ranks are outlined. Standings keep the current two-column list, with dashed dividers and tabular numerals. Error and empty states are full-screen text. No color accents, no gradients, no podium podiums with different hues.

Deferred here: tabs, pagination, live delta column (no real data source), current-user sticky row.

### 8.5 Admin

Apply the same tokens and primitives to rooms, challenge list, challenge form, judge, and login. Status badges become glyph plus text. The existing `AdminNav` keeps its links, which all point to real routes.

## 9. Global chrome

`TopBar` in `App.jsx` renders on all non-TV routes: `> itp_` wordmark linking to `/`, a `[board]` link when a profile exists, room code and handle when present, and `ThemeToggle`. It is `h-12 border-b border-line-strong bg-bg sticky top-0`. The TV route skips it to stay full-screen.

Each admin page renders the nav in its header below the title. It is not sticky. `/admin/login` is outside `RequireAdmin` and does not show it.

Theme toggle is a two-state segmented control with `Sun` and `Moon`, accessible label "Toggle theme", persisted to `localStorage` under `theme`.

## 10. Motion

| Effect | Spec | Purpose |
|---|---|---|
| Hover lift | 100ms `steps(2)`, -2px, `shadow-hard-sm` | Marks interactive cards |
| Blink | 1.1s `steps(1)` | Terminal prompt only |
| Live indicator | 1.2s `steps(2)` | Marks a real live round |
| Rank change | 120ms `steps(2)` | Shows reorder on TV |

No spring easing, no fade choreography. All motion stops under `prefers-reduced-motion: reduce`.

## 11. Accessibility

- All text pairs meet 4.5:1. Control boundaries meet 3:1 through `--line-strong`.
- Focus ring: `outline: 2px solid var(--fg); outline-offset: 2px`. Never remove it.
- Every enabled control has `cursor: pointer`, a visible label or `aria-label`, and hover, active, and disabled states.
- Status is glyph plus text. Decorative glyphs get `sr-only` text where needed.
- Minimum touch target 44px on admin screens. Player controls stay compact at 40px with at least 8px spacing.
- Text resizes to 200% without clipping. No horizontal overflow at 360px.
- CodeMirror must remain keyboard escapable with Tab.

## 12. Responsive

| Width | Behavior |
|---|---|
| `< sm` | Single column. Board cards stack. Judge and room forms stack. TV keeps large text but wraps. |
| `sm` to `lg` | Board uses two columns. Solving view stays stacked with a taller editor. |
| `>= lg` | Board uses three columns. Solving view may use a wider two-column arrangement if added later. |
| `>= xl` | Content capped at `max-w-6xl`. |

## 13. Deferred

Not in this app and not to be built without a new request:

- Marketing landing, stats row, how-it-works, puzzle type showcase, footer build string
- Standalone leaderboard page, tabs, pagination, first blood display
- Board filters, grep search, sort, unlock conditions
- Resizable editor panes, tabs, hints, discussion, shortcut modal, status bar metrics
- CRT scanline overlay

## 14. Checklist

- [x] Tokens and textures live only in `src/index.css`
- [x] Tailwind v4 `@theme inline` maps tokens to utilities
- [x] Pre-paint theme script in `index.html`
- [x] System mono stack, no external font
- [x] `lucide-react` for action icons, glyphs for status
- [x] Grayscale CodeMirror theme
- [x] Both themes checked for contrast
- [ ] Manual browser pass pending: screen reader + 360px visual check
