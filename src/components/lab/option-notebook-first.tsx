/**
 * Option nt1 — Notebook First.
 *
 * The marketing surface IS the product surface (PRODUCT.md §9 "Notebook
 * First" contract). A focused capture field with a caret that WRITES, a
 * hairline, and a stream that fills newest-first. One note has crossed
 * into Signal Tasks: its indigo dot glides in from the Tasks side.
 *
 * SSR-safe: the settled composition is the default CSS (caret parked at
 * the line's end, dot present, headline set). The intro — the caret
 * riding the line as it appears, the stream cascading, the Tasks dot
 * arriving — runs once on mount, only under
 * `prefers-reduced-motion: no-preference`. No JS.
 */
export function OptionNotebookFirst() {
  const stream = [
    {
      title: "Florist confirms pink, not red",
      preview: "for the Saturday ceremony, final call",
      time: "just now",
      crossed: true,
    },
    {
      title: "Delivery slipped to Tuesday",
      preview: "supplier called while I was on the roof",
      time: "2m",
      crossed: false,
    },
    {
      title: "Client prefers matte over gloss",
      preview: "mentioned it twice, worth remembering",
      time: "11m",
      crossed: false,
    },
  ];

  return (
    <section className="nt1" aria-label="Notes hero — Notebook First">
      <style>{CSS}</style>

      <div className="nt1-frame">
        <p className="nt1-kicker">Signal Notes</p>

        <div className="nt1-notebook">
          {/* Capture field — the always-focused top of the notebook */}
          <div className="nt1-capture">
            <div className="nt1-capture-line">
              <span className="nt1-typed">Book the tasting for Tuesday</span>
              <span className="nt1-caret" aria-hidden />
            </div>
            <p className="nt1-hint">
              <kbd>⌘↵</kbd> save &nbsp;·&nbsp; <kbd>esc</kbd> discard
            </p>
          </div>

          {/* Stream — newest first */}
          <div className="nt1-streamhead">
            <span>Stream</span>
            <span className="nt1-streamhead-count">3 notes</span>
          </div>
          <ul className="nt1-stream">
            {stream.map((n, i) => (
              <li
                key={n.title}
                className="nt1-row"
                style={{ ["--i" as string]: i }}
              >
                <span className="nt1-row-main">
                  <span className="nt1-row-title">{n.title}</span>
                  <span className="nt1-row-preview">{n.preview}</span>
                </span>
                <span className="nt1-row-meta">
                  {n.crossed ? (
                    <span className="nt1-row-crossed">
                      <span className="nt1-row-dot" aria-hidden />
                      <span className="nt1-row-crossed-label">in Tasks</span>
                    </span>
                  ) : null}
                  <span className="nt1-row-time">{n.time}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <h1 className="nt1-say">
          Write it down before it becomes&nbsp;work.
        </h1>
      </div>
    </section>
  );
}

const CSS = `
.nt1 {
  --nt1-ink: var(--ink);
  --nt1-soft: var(--ink-soft);
  --nt1-faint: var(--ink-faint);
  --nt1-accent: var(--accent);
  --nt1-paper: var(--paper);
  --nt1-line: var(--hairline, rgba(17,17,17,0.10));
  --nt1-line-soft: var(--hairline-soft, rgba(17,17,17,0.06));
  --nt1-field: var(--paper-deep);
  --nt1-sans: var(--font-geist-sans), "Geist", system-ui, sans-serif;
  --nt1-mono: var(--font-geist-mono), "Geist Mono", ui-monospace, monospace;

  position: relative; overflow: hidden;
  min-height: clamp(560px, 84svh, 900px);
  display: flex; align-items: center; justify-content: center;
  padding: clamp(40px, 7svh, 96px) 24px;
  background: var(--nt1-paper);
  font-family: var(--nt1-sans);
  color: var(--nt1-ink);
}

/* faint dotted paper field behind the notebook */
.nt1::before {
  content: ""; position: absolute; inset: 0; pointer-events: none;
  background-image: radial-gradient(var(--nt1-line-soft) 1px, transparent 1px);
  background-size: 26px 26px;
  -webkit-mask-image: radial-gradient(ellipse 80% 70% at 50% 42%, black 30%, transparent 78%);
          mask-image: radial-gradient(ellipse 80% 70% at 50% 42%, black 30%, transparent 78%);
  opacity: 0.5;
}

.nt1-frame { position: relative; width: min(720px, 100%); }

.nt1-kicker {
  margin: 0 0 20px; text-align: center;
  font-family: var(--nt1-mono); font-size: 11px;
  letter-spacing: 0.18em; text-transform: uppercase; color: var(--nt1-faint);
}

.nt1-notebook {
  background: var(--nt1-paper);
  border: 1px solid var(--nt1-line);
  border-radius: 14px;
  box-shadow: 0 1px 0 var(--nt1-line-soft), 0 24px 64px -44px rgba(17,17,17,0.20);
  overflow: hidden;
}

/* ── Capture ── */
.nt1-capture { padding: clamp(24px, 4vw, 40px) clamp(22px, 4vw, 40px) 20px; }
.nt1-capture-line {
  position: relative; display: block;
  width: fit-content; max-width: 100%;
  min-height: 1.1em; white-space: nowrap;
  font-size: clamp(24px, 3.6vw, 40px); font-weight: 560;
  letter-spacing: -0.028em; line-height: 1.05; color: var(--nt1-ink);
}
.nt1-typed {
  display: inline-block;
  /* rest state: fully shown */
  clip-path: inset(0 0 0 0);
}
/* The caret that writes: parked at the line's end at rest; rides the
   line left→right during the intro. */
.nt1-caret {
  position: absolute; left: 100%; top: 50%;
  transform: translate(0, -50%);
  width: 2px; height: 0.82em; margin-left: 3px;
  border-radius: 1px; background: var(--nt1-accent);
}
.nt1-hint {
  margin: 18px 0 0; font-family: var(--nt1-mono);
  font-size: 11px; letter-spacing: 0.03em; color: var(--nt1-faint);
}
.nt1-hint kbd {
  font-family: var(--nt1-mono); font-size: 10.5px;
  padding: 1px 6px; border: 1px solid var(--nt1-line);
  border-radius: 4px; background: var(--nt1-field);
}

/* ── Stream ── */
.nt1-streamhead {
  display: flex; align-items: center; justify-content: space-between;
  padding: 15px clamp(22px, 4vw, 40px);
  border-top: 1px solid var(--nt1-line);
  border-bottom: 1px solid var(--nt1-line);
  font-size: 11px; font-weight: 600; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--nt1-faint);
}
.nt1-streamhead-count { letter-spacing: 0.04em; font-variant-numeric: tabular-nums; }
.nt1-stream { list-style: none; margin: 0; padding: 0; }
.nt1-row {
  display: grid; grid-template-columns: minmax(0, 1fr) auto;
  align-items: center; gap: 18px;
  padding: 16px clamp(22px, 4vw, 40px);
  border-bottom: 1px solid var(--nt1-line-soft);
}
.nt1-row:last-child { border-bottom: 0; }
.nt1-row-main { min-width: 0; }
.nt1-row-title {
  display: block; font-size: 15px; font-weight: 600; letter-spacing: -0.01em;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.nt1-row-preview {
  display: block; margin-top: 3px; font-size: 13.5px; color: var(--nt1-soft);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.nt1-row-meta {
  display: inline-flex; align-items: center; gap: 16px;
  color: var(--nt1-faint); font-size: 12px; white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.nt1-row-crossed {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: var(--nt1-mono); font-size: 10.5px;
  letter-spacing: 0.06em; text-transform: uppercase; color: var(--nt1-accent);
}
.nt1-row-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--nt1-accent); display: inline-block; flex: 0 0 auto;
}
.nt1-row-crossed-label { white-space: nowrap; }

.nt1-say {
  margin: 44px auto 0; max-width: 20ch; text-align: center;
  font-size: clamp(24px, 2.6vw, 34px); font-weight: 520;
  letter-spacing: -0.028em; line-height: 1.12; color: var(--nt1-ink);
  text-wrap: balance;
}

/* Row hover — the surface is the product, so it responds. Pointer only. */
@media (hover: hover) and (pointer: fine) {
  .nt1-row {
    transition: background 0.2s var(--ease-out, cubic-bezier(0.23,1,0.32,1)),
                transform 0.2s var(--ease-out, cubic-bezier(0.23,1,0.32,1));
  }
  .nt1-row:hover { background: var(--nt1-field); transform: translateX(2px); }
  .nt1-row:hover .nt1-row-time { color: var(--nt1-soft); }
}

/* ─────────────────────────────────────────────────────────────
   INTRO — plays once on mount, motion-safe only. Rest state above
   is the finished frame, so SSR / no-JS / reduced-motion are done.
   ───────────────────────────────────────────────────────────── */
@media (prefers-reduced-motion: no-preference) {
  .nt1-notebook {
    animation: nt1-rise 0.7s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) both;
  }
  .nt1-kicker { animation: nt1-fade 0.6s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) both; }
  .nt1-streamhead {
    opacity: 0;
    animation: nt1-fade 0.5s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 1.35s forwards;
  }
  .nt1-say {
    opacity: 0;
    animation: nt1-fade 0.6s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 2.1s forwards;
  }

  /* the line appears as a confident, even hand writes it (no typewriter) */
  .nt1-typed {
    clip-path: inset(0 100% 0 0);
    animation: nt1-type 0.62s linear 0.5s forwards;
  }
  /* the caret rides the line, plants with a 2px settle, then blinks */
  .nt1-caret {
    left: 0; opacity: 0;
    animation:
      nt1-caret-in 0.01s linear 0.5s forwards,
      nt1-ride 0.62s linear 0.5s forwards,
      nt1-settle 0.2s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 1.12s both,
      nt1-blink 1.05s steps(1, end) 1.4s infinite;
  }

  /* stream rows cascade after the line settles */
  .nt1-row {
    opacity: 0; transform: translateY(8px);
    animation: nt1-row-in 0.5s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) both;
    animation-delay: calc(1.45s + var(--i) * 0.11s);
  }
  /* the crossed dot glides in from the Tasks side and lands with a spring */
  .nt1-row-dot {
    transform: translateX(-9px) scale(0); opacity: 0;
    animation: nt1-dot-in 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) /* ds-allow — spring overshoot for the Tasks-dot arrival; no contract ease overshoots */ 2.0s forwards;
  }
  .nt1-row-crossed-label {
    opacity: 0;
    animation: nt1-fade 0.4s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 2.2s forwards;
  }

  @keyframes nt1-rise {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes nt1-fade { from { opacity: 0; } to { opacity: 1; } }
  @keyframes nt1-type { to { clip-path: inset(0 0 0 0); } }
  @keyframes nt1-caret-in { to { opacity: 1; } }
  @keyframes nt1-ride { to { left: 100%; } }
  @keyframes nt1-settle {
    0%   { transform: translate(0, -50%); }
    50%  { transform: translate(2px, -50%); }
    100% { transform: translate(0, -50%); }
  }
  @keyframes nt1-blink { 0%,50% { opacity: 1; } 50.01%,100% { opacity: 0; } }
  @keyframes nt1-row-in { to { opacity: 1; transform: translateY(0); } }
  @keyframes nt1-dot-in {
    60%  { opacity: 1; }
    to   { transform: translateX(0) scale(1); opacity: 1; }
  }
}

@media (max-width: 640px) {
  .nt1 { min-height: 78svh; padding: 40px 16px; }
  .nt1-capture-line { font-size: clamp(20px, 6vw, 30px); }
}
`;
