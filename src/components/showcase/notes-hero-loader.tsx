"use client";

/**
 * Notes hero loader — "a held thought, awaiting input."
 *
 * The dot rolls in from off-screen left, assembling "notes" as it passes
 * each letter. It lands, squishes on impact, then morphs into a tall
 * vertical text cursor and blinks indefinitely. The cursor is the product's
 * brand gesture: capture clarity, waiting for you.
 *
 * SAFETY CONTRACT:
 *   · Fully scoped — every class and @keyframes is prefixed `ntl-`.
 *   · In-flow only — no position:fixed, no inset:0, no high z-index.
 *   · rAF loop cancels itself when all letters are settled.
 *   · prefers-reduced-motion → renders final caret state immediately.
 */

import { useEffect, useRef } from "react";

export function NotesHeroLoader() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const wordEl = root.querySelector<HTMLElement>(".ntl-word");
    const markEl = root.querySelector<HTMLElement>(".ntl-mark");
    const composerEl = root.querySelector<HTMLElement>(".ntl-composer");

    if (!wordEl || !markEl || !composerEl) return;

    const letterEls = [...wordEl.querySelectorAll<HTMLElement>(".ntl-letter")];

    if (reduced) {
      letterEls.forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      });
      return;
    }

    const RISE_MS = 280;
    const RISE_LEAD = 80;

    const start = performance.now();
    let risenAt: Array<number | null> = new Array(letterEls.length).fill(null);
    let centers: number[] = [];
    let raf = 0;

    const measure = () => {
      const cl = composerEl.getBoundingClientRect().left;
      centers = letterEls.map((el) => {
        const r = el.getBoundingClientRect();
        return r.left + r.width / 2 - cl;
      });
    };

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const frame = () => {
      const elapsed = performance.now() - start;
      const cl = composerEl.getBoundingClientRect().left;
      const mr = markEl.getBoundingClientRect();
      const markX = mr.left + mr.width / 2 - cl;
      const markOpacity = parseFloat(getComputedStyle(markEl).opacity);

      let allDone = true;

      letterEls.forEach((el, i) => {
        const lx = centers[i];
        if (lx === undefined) { allDone = false; return; }
        const distance = lx - markX;
        if (risenAt[i] === null && markOpacity > 0.2 && distance < RISE_LEAD) {
          risenAt[i] = elapsed;
        }
        if (risenAt[i] === null) {
          el.style.opacity = "0";
          el.style.transform = "translateY(115%)";
          allDone = false;
          return;
        }
        const timeSinceRise = elapsed - risenAt[i]!;
        let p = Math.min(1, Math.max(0, timeSinceRise / RISE_MS));
        if (p < 1) allDone = false;
        p = easeOutCubic(p);
        el.style.opacity = p.toString();
        el.style.transform = `translateY(${(1 - p) * 115}%)`;
      });

      if (!allDone) raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(() => {
      measure();
      raf = requestAnimationFrame(frame);
    });
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <section className="ntl-hero-section" aria-label="Signal Notes">
      {/* Corner chrome */}
      <div className="ntl-chrome ntl-chrome-tl">
        <span className="ntl-wm">
          signal studio<span className="ntl-dot-static" />
          <span className="ntl-sep">/</span>notes
        </span>
      </div>
      <div className="ntl-chrome ntl-chrome-tr">
        <span className="ntl-pip" aria-hidden />
        waiting
      </div>

      {/* Stage */}
      <div className="ntl-stage" ref={rootRef} aria-hidden>
        <div className="ntl-composer">
          <span className="ntl-word">
            {"notes".split("").map((ch, i) => (
              <span key={i} className="ntl-letter">{ch}</span>
            ))}
          </span>
          <span className="ntl-trail ntl-t1" />
          <span className="ntl-trail ntl-t2" />
          <span className="ntl-trail ntl-t3" />
          <span className="ntl-ripple-slow" />
          <span className="ntl-ripple" />
          <span className="ntl-mark" />
        </div>
      </div>

      {/* Caption */}
      <p className="ntl-caption">a held thought, awaiting input</p>

      <style>{CSS}</style>
    </section>
  );
}

const CSS = `
.ntl-hero-section{
  position:relative;overflow:hidden;background:#ffffff;
  display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  min-height:min(88vh,900px);
  padding:clamp(80px,12vh,160px) 24px clamp(64px,10vh,128px);
}
.ntl-hero-section{
  --ntl-ink:#111111;
  --ntl-stone-500:#8c887e;
  --ntl-indigo:#4f46e5;
  --ntl-indigo-300:#a5b4fc;
  --ntl-hairline:rgba(17,17,17,0.06);
  --ntl-wm-size:clamp(56px,12vw,168px);
  --ntl-roll:calc(var(--ntl-wm-size) * 8);
  --ntl-font:var(--font-geist,'Geist',system-ui,sans-serif);
  --ntl-mono:var(--font-geist-mono,'Geist Mono',ui-monospace,monospace);
}

/* ─── Chrome ───────────────────────────────── */
.ntl-chrome{
  position:absolute;font-family:var(--ntl-mono);font-size:11px;
  letter-spacing:.08em;text-transform:uppercase;color:var(--ntl-stone-500);
  display:inline-flex;align-items:center;gap:10px;
}
.ntl-chrome-tl{top:28px;left:32px}
.ntl-chrome-tr{top:28px;right:32px}
.ntl-wm{
  display:inline-flex;align-items:baseline;
  font-family:var(--ntl-font);font-weight:500;
  font-size:14px;letter-spacing:-.025em;line-height:.95;
  color:var(--ntl-ink);text-transform:none;
}
.ntl-dot-static{
  width:.16em;height:.16em;border-radius:50%;
  background:var(--ntl-indigo);margin-left:.06em;
  align-self:flex-end;margin-bottom:.06em;flex:0 0 auto;
}
.ntl-sep{color:var(--ntl-stone-500);margin:0 .4em;font-weight:300}
.ntl-pip{
  width:6px;height:6px;border-radius:50%;
  background:var(--ntl-indigo);display:inline-block;
  animation:ntl-pip-blink 1.6s cubic-bezier(.45,.05,.55,.95) infinite;
}
@keyframes ntl-pip-blink{0%,100%{opacity:1}50%{opacity:.35}}

/* ─── Stage ────────────────────────────────── */
.ntl-stage{display:flex;align-items:center;justify-content:center;width:100%}
.ntl-composer{
  position:relative;display:inline-flex;align-items:baseline;
  font-family:var(--ntl-font);font-weight:500;
  font-size:var(--ntl-wm-size);line-height:.95;
  letter-spacing:-.03em;color:var(--ntl-ink);
  padding-bottom:calc(var(--ntl-wm-size) * .25);
}
.ntl-composer::before{
  content:'';position:absolute;
  left:calc(-1 * var(--ntl-wm-size) * 3.2);
  right:calc(-1 * var(--ntl-wm-size) * 1.2);
  bottom:calc(var(--ntl-wm-size) * .15);
  height:1px;background:var(--ntl-hairline);
}
.ntl-word{display:inline-flex;gap:0;position:relative;z-index:1}
.ntl-letter{
  display:inline-block;opacity:0;transform:translateY(115%);
  color:var(--ntl-ink);will-change:opacity,transform;
}

/* ─── The mark: dot → caret ────────────────── */
.ntl-mark{
  position:relative;
  width:.16em;height:.16em;border-radius:50%;
  background:var(--ntl-indigo);
  margin-left:.06em;align-self:flex-end;margin-bottom:.06em;
  transform-origin:center bottom;z-index:3;
  animation:
    ntl-roll  5s   cubic-bezier(.34,1.56,.64,1) 0s   1        forwards,
    ntl-morph .6s  cubic-bezier(.22,.7,.2,1)    3.9s 1        forwards,
    ntl-blink 1.06s linear                      4.5s infinite;
}
@keyframes ntl-roll{
  0%  {transform:translate(calc(-1 * var(--ntl-roll)),0) scale(1,1);opacity:0}
  4%  {transform:translate(calc(-1 * var(--ntl-roll)),0) scale(1,1);opacity:1}
  33% {transform:translate(calc(-.03 * var(--ntl-wm-size)),0) scale(1,1);opacity:1}
  35% {transform:translate(0,0) scale(1,1);opacity:1}
  38% {transform:translate(0,0) scale(1.55,.55);opacity:1}
  41% {transform:translate(0,0) scale(1.96,.4);opacity:1}
  43% {transform:translate(0,0) scale(1.88,.43);opacity:1}
  48% {transform:translate(0,calc(-.075 * var(--ntl-wm-size))) scale(.74,1.34);opacity:1}
  53% {transform:translate(0,0) scale(1.24,.82);opacity:1}
  57% {transform:translate(0,0) scale(.96,1.05);opacity:1}
  60% {transform:translate(0,0) scale(1,1);opacity:1}
  68% {transform:translate(0,0) scale(.86,.86);opacity:.86}
  77%,100%{transform:translate(0,0) scale(1,1);opacity:1}
}
@keyframes ntl-morph{
  0%  {width:.16em;height:.16em;border-radius:50%}
  100%{width:.075em;height:.78em;border-radius:.02em}
}
@keyframes ntl-blink{
  0%,50%  {opacity:1}
  50.01%,100%{opacity:0}
}

/* ─── Trails ───────────────────────────────── */
.ntl-trail{
  position:absolute;width:.16em;height:.16em;border-radius:50%;
  background:var(--ntl-indigo);align-self:flex-end;margin-bottom:.06em;
  margin-left:.06em;opacity:0;z-index:2;
}
.ntl-t1{animation:ntl-ghost1 5s cubic-bezier(.34,1.56,.64,1) 0s 1 forwards}
.ntl-t2{animation:ntl-ghost2 5s cubic-bezier(.34,1.56,.64,1) 0s 1 forwards}
.ntl-t3{animation:ntl-ghost3 5s cubic-bezier(.34,1.56,.64,1) 0s 1 forwards}
@keyframes ntl-ghost1{
  0%,5%{transform:translate(calc(-1 * var(--ntl-roll)),0);opacity:0}
  14%{transform:translate(calc(-.85 * var(--ntl-roll)),0);opacity:.5}
  26%{transform:translate(calc(-.2 * var(--ntl-roll)),0);opacity:.26}
  33%,100%{transform:translate(calc(-.1 * var(--ntl-roll)),0);opacity:0}
}
@keyframes ntl-ghost2{
  0%,7%{transform:translate(calc(-1 * var(--ntl-roll)),0);opacity:0}
  16%{transform:translate(calc(-.78 * var(--ntl-roll)),0);opacity:.36}
  26%{transform:translate(calc(-.28 * var(--ntl-roll)),0);opacity:.18}
  33%,100%{transform:translate(calc(-.16 * var(--ntl-roll)),0);opacity:0}
}
@keyframes ntl-ghost3{
  0%,9%{transform:translate(calc(-1 * var(--ntl-roll)),0);opacity:0}
  18%{transform:translate(calc(-.7 * var(--ntl-roll)),0);opacity:.24}
  26%{transform:translate(calc(-.35 * var(--ntl-roll)),0);opacity:.11}
  33%,100%{transform:translate(calc(-.24 * var(--ntl-roll)),0);opacity:0}
}

/* ─── Impact ripples ───────────────────────── */
.ntl-ripple,.ntl-ripple-slow{
  position:absolute;width:.16em;height:.16em;border-radius:50%;
  background:transparent;align-self:flex-end;
  margin-bottom:.06em;margin-left:.06em;opacity:0;transform:scale(1);z-index:1;
}
.ntl-ripple{border:1px solid var(--ntl-indigo);animation:ntl-rip-fast 5s cubic-bezier(.22,.7,.2,1) 0s 1 forwards}
.ntl-ripple-slow{border:1px solid var(--ntl-indigo-300);animation:ntl-rip-slow 5s cubic-bezier(.22,.7,.2,1) 0s 1 forwards}
@keyframes ntl-rip-fast{
  0%,39%{transform:scale(1);opacity:0}41%{transform:scale(1);opacity:.7}
  60%{transform:scale(11);opacity:0}100%{transform:scale(11);opacity:0}
}
@keyframes ntl-rip-slow{
  0%,39%{transform:scale(1);opacity:0}41%{transform:scale(1);opacity:.45}
  74%{transform:scale(22);opacity:0}100%{transform:scale(22);opacity:0}
}

/* ─── Caption ──────────────────────────────── */
.ntl-caption{
  font-family:var(--ntl-mono);font-size:11px;letter-spacing:.12em;
  text-transform:uppercase;color:var(--ntl-stone-500);
  opacity:0;margin-top:48px;
  animation:ntl-caption-in .8s cubic-bezier(.22,.7,.2,1) 4.1s 1 forwards;
}
@keyframes ntl-caption-in{
  0%{opacity:0;transform:translateY(4px)}100%{opacity:1;transform:translateY(0)}
}

/* ─── Reduced motion ───────────────────────── */
@media(prefers-reduced-motion:reduce){
  .ntl-mark{animation:none;width:.075em;height:.78em;border-radius:.02em;opacity:1}
  .ntl-trail,.ntl-ripple,.ntl-ripple-slow{display:none}
  .ntl-caption{animation:none;opacity:1}
  .ntl-pip{animation:none}
  .ntl-letter{opacity:1;transform:none}
}

/* ─── Responsive chrome ────────────────────── */
@media(max-width:600px){.ntl-chrome-tl{top:18px;left:20px}.ntl-chrome-tr{top:18px;right:20px;font-size:10px}}
@media(max-width:420px){.ntl-chrome-tr{display:none}}
`;
