/**
 * Notes hero lab direction: Three Seconds.
 *
 * The product promise is demonstrated against a literal three-second rail. The
 * notebook is visible from the first frame, one thought is written and logged
 * at 1.8 seconds, then a separate user approval sends only its action into
 * Signal Tasks. The full story settles by roughly 3.5 seconds.
 *
 * Settled semantic content is the default. Motion is decorative, CSS-only, and
 * limited to prefers-reduced-motion: no-preference.
 */

export function OptionThreeSeconds() {
  return (
    <section className="nt3" aria-labelledby="nt3-title">
      <style>{CSS}</style>

      <div className="nt3-frame">
        <header className="nt3-head">
          <div>
            <p className="nt3-kicker">Signal Notes · capture proof</p>
            <h1 className="nt3-title" id="nt3-title">
              Written before the third second.
            </h1>
          </div>
          <p className="nt3-lede">
            The notebook opens ready. Write the thought, save it, move on. You
            decide later if it becomes work.
          </p>
        </header>

        <article className="nt3-notebook" aria-labelledby="nt3-notebook-title">
          <div className="nt3-notebook-head">
            <h2 id="nt3-notebook-title">Notebook</h2>
            <span>Private</span>
          </div>

          <div className="nt3-capture">
            <div className="nt3-capture-top">
              <span>Capture</span>
              <span className="nt3-stopwatch" aria-label="Captured in 1.8 seconds">
                <span className="nt3-time nt3-time-zero" aria-hidden>
                  0.0s
                </span>
                <span className="nt3-time nt3-time-mid" aria-hidden>
                  0.9s
                </span>
                <span className="nt3-time nt3-time-final">1.8s</span>
              </span>
            </div>

            <div className="nt3-capture-line">
              <span className="nt3-ready-caret" aria-hidden />
              <span className="nt3-placeholder">Catch the next one.</span>
              <span className="nt3-type-run" aria-hidden>
                <span className="nt3-typed">Move rehearsal dinner to seven</span>
                <span className="nt3-type-caret" />
              </span>
            </div>

            <div className="nt3-clock" aria-label="Captured at 1.8 seconds on a three-second scale">
              <span className="nt3-clock-fill" aria-hidden />
              <span className="nt3-clock-marker" aria-hidden />
              <span className="nt3-clock-receipt">written</span>
              <span className="nt3-tick nt3-tick-0">0</span>
              <span className="nt3-tick nt3-tick-1">1</span>
              <span className="nt3-tick nt3-tick-2">2</span>
              <span className="nt3-tick nt3-tick-3">3s</span>
            </div>
          </div>

          <div className="nt3-result">
            <div className="nt3-note">
              <span className="nt3-note-copy">
                <span className="nt3-note-title">Move rehearsal dinner to seven</span>
                <span className="nt3-note-detail">written in 1.8s</span>
              </span>
              <span className="nt3-note-state">
                <span className="nt3-note-dot" aria-hidden />
                In Tasks
              </span>
              <span className="nt3-approval" aria-hidden>
                <span className="nt3-approval-ring" />
                <span className="nt3-approval-full">Send to Tasks</span>
                <span className="nt3-approval-short">Approve</span>
              </span>
            </div>

            <div className="nt3-crossing" aria-hidden>
              <span className="nt3-cross-label">Approved</span>
              <span className="nt3-cross-rule" />
              <span className="nt3-cross-arrow">→</span>
              <span className="nt3-flight">extract</span>
            </div>

            <div className="nt3-task">
              <div className="nt3-task-head">
                <h3>Signal Tasks</h3>
                <span>Open</span>
              </div>
              <div className="nt3-task-row">
                <span className="nt3-task-box" aria-hidden />
                <span>
                  <span className="nt3-task-title">
                    Move rehearsal dinner to seven
                  </span>
                  <span className="nt3-task-detail">from a note</span>
                </span>
              </div>
            </div>
          </div>
        </article>

        <footer className="nt3-foot">
          <p>
            Capture took 1.8 seconds. The note stayed private until you approved
            the action.
          </p>
          <a className="nt3-cta" href="/app">
            Start a notebook
          </a>
        </footer>
      </div>
    </section>
  );
}

const CSS = `
.nt3 {
  --nt3-ink: var(--ink);
  --nt3-soft: var(--ink-soft);
  --nt3-faint: var(--ink-faint);
  --nt3-ghost: var(--ink-ghost);
  --nt3-accent: var(--accent);
  --nt3-accent-soft: var(--accent-soft);
  --nt3-paper: var(--paper);
  --nt3-paper-soft: var(--paper-soft);
  --nt3-paper-deep: var(--paper-deep);
  --nt3-line: var(--hairline);
  --nt3-line-soft: var(--hairline-soft);
  --nt3-sans: var(--font-geist-sans), "Geist", system-ui, sans-serif;
  --nt3-mono: var(--font-geist-mono), "Geist Mono", ui-monospace, monospace;
  --nt3-cross-x0: -94px;
  --nt3-cross-y0: -50%;
  --nt3-cross-x1: 26px;
  --nt3-cross-y1: -50%;

  position: relative;
  overflow: hidden;
  min-height: clamp(680px, 92svh, 940px);
  display: flex;
  align-items: center;
  padding: clamp(48px, 7svh, 88px) clamp(20px, 5vw, 72px);
  background: var(--nt3-paper);
  color: var(--nt3-ink);
  font-family: var(--nt3-sans);
}
.nt3 * { box-sizing: border-box; }
.nt3-frame { width: min(1040px, 100%); margin-inline: auto; }

.nt3-head {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(260px, 0.75fr);
  align-items: end;
  gap: clamp(28px, 6vw, 84px);
}
.nt3-kicker {
  margin: 0 0 18px;
  color: var(--nt3-faint);
  font-family: var(--nt3-mono);
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
.nt3-title {
  margin: 0;
  max-width: 15ch;
  font-size: clamp(2.35rem, 1.55rem + 3.4vw, 4.65rem);
  font-weight: 630;
  letter-spacing: -0.05em;
  line-height: 0.98;
  text-wrap: balance;
}
.nt3-lede {
  margin: 0 0 4px;
  max-width: 43ch;
  color: var(--nt3-soft);
  font-size: 15.5px;
  line-height: 1.6;
  text-wrap: pretty;
}

.nt3-notebook {
  margin-top: clamp(34px, 5vh, 54px);
  border: 1px solid var(--nt3-line);
  border-radius: 14px;
  background: var(--nt3-paper);
  box-shadow: 0 1px 0 var(--nt3-line-soft), var(--shadow-float);
  overflow: hidden;
}
.nt3-notebook-head,
.nt3-capture-top,
.nt3-task-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.nt3-notebook-head {
  padding: 12px clamp(20px, 2.8vw, 32px);
  border-bottom: 1px solid var(--nt3-line);
}
.nt3-notebook-head h2,
.nt3-task-head h3 {
  margin: 0;
  font-size: 13.5px;
  font-weight: 570;
  letter-spacing: -0.02em;
}
.nt3-notebook-head > span,
.nt3-task-head > span {
  color: var(--nt3-faint);
  font-family: var(--nt3-mono);
  font-size: 9.5px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.nt3-capture {
  padding: clamp(20px, 2.8vw, 32px) clamp(20px, 2.8vw, 32px) clamp(26px, 3.4vw, 38px);
}
.nt3-capture-top {
  margin-bottom: 16px;
  color: var(--nt3-faint);
  font-family: var(--nt3-mono);
  font-size: 9.5px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.nt3-stopwatch {
  position: relative;
  display: inline-grid;
  min-width: 4.2ch;
  color: var(--nt3-accent);
  font-variant-numeric: tabular-nums;
  text-align: right;
}
.nt3-time { grid-area: 1 / 1; }
.nt3-time-zero,
.nt3-time-mid { opacity: 0; }
.nt3-capture-line {
  container-type: inline-size;
  position: relative;
  min-height: 1.5em;
  padding-left: 13px;
  font-size: clamp(16px, 1.8vw, 22px);
  font-weight: 610;
  letter-spacing: -0.025em;
  line-height: 1.3;
}
.nt3-ready-caret,
.nt3-type-caret {
  position: absolute;
  left: 0;
  top: 0.12em;
  width: 2px;
  height: 0.94em;
  border-radius: 1px;
  background: var(--nt3-accent);
}
.nt3-placeholder { color: var(--nt3-faint); font-weight: 520; }
.nt3-type-run {
  position: absolute;
  inset: 0 0 auto 13px;
  white-space: nowrap;
  opacity: 0;
}
.nt3-typed { display: inline-block; }
.nt3-type-caret { opacity: 0; }

.nt3-clock {
  container-type: inline-size;
  position: relative;
  height: 1px;
  margin-top: clamp(48px, 6vh, 66px);
  background: var(--nt3-line);
}
.nt3-clock-fill {
  position: absolute;
  inset: 0 auto auto 0;
  width: 60%;
  height: 2px;
  background: var(--nt3-accent);
  clip-path: inset(0 0 0 0);
}
.nt3-clock-marker {
  position: absolute;
  left: 0;
  top: 50%;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--nt3-accent);
  box-shadow: 0 0 0 5px var(--nt3-accent-soft);
  transform: translate3d(calc(60cqw - 50%), -50%, 0);
}
.nt3-clock-receipt {
  position: absolute;
  left: 60%;
  bottom: 11px;
  color: var(--nt3-accent);
  font-family: var(--nt3-mono);
  font-size: 9.5px;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  transform: translateX(-50%);
}
.nt3-tick {
  position: absolute;
  top: 12px;
  color: var(--nt3-faint);
  font-family: var(--nt3-mono);
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  transform: translateX(-50%);
}
.nt3-tick::before {
  content: "";
  position: absolute;
  left: 50%;
  bottom: calc(100% + 10px);
  width: 1px;
  height: 6px;
  background: var(--nt3-line);
}
.nt3-tick-0 { left: 0; transform: none; }
.nt3-tick-0::before { left: 0; }
.nt3-tick-1 { left: 33.333%; }
.nt3-tick-2 { left: 66.666%; }
.nt3-tick-3 { left: 100%; transform: translateX(-100%); }
.nt3-tick-3::before { left: 100%; }

.nt3-result {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) 70px minmax(220px, 0.75fr);
  align-items: stretch;
  border-top: 1px solid var(--nt3-line);
}
.nt3-note {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-width: 0;
  padding: 17px clamp(20px, 2.8vw, 32px);
}
.nt3-note::before,
.nt3-task-row::before {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 2px;
  background: var(--nt3-accent);
}
.nt3-note-copy { display: flex; min-width: 0; flex-direction: column; gap: 3px; }
.nt3-note-title,
.nt3-task-title {
  display: block;
  color: var(--nt3-ink);
  font-size: 14px;
  font-weight: 590;
  letter-spacing: -0.01em;
  line-height: 1.35;
}
.nt3-note-detail,
.nt3-task-detail {
  display: block;
  color: var(--nt3-faint);
  font-family: var(--nt3-mono);
  font-size: 9.5px;
  letter-spacing: 0.04em;
}
.nt3-note-state {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 6px;
  color: var(--nt3-accent);
  font-family: var(--nt3-mono);
  font-size: 9.5px;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  white-space: nowrap;
}
.nt3-note-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--nt3-accent);
}
.nt3-approval {
  position: absolute;
  right: clamp(20px, 2.8vw, 32px);
  top: 50%;
  display: inline-flex;
  min-height: 28px;
  align-items: center;
  padding: 5px 9px;
  border: 1px solid var(--nt3-accent);
  border-radius: 5px;
  background: var(--nt3-paper);
  color: var(--nt3-accent);
  font-family: var(--nt3-mono);
  font-size: 9.5px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 0;
  transform: translateY(-50%);
  pointer-events: none;
}
.nt3-approval-ring {
  position: absolute;
  inset: -1px;
  border: 1px solid var(--nt3-accent);
  border-radius: inherit;
  opacity: 0;
}
.nt3-approval-short { display: none; }
.nt3-crossing {
  --nt3-cross-x0: -94px;
  --nt3-cross-y0: -50%;
  --nt3-cross-x1: 26px;
  --nt3-cross-y1: -50%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 94px;
  overflow: visible;
  color: var(--nt3-faint);
}
.nt3-cross-rule {
  position: absolute;
  inset: 12px auto 12px 50%;
  width: 1px;
  background: var(--nt3-line);
}
.nt3-cross-label,
.nt3-cross-arrow {
  position: relative;
  z-index: 1;
  background: var(--nt3-paper);
}
.nt3-cross-label {
  padding: 3px 0;
  font-family: var(--nt3-mono);
  font-size: 8.5px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.nt3-cross-arrow {
  padding: 2px 0;
  color: var(--nt3-accent);
  font-size: 17px;
  rotate: 0deg;
}
.nt3-flight {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 3;
  min-width: 60px;
  padding: 5px 8px;
  border: 1px solid var(--nt3-accent);
  border-radius: 5px;
  background: var(--nt3-paper);
  color: var(--nt3-accent);
  font-family: var(--nt3-mono);
  font-size: 9px;
  letter-spacing: 0.06em;
  text-align: center;
  text-transform: uppercase;
  opacity: 0;
}
.nt3-task {
  border-left: 1px solid var(--nt3-line);
  background: var(--nt3-paper-soft);
}
.nt3-task-head {
  padding: 11px clamp(16px, 2vw, 22px);
  border-bottom: 1px solid var(--nt3-line);
}
.nt3-task-row {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px clamp(16px, 2vw, 22px) 16px;
}
.nt3-task-box {
  flex: 0 0 auto;
  width: 16px;
  height: 16px;
  margin-top: 1px;
  border: 1.5px solid var(--nt3-accent);
  border-radius: 5px;
  background: var(--nt3-accent-soft);
}

.nt3-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-top: clamp(26px, 4vh, 40px);
}
.nt3-foot p {
  margin: 0;
  max-width: 58ch;
  color: var(--nt3-soft);
  font-size: 13.5px;
  line-height: 1.5;
}
.nt3-cta {
  display: inline-flex;
  min-height: 42px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  padding: 9px 16px;
  border: 1px solid var(--nt3-ink);
  border-radius: 5px;
  background: var(--nt3-ink);
  color: var(--nt3-paper);
  font-size: 13px;
  font-weight: 560;
  text-decoration: none;
  transition: opacity 160ms var(--ease-out), transform 160ms var(--ease-out);
}
.nt3-cta:hover { opacity: 0.86; }
.nt3-cta:active { transform: translateY(1px); }
.nt3-cta:focus-visible {
  outline: 2px solid var(--nt3-accent);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: no-preference) {
  .nt3-kicker { animation: nt3-rise 420ms var(--ease-out) both; }
  .nt3-title { animation: nt3-rise 520ms var(--ease-out) 60ms both; }
  .nt3-lede { animation: nt3-rise 520ms var(--ease-out) 120ms both; }

  .nt3-time-zero { animation: nt3-time-zero 650ms var(--ease-out) both; }
  .nt3-time-mid { animation: nt3-time-mid 1.12s var(--ease-out) 520ms both; }
  .nt3-time-final { animation: nt3-time-final 320ms var(--ease-out) 1.62s both; }
  .nt3-placeholder { animation: nt3-placeholder 1.78s var(--ease-out) both; }
  .nt3-type-run { animation: nt3-type-run 1.26s var(--ease-out) 180ms both; }
  .nt3-typed { animation: nt3-type 900ms steps(30, end) 260ms both; }
  .nt3-ready-caret {
    animation: nt3-ready-caret 240ms var(--ease-out) 160ms both,
      nt3-ready-back 260ms var(--ease-out) 1.44s forwards,
      nt3-blink 1.05s steps(1, end) 1.72s infinite;
  }
  .nt3-type-caret {
    animation: nt3-type-caret 900ms steps(30, end) 260ms both;
  }
  .nt3-clock-fill { animation: nt3-fill 1.8s linear both; }
  .nt3-clock-marker { animation: nt3-marker 1.8s linear both; }
  .nt3-clock-receipt { animation: nt3-receipt 360ms var(--ease-out) 1.62s both; }
  .nt3-note { animation: nt3-note-in 420ms var(--ease-out) 1.58s both; }
  .nt3-note::before { animation: nt3-accent-in 300ms var(--ease-out) 3s both; }
  .nt3-note-state { animation: nt3-state-in 320ms var(--ease-out) 3.1s both; }
  .nt3-approval {
    animation: nt3-approve-in 250ms var(--ease-out) 2.15s both,
      nt3-approve-out 220ms var(--ease-out) 2.72s forwards;
  }
  .nt3-approval-ring { animation: nt3-tap 500ms var(--ease-out) 2.36s both; }
  .nt3-flight { animation: nt3-cross 560ms var(--ease-in-out) 2.7s both; }
  .nt3-cross-arrow { animation: nt3-arrow 400ms var(--ease-out) 2.78s both; }
  .nt3-task { animation: nt3-task-in 420ms var(--ease-out) 3s both; }
  .nt3-task-row { animation: nt3-task-row 340ms var(--ease-out) 3.14s both; }
  .nt3-task-box { animation: nt3-box 300ms var(--ease-out) 3.3s both; }

  @keyframes nt3-rise {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes nt3-time-zero {
    0%, 64% { opacity: 1; }
    100% { opacity: 0; }
  }
  @keyframes nt3-time-mid {
    0% { opacity: 0; transform: translateY(3px); }
    22%, 70% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-3px); }
  }
  @keyframes nt3-time-final {
    from { opacity: 0; transform: translateY(3px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes nt3-placeholder {
    0%, 82% { opacity: 0; }
    100% { opacity: 1; }
  }
  @keyframes nt3-type-run {
    0% { opacity: 0; }
    8%, 82% { opacity: 1; }
    100% { opacity: 0; }
  }
  @keyframes nt3-type {
    from { clip-path: inset(0 100% 0 0); }
    to { clip-path: inset(0 0 0 0); }
  }
  @keyframes nt3-ready-caret {
    from { opacity: 0.25; transform: scaleY(0.55); }
    to { opacity: 0; transform: scaleY(1); }
  }
  @keyframes nt3-ready-back {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes nt3-type-caret {
    0% { opacity: 1; transform: translateX(0); }
    100% { opacity: 1; transform: translateX(min(29ch, 84cqw)); }
  }
  @keyframes nt3-fill {
    from { clip-path: inset(0 100% 0 0); }
    to { clip-path: inset(0 0 0 0); }
  }
  @keyframes nt3-marker {
    from { opacity: 0.4; transform: translate3d(-50%, -50%, 0) scale(0.72); }
    to { opacity: 1; transform: translate3d(calc(60cqw - 50%), -50%, 0) scale(1); }
  }
  @keyframes nt3-receipt {
    from { opacity: 0; transform: translateX(-50%) translateY(4px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
  @keyframes nt3-note-in {
    from { opacity: 0; transform: translateY(-6px); background: var(--nt3-accent-soft); }
    to { opacity: 1; transform: translateY(0); background: transparent; }
  }
  @keyframes nt3-accent-in {
    from { opacity: 0; transform: scaleY(0); }
    to { opacity: 1; transform: scaleY(1); }
  }
  @keyframes nt3-state-in {
    from { opacity: 0; transform: translateX(-5px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes nt3-approve-in {
    from { opacity: 0; transform: translateY(-50%) scale(0.96); }
    to { opacity: 1; transform: translateY(-50%) scale(1); }
  }
  @keyframes nt3-approve-out {
    from { opacity: 1; transform: translateY(-50%) scale(1); }
    to { opacity: 0; transform: translateY(-50%) scale(0.98); }
  }
  @keyframes nt3-tap {
    0% { opacity: 0; transform: scale(0.92); }
    35% { opacity: 0.8; }
    100% { opacity: 0; transform: scale(1.45); }
  }
  @keyframes nt3-cross {
    0% { opacity: 0; transform: translate3d(var(--nt3-cross-x0), var(--nt3-cross-y0), 0); }
    18% { opacity: 1; }
    68% { opacity: 1; transform: translate3d(var(--nt3-cross-x1), var(--nt3-cross-y1), 0); }
    100% { opacity: 0; transform: translate3d(var(--nt3-cross-x1), var(--nt3-cross-y1), 0); }
  }
  @keyframes nt3-arrow {
    0%, 100% { transform: translateX(0); }
    52% { transform: translateX(7px); }
  }
  @keyframes nt3-task-in {
    from { opacity: 0.18; transform: translateX(-7px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes nt3-task-row {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes nt3-box {
    from { opacity: 0; transform: scale(0.55); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes nt3-blink {
    0%, 52% { opacity: 1; }
    52.01%, 100% { opacity: 0; }
  }
}

@media (max-width: 760px) {
  .nt3 {
    min-height: auto;
    padding: 42px 16px 56px;
  }
  .nt3-head { grid-template-columns: minmax(0, 1fr); gap: 20px; }
  .nt3-title { max-width: 12ch; }
  .nt3-lede { margin: 0; }
  .nt3-result { grid-template-columns: minmax(0, 1fr); }
  .nt3-crossing {
    --nt3-cross-x0: -50%;
    --nt3-cross-y0: -44px;
    --nt3-cross-x1: -50%;
    --nt3-cross-y1: 22px;
    min-height: 70px;
    flex-direction: row;
    gap: 10px;
    border-top: 1px solid var(--nt3-line-soft);
  }
  .nt3-cross-rule {
    inset: 50% 14% auto;
    width: auto;
    height: 1px;
  }
  .nt3-cross-arrow { rotate: 90deg; }
  .nt3-task { border-top: 1px solid var(--nt3-line-soft); border-left: 0; }
  .nt3-foot { align-items: flex-start; flex-direction: column; }
  .nt3-cta { width: 100%; }
}

@media (max-width: 430px) {
  .nt3-notebook-head,
  .nt3-capture,
  .nt3-note { padding-left: 16px; padding-right: 16px; }
  .nt3-note { align-items: flex-start; }
  .nt3-note-title,
  .nt3-task-title { overflow-wrap: anywhere; }
  .nt3-approval { right: 16px; }
  .nt3-approval-full { display: none; }
  .nt3-approval-short { display: inline; }
  .nt3-capture-line { font-size: 15px; }
}
`;
