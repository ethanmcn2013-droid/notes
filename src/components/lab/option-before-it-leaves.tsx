/**
 * Notes hero lab direction: Before It Leaves.
 *
 * The notebook is the fixed anchor from the first frame. One thought arrives,
 * the Notes caret catches it, and the note joins the private stream in under a
 * second. A visible approval follows; only the approved extract crosses into
 * Signal Tasks. The film settles by roughly 3.2 seconds.
 *
 * The settled artifact is the default CSS and the semantic DOM. The intro is a
 * decorative enhancement inside prefers-reduced-motion: no-preference, so SSR,
 * no-JS, reduced motion, and assistive technology all receive the complete
 * product story without waiting for animation.
 */

const STREAM = [
  {
    title: "Venue can open the side room after six",
    detail: "caught just now",
    source: true,
  },
  {
    title: "Maeve's case study angle: the refund week",
    detail: "8:41",
    source: false,
  },
  {
    title: "Move the rehearsal dinner if the shuttle can't do 6pm",
    detail: "yesterday",
    source: false,
  },
];

export function OptionBeforeItLeaves() {
  return (
    <section className="bil" aria-labelledby="bil-title">
      <style>{CSS}</style>

      <div className="bil-frame">
        <header className="bil-head">
          <p className="bil-kicker">Signal Notes</p>
          <h1 className="bil-title" id="bil-title">
            Catch it before it leaves
            <span className="bil-title-caret" aria-hidden />
          </h1>
          <p className="bil-lede">
            A private place for the thought you have now, and the work you
            choose later.
          </p>
        </header>

        <div className="bil-stage">
          <article className="bil-notebook" aria-labelledby="bil-stream-title">
            <div className="bil-capture">
              <div className="bil-capture-labels">
                <span>Capture</span>
                <span>Private</span>
              </div>
              <div className="bil-capture-line">
                <span className="bil-capture-caret" aria-hidden />
                <span className="bil-placeholder">Catch the next one.</span>
                <span className="bil-incoming" aria-hidden>
                  Venue can open the side room after six
                </span>
              </div>
              <p className="bil-capture-hint">
                <kbd>⌘↵</kbd> save <span aria-hidden>·</span> <kbd>esc</kbd> discard
              </p>
            </div>

            <div className="bil-stream-head">
              <h2 id="bil-stream-title">Private stream</h2>
              <span>3 notes</span>
            </div>

            <ol className="bil-stream">
              {STREAM.map((note) => (
                <li
                  className={note.source ? "bil-item bil-item-source" : "bil-item"}
                  key={note.title}
                >
                  <div className="bil-item-inner">
                    <span className="bil-item-copy">
                      <span className="bil-item-title">{note.title}</span>
                      <span className="bil-item-detail">{note.detail}</span>
                    </span>
                    {note.source ? (
                      <span className="bil-item-state">
                        <span className="bil-state-dot" aria-hidden />
                        In Tasks
                      </span>
                    ) : null}
                  </div>
                  {note.source ? (
                    <span className="bil-approval" aria-hidden>
                      <span className="bil-approval-ring" />
                      <span className="bil-approval-full">Send to Tasks</span>
                      <span className="bil-approval-short">Approve</span>
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
          </article>

          <div className="bil-bridge" aria-hidden>
            <span className="bil-bridge-label">Approved</span>
            <span className="bil-bridge-rule" />
            <span className="bil-bridge-arrow">→</span>
            <span className="bil-flight">extract</span>
          </div>

          <article className="bil-tasks" aria-labelledby="bil-tasks-title">
            <div className="bil-tasks-head">
              <h2 id="bil-tasks-title">Signal Tasks</h2>
              <span>Committed</span>
            </div>
            <div className="bil-task-row">
              <span className="bil-task-box" aria-hidden />
              <span className="bil-task-copy">
                <span className="bil-task-title">
                  Ask the venue to hold the side room after six
                </span>
                <span className="bil-task-detail">from a note · open</span>
              </span>
            </div>
          </article>
        </div>

        <footer className="bil-foot">
          <p>
            The note stays private. Only the line you approve becomes work.
          </p>
          <a className="bil-cta" href="/app">
            Start a notebook
          </a>
        </footer>
      </div>
    </section>
  );
}

const CSS = `
.bil {
  --bil-ink: var(--ink);
  --bil-soft: var(--ink-soft);
  --bil-faint: var(--ink-faint);
  --bil-ghost: var(--ink-ghost);
  --bil-accent: var(--accent);
  --bil-accent-soft: var(--accent-soft);
  --bil-paper: var(--paper);
  --bil-paper-soft: var(--paper-soft);
  --bil-paper-deep: var(--paper-deep);
  --bil-line: var(--hairline);
  --bil-line-soft: var(--hairline-soft);
  --bil-sans: var(--font-geist-sans), "Geist", system-ui, sans-serif;
  --bil-mono: var(--font-geist-mono), "Geist Mono", ui-monospace, monospace;
  --bil-cross-x0: -108px;
  --bil-cross-y0: -50%;
  --bil-cross-x1: 34px;
  --bil-cross-y1: -50%;

  position: relative;
  overflow: hidden;
  min-height: clamp(680px, 92svh, 940px);
  display: flex;
  align-items: center;
  padding: clamp(48px, 7svh, 88px) clamp(20px, 5vw, 72px);
  background: var(--bil-paper);
  color: var(--bil-ink);
  font-family: var(--bil-sans);
}
.bil * { box-sizing: border-box; }
.bil-frame { width: min(1080px, 100%); margin-inline: auto; }

.bil-head { max-width: 720px; }
.bil-kicker {
  margin: 0 0 18px;
  font-family: var(--bil-mono);
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--bil-faint);
}
.bil-title {
  margin: 0;
  max-width: 15ch;
  font-size: clamp(2.35rem, 1.55rem + 3.6vw, 4.8rem);
  font-weight: 630;
  letter-spacing: -0.05em;
  line-height: 0.98;
  text-wrap: balance;
}
.bil-title-caret {
  display: inline-block;
  width: 0.045em;
  height: 0.76em;
  margin-left: 0.08em;
  border-radius: 1px;
  background: var(--bil-accent);
  vertical-align: -0.02em;
}
.bil-lede {
  margin: 22px 0 0;
  max-width: 52ch;
  color: var(--bil-soft);
  font-size: 16.5px;
  line-height: 1.6;
  text-wrap: pretty;
}

.bil-stage {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) 72px minmax(230px, 0.8fr);
  align-items: center;
  gap: 0;
  margin-top: clamp(34px, 5vh, 54px);
}
.bil-notebook,
.bil-tasks {
  position: relative;
  border: 1px solid var(--bil-line);
  border-radius: 14px;
  background: var(--bil-paper);
  overflow: hidden;
}
.bil-notebook {
  box-shadow: 0 1px 0 var(--bil-line-soft), var(--shadow-float);
}
.bil-capture { padding: clamp(19px, 2.4vw, 28px); }
.bil-capture-labels,
.bil-stream-head,
.bil-tasks-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.bil-capture-labels {
  margin-bottom: 15px;
  font-family: var(--bil-mono);
  font-size: 9.5px;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: var(--bil-faint);
}
.bil-capture-line {
  position: relative;
  display: flex;
  align-items: flex-start;
  min-height: 1.45em;
  padding-left: 13px;
  font-size: clamp(16px, 1.7vw, 21px);
  font-weight: 610;
  letter-spacing: -0.025em;
  line-height: 1.28;
}
.bil-capture-caret {
  position: absolute;
  left: 0;
  top: 0.12em;
  width: 2px;
  height: 0.92em;
  border-radius: 1px;
  background: var(--bil-accent);
}
.bil-placeholder { color: var(--bil-faint); font-weight: 520; }
.bil-incoming {
  position: absolute;
  inset: 0 0 auto 13px;
  color: var(--bil-ink);
  opacity: 0;
  overflow-wrap: anywhere;
}
.bil-capture-hint {
  margin: 14px 0 0;
  color: var(--bil-faint);
  font-family: var(--bil-mono);
  font-size: 10px;
  letter-spacing: 0.03em;
}
.bil-capture-hint kbd {
  padding: 1px 5px;
  border: 1px solid var(--bil-line);
  border-radius: 4px;
  background: var(--bil-paper-deep);
  font: inherit;
}
.bil-stream-head,
.bil-tasks-head {
  padding: 12px clamp(19px, 2.4vw, 28px);
  border-top: 1px solid var(--bil-line);
  border-bottom: 1px solid var(--bil-line);
}
.bil-stream-head h2,
.bil-tasks-head h2 {
  margin: 0;
  font-size: 13.5px;
  font-weight: 560;
  letter-spacing: -0.02em;
}
.bil-stream-head > span,
.bil-tasks-head > span {
  color: var(--bil-faint);
  font-family: var(--bil-mono);
  font-size: 9.5px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.bil-stream { margin: 0; padding: 0; list-style: none; }
.bil-item {
  position: relative;
  display: grid;
  grid-template-rows: 1fr;
  border-bottom: 1px solid var(--bil-line-soft);
}
.bil-item:last-child { border-bottom: 0; }
.bil-item-inner {
  min-height: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 13px clamp(19px, 2.4vw, 28px);
}
.bil-item-source::before,
.bil-task-row::before {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 2px;
  background: var(--bil-accent);
}
.bil-item-copy,
.bil-task-copy { display: flex; min-width: 0; flex-direction: column; gap: 3px; }
.bil-item-title,
.bil-task-title {
  color: var(--bil-ink);
  font-size: 14px;
  font-weight: 590;
  letter-spacing: -0.01em;
  line-height: 1.35;
}
.bil-item-detail,
.bil-task-detail {
  color: var(--bil-faint);
  font-family: var(--bil-mono);
  font-size: 9.5px;
  letter-spacing: 0.04em;
}
.bil-item-state {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 6px;
  color: var(--bil-accent);
  font-family: var(--bil-mono);
  font-size: 9.5px;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  white-space: nowrap;
}
.bil-state-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--bil-accent);
}
.bil-approval {
  position: absolute;
  right: clamp(19px, 2.4vw, 28px);
  top: 50%;
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 5px 9px;
  border: 1px solid var(--bil-accent);
  border-radius: 5px;
  background: var(--bil-paper);
  color: var(--bil-accent);
  font-family: var(--bil-mono);
  font-size: 9.5px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 0;
  transform: translateY(-50%);
  pointer-events: none;
}
.bil-approval-ring {
  position: absolute;
  inset: -1px;
  border: 1px solid var(--bil-accent);
  border-radius: inherit;
  opacity: 0;
}
.bil-approval-short { display: none; }

.bil-bridge {
  --bil-cross-x0: -108px;
  --bil-cross-y0: -50%;
  --bil-cross-x1: 34px;
  --bil-cross-y1: -50%;
  position: relative;
  min-height: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  overflow: visible;
  color: var(--bil-faint);
}
.bil-bridge-rule {
  position: absolute;
  inset: 16px auto 16px 50%;
  width: 1px;
  background: var(--bil-line);
}
.bil-bridge-label,
.bil-bridge-arrow {
  position: relative;
  z-index: 1;
  background: var(--bil-paper);
}
.bil-bridge-label {
  padding: 3px 0;
  font-family: var(--bil-mono);
  font-size: 8.5px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.bil-bridge-arrow {
  padding: 2px 0;
  color: var(--bil-accent);
  font-size: 18px;
  rotate: 0deg;
}
.bil-flight {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 3;
  min-width: 62px;
  padding: 5px 8px;
  border: 1px solid var(--bil-accent);
  border-radius: 5px;
  background: var(--bil-paper);
  color: var(--bil-accent);
  font-family: var(--bil-mono);
  font-size: 9px;
  letter-spacing: 0.06em;
  text-align: center;
  text-transform: uppercase;
  opacity: 0;
}
.bil-tasks {
  background: var(--bil-paper-soft);
  box-shadow: 0 1px 0 var(--bil-line-soft);
}
.bil-tasks-head { border-top: 0; }
.bil-task-row {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 11px;
  padding: 15px clamp(17px, 2vw, 23px) 17px;
}
.bil-task-box {
  flex: 0 0 auto;
  width: 16px;
  height: 16px;
  margin-top: 1px;
  border: 1.5px solid var(--bil-accent);
  border-radius: 5px;
  background: var(--bil-accent-soft);
}

.bil-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-top: clamp(28px, 4vh, 42px);
  padding-top: 18px;
  border-top: 1px solid var(--bil-line);
}
.bil-foot p {
  margin: 0;
  max-width: 52ch;
  color: var(--bil-soft);
  font-size: 13.5px;
  line-height: 1.5;
}
.bil-cta {
  display: inline-flex;
  min-height: 42px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  padding: 9px 16px;
  border: 1px solid var(--bil-ink);
  border-radius: 5px;
  background: var(--bil-ink);
  color: var(--bil-paper);
  font-size: 13px;
  font-weight: 560;
  text-decoration: none;
  transition: opacity 160ms var(--ease-out), transform 160ms var(--ease-out);
}
.bil-cta:hover { opacity: 0.86; }
.bil-cta:active { transform: translateY(1px); }
.bil-cta:focus-visible {
  outline: 2px solid var(--bil-accent);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: no-preference) {
  .bil-kicker { animation: bil-rise 420ms var(--ease-out) both; }
  .bil-title { animation: bil-rise 520ms var(--ease-out) 60ms both; }
  .bil-lede { animation: bil-rise 520ms var(--ease-out) 120ms both; }

  .bil-placeholder {
    animation: bil-placeholder 1.18s var(--ease-out) both;
  }
  .bil-incoming {
    animation: bil-catch 760ms var(--ease-out) 120ms both;
  }
  .bil-capture-caret {
    animation: bil-caret-catch 360ms var(--ease-out) 300ms both,
      bil-blink 1.05s steps(1, end) 1.2s infinite;
  }
  .bil-item-source {
    animation: bil-log 440ms var(--ease-out) 720ms both,
      bil-source-pulse 520ms var(--ease-out) 1.52s both;
  }
  .bil-item-source::before { animation: bil-accent-in 340ms var(--ease-out) 2.3s both; }
  .bil-item-state { animation: bil-state-in 360ms var(--ease-out) 2.45s both; }
  .bil-approval {
    animation: bil-approve-in 260ms var(--ease-out) 1.35s both,
      bil-approve-out 220ms var(--ease-out) 1.92s forwards;
  }
  .bil-approval-ring { animation: bil-tap 520ms var(--ease-out) 1.56s both; }
  .bil-flight { animation: bil-cross 620ms var(--ease-in-out) 1.86s both; }
  .bil-bridge-arrow { animation: bil-arrow 440ms var(--ease-out) 1.94s both; }
  .bil-tasks { animation: bil-task-panel 440ms var(--ease-out) 2.12s both; }
  .bil-task-row { animation: bil-task-row 360ms var(--ease-out) 2.32s both; }
  .bil-task-box { animation: bil-box 320ms var(--ease-out) 2.5s both; }
  @keyframes bil-rise {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes bil-placeholder {
    0%, 76% { opacity: 0; }
    100% { opacity: 1; }
  }
  @keyframes bil-catch {
    0% { opacity: 0; transform: translateX(18px); color: var(--bil-faint); }
    38% { opacity: 0.42; transform: translateX(8px); color: var(--bil-faint); }
    62% { opacity: 1; transform: translateX(0); color: var(--bil-ink); }
    84% { opacity: 1; transform: translateX(0); color: var(--bil-ink); }
    100% { opacity: 0; transform: translateY(5px); color: var(--bil-ink); }
  }
  @keyframes bil-caret-catch {
    0% { opacity: 0.3; transform: scaleY(0.45); }
    62% { opacity: 1; transform: scaleY(1.14); }
    100% { opacity: 1; transform: scaleY(1); }
  }
  @keyframes bil-log {
    0% { grid-template-rows: 0fr; opacity: 0; background: var(--bil-accent-soft); }
    72% { opacity: 1; }
    100% { grid-template-rows: 1fr; opacity: 1; background: transparent; }
  }
  @keyframes bil-source-pulse {
    0%, 100% { background: transparent; }
    46% { background: var(--bil-accent-soft); }
  }
  @keyframes bil-accent-in {
    from { opacity: 0; transform: scaleY(0); }
    to { opacity: 1; transform: scaleY(1); }
  }
  @keyframes bil-state-in {
    from { opacity: 0; transform: translateX(-5px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes bil-approve-in {
    from { opacity: 0; transform: translateY(-50%) scale(0.96); }
    to { opacity: 1; transform: translateY(-50%) scale(1); }
  }
  @keyframes bil-approve-out {
    from { opacity: 1; transform: translateY(-50%) scale(1); }
    to { opacity: 0; transform: translateY(-50%) scale(0.98); }
  }
  @keyframes bil-tap {
    0% { opacity: 0; transform: scale(0.92); }
    35% { opacity: 0.8; }
    100% { opacity: 0; transform: scale(1.45); }
  }
  @keyframes bil-cross {
    0% { opacity: 0; transform: translate3d(var(--bil-cross-x0), var(--bil-cross-y0), 0) scaleX(0.96); }
    18% { opacity: 1; }
    66% { opacity: 1; transform: translate3d(var(--bil-cross-x1), var(--bil-cross-y1), 0) scaleX(1.04); }
    100% { opacity: 0; transform: translate3d(var(--bil-cross-x1), var(--bil-cross-y1), 0) scaleX(1); }
  }
  @keyframes bil-arrow {
    0%, 100% { transform: translateX(0); }
    52% { transform: translateX(7px); }
  }
  @keyframes bil-task-panel {
    from { opacity: 0.18; transform: translateX(-8px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes bil-task-row {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes bil-box {
    from { opacity: 0; transform: scale(0.55); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes bil-blink {
    0%, 52% { opacity: 1; }
    52.01%, 100% { opacity: 0; }
  }
}

@media (max-width: 760px) {
  .bil {
    min-height: auto;
    padding: 42px 16px 56px;
  }
  .bil-title { max-width: 12ch; }
  .bil-stage { grid-template-columns: minmax(0, 1fr); }
  .bil-bridge {
    --bil-cross-x0: -50%;
    --bil-cross-y0: -48px;
    --bil-cross-x1: -50%;
    --bil-cross-y1: 24px;
    min-height: 74px;
    flex-direction: row;
    gap: 10px;
  }
  .bil-bridge-rule {
    inset: 50% 14% auto;
    width: auto;
    height: 1px;
  }
  .bil-bridge-arrow { rotate: 90deg; }
  .bil-foot { align-items: flex-start; flex-direction: column; }
  .bil-cta { width: 100%; }
  .bil-item-title,
  .bil-task-title { overflow-wrap: anywhere; }
}

@media (max-width: 430px) {
  .bil-capture { padding: 18px 16px; }
  .bil-stream-head,
  .bil-tasks-head,
  .bil-item-inner { padding-left: 16px; padding-right: 16px; }
  .bil-item-inner { align-items: flex-start; }
  .bil-item-state { margin-top: 2px; }
  .bil-approval { right: 16px; }
  .bil-approval-full { display: none; }
  .bil-approval-short { display: inline; }
}
`;
