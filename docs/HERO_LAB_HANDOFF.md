# The Notebook — historical handoff (state as of 2026-07-06)

This records the council pass that produced **The Notebook**. The feature branch
later placed that component on its homepage, but it remains unmerged. Current
operator-review work on **Before It Leaves** and **Three Seconds** is documented
in `docs/HERO_LAB.md`; nothing in that work changes the homepage hero.

> **Historical score:** all four council lenses ≥ 9.5, verified 2026-07-06.

## Where to look
- Component: `src/components/marketing/notes-hero-notebook.tsx` (prefix `ntb-`, self-contained scoped CSS), re-exported by `src/components/lab/option-the-notebook.tsx`.
- Registry (featured first option): `src/components/lab/registry.tsx` (`slug: "the-notebook"`).
- View: `npm run dev` → `http://localhost:3999/lab/the-notebook` (keys 1–5 jump, **R** replays).
- Screenshot harness (Playwright lives in `../collateral`, not `notes`): `../collateral/scripts/shot-ntb-frames.mjs` (17-frame seek sweep), `shot-swipe.mjs` (s00–s10, the 6.9–7.4s swipe frame-by-frame), `shot-ntb-long.mjs` (rest + beats), `seek-extra.mjs` (5.7s placeholder / 6.4s reveal / 6.6s approval), `shot-wordmark.mjs` (2× wordmark close-up). Verify motion with the deterministic WAAPI seek pattern (pause every animation, set `currentTime`) — wall-clock capture in dev mode is unreliable. Use `deviceScaleFactor: 1`.

## What it is
A ~10.3s cinematic introduction to Signal Notes in one surface. SSR-safe: the settled composition IS the default CSS; the intro plays only inside `@media (prefers-reduced-motion: no-preference)`; reduced-motion shows the finished, legible frame (incl. the sign-off). No JS. Now told in **two acts**:

**Act 1 — pure Notes capture (0–6s).** Header (kicker "Signal Notes", H1 "Write it down before it becomes work.", lede) assembles; the notebook is held **centred under the header** (Signal Tasks and the one-way edge are hidden). Three real thoughts are each typed (riding caret, speed scaled to length so it reads as a hand) and logged into the stream; the count ticks 0→1→2→3. Notes: "The Hendriks want the toasts before dinner", "The marquee company hasn't confirmed Saturday" (the one promoted), "Peonies might be past their best by June". Nothing pre-flags the chosen note.

**Act 2 — the crossing reveal (~6–8s).** The user **approves** the marquee note (a tap-ripple on the row); the note gains its indigo marker. The stage **slides to its resting position** so Signal Tasks and the one-way edge arrive into the space held for them. The approved **extract** ("Chase the marquee company for Saturday · from a note") is **swiped one way** across the edge — a sharp, decisive flick (front-loaded ~0.5s, velocity smear + slight tilt, not a drag-and-drop lob), landing **on the committed task row** and morphing into it as a **newly-committed OPEN task** (accented open checkbox — work to do, not work done). Only the extract crosses; the raw note stays private. As "The rest stays private" reads, the stream's **PRIVATE tag lights indigo** (privacy shown, not just said).

**Sign-off (~9–10s).** The stage **eases back to 0.87 opacity** (a focus-pull — still fully legible, never dimmed to dark) so the **`notes.`** wordmark leads the close (44px, the writing caret settled as the brand's indigo dot on the baseline, tight as a period) + catch line "Nothing worth keeping gets lost."

Narration cross-fades one line per beat: "Each thought, down in seconds." → "All of it, one search away." → "You send the one that becomes work to Signal Tasks." → "The rest stays private." A "stream · PRIVATE" label mirrors "tasks · COMMITTED". The four captions map to capture → findable → extract → private (the three-part promise + privacy). Total film ~10.3s.

## Iteration log — six Apple-grade council rounds this session (2026-07-06)
Four-lens councils each round (product-intro/storytelling · motion/interaction craft · editorial/typography+voice · product-truth), each given the component + fresh deterministic frames. **Final scores: storytelling 9.5, motion 9.6, editorial 9.5, product-truth 9.6 — all lenses ≥ 9.5.**

**Round A** (fixed the prior open items + first council): `signal`→`notes.` wordmark (§9); held Signal Tasks + edge back to the promote beat (two-act; capture dominates first paint per §9); added a visible approval tap-ripple + agency caption so the extract reads as deliberate not auto (§7/§8); fixed the note-3→placeholder crossfade collision; row grow `max-height:74px` → `grid-template-rows: 0fr→1fr` (no magic number, ends == rest); narration de-duped/retimed. Scores after A (verification council): **storytelling 7.8, motion 8.4, editorial 8.4, product-truth 9.2.**

**Round B** (closed each lens's "one thing"): capture font → `clamp(17px,1.7vw,22px)` so the longest note + riding caret land inside the notebook clip (was clipping the caret — the Notes gesture); wordmark dot tightened to a true period; committed task lands **open** not checked (§8 open→done); Act-1 void fixed by centring the notebook under the header and sliding the stage at the reveal so Tasks arrives into the held space (desktop only); source-row indigo marker suppressed during Act 1 (`ntb-source-pulse` fill `both`→`forwards`, `::before` held to 6.55s) so nothing telegraphs the choice; cap-2 retimed to land with the approval/crossing.

Scores after B (verification council): **storytelling 7.8, motion 8.4, editorial 8.4, product-truth 9.2.**

**Round C — sharp swipe (operator ask):** the promote-to-Tasks beat was a slow ~1.5s linear "drag-and-drop lob" (up-and-over ballistic arc). Rebuilt as a **sharp one-way swipe** — near-horizontal, front-loaded distance (explosive launch → crisp settle) over 0.5s, velocity smear (`scaleX`) + slight tilt, sharp edge-gate flash, snap landing. Retimed the landing chain, tightening the film ~11.2s → ~10.3s.

**Round D — clear 9.5, part 1:** swipe now **registers row-to-row** (`ntb-cross` lands on the committed task row, not the header it used to foul; chip-fade morphs into the task snap at 7.28s); capture line **font-weight 620** so capture out-weighs the stream rows (§9); wordmark → 38px with a true baseline period; sign-off given breathing room; **privacy shown** (PRIVATE tag lights indigo on cap-3); cap-1 repointed to "All of it, one search away." (findability, §3.2). Scores: motion 9.5, editorial 9.4, product-truth 9.6, storytelling 9.2.

**Round E — close ownership:** lede "…before it slips" → "…while you still have it" (kills the doubled "before it ___"); wordmark 44px; **stage focus-pull** — the demo eases to a lower opacity as the wordmark enters (held at rest) so the name leads the close, without touching first-paint §9 (recede fires at 9.0s). Scores: motion 9.6, editorial 9.5, product-truth 9.6, storytelling 9.4 (recede too shallow at 0.93).

**Round F — land it:** deepened the focus-pull to **0.87** (perceptible, still fully legible on white; product-truth's floor before "disabled" read) + a little more sign-off air. **Final: storytelling 9.5, motion 9.6, editorial 9.5, product-truth 9.6 — all ≥ 9.5.**

All rounds frame-verified against the deterministic seek sweep (`shot-ntb-frames.mjs` f01–f17, `shot-swipe.mjs` s00–s10 for the 6.9–7.4s swipe, `seek-extra.mjs`, `shot-wordmark.mjs` z-wordmark).

## Open items / operator judgment calls (all minor — nothing blocking)
- **Focus-pull depth = 0.87 is the floor.** Product-truth flagged: anything deeper starts to read as a disabled/greyed product. Hold at 0.87.
- **Chip lift-off origin (motion, for a 9.6→9.7 chase only).** The swipe chip appears ~30px above the source row before flying; seating `ntb-cross` 0%/8% origin ~15px lower would peel it off the row itself. Non-blocking.
- **Findability shown vs said.** cap-1 states findability ("one search away") but nothing searches. A ~0.4s ghost-query/search-rail glint would *demonstrate* it. Deferred (optional; the composition has no search rail).
- **Row anatomy (product-truth, optional).** The crossed row uses an "IN TASKS" badge; §4's literal spec is one indigo dot + the timestamp. The badge is permitted by the §9 hero contract; left for legibility.

## Gate discipline (must stay clean)
`cd notes && npm run ds:check` (lab file is clean; the only failures are the pre-existing `main` debt in `waitlist/page.tsx` + `chrome/suite-header.tsx` — NOT ours, do not touch. Zero raw hex in the lab file; alias tokens into `--ntb-*`; numeric HTML entities trip the ratchet, use literal chars; non-contract eases carry a `ds-allow` comment), `npx tsc --noEmit`, `npm test`, and `node ~/.claude/skills/brand-voice/voice-check.mjs src/components/lab/option-the-notebook.tsx`. Only stage lab files (another autonomous process commits in these repos); commit promptly.

## The other four directions (kept for reference, /lab/2–5)
Notebook First, Before It Fades, Three Seconds, The Crossing — polished in earlier rounds (director scores 9.4–9.8). The Notebook (this hybrid) is the recommended flagship.

## Preview access

The review branch is intentionally public at its Vercel preview URL so HQ rows
open the rendered lab surface directly. Preview uses the repository's explicit
demo access mode; Production authentication and the homepage hero are unchanged.
