/**
 * Option nt2 — Before It Fades.
 *
 * The feeling under the product (PRODUCT.md §3): the gap between
 * remembered and lost. A column of half-formed thoughts settles, and the
 * faintest one at the top actually slips away — while the bottom line
 * sits solid in ink with a held indigo caret: the one you wrote down.
 *
 * SSR-safe: the settled composition (all three ghosts legible + solid
 * caught line + caret) is the default CSS. The settle, the one that
 * escapes, and the caret draw run once on mount, motion-safe only. The
 * escape is a motion-only narrative: reduced-motion keeps all three
 * ghosts so the story stays legible without movement. No JS.
 */
export function OptionBeforeItFades() {
  // top (most faded, nearly lost) → bottom (caught)
  const fading = [
    "the supplier’s name from the call",
    "what she said about the deadline",
    "the fix that came to me on the drive",
  ];

  return (
    <section className="nt2" aria-label="Notes hero — Before It Fades">
      <style>{CSS}</style>

      <div className="nt2-frame">
        <p className="nt2-kicker">Signal Notes</p>

        <div className="nt2-stack" aria-hidden>
          {fading.map((line, i) => (
            <p
              key={line}
              className="nt2-ghost"
              style={{ ["--i" as string]: i, ["--n" as string]: fading.length }}
            >
              {line}
            </p>
          ))}
          <p className="nt2-caught">
            <span className="nt2-caught-text">the florist confirmed pink, not red</span>
            <span className="nt2-caught-caret" />
          </p>
        </div>

        <h1 className="nt2-headline">
          Catch it before it’s gone<span className="nt2-dot" aria-hidden />
        </h1>
        <p className="nt2-lede">
          A thought has a shelf life. Open the notebook, write it down in three
          seconds, and find it again when you need it.
        </p>
      </div>
    </section>
  );
}

const CSS = `
.nt2 {
  --nt2-ink: var(--ink);
  --nt2-soft: var(--ink-soft);
  --nt2-faint: var(--ink-faint);
  --nt2-accent: var(--accent);
  --nt2-paper: var(--paper);
  --nt2-line: var(--hairline, rgba(17,17,17,0.10));
  --nt2-sans: var(--font-geist-sans), "Geist", system-ui, sans-serif;
  --nt2-mono: var(--font-geist-mono), "Geist Mono", ui-monospace, monospace;

  position: relative; overflow: hidden;
  min-height: clamp(560px, 86svh, 900px);
  display: flex; align-items: center; justify-content: center;
  padding: clamp(48px, 9svh, 112px) 24px;
  background: var(--nt2-paper);
  font-family: var(--nt2-sans); color: var(--nt2-ink);
}

.nt2-frame { width: min(680px, 100%); text-align: center; }

.nt2-kicker {
  margin: 0 0 clamp(28px, 5vh, 52px);
  font-family: var(--nt2-mono); font-size: 11px;
  letter-spacing: 0.18em; text-transform: uppercase; color: var(--nt2-faint);
}

/* ── The fading stack ── */
.nt2-stack {
  display: flex; flex-direction: column; align-items: center;
  gap: clamp(10px, 1.8vh, 18px);
  margin-bottom: clamp(32px, 5vh, 56px);
}
.nt2-ghost {
  margin: 0; font-weight: 500; letter-spacing: -0.02em;
  /* smaller + fainter toward the top (i=0 = most lost) */
  font-size: calc(0.9rem + var(--i) * 0.16rem);
  color: var(--nt2-ink);
  opacity: calc(0.18 + var(--i) * 0.13);
}
/* the top thought is already half-gone at rest — a blurred trace, so the
   loss reads without motion (reduced-motion never sees the escape play). */
.nt2-ghost:first-child { opacity: 0.1; filter: blur(0.4px); }
.nt2-caught {
  position: relative; margin: 8px 0 0;
  display: inline-flex; align-items: baseline; justify-content: center;
  font-size: clamp(20px, 2.6vw, 30px); font-weight: 560;
  letter-spacing: -0.025em; line-height: 1.1; color: var(--nt2-ink);
}
.nt2-caught-text { display: inline-block; }
.nt2-caught-caret {
  flex: 0 0 auto; width: 0.055em; height: 0.82em; margin-left: 0.09em;
  align-self: center; border-radius: 0.02em; background: var(--nt2-accent);
}

.nt2-headline {
  margin: 0; font-size: clamp(2rem, 1.4rem + 2.8vw, 3.6rem);
  font-weight: 600; letter-spacing: -0.04em; line-height: 1.02;
  color: var(--nt2-ink); text-wrap: balance;
}
.nt2-dot {
  display: inline-block; width: 0.13em; height: 0.13em; min-width: 8px; min-height: 8px;
  max-width: 12px; max-height: 12px; margin-left: 0.06em;
  border-radius: 50%; background: var(--nt2-accent); vertical-align: baseline;
  transform: translateY(-0.02em);
}
.nt2-lede {
  margin: 20px auto 0; max-width: 46ch;
  font-size: 17px; line-height: 1.6; color: var(--nt2-soft);
  text-wrap: pretty;
}

/* ─────────────────────────────────────────────────────────────
   INTRO — motion-safe only. Ghosts settle top→down so the eye falls
   toward the caught line; the caught line lands solid and its caret
   draws; then the faintest thought at the top slips away for good.
   ───────────────────────────────────────────────────────────── */
@media (prefers-reduced-motion: no-preference) {
  .nt2-kicker { animation: nt2-fade 0.7s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) both; }
  .nt2-ghost {
    animation: nt2-drift 1.2s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) both;
    animation-delay: calc(var(--i) * 0.12s);
  }
  /* the one that escapes — top, faintest thought drifts up and dissolves */
  .nt2-ghost:first-child {
    animation:
      nt2-drift 1.2s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 0s both,
      nt2-lose 0.9s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 1.6s forwards;
  }
  .nt2-caught {
    opacity: 0;
    animation: nt2-catch 0.7s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 0.7s forwards;
  }
  .nt2-caught-caret {
    transform: scaleY(0); transform-origin: center bottom; opacity: 0;
    animation:
      nt2-draw 0.5s cubic-bezier(0.22,1.02,0.3,1) /* ds-allow — caret-draw overshoot; matches the shipped nhv caret gesture */ 1.2s forwards,
      nt2-blink 1.05s steps(1, end) 1.85s infinite;
  }
  .nt2-headline {
    opacity: 0;
    animation: nt2-up 0.7s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 1.5s forwards;
  }
  /* the period-dot echoes the caught caret, one beat after the headline */
  .nt2-dot {
    animation: nt2-dot-echo 0.5s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 2.2s both;
  }
  .nt2-lede {
    opacity: 0;
    animation: nt2-up 0.7s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 1.72s forwards;
  }

  @keyframes nt2-fade { from { opacity: 0; } to { opacity: 1; } }
  @keyframes nt2-drift {
    from { opacity: 0; transform: translateY(14px); }
    /* settle to the rest opacity encoded on the element (calc above) */
    to   { transform: translateY(0); }
  }
  @keyframes nt2-lose {
    from { opacity: 0.1; transform: translateY(0);    filter: blur(0.4px); }
    to   { opacity: 0;   transform: translateY(-16px); filter: blur(1px); }
  }
  @keyframes nt2-catch {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes nt2-draw {
    0%   { transform: scaleY(0);    opacity: 0; }
    55%  { transform: scaleY(1.12); opacity: 1; }
    100% { transform: scaleY(1);    opacity: 1; }
  }
  @keyframes nt2-blink { 0%,50% { opacity: 1; } 50.01%,100% { opacity: 0; } }
  @keyframes nt2-up {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes nt2-dot-echo {
    0%   { transform: translateY(-0.02em) scale(1); }
    45%  { transform: translateY(-0.02em) scale(1.35); }
    100% { transform: translateY(-0.02em) scale(1); }
  }
}

@media (max-width: 640px) {
  .nt2 { min-height: 80svh; padding: 44px 18px; }
  .nt2-ghost { font-size: calc(0.82rem + var(--i) * 0.12rem); }
}
`;
