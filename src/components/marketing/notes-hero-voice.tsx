"use client";

/**
 * Notes hero — "The Voice" (Approach C).
 *
 * Entry sequence: dot rolls in from off-screen left, letter-rise rAF loop
 * assembles "notes" as the dot passes each letter center, dot morphs into
 * a tall caret and blinks. Second act: voice zone fades in below hairline
 * rule, three product phrases type and delete in a loop. The wordmark caret
 * and the voice caret blink simultaneously — brand anchor above, live
 * composition below.
 *
 * Phrases (Approach C):
 *   "Write it here first."
 *   "Before it fades."
 *   "Not everything needs a task."
 *
 * SAFETY CONTRACT (§13):
 *   · All CSS fully scoped — every class and @keyframes prefixed `nhv-`.
 *   · In-flow only — no position:fixed, no inset:0, no high z-index.
 *   · All timers collected in `timers[]` and cleared on unmount.
 *   · rAF loop cancelled on unmount; self-cancels when all letters settled.
 *   · prefers-reduced-motion → skips to phrase 3, final caret state, static.
 */

import { useEffect, useRef } from "react";

export function NotesHeroVoice() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // ── Config ─────────────────────────────────────────────────────────
    const PHRASES = [
      "Write it here first.",
      "Before it fades.",
      "Not everything needs a task.",
    ] as const;
    const CAPTIONS = [
      "a held thought, awaiting input",
      "a held thought, awaiting input",
      "capture clarity.",
    ] as const;
    const STATUS_LABELS = ["READY", "1 / 3", "2 / 3", "3 / 3", "CAPTURE CLARITY"] as const;

    // timing (ms)
    const ENTRY_SETTLE_MS   = 5600;  // wait for roll-in + morph + settle
    const VOICE_FADE_IN_MS  = 420;   // voice zone opacity 0→1
    const PRE_TYPE_PAUSE_MS = 380;   // pause before first char of a phrase
    const CARET_BREATHE_MS  = 700;   // hold with blinking caret before phrase 1
    const INTER_PHRASE_PAUSE = 260;  // pause after delete before next phrase
    const HOLD_PHRASE_MS    = 2800;  // hold for phrases 1 & 2
    const HOLD_FINAL_MS     = 10000; // phrase 3 landing
    const CAPTION_FADE_MS   = 440;   // caption cross-fade
    const LOOP_GAP_MS       = 300;   // gap at loop end (caret hidden, so no orphan)

    // typing speed
    const TYPE_BASE_MS  = 40;
    const TYPE_VAR_MS   = 14;
    const TYPE_DOT_MS   = 90;   // pause after . for sentence-end feel
    const TYPE_COMMA_MS = 60;
    const TYPE_SPACE_MS = 28;
    const DELETE_BASE_MS = 22;
    const DELETE_VAR_MS  = 8;

    // letter rise
    const RISE_MS   = 280;
    const RISE_LEAD = 80;  // px ahead of mark center to trigger rise

    // ── Elements ───────────────────────────────────────────────────────
    const composerEl  = root.querySelector<HTMLElement>(".nhv-composer");
    const wordEl      = root.querySelector<HTMLElement>(".nhv-word");
    const markEl      = root.querySelector<HTMLElement>(".nhv-mark");
    const voiceZoneEl = root.querySelector<HTMLElement>(".nhv-voice-zone");
    const voiceTextEl = root.querySelector<HTMLElement>(".nhv-voice-text");
    const voiceCaretEl = root.querySelector<HTMLElement>(".nhv-voice-caret");
    const captionEl   = root.querySelector<HTMLElement>(".nhv-caption");
    const statusTREl  = root.querySelector<HTMLElement>(".nhv-status-tr");

    if (
      !composerEl || !wordEl || !markEl || !voiceZoneEl ||
      !voiceTextEl || !voiceCaretEl || !captionEl
    ) return;

    const letterEls = [...wordEl.querySelectorAll<HTMLElement>(".nhv-letter")];

    // ── Reduced motion: skip to final state ────────────────────────────
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      letterEls.forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      });
      voiceTextEl.textContent = PHRASES[2];
      voiceZoneEl.style.opacity = "1";
      voiceCaretEl.className = "nhv-voice-caret active";
      captionEl.textContent = CAPTIONS[2];
      captionEl.style.opacity = "1";
      captionEl.style.animation = "none";
      if (statusTREl) statusTREl.textContent = STATUS_LABELS[3];
      return;
    }

    // ── Cleanup state ──────────────────────────────────────────────────
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let rafId = 0;

    // ── Helpers ────────────────────────────────────────────────────────
    const wait = (ms: number): Promise<void> =>
      new Promise((resolve) => {
        if (cancelled) { resolve(); return; }
        const id = setTimeout(() => { if (!cancelled) resolve(); }, ms);
        timers.push(id);
      });

    const rand = (base: number, variance: number) =>
      base + (Math.random() * 2 - 1) * variance;

    // ── Letter rise rAF loop ────────────────────────────────────────────
    // Ported verbatim from NotesHeroLoader: watches mark's live x-position
    // and triggers each letter's rise (translateY 115%→0) as the dot passes
    // within RISE_LEAD px of the letter center.
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const start = performance.now();
    const risenAt: Array<number | null> = new Array(letterEls.length).fill(null);
    let centers: number[] = [];

    const measure = () => {
      const cl = composerEl.getBoundingClientRect().left;
      centers = letterEls.map((el) => {
        const r = el.getBoundingClientRect();
        return r.left + r.width / 2 - cl;
      });
    };

    const frame = () => {
      const elapsed = performance.now() - start;
      const cl = composerEl.getBoundingClientRect().left;
      const mr = markEl.getBoundingClientRect();
      const markX = mr.left + mr.width / 2 - cl;
      const markOpacity = parseFloat(getComputedStyle(markEl).opacity);

      let allDone = true;

      letterEls.forEach((el, i) => {
        const lx = centers[i];
        if (lx === undefined) { allDone = false; return; }

        const distance = lx - markX;
        if (risenAt[i] === null && markOpacity > 0.2 && distance < RISE_LEAD) {
          risenAt[i] = elapsed;
        }
        if (risenAt[i] === null) {
          el.style.opacity = "0";
          el.style.transform = "translateY(115%)";
          allDone = false;
          return;
        }

        const timeSinceRise = elapsed - risenAt[i]!;
        let p = Math.min(1, Math.max(0, timeSinceRise / RISE_MS));
        if (p < 1) allDone = false;
        p = easeOutCubic(p);
        el.style.opacity = p.toString();
        el.style.transform = `translateY(${(1 - p) * 115}%)`;
      });

      if (!allDone) {
        rafId = requestAnimationFrame(frame);
      } else {
        // All letters settled — entry complete
        if (statusTREl) statusTREl.textContent = STATUS_LABELS[0];
      }
    };

    rafId = requestAnimationFrame(() => {
      measure();
      rafId = requestAnimationFrame(frame);
    });
    window.addEventListener("resize", measure);

    // ── Voice loop helpers ──────────────────────────────────────────────
    // Status fires on first visible character — not before the pre-type
    // dead zone, so counter always corresponds to text on screen.
    const typePhrase = async (text: string, phraseIdx: number) => {
      voiceTextEl.textContent = "";
      voiceCaretEl.className = "nhv-voice-caret active";
      await wait(PRE_TYPE_PAUSE_MS);

      for (let i = 0; i < text.length; i++) {
        if (cancelled) return;
        const ch = text[i];

        if (i === 0 && statusTREl) {
          statusTREl.textContent = STATUS_LABELS[phraseIdx + 1];
        }

        voiceTextEl.textContent += ch;

        let delay: number;
        if (ch === ".") {
          delay = i < text.length - 1 ? TYPE_DOT_MS : 0;
        } else if (ch === ",") {
          delay = TYPE_COMMA_MS;
        } else if (ch === " ") {
          delay = rand(TYPE_SPACE_MS, 6);
        } else {
          delay = rand(TYPE_BASE_MS, TYPE_VAR_MS);
        }
        if (delay > 0) await wait(delay);
      }
    };

    const deletePhrase = async () => {
      let text = voiceTextEl.textContent ?? "";
      await wait(60);
      while (text.length > 0) {
        if (cancelled) return;
        text = text.slice(0, -1);
        voiceTextEl.textContent = text;
        await wait(rand(DELETE_BASE_MS, DELETE_VAR_MS));
      }
      // Hide caret when text clears — no orphaned blinking cursor during
      // inter-phrase / loop-gap pauses.
      voiceCaretEl.className = "nhv-voice-caret";
    };

    const setCaption = async (newText: string) => {
      if (captionEl.textContent === newText) return;
      captionEl.style.transition = `opacity ${CAPTION_FADE_MS / 2}ms ease`;
      captionEl.style.opacity = "0";
      await wait(CAPTION_FADE_MS / 2);
      if (cancelled) return;
      captionEl.textContent = newText;
      captionEl.style.opacity = "1";
      await wait(CAPTION_FADE_MS / 2);

      // "capture clarity." landing: brief color pulse stone→near-ink→stone.
      // ~750ms total; plays during the hold; barely perceptible, just enough
      // weight to mark the line's arrival.
      if (newText === CAPTIONS[2]) {
        await wait(80);
        if (cancelled) return;
        captionEl.style.transition = "color 160ms ease";
        captionEl.style.color = "#4a4a4a";
        await wait(200);
        if (cancelled) return;
        captionEl.style.transition = "color 560ms ease";
        captionEl.style.color = "";
        await wait(580);
        if (cancelled) return;
        captionEl.style.transition = "";
      }
    };

    // ── Voice loop ──────────────────────────────────────────────────────
    const voiceLoop = async () => {
      // Both carets blink simultaneously throughout: wordmark caret above
      // as brand anchor, voice caret below as live composition.
      voiceZoneEl.style.transition = `opacity ${VOICE_FADE_IN_MS}ms cubic-bezier(.22,.7,.2,1)`;
      voiceZoneEl.style.opacity = "1";
      await wait(VOICE_FADE_IN_MS);

      // Breathing room: caret blinks alone before first phrase types.
      voiceCaretEl.className = "nhv-voice-caret active";
      await wait(CARET_BREATHE_MS);

      while (!cancelled) {
        for (let i = 0; i < PHRASES.length; i++) {
          if (cancelled) return;
          const isLast = i === PHRASES.length - 1;

          // Status update fires inside typePhrase on first character.
          await typePhrase(PHRASES[i], i);
          if (cancelled) return;

          if (isLast) {
            await wait(500);
            await setCaption(CAPTIONS[i]); // → "capture clarity."
            if (statusTREl) statusTREl.textContent = STATUS_LABELS[4];
          }

          await wait(isLast ? HOLD_FINAL_MS : HOLD_PHRASE_MS);
          if (cancelled) return;

          if (isLast) {
            // Caption resets BEFORE phrase deletes — smoother loop transition.
            await setCaption(CAPTIONS[0]);
            await wait(400);
          }

          await deletePhrase();
          if (cancelled) return;

          if (!isLast) {
            await wait(INTER_PHRASE_PAUSE);
          }
        }
        await wait(LOOP_GAP_MS);
      }
    };

    // ── Boot ────────────────────────────────────────────────────────────
    const bootTimer = setTimeout(() => {
      void voiceLoop();
    }, ENTRY_SETTLE_MS);
    timers.push(bootTimer);

    // ── Cleanup ─────────────────────────────────────────────────────────
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <section
      className="nhv-section"
      aria-label="Signal Notes"
      ref={rootRef}
    >
      {/* Corner chrome — TL: wordmark context. TR: status counter */}
      <div className="nhv-chrome nhv-chrome-tl">
        <span className="nhv-wm">
          signal studio<span className="nhv-wm-dot" aria-hidden />
          <span className="nhv-sep" aria-hidden>·</span>notes
        </span>
      </div>
      <div className="nhv-chrome nhv-chrome-tr" aria-hidden>
        <span className="nhv-pip" />
        <span className="nhv-status-tr">waiting</span>
      </div>

      {/* Stage: animated wordmark */}
      <div className="nhv-stage" aria-hidden>
        <div className="nhv-composer">
          <span className="nhv-word">
            {"notes".split("").map((ch, i) => (
              <span key={i} className="nhv-letter">{ch}</span>
            ))}
          </span>
          {/* Ghost trails — right:0/bottom:.06em anchors to mark resting position */}
          <span className="nhv-trail nhv-t1" />
          <span className="nhv-trail nhv-t2" />
          <span className="nhv-trail nhv-t3" />
          {/* Impact ripples */}
          <span className="nhv-ripple-slow" />
          <span className="nhv-ripple" />
          {/* The mark: dot → caret */}
          <span className="nhv-mark" />
        </div>
      </div>

      {/* Voice zone: fades in below hairline rule, types the product phrases */}
      <div
        className="nhv-voice-zone"
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="nhv-voice-inner">
          <span className="nhv-voice-text" />{/* zero-width — no whitespace node */
          }<span className="nhv-voice-caret" />
        </span>
      </div>

      {/* Caption */}
      <p className="nhv-caption">a held thought, awaiting input</p>

      <style>{CSS}</style>
    </section>
  );
}

// ── Scoped styles ──────────────────────────────────────────────────────────
// Every class and @keyframes is prefixed `nhv-` (notes hero voice).
// Turbopack CSS-cache gotcha: embedded inline here, not globals.css only.
const CSS = `
.nhv-section {
  position: relative; overflow: hidden; background: #ffffff;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  min-height: min(90vh, 920px);
  padding: clamp(80px,12vh,160px) 24px clamp(64px,10vh,128px);

  --nhv-ink: #111111;
  --nhv-indigo: #4f46e5;
  --nhv-indigo-300: #a5b4fc;
  --nhv-stone: #8c887e;
  --nhv-hairline: rgba(17,17,17,0.06);
  --nhv-wm-size: clamp(56px, 12vw, 168px);
  --nhv-roll: calc(var(--nhv-wm-size) * 8);
  --nhv-voice-size: clamp(20px, 3.8vw, 52px);
  --nhv-font: var(--font-geist, 'Geist', system-ui, sans-serif);
  --nhv-font-surface: var(--font-inter, 'Inter', system-ui, sans-serif);
  --nhv-mono: var(--font-geist-mono, 'Geist Mono', ui-monospace, monospace);
}

/* ─── Corner chrome ──────────────────────────────────────────── */
.nhv-chrome {
  position: absolute;
  font-family: var(--nhv-mono);
  font-size: 11px; letter-spacing: .08em; text-transform: uppercase;
  color: var(--nhv-stone);
  display: inline-flex; align-items: center; gap: 10px;
}
.nhv-chrome-tl { top: 28px; left: 32px; }
.nhv-chrome-tr { top: 28px; right: 32px; }
.nhv-wm {
  display: inline-flex; align-items: baseline;
  font-family: var(--nhv-font); font-weight: 500;
  font-size: 14px; letter-spacing: -.025em; line-height: .95;
  color: var(--nhv-ink); text-transform: none;
}
.nhv-wm-dot {
  width: .16em; height: .16em; border-radius: 50%;
  background: var(--nhv-indigo); margin-left: .06em;
  align-self: flex-end; margin-bottom: .06em; flex: 0 0 auto;
  display: inline-block;
}
.nhv-sep { color: var(--nhv-stone); margin: 0 .4em; font-weight: 300; }
.nhv-pip {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--nhv-indigo); display: inline-block;
  animation: nhv-pip-blink 1.6s cubic-bezier(.45,.05,.55,.95) infinite;
}
@keyframes nhv-pip-blink { 0%,100%{opacity:1} 50%{opacity:.35} }

/* ─── Stage ──────────────────────────────────────────────────── */
.nhv-stage {
  display: flex; align-items: center; justify-content: center; width: 100%;
}
.nhv-composer {
  position: relative; display: inline-flex; align-items: baseline;
  font-family: var(--nhv-font); font-weight: 500;
  font-size: var(--nhv-wm-size); line-height: .95;
  letter-spacing: -.03em; color: var(--nhv-ink);
  padding-bottom: calc(var(--nhv-wm-size) * .25);
}
/* Hairline rule — full-bleed both sides via -100vw. */
.nhv-composer::before {
  content: ''; position: absolute;
  left: -100vw; right: -100vw;
  bottom: calc(var(--nhv-wm-size) * .15);
  height: 1px; background: var(--nhv-hairline);
}
.nhv-word { display: inline-flex; gap: 0; position: relative; z-index: 1; }
.nhv-letter {
  display: inline-block; opacity: 0; transform: translateY(115%);
  color: var(--nhv-ink); will-change: opacity, transform;
}

/* ─── The mark: dot → caret ──────────────────────────────────── */
.nhv-mark {
  position: relative;
  width: .16em; height: .16em; border-radius: 50%;
  background: var(--nhv-indigo);
  margin-left: .06em; align-self: flex-end; margin-bottom: .06em;
  transform-origin: center bottom; z-index: 3;
  animation:
    nhv-roll   5s    cubic-bezier(.34,1.56,.64,1) 0s   1        forwards,
    nhv-morph  .6s   cubic-bezier(.22,.7,.2,1)    3.9s 1        forwards,
    nhv-blink  1.06s linear                       4.5s infinite;
}
@keyframes nhv-roll {
  0%  { transform: translate(calc(-1 * var(--nhv-roll)), 0) scale(1,1); opacity: 0; }
  4%  { transform: translate(calc(-1 * var(--nhv-roll)), 0) scale(1,1); opacity: 1; }
  33% { transform: translate(calc(-.03 * var(--nhv-wm-size)), 0) scale(1,1); opacity: 1; }
  35% { transform: translate(0,0) scale(1,1); opacity: 1; }
  38% { transform: translate(0,0) scale(1.55,.55); opacity: 1; }
  41% { transform: translate(0,0) scale(1.96,.4); opacity: 1; }
  43% { transform: translate(0,0) scale(1.88,.43); opacity: 1; }
  48% { transform: translate(0, calc(-.075 * var(--nhv-wm-size))) scale(.74,1.34); opacity: 1; }
  53% { transform: translate(0,0) scale(1.24,.82); opacity: 1; }
  57% { transform: translate(0,0) scale(.96,1.05); opacity: 1; }
  60% { transform: translate(0,0) scale(1,1); opacity: 1; }
  68% { transform: translate(0,0) scale(.86,.86); opacity: .86; }
  77%,100% { transform: translate(0,0) scale(1,1); opacity: 1; }
}
@keyframes nhv-morph {
  0%   { width: .16em; height: .16em; border-radius: 50%; }
  100% { width: .075em; height: .78em; border-radius: .02em; }
}
@keyframes nhv-blink {
  0%,50%     { opacity: 1; }
  50.01%,100%{ opacity: 0; }
}

/* ─── Ghost trails ───────────────────────────────────────────── */
/* right:0/bottom:.06em co-locates with mark's natural resting position.
   position:absolute + align-self has no effect on abs children in flex. */
.nhv-trail {
  position: absolute; right: 0; bottom: .06em; margin: 0;
  width: .16em; height: .16em; border-radius: 50%;
  background: var(--nhv-indigo); opacity: 0; z-index: 2;
}
.nhv-t1 { animation: nhv-ghost1 5s cubic-bezier(.34,1.56,.64,1) 0s 1 forwards; }
.nhv-t2 { animation: nhv-ghost2 5s cubic-bezier(.34,1.56,.64,1) 0s 1 forwards; }
.nhv-t3 { animation: nhv-ghost3 5s cubic-bezier(.34,1.56,.64,1) 0s 1 forwards; }
@keyframes nhv-ghost1 {
  0%,5%  { transform: translate(calc(-1 * var(--nhv-roll)), 0); opacity: 0; }
  14%    { transform: translate(calc(-.85 * var(--nhv-roll)), 0); opacity: .5; }
  26%    { transform: translate(calc(-.2 * var(--nhv-roll)), 0); opacity: .26; }
  33%,100%{ transform: translate(calc(-.1 * var(--nhv-roll)), 0); opacity: 0; }
}
@keyframes nhv-ghost2 {
  0%,7%  { transform: translate(calc(-1 * var(--nhv-roll)), 0); opacity: 0; }
  16%    { transform: translate(calc(-.78 * var(--nhv-roll)), 0); opacity: .36; }
  26%    { transform: translate(calc(-.28 * var(--nhv-roll)), 0); opacity: .18; }
  33%,100%{ transform: translate(calc(-.16 * var(--nhv-roll)), 0); opacity: 0; }
}
@keyframes nhv-ghost3 {
  0%,9%  { transform: translate(calc(-1 * var(--nhv-roll)), 0); opacity: 0; }
  18%    { transform: translate(calc(-.7 * var(--nhv-roll)), 0); opacity: .24; }
  26%    { transform: translate(calc(-.35 * var(--nhv-roll)), 0); opacity: .11; }
  33%,100%{ transform: translate(calc(-.24 * var(--nhv-roll)), 0); opacity: 0; }
}

/* ─── Impact ripples ─────────────────────────────────────────── */
/* Same right:0/bottom:.06em anchor as trails. */
.nhv-ripple, .nhv-ripple-slow {
  position: absolute; right: 0; bottom: .06em; margin: 0;
  width: .16em; height: .16em; border-radius: 50%;
  background: transparent; opacity: 0; transform: scale(1); z-index: 1;
}
.nhv-ripple {
  border: 1px solid var(--nhv-indigo);
  animation: nhv-rip-fast 5s cubic-bezier(.22,.7,.2,1) 0s 1 forwards;
}
.nhv-ripple-slow {
  border: 1px solid var(--nhv-indigo-300);
  animation: nhv-rip-slow 5s cubic-bezier(.22,.7,.2,1) 0s 1 forwards;
}
@keyframes nhv-rip-fast {
  0%,39%{ transform: scale(1); opacity: 0; }
  41%   { transform: scale(1); opacity: .7; }
  60%   { transform: scale(11); opacity: 0; }
  100%  { transform: scale(11); opacity: 0; }
}
@keyframes nhv-rip-slow {
  0%,39%{ transform: scale(1); opacity: 0; }
  41%   { transform: scale(1); opacity: .45; }
  74%   { transform: scale(22); opacity: 0; }
  100%  { transform: scale(22); opacity: 0; }
}

/* ─── Voice zone ─────────────────────────────────────────────── */
.nhv-voice-zone {
  display: flex; align-items: center; justify-content: center; width: 100%;
  min-height: calc(var(--nhv-voice-size) * 1.6);
  margin-top: calc(var(--nhv-wm-size) * .56);
  opacity: 0;
}
.nhv-voice-inner {
  display: inline-flex; align-items: center;
  font-family: var(--nhv-font-surface); font-weight: 500;
  font-size: var(--nhv-voice-size);
  letter-spacing: -.028em; line-height: 1.1;
  color: var(--nhv-ink); white-space: nowrap;
}
/* Typing caret in voice zone */
.nhv-voice-caret {
  display: inline-block;
  width: 2px; height: .82em; border-radius: 1px;
  background: var(--nhv-indigo);
  margin-left: 2px; opacity: 0;
  vertical-align: middle; position: relative; top: -.03em;
}
.nhv-voice-caret.active {
  opacity: 1;
  animation: nhv-voice-blink 1.06s linear infinite;
}
@keyframes nhv-voice-blink {
  0%,49% { opacity: 1; }
  50%,100%{ opacity: 0; }
}

/* ─── Caption ────────────────────────────────────────────────── */
.nhv-caption {
  font-family: var(--nhv-mono);
  font-size: 11px; letter-spacing: .12em;
  text-transform: uppercase; color: var(--nhv-stone);
  opacity: 0; margin-top: 48px; text-align: center;
  animation: nhv-cap-in .8s cubic-bezier(.22,.7,.2,1) 4.1s 1 forwards;
}
@keyframes nhv-cap-in {
  0%   { opacity: 0; transform: translateY(4px); }
  100% { opacity: 1; transform: translateY(0); }
}

/* ─── Reduced motion ─────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .nhv-mark {
    animation: none;
    width: .075em; height: .78em; border-radius: .02em;
    opacity: 1; transform: none;
  }
  .nhv-trail, .nhv-ripple, .nhv-ripple-slow { display: none; }
  .nhv-caption { animation: none; opacity: 1; }
  .nhv-pip { animation: none; opacity: 1; }
  .nhv-letter { opacity: 1; transform: none; }
  .nhv-voice-zone { opacity: 1; }
  .nhv-voice-caret.active { animation: none; opacity: 1; }
}

/* ─── Responsive chrome ──────────────────────────────────────── */
@media (max-width: 600px) {
  .nhv-chrome-tl { top: 18px; left: 20px; }
  .nhv-chrome-tr { top: 18px; right: 20px; font-size: 10px; }
}
@media (max-width: 420px) { .nhv-chrome-tr { display: none; } }
`;
