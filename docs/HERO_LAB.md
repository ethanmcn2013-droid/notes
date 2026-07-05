# Notes hero lab

A review-only showroom of homepage hero directions for Signal Notes. Not shipped, not linked from any live surface. Explore, iterate, decide — nothing here is promoted to `/`.

## Relaunch

```bash
cd notes
npm run dev            # then open http://localhost:3999/lab  (or whatever port prints)
```

- `/lab` — the index: one card per direction.
- `/lab/<slug>` — a single direction on a clean field, with a sticky switcher.
- Keys **1–4** jump between directions; **R** replays the intro (`router.refresh`).

The `/lab` route is dev-only. Its `layout.tsx` hides Clerk keyless + Next dev chrome so directions review on a clean field. `ds:check`, `npm test`, and `tsc --noEmit` stay clean for everything here.

## The four directions

Each is grounded in `docs/PRODUCT.md`. Every option is a fully scoped hero: the settled **rest state is the default CSS**, and the intro animation plays **only** inside `@media (prefers-reduced-motion: no-preference)`, so SSR, no-JS, and reduced-motion all render the finished composition. Pure CSS, no JS motion (the switcher is the only client component). Unique class prefix per option (`nt1-`, `nt2-`, `nt3-`, `ntw-`).

| Slug | Name | Role | Concept (PRODUCT.md anchor) |
|---|---|---|---|
| `notebook-first` | Notebook First | polished | The marketing surface **is** the product surface — a live capture field + stream, one note crossed to Tasks. §9 "Notebook First" contract made literal. |
| `before-it-fades` | Before It Fades | polished | The feeling under capture: the gap between remembered and lost. Thoughts drift and fade; the one you caught sits solid with the indigo caret. §3. |
| `three-seconds` | Three Seconds | polished | The locked design budget as proof: a 0→3s capture-time track, marker landing inside budget. §3, §9. |
| `the-crossing` | The Crossing | **wildcard** | The one move no capture tool has: a private note, user-approved, crossing **one way** into Signal Tasks. Raw note stays; only the extract travels. §6, §8. |

## Files

- `src/app/lab/layout.tsx` — dev-chrome hide.
- `src/app/lab/page.tsx` — index (robots noindex).
- `src/app/lab/[slug]/page.tsx` — `generateStaticParams()` over the registry.
- `src/components/lab/registry.tsx` — the `OPTIONS` array (slug, name, role, lens, headline, blurb, Component).
- `src/components/lab/switcher.tsx` — sticky bar, 1–N jump, R replay.
- `src/components/lab/option-*.tsx` — one scoped hero per direction.

## Gate discipline

No raw hex in lab files (the `ds:check` hex ratchet starts new files at zero) — tokens are aliased into scoped `--ntX-*` custom properties; globals.css always loads via the root layout, so tokens resolve. Non-contract easings carry a `ds-allow` comment with a reason (spring overshoots only). Voice: no em dashes, no exclamation marks, full name "Signal Notes".

## Status

Round 2 (design-panel pass applied). Heavy iteration expected before anything is chosen. See the session summary for the panel's per-direction scores and the next-round backlog (notably a fifth concept worth exploring: **"Findable, not organised"** — the anti-PKM counter-position from §3.2 / §7).
