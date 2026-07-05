/**
 * Option nt3 — Three Seconds.
 *
 * The locked design budget (PRODUCT.md §3, §9) as the whole story: from
 * "I need to write this down" to written, under three seconds. A calm
 * editorial headline, a hairline capture-time track with an indigo marker
 * that lands well inside the budget, and the notes. wordmark as anchor.
 *
 * SSR-safe: the marker's settled position (inside the budget) and the
 * proof flag are the default CSS. The marker's travel and the flag's
 * arrival run once on mount, motion-safe only. No JS.
 */
export function OptionThreeSeconds() {
  return (
    <section className="nt3" aria-label="Notes hero — Three Seconds">
      <style>{CSS}</style>

      <div className="nt3-frame">
        <p className="nt3-kicker">Signal Notes · the promise</p>

        <h1 className="nt3-headline">
          Three seconds from thought to&nbsp;written.
        </h1>

        <p className="nt3-lede">
          Open the notebook, write it down, done. Findable later by search and
          recency. No folders, no fields, no friction on the thought.
        </p>

        {/* The capture-time track: 0 → 3s, marker lands inside the budget */}
        <div className="nt3-track" aria-hidden>
          <div className="nt3-fill">
            <div className="nt3-marker">
              <span className="nt3-flag">captured</span>
            </div>
          </div>
          <span className="nt3-tick" style={{ ["--p" as string]: "0%" }}>
            0
          </span>
          <span className="nt3-tick" style={{ ["--p" as string]: "33.33%" }}>
            1s
          </span>
          <span className="nt3-tick" style={{ ["--p" as string]: "66.66%" }}>
            2s
          </span>
          <span className="nt3-tick is-end" style={{ ["--p" as string]: "100%" }}>
            3s
          </span>
        </div>

        <div className="nt3-mark">
          <span className="nt3-mark-word">notes</span>
          <span className="nt3-mark-dot" aria-hidden />
        </div>
      </div>
    </section>
  );
}

const CSS = `
.nt3 {
  --nt3-ink: var(--ink);
  --nt3-soft: var(--ink-soft);
  --nt3-faint: var(--ink-faint);
  --nt3-accent: var(--accent);
  --nt3-paper: var(--paper);
  --nt3-line: var(--hairline, rgba(17,17,17,0.10));
  --nt3-ghost: var(--ink-ghost);
  --nt3-sans: var(--font-geist-sans), "Geist", system-ui, sans-serif;
  --nt3-mono: var(--font-geist-mono), "Geist Mono", ui-monospace, monospace;
  --nt3-land: 78%; /* where capture lands on the 0→3s track */

  position: relative; overflow: hidden;
  min-height: clamp(560px, 86svh, 900px);
  display: flex; align-items: center;
  padding: clamp(48px, 9svh, 112px) clamp(24px, 7vw, 96px);
  background: var(--nt3-paper);
  font-family: var(--nt3-sans); color: var(--nt3-ink);
}

.nt3-frame { width: min(760px, 100%); }

.nt3-kicker {
  margin: 0 0 26px; font-family: var(--nt3-mono); font-size: 11px;
  letter-spacing: 0.16em; text-transform: uppercase; color: var(--nt3-faint);
}
.nt3-headline {
  margin: 0; max-width: 16ch;
  font-size: clamp(2.1rem, 1.5rem + 3vw, 4.1rem);
  font-weight: 600; letter-spacing: -0.04em; line-height: 1.0;
  color: var(--nt3-ink); text-wrap: balance;
}
.nt3-lede {
  margin: 26px 0 0; max-width: 48ch;
  font-size: 17px; line-height: 1.6; color: var(--nt3-soft);
}

/* ── Capture-time track ── */
.nt3-track {
  position: relative; margin: clamp(48px, 8vh, 84px) 0 0;
  height: 2px; width: 100%;
  background: linear-gradient(
    to right,
    var(--nt3-ghost) 0 66.66%,
    var(--nt3-line) 66.66% 100%
  );
}
.nt3-fill {
  position: absolute; left: 0; top: 0; height: 100%;
  width: var(--nt3-land);
  background: var(--nt3-accent);
}
.nt3-marker {
  position: absolute; right: 0; top: 50%;
  width: 9px; height: 9px; margin: -4.5px -4.5px 0 0;
  border-radius: 50%; background: var(--nt3-accent);
  box-shadow: 0 0 0 5px color-mix(in srgb, var(--nt3-accent) 12%, transparent);
}
.nt3-flag {
  position: absolute; left: 50%; bottom: calc(100% + 12px);
  transform: translateX(-50%);
  font-family: var(--nt3-mono); font-size: 11px; letter-spacing: 0.04em;
  text-transform: uppercase; color: var(--nt3-accent); white-space: nowrap;
}
.nt3-tick {
  position: absolute; top: calc(100% + 12px); left: var(--p);
  transform: translateX(-50%);
  font-family: var(--nt3-mono); font-size: 11px; letter-spacing: 0.04em;
  color: var(--nt3-faint);
}
.nt3-tick.is-end { color: var(--nt3-ghost); }

.nt3-mark {
  display: inline-flex; align-items: baseline; gap: 1px;
  margin: clamp(46px, 8vh, 84px) 0 0;
  font-family: var(--nt3-sans); font-weight: 500;
  font-size: 20px; letter-spacing: -0.03em; color: var(--nt3-ink);
}
.nt3-mark-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--nt3-accent); display: inline-block; margin-left: 1px;
  align-self: flex-end; margin-bottom: 3px;
}

/* ─────────────────────────────────────────────────────────────
   INTRO — motion-safe only. The marker travels 0 → land once; the
   proof flag arrives on landing. Everything else fades up calmly.
   ───────────────────────────────────────────────────────────── */
@media (prefers-reduced-motion: no-preference) {
  .nt3-kicker   { animation: nt3-up 0.6s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) both; }
  .nt3-headline { opacity: 0; animation: nt3-up 0.7s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 0.1s forwards; }
  .nt3-lede     { opacity: 0; animation: nt3-up 0.7s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 0.28s forwards; }
  .nt3-track    { opacity: 0; animation: nt3-fade 0.5s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 0.55s forwards; }

  .nt3-fill {
    width: 0;
    animation: nt3-travel 1.15s var(--ease-in-out, cubic-bezier(0.77,0,0.175,1)) 0.75s forwards;
  }
  .nt3-flag {
    opacity: 0; transform: translateX(-50%) translateY(4px);
    animation: nt3-flag-in 0.5s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 1.75s forwards;
  }
  .nt3-marker {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--nt3-accent) 30%, transparent);
    animation: nt3-ping 0.7s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 1.75s forwards;
  }
  .nt3-mark { opacity: 0; animation: nt3-up 0.7s var(--ease-out, cubic-bezier(0.23,1,0.32,1)) 2.0s forwards; }

  @keyframes nt3-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes nt3-fade { to { opacity: 1; } }
  @keyframes nt3-travel { to { width: var(--nt3-land); } }
  @keyframes nt3-flag-in { to { opacity: 1; transform: translateX(-50%) translateY(0); } }
  @keyframes nt3-ping {
    0%   { box-shadow: 0 0 0 0 color-mix(in srgb, var(--nt3-accent) 30%, transparent); }
    100% { box-shadow: 0 0 0 5px color-mix(in srgb, var(--nt3-accent) 12%, transparent); }
  }
}

@media (max-width: 640px) {
  .nt3 { min-height: 82svh; padding: 44px 20px; }
  .nt3-headline { max-width: none; }
}
`;
