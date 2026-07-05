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

Each is grounded in `docs/PRODUCT.md`. Every option is a fully scoped hero: the settled **rest state is the default CSS**, and the intro animation plays **only** inside `@media (prefers-reduced-motion: no-preference)`, so SSR, no-JS, and reduced-motion all render the finished composition. Pure CSS, no JS motion (the switcher is the only client component). Unique class prefix per option (`ntb-`, `nt1-`, `nt2-`, `nt3-`, `ntw-`).

| Slug | Name | Role | Concept (PRODUCT.md anchor) |
|---|---|---|---|
| `the-notebook` | **The Notebook** (hybrid, featured) | polished | Notebook First × The Crossing. The whole story in one surface, three beats: a caret **writes** a thought → it **joins the stream** (count 3→4) → an older note's approved line **crosses one way** into Signal Tasks and commits. Crossing legible at rest (tether on one baseline). §3, §6, §8, §9. Prefix `ntb-`. |
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

Round 5 (five iteration rounds, three review councils: a 3-lens design panel, a 4-lens delight council, and a verification/re-score council). Each direction now lands a signature motion beat and has been through motion, typography, and narrative review:
- nt1 — a caret that *writes*; the Tasks dot glides in; promoted claim.
- nt2 — the faintest thought *escapes* (blurred trace at rest); one voice across ghosts + caught line.
- nt3 — the marker *plants* comfortably under budget; full-width track; "written" flag.
- ntw — the extract *crosses and commits* (checkbox draws); reduced chrome.

Last director re-score: nt2 ~9.8, nt3 ~9.8, nt1 ~9.6, ntw ~9.4 (ship-grade; remaining gaps are composition/emphasis judgment calls, not defects). Open fork flagged to operator: **nt1 capture→stream loop** (the §9 "note appears in the stream" contract) — trades the bold written-line rest state for the loop motion; awaiting direction. Possible next concept: **"Findable, not organised"** (anti-PKM, §3.2/§7). Nothing promoted.
