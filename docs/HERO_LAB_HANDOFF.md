# The Notebook — handoff (state as of 2026-07-06)

Continuation notes for the Signal Notes hero lab, focused on the flagship hybrid **The Notebook**. Everything below is committed on branch **`feat/notes-hero-lab`** (pushed; NOT merged, NOT deployed).

## Where to look
- Component: `src/components/lab/option-the-notebook.tsx` (prefix `ntb-`, self-contained scoped CSS).
- Registry (featured first option): `src/components/lab/registry.tsx` (`slug: "the-notebook"`).
- View: `npm run dev` → `http://localhost:3999/lab/the-notebook` (keys 1–5 jump, **R** replays).
- Screenshot harness: `../collateral/scripts/shot-ntb-long.mjs` (Playwright lives in `collateral`, not `notes`). Verify motion with the deterministic WAAPI seek pattern (pause every animation, set `currentTime`) — wall-clock capture in dev mode is unreliable.

## What it is
A ~10s cinematic introduction to Signal Notes in one surface. SSR-safe: the settled composition IS the default CSS; the intro plays only inside `@media (prefers-reduced-motion: no-preference)`; reduced-motion shows the finished, legible frame (incl. the sign-off). No JS. The story, in beats:
1. **Overture** — header (kicker "Signal Notes", H1 "Write it down before it becomes work.", lede "A private place to catch a thought in three seconds, before it slips.") + the notebook / one-way spine / Signal Tasks lane assemble.
2. **Three notes typed and logged** — each thought is typed (riding caret, type speed scaled to length ~40 char/s) and grows into the stream; count ticks 0→1→2→3. Notes: "The Hendriks want the toasts before dinner", "The marquee company still hasn't confirmed Saturday" (the one promoted), "Peonies might be past their best by June".
3. **Promote** — the marquee note's line lifts (indigo dot left behind), floats across the one-way edge (decelerating ballistic arc, transform/`cqw`, lands at unit scale), and commits as "Chase the marquee company for Saturday · from a note" (checkbox draws).
4. **Sign-off** — resolves onto the **`signal`** wordmark (the writing caret settles as the brand's indigo dot) + catch line "Nothing worth keeping gets lost."
Narration cross-fades one line per beat: "Catch each thought in three seconds." → "Everything you'd forget, kept where you'll find it." → "Send the one that becomes work to Tasks." → "The rest stays private." A "stream · PRIVATE" label mirrors "tasks · COMMITTED" so privacy reads in the still.

## Council scores / open items
Two Apple-grade council rounds. Last scores on the long cut: **director 8.4, motion lead 7.3**; round-2 fixes applied (see last commit). Known open items to take it the rest of the way:
- **Not yet re-verified frame-by-frame after the round-2 retime** — re-shoot every beat with the seek harness and confirm the new timing (length-proportional typing, rebalanced captions, caret-blink fix) lands; then run a fresh council re-score.
- **Wordmark decision (operator call):** currently `signal` per explicit request; the director recommends the product **`notes.`** wordmark (the caret IS the Notes gesture; ending on bare `signal` slightly mislabels at peak recall). One-line change: `ntb-wm-word`.
- Motion lead's lower-priority notes: the row-GROW uses `max-height` (magic 74px, `both` pins it) — consider `grid-template-rows: 0fr→1fr`; optional stage-recede on the outro to hand focus to the wordmark (watch the rest-state match).

## Gate discipline (must stay clean)
`cd notes && npm run ds:check` (zero raw hex in new lab files — alias tokens into `--ntb-*`; numeric HTML entities like `&#8217;` also trip the hex ratchet, use literal chars; non-contract eases need a `ds-allow` comment), `npx tsc --noEmit`, `npm test`, and `node ~/.claude/skills/brand-voice/voice-check.mjs <path>`. Pre-existing `main` ds:check debt in `waitlist/page.tsx` + `chrome/suite-header.tsx` is NOT ours — don't touch. Only stage lab files (another autonomous process commits in these repos).

## The other four directions (kept for reference, /lab/2–5)
Notebook First, Before It Fades, Three Seconds, The Crossing — all polished in earlier rounds (director scores 9.4–9.8). The Notebook (this hybrid) is the recommended flagship.
