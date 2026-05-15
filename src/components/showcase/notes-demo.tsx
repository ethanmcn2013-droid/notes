"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { PrivateNotesEmptyState } from "@/app/app/PrivateNotesEmptyState";
import { DOMAINS, type DomainId } from "@/lib/domains";

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const SEARCH_TYPE_MS = 76;

type DemoNote = { id: string; body: string; stamp: string };

function buildNotes(domain: DomainId): DemoNote[] {
  return DOMAINS[domain].captures.map((entry, i) => ({
    id: `note-${i}`,
    body: entry.text,
    stamp: entry.stamp,
  }));
}

type Props = {
  domain?: DomainId;
};

/**
 * Marketing demo for Notes.
 *
 * N·12 (2026-05-16): this used to render a foreign UI — a grey
 * rounded card, a small rounded capture pill, gapped rounded note
 * cards, and a bottom search pill. None of it matched the actual
 * product at /app, which is a sharp-cornered warm-paper notebook
 * sheet (.notebook), a giant capture field (.capture, ~56px type),
 * and a ruled stream of full-bleed rows (.note-row). Every other
 * Signal product demo mirrors its product; this one had drifted into
 * its own visual language and read as a different app. Rebuilt to
 * render the *real* notebook chrome, reusing the exact globals.css
 * classes the app ships — including the app's own
 * PrivateNotesEmptyState for the capture placeholder — so the
 * marketing page shows precisely what you get.
 *
 * Carried forward (the hard-won properties the prior file fought
 * for): the notebook server-renders populated. Crawlers, no-JS, and
 * reduced-motion visitors see the full stream, search empty, count at
 * rest — exactly the app at rest. The calm search beat is progressive
 * enhancement layered on top and dims non-matches rather than
 * collapsing the list, so the box never reflows the document (the
 * "stop twitching the page" bar from N·11). The app itself filters on
 * search; an ambient autoplay loop that collapsed/expanded the stream
 * every ~11s is the exact jank N·11 removed, so the beat depicts
 * search as dim-others + highlight-match + an honest "1 of 3" count.
 *
 * (Earlier note, kept: a still-earlier version morphed to a Tags view
 * + long-press "Promote to Tasks" menu — contradicted PRODUCT.md §4
 * no views / §7 no taxonomy / §11 deliberate extraction. Removed
 * 2026-05-13.)
 */
export function NotesDemo({ domain = "wedding" }: Props = {}) {
  const reducedMotion = useReducedMotion();
  const pack = DOMAINS[domain];
  const notes = useMemo(() => buildNotes(domain), [domain]);
  const hitId = `note-${pack.searchHitIndex}`;

  const [searchText, setSearchText] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const aliveRef = useRef(true);
  const loopKeyRef = useRef(0);

  // Reset the beat whenever the audience changes.
  useEffect(() => {
    setSearchText("");
    setSearchActive(false);
    loopKeyRef.current += 1;
  }, [domain]);

  // Progressive enhancement only. The notebook is already populated
  // and on screen (the markup below renders the full stream regardless
  // of this effect). This adds one thing: a calm pass where search
  // fills, finds a note, rests, and clears. No typing-at-you, no
  // collapse, no reflow.
  useEffect(() => {
    if (reducedMotion) return;
    aliveRef.current = true;
    const myLoopKey = loopKeyRef.current;
    const isCurrent = () =>
      aliveRef.current && myLoopKey === loopKeyRef.current;

    let cancelled = false;

    async function runSearchBeat() {
      // Open on stillness — the notebook just sits there, populated.
      await wait(3400);
      if (!isCurrent()) return;
      setSearchActive(true);
      await wait(520);
      const q = pack.searchQuery;
      for (let i = 1; i <= q.length; i++) {
        if (!isCurrent()) return;
        setSearchText(q.slice(0, i));
        await wait(SEARCH_TYPE_MS);
      }
      // Rest on the result — one note lit, the rest dimmed.
      await wait(3000);
      if (!isCurrent()) return;
      setSearchText("");
      setSearchActive(false);
      // A long, quiet rest before it happens again.
      await wait(4600);
    }

    (async function loop() {
      while (!cancelled && isCurrent()) {
        await runSearchBeat();
      }
    })();

    return () => {
      cancelled = true;
      aliveRef.current = false;
    };
  }, [reducedMotion, domain, pack]);

  const query = searchText.trim().toLowerCase();
  const searching = query.length > 0;
  const matchCount = searching
    ? notes.filter((n) => n.body.toLowerCase().includes(query)).length
    : notes.length;

  return (
    <div className="notebook-demo">
      {/* The real product surface — same .notebook chrome the app
          renders at /app. minHeight override: the app sets a tall
          full-screen min-height; the hero artifact sizes to content. */}
      <section
        className="notebook"
        aria-label="Signal Notes — a look at the notebook"
        style={{ minHeight: 0 }}
      >
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
              style={{
                borderBottomColor: searchActive
                  ? "var(--color-accent)"
                  : undefined,
              }}
            />
          </span>
        </div>

        <div className="capture">
          <div className="sr-only">Capture a private note</div>
          {/* Read-only replica of the app's capture textarea — the
              signature giant type. Non-interactive: the demo shows the
              field, the live product is one click away via the hero
              CTA. The app's own empty-state component drives the
              rotating placeholder, so this is pixel-identical. */}
          <textarea
            rows={3}
            placeholder=""
            value=""
            readOnly
            tabIndex={-1}
            aria-hidden
          />
          <PrivateNotesEmptyState visible />
          <p className="capture-hint">
            <kbd>Enter</kbd> saves · <kbd>Shift</kbd>+<kbd>Enter</kbd> new line ·{" "}
            <kbd>Esc</kbd> clears
          </p>
        </div>

        <div className="stream-head">
          <span>Stream</span>
          <span>
            {searching
              ? `${matchCount} of ${notes.length}`
              : `${notes.length} ${notes.length === 1 ? "note" : "notes"}`}
          </span>
        </div>

        <ol className="stream" aria-label="Recent notes">
          {notes.map((note) => {
            const isHit = note.id === hitId;
            const dimmed = searching && !isHit;
            return (
              <li key={note.id}>
                <div
                  className="note-row"
                  style={{
                    cursor: "default",
                    opacity: dimmed ? 0.42 : 1,
                    transition: "opacity 320ms cubic-bezier(.16,1,.3,1)",
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
        .notebook-demo {
          display: flex;
          justify-content: center;
          width: 100%;
        }
        .notebook-demo .notebook {
          width: 100%;
          max-width: 620px;
        }
        /* The hero artifact wants a calmer capture height than the
           full-bleed in-product field; keep the signature scale, trim
           the dead space. */
        .notebook-demo .capture textarea {
          min-height: 96px;
          pointer-events: none;
        }
        .notebook-demo .note-row:hover {
          background: transparent;
        }
      `}</style>
    </div>
  );
}

/** Render body with the query substring wrapped in a soft highlight. */
function renderWithHighlight(body: string, query: string) {
  if (!query) return body;
  const lower = body.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());
  if (idx < 0) return body;
  return (
    <>
      {body.slice(0, idx)}
      <span
        style={{
          background:
            "color-mix(in srgb, var(--color-accent) 18%, transparent)",
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
