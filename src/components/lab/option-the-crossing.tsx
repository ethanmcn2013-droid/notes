/**
 * Option ntw — The Crossing (wildcard).
 *
 * Dramatizes the one move no other capture tool has (PRODUCT.md §3, §6):
 * a private note, approved by you, crossing ONE WAY into Signal Tasks.
 * The raw note stays private; only the chosen extract travels; the indigo
 * approved-dot is left behind on the note. Bold, but dead on-truth.
 *
 * SSR-safe: the settled composition — note with its approved dot on the
 * left, the task arrived on the right — is the default CSS. The extract's
 * glide across the divider runs once on mount, motion-safe only. No JS.
 */
export function OptionTheCrossing() {
  return (
    <section className="ntw" aria-label="Notes hero — The Crossing">
      <style>{CSS}</style>

      <div className="ntw-frame">
        <header className="ntw-head">
          <p className="ntw-kicker">Signal Notes · the one-way edge</p>
          <h1 className="ntw-headline">
            Decide what becomes work<span className="ntw-dot" aria-hidden />
          </h1>
          <p className="ntw-lede">
            A note is private until you say otherwise. Approve one line and it
            crosses into Signal Tasks. The note stays where it is. Nothing goes
            the other way.
          </p>
        </header>

        <div className="ntw-diagram" aria-hidden>
          {/* LEFT — the private note */}
          <article className="ntw-note">
            <div className="ntw-card-top">
              <span className="ntw-card-tag">notes<span className="ntw-tag-dot" /></span>
              <span className="ntw-card-kind">private</span>
            </div>
            <p className="ntw-note-title">Kickoff call, client asks</p>
            <p className="ntw-note-line">Wants the deck by Thursday.</p>
            <p className="ntw-note-line ntw-note-extract">
              Send the revised florals quote.
            </p>
            <p className="ntw-note-line">Pink, not red. Confirmed.</p>
            <div className="ntw-note-foot">
              <span className="ntw-approved">
                <span className="ntw-approved-dot" /> crossed into Tasks
              </span>
            </div>
          </article>

          {/* BRIDGE — the one-way edge */}
          <div className="ntw-bridge">
            <span className="ntw-bridge-label">one way</span>
            <span className="ntw-bridge-arrow" aria-hidden>
              &rarr;
            </span>
          </div>

          {/* RIGHT — the committed task */}
          <article className="ntw-task">
            <div className="ntw-card-top">
              <span className="ntw-card-tag ntw-card-tag--tasks">tasks</span>
              <span className="ntw-card-kind">committed</span>
            </div>
            <div className="ntw-task-row">
              <span className="ntw-check" />
              <span className="ntw-task-title">Send the revised florals quote</span>
            </div>
            <div className="ntw-task-meta">
              <span>Due Thursday</span>
              <span className="ntw-task-sep">·</span>
              <span>from a note</span>
            </div>
          </article>

          {/* The travelling extract — invisible at rest, glides on mount */}
          <span className="ntw-chip">Send the revised florals quote.</span>
        </div>
      </div>
    </section>
  );
}

const CSS = `
.ntw {
  --ntw-ink: var(--ink);
  --ntw-soft: var(--ink-soft);
  --ntw-faint: var(--ink-faint);
  --ntw-accent: var(--accent);
  --ntw-paper: var(--paper);
  --ntw-soft-bg: var(--paper-soft);
  --ntw-field: var(--paper-deep);
  --ntw-line: var(--hairline, rgba(17,17,17,0.10));
  --ntw-line-soft: var(--hairline-soft, rgba(17,17,17,0.06));
  --ntw-tint: var(--accent-soft, rgba(79,70,229,0.12));
  --ntw-sans: var(--font-geist-sans), "Geist", system-ui, sans-serif;
  --ntw-mono: var(--font-geist-mono), "Geist Mono", ui-monospace, monospace;

  position: relative; overflow: hidden;
  min-height: clamp(600px, 88svh, 940px);
  display: flex; align-items: center; justify-content: center;
  padding: clamp(48px, 8svh, 104px) 24px;
  background: var(--ntw-paper);
  font-family: var(--ntw-sans); color: var(--ntw-ink);
}

.ntw-frame { width: min(960px, 100%); }

.ntw-head { max-width: 640px; margin: 0 auto clamp(40px, 6vh, 68px); text-align: center; }
.ntw-kicker {
  margin: 0 0 20px; font-family: var(--ntw-mono); font-size: 11px;
  letter-spacing: 0.16em; text-transform: uppercase; color: var(--ntw-faint);
}
.ntw-headline {
  margin: 0; font-size: clamp(2rem, 1.4rem + 2.8vw, 3.6rem);
  font-weight: 600; letter-spacing: -0.04em; line-height: 1.02;
}
.ntw-dot {
  display: inline-block; width: 0.13em; height: 0.13em; min-width: 8px; min-height: 8px;
  max-width: 12px; max-height: 12px; margin-left: 0.04em;
  border-radius: 50%; background: var(--ntw-accent); vertical-align: baseline;
}
.ntw-lede {
  margin: 20px auto 0; max-width: 52ch;
  font-size: 16.5px; line-height: 1.6; color: var(--ntw-soft);
}

/* ── Diagram ── */
.ntw-diagram {
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center; gap: clamp(14px, 3vw, 40px);
}

.ntw-note, .ntw-task {
  border: 1px solid var(--ntw-line); border-radius: 12px;
  padding: 18px 20px; background: var(--ntw-paper);
  box-shadow: 0 22px 60px -44px rgba(17,17,17,0.4);
}
.ntw-task { background: var(--ntw-soft-bg); }

.ntw-card-top {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px;
}
.ntw-card-tag {
  display: inline-flex; align-items: baseline; gap: 1px;
  font-weight: 500; font-size: 14px; letter-spacing: -0.03em; color: var(--ntw-ink);
}
.ntw-tag-dot {
  width: 4px; height: 4px; border-radius: 50%; background: var(--ntw-accent);
  display: inline-block; align-self: center; margin-left: 1px;
}
.ntw-card-tag--tasks { color: var(--ntw-soft); }
.ntw-card-kind {
  font-family: var(--ntw-mono); font-size: 10px; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--ntw-faint);
}

.ntw-note-title { margin: 0 0 8px; font-size: 15px; font-weight: 600; letter-spacing: -0.01em; }
.ntw-note-line {
  margin: 0; padding: 5px 0; font-size: 13.5px; line-height: 1.4; color: var(--ntw-soft);
}
.ntw-note-extract {
  padding-left: 12px; margin: 4px 0;
  border-left: 2px solid var(--ntw-accent);
  background: color-mix(in srgb, var(--ntw-accent) 5%, transparent);
  color: var(--ntw-ink); font-weight: 500;
}
.ntw-note-foot { margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--ntw-line-soft); }
.ntw-approved {
  display: inline-flex; align-items: center; gap: 7px;
  font-family: var(--ntw-mono); font-size: 10.5px; letter-spacing: 0.06em;
  text-transform: uppercase; color: var(--ntw-faint);
}
.ntw-approved-dot {
  width: 6px; height: 6px; border-radius: 50%; background: var(--ntw-accent);
  display: inline-block; flex: 0 0 auto;
}

/* Bridge */
.ntw-bridge {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  color: var(--ntw-faint);
}
.ntw-bridge-label {
  font-family: var(--ntw-mono); font-size: 10px; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--ntw-faint);
}
.ntw-bridge-arrow { font-size: 20px; color: var(--ntw-accent); line-height: 1; }

/* Task */
.ntw-task-row { display: flex; align-items: flex-start; gap: 11px; }
.ntw-check {
  flex: 0 0 auto; width: 16px; height: 16px; margin-top: 1px;
  border: 1.5px solid var(--ntw-accent); border-radius: 5px;
  background: color-mix(in srgb, var(--ntw-accent) 8%, transparent);
}
.ntw-task-title { font-size: 15px; font-weight: 560; letter-spacing: -0.01em; line-height: 1.35; }
.ntw-task-meta {
  display: flex; align-items: center; gap: 7px; margin: 14px 0 0; padding-left: 27px;
  font-size: 12px; color: var(--ntw-faint);
}
.ntw-task-sep { opacity: 0.6; }

/* Travelling extract — invisible at rest */
.ntw-chip {
  position: absolute; top: 50%; left: 26%;
  transform: translate(-50%, -50%);
  padding: 7px 12px; border-radius: 8px;
  background: var(--ntw-paper);
  border: 1px solid var(--ntw-accent);
  box-shadow: 0 14px 34px -18px var(--ntw-accent);
  font-size: 12.5px; font-weight: 500; color: var(--ntw-ink);
  white-space: nowrap; opacity: 0; pointer-events: none;
}

/* ─────────────────────────────────────────────────────────────
   INTRO — motion-safe only. Cards enter; the extract chip lifts off
   the note, glides across the one-way edge, and lands as the task.
   The approved dot on the note and the task card resolve on arrival.
   ───────────────────────────────────────────────────────────── */
@media (prefers-reduced-motion: no-preference) {
  .ntw-kicker   { animation: ntw-up 0.6s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) both; }
  .ntw-headline { opacity: 0; animation: ntw-up 0.7s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 0.1s forwards; }
  .ntw-lede     { opacity: 0; animation: ntw-up 0.7s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 0.26s forwards; }
  .ntw-note     { opacity: 0; animation: ntw-in 0.7s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 0.5s forwards; }
  .ntw-bridge   { opacity: 0; animation: ntw-fade 0.6s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 1.3s forwards; }

  /* task + note-dot resolve as the chip lands (~2.5s) */
  .ntw-task { opacity: 0; transform: translateY(8px);
    animation: ntw-in 0.6s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 2.45s forwards; }
  .ntw-approved-dot { transform: scale(0);
    animation: ntw-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) /* ds-allow — spring overshoot for the approved-dot pop */ 2.5s forwards; }
  .ntw-approved { opacity: 0; animation: ntw-fade 0.5s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 2.5s forwards; }

  /* the chip glides left → right across the divider */
  .ntw-chip {
    animation: ntw-cross 1.35s var(--ease-in-out, cubic-bezier(0.77,0,0.175,1)) 1.5s forwards;
  }

  @keyframes ntw-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes ntw-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes ntw-fade { to { opacity: 1; } }
  @keyframes ntw-pop { to { transform: scale(1); } }
  @keyframes ntw-cross {
    0%   { opacity: 0; left: 26%; transform: translate(-50%, -50%) scale(0.96); }
    18%  { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    82%  { opacity: 1; }
    100% { opacity: 0; left: 74%; transform: translate(-50%, -50%) scale(0.98); }
  }
}

/* Stack on narrow screens — no horizontal chip travel, cards read top-down */
@media (max-width: 720px) {
  .ntw-diagram { grid-template-columns: 1fr; gap: 12px; }
  .ntw-bridge { flex-direction: row; gap: 10px; }
  .ntw-bridge-arrow { transform: rotate(90deg); }
  .ntw-chip { display: none; }
}
@media (max-width: 640px) {
  .ntw { min-height: 84svh; padding: 44px 18px; }
}
`;
