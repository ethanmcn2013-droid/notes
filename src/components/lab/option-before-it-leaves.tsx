/**
 * Direction N1 — "Before It Leaves" (flagship; slug `before-it-leaves`).
 *
 * The thesis: a thought arrives, and it does not wait for you. The single
 * distinctive move is a caret that CATCHES it the instant before it is gone.
 * Loss reversed by capture.
 *
 * Shape (Signal Hero Playbook):
 *   OVERTURE (~0–4.6s) — three plain lines, one at a time, in the centre:
 *     1. "A thought arrives."
 *     2. "It doesn't wait for you."
 *     3. "Write it down before it's gone."  — seed word = "gone".
 *   TRANSMUTATION (~4.4–5.2s) — the word "gone" lifts and fades toward faint
 *     grey (leaving); an indigo caret blinks into being just left of it; the
 *     word snaps back to solid ink and drops onto a capture line. The near-loss
 *     is visibly reversed — the one delight, and it IS the thesis.
 *   MECHANISM (~5.2–7.6s) — the caught line files into a private stream as a
 *     timestamped note; two more thoughts are already caught below it.
 *   REST — a clean capture field with a live blinking caret (ready for you), a
 *     private stream of three real notes with mono timestamps, the notes.
 *     wordmark with the caret gesture, one honest line, and one CTA.
 *
 * Pure CSS, zero JS, default-is-rest. The DEFAULT styles render the SETTLED
 * artifact (real copy, caret, stream, wordmark), so SSR / no-JS / reduced-motion
 * all paint the finished frame. The overture layer defaults to display:none.
 * ALL intro motion lives inside `@media (prefers-reduced-motion: no-preference)`.
 * The only permitted infinite loop is the resting caret blink (the Notes
 * wordmark gesture). Scoped prefix `bil-`. No project imports except React.
 */

type Note = { text: string; time: string };

// Three real thoughts, newest-first (the stream fills top-down as they are caught).
const STREAM: Note[] = [
  { text: "Ask the venue about the earlier ceremony slot", time: "9:02" },
  { text: "Maeve’s case study angle: the refund week", time: "8:41" },
  { text: "Move rehearsal dinner if the shuttle can’t do 6pm", time: "yesterday" },
];

export function OptionBeforeItLeaves() {
  return (
    <section className="bil" aria-label="Notes hero — Before It Leaves">
      <style>{CSS}</style>

      <div className="bil-wrap">
        {/* The overture — the idea, spoken before the interface. Decorative and
            aria-hidden; the settled artifact below carries the same meaning for
            assistive tech and no-JS. Default display:none; shown only in motion. */}
        <div className="bil-overture" aria-hidden>
          <p className="bil-ov bil-ov-1">A thought arrives.</p>
          <p className="bil-ov bil-ov-2">It doesn’t wait for you.</p>
          <p className="bil-ov bil-ov-3">
            Write it down before it’s{" "}
            <span className="bil-seed">
              <span className="bil-caret-catch" aria-hidden />
              <span className="bil-seed-word">gone</span>
            </span>
            .
          </p>
        </div>

        {/* The settled artifact. role=img + a full aria-label describing the rest. */}
        <div
          className="bil-artifact"
          role="img"
          aria-label="Signal Notes. A capture field with a live caret, ready. A private stream of three notes with timestamps: ask the venue about the earlier ceremony slot, 9:02; Maeve's case study angle, the refund week, 8:41; move the rehearsal dinner if the shuttle can't do 6pm, yesterday. Nothing worth keeping gets lost."
        >
          <p className="bil-kicker">Signal Notes</p>

          <h1 className="bil-headline">
            Catch it before it leaves<span className="bil-dot" aria-hidden />
          </h1>

          {/* Capture field — the live line, waiting, with the blinking caret. */}
          <div className="bil-capture">
            <span className="bil-capture-caret" aria-hidden />
            <span className="bil-capture-hint">Write it down</span>
          </div>

          {/* The private stream — real notes, newest first, mono timestamps. */}
          <ol className="bil-stream">
            {STREAM.map((n, i) => (
              <li
                key={n.text}
                className="bil-item"
                style={{ ["--i" as string]: i }}
              >
                <span className="bil-item-mark" aria-hidden />
                <span className="bil-item-text">{n.text}</span>
                <span className="bil-item-time">{n.time}</span>
              </li>
            ))}
          </ol>

          {/* Honest line + wordmark + one CTA. */}
          <div className="bil-foot">
            <p className="bil-honest">Nothing worth keeping gets lost.</p>
            <div className="bil-foot-row">
              <span className="bil-wordmark" aria-hidden>
                notes<span className="bil-wordmark-caret" />
              </span>
              <a className="bil-cta" href="/">
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
.bil{
  --ink:#111;--soft:#3f3f46;--faint:#71717a;--accent:#4f46e5;--paper:#fff;
  --hair:rgba(17,17,17,.12);--hair-soft:rgba(17,17,17,.07);
  --sans:var(--font-geist-sans,"Geist",system-ui,sans-serif);
  --mono:var(--font-geist-mono,"Geist Mono",ui-monospace,monospace);
  /* Signal easing dialect */
  --ease-rack:cubic-bezier(0.22,0.61,0.18,1);
  --ease-soft:cubic-bezier(0.16,1,0.3,1);
  --ease-draw:cubic-bezier(0.22,0.61,0.36,1);
  --ease-pencil:cubic-bezier(0.7,0,0.3,1);

  position:relative;overflow:hidden;
  min-height:92svh;display:flex;align-items:center;
  background:var(--paper);color:var(--ink);
  font-family:var(--sans);
  -webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;
}
.bil *{box-sizing:border-box;}

.bil-wrap{
  position:relative;width:min(760px,100%);margin:0 auto;
  padding:clamp(56px,9vh,120px) 28px clamp(56px,8vh,96px);
}

/* ── Overture — default hidden; the idea spoken before the interface ── */
.bil-overture{
  display:none;
  position:absolute;inset:0;z-index:3;
  place-items:center;padding:0 clamp(20px,6vw,64px);
  pointer-events:none;
}
.bil-ov{
  grid-column:1;grid-row:1;margin:0;max-width:20ch;text-align:center;
  text-wrap:balance;
  font-size:clamp(28px,4.6vw,50px);font-weight:600;line-height:1.06;
  letter-spacing:-0.035em;color:var(--ink);opacity:0;
}
.bil-ov-3{color:var(--soft);}

/* The seed word "gone" — leaves, then is caught. */
.bil-seed{position:relative;display:inline-block;color:var(--ink);font-weight:640;}
.bil-seed-word{display:inline-block;}
/* The catching caret — indigo bar just left of the seed word. Hidden at rest. */
.bil-caret-catch{
  position:absolute;left:-0.14em;top:0.08em;bottom:0.06em;width:0.06em;
  border-radius:0.02em;background:var(--accent);
  transform:scaleY(0);transform-origin:center bottom;opacity:0;
}

/* ── The settled artifact (DEFAULT = rest) ── */
.bil-artifact{position:relative;z-index:1;}

.bil-kicker{
  margin:0 0 clamp(22px,4vh,40px);
  font-family:var(--mono);font-size:11px;letter-spacing:.18em;
  text-transform:uppercase;color:var(--faint);
}
.bil-headline{
  margin:0 0 clamp(28px,5vh,44px);
  font-size:clamp(2.1rem,1.3rem+3vw,3.7rem);font-weight:600;
  letter-spacing:-0.045em;line-height:1;color:var(--ink);text-wrap:balance;
  max-width:16ch;
}
.bil-dot{
  display:inline-block;width:0.13em;height:0.13em;min-width:8px;min-height:8px;
  max-width:12px;max-height:12px;margin-left:0.06em;border-radius:50%;
  background:var(--accent);vertical-align:baseline;
}

/* Capture field — the live line, ready, with the blinking caret. */
.bil-capture{
  display:flex;align-items:center;gap:10px;
  padding:16px 18px;margin:0 0 clamp(20px,3vh,30px);
  border:1px solid var(--hair);border-radius:8px;background:var(--paper);
}
.bil-capture-caret{
  flex:0 0 auto;width:2px;height:20px;border-radius:1px;background:var(--accent);
  /* the ONE allowed infinite loop: the resting caret gesture */
  animation:bil-blink 1.05s steps(1,end) infinite;
}
.bil-capture-hint{
  font-size:15px;letter-spacing:-0.005em;color:var(--faint);
}

/* The private stream. */
.bil-stream{
  list-style:none;margin:0 0 clamp(30px,5vh,52px);padding:0;
  border-top:1px solid var(--hair-soft);
}
.bil-item{
  position:relative;display:flex;align-items:baseline;gap:14px;
  padding:14px 6px 14px 18px;border-bottom:1px solid var(--hair-soft);
}
.bil-item-mark{
  position:absolute;left:2px;top:16px;bottom:16px;width:2px;border-radius:1px;
  background:var(--hair);
}
/* Newest note carries the one indigo — the freshest catch. */
.bil-item:first-child .bil-item-mark{background:var(--accent);}
.bil-item-text{
  flex:1;font-size:clamp(15px,.5rem+.7vw,18px);font-weight:500;
  letter-spacing:-0.01em;line-height:1.35;color:var(--ink);
}
.bil-item:not(:first-child) .bil-item-text{color:var(--soft);}
.bil-item-time{
  flex:0 0 auto;font-family:var(--mono);font-size:11px;letter-spacing:.03em;
  color:var(--faint);font-variant-numeric:tabular-nums;white-space:nowrap;
}

/* Foot — honest line, wordmark, CTA. */
.bil-foot{display:flex;flex-direction:column;gap:22px;}
.bil-honest{
  margin:0;font-size:clamp(15px,.6rem+.5vw,17px);line-height:1.5;
  color:var(--soft);max-width:40ch;
}
.bil-foot-row{display:flex;align-items:center;gap:24px;flex-wrap:wrap;}
.bil-wordmark{
  display:inline-flex;align-items:baseline;
  font-size:19px;font-weight:600;letter-spacing:-0.03em;color:var(--ink);
}
.bil-wordmark-caret{
  width:2px;height:0.86em;margin-left:1px;align-self:center;border-radius:1px;
  background:var(--accent);
  animation:bil-blink 1.05s steps(1,end) infinite;
}
.bil-cta{
  display:inline-flex;align-items:center;padding:10px 18px;
  background:var(--ink);color:var(--paper);border:1px solid var(--ink);
  border-radius:6px;font-size:14px;font-weight:540;letter-spacing:-0.005em;
  text-decoration:none;transition:opacity 160ms var(--ease-soft);
}
.bil-cta:hover{opacity:.86;}

/* ── Narrow collapse ── */
@media (max-width:720px){
  .bil-wrap{padding:clamp(48px,7vh,88px) 20px 64px;}
  .bil-item{gap:10px;padding-left:16px;}
  .bil-foot-row{gap:16px;}
}

/* ─────────────────────────────────────────────────────────────
   INTRO — motion-safe only. Default above IS the rest state.
   Overture speaks (3 lines), the seed word "gone" leaves and is
   caught by an indigo caret and snaps back to ink, then the
   artifact reveals beat by beat. Plays once, then rest forever.
   ───────────────────────────────────────────────────────────── */
@media (prefers-reduced-motion:no-preference){
  /* show + centre the overture layer while it plays */
  .bil-overture{display:grid;animation:bil-ov-clear .5s var(--ease-soft) 5.05s both;}

  .bil-ov-1{animation:bil-ov-inout 2.15s var(--ease-soft) .15s both;}
  .bil-ov-2{animation:bil-ov-inout 2.15s var(--ease-soft) 2.05s both;}
  /* line 3 sets and holds; carried out by the seed catch + the layer clear */
  .bil-ov-3{animation:bil-ov-in 1s var(--ease-soft) 3.7s both;}

  /* the seed word leaves (lifts + fades to faint), then snaps back to ink */
  .bil-seed-word{
    animation:bil-seed-catch 1.1s var(--ease-rack) 4.35s both;
  }
  /* the catching caret blinks into being just before the snap-back */
  .bil-caret-catch{
    animation:
      bil-caret-in .28s steps(1,end) 4.55s both,
      bil-caret-hold .4s var(--ease-rack) 4.8s forwards;
  }

  /* the artifact starts hidden and reveals after the overture hands off */
  .bil-artifact{opacity:0;animation:bil-fade .5s var(--ease-soft) 5.15s both;}
  .bil-kicker{opacity:0;animation:bil-rise .6s var(--ease-soft) 5.2s both;}
  .bil-headline{opacity:0;animation:bil-rise .7s var(--ease-rack) 5.3s both;}
  .bil-capture{opacity:0;animation:bil-rise .6s var(--ease-rack) 5.5s both;}
  /* the stream fills newest-first, beat by beat, as the thoughts are caught */
  .bil-item{
    opacity:0;
    animation:bil-catch-in .55s var(--ease-rack) both;
    animation-delay:calc(5.75s + var(--i) * .28s);
  }
  .bil-item .bil-item-mark{transform:scaleY(0);transform-origin:top center;
    animation:bil-mark-in .5s var(--ease-rack) both;
    animation-delay:calc(5.85s + var(--i) * .28s);}
  .bil-foot{opacity:0;animation:bil-rise .6s var(--ease-soft) 6.9s both;}

  @keyframes bil-ov-inout{
    0%{opacity:0;transform:translateY(12px);}
    16%{opacity:1;transform:translateY(0);}
    74%{opacity:1;transform:translateY(0);}
    100%{opacity:0;transform:translateY(-9px);}
  }
  @keyframes bil-ov-in{
    from{opacity:0;transform:translateY(12px);}
    to{opacity:1;transform:translateY(0);}
  }
  @keyframes bil-ov-clear{from{opacity:1;}to{opacity:0;}}
  /* the seed "gone": begins to lift + fade to faint (leaving), then the caret
     catches it and it snaps back to solid ink and settles down onto the line. */
  @keyframes bil-seed-catch{
    0%{color:var(--ink);transform:translateY(0);opacity:1;}
    38%{color:var(--faint);transform:translateY(-10px);opacity:.35;}
    56%{color:var(--faint);transform:translateY(-11px);opacity:.3;}
    74%{color:var(--ink);transform:translateY(2px);opacity:1;}
    100%{color:var(--ink);transform:translateY(0);opacity:1;}
  }
  @keyframes bil-caret-in{
    0%{transform:scaleY(0);opacity:0;}
    50%{transform:scaleY(1);opacity:0;}
    50.01%{opacity:1;}
    100%{transform:scaleY(1);opacity:1;}
  }
  @keyframes bil-caret-hold{
    0%{transform:scaleY(1);opacity:1;}
    100%{transform:scaleY(1);opacity:0;}
  }
  @keyframes bil-fade{from{opacity:0;}to{opacity:1;}}
  @keyframes bil-rise{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:none;}}
  @keyframes bil-catch-in{
    0%{opacity:0;transform:translateY(-8px) scale(.99);}
    100%{opacity:1;transform:none;}
  }
  @keyframes bil-mark-in{from{transform:scaleY(0);}to{transform:scaleY(1);}}
}

@keyframes bil-blink{0%,50%{opacity:1;}50.01%,100%{opacity:0;}}
`;
