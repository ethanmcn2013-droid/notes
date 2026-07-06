# The Notebook — handoff (state as of 2026-07-06)

Continuation notes for the Signal Notes hero lab, focused on the flagship hybrid **The Notebook**. Everything below is committed on branch **`feat/notes-hero-lab`** (pushed; NOT merged, NOT deployed).

## Where to look
- Component: `src/components/lab/option-the-notebook.tsx` (prefix `ntb-`, self-contained scoped CSS).
- Registry (featured first option): `src/components/lab/registry.tsx` (`slug: "the-notebook"`).
- View: `npm run dev` → `http://localhost:3999/lab/the-notebook` (keys 1–5 jump, **R** replays).
- Screenshot harness (Playwright lives in `../collateral`, not `notes`): `../collateral/scripts/shot-ntb-frames.mjs` (17-frame seek sweep), `shot-ntb-long.mjs` (rest + beats), `seek-extra.mjs` (5.7s placeholder / 6.4s reveal / 6.6s approval), `shot-wordmark.mjs` (2× wordmark close-up). Verify motion with the deterministic WAAPI seek pattern (pause every animation, set `currentTime`) — wall-clock capture in dev mode is unreliable. Use `deviceScaleFactor: 1`.

## What it is
A ~11s cinematic introduction to Signal Notes in one surface. SSR-safe: the settled composition IS the default CSS; the intro plays only inside `@media (prefers-reduced-motion: no-preference)`; reduced-motion shows the finished, legible frame (incl. the sign-off). No JS. Now told in **two acts**:

**Act 1 — pure Notes capture (0–6s).** Header (kicker "Signal Notes", H1 "Write it down before it becomes work.", lede) assembles; the notebook is held **centred under the header** (Signal Tasks and the one-way edge are hidden). Three real thoughts are each typed (riding caret, speed scaled to length so it reads as a hand) and logged into the stream; the count ticks 0→1→2→3. Notes: "The Hendriks want the toasts before dinner", "The marquee company hasn't confirmed Saturday" (the one promoted), "Peonies might be past their best by June". Nothing pre-flags the chosen note.

**Act 2 — the crossing reveal (6–9s).** The user **approves** the marquee note (a tap-ripple on the row); the note gains its indigo marker. The stage **slides to its resting position** so Signal Tasks and the one-way edge arrive into the space held for them. The approved **extract** ("Chase the marquee company for Saturday · from a note") lifts, arcs one way across the edge (decelerating ballistic arc), and lands in Tasks as a **newly-committed OPEN task** (accented open checkbox — work to do, not work done). Only the extract crosses; the raw note stays private.

**Sign-off (9–11s).** Resolves onto the **`notes.`** wordmark (the writing caret settles as the brand's indigo dot, tight as a period) + catch line "Nothing worth keeping gets lost."

Narration cross-fades one line per beat: "Each thought, down in seconds." → "What you'd forget stays where you'll find it." → "You send the one that becomes work to Signal Tasks." → "The rest stays private." A "stream · PRIVATE" label mirrors "tasks · COMMITTED".

## Iteration log — two Apple-grade council rounds this session (2026-07-06)
Four-lens councils each round (product-intro/storytelling · motion/interaction craft · editorial/typography+voice · product-truth), each given the component + fresh deterministic frames.

**Round A** (fixed the prior open items + first council): `signal`→`notes.` wordmark (§9); held Signal Tasks + edge back to the promote beat (two-act; capture dominates first paint per §9); added a visible approval tap-ripple + agency caption so the extract reads as deliberate not auto (§7/§8); fixed the note-3→placeholder crossfade collision; row grow `max-height:74px` → `grid-template-rows: 0fr→1fr` (no magic number, ends == rest); narration de-duped/retimed. Scores after A (verification council): **storytelling 7.8, motion 8.4, editorial 8.4, product-truth 9.2.**

**Round B** (closed each lens's "one thing"): capture font → `clamp(17px,1.7vw,22px)` so the longest note + riding caret land inside the notebook clip (was clipping the caret — the Notes gesture); wordmark dot tightened to a true period; committed task lands **open** not checked (§8 open→done); Act-1 void fixed by centring the notebook under the header and sliding the stage at the reveal so Tasks arrives into the held space (desktop only); source-row indigo marker suppressed during Act 1 (`ntb-source-pulse` fill `both`→`forwards`, `::before` held to 6.55s) so nothing telegraphs the choice; cap-2 retimed to land with the approval/crossing.

All Round B fixes frame-verified by the author against the seek sweep (f01 centred, f06 caret in-clip, f07 unflagged source, f08+x-placeholder clean handoff, x-tasks-reveal slide, x-approve-peak ripple, f13/f16/ntl-rest open task + `notes.`, f17 == ntl-rest continuity). **A confirmatory four-lens re-score was rate-limited (session subagent limit) and is the one open verification step** — expect ~9 on editorial/product-truth and ~8.5–8.8 on storytelling/motion given the trajectory.

## Open items / operator judgment calls
- **Confirmatory final council re-score** — not yet run (rate limit). Re-spawn the 4 lenses against the current frames to lock the final numbers.
- **Outro stage-recede (deferred, operator call).** The motion lens wanted a focus hand-off to the wordmark on the outro. Skipped: a permanent recede breaks the rest==animation-end invariant, and a transient dip risks a re-brighten flicker. Judgment call whether the marginal focus gain is worth it.
- **Chip / tasks-header foul (minor).** The travelling extract briefly overlaps the "tasks · committed" header mid-flight. Routing it behind the header looks worse (chip clipped); nudging the arc risks the landing handoff. Left as-is.
- **Length ~11.2s.** Slightly long for a keynote loop; each beat currently earns its time. Trimmable ~0.6–0.8s from the type dwell + post-check tail if a tighter cut is wanted.

## Gate discipline (must stay clean)
`cd notes && npm run ds:check` (lab file is clean; the only failures are the pre-existing `main` debt in `waitlist/page.tsx` + `chrome/suite-header.tsx` — NOT ours, do not touch. Zero raw hex in the lab file; alias tokens into `--ntb-*`; numeric HTML entities trip the ratchet, use literal chars; non-contract eases carry a `ds-allow` comment), `npx tsc --noEmit`, `npm test`, and `node ~/.claude/skills/brand-voice/voice-check.mjs src/components/lab/option-the-notebook.tsx`. Only stage lab files (another autonomous process commits in these repos); commit promptly.

## The other four directions (kept for reference, /lab/2–5)
Notebook First, Before It Fades, Three Seconds, The Crossing — polished in earlier rounds (director scores 9.4–9.8). The Notebook (this hybrid) is the recommended flagship.
