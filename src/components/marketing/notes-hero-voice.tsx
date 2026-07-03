"use client";

/**
 * Notes hero — "The Voice" (Approach C, intro reworked 2026-07-03, review 20).
 *
 * Entry sequence: the word "notes" rises into place letter by letter, and the
 * caret DRAWS ITSELF at the end — a thin indigo cursor stroking up from the
 * baseline, the way a cursor arrives where you're about to write. No dot slides
 * in, no squash-pulse. Once drawn, the caret blinks. Second act: voice zone
 * fades in below the hairline rule, three product phrases type and delete in a
 * loop. The wordmark caret and the voice caret blink together — brand anchor
 * above, live composition below.
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
 *   · Intro is pure CSS (letter rise + caret draw) — no rAF loop to leak.
 *   · prefers-reduced-motion → skips to phrase 3, final caret state, static.
 */

import { useEffect, useRef } from "react";

// Letter-rise stagger (must match the CSS animation durations below).
const RISE_START_MS = 180;
const RISE_STEP_MS = 90;
const LETTER_COUNT = 5; // "notes"

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
    // Word settles by ~RISE_START + (LETTER_COUNT-1)*RISE_STEP + rise dur (~420),
    // caret draws just after; give the whole intro a calm beat before the voice.
    const ENTRY_SETTLE_MS   = 2200;
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

    // ── Elements ───────────────────────────────────────────────────────
    const wordEl      = root.querySelector<HTMLElement>(".nhv-word");
    const voiceZoneEl = root.querySelector<HTMLElement>(".nhv-voice-zone");
    const voiceTextEl = root.querySelector<HTMLElement>(".nhv-voice-text");
    const voiceCaretEl = root.querySelector<HTMLElement>(".nhv-voice-caret");
    const captionEl   = root.querySelector<HTMLElement>(".nhv-caption");
    const statusTREl  = root.querySelector<HTMLElement>(".nhv-status-tr");

    if (!wordEl || !voiceZoneEl || !voiceTextEl || !voiceCaretEl || !captionEl) return;

    const letterEls = [...wordEl.querySelectorAll<HTMLElement>(".nhv-letter")];

    // ── Reduced motion: skip to final state ────────────────────────────
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      letterEls.forEach((el) => {
        el.style.animation = "none";
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

    // ── Helpers ────────────────────────────────────────────────────────
    const wait = (ms: number): Promise<void> =>
      new Promise((resolve) => {
        if (cancelled) { resolve(); return; }
        const id = setTimeout(() => { if (!cancelled) resolve(); }, ms);
        timers.push(id);
      });

    const rand = (base: number, variance: number) =>
      base + (Math.random() * 2 - 1) * variance;

    // The word rises and the caret draws entirely in CSS. Once the last letter
    // is up, flip the status counter to READY.
    const introDoneMs = RISE_START_MS + (LETTER_COUNT - 1) * RISE_STEP_MS + 480;
    const readyTimer = setTimeout(() => {
      if (!cancelled && statusTREl) statusTREl.textContent = STATUS_LABELS[0];
    }, introDoneMs);
    timers.push(readyTimer);

    // ── Voice loop helpers ──────────────────────────────────────────────
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
      voiceZoneEl.style.transition = `opacity ${VOICE_FADE_IN_MS}ms cubic-bezier(.22,.7,.2,1)`;
      voiceZoneEl.style.opacity = "1";
      await wait(VOICE_FADE_IN_MS);

      voiceCaretEl.className = "nhv-voice-caret active";
      await wait(CARET_BREATHE_MS);

      while (!cancelled) {
        for (let i = 0; i < PHRASES.length; i++) {
          if (cancelled) return;
          const isLast = i === PHRASES.length - 1;

          await typePhrase(PHRASES[i], i);
          if (cancelled) return;

          if (isLast) {
            await wait(500);
            await setCaption(CAPTIONS[i]);
            if (statusTREl) statusTREl.textContent = STATUS_LABELS[4];
          }

          await wait(isLast ? HOLD_FINAL_MS : HOLD_PHRASE_MS);
          if (cancelled) return;

          if (isLast) {
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
    };
  }, []);

  return (
    <section
      className="nhv-section"
      aria-label="Signal Notes"
      ref={rootRef}
    >
      {/* Corner chrome — TR status counter only. The TL wordmark was removed:
          the site header already carries the signal studio · notes breadcrumb. */}
      <div className="nhv-chrome nhv-chrome-tr" aria-hidden>
        <span className="nhv-pip" />
        <span className="nhv-status-tr">waiting</span>
      </div>

      {/* Stage: the word rises in place, the caret draws itself, then blinks —
          no slide-in, no pulse (review 20). */}
      <div className="nhv-stage" aria-hidden>
        <div className="nhv-composer">
          <span className="nhv-word">
            {"notes".split("").map((ch, i) => (
              <span
                key={i}
                className="nhv-letter"
                style={{ animationDelay: `${RISE_START_MS + i * RISE_STEP_MS}ms` }}
              >
                {ch}
              </span>
            ))}
          </span>
          {/* The mark: a caret that draws itself in place, then blinks */}
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
  min-height: clamp(520px, 64svh, 720px);
  padding: clamp(72px,10svh,112px) 24px clamp(44px,7svh,72px);
  border-bottom: 1px solid var(--nhv-hairline);

  --nhv-ink: #111111;
  --nhv-indigo: #4f46e5;
  --nhv-indigo-300: #a5b4fc;
  --nhv-stone: #8c887e;
  --nhv-hairline: rgba(17,17,17,0.06);
  --nhv-wm-size: clamp(56px, 10.5vw, 142px);
  --nhv-voice-size: clamp(20px, 3.1vw, 42px);
  --nhv-font: var(--font-geist, 'Geist', system-ui, sans-serif);
  --nhv-font-surface: var(--font-sans, system-ui, sans-serif);
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
.nhv-chrome-tr { top: 28px; right: 32px; }
.nhv-pip {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--nhv-indigo); display: inline-block;
  animation: nhv-pip-blink 1.6s cubic-bezier(.45,.05,.55,.95) infinite;
}
@keyframes nhv-pip-blink { 0%,100%{opacity:1} 50%{opacity:.35} }

/* ─── Stage ──────────────────────────────────────────────────── */
.nhv-stage {
  display: flex; align-items: center; justify-content: center; width: 100%;
  transform: translateY(-10px);
}
.nhv-composer {
  position: relative; display: inline-flex; align-items: baseline;
  font-family: var(--nhv-font); font-weight: 500;
  font-size: var(--nhv-wm-size); line-height: .95;
  letter-spacing: -.03em; color: var(--nhv-ink);
  padding-bottom: calc(var(--nhv-wm-size) * .25);
}
/* Hairline rule — full-bleed both sides via -100vw. Fades in with the word. */
.nhv-composer::before {
  content: ''; position: absolute;
  left: -100vw; right: -100vw;
  bottom: calc(var(--nhv-wm-size) * .15);
  height: 1px; background: var(--nhv-hairline);
  opacity: 0;
  animation: nhv-rule-in .8s cubic-bezier(.22,.7,.2,1) .1s forwards;
}
@keyframes nhv-rule-in { to { opacity: 1; } }
.nhv-word { display: inline-flex; gap: 0; position: relative; z-index: 1; }
.nhv-letter {
  display: inline-block; opacity: 0; transform: translateY(115%);
  color: var(--nhv-ink); will-change: opacity, transform;
  /* animation-delay is set inline per letter for the stagger */
  animation: nhv-rise .46s cubic-bezier(.22,.9,.28,1) both;
}
@keyframes nhv-rise {
  0%   { opacity: 0; transform: translateY(115%); }
  60%  { opacity: 1; }
  100% { opacity: 1; transform: translateY(0); }
}

/* ─── The mark: a caret that draws itself, then blinks ───────── */
/* Born as a caret (never a dot). It strokes up from the baseline — the way a
   cursor arrives where you're about to write — settles, then blinks. */
.nhv-mark {
  position: relative;
  width: .075em; height: .78em; border-radius: .02em;
  background: var(--nhv-indigo);
  margin-left: .08em; align-self: flex-end; margin-bottom: .06em;
  transform-origin: center bottom; transform: scaleY(0); opacity: 0;
  z-index: 3;
  animation:
    nhv-draw  .5s   cubic-bezier(.22,1.02,.3,1) .82s 1        forwards,
    nhv-blink 1.06s linear                      1.5s infinite;
}
@keyframes nhv-draw {
  0%   { transform: scaleY(0);    opacity: 0; }
  55%  { transform: scaleY(1.12); opacity: 1; }
  78%  { transform: scaleY(.94);  opacity: 1; }
  100% { transform: scaleY(1);    opacity: 1; }
}
@keyframes nhv-blink {
  0%,50%     { opacity: 1; }
  50.01%,100%{ opacity: 0; }
}

/* ─── Voice zone ─────────────────────────────────────────────── */
.nhv-voice-zone {
  display: flex; align-items: center; justify-content: center; width: 100%;
  min-height: calc(var(--nhv-voice-size) * 1.6);
  margin-top: calc(var(--nhv-wm-size) * .42);
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
  opacity: 0; margin-top: 36px; text-align: center;
  animation: nhv-cap-in .8s cubic-bezier(.22,.7,.2,1) 1.7s 1 forwards;
}
@keyframes nhv-cap-in {
  0%   { opacity: 0; transform: translateY(4px); }
  100% { opacity: 1; transform: translateY(0); }
}

/* ─── Reduced motion ─────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .nhv-mark {
    animation: none;
    transform: scaleY(1); opacity: 1;
  }
  .nhv-composer::before { animation: none; opacity: 1; }
  .nhv-caption { animation: none; opacity: 1; }
  .nhv-pip { animation: none; opacity: 1; }
  .nhv-letter { animation: none; opacity: 1; transform: none; }
  .nhv-voice-zone { opacity: 1; }
  .nhv-voice-caret.active { animation: none; opacity: 1; }
}

/* ─── Responsive chrome ──────────────────────────────────────── */
@media (max-width: 600px) {
  .nhv-chrome-tr { top: 18px; right: 20px; font-size: 10px; }
}
@media (max-width: 760px) {
  .nhv-section {
    min-height: 58svh;
    padding: 58px 20px 44px;
    --nhv-wm-size: clamp(52px, 15vw, 78px);
    --nhv-voice-size: clamp(20px, 6vw, 28px);
  }
  .nhv-stage { transform: translateY(-4px); }
  .nhv-voice-zone { margin-top: 34px; }
  .nhv-caption { margin-top: 30px; }
}
@media (max-width: 420px) { .nhv-chrome-tr { display: none; } }
`;
