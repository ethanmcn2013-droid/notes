"use client";

/**
 * Notes hero, notebook first.
 *
 * First paint is the focused capture surface. The saved note lands in the
 * stream within the first second, then one selected phrase resolves to an
 * approved Tasks draft indicator. Reduced motion renders the settled notebook
 * immediately.
 */

export function NotesHeroVoice() {
  return (
    <section className="nhv-section" aria-label="Signal Notes notebook">
      <div className="nhv-notebook" aria-hidden="true">
        <div className="nhv-notebook-top">
          <span className="nhv-wordmark">
            <span className="nhv-wordmark-word" aria-label="notes">
              <span>n</span>
              <span>o</span>
              <span>t</span>
              <span>e</span>
              <span>s</span>
            </span>
            <span className="nhv-wordmark-dot" />
          </span>
          <span className="nhv-state">saved to notebook</span>
        </div>

        <div className="nhv-capture-shell">
          <div className="nhv-capture-label">
            <span className="nhv-focus-dot" />
            <span>Focused capture</span>
          </div>
          <p className="nhv-capture-text">
            Maeve wants homepage hero copy by Friday. Three options, not one.
          </p>
          <p className="nhv-capture-ready">Ready for the next thought.</p>
        </div>

        <div className="nhv-stream">
          <div className="nhv-stream-label">Notebook stream</div>

          <article className="nhv-note nhv-new-note">
            <div className="nhv-note-meta">
              <span className="nhv-note-dot" />
              <span>Saved just now</span>
            </div>
            <h2>Maeve wants homepage hero copy by Friday.</h2>
            <p>Three options, not one.</p>
            <div className="nhv-extract">
              <span className="nhv-extract-label">Selected phrase</span>
              <span className="nhv-extract-selection">three hero options</span>
              <span className="nhv-task-chip">Tasks draft approved</span>
            </div>
          </article>

          <article className="nhv-note nhv-existing-note">
            <div className="nhv-note-meta">
              <span>Earlier</span>
            </div>
            <h2>Venue visit: florist confirms pink, not red.</h2>
          </article>

          <article className="nhv-note nhv-existing-note">
            <div className="nhv-note-meta">
              <span>Earlier</span>
            </div>
            <h2>Print export package due Thursday.</h2>
          </article>
        </div>
      </div>

      <p className="nhv-caption">
        Capture in three seconds. Find it later. Decide what becomes work.
      </p>

      <style>{CSS}</style>
    </section>
  );
}

const CSS = `
.nhv-section {
  --nhv-ink: #111111;
  --nhv-ink-soft: #525252;
  --nhv-ink-faint: #8c887e;
  --nhv-line: rgba(17, 17, 17, 0.1);
  --nhv-line-strong: rgba(17, 17, 17, 0.16);
  --nhv-paper: #ffffff;
  --nhv-surface: #fafafa;
  --nhv-indigo: #4f46e5;
  --nhv-font: var(--font-geist, var(--font-geist-sans, system-ui, sans-serif));
  --nhv-mono: var(--font-geist-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
  position: relative;
  overflow: hidden;
  min-height: min(88svh, 900px);
  padding: clamp(72px, 10vh, 132px) 24px clamp(56px, 8vh, 96px);
  background: var(--nhv-paper);
  color: var(--nhv-ink);
  font-family: var(--nhv-font);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
}

.nhv-notebook {
  width: min(100%, 920px);
  border: 1px solid var(--nhv-line);
  background: var(--nhv-paper);
  box-shadow: 0 28px 80px rgba(17, 17, 17, 0.06);
}

.nhv-notebook-top {
  min-height: 58px;
  padding: 0 22px;
  border-bottom: 1px solid var(--nhv-line);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.nhv-wordmark {
  display: inline-flex;
  align-items: flex-end;
  color: var(--nhv-ink);
  font-size: 18px;
  font-weight: 560;
  letter-spacing: -0.03em;
  line-height: 1;
  overflow: visible;
}

.nhv-wordmark-word {
  display: inline-flex;
  overflow: hidden;
}

.nhv-wordmark-word span {
  display: inline-block;
  transform: translateY(112%);
  animation: nhv-word-letter-rise 420ms cubic-bezier(0.22, 0.7, 0.2, 1) 1.12s 1 forwards;
}

.nhv-wordmark-word span:nth-child(2) { animation-delay: 1.18s; }
.nhv-wordmark-word span:nth-child(3) { animation-delay: 1.24s; }
.nhv-wordmark-word span:nth-child(4) { animation-delay: 1.3s; }
.nhv-wordmark-word span:nth-child(5) { animation-delay: 1.36s; }
}

.nhv-wordmark-dot {
  width: 0.075em;
  height: 0.78em;
  margin-left: 0.06em;
  margin-bottom: 0;
  border-radius: 1px;
  background: var(--nhv-indigo);
  opacity: 0;
  transform-origin: center bottom;
  animation:
    nhv-dot-to-caret 980ms cubic-bezier(0.22, 0.7, 0.2, 1) 1.05s 1 forwards,
    nhv-caret-blink 1.05s steps(1, end) 2.26s infinite;
}

.nhv-state,
.nhv-stream-label,
.nhv-capture-label,
.nhv-note-meta,
.nhv-extract-label,
.nhv-task-chip {
  font-family: var(--nhv-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.nhv-state {
  color: var(--nhv-ink-faint);
}

.nhv-capture-shell {
  position: relative;
  min-height: 190px;
  padding: clamp(24px, 4vw, 42px);
  border-bottom: 1px solid var(--nhv-line);
  background: linear-gradient(180deg, var(--nhv-surface), var(--nhv-paper));
  box-shadow: inset 0 0 0 1px rgba(79, 70, 229, 0);
  animation: nhv-focus-settle 900ms cubic-bezier(0.16, 1, 0.3, 1) 0ms 1 forwards;
}

.nhv-capture-shell::before {
  content: "";
  position: absolute;
  inset: 18px;
  border: 1px solid rgba(79, 70, 229, 0.22);
  pointer-events: none;
  animation: nhv-focus-ring 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0ms 1 forwards;
}

.nhv-capture-label {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: var(--nhv-ink-faint);
}

.nhv-focus-dot,
.nhv-note-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--nhv-indigo);
  flex: 0 0 auto;
}

.nhv-capture-text,
.nhv-capture-ready {
  max-width: 18ch;
  margin: 24px 0 0;
  font-size: clamp(30px, 5.2vw, 58px);
  font-weight: 590;
  letter-spacing: -0.055em;
  line-height: 0.98;
  color: var(--nhv-ink);
}

.nhv-capture-text {
  animation: nhv-capture-clears 360ms ease 780ms 1 forwards;
}

.nhv-capture-ready {
  position: absolute;
  left: clamp(24px, 4vw, 42px);
  right: clamp(24px, 4vw, 42px);
  bottom: clamp(24px, 4vw, 42px);
  max-width: none;
  opacity: 0;
  color: var(--nhv-ink-faint);
  animation: nhv-capture-ready 420ms cubic-bezier(0.16, 1, 0.3, 1) 1.1s 1 forwards;
}

.nhv-capture-text::after,
.nhv-capture-ready::after {
  content: "";
  display: inline-block;
  width: 0.075em;
  height: 0.78em;
  margin-left: 0.08em;
  border-radius: 1px;
  background: var(--nhv-indigo);
  transform: translateY(0.1em);
  animation: nhv-caret-blink 1.05s linear infinite;
}

.nhv-stream {
  padding: 26px clamp(24px, 4vw, 42px) 34px;
}

.nhv-stream-label {
  margin-bottom: 16px;
  color: var(--nhv-ink-faint);
}

.nhv-note {
  padding: 18px 0;
  border-top: 1px solid var(--nhv-line);
}

.nhv-note h2 {
  max-width: 38rem;
  margin: 8px 0 0;
  font-size: clamp(22px, 3vw, 34px);
  font-weight: 570;
  letter-spacing: -0.04em;
  line-height: 1.08;
}

.nhv-note p {
  max-width: 42rem;
  margin: 8px 0 0;
  color: var(--nhv-ink-soft);
  font-size: 15px;
  line-height: 1.55;
}

.nhv-note-meta {
  display: flex;
  align-items: center;
  gap: 9px;
  color: var(--nhv-ink-faint);
}

.nhv-new-note {
  opacity: 0;
  transform: translateY(-12px);
  animation: nhv-note-save 420ms cubic-bezier(0.16, 1, 0.3, 1) 820ms 1 forwards;
}

.nhv-existing-note {
  opacity: 0.52;
}

.nhv-extract {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 9px;
  margin-top: 16px;
}

.nhv-extract-label {
  color: var(--nhv-ink-faint);
}

.nhv-extract-selection {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 3px 8px;
  border: 1px solid rgba(79, 70, 229, 0.22);
  color: var(--nhv-ink);
  background: rgba(79, 70, 229, 0);
  font-size: 14px;
  line-height: 1.35;
  opacity: 0;
  transform: translateY(4px);
  animation: nhv-selection 380ms cubic-bezier(0.16, 1, 0.3, 1) 1.36s 1 forwards;
}

.nhv-task-chip {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 4px 10px;
  border: 1px solid rgba(79, 70, 229, 0.26);
  color: var(--nhv-indigo);
  opacity: 0;
  transform: translateY(4px);
  animation: nhv-task-approved 360ms cubic-bezier(0.16, 1, 0.3, 1) 1.68s 1 forwards;
}

.nhv-caption {
  max-width: 64ch;
  margin: 0;
  color: var(--nhv-ink-faint);
  font-family: var(--nhv-mono);
  font-size: 11px;
  letter-spacing: 0.1em;
  line-height: 1.5;
  text-align: center;
  text-transform: uppercase;
}

@keyframes nhv-focus-settle {
  0% { box-shadow: inset 0 0 0 1px rgba(79, 70, 229, 0.16); }
  100% { box-shadow: inset 0 0 0 1px rgba(79, 70, 229, 0); }
}

@keyframes nhv-focus-ring {
  0%, 58% { opacity: 1; transform: scale(1); }
  100% { opacity: 0.34; transform: scale(0.997); }
}

@keyframes nhv-word-letter-rise {
  0% { transform: translateY(112%); }
  100% { transform: translateY(0); }
}

@keyframes nhv-dot-to-caret {
  0% {
    opacity: 0;
    width: 0.16em;
    height: 0.16em;
    border-radius: 999px;
    transform: translateX(-4.7em) translateY(-0.04em) scale(0.72);
  }
  18% {
    opacity: 1;
    width: 0.16em;
    height: 0.16em;
    border-radius: 999px;
    transform: translateX(-4.05em) translateY(-0.04em) scale(1);
  }
  66% {
    opacity: 1;
    width: 0.16em;
    height: 0.16em;
    border-radius: 999px;
    transform: translateX(-0.08em) translateY(-0.04em) scale(1);
  }
  82% {
    opacity: 1;
    width: 0.075em;
    height: 0.78em;
    border-radius: 1px;
    transform: translateX(0) translateY(0) scale(1);
  }
  100% {
    opacity: 1;
    width: 0.075em;
    height: 0.78em;
    border-radius: 1px;
    transform: translateX(0) translateY(0) scale(1);
  }
}

@keyframes nhv-capture-clears {
  0% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-8px); }
}

@keyframes nhv-capture-ready {
  0% { opacity: 0; transform: translateY(8px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes nhv-note-save {
  0% { opacity: 0; transform: translateY(-12px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes nhv-selection {
  0% {
    opacity: 0;
    transform: translateY(4px);
    background: rgba(79, 70, 229, 0);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
    background: rgba(79, 70, 229, 0.08);
  }
}

@keyframes nhv-task-approved {
  0% { opacity: 0; transform: translateY(4px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes nhv-caret-blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .nhv-section *,
  .nhv-section *::before,
  .nhv-section *::after {
    animation-duration: 1ms !important;
    animation-delay: 0ms !important;
    transition-duration: 1ms !important;
  }

  .nhv-capture-shell {
    box-shadow: inset 0 0 0 1px rgba(79, 70, 229, 0);
  }

  .nhv-capture-shell::before {
    opacity: 0.34;
    transform: scale(0.997);
  }

  .nhv-capture-text {
    opacity: 0;
    transform: translateY(-8px);
  }

  .nhv-capture-ready,
  .nhv-new-note,
  .nhv-extract-selection,
  .nhv-task-chip {
    opacity: 1;
    transform: none;
  }

  .nhv-capture-text::after,
  .nhv-capture-ready::after {
    animation: none !important;
    opacity: 1;
  }

  .nhv-wordmark-word span {
    transform: none;
  }

  .nhv-wordmark-dot {
    width: 0.075em;
    height: 0.78em;
    border-radius: 1px;
    opacity: 1;
    transform: none;
  }
}

@media (max-width: 720px) {
  .nhv-section {
    min-height: auto;
    padding: 88px 18px 52px;
  }

  .nhv-notebook-top {
    min-height: 54px;
    padding: 0 16px;
  }

  .nhv-state {
    display: none;
  }

  .nhv-capture-shell {
    min-height: 210px;
  }

  .nhv-capture-shell::before {
    inset: 14px;
  }

  .nhv-capture-text,
  .nhv-capture-ready {
    font-size: clamp(30px, 12vw, 44px);
    letter-spacing: -0.048em;
  }

  .nhv-note h2 {
    font-size: clamp(21px, 7vw, 28px);
  }
}
`;
