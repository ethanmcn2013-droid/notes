# Signal Notes · PRODUCT.md

**Locked product definition.** This document defines what Signal Notes *is*, who it's for, and — critically — how it stays distinct from Signal Tasks. It is the single source of truth for product decisions in this repo. When this document and the live site disagree, fix this document first if the document is wrong; otherwise fix the site.

Drafted in Plan 1 · Cycle 1.2 (Strategic Foundation). Companion to BRAND.md and the Signal product definition.

**Hybrid amendment — 18 July 2026.** Ethan selected the exact Phase 1 advisory hybrid and authorised Phase 2 production implementation. This amendment is the implementation contract for that work. It does **not** record a production shipment: until the gated implementation is built, verified, and promoted, the legacy notebook remains the production surface. The historical `CHANGELOG.md` stays untouched until that shipment has a verified production receipt.

---

## 1 · Position

Signal Notes is **capture clarity**. Where Tasks runs the work, Timeline explains the work, and Signal tells you what to do about the work, Notes catches the work *before it is work*. The half-formed thought. The thing the meeting just decided. The fact that came up in passing. The decision that needs to be remembered but doesn't need to be done.

It is the fourth product in Signal Studio. Its job is to make capture so fast and frictionless that the user reaches for it instead of a sticky note, a phone draft, or a Slack message to themselves — and to keep that capture clean enough that the *next* thing (a task, a follow-up, a briefing) has something to read.

It is not a wiki. It is not a knowledge base. It is not a second brain. The brand will not use any of those phrases.

---

## 2 · Audience

The same 80% the suite serves. In Notes specifically:

- The freelance designer in a kickoff call who needs to scribble three asks from the client before they are forgotten by minute eleven.
- The wedding planner standing at a venue who needs to capture "florist confirms pink, not red" without opening a PM app.
- The trades operator hearing from a supplier "delivery slipped to Tuesday" while standing on a roof.
- The teacher who realises mid-class that two students need parent calls.
- The small-business owner whose best ideas arrive while walking the dog.

What unites them: capture happens in *life*, not in front of a desk. Capture friction is the difference between *remembered* and *lost*. The product's design budget is spent on speed-of-capture, not on a feature surface.

Banned framings: "second brain", "personal knowledge management", "Zettelkasten", "PKM", "graph of ideas". If a sentence in this product would not make sense to a tradesperson on a roof, the sentence is wrong.

---

## 3 · The promise

> Capture in three seconds. Find it later. Decide what becomes work.

The promise has three parts and they are non-negotiable:

1. **Three-second capture.** From "I need to write this down" to *written* in under three seconds. This is the design budget. Anything that costs the third second is a bug.
2. **Findable, not organised.** No required folders, tags, projects, or hierarchy. Search and recency are the access pattern. Organisation is opt-in for users who want it; default is flat.
3. **One-way extraction to Tasks.** A note can produce an action when the user says so — never automatically. Tasks does not become Notes. The flow is one direction, private capture → deliberate commitment.

If any of these three drift, the product is no longer Signal Notes — it has become a different category of product (a wiki, a knowledge base, a journaling app, a second brain) and is no longer brand-coherent.

---

## 4 · The artifact: the notebook

The product surface is one responsive screen. It is called the **notebook**.

**Top:** a compact, SSR-first capture field rendered in the initial HTML and focused as soon as the browser permits. Cursor lives here. Pressing Enter saves. There is no required title, folder, tag, project, or metadata step. The capture field remains the fastest path from thought to private note.

**Stream:** a flat, newest-first list with no date grouping. Each row shows the first line, a contextual excerpt, captured-at, and one indigo receipt indicator when the note has produced an approved Tasks extract. Search is integrated into the notebook command surface on every viewport; there is no search rail, folder tree, tag cloud, or graph view. Search results use longer contextual snippets so the match is understandable without opening every note.

**Detail:** on desktop, selecting a stream row opens an adjacent stream/detail split while preserving recency context. The note body is editable and its reading column stays within a 64–72 character measure. On mobile, selection opens a serial full-screen detail surface rather than compressing two panes into one viewport.

**Tasks extraction:** the user selects the exact wording in an open note, opens an editable approval preview, and explicitly chooses **Send to Tasks**. Only that approved wording crosses the boundary. The source note remains private, editable, and present in the stream. A successful handoff produces an idempotent receipt attached to the note.

**Superseded behavior:** `Cmd/Ctrl+Enter` may save where the keyboard model supports it, but it must never promote a whole note, its first line, or surrounding context to Tasks. Sending an extract must never archive, remove, or move the source note. Direct whole-note/first-line promotion and archive-on-send are no longer valid product behavior.

**No views.** No "card view", "outline view", "timeline view", "kanban view". One stream. Integrated search to find. Flat recency to browse.

**No required structure.** No fields. No metadata. The note is a body of free text. The user can use markdown if they want; they don't have to.

---

## 5 · The mechanism (capture flow)

**Open → focused → typed → saved.** That is the flow. Each step has a budget.

| Step | Budget | Mechanism |
|---|---|---|
| Open | < 200ms | Compact SSR-first render of `/app`. Capture field is in initial HTML. No client-render dependency for first paint. |
| Focus | 0ms | Capture field is autofocused on mount. No click required. |
| Type | n/a | Plain `<textarea>`-equivalent for capture and an editable note body in detail. No heavyweight editor framework or plugin dependency. |
| Save | < 100ms perceived | Optimistic local write, server sync in background. No spinner. The note is in the stream the moment Enter fires. |
| Reopen | < 200ms perceived | Desktop opens the selected row in the adjacent detail pane; mobile opens full-screen detail. Both preserve a 64–72 character reading measure. |

**Capture from outside the app** (deferred to v1.5, but designed for now):
- Email-to-capture: `capture@notes.signalstudio.ie` writes the email body as a note.
- iOS / Android share sheet (mobile, deferred to Plan 10).
- Quick-capture URL pattern: `notes.signalstudio.ie/c?text=...` for clipboard and shortcut integrations.

**Offline retention.** Losing connectivity must not lose, replace, or normalise the user's exact writing. Capture and edit operations retain their exact body, stable note identity, base version, and pending state locally, then retry when connectivity returns. Retries are safe and visible; a failed attempt never clears the writing surface.

**No real-time sync.** Multiplayer is out of scope for v1. Notes are single-user. Every edit is version-checked against the server version. A stale write opens an explicit conflict state with three recoveries: **Keep local**, **Use remote**, or **Keep both**. There is no silent last-write-wins overwrite.

---

## 6 · What it reads, what it writes, what it shares

**Notes reads:** nothing automatically. It is purely a capture surface.

**Notes writes:** to its own database. The Phase 2 contract stores each note with a stable id, exact body, timestamps, and a version used for compare-and-write conflict detection. Approved extraction state records the exact selected-and-approved `extract_body`, resulting Tasks id, and an idempotent receipt. The cross-repo write continues through `POST /api/notes-extract` on `tasks.signalstudio.ie`, authenticated by the existing server boundary. Only the editable approval's final exact wording ever crosses that boundary. Raw note bodies stay private by design.

**Notes privacy boundary:** raw note bodies are private by default and are intentionally excluded from shared workspaces, timeline views, task views, signal summaries, and public collaboration surfaces. Notes can create work from a note only through explicit user approval.

**Notes shares with the suite:**
- *Notes → Tasks:* one-way extraction. The user selects exact wording, may edit it in approval, and explicitly sends that approved text to Tasks. Notes stores the idempotent receipt and resulting task id; retrying the same approved operation cannot create a duplicate. The full source note stays private, editable, and unarchived.
- *Notes → Signal:* deferred to v2+. Signal may receive approved, non-sensitive extracts or aggregate signals, but raw note text does not enter briefings by default.
- *Tasks → Notes:* never. A task does not become a note. A task can *reference* a note through an approved extraction edge, but the data flows one way.

**No exports in v1** beyond a single-note copy-to-clipboard. Bulk export, OPML, JSON-dump etc. are deferred to demand.

---

## 7 · What it isn't (locked refusals)

These are decisions to *never* build in Notes. They make the product distinct from the dozens of capture/knowledge tools it will be compared against.

- **Not a wiki.** No internal links between notes. No backlinks. No graph. No "connections" view.
- **Not a knowledge base.** No taxonomy. No required tagging. No "topic" or "category" abstraction.
- **Not a second brain.** The brand will not use the phrase. It positions Notes as a self-improvement aid; that's not what this is.
- **Not journaling.** No daily note. No "today" template. No date-based scaffolding. The user can use Notes for journaling — that's their choice — but the product won't shape itself around it.
- **Not collaborative.** Notes is single-user in v1. No sharing. No comments. No real-time. Tasks and Timeline are where shared work lives.
- **Not configurable.** No themes. No fonts. No layout options. No "appearance" panel. Same restraint as Tasks and Signal.
- **Not AI-marketed.** No "AI summary". No "AI tagging". No "AI search". The voice rules apply.
- **Not infinite-canvas.** No spatial canvas. No mind-map. Notes is a stream and a search field.

---

## 8 · Non-overlap with Tasks (the load-bearing question)

This is the question Plan 1.2 was created to answer. Notes and Tasks both let the user create text-shaped artifacts; if the line between them is fuzzy, both products suffer.

**The line:**

| Tasks | Notes |
|---|---|
| Committed work | Uncommitted thought |
| Required: title | Optional: title (first line is title) |
| Required: status | No status concept |
| Optional: due date, assignee, project | None of these exist in Notes |
| Lifecycle: open → done | Lifecycle: written, optionally extracted |
| Belongs to a project | Belongs to a stream |
| Surfaces in a briefing (Signal) | Does not surface in a briefing |
| Multiplayer | Single-user |

**The mental model:** Notes is the private inbox of thought. Tasks is the commitment ledger. Extraction is the act of choosing what crosses from one to the other.

**Why one-way only:** a task carries structure (status, due date, assignee, project) that a note does not have. Demoting a task to a note would discard that structure silently — a destructive operation hidden behind a button. Better: the user closes the task, optionally writes a note about why. The two are kept honest.

**What about overlap edge-cases?**
- *"I want to capture a quick to-do"* — that's a Task. Tasks has a quick-add too. The user picks the surface. The brand does not arbitrate.
- *"I want to write a long-form note about a task"* — that's a Note that mentions the task. Or a comment on the task itself. Both work. We don't enforce.
- *"I want to keep meeting minutes"* — that's a Note, plus zero or more promotions. Notes is the right surface.

**Refusal:** we will not build a "smart" Notes-to-Tasks extraction that auto-detects todo-shaped sentences. That moves the line back into fuzzy territory and breaks promise #3 ("never automatically"). Extraction is always a deliberate user action.

---

## 9 · How the notebook stays brand-coherent

A capture product is brand-coherent only if capture is genuinely fast. Below the design budget below, Notes is *another* capture tool. Above it, Notes is *the* capture tool for the 80%.

**Locked design budgets:**
- Cold start to capture-field-focused: < 1.0s on a mid-tier mobile device.
- Warm start (already-open tab): instant. Capture field is always focused when the tab is foregrounded.
- Save → visible in stream: < 100ms perceived. (Optimistic write.)
- Search → first results: < 200ms for a corpus < 10k notes.

**Locked visual budget:**
- One responsive screen. No nav header and no standalone sidebar or search rail; search is integrated into the notebook command surface.
- Capture field is the largest element by visual weight on first paint.
- The stream is typography only. No card chrome, no shadows, no rounded panels per-item. Desktop detail uses a selected-row split; mobile detail is full-screen and serial.
- Note and search-result reading text stays within a 64–72 character measure and uses contextual snippets rather than arbitrary line truncation.
- The notebook wordmark gesture (per BRAND.md + suite design-system): `notes.` with the M·02 caret — a held cursor blink that indicates the capture surface is ready for input. It does not breathe, drift, or loop as ambient decoration.
- Marketing hero contract: Notebook First. First paint shows a focused capture surface. Within about one second, the note is visible in the stream. Any extraction beat must be explicit approval into Tasks and must end as an indigo approved-action indicator. Reduced motion renders the final notebook state directly.

**Locked voice in the product itself:**
- The empty capture field shows a quiet private-writing line with a blinking caret. It uses the locked seven-line set from Cycle 9.4b and disappears the moment the user begins typing.
- Empty state on a brand-new account: "Nothing here yet. Start typing." Period. Not a tour, not a tutorial, not a sample-data offer.
- Zero notifications. Notes never pings. The product is silent by default.

---

## 10 · Implementation map

Notes is scaffolded as a Next.js 16 application with Clerk auth,
Turso-backed persistence, and the legacy notebook surface live at `/app`.
The selected hybrid is now in Phase 2 implementation and is not yet recorded as
shipped. It must remain server-gated and fail off to the retained legacy notebook
until production verification is complete.

| Concern | Where it gets built | Plan |
|---|---|---|
| Project scaffold | Next 16, Turso, Drizzle, Clerk | Shipped |
| Compact SSR-first capture + flat recency stream | `/app` server shell + `src/app/app/Notebook.tsx` | Phase 2 in progress; legacy surface remains live |
| Private empty state | `src/app/app/PrivateNotesEmptyState.tsx` | Shipped |
| Integrated search + contextual snippets | Turso FTS5 via debounced server action; no search rail | Phase 2 in progress |
| Desktop selected-row split + mobile full-screen detail | `/app` notebook and detail components | Phase 2 in progress |
| Editable body + version-checked conflict recovery | Notes persistence/actions with Keep local, Use remote, and Keep both paths | Phase 2 in progress |
| Offline exact-writing retention + retry | Notebook pending-operation state and retry path | Phase 2 in progress |
| Approved action extraction | Exact selection → editable approval → explicit cross-repo POST to `tasks.signalstudio.ie/api/notes-extract`; source retained; idempotent receipt | Phase 2 contract in progress; legacy direct-promotion/archive behavior superseded |
| Reversible release | Server-only `NOTES_HYBRID_NOTEBOOK_ENABLED=1` selects the hybrid component; absent/other values select the retained legacy component | Required before production promotion |
| Email capture | Resend Inbound webhook → `/api/capture/email` → slug-routed user_preferences | Code shipped (N-1); operator-blocked on `NOTES_CAPTURE_INBOUND_SECRET` + DNS |
| Marketing site | `src/app/page.tsx` | Shipped |

**Important:** raw note reads live behind `requireUser()` and stay scoped
to the signed-in creator. Collaboration must happen through approved
extracts, summaries, or linked tasks, never through raw note exposure.

---

## 11 · Open questions

Numbered for reference. Resolve in Plan 9 cycles or earlier as needed.

1. **Markdown or plain text?** v1 is plain text. Markdown rendering on view (not on input) seems right for v1.x — defer the call.
2. **Mobile.** Capture-from-mobile is the highest-value surface for this product, but mobile-app is deferred to Plan 10. Open question: does v1 ship a strong mobile *web* capture, or wait for native?
3. **Encryption at rest.** Notes are personal. Are they encrypted server-side beyond standard DB encryption? Defer to a security-pass cycle (Plan 4) — flag for that cycle.
4. **Account boundary.** Single-user, but is the account shared across the Signal Studio suite (one login → all four products) or per-product? Suite-wide is the obvious answer; confirm in Plan 9.1.
5. **Capture limits.** Note size cap? Daily note count cap on free tier? Defer to pricing definition (post-Plan-6).
6. **Backup / export.** v1 ships with no export. At what point does that become a sticking point? Wait for the first user to ask.

---

## 12 · This document is a contract

When the live marketing site says one thing and this document says another, one of them is wrong. The fix is not to leave them inconsistent.

When a build cycle in Plan 9 wants to ship something this document forbids — the build cycle does not silently break the contract. It changes this document first, with a recorded reason, and then ships against the new contract.

When this document is wrong, fix it here first. Then the code. Then the marketing site.

---

*Locked 2026-05-09 in Plan 1 · Cycle 1.2 (Strategic Foundation). Amended 2026-07-18 after Ethan's exact hybrid selection; Phase 2 implementation is in progress and no production shipment is claimed by this amendment. Companion documents: BRAND.md (voice and visual rules), Signal product definition (sibling product definition, locked in Cycle 1.1).*
