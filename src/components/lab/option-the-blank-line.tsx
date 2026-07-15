/**
 * Direction N2 — "The Blank Line" (minimal counterpoint; slug `the-blank-line`).
 *
 * The thesis: the blank page isn't empty, it's ready. The whole hero has been
 * one caret the entire time — and the caret IS the product.
 *
 * Shape (Signal Hero Playbook), composed Swiss / minimal:
 *   OVERTURE — a single indigo caret blinks dead-centre on a near-blank page.
 *     Three lines type themselves out of that one caret, one at a time (the
 *     caret leads each):
 *       1. "Every idea starts on a blank line."
 *       2. "Most tools make you file it first."
 *       3. "Notes just lets you write."   — seed word = "write".
 *   TRANSMUTATION — the centred caret drops onto the word "write" and a capture
 *     field materialises around it. The blank line becomes the notebook; the
 *     caret was the product all along.
 *   MECHANISM — three thoughts captured in quick succession; the stream fills.
 *   REST — a settled notebook + a small stream + the notes. caret wordmark,
 *     more whitespace than the flagship, one honest line, one CTA.
 *
 * Pure CSS, zero JS, default-is-rest. DEFAULT styles render the SETTLED artifact
 * so SSR / no-JS / reduced-motion paint the finished frame. Overture defaults to
 * display:none. ALL intro motion is inside `@media (prefers-reduced-motion:
 * no-preference)`. Only the resting caret blink loops (the Notes gesture).
 * Scoped prefix `tbl-`. No project imports except React.
 */

type Note = { text: string; time: string };

const STREAM: Note[] = [
  { text: "The tasting note about the second red", time: "10:14" },
  { text: "Call back the celebrant before Thursday", time: "9:37" },
];

export function OptionTheBlankLine() {
  return (
    <section className="tbl" aria-label="Notes hero — The Blank Line">
      <style>{CSS}</style>

      <div className="tbl-wrap">
        {/* The overture — one caret, three self-typed lines. Decorative,
            aria-hidden, default display:none; shown only in motion. */}
        <div className="tbl-overture" aria-hidden>
          <span className="tbl-ov-caret" />
          <p className="tbl-ov tbl-ov-1">Every idea starts on a blank line.</p>
          <p className="tbl-ov tbl-ov-2">Most tools make you file it first.</p>
          <p className="tbl-ov tbl-ov-3">
            Notes just lets you <span className="tbl-seed">write</span>.
          </p>
        </div>

        {/* The settled artifact remains semantic so its CTA is never nested
            inside a composite image role. */}
        <div className="tbl-artifact">
          <p className="tbl-kicker">Signal Notes</p>

          <h1 className="tbl-headline">
            The blank line is ready<span className="tbl-dot" aria-hidden />
          </h1>

          {/* The capture field — the caret, now framed by the notebook. */}
          <div className="tbl-capture">
            <span className="tbl-capture-caret" aria-hidden />
            <span className="tbl-capture-hint">Write</span>
          </div>

          {/* A small stream — kept minimal, more whitespace. */}
          <ol className="tbl-stream">
            {STREAM.map((n, i) => (
              <li
                key={n.text}
                className="tbl-item"
                style={{ ["--i" as string]: i }}
              >
                <span className="tbl-item-text">{n.text}</span>
                <span className="tbl-item-time">{n.time}</span>
              </li>
            ))}
          </ol>

          <div className="tbl-foot">
            <p className="tbl-honest">Three seconds from thought to written.</p>
            <div className="tbl-foot-row">
              <span className="tbl-wordmark" aria-hidden>
                notes<span className="tbl-wordmark-caret" />
              </span>
              <a className="tbl-cta" href="/">
                Start a notebook
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const CSS = `
.tbl{
  position:relative;overflow:hidden;
  min-height:92svh;display:flex;align-items:center;
  background:var(--paper);color:var(--ink);
  font-family:var(--font-sans);
  -webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;
}
.tbl *{box-sizing:border-box;}

.tbl-wrap{
  position:relative;width:min(640px,100%);margin:0 auto;
  padding:clamp(64px,11vh,140px) 28px clamp(56px,9vh,104px);
}

/* ── Overture — default hidden; one caret, lines type out of it ── */
.tbl-overture{
  display:none;
  position:absolute;inset:0;z-index:3;
  place-items:center;padding:0 clamp(20px,6vw,64px);
  pointer-events:none;
}
.tbl-ov-caret{
  grid-column:1;grid-row:1;
  width:2px;height:clamp(30px,4.4vw,46px);border-radius:1px;background:var(--accent);
  opacity:0;justify-self:center;
}
.tbl-ov{
  grid-column:1;grid-row:1;margin:0;max-width:22ch;text-align:center;
  text-wrap:balance;
  font-size:clamp(26px,4.2vw,46px);font-weight:600;line-height:1.08;
  letter-spacing:-0.035em;color:var(--ink-soft);opacity:0;
  /* the typed-out lines are clipped from the left, revealed left→right */
  clip-path:inset(0 100% 0 0);
}
.tbl-seed{color:var(--ink);font-weight:640;}

/* ── The settled artifact (DEFAULT = rest) ── */
.tbl-artifact{position:relative;z-index:1;}

.tbl-kicker{
  margin:0 0 clamp(24px,5vh,44px);
  font-family:var(--font-mono);font-size:11px;letter-spacing:.18em;
  text-transform:uppercase;color:var(--ink-faint);
}
.tbl-headline{
  margin:0 0 clamp(32px,6vh,52px);
  font-size:clamp(2.1rem,1.3rem+3vw,3.6rem);font-weight:600;
  letter-spacing:-0.045em;line-height:1;color:var(--ink);text-wrap:balance;
  max-width:14ch;
}
.tbl-dot{
  display:inline-block;width:0.13em;height:0.13em;min-width:8px;min-height:8px;
  max-width:12px;max-height:12px;margin-left:0.06em;border-radius:50%;
  background:var(--accent);vertical-align:baseline;
}

.tbl-capture{
  display:flex;align-items:center;gap:10px;
  padding:18px 20px;margin:0 0 clamp(28px,5vh,44px);
  border:1px solid var(--hairline);border-radius:8px;background:var(--paper);
}
.tbl-capture-caret{
  flex:0 0 auto;width:2px;height:22px;border-radius:1px;background:var(--accent);
  animation:tbl-blink 1.05s steps(1,end) infinite;
}
.tbl-capture-hint{font-size:15px;letter-spacing:-0.005em;color:var(--ink-faint);}

/* Minimal stream — quieter, more air. */
.tbl-stream{
  list-style:none;margin:0 0 clamp(36px,6vh,60px);padding:0;
}
.tbl-item{
  display:flex;align-items:baseline;gap:16px;
  padding:15px 2px;border-bottom:1px solid var(--hairline-soft);
}
.tbl-item:first-child{border-top:1px solid var(--hairline-soft);}
.tbl-item-text{
  flex:1;font-size:clamp(15px,.5rem+.6vw,17px);font-weight:500;
  letter-spacing:-0.01em;line-height:1.35;color:var(--ink-soft);
}
.tbl-item-time{
  flex:0 0 auto;font-family:var(--font-mono);font-size:11px;letter-spacing:.03em;
  color:var(--ink-faint);font-variant-numeric:tabular-nums;white-space:nowrap;
}

.tbl-foot{display:flex;flex-direction:column;gap:24px;}
.tbl-honest{
  margin:0;font-size:clamp(15px,.6rem+.5vw,17px);line-height:1.5;
  color:var(--ink-soft);max-width:40ch;
}
.tbl-foot-row{display:flex;align-items:center;gap:24px;flex-wrap:wrap;}
.tbl-wordmark{
  display:inline-flex;align-items:baseline;
  font-size:19px;font-weight:600;letter-spacing:-0.03em;color:var(--ink);
}
.tbl-wordmark-caret{
  width:2px;height:0.86em;margin-left:1px;align-self:center;border-radius:1px;
  background:var(--accent);
  animation:tbl-blink 1.05s steps(1,end) infinite;
}
.tbl-cta{
  display:inline-flex;align-items:center;padding:10px 18px;
  background:var(--ink);color:var(--paper);border:1px solid var(--ink);
  border-radius:6px;font-size:14px;font-weight:540;letter-spacing:-0.005em;
  text-decoration:none;transition:opacity var(--motion-fast) var(--ease-out);
}
.tbl-cta:hover{opacity:.86;}

@media (max-width:720px){
  .tbl-wrap{padding:clamp(52px,8vh,96px) 20px 64px;}
  .tbl-foot-row{gap:16px;}
}

/* ─────────────────────────────────────────────────────────────
   INTRO — motion-safe only. Default above IS the rest state.
   One caret blinks centre; three lines type out of it; the caret
   drops on "write" and the capture field materialises around it.
   Plays once, then rest forever.
   ───────────────────────────────────────────────────────────── */
@media (prefers-reduced-motion:no-preference){
  .tbl-overture{display:grid;animation:tbl-ov-clear .5s var(--ease-out) 5.35s both;}

  /* the single caret: blinks in, holds through the lines, then drops away */
  .tbl-ov-caret{
    animation:
      tbl-caret-appear .3s var(--ease-out) .2s both,
      tbl-caret-blink 1.05s steps(1,end) .5s 4 both,
      tbl-caret-drop .5s var(--ease-out) 4.9s forwards;
  }
  /* each line types out (clip-path wipe L→R) then holds, then clears */
  .tbl-ov-1{animation:tbl-type 1.7s var(--ease-in-out) .55s both;}
  .tbl-ov-2{animation:tbl-type 1.7s var(--ease-in-out) 2.35s both;}
  /* line 3 types and holds (carried out by the caret drop + layer clear) */
  .tbl-ov-3{animation:tbl-type-hold 1.1s var(--ease-in-out) 4.15s both;}

  /* the artifact starts hidden and reveals after the overture hands off */
  .tbl-artifact{opacity:0;animation:tbl-fade .5s var(--ease-out) 5.45s both;}
  .tbl-kicker{opacity:0;animation:tbl-rise .6s var(--ease-out) 5.5s both;}
  .tbl-headline{opacity:0;animation:tbl-rise .7s var(--ease-out) 5.6s both;}
  /* the capture field materialises — the blank line becoming the notebook */
  .tbl-capture{opacity:0;transform:scale(.98);
    animation:tbl-materialise .6s var(--ease-out) 5.75s both;}
  .tbl-item{
    opacity:0;
    animation:tbl-catch-in .55s var(--ease-out) both;
    animation-delay:calc(6.05s + var(--i) * .28s);
  }
  .tbl-foot{opacity:0;animation:tbl-rise .6s var(--ease-out) 6.8s both;}

  @keyframes tbl-caret-appear{from{opacity:0;transform:scaleY(.4);}to{opacity:1;transform:scaleY(1);}}
  @keyframes tbl-caret-blink{0%,50%{opacity:1;}50.01%,100%{opacity:0;}}
  @keyframes tbl-caret-drop{
    0%{opacity:1;transform:translateY(0);}
    100%{opacity:0;transform:translateY(14px);}
  }
  @keyframes tbl-type{
    0%{opacity:0;clip-path:inset(0 100% 0 0);}
    8%{opacity:1;}
    38%{opacity:1;clip-path:inset(0 0 0 0);}
    82%{opacity:1;clip-path:inset(0 0 0 0);}
    100%{opacity:0;clip-path:inset(0 0 0 0);}
  }
  @keyframes tbl-type-hold{
    0%{opacity:0;clip-path:inset(0 100% 0 0);}
    12%{opacity:1;}
    64%{opacity:1;clip-path:inset(0 0 0 0);}
    100%{opacity:1;clip-path:inset(0 0 0 0);}
  }
  @keyframes tbl-ov-clear{from{opacity:1;}to{opacity:0;}}
  @keyframes tbl-fade{from{opacity:0;}to{opacity:1;}}
  @keyframes tbl-rise{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:none;}}
  @keyframes tbl-materialise{
    0%{opacity:0;transform:scale(.98) translateY(8px);}
    100%{opacity:1;transform:scale(1) translateY(0);}
  }
  @keyframes tbl-catch-in{
    0%{opacity:0;transform:translateY(-8px);}
    100%{opacity:1;transform:none;}
  }
}

@keyframes tbl-blink{0%,50%{opacity:1;}50.01%,100%{opacity:0;}}
`;
