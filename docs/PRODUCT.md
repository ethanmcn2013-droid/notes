# Signal Notes · PRODUCT.md

**Locked product definition.** This document defines what Signal Notes *is*, who it's for, and — critically — how it stays distinct from Signal Tasks. It is the single source of truth for product decisions in this repo. When this document and the live site disagree, fix this document first if the document is wrong; otherwise fix the site.

Drafted in Plan 1 · Cycle 1.2 (Strategic Foundation). Companion to BRAND.md and analytics/docs/PRODUCT.md (the sibling lock).

---

## 1 · Position

Signal Notes is **capture clarity**. Where Tasks runs the work and Roadmap explains the work and Analytics tells you what to do about the work, Notes catches the work *before it is work*. The half-formed thought. The thing the meeting just decided. The fact that came up in passing. The decision that needs to be remembered but doesn't need to be done.

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

The product surface is one screen. It is called the **notebook**.

**Top:** the capture field. Always-visible, always-focused on open. Cursor lives here. Pressing Enter saves. There is no "save" button. There is no title field — the first line becomes the title. There is no folder picker. There is no tag picker. There is one keystroke (`⌘↵` or `⇧↵`) to commit; one keystroke (`Esc`) to discard.

**Below:** the stream. Recent notes, newest first. Each note shows: title (first line), one-line preview (next line), captured-at (relative time), one indigo dot if the note has produced an approved action draft. Clicking opens the note in place; the stream below scrolls down.

**Left rail (collapsible):** search. That's it. No folder tree. No tag cloud. No graph view. Search is fuzzy, full-text, and the only navigation primitive in v1.

**Bottom-right corner:** a single icon — the draft-action button — visible only when a note is open. One click should let the user approve a selected action extract for Signal Tasks and add the indigo dot to the note. The note itself is unchanged and private. The extraction is a one-way edge, not a move.

**No views.** No "card view", "outline view", "timeline view", "kanban view". One stream. Search to find. Recency to browse.

**No required structure.** No fields. No metadata. The note is a body of free text. The user can use markdown if they want; they don't have to.

---

## 5 · The mechanism (capture flow)

**Open → focused → typed → saved.** That is the flow. Each step has a budget.

| Step | Budget | Mechanism |
|---|---|---|
| Open | < 200ms | Static prerender of `/app`. Capture field is in initial HTML. No client-render dependency for first paint. |
| Focus | 0ms | Capture field is autofocused on mount. No click required. |
| Type | n/a | Plain `<textarea>`-equivalent (contentEditable in v1.x for markdown later). No editor framework. No plugins. |
| Save | < 100ms perceived | Optimistic local write, server sync in background. No spinner. The note is in the stream the moment Enter fires. |

**Capture from outside the app** (deferred to v1.5, but designed for now):
- Email-to-capture: `capture@notes.signalstudio.ie` writes the email body as a note.
- iOS / Android share sheet (mobile, deferred to Plan 10).
- Quick-capture URL pattern: `notes.signalstudio.ie/c?text=...` for clipboard and shortcut integrations.

**No real-time sync.** Multiplayer is out of scope for v1. Notes are single-user. Conflict resolution is "last write wins" for the rare cross-device edit case.

---

## 6 · What it reads, what it writes, what it shares

**Notes reads:** nothing automatically. It is purely a capture surface.

**Notes writes:** to its own database. Notes are stored as `{id, body, created_at, updated_at, extract_body?, promoted_task_id?}`. That is the whole schema in v1. `extract_body` holds the creator-authored action wording (Cycle 9.4b extraction-half, 2026-05-12). `promoted_task_id` is filled in by the cross-repo write to Tasks via `sendExtractToTasks` (Cycle 9.4b second half, 2026-05-12, also today). The cross-repo write hits `POST /api/notes-extract` on `tasks.signalstudio.ie` with the user's clerk userId + the noteId + the extract_body, authed via a shared `NOTES_TO_TASKS_SECRET` bearer. Only `extract_body` ever crosses the boundary. Raw note bodies stay private by design.

**Notes privacy boundary:** raw note bodies are private by default and are intentionally excluded from shared workspaces, roadmap views, task views, analytics summaries, and public collaboration surfaces. Notes can create work from a note only through explicit user approval.

**Notes shares with the suite:**
- *Notes → Tasks:* one-way extraction. User approves a selected action from the note, that action is sent to Tasks, and Notes stores the resulting task id. The full note body stays private.
- *Notes → Analytics:* deferred to v2+. Analytics may receive approved, non-sensitive extracts or aggregate signals, but raw note text does not enter briefings by default.
- *Tasks → Notes:* never. A task does not become a note. A task can *reference* a note through an approved extraction edge, but the data flows one way.

**No exports in v1** beyond a single-note copy-to-clipboard. Bulk export, OPML, JSON-dump etc. are deferred to demand.

---

## 7 · What it isn't (locked refusals)

These are decisions to *never* build in Notes. They make the product distinct from the dozens of capture/knowledge tools it will be compared against.

- **Not a wiki.** No internal links between notes. No backlinks. No graph. No "connections" view.
- **Not a knowledge base.** No taxonomy. No required tagging. No "topic" or "category" abstraction.
- **Not a second brain.** The brand will not use the phrase. It positions Notes as a self-improvement aid; that's not what this is.
- **Not journaling.** No daily note. No "today" template. No date-based scaffolding. The user can use Notes for journaling — that's their choice — but the product won't shape itself around it.
- **Not collaborative.** Notes is single-user in v1. No sharing. No comments. No real-time. Tasks and Roadmaps are where shared work lives.
- **Not configurable.** No themes. No fonts. No layout options. No "appearance" panel. Same restraint as Tasks and Analytics.
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
| Surfaces in a briefing (Analytics) | Does not surface in a briefing |
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
- One screen. No nav header. No sidebar (search rail is collapsible and starts collapsed).
- Capture field is the largest element by visual weight on first paint.
- The stream is typography only. No card chrome, no shadows, no rounded panels per-item.
- The notebook wordmark gesture (per BRAND.md): `notes·` with the *underline-writes-itself* on first paint. Once. Not on subsequent renders.

**Locked voice in the product itself:**
- The empty capture field shows a quiet private-writing line with a blinking caret. It uses the locked seven-line set from Cycle 9.4b and disappears the moment the user begins typing.
- Empty state on a brand-new account: "Nothing here yet. Start typing." Period. Not a tour, not a tutorial, not a sample-data offer.
- Zero notifications. Notes never pings. The product is silent by default.

---

## 10 · Implementation map

Notes is now scaffolded as a Next.js 16 private preview with Clerk auth,
Turso-backed persistence, and the locked notebook surface live at `/app`.

| Concern | Where it gets built | Plan |
|---|---|---|
| Project scaffold | Next 16, Turso, Drizzle, Clerk | Shipped |
| Capture field + stream | `src/app/app/Notebook.tsx` | Shipped |
| Private empty state | `src/app/app/PrivateNotesEmptyState.tsx` | Shipped |
| Search | Client-side filter now; Turso FTS5 later | Cycle 9.4 |
| Approved action extraction | Future Tasks API endpoint for selected extracts only | Cycle 9.4b |
| Email capture | Resend inbound or Mailgun routing → API endpoint | Plan 9.x |
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

*Locked 2026-05-09 in Plan 1 · Cycle 1.2 (Strategic Foundation). Companion documents: BRAND.md (voice and visual rules), analytics/docs/PRODUCT.md (sibling product definition, locked in Cycle 1.1).*
