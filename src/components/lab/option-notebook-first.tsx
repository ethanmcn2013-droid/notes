/**
 * Option nt1 — Notebook First.
 *
 * The marketing surface IS the product surface (PRODUCT.md §9 "Notebook
 * First" contract). A focused capture field with the private caret, a
 * hairline, and a stream that fills newest-first. One note has crossed
 * into Signal Tasks and wears the indigo dot.
 *
 * SSR-safe: the settled composition is the default CSS. The intro (the
 * captured line wiping in like typing, the stream rows rising, the
 * Tasks dot arriving) runs once on mount, only under
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
      title: "Two parents need a call back",
      preview: "before the end of the week",
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
              <span className="nt1-typed">Call the caterer about the final count</span>
              <span className="nt1-caret" aria-hidden />
            </div>
            <p className="nt1-hint">
              <kbd>⌘↵</kbd> saves &nbsp;·&nbsp; <kbd>esc</kbd> discards
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
                    <span className="nt1-row-dot" aria-label="crossed into Tasks" />
                  ) : null}
                  <span className="nt1-row-time">{n.time}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="nt1-say">Write it down before it becomes work.</p>
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
  letter-spacing: 0.16em; text-transform: uppercase; color: var(--nt1-faint);
}

.nt1-notebook {
  background: var(--nt1-paper);
  border: 1px solid var(--nt1-line);
  border-radius: 14px;
  box-shadow: 0 1px 0 var(--nt1-line-soft), 0 30px 80px -40px rgba(17,17,17,0.28);
  overflow: hidden;
}

/* ── Capture ── */
.nt1-capture { padding: clamp(24px, 4vw, 40px) clamp(22px, 4vw, 40px) 20px; }
.nt1-capture-line {
  display: flex; align-items: baseline; min-height: 1.1em;
  font-size: clamp(24px, 3.6vw, 40px); font-weight: 560;
  letter-spacing: -0.02em; line-height: 1.08; color: var(--nt1-ink);
}
.nt1-typed {
  display: inline-block;
  /* rest state: fully shown */
  clip-path: inset(0 0 0 0);
}
.nt1-caret {
  flex: 0 0 auto; width: 2px; height: 0.86em; margin-left: 3px;
  align-self: center; border-radius: 1px; background: var(--nt1-accent);
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
.nt1-streamhead-count { letter-spacing: 0.04em; }
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
  display: inline-flex; align-items: center; gap: 10px;
  color: var(--nt1-faint); font-size: 12px; white-space: nowrap;
}
.nt1-row-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--nt1-accent); display: inline-block; flex: 0 0 auto;
}

.nt1-say {
  margin: 26px auto 0; max-width: 34ch; text-align: center;
  font-size: clamp(16px, 1.6vw, 19px); letter-spacing: -0.01em;
  color: var(--nt1-soft);
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
  .nt1-say {
    opacity: 0;
    animation: nt1-fade 0.6s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 1.9s forwards;
  }

  /* captured line wipes in like typing */
  .nt1-typed {
    clip-path: inset(0 100% 0 0);
    animation: nt1-type 0.95s steps(38, end) 0.5s forwards;
  }
  .nt1-caret {
    opacity: 0;
    animation:
      nt1-caret-in 0.01s linear 0.5s forwards,
      nt1-blink 1.05s steps(1, end) 1.5s infinite;
  }

  /* stream rows rise, staggered after the line settles */
  .nt1-row {
    opacity: 0; transform: translateY(8px);
    animation: nt1-row-in 0.5s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) both;
    animation-delay: calc(1.5s + var(--i) * 0.14s);
  }
  /* the crossed dot lands last */
  .nt1-row-dot {
    transform: scale(0);
    animation: nt1-dot-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) /* ds-allow — spring overshoot for the Tasks-dot arrival; no contract ease overshoots */ 2.35s forwards;
  }

  @keyframes nt1-rise {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes nt1-fade { from { opacity: 0; } to { opacity: 1; } }
  @keyframes nt1-type { to { clip-path: inset(0 0 0 0); } }
  @keyframes nt1-caret-in { to { opacity: 1; } }
  @keyframes nt1-blink { 0%,50% { opacity: 1; } 50.01%,100% { opacity: 0; } }
  @keyframes nt1-row-in {
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes nt1-dot-in {
    to { transform: scale(1); }
  }
}

@media (max-width: 640px) {
  .nt1 { min-height: 78svh; padding: 40px 16px; }
  .nt1-capture-line { font-size: clamp(21px, 6.4vw, 30px); }
}
`;
