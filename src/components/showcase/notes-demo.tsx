"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { PrivateNotesEmptyState } from "@/app/app/PrivateNotesEmptyState";
import { DOMAINS, type DomainId } from "@/lib/domains";

const waitMs = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

type DemoNote = { id: string; body: string; stamp: string };

/** Stream order: newest first. captures[] is chronological; reverse for display. */
function buildNotes(domain: DomainId): DemoNote[] {
  return DOMAINS[domain].captures
    .map((entry, i) => ({ id: `note-${i}`, body: entry.text, stamp: entry.stamp }))
    .slice()
    .reverse();
}

/**
 * Type `text` character-by-character via `setter`.
 * Returns true on completion, false if the live-check failed mid-type.
 *
 * Natural rhythm:
 *   - base 50ms ±20ms per character
 *   - +130ms after commas / em-dashes / semicolons / colons
 *   - +260ms after sentence-end punctuation
 *   - 3% chance of a 320ms "thinking pause"
 */
async function typeText(
  text: string,
  setter: (t: string) => void,
  live: () => boolean,
  opts?: { baseDelay?: number },
): Promise<boolean> {
  const base = opts?.baseDelay ?? 50;
  let built = "";

  for (const char of text) {
    if (!live()) return false;
    built += char;
    setter(built);

    let delay = base + (Math.random() * 40 - 20);
    if (char === "," || char === "—" || char === ";" || char === ":") delay += 130;
    if (char === "." || char === "!" || char === "?" || char === "\n") delay += 260;
    if (Math.random() < 0.03) delay += 320; // rare hesitation

    await waitMs(Math.max(16, delay));
  }
  return true;
}

type Props = { domain?: DomainId };

/**
 * NotesDemo, the live capture demo on the Notes marketing page.
 *
 * Performs the product's core act: a thought is typed into the capture
 * field character-by-character (natural rhythm, punctuation pauses, blinking
 * cursor at the insertion point), held briefly, then committed to the stream
 * with the product's own `note-row-arrive` CSS gesture.
 * Followed by a search beat that also types the query in.
 *
 * SSR / no-JS: full stream at rest, capture area empty. Correct.
 * Reduced-motion: no loop fires; stream static.
 * Tab-visibility: loop pauses when document.hidden.
 * Domain change: full reset + restart.
 */
export function NotesDemo({ domain = "wedding" }: Props = {}) {
  const reducedMotion = useReducedMotion();
  const pack          = DOMAINS[domain];
  const notes         = useMemo(() => buildNotes(domain), [domain]);
  const hitId         = `note-${pack.searchHitIndex}`;

  // Capture beat
  const [captureText,  setCaptureText]  = useState("");
  const [captureShown, setCaptureShown] = useState(false);
  const [isTyping,     setIsTyping]     = useState(false);
  const [freshId,      setFreshId]      = useState<string | null>(null);
  const [freshKey,     setFreshKey]     = useState(0);

  // Search beat
  const [searchText,   setSearchText]   = useState("");
  const [searchActive, setSearchActive] = useState(false);

  const loopKeyRef = useRef(0);

  // Full reset on domain change
  useEffect(() => {
    setCaptureText("");
    setCaptureShown(false);
    setIsTyping(false);
    setFreshId(null);
    setSearchText("");
    setSearchActive(false);
    loopKeyRef.current += 1;
  }, [domain]);

  useEffect(() => {
    if (reducedMotion) return;

    const myKey = loopKeyRef.current;
    let cancelled = false;
    const live = () =>
      !cancelled &&
      myKey === loopKeyRef.current &&
      typeof document !== "undefined" &&
      !document.hidden;

    const captures = pack.captures;

    async function searchBeat() {
      setSearchActive(true);
      await waitMs(320);
      if (!live()) return;

      await typeText(pack.searchQuery, setSearchText, live, { baseDelay: 38 });
      if (!live()) return;

      await waitMs(2200);
      if (!live()) return;

      setSearchText("");
      setSearchActive(false);
      await waitMs(380);
    }

    (async function run() {
      while (live()) {
        // Open on stillness. Shorter initial wait (1.5s) so visitors see action quickly.
        await waitMs(1500);
        if (!live()) { await waitMs(1200); continue; }

        for (let i = 0; i < captures.length; i++) {
          if (!live()) break;
          const cap = captures[i];

          // ① Empty capture field appears with blinking cursor, "about to type"
          setCaptureShown(true);
          setIsTyping(true);
          await waitMs(420);
          if (!live()) break;

          // ② Type the thought character by character
          const ok = await typeText(cap.text, setCaptureText, live);
          if (!ok || !live()) break;

          // ③ Hold, full thought on screen, cursor still blinking
          await waitMs(880);
          if (!live()) break;

          // ④ Cursor disappears (commit moment, Enter key mental-model)
          setIsTyping(false);
          await waitMs(180);
          if (!live()) break;

          // ⑤ Field releases: text fades out, matching stream row re-arrives
          setCaptureShown(false);
          setFreshId(`note-${i}`);
          setFreshKey((k) => k + 1);
          await waitMs(220);
          if (!live()) break;
          setCaptureText("");

          // note-row-arrive is 320ms; let it finish, then settle
          await waitMs(580);
          if (!live()) break;
          setFreshId(null);
          await waitMs(1400);
        }

        if (!live()) continue;
        await searchBeat();
        if (!live()) continue;

        // Long quiet rest before the whole thing happens again.
        await waitMs(3600);
      }
    })();

    return () => { cancelled = true; };
  }, [reducedMotion, domain, pack]);

  const query      = searchText.trim().toLowerCase();
  const searching  = query.length > 0;
  const matchCount = searching
    ? notes.filter((n) => n.body.toLowerCase().includes(query)).length
    : notes.length;
  const placeholderVisible = !captureShown && captureText.length === 0;

  return (
    <div className="notebook-demo">
      <section
        className="notebook"
        aria-label="Signal Notes, a look at the notebook"
        style={{ minHeight: 0 }}
      >
        {/* Top bar: wordmark + search */}
        <div className="notebook-top">
          <span className="wordmark" aria-hidden>
            <span className="word">notes</span>
            <span className="dot" />
          </span>
          <span className="search">
            <span>Search</span>
            <input
              type="text"
              value={searchText}
              placeholder="anything"
              readOnly
              tabIndex={-1}
              aria-hidden
              spellCheck={false}
              style={{ borderBottomColor: searchActive ? "var(--color-accent)" : undefined }}
            />
          </span>
        </div>

        {/* Capture area */}
        <div className="capture">
          <div className="sr-only">Capture a private note</div>

          {/*
            Height anchor: an invisible, inert textarea that gives .capture
            its correct block height so the placeholder text never bleeds
            into the keyboard hint below. Same technique as the original demo
            (N·12); the typewriter overlay sits absolutely on top of it.
          */}
          <textarea
            rows={3}
            value=""
            readOnly
            tabIndex={-1}
            aria-hidden
            className="demo-capture-spacer"
          />

          {/*
            Typing overlay: absolutely positioned on top of the spacer.
            Uses a div (not textarea) so the blinking cursor is an inline
            child at the exact insertion point. Only mounted when captureShown.
          */}
          {captureShown && (
            <div
              className="demo-capture-text"
              aria-hidden
              data-committing={!isTyping ? "true" : "false"}
            >
              {captureText}
              {isTyping && <span className="demo-capture-cursor" aria-hidden />}
            </div>
          )}

          <PrivateNotesEmptyState visible={placeholderVisible} />

          <p className="capture-hint">
            <kbd>Enter</kbd> saves · <kbd>Shift</kbd>+<kbd>Enter</kbd> new line ·{" "}
            <kbd>Esc</kbd> clears
          </p>
        </div>

        {/* Stream header */}
        <div className="stream-head">
          <span>Stream</span>
          <span>
            {searching
              ? `${matchCount} of ${notes.length}`
              : `${notes.length} ${notes.length === 1 ? "note" : "notes"}`}
          </span>
        </div>

        {/* Note stream */}
        <ol className="stream" aria-label="Recent notes">
          {notes.map((note) => {
            const isHit   = note.id === hitId;
            const dimmed  = searching && !isHit;
            const isFresh = note.id === freshId;
            return (
              <li key={note.id}>
                <div
                  key={isFresh ? `${note.id}-${freshKey}` : note.id}
                  className={`note-row${isFresh ? " is-fresh" : ""}`}
                  style={{
                    cursor: "default",
                    opacity: dimmed ? 0.42 : 1,
                    transition: "opacity var(--motion-moderate) var(--ease-out)",
                  }}
                >
                  <span>
                    <span className="note-title">
                      {searching && isHit
                        ? renderWithHighlight(note.body, pack.searchQuery)
                        : note.body}
                    </span>
                  </span>
                  <span className="note-meta">
                    <span>{note.stamp}</span>
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <style>{`
        /* ── Demo shell ───────────────────────────────────────────────── */
        .notebook-demo {
          display: flex;
          justify-content: center;
          width: 100%;
        }
        .notebook-demo .notebook {
          width: 100%;
          max-width: 620px;
        }
        /* ── Height anchor spacer ────────────────────────────────────── */
        /* An invisible inert textarea that keeps .capture block height
           stable so the absolutely-positioned placeholder never overflows
           into the keyboard hint below. */
        .demo-capture-spacer {
          display: block;
          width: 100%;
          min-height: 96px;
          opacity: 0;
          pointer-events: none;
          resize: none;
          border: 0;
          outline: 0;
          background: transparent;
          font-size: clamp(28px, 5vw, 56px);
          font-weight: 560;
          line-height: 1.03;
          font-family: inherit;
        }

        /* ── Capture text overlay ─────────────────────────────────────── */
        /* Absolutely positioned on top of the spacer; uses a div so the
           blinking cursor is an inline child at the exact insertion point. */
        .demo-capture-text {
          position: absolute;
          top: var(--capture-pad, 24px);
          left: var(--capture-pad, 24px);
          right: var(--capture-pad, 24px);
          z-index: 2;
          color: var(--color-ink);
          font-size: clamp(28px, 5vw, 56px);
          font-weight: 560;
          line-height: 1.03;
          letter-spacing: 0;
          font-family: inherit;
          word-break: break-word;
          white-space: pre-wrap;
          animation: demo-text-in 240ms cubic-bezier(0, 0, 0.2, 1) both;
        }
        @keyframes demo-text-in {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        /* Exit: commit moment, field rises gently away */
        .demo-capture-text[data-committing="true"] {
          animation: demo-text-out 200ms cubic-bezier(0.4, 0, 1, 1) both;
        }
        @keyframes demo-text-out {
          from { opacity: 1; transform: translateY(0);   }
          to   { opacity: 0; transform: translateY(-5px); }
        }

        /* ── Blinking cursor ──────────────────────────────────────────── */
        /* Sits inline at the exact end of the typed text. Indigo accent
           matches the product's caret-color and the placeholder caret. */
        .demo-capture-cursor {
          display: inline-block;
          width: 2.5px;
          height: 0.76em;
          background: var(--color-accent, #4f46e5);
          margin-left: 4px;
          vertical-align: baseline;
          position: relative;
          top: 0.09em;
          border-radius: 1px;
          animation: demo-caret-blink 0.88s ease-in-out infinite;
        }
        @keyframes demo-caret-blink {
          0%, 44% { opacity: 0.16; }
          50%, 90% { opacity: 1; }
          100%     { opacity: 0.16; }
        }

        /* Suppress hover highlight on stream rows in demo */
        .notebook-demo .note-row:hover {
          background: transparent;
        }

        /* ── Reduced motion ───────────────────────────────────────────── */
        @media (prefers-reduced-motion: reduce) {
          .demo-capture-text,
          .demo-capture-text[data-committing="true"] {
            animation: none !important;
            opacity: 1;
            transform: none;
          }
          .demo-capture-cursor {
            animation: none !important;
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

/** Render body with the query substring wrapped in a soft highlight. */
function renderWithHighlight(body: string, query: string) {
  if (!query) return body;
  const lower = body.toLowerCase();
  const idx   = lower.indexOf(query.toLowerCase());
  if (idx < 0) return body;
  return (
    <>
      {body.slice(0, idx)}
      <span
        style={{
          background: "color-mix(in srgb, var(--color-accent) 18%, transparent)",
          borderRadius: 4,
          padding: "0 2px",
          margin: "0 -2px",
        }}
      >
        {body.slice(idx, idx + query.length)}
      </span>
      {body.slice(idx + query.length)}
    </>
  );
}
