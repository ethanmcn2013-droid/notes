/**
 * The Notebook — the Signal Notes homepage hero (hybrid of Notebook First ×
 * The Crossing). Shipped as the site hero; also shown in the /lab showroom
 * via a re-export at components/lab/option-the-notebook.tsx.
 *
 * A cinematic introduction to Signal Notes, in one unbroken surface:
 *   · three real thoughts are each typed and logged into the stream,
 *   · one that becomes work is swiped one way into Signal Tasks,
 *   · the film resolves onto the notes. wordmark and a closing line.
 *
 * SSR-safe: the settled composition — a ready capture, a three-note
 * stream with one note "in Tasks", the committed task, and the notes.
 * sign-off — is the default CSS. The ~10s intro runs once on mount,
 * motion-safe only. No JS.
 */
export function NotesHeroNotebook() {
  const stream = [
    {
      title: "The Hendriks want the toasts before dinner",
      preview: "they changed their mind at the tasting",
      time: "just now",
      role: "n1",
    },
    {
      title: "The marquee company hasn’t confirmed Saturday",
      preview: "chased them once already",
      time: "2m",
      role: "source",
    },
    {
      title: "Peonies might be past their best by June",
      preview: "ask the florist for a backup",
      time: "5m",
      role: "n3",
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
            A private place to catch a thought in three seconds, while you
            still have it.
          </p>
        </header>

        <div className="ntb-stage" aria-hidden>
          {/* LEFT — the notebook (capture + stream) */}
          <div className="ntb-notebook">
            <div className="ntb-capture">
              <div className="ntb-capture-line">
                <span className="ntb-caret ntb-caret-ready" />
                <span className="ntb-placeholder">Catch the next one.</span>
                <span className="ntb-tw ntb-tw-1">
                  <span className="ntb-typed">The Hendriks want the toasts before dinner</span>
                  <span className="ntb-caret ntb-caret-type" />
                </span>
                <span className="ntb-tw ntb-tw-2">
                  <span className="ntb-typed">The marquee company hasn’t confirmed Saturday</span>
                  <span className="ntb-caret ntb-caret-type" />
                </span>
                <span className="ntb-tw ntb-tw-3">
                  <span className="ntb-typed">Peonies might be past their best by June</span>
                  <span className="ntb-caret ntb-caret-type" />
                </span>
              </div>
              <p className="ntb-hint">
                <kbd>⌘↵</kbd> save &nbsp;·&nbsp; <kbd>esc</kbd> discard
              </p>
            </div>

            <div className="ntb-streamhead">
              <span className="ntb-streamhead-label">stream<span className="ntb-streamhead-kind">private</span></span>
              <span className="ntb-streamhead-count">
                <span className="ntb-count ntb-count-0">0 notes</span>
                <span className="ntb-count ntb-count-1">1 note</span>
                <span className="ntb-count ntb-count-2">2 notes</span>
                <span className="ntb-count ntb-count-3">3 notes</span>
              </span>
            </div>
            <ul className="ntb-stream">
              {stream.map((n) => (
                <li key={n.title} className={"ntb-row ntb-row--" + n.role}>
                  <span className="ntb-row-inner">
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
                  </span>
                  {n.role === "source" ? <span className="ntb-approve" /> : null}
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
                <span className="ntb-check ntb-check--committed" />
                <span className="ntb-task-body">
                  <span className="ntb-task-title">Chase the marquee company for Saturday</span>
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
            <span className="ntb-chip">Chase the marquee company for Saturday</span>
          </div>
        </div>

        {/* Narration → resolves onto the signal wordmark and a closing line */}
        <div className="ntb-narrate" aria-hidden>
          <span className="ntb-cap ntb-cap-0">Each thought, down in seconds.</span>
          <span className="ntb-cap ntb-cap-1">All of it, one search away.</span>
          <span className="ntb-cap ntb-cap-2">You send the one that becomes work to Signal Tasks.</span>
          <span className="ntb-cap ntb-cap-3">The rest stays private.</span>
          <span className="ntb-signoff">
            <span className="ntb-wordmark">
              <span className="ntb-wm-word">notes</span>
              <span className="ntb-wm-dot" />
            </span>
            <span className="ntb-catch">Nothing worth keeping gets lost.</span>
          </span>
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
  min-height: clamp(680px, 96svh, 1040px);
  display: flex; align-items: center; justify-content: center;
  padding: clamp(44px, 7svh, 96px) 24px;
  background: var(--ntb-paper);
  font-family: var(--ntb-sans); color: var(--ntb-ink);
}

.ntb-frame { width: min(1080px, 100%); }

/* ── Head ── */
.ntb-head { max-width: 680px; margin: 0 auto clamp(22px, 3.2vh, 40px); text-align: center; }
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

/* ── Narration → sign-off ── */
.ntb-narrate {
  position: relative; display: grid; place-items: center;
  margin: clamp(52px, 6vh, 88px) auto 0; min-height: 3em;
  font-family: var(--ntb-mono); font-size: 12px; letter-spacing: 0.06em;
  color: var(--ntb-soft); text-align: center;
}
.ntb-cap { grid-area: 1 / 1; white-space: nowrap; opacity: 0; }
.ntb-signoff {
  grid-area: 1 / 1; display: flex; flex-direction: column; align-items: center;
  gap: 13px; opacity: 1; /* rest: the sign-off owns the close */
}
.ntb-wordmark {
  display: inline-flex; align-items: baseline; gap: 0;
  font-family: var(--ntb-sans); font-weight: 500;
  font-size: 44px; letter-spacing: -0.04em; color: var(--ntb-ink);
}
.ntb-wm-dot {
  /* Baseline-seated like the canonical wordmark period: the empty
     inline-block's baseline is its bottom edge, so under the parent's
     align-items: baseline the dot ENDS the word instead of hanging
     below it in the descender space (the old flex-end put it there). */
  width: 7px; height: 7px; border-radius: 50%; background: var(--ntb-accent);
  display: inline-block; margin-left: 3px;
}
.ntb-catch {
  font-family: var(--ntb-sans); font-size: 15px; letter-spacing: -0.01em;
  color: var(--ntb-soft);
}

/* ── Stage: notebook | edge | tasks ── */
.ntb-stage {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) auto minmax(0, 1fr);
  align-items: stretch; gap: clamp(10px, 1.9vw, 26px);
  opacity: 0.87; /* resolved frame: the demo settles a touch so the name leads */
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
  font-size: clamp(17px, 1.7vw, 22px); font-weight: 620;
  letter-spacing: -0.025em; line-height: 1.05; color: var(--ntb-ink);
}
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
/* the three typed notes — each hidden at rest, each types in its window */
.ntb-tw {
  position: absolute; left: 0; top: 0; height: 100%;
  display: inline-flex; align-items: center; width: fit-content;
  opacity: 0;
}
.ntb-typed { display: inline-block; clip-path: inset(0 0 0 0); }
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
.ntb-streamhead-kind {
  margin-left: 8px; font-family: var(--ntb-mono); font-size: 9.5px;
  letter-spacing: 0.12em; text-transform: uppercase; color: var(--ntb-faint);
}
.ntb-streamhead-count {
  position: relative; display: inline-grid;
  font-family: var(--ntb-mono); font-size: 9.5px; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--ntb-faint); font-variant-numeric: tabular-nums;
}
.ntb-count { grid-area: 1 / 1; white-space: nowrap; text-align: right; opacity: 0; }
.ntb-count-3 { opacity: 1; } /* rest: three notes logged */
.ntb-stream { list-style: none; margin: 0; padding: 0; flex: 1 1 auto; }
.ntb-row {
  position: relative;
  display: grid; grid-template-rows: 1fr;
  border-bottom: 1px solid var(--ntb-line-soft);
}
.ntb-row:last-child { border-bottom: 0; }
.ntb-row-inner {
  display: grid; grid-template-columns: minmax(0, 1fr) auto;
  align-items: center; gap: 14px;
  min-width: 0; min-height: 0; overflow: hidden;
  padding: 14px clamp(20px, 2.6vw, 32px);
}
/* the approval tap — a deliberate act before the extract crosses; invisible at rest */
.ntb-approve {
  position: absolute; top: 50%; right: clamp(20px, 2.6vw, 32px);
  width: 17px; height: 17px; margin-top: -8.5px; border-radius: 50%;
  border: 1.5px solid var(--ntb-accent);
  transform: scale(0.3); opacity: 0; pointer-events: none;
}
/* the crossed note and its task share a faint indigo edge on both sides */
.ntb-row--source::before,
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
.ntb-check--open { border-color: var(--ntb-line); background: transparent; }
/* the arrived task lands as newly committed and OPEN (accent box, no tick):
   a fresh extract is work to be done, not work already finished (§8 open→done) */
.ntb-check--committed {
  background: color-mix(in srgb, var(--ntb-accent) 14%, transparent);
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
   INTRO — motion-safe only. Three thoughts are typed and logged;
   one is sent to Tasks; the film resolves onto the signal wordmark.
   Rest CSS above is the finished frame, so SSR / reduced-motion is done.
   ───────────────────────────────────────────────────────────── */
@media (prefers-reduced-motion: no-preference) {
  /* Overture */
  .ntb-kicker   { animation: ntb-up 0.7s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) both; }
  .ntb-headline { opacity: 0; animation: ntb-up 0.8s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 0.12s forwards; }
  .ntb-lede     { opacity: 0; animation: ntb-up 0.8s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 0.3s forwards; }
  .ntb-notebook { opacity: 0; animation: ntb-in 0.75s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 0.45s forwards; }
  /* Act 2 opens: Signal Tasks and the one-way edge are held back until a
     thought is approved to cross, so Act 1 reads as pure Notes capture */
  .ntb-tasks    { opacity: 0; animation: ntb-in 0.75s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 6.3s forwards; }
  .ntb-edge     { opacity: 0; animation: ntb-fade 0.7s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 6.2s forwards; }

  /* Act 1 holds the notebook centred under the header; at the reveal the stage
     slides to its resting position so Signal Tasks arrives into the space held
     for it (desktop only). At the sign-off the stage eases back a touch (to 0.87,
     still fully legible — never dimmed to dark) so the wordmark leads the close. */
  .ntb-stage { opacity: 1; animation: ntb-recede 1.3s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 9.0s forwards; }
  @media (min-width: 861px) {
    .ntb-stage { transform: translateX(21.5%);
      animation: ntb-recenter 0.7s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 6.0s forwards,
                 ntb-recede 1.3s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 9.0s forwards; }
  }
  @keyframes ntb-recenter { to { transform: translateX(0); } }
  @keyframes ntb-recede { to { opacity: 0.87; } }

  /* the ready caret shows in the overture, hides while notes type, and
     returns (blinking) once the three notes are in — matching rest */
  .ntb-caret-ready {
    opacity: 0;
    animation: ntb-fade 0.3s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 0.9s forwards,
               ntb-out 0.15s linear 1.2s forwards,
               ntb-fade 0.35s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 5.6s forwards,
               ntb-blink 1.06s steps(1, end) 5.95s infinite;
  }
  .ntb-placeholder {
    animation: ntb-out 0.2s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 1.1s forwards,
               ntb-fade 0.4s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 5.6s forwards;
  }

  /* narration — the capture caption covers all three notes; the payoff
     line ("kept where you'll find it") is given room to breathe */
  .ntb-cap-0   { animation: ntb-fade 0.45s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 1.0s forwards, ntb-out 0.4s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 5.3s forwards; }
  .ntb-cap-1   { animation: ntb-fade 0.45s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 5.5s forwards, ntb-out 0.4s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 6.4s forwards; }
  .ntb-cap-2   { animation: ntb-fade 0.45s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 6.5s forwards, ntb-out 0.4s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 7.8s forwards; }
  .ntb-cap-3   { animation: ntb-fade 0.45s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 7.9s forwards, ntb-out 0.4s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 9.0s forwards; }
  .ntb-signoff { opacity: 0; animation: ntb-signoff-in 0.9s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 9.1s forwards; }
  .ntb-wm-dot  { transform: scale(0);
    animation: ntb-pop 0.6s cubic-bezier(0.34,1.56,0.64,1) /* ds-allow — the caret settles as the wordmark dot */ 9.5s forwards; }

  /* ── Notes 1–3: each is TYPED character by character — the reveal and the
     riding caret both advance in stepped increments (steps() = one keystroke
     at a time, a hand at a keyboard), not a smooth wipe. Step count ≈ the
     note's character count; then the note logs (its row grows in; count ticks) ── */
  .ntb-tw-1 { animation: ntb-fade 0.2s linear 1.1s forwards, ntb-out 0.25s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 2.3s forwards; }
  .ntb-tw-1 .ntb-typed { clip-path: inset(0 100% 0 0); animation: ntb-type 1.05s steps(42, end) 1.2s forwards; }
  .ntb-tw-1 .ntb-caret-type { left: 0; animation: ntb-fade 0.01s linear 1.2s forwards, ntb-ride 1.05s steps(42, end) 1.2s forwards, ntb-out 0.15s linear 2.25s forwards; }

  .ntb-tw-2 { animation: ntb-fade 0.2s linear 2.5s forwards, ntb-out 0.25s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 3.9s forwards; }
  .ntb-tw-2 .ntb-typed { clip-path: inset(0 100% 0 0); animation: ntb-type 1.28s steps(45, end) 2.6s forwards; }
  .ntb-tw-2 .ntb-caret-type { left: 0; animation: ntb-fade 0.01s linear 2.6s forwards, ntb-ride 1.28s steps(45, end) 2.6s forwards, ntb-out 0.15s linear 3.88s forwards; }

  .ntb-tw-3 { animation: ntb-fade 0.2s linear 4.15s forwards, ntb-out 0.18s linear 5.3s forwards; }
  .ntb-tw-3 .ntb-typed { clip-path: inset(0 100% 0 0); animation: ntb-type 1.0s steps(40, end) 4.25s forwards; }
  .ntb-tw-3 .ntb-caret-type { left: 0; animation: ntb-fade 0.01s linear 4.25s forwards, ntb-ride 1.0s steps(40, end) 4.25s forwards, ntb-out 0.15s linear 5.25s forwards; }

  /* rows grow into the stream as each note logs */
  .ntb-row--n1     { animation: ntb-grow 0.55s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 2.3s both; }
  .ntb-row--source { animation: ntb-grow 0.55s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 3.9s both,
                                ntb-source-pulse 0.9s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 6.6s forwards; }
  .ntb-row--n3     { animation: ntb-grow 0.55s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 5.3s both; }
  .ntb-row--source .ntb-row-title { animation: ntb-peel 0.5s var(--ease-in-out, cubic-bezier(0.77,0,0.175,1)) 6.6s both; }

  /* the count ticks 0 → 1 → 2 → 3 as notes log */
  .ntb-count-0 { opacity: 1; animation: ntb-out 0.3s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 2.3s forwards; }
  .ntb-count-1 { animation: ntb-fade 0.3s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 2.35s forwards, ntb-out 0.3s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 3.9s forwards; }
  .ntb-count-2 { animation: ntb-fade 0.3s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 3.95s forwards, ntb-out 0.3s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 5.3s forwards; }
  .ntb-count-3 { opacity: 0; animation: ntb-fade 0.3s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 5.35s forwards; }

  /* ── Promote: the user approves the marquee note, then it crosses (~6.5s) ── */
  .ntb-approve { animation: ntb-tap 0.5s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 6.5s both; }
  /* the indigo edge marker is held back until approval — during Act 1 the note
     sits unflagged like any other, so nothing telegraphs the choice */
  .ntb-row--source::before { opacity: 0; animation: ntb-fade 0.5s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 6.55s forwards; }
  .ntb-row-dot { transform: scale(0); animation: ntb-pop 0.55s cubic-bezier(0.34,1.56,0.64,1) /* ds-allow — spring overshoot for the crossed-dot arrival */ 6.95s forwards; }
  .ntb-row-crossed-label { opacity: 0; animation: ntb-fade 0.4s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 7.6s forwards; }
  /* privacy shown, not just said: the "private" tag catches the eye as
     "The rest stays private" reads (cap-3), then settles back to rest */
  .ntb-streamhead-kind { animation: ntb-privacy 1.0s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 7.9s; }
  .ntb-edge::after { animation: ntb-gate 0.34s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 7.0s both; }
  .ntb-edge-arrow { animation: ntb-arrow-pass 0.4s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 6.98s both; }
  .ntb-chip { will-change: transform, opacity; animation: ntb-cross 0.5s linear 6.9s forwards; }
  .ntb-task.is-arrived {
    opacity: 0; transform: translateY(5px) scale(0.985);
    animation: ntb-task-land 0.32s cubic-bezier(0.2,1.15,0.4,1) /* ds-allow — crisp snap as the swipe lands */ 7.28s forwards;
  }
  .ntb-check--committed { transform: scale(0.4); animation: ntb-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) /* ds-allow — the committed checkbox snaps in as the extract lands */ 7.52s forwards; }

  @keyframes ntb-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes ntb-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes ntb-fade { to { opacity: 1; } }
  @keyframes ntb-out { to { opacity: 0; } }
  @keyframes ntb-type { to { clip-path: inset(0 0 0 0); } }
  @keyframes ntb-ride { to { left: 100%; } }
  @keyframes ntb-blink { 0%,53% { opacity: 1; } 53.01%,100% { opacity: 0; } }
  /* row collapse via grid-template-rows 0fr→1fr — ends exactly at natural
     height (== rest), no magic max-height; padding rides on .ntb-row-inner */
  @keyframes ntb-grow {
    0%   { grid-template-rows: 0fr; opacity: 0;
           border-bottom-color: transparent; background: color-mix(in srgb, var(--ntb-accent) 10%, transparent); }
    70%  { opacity: 1; }
    100% { grid-template-rows: 1fr; opacity: 1;
           border-bottom-color: var(--ntb-line-soft); background: transparent; }
  }
  @keyframes ntb-tap { 0% { transform: scale(0.3); opacity: 0; } 28% { opacity: 0.5; } 100% { transform: scale(1.9); opacity: 0; } }
  @keyframes ntb-privacy { 0%,100% { color: var(--ntb-faint); } 40% { color: var(--ntb-accent); } }
  @keyframes ntb-source-pulse {
    0%   { box-shadow: inset 2px 0 0 color-mix(in srgb, var(--ntb-accent) 40%, transparent); background: transparent; }
    40%  { box-shadow: inset 2px 0 0 var(--ntb-accent); background: color-mix(in srgb, var(--ntb-accent) 9%, transparent); }
    100% { box-shadow: inset 2px 0 0 color-mix(in srgb, var(--ntb-accent) 40%, transparent); background: transparent; }
  }
  @keyframes ntb-peel { 0% { transform: translateY(0); } 40% { transform: translateY(-2px); } 100% { transform: translateY(0); } }
  @keyframes ntb-pop { to { transform: scale(1); } }
  @keyframes ntb-gate { 0%,100% { opacity: 0; } 45% { opacity: 0.9; } }
  @keyframes ntb-arrow-pass { 0% { transform: translateX(0); } 45% { transform: translateX(7px); } 100% { transform: translateX(0); } }
  @keyframes ntb-task-land { to { opacity: 1; transform: translateY(0) scale(1); } }
  @keyframes ntb-signoff-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  /* a sharp one-way swipe: the extract is released with momentum and flicked
     across the edge (front-loaded distance = explosive launch, then a crisp
     settle), a brief horizontal smear + slight tilt reading as velocity. Not a
     lob — a decisive one-way commit. Linear timing; the curve is in the stops. */
  @keyframes ntb-cross {
    0%   { opacity: 0; transform: translate3d(27cqw, calc(-50% + 41px), 0) rotate(0deg) scaleX(1); }
    8%   { opacity: 1; transform: translate3d(41cqw, calc(-50% + 47px), 0) rotate(-1.5deg) scaleX(1.1); }
    40%  { opacity: 1; transform: translate3d(67cqw, calc(-50% + 63px), 0) rotate(-0.8deg) scaleX(1.04); }
    72%  { opacity: 1; transform: translate3d(75cqw, calc(-50% + 71px), 0) rotate(-0.2deg) scaleX(1); }
    100% { opacity: 0; transform: translate3d(76cqw, calc(-50% + 71px), 0) rotate(0deg) scaleX(1); }
  }
}

/* ── Responsive: stack notebook over tasks, edge turns downward ── */
@media (max-width: 860px) {
  .ntb-stage { grid-template-columns: 1fr; gap: 12px; }
  .ntb-edge { flex-direction: row; gap: 10px; }
  .ntb-edge::before, .ntb-edge::after { display: none; }
  .ntb-tasks { align-self: stretch; margin-top: 0; }
  .ntb-cross-layer { display: none; }
}
@media (max-width: 640px) {
  .ntb { min-height: 92svh; padding: 40px 16px; }
}
`;
