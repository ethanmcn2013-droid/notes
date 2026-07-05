/**
 * Option ntb — The Notebook (hybrid of Notebook First × The Crossing).
 *
 * The whole Signal Notes story in one surface, all three beats:
 *   1. write it down — a caret writes a thought (three-second capture),
 *   2. it joins the stream — the thought drops in as the newest note (3 → 4),
 *   3. decide what becomes work — an older note's approved line lifts off,
 *      crosses ONE WAY into Signal Tasks, and commits, while the note keeps
 *      the indigo dot and its body stays private.
 *
 * Fuses Notebook First's product-truth (the live surface) with The
 * Crossing's un-clonable mechanic (the one-way edge).
 *
 * SSR-safe: the settled composition — capture ready, the thought at the top
 * of a 4-note stream, one note "in Tasks", the task committed — is the
 * default CSS. The three-beat intro runs once on mount, motion-safe only.
 * No JS.
 */
export function OptionTheNotebook() {
  const stream = [
    {
      title: "Tuesday works best for the tasting",
      preview: "just captured",
      time: "just now",
      role: "fresh",
    },
    {
      title: "Caterer needs the final headcount",
      preview: "they asked twice, due Friday",
      time: "6m",
      role: "source",
    },
    {
      title: "Florist confirmed pink, not red",
      preview: "for the Saturday ceremony",
      time: "14m",
      role: "",
    },
    {
      title: "Client prefers matte over gloss",
      preview: "matte for the invites",
      time: "22m",
      role: "",
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
            Catch the thought in three seconds. Find it later. Approve one line
            and it crosses into Signal Tasks. The rest stays private.
          </p>
        </header>

        <div className="ntb-stage" aria-hidden>
          {/* LEFT — the notebook (capture + stream) */}
          <div className="ntb-notebook">
            <div className="ntb-capture">
              <div className="ntb-capture-line">
                <span className="ntb-caret ntb-caret-ready" />
                <span className="ntb-placeholder">Catch the next one.</span>
                <span className="ntb-typed-wrap">
                  <span className="ntb-typed">Tuesday works best for the tasting</span>
                  <span className="ntb-caret ntb-caret-type" />
                </span>
              </div>
              <p className="ntb-hint">
                <kbd>⌘↵</kbd> save &nbsp;·&nbsp; <kbd>esc</kbd> discard
              </p>
            </div>

            <div className="ntb-streamhead">
              <span className="ntb-streamhead-label">stream</span>
              <span className="ntb-streamhead-count">
                <span className="ntb-count ntb-count-3">3 notes</span>
                <span className="ntb-count ntb-count-4">4 notes</span>
              </span>
            </div>
            <ul className="ntb-stream">
              {stream.map((n, i) => (
                <li
                  key={n.title}
                  className={
                    "ntb-row" +
                    (n.role === "fresh" ? " is-fresh" : "") +
                    (n.role === "source" ? " is-source" : "")
                  }
                  style={{ ["--i" as string]: i }}
                >
                  <span className="ntb-row-main">
                    <span className="ntb-row-title">{n.title}</span>
                    <span className="ntb-row-preview">{n.preview}</span>
                  </span>
                  <span className="ntb-row-meta">
                    {n.role === "source" ? (
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

          {/* The travelling extract — invisible at rest, arcs across on mount */}
          <div className="ntb-cross-layer">
            <span className="ntb-chip">Send the caterer the headcount</span>
          </div>
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
  margin: 20px auto 0; max-width: 50ch;
  font-size: 16.5px; line-height: 1.6; color: var(--ntb-soft);
  text-wrap: pretty;
}

/* ── Stage: notebook | edge | tasks ── */
.ntb-stage {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) auto minmax(0, 1fr);
  align-items: stretch; gap: clamp(10px, 1.9vw, 26px);
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
  min-height: 1.15em; white-space: nowrap;
  font-size: clamp(19px, 2.05vw, 28px); font-weight: 560;
  letter-spacing: -0.025em; line-height: 1.05; color: var(--ntb-ink);
}
/* ready state: caret at the start, quiet prompt after it */
.ntb-caret {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 2px; height: 0.82em; border-radius: 1px; background: var(--ntb-accent);
}
.ntb-caret-ready { left: 0; }
.ntb-placeholder {
  display: inline-block; margin-left: 14px;
  color: color-mix(in srgb, var(--ntb-faint) 72%, var(--ntb-paper));
  font-weight: 520;
}
/* typing state (motion only): hidden at rest */
.ntb-typed-wrap {
  position: absolute; left: 0; top: 0; height: 100%;
  display: inline-flex; align-items: center; width: fit-content;
  opacity: 0;
}
.ntb-typed { display: inline-block; clip-path: inset(0 0 0 0); }
/* rides the reveal edge during typing (left 0→100% of the fit-content wrap) */
.ntb-caret-type { left: 100%; margin-left: 3px; opacity: 0; }
.ntb-hint {
  margin: 14px 0 0; font-family: var(--ntb-mono);
  font-size: 10.5px; letter-spacing: 0.03em; color: var(--ntb-faint);
}
.ntb-hint kbd {
  font-family: var(--ntb-mono); font-size: 10px;
  padding: 1px 5px; border: 1px solid var(--ntb-line);
  border-radius: 4px; background: var(--ntb-field);
}
/* Both panel headers share one grammar: lowercase-sans label · mono-uppercase kind */
.ntb-streamhead {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px clamp(20px, 2.6vw, 32px);
  border-top: 1px solid var(--ntb-line);
  border-bottom: 1px solid var(--ntb-line);
}
.ntb-streamhead-label {
  font-size: 13.5px; font-weight: 500; letter-spacing: -0.03em; color: var(--ntb-soft);
}
.ntb-streamhead-count {
  position: relative; display: inline-grid;
  font-family: var(--ntb-mono); font-size: 9.5px; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--ntb-faint); font-variant-numeric: tabular-nums;
}
.ntb-count { grid-area: 1 / 1; white-space: nowrap; }
.ntb-count-3 { opacity: 0; }   /* rest: the note has already joined → shows 4 */
.ntb-count-4 { opacity: 1; }
.ntb-stream { list-style: none; margin: 0; padding: 0; flex: 1 1 auto; }
.ntb-row {
  position: relative;
  display: grid; grid-template-columns: minmax(0, 1fr) auto;
  align-items: center; gap: 14px;
  padding: 14px clamp(20px, 2.6vw, 32px);
  border-bottom: 1px solid var(--ntb-line-soft);
}
.ntb-row:last-child { border-bottom: 0; }
/* the tether: the crossed note and its landed task carry the same faint
   indigo edge on both sides of the spine, so the pairing reads at rest */
.ntb-row.is-source::before,
.ntb-task.is-arrived::before {
  content: ""; position: absolute; left: 0; top: 0; bottom: 0;
  width: 2px; background: color-mix(in srgb, var(--ntb-accent) 40%, transparent);
}
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

/* ── Edge — the one-way spine ── */
.ntb-edge {
  position: relative;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 8px; color: var(--ntb-faint);
}
.ntb-edge::before {
  content: ""; position: absolute; top: 8%; bottom: 8%; left: 50%;
  width: 1px; background: var(--ntb-line); transform: translateX(-50%);
}
/* the indigo gate, invisible at rest — pulses as the extract pierces it */
.ntb-edge::after {
  content: ""; position: absolute; top: 8%; bottom: 8%; left: 50%;
  width: 1px; background: var(--ntb-accent); transform: translateX(-50%); opacity: 0;
}
.ntb-edge-label {
  position: relative;
  font-family: var(--ntb-mono); font-size: 9.5px; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--ntb-faint);
  background: var(--ntb-paper); padding: 3px 0;
}
.ntb-edge-arrow {
  position: relative; font-size: 18px; color: var(--ntb-accent); line-height: 1;
  background: var(--ntb-paper); padding: 2px 0;
}

/* ── Tasks ── */
/* Positioned so the arrived task sits level with its source note across the
   spine — the crossing reads as one horizontal line even at rest. */
.ntb-tasks {
  align-self: start;
  margin-top: clamp(150px, 12vw, 178px);
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
  position: relative;
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
  font-size: 14.5px; font-weight: 560; letter-spacing: -0.01em; line-height: 1.3;
  color: var(--ntb-ink);
}
.ntb-task-meta {
  font-family: var(--ntb-mono); font-size: 10px; letter-spacing: 0.04em;
  color: var(--ntb-faint);
}

/* ── Travelling extract chip — invisible at rest, transform-only ballistic arc ── */
.ntb-cross-layer {
  position: absolute; inset: 0; pointer-events: none;
  container-type: inline-size;
}
.ntb-chip {
  position: absolute; top: 50%; left: 0;
  transform: translate3d(27cqw, calc(-50% + 41px), 0) scale(0.9);
  padding: 7px 12px; border-radius: 8px;
  background: var(--ntb-paper);
  border: 1px solid var(--ntb-accent);
  box-shadow: 0 14px 34px -18px var(--ntb-glow);
  font-size: 12px; font-weight: 500; color: var(--ntb-ink);
  white-space: nowrap; opacity: 0;
}

/* ─────────────────────────────────────────────────────────────
   INTRO — motion-safe only. Three beats: the caret writes a thought;
   it joins the stream (3 → 4); an older note's approved line lifts off,
   arcs across the one-way edge, and commits as a task.
   Rest CSS above is the finished frame, so SSR / reduced-motion is done.
   ───────────────────────────────────────────────────────────── */
@media (prefers-reduced-motion: no-preference) {
  .ntb-kicker   { animation: ntb-up 0.6s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) both; }
  .ntb-headline { opacity: 0; animation: ntb-up 0.7s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 0.1s forwards; }
  .ntb-lede     { opacity: 0; animation: ntb-up 0.7s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 0.26s forwards; }
  .ntb-notebook { opacity: 0; animation: ntb-in 0.7s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 0.5s forwards; }
  .ntb-tasks    { opacity: 0; animation: ntb-in 0.7s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 0.52s forwards; }
  .ntb-edge     { opacity: 0; animation: ntb-fade 0.6s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 1.0s forwards; }

  /* BEAT 1 — the caret writes the thought */
  .ntb-caret-ready {
    opacity: 0;
    animation:
      ntb-fade 0.3s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 1.65s forwards,
      ntb-blink 1.05s steps(1, end) 1.95s infinite;
  }
  .ntb-placeholder {
    animation:
      ntb-out 0.2s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 0.6s forwards,
      ntb-fade 0.3s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 1.6s forwards;
  }
  .ntb-typed-wrap {
    animation:
      ntb-fade 0.2s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 0.72s forwards,
      ntb-out 0.22s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 1.5s forwards;
  }
  .ntb-typed {
    clip-path: inset(0 100% 0 0);
    animation: ntb-type 0.6s linear 0.75s forwards;
  }
  .ntb-caret-type {
    left: 0;
    animation:
      ntb-fade 0.01s linear 0.75s forwards,
      ntb-ride 0.6s linear 0.75s forwards,
      ntb-blink 1.05s steps(1, end) 1.35s 2;
  }

  /* BEAT 2 — the thought joins the stream (the fresh row drops in; 3 → 4) */
  .ntb-row.is-fresh {
    opacity: 0; transform: translateY(-6px);
    animation: ntb-fresh-in 0.55s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 1.5s forwards;
  }
  .ntb-count-3 { opacity: 1; animation: ntb-out 0.3s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 1.62s forwards; }
  .ntb-count-4 { opacity: 0; animation: ntb-fade 0.3s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 1.62s forwards; }
  /* the existing notes are already there, settling in as the notebook fills */
  .ntb-row:not(.is-fresh) {
    opacity: 0; transform: translateY(8px);
    animation: ntb-row-in 0.5s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) both;
    animation-delay: calc(1.0s + var(--i) * 0.07s);
  }

  /* BEAT 3 — an older note's line lifts off, crosses, and commits */
  .ntb-row.is-source {
    animation:
      ntb-row-in 0.5s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 1.07s both,
      ntb-source-pulse 0.6s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 2.1s both;
  }
  /* the dot is left behind as the line departs */
  .ntb-row-dot {
    transform: scale(0);
    animation: ntb-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) /* ds-allow — spring overshoot for the crossed-dot arrival */ 2.3s forwards;
  }
  /* the "in Tasks" label confirms on arrival */
  .ntb-row-crossed-label {
    opacity: 0;
    animation: ntb-fade 0.4s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 3.1s forwards;
  }
  .ntb-edge::after {
    animation: ntb-gate 0.5s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 2.55s both;
  }
  .ntb-edge-arrow {
    animation: ntb-arrow-pass 0.9s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 2.4s both;
  }
  /* the extract lifts off the source row, arcs across, and lands — a physical
     toss: near-constant horizontal velocity, parabolic rise, caught at the task */
  .ntb-chip {
    will-change: transform, opacity;
    animation: ntb-cross 1.05s linear 2.2s forwards;
  }
  /* the task commits as the extract lands (~3.1s): it rises and its check draws */
  .ntb-task.is-arrived {
    opacity: 0; transform: translateY(6px);
    animation: ntb-in 0.55s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 3.0s forwards;
  }
  .ntb-check-mark {
    stroke-dashoffset: 15;
    animation: ntb-check-draw 0.4s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 3.15s forwards;
  }

  @keyframes ntb-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes ntb-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes ntb-fade { to { opacity: 1; } }
  @keyframes ntb-out { to { opacity: 0; } }
  @keyframes ntb-type { to { clip-path: inset(0 0 0 0); } }
  @keyframes ntb-ride { to { left: 100%; } }
  @keyframes ntb-blink { 0%,50% { opacity: 1; } 50.01%,100% { opacity: 0; } }
  @keyframes ntb-fresh-in {
    0%   { opacity: 0; transform: translateY(-6px); background: color-mix(in srgb, var(--ntb-accent) 8%, transparent); }
    100% { opacity: 1; transform: translateY(0); background: transparent; }
  }
  @keyframes ntb-row-in { to { opacity: 1; transform: translateY(0); } }
  @keyframes ntb-source-pulse {
    0%   { background: transparent; box-shadow: inset 2px 0 0 transparent; }
    35%  { background: color-mix(in srgb, var(--ntb-accent) 8%, transparent);
           box-shadow: inset 2px 0 0 var(--ntb-accent); }
    100% { background: transparent; box-shadow: inset 2px 0 0 transparent; }
  }
  @keyframes ntb-pop { to { transform: scale(1); } }
  @keyframes ntb-check-draw { to { stroke-dashoffset: 0; } }
  @keyframes ntb-gate { 0%,100% { opacity: 0; } 50% { opacity: 0.55; } }
  @keyframes ntb-arrow-pass {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(4px); }
  }
  @keyframes ntb-cross {
    0%   { opacity: 0; transform: translate3d(27cqw, calc(-50% + 41px), 0) scale(0.9); }
    12%  { opacity: 1; transform: translate3d(31cqw, calc(-50% + 12px), 0) scale(1); }
    50%  { transform: translate3d(56cqw, calc(-50% - 8px), 0) scale(1.02); }
    88%  { opacity: 1; transform: translate3d(76cqw, calc(-50% + 22px), 0) scale(1); }
    100% { opacity: 0; transform: translate3d(82cqw, calc(-50% + 33px), 0) scale(0.97); }
  }
}

/* ── Responsive: stack notebook over tasks, edge turns downward ── */
@media (max-width: 860px) {
  .ntb-stage { grid-template-columns: 1fr; gap: 12px; }
  .ntb-edge { flex-direction: row; gap: 10px; }
  .ntb-edge::before, .ntb-edge::after { display: none; }
  .ntb-edge-arrow { transform: rotate(90deg); }
  .ntb-tasks { align-self: stretch; }
  .ntb-cross-layer { display: none; }
}
@media (max-width: 640px) {
  .ntb { min-height: 88svh; padding: 40px 16px; }
}
`;
