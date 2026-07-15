/**
 * Notes demo, "capture, then promote."
 *
 * A single warm note writes itself line by line, then quietly crosses into
 * Tasks, the Signal Notes loop (capture fast, promote only when it's ready)
 * shown as one calm card. Every other product carries a homepage demo; this
 * is the Notes one, in the Notes register (review issue 07).
 *
 * SAFETY CONTRACT (loader canon §13):
 *   · Pure CSS animation on a single shared ~9s cycle, no JS, no timers.
 *   · Fully scoped, every class + @keyframes prefixed `nd-`.
 *   · In-flow only, no position:fixed, no inset:0, no high z-index.
 *   · prefers-reduced-motion → settled state (full note + "In Tasks"),
 *     no animation. The static state is legible on its own.
 */
export function NotesDemo() {
  return (
    <section className="nd-wrap" aria-label="How Signal Notes works">
      <div className="nd-card" aria-hidden>
        <div className="nd-head">
          <span className="nd-eyebrow">today &middot; 14:32</span>
          <span className="nd-meta">a held thought</span>
        </div>

        <div className="nd-body">
          <p className="nd-line nd-l1">Met the florist about the wedding.</p>
          <p className="nd-line nd-l2">Peonies might be out of season…</p>
          <p className="nd-line nd-l3">
            ask about ranunculus instead
            <span className="nd-caret" />
          </p>
        </div>

        <div className="nd-action">
          <span className="nd-pill">
            <span className="nd-check">
              <svg
                viewBox="0 0 14 14"
                width="11"
                height="11"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2.5 7.5 6 11l5.5-7" className="nd-check-path" />
              </svg>
            </span>
            In Tasks
          </span>
        </div>
      </div>

      <p className="nd-caption">
        Written in seconds. Promoted to a task only when it&rsquo;s ready.
      </p>

      <style>{CSS}</style>
    </section>
  );
}

const CSS = `
.nd-wrap {
  margin: 0 auto;
  max-width: 560px;
  --nd-cycle: 9s;
  --nd-paper: var(--color-paper, #ffffff);
  --nd-ink: var(--color-ink, #111111);
  --nd-ink-faint: var(--color-ink-faint, #71717a);
  --nd-line: var(--color-line, rgba(17,17,17,0.10));
  --nd-accent: var(--color-accent, #4f46e5);
  --nd-indigo: var(--color-signal, #4f46e5);
  --nd-mono: var(--font-geist-mono, ui-monospace, 'SF Mono', monospace);
}

.nd-card {
  border: 1px solid var(--nd-line);
  border-radius: 14px;
  background: var(--nd-paper);
  padding: 22px 24px 20px;
}

.nd-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.nd-eyebrow,
.nd-meta {
  font-family: var(--nd-mono);
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--nd-ink-faint);
}
.nd-meta { font-size: 10.5px; color: var(--color-ink-soft); opacity: 1; }

/* Reserve the body height so lines appearing never shift the card. */
.nd-body { min-height: 92px; }
.nd-line {
  margin: 0 0 5px;
  font-size: 17px;
  line-height: 1.5;
  letter-spacing: -0.01em;
  color: var(--nd-ink);
  opacity: 0;
  transform: translateY(6px);
}
.nd-l1 { animation: nd-l1 var(--nd-cycle) cubic-bezier(.22,.7,.2,1) infinite; }
.nd-l2 { animation: nd-l2 var(--nd-cycle) cubic-bezier(.22,.7,.2,1) infinite; }
.nd-l3 { animation: nd-l3 var(--nd-cycle) cubic-bezier(.22,.7,.2,1) infinite; }

@keyframes nd-l1 {
  0%, 3%   { opacity: 0; transform: translateY(6px); }
  9%, 90%  { opacity: 1; transform: none; }
  96%,100% { opacity: 0; transform: translateY(-2px); }
}
@keyframes nd-l2 {
  0%, 12%  { opacity: 0; transform: translateY(6px); }
  18%, 90% { opacity: 1; transform: none; }
  96%,100% { opacity: 0; transform: translateY(-2px); }
}
@keyframes nd-l3 {
  0%, 21%  { opacity: 0; transform: translateY(6px); }
  27%, 90% { opacity: 1; transform: none; }
  96%,100% { opacity: 0; transform: translateY(-2px); }
}

.nd-caret {
  display: inline-block;
  width: 2px;
  height: 1.05em;
  margin-left: 2px;
  vertical-align: -0.16em;
  background: var(--nd-indigo);
  animation: nd-caret-blink 1.06s steps(1, end) infinite;
}
@keyframes nd-caret-blink { 0%, 50% { opacity: 1; } 50.01%, 100% { opacity: 0; } }

.nd-action {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--nd-line);
}
.nd-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0.01em;
  color: var(--nd-accent);
  opacity: 0;
  transform: translateY(4px);
  animation: nd-pill var(--nd-cycle) cubic-bezier(.22,.7,.2,1) infinite;
}
@keyframes nd-pill {
  0%, 48%  { opacity: 0; transform: translateY(4px); }
  55%, 88% { opacity: 1; transform: none; }
  95%,100% { opacity: 0; transform: translateY(-2px); }
}
.nd-check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 19px;
  height: 19px;
  border-radius: 50%;
  border: 1px solid var(--nd-accent);
  color: var(--nd-accent);
}
.nd-check-path {
  stroke-dasharray: 16;
  stroke-dashoffset: 16;
  animation: nd-check var(--nd-cycle) cubic-bezier(.22,.7,.2,1) infinite;
}
@keyframes nd-check {
  0%, 52%   { stroke-dashoffset: 16; }
  61%, 100% { stroke-dashoffset: 0; }
}

.nd-caption {
  margin: 16px auto 0;
  max-width: 440px;
  text-align: center;
  font-size: 13px;
  line-height: 1.55;
  color: var(--nd-ink-faint);
}

@media (prefers-reduced-motion: reduce) {
  .nd-line { opacity: 1; transform: none; animation: none; }
  .nd-pill { opacity: 1; transform: none; animation: none; }
  .nd-check-path { stroke-dashoffset: 0; animation: none; }
  .nd-caret { animation: none; opacity: 1; }
}
`;
