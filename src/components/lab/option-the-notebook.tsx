/**
 * Option ntb — The Notebook (hybrid of Notebook First × The Crossing).
 *
 * The whole Signal Notes story in one surface. The product IS the hero:
 * a focused capture field with a caret that writes, a stream of recent
 * notes, and — the differentiator made first-class — one note's approved
 * line crossing ONE WAY into Signal Tasks. The raw note stays private;
 * only the extract travels; the indigo dot is left behind.
 *
 * Fuses the two strongest directions: Notebook First's product-truth (the
 * live surface) and The Crossing's un-clonable mechanic (the one-way edge),
 * so the surface leads and the differentiator is a moment, not a static dot.
 *
 * SSR-safe: the settled composition — capture written, stream present with
 * one note "in Tasks", the task committed in the Tasks lane — is the default
 * CSS. The intro (caret writes; the extract lifts, arcs across the edge, and
 * commits as a task) runs once on mount, motion-safe only. No JS.
 */
export function OptionTheNotebook() {
  const stream = [
    {
      title: "Caterer needs the final headcount",
      preview: "they asked twice, due Friday",
      time: "3m",
      crossed: true,
    },
    {
      title: "Florist confirmed pink, not red",
      preview: "for the Saturday ceremony",
      time: "9m",
      crossed: false,
    },
    {
      title: "Client prefers matte over gloss",
      preview: "worth remembering for the invites",
      time: "16m",
      crossed: false,
    },
  ];

  return (
    <section className="ntb" aria-label="Notes hero — The Notebook">
      <style>{CSS}</style>

      <div className="ntb-frame">
        <header className="ntb-head">
          <p className="ntb-kicker">Signal Notes</p>
          <h1 className="ntb-headline">
            Write it down before it becomes&nbsp;work.
          </h1>
          <p className="ntb-lede">
            Catch the thought in three seconds. Find it later. Approve the one
            line that becomes a task, and it crosses into Signal Tasks. The note
            stays private.
          </p>
        </header>

        <div className="ntb-stage" aria-hidden>
          {/* LEFT — the notebook (capture + stream) */}
          <div className="ntb-notebook">
            <div className="ntb-capture">
              <div className="ntb-capture-line">
                <span className="ntb-typed">Book the tasting for Tuesday</span>
                <span className="ntb-caret" />
              </div>
              <p className="ntb-hint">
                <kbd>⌘↵</kbd> save &nbsp;·&nbsp; <kbd>esc</kbd> discard
              </p>
            </div>

            <div className="ntb-streamhead">
              <span>Stream</span>
              <span className="ntb-streamhead-count">3 notes</span>
            </div>
            <ul className="ntb-stream">
              {stream.map((n, i) => (
                <li
                  key={n.title}
                  className={n.crossed ? "ntb-row is-source" : "ntb-row"}
                  style={{ ["--i" as string]: i }}
                >
                  <span className="ntb-row-main">
                    <span className="ntb-row-title">{n.title}</span>
                    <span className="ntb-row-preview">{n.preview}</span>
                  </span>
                  <span className="ntb-row-meta">
                    {n.crossed ? (
                      <span className="ntb-row-crossed">
                        <span className="ntb-row-dot" />
                        <span className="ntb-row-crossed-label">in Tasks</span>
                      </span>
                    ) : (
                      <span className="ntb-row-time">{n.time}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* EDGE — the one-way boundary between private thought and committed work */}
          <div className="ntb-edge">
            <span className="ntb-edge-label">one way</span>
            <span className="ntb-edge-arrow">&rarr;</span>
          </div>

          {/* RIGHT — Signal Tasks (where approved work lands) */}
          <div className="ntb-tasks">
            <div className="ntb-tasks-head">
              <span className="ntb-tasks-tag">tasks</span>
              <span className="ntb-tasks-kind">committed</span>
            </div>
            <ul className="ntb-tasklist">
              <li className="ntb-task is-arrived">
                <span className="ntb-check">
                  <svg className="ntb-check-mark" viewBox="0 0 16 16">
                    <path d="M3.5 8.5 L6.8 11.6 L12.5 4.8" />
                  </svg>
                </span>
                <span className="ntb-task-body">
                  <span className="ntb-task-title">Send the caterer the headcount</span>
                  <span className="ntb-task-meta">from a note</span>
                </span>
              </li>
              <li className="ntb-task is-quiet">
                <span className="ntb-check ntb-check--open" />
                <span className="ntb-task-body">
                  <span className="ntb-task-title">Confirm the arch layout</span>
                  <span className="ntb-task-meta">due Thursday</span>
                </span>
              </li>
            </ul>
          </div>

          {/* The travelling extract — invisible at rest, crosses on mount */}
          <span className="ntb-chip">Send the caterer the headcount</span>
        </div>
      </div>
    </section>
  );
}

const CSS = `
.ntb {
  --ntb-ink: var(--ink);
  --ntb-soft: var(--ink-soft);
  --ntb-faint: var(--ink-faint);
  --ntb-accent: var(--accent);
  --ntb-glow: var(--accent-glow, rgba(79,70,229,0.32));
  --ntb-paper: var(--paper);
  --ntb-soft-bg: var(--paper-soft);
  --ntb-field: var(--paper-deep);
  --ntb-line: var(--hairline, rgba(17,17,17,0.10));
  --ntb-line-soft: var(--hairline-soft, rgba(17,17,17,0.06));
  --ntb-sans: var(--font-geist-sans), "Geist", system-ui, sans-serif;
  --ntb-mono: var(--font-geist-mono), "Geist Mono", ui-monospace, monospace;

  position: relative; overflow: hidden;
  min-height: clamp(640px, 92svh, 1000px);
  display: flex; align-items: center; justify-content: center;
  padding: clamp(44px, 7svh, 96px) 24px;
  background: var(--ntb-paper);
  font-family: var(--ntb-sans); color: var(--ntb-ink);
}

.ntb-frame { width: min(1080px, 100%); }

/* ── Head ── */
.ntb-head { max-width: 680px; margin: 0 auto clamp(36px, 5vh, 60px); text-align: center; }
.ntb-kicker {
  margin: 0 0 18px; font-family: var(--ntb-mono); font-size: 11px;
  letter-spacing: 0.18em; text-transform: uppercase; color: var(--ntb-faint);
}
.ntb-headline {
  margin: 0; font-size: clamp(2rem, 1.35rem + 2.9vw, 3.5rem);
  font-weight: 600; letter-spacing: -0.04em; line-height: 1.02;
  color: var(--ntb-ink); text-wrap: balance;
}
.ntb-lede {
  margin: 20px auto 0; max-width: 52ch;
  font-size: 16.5px; line-height: 1.6; color: var(--ntb-soft);
  text-wrap: pretty;
}

/* ── Stage: notebook | edge | tasks ── */
.ntb-stage {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) auto minmax(0, 0.95fr);
  align-items: stretch; gap: clamp(12px, 2.4vw, 32px);
}

/* ── Notebook ── */
.ntb-notebook {
  background: var(--ntb-paper);
  border: 1px solid var(--ntb-line);
  border-radius: 14px;
  box-shadow: 0 1px 0 var(--ntb-line-soft), 0 26px 70px -46px rgba(17,17,17,0.22);
  overflow: hidden;
  display: flex; flex-direction: column;
}
.ntb-capture { padding: clamp(20px, 2.6vw, 32px) clamp(20px, 2.6vw, 32px) 18px; }
.ntb-capture-line {
  position: relative; display: block;
  width: fit-content; max-width: 100%;
  min-height: 1.1em; white-space: nowrap;
  font-size: clamp(20px, 2.2vw, 30px); font-weight: 560;
  letter-spacing: -0.025em; line-height: 1.05; color: var(--ntb-ink);
}
.ntb-typed { display: inline-block; clip-path: inset(0 0 0 0); }
.ntb-caret {
  position: absolute; left: 100%; top: 50%;
  transform: translate(0, -50%);
  width: 2px; height: 0.82em; margin-left: 3px;
  border-radius: 1px; background: var(--ntb-accent);
}
.ntb-hint {
  margin: 14px 0 0; font-family: var(--ntb-mono);
  font-size: 10.5px; letter-spacing: 0.03em; color: var(--ntb-faint);
}
.ntb-hint kbd {
  font-family: var(--ntb-mono); font-size: 10px;
  padding: 1px 5px; border: 1px solid var(--ntb-line);
  border-radius: 4px; background: var(--ntb-field);
}
.ntb-streamhead {
  display: flex; align-items: center; justify-content: space-between;
  padding: 13px clamp(20px, 2.6vw, 32px);
  border-top: 1px solid var(--ntb-line);
  border-bottom: 1px solid var(--ntb-line);
  font-size: 10.5px; font-weight: 600; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--ntb-faint);
}
.ntb-streamhead-count { letter-spacing: 0.04em; font-variant-numeric: tabular-nums; }
.ntb-stream { list-style: none; margin: 0; padding: 0; flex: 1 1 auto; }
.ntb-row {
  position: relative;
  display: grid; grid-template-columns: minmax(0, 1fr) auto;
  align-items: center; gap: 14px;
  padding: 14px clamp(20px, 2.6vw, 32px);
  border-bottom: 1px solid var(--ntb-line-soft);
}
.ntb-row:last-child { border-bottom: 0; }
.ntb-row-main { min-width: 0; }
.ntb-row-title {
  display: block; font-size: 14.5px; font-weight: 600; letter-spacing: -0.01em;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.ntb-row-preview {
  display: block; margin-top: 2px; font-size: 13px; color: var(--ntb-soft);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.ntb-row-meta {
  display: inline-flex; align-items: center; gap: 14px;
  color: var(--ntb-faint); font-size: 11.5px; white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.ntb-row-crossed {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: var(--ntb-mono); font-size: 10px;
  letter-spacing: 0.06em; text-transform: uppercase; color: var(--ntb-accent);
}
.ntb-row-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--ntb-accent); display: inline-block; flex: 0 0 auto;
}

/* ── Edge ── */
.ntb-edge {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 8px; color: var(--ntb-faint);
}
.ntb-edge-label {
  font-family: var(--ntb-mono); font-size: 9.5px; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--ntb-faint);
}
.ntb-edge-arrow { font-size: 18px; color: var(--ntb-accent); line-height: 1; }

/* ── Tasks ── */
.ntb-tasks {
  align-self: center;
  background: var(--ntb-soft-bg);
  border: 1px solid var(--ntb-line);
  border-radius: 14px;
  padding: 6px 0 8px;
  box-shadow: 0 20px 56px -46px rgba(17,17,17,0.22);
}
.ntb-tasks-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px clamp(16px, 1.6vw, 22px) 12px;
  border-bottom: 1px solid var(--ntb-line-soft);
}
.ntb-tasks-tag {
  font-weight: 500; font-size: 13.5px; letter-spacing: -0.03em; color: var(--ntb-soft);
}
.ntb-tasks-kind {
  font-family: var(--ntb-mono); font-size: 9.5px; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--ntb-faint);
}
.ntb-tasklist { list-style: none; margin: 0; padding: 0; }
.ntb-task {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 13px clamp(16px, 1.6vw, 22px);
  border-bottom: 1px solid var(--ntb-line-soft);
}
.ntb-task:last-child { border-bottom: 0; }
.ntb-task.is-quiet { opacity: 0.55; }
.ntb-check {
  flex: 0 0 auto; width: 16px; height: 16px; margin-top: 1px;
  border: 1.5px solid var(--ntb-accent); border-radius: 5px;
  background: color-mix(in srgb, var(--ntb-accent) 8%, transparent);
  display: inline-flex; align-items: center; justify-content: center;
}
.ntb-check--open {
  border-color: var(--ntb-line); background: transparent;
}
.ntb-check-mark {
  width: 11px; height: 11px; fill: none;
  stroke: var(--ntb-accent); stroke-width: 2;
  stroke-linecap: round; stroke-linejoin: round;
  stroke-dasharray: 15; stroke-dashoffset: 0; /* rest: drawn */
}
.ntb-task-body { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.ntb-task-title {
  font-size: 13.5px; font-weight: 560; letter-spacing: -0.01em; line-height: 1.3;
  color: var(--ntb-ink);
}
.ntb-task-meta {
  font-family: var(--ntb-mono); font-size: 10px; letter-spacing: 0.04em;
  color: var(--ntb-faint);
}

/* ── Travelling extract chip — invisible at rest ── */
.ntb-chip {
  position: absolute; top: 50%; left: 30%;
  transform: translate(-50%, -50%);
  padding: 7px 12px; border-radius: 8px;
  background: var(--ntb-paper);
  border: 1px solid var(--ntb-accent);
  box-shadow: 0 14px 34px -18px var(--ntb-accent);
  font-size: 12px; font-weight: 500; color: var(--ntb-ink);
  white-space: nowrap; opacity: 0; pointer-events: none;
}

/* ─────────────────────────────────────────────────────────────
   INTRO — motion-safe only. Header settles; the caret writes; the
   stream cascades; then one note's extract lifts, arcs across the
   one-way edge, and commits as a task (its check draws) while the
   source note keeps the indigo dot.
   ───────────────────────────────────────────────────────────── */
@media (prefers-reduced-motion: no-preference) {
  .ntb-kicker   { animation: ntb-up 0.6s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) both; }
  .ntb-headline { opacity: 0; animation: ntb-up 0.7s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 0.1s forwards; }
  .ntb-lede     { opacity: 0; animation: ntb-up 0.7s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 0.26s forwards; }
  .ntb-notebook { opacity: 0; animation: ntb-in 0.7s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 0.5s forwards; }
  .ntb-edge     { opacity: 0; animation: ntb-fade 0.6s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 1.6s forwards; }
  .ntb-tasks    { opacity: 0; animation: ntb-in 0.7s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 0.62s forwards; }

  /* the caret writes the capture line */
  .ntb-typed {
    clip-path: inset(0 100% 0 0);
    animation: ntb-type 0.62s linear 0.7s forwards;
  }
  .ntb-caret {
    left: 0; opacity: 0;
    animation:
      ntb-caret-in 0.01s linear 0.7s forwards,
      ntb-ride 0.62s linear 0.7s forwards,
      ntb-settle 0.2s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 1.32s both,
      ntb-blink 1.05s steps(1, end) 1.6s infinite;
  }

  /* stream rows cascade */
  .ntb-row {
    opacity: 0; transform: translateY(8px);
    animation: ntb-row-in 0.5s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) both;
    animation-delay: calc(1.5s + var(--i) * 0.1s);
  }

  /* the source row's extract highlights as its copy lifts off, then stays */
  .ntb-row.is-source {
    animation:
      ntb-row-in 0.5s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 1.5s both,
      ntb-source-pulse 0.6s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 2.15s both;
  }
  /* its "in Tasks" dot arrives as the chip lands */
  .ntb-row-dot {
    transform: scale(0);
    animation: ntb-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) /* ds-allow — spring overshoot for the crossed-dot arrival */ 3.05s forwards;
  }
  .ntb-row-crossed-label {
    opacity: 0;
    animation: ntb-fade 0.4s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 3.15s forwards;
  }

  /* the edge arrow nudges as the chip passes */
  .ntb-edge-arrow {
    animation: ntb-arrow-pass 0.9s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 2.4s both;
  }

  /* the chip lifts off the source row, arcs across the edge, and lands */
  .ntb-chip {
    animation: ntb-cross 1.35s var(--ease-in-out, cubic-bezier(0.77,0,0.175,1)) 2.15s forwards;
  }

  /* the task commits as the chip lands (~3.1s): it rises in and its check draws */
  .ntb-task.is-arrived {
    opacity: 0; transform: translateY(6px);
    animation: ntb-in 0.55s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 3.0s forwards;
  }
  .ntb-check-mark {
    stroke-dashoffset: 15;
    animation: ntb-check-draw 0.4s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 3.2s forwards;
  }

  @keyframes ntb-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes ntb-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes ntb-fade { to { opacity: 1; } }
  @keyframes ntb-type { to { clip-path: inset(0 0 0 0); } }
  @keyframes ntb-caret-in { to { opacity: 1; } }
  @keyframes ntb-ride { to { left: 100%; } }
  @keyframes ntb-settle {
    0% { transform: translate(0, -50%); }
    50% { transform: translate(2px, -50%); }
    100% { transform: translate(0, -50%); }
  }
  @keyframes ntb-blink { 0%,50% { opacity: 1; } 50.01%,100% { opacity: 0; } }
  @keyframes ntb-row-in { to { opacity: 1; transform: translateY(0); } }
  @keyframes ntb-source-pulse {
    0% { background: transparent; }
    45% { background: color-mix(in srgb, var(--ntb-accent) 7%, transparent); }
    100% { background: transparent; }
  }
  @keyframes ntb-pop { to { transform: scale(1); } }
  @keyframes ntb-check-draw { to { stroke-dashoffset: 0; } }
  @keyframes ntb-arrow-pass {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(4px); }
  }
  @keyframes ntb-cross {
    0%   { opacity: 0; left: 30%; transform: translate(-50%, -50%) translateY(0) scale(0.96);
           box-shadow: 0 6px 14px -10px var(--ntb-accent); }
    16%  { opacity: 1; transform: translate(-50%, -50%) translateY(-16px) scale(1); }
    50%  { transform: translate(-50%, -50%) translateY(-16px) scale(1);
           box-shadow: 0 26px 50px -18px var(--ntb-glow); }
    84%  { opacity: 1; transform: translate(-50%, -50%) translateY(-12px) scale(1); }
    100% { opacity: 0; left: 84%; transform: translate(-50%, -50%) translateY(0) scale(0.98);
           box-shadow: 0 6px 14px -10px var(--ntb-accent); }
  }
}

/* ── Responsive: stack notebook over tasks, edge turns downward ── */
@media (max-width: 860px) {
  .ntb-stage { grid-template-columns: 1fr; gap: 12px; }
  .ntb-edge { flex-direction: row; gap: 10px; }
  .ntb-edge-arrow { transform: rotate(90deg); }
  .ntb-tasks { align-self: stretch; }
  .ntb-chip { display: none; }
}
@media (max-width: 640px) {
  .ntb { min-height: 88svh; padding: 40px 16px; }
}
`;
