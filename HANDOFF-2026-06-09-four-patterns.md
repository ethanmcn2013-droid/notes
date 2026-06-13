# Four-patterns handoff — 2026-06-09

> _Director of Notes Product Excellence — Layer 2 (Recommend)_

This is the engineering handoff for the four capture-tightening patterns drawn from the 2026-06-09 competitive scan. Refusals named here are non-negotiable: they are PRODUCT.md §7 and §8 commitments restated at execution distance. If a question arises that this document does not answer, escalate before drifting.

---

## 1 · Strategic framing

Notes' wedge is one sentence: capture in three seconds, find it later, send to Tasks deliberately (PRODUCT.md §3). The four patterns below are not new features. Each is a tightening of an existing surface — the capture field, the search field, the network of capture sources, and the entry point from calendared work. Engineering must read them as discipline, not surface area.

The risk during execution is helpful-chrome drift: a picker added "to be safe", a toggle exposed "so users can choose", a tour added "so users discover it". Every one of those costs a second of capture. The patterns succeed only if the user does not notice them — capture is just faster, the photo just becomes findable, the clipper just sends, the meeting note is just already there.

Order of work is set by Patterns 1 and 3 first (cheap, ship within their own cycle), then 2 (a bundle decision), then 4 (operator-gated, last). Refuse anything that pulls Pattern 2 toward "AI features" or Pattern 4 toward auto-detected action items.

---

## 2 · The four specifications

### Pattern 1 — Drafts' "every open is a new blank"

Returning to `/app` resets cursor to a blank capture field. The stream stays beneath. Cursor is always upstairs.

**The job.** The wedding planner backgrounds the tab at the venue, returns three hours later at the florist with a new thought. The current capture surface is already auto-focused (`Notebook.tsx:192-199`) and the textarea is empty by default. The remaining gap: if the user typed two characters earlier and never pressed Enter, `draft` state survives across visibility changes. Drafts' guarantee is stricter — the field is empty on every foreground. Budget: 0 keystrokes between tab-foreground and ready-to-type. Drafts hits this; we already hit it on cold start but not on warm return when an uncommitted draft exists.

**Design intent.** No new chrome. One micro-gesture: when the tab regains visibility and `draft.length > 0` but more than 90 seconds have elapsed since the last keystroke, the existing draft slides down into a `Resume what you were typing?` strip directly under the capture field (mustard #C7A24A, 12px Inter, 200ms ease-out, dismisses on next keystroke). One tap on the strip restores the draft; ignoring it and typing fresh discards it silently. The cursor is always live above. The strip never appears within the 90-second window — short backgrounds are still the same session.

**The scope.**
- `C:\Users\ethan\signal-studio-workspace\notes\src\app\app\Notebook.tsx` — extend the existing `visibilitychange` handler (lines 201-209) to evaluate draft age. Add a `lastKeystrokeAt` ref alongside `draft` state.
- `C:\Users\ethan\signal-studio-workspace\notes\src\app\app\Notebook.tsx` — render the resume strip beneath the `.capture` label (lines 955-977), conditional on the new state.
- find: the CSS file holding `.capture` and `.capture-hint` styles (likely `src/app/globals.css` or `src/app/app/notebook.css` — verify before editing). Add `.capture-resume-strip` mirroring `.capture-hint` weight, mustard accent.
- No schema change. No server action. Pure client-side state.

**Refusals — what NOT to ship.**
- No "restore last draft on every open" — that re-introduces a pre-loaded field, which is exactly what Drafts refuses. (Pattern 1 itself.)
- No draft auto-save to the server. The draft is private working memory, not a note. (PRODUCT.md §6.)
- No history of past drafts. One resume offer, dismissed by typing. (PRODUCT.md §7, "Not a knowledge base".)
- No timer chrome ("expires in 60s"). The user does not need to manage this. (PRODUCT.md §9, "no notifications".)

**Success criteria.** A returning user with a stale uncommitted draft sees a blank cursor and types immediately. The resume offer is one tap away and never blocks input. A user who closes and reopens the tab within 90 seconds sees their draft intact (no regression). The strip never appears when `draft` is empty.

**Out of scope for v1.** Cross-device draft sync. Resume offers older than 24h (just discard).

**Edge cases (4).**
- User types, backgrounds, returns >90s, types one character → draft is replaced by the new character; the offer dismisses silently. Correct.
- User types, backgrounds, returns >90s, taps the strip → original draft restored, cursor at end. Correct.
- User has draft, hits Cmd+K to search, returns to capture → not a foreground event, draft stays. Correct.
- User has draft, deletes a note, focus returns to capture per existing code (lines 245-251) → not a visibility change, draft stays. Correct.

---

### Pattern 2 — Apple Notes' OCR-of-pasted-images

Pasted whiteboard photos are findable by the text inside them. No "AI" framing. No toggle. Behind the same flat search field.

**The job.** The trades operator photographs a supplier's handwritten delivery schedule, pastes it into a note while standing in the yard. Two weeks later they search "Tuesday delivery" and the note surfaces. Budget: 0 extra taps at capture. The OCR runs in the background; the search field stays a search field. Comparator: Apple Notes does this silently on-device; users do not know it is happening until search works.

**Design intent.** Images paste into the body as today (the body is currently plain text — this requires the v1.x markdown move PRODUCT.md §11.1 already flagged). The OCR text is stored separately and joined into the FTS5 index, not displayed inline. When a search match comes from an image's OCR text rather than the note body, the matching row in the stream shows a small mustard `found in image` chip after the title (10px Geist Mono, ink-faint, no icon — text only). One chip per matching note, no preview, no thumbnail in the stream. Click opens the note as usual.

**The scope.**
- `C:\Users\ethan\signal-studio-workspace\notes\src\server\db\schema.ts` — add a sibling `note_attachments` table: `{id, note_id (FK), kind: "image", storage_url, ocr_text, ocr_status, created_at}`. Keep raw note body and OCR text disjoint so the privacy boundary stays clean.
- `C:\Users\ethan\signal-studio-workspace\notes\src\server\actions\notes.ts` — new server actions `attachImage(noteId, file)` and (internal) `runOcr(attachmentId)`. The FTS5 trigger in `drizzle/0001_fts5_search.sql` extends to index `note_attachments.ocr_text` joined by `note_id` so `searchNotes()` (lines 133-181) needs no query change beyond a UNION over the FTS row.
- `C:\Users\ethan\signal-studio-workspace\notes\src\app\app\Notebook.tsx` — the capture textarea (lines 957-968) handles a `paste` event detecting image blobs and calls `attachImage`. The stream row (lines 1030-1086) renders the `found in image` chip when search results include attachment hits.
- find: storage. Notes does not currently have a blob store wired. Decision needed in §6.
- find: the FTS5 SQL file — likely `drizzle/0001_fts5_search.sql`. Verify and extend.

**Refusals — what NOT to ship.**
- No "AI" copy anywhere. Not on a button, not in a toast, not in marketing. (PRODUCT.md §7, "Not AI-marketed".)
- No toggle to enable/disable. Either it ships on or it does not ship. (PRODUCT.md §9, visual budget.)
- No OCR confidence display, no "edit recognised text" affordance. The text is invisible. (PRODUCT.md §3, capture budget.)
- No image-only notes view, no "media" filter. The note is the unit. (PRODUCT.md §7, "Not infinite-canvas".)
- OCR text never leaves Notes. Not in extracts, not in Tasks, not in Analytics. (PRODUCT.md §6 privacy boundary.)

**Success criteria.** A user pastes a whiteboard photo, captures, walks away. Within 30 seconds the search "whiteboard text fragment" returns that note with a `found in image` chip. If OCR has not completed, the search still returns body matches; the image becomes findable later, silently. No spinner, no notification, no "processing" state visible.

**Out of scope for v1.** Handwriting recognition quality tuning (ship with default Tesseract.js). Multi-page PDFs. Screen-recording text. Audio transcription. Editing OCR text.

**Edge cases (5).**
- Paste fails (file too large, >10MB) → silent fallback, image is not attached, capture continues with text body. No error toast.
- OCR returns empty (blank image) → no chip ever appears for this note. Correct.
- Search query matches both body and OCR text → no chip (body match takes precedence; chip would be misleading).
- User deletes the note → attachments cascade. Hard delete, no orphans.
- Same image pasted into two notes → two attachment rows, two OCR runs. We do not dedupe in v1; storage is cheap, dedup adds a join.

---

### Pattern 3 — Evernote's Web Clipper speed bar (1.2s budget)

When Notes ships a clipper, match Drafts' textarea budget. Opens, captures, sends. No notebook picker, no tags.

**The job.** The freelance designer is reading a client's brief in their browser, wants to capture one sentence with the URL. They press the clipper hotkey. A capture field opens over the page with the selection pre-filled and the page URL appended on the next line. Enter saves. The budget is 1.2 seconds from hotkey to saved — same as the textarea in `/app` opens. Comparator: Evernote's clipper currently takes 3-4s and presents a notebook picker. We refuse that.

**Design intent.** The clipper popup is a 1:1 of the capture field. Same Inter, same green caret, same `Enter saves` hint. No picker, no tag input, no "save and continue reading" button. One field, one keystroke, one close. The clipper icon in the browser toolbar is the wordmark `notes·` with the settle gesture from PRODUCT.md §9 (same 3.2s breath, no separate icon). On save, the popup closes with the same `is-fresh` 500ms fade the in-app stream uses, no toast.

**The scope.**
- find: the clipper is not yet in the repo. New top-level package `extension/` (Manifest V3, Chrome+Firefox). Sibling to `src/`, not inside it.
- `C:\Users\ethan\signal-studio-workspace\notes\src\app\api\capture\` — extend with a new `clipper` route POST handler that authenticates via Clerk session cookie on `notes.signalstudio.ie` (same-origin from a content script on third-party pages requires the extension to fetch with credentials and the route to allow it).
- `C:\Users\ethan\signal-studio-workspace\notes\src\server\actions\notes.ts` — reuse `createNote()` (lines 39-76) verbatim. The clipper is a thin caller. Body format: `{selection}\n\n{pageUrl}` — the URL is content, not metadata. No new field on the schema.
- find: clipper styling — share the in-app `.capture` styles by inlining the relevant rules into the extension bundle (no runtime fetch).

**Refusals — what NOT to ship.**
- No notebook picker. Notes has no notebooks. (PRODUCT.md §4.)
- No tag input. Notes has no tags. (PRODUCT.md §3.2.)
- No "summarise this page" button. (PRODUCT.md §7, "Not AI-marketed".)
- No full-page clip. The selection is the unit; if no selection, the field is empty and waits. (PRODUCT.md §3, capture is a thought, not a document.)
- No screenshot annotation, no "highlight to clip later". (PRODUCT.md §7, "Not infinite-canvas".)
- No notification on save. (PRODUCT.md §9, "Zero notifications".)

**Success criteria.** Hotkey to saved-and-popup-closed measured at < 1.2 seconds on a mid-range laptop with broadband. A user with no selection sees a blank capture field with the URL pre-filled on line 2; cursor is on line 1. Authentication failure surfaces inline ("Sign in to notes.signalstudio.ie") with a single click-through; no toast, no retry queue.

**Out of scope for v1.** Mobile share-sheet (PRODUCT.md §5 already defers to Plan 10). Offline queue. Safari extension (Chrome + Firefox cover the 80%). Right-click context menus.

**Edge cases (3).**
- User clips while signed out → inline sign-in prompt in the popup; the captured text is preserved in extension storage and committed after sign-in.
- Hotkey collides with a site's binding → extension hotkey wins (Manifest V3 commands are reserved). No fallback chord.
- Clipper opened with empty selection → URL on line 1, cursor at end; user types a thought, Enter saves both.

---

### Pattern 4 — Reflect's meeting-spawned note (adapted)

Calendar event → note pre-titled with the event title + attendees. NEVER auto-detected action items.

**The job.** The teacher's calendar shows "Parent call — Smith family" at 4pm. At 4:01pm they open Notes and the most-recent stream row is a note titled "Parent call — Smith family" with attendees listed beneath, ready for capture. Budget: 0 keystrokes for the boilerplate every meeting note used to need. Comparator: Reflect spawns notes from calendar events; we copy the boilerplate move and refuse everything else they bundle.

**Design intent.** A calendar integration (Google first, Microsoft later) runs server-side. Five minutes before a calendar event starts, an empty note is created with body = event title (line 1) + attendees list (lines 2-N) + blank line for capture. The note sits in the stream like any other; the user opens it and types. A small green `from calendar` pill appears next to the timestamp in the stream row (Notes green #6B8E5A, 10px Geist Mono — matches the existing `is-fresh` weight). The pill disappears after the user edits the note. Nothing else changes.

**The scope.**
- `C:\Users\ethan\signal-studio-workspace\notes\src\server\db\schema.ts` — add a nullable `source` column to `notes`: `text("source")` with values `null | "calendar"`. One column, no enum table.
- `C:\Users\ethan\signal-studio-workspace\notes\src\server\db\schema.ts` — new `calendar_connections` table: `{user_id, provider, refresh_token, calendar_id, created_at, updated_at}`. One row per connected calendar.
- `C:\Users\ethan\signal-studio-workspace\notes\src\app\api\` — new `calendar/connect` (OAuth start), `calendar/callback` (OAuth finish), `calendar/webhook` (Google push notifications or 5-minute polling cron).
- `C:\Users\ethan\signal-studio-workspace\notes\src\server\actions\notes.ts` — new internal `spawnCalendarNote(userId, event)` that calls `createNote` with the composed body and sets `source = "calendar"`.
- `C:\Users\ethan\signal-studio-workspace\notes\src\app\app\Notebook.tsx` — stream row (line 1068 area) renders the `from calendar` pill when `note.source === "calendar"` AND `note.updatedAt === note.createdAt` (unedited).
- find: settings UI for connecting a calendar. Likely a new section in `src/app/app/account/page.tsx`.

**Refusals — what NOT to ship.**
- No auto-detected action items. Not from the event, not from the typed note body, not ever. (PRODUCT.md §8 refusal, restated. This is the load-bearing refusal of the whole product.)
- No meeting summary, no transcript, no recording. (PRODUCT.md §7.)
- No "share with attendees". The note is private. (PRODUCT.md §6 privacy boundary.)
- No agenda field, no template. Title + attendees + blank, that is the entire scaffold. (PRODUCT.md §4.)
- No notification ("your meeting starts in 5 minutes — open your note"). (PRODUCT.md §9.)
- No retroactive spawn for events older than 24h. The user gets fresh meetings, not a historical dump.

**Success criteria.** Five minutes before a calendar event, a note exists in the stream with the title and attendees. The user opens, types capture, presses Enter on the body line as usual. The pill disappears the moment they edit. A user who never opens the note still sees it disappear into the recency stream like any other note — no special decay, no "unused meeting note" cleanup.

**Out of scope for v1.** Multi-calendar merging. Recurring-event handling beyond "spawn for each occurrence". Outlook/Microsoft Graph. Event update sync (if the event title changes after spawn, we do not chase it).

**Edge cases (6).**
- User has back-to-back meetings → each spawns its own note. No merging.
- Event has no attendees (solo focus block) → note is title-only. Still spawns.
- Event is declined by the user → no spawn. We honour their RSVP.
- Calendar disconnected after some notes spawned → existing notes stay. Source pill stays until edited.
- User edits the pre-filled body (deletes attendees) → pill disappears, note is now ordinary. Correct.
- Two devices both spawn the same event (race) → idempotent on `(user_id, calendar_event_id)`; second call is a no-op.

---

## 3 · Sequencing table

| Pattern | Effort | Depends on | Recommended cycle |
|---|---|---|---|
| 1 — Resume strip | 0.5 day | nothing | Next cycle |
| 3 — Clipper | 4-5 days | nothing in repo; clipper is greenfield | Cycle after Pattern 1 |
| 2 — OCR-of-pasted-images | 6-8 days | image-paste support (new), blob storage (new), FTS5 trigger extension | Cycle 3 |
| 4 — Calendar-spawned note | 5-7 days | OAuth flow (new), calendar webhook or cron, operator decision on provider | Cycle 4, operator-gated |

Honest day-estimates assume one engineer, full focus, the codebase as it stands today (Notebook.tsx already carries the promote/extract complexity; capture-field changes are surgical).

---

## 4 · Cross-cutting design notes

Two shared primitives emerge — both small, both worth naming:

1. **The provenance pill.** Patterns 2 (`found in image`) and 4 (`from calendar`) both want a 10px ink-faint chip beside a stream row's metadata. Same weight, same Geist Mono, same disappear-on-interaction rule. Implement once as `<NoteProvenanceChip kind="calendar" | "image-match">` and reuse. Mustard for image-match, green for calendar — colours from the locked palette, no new tokens.
2. **The capture field is the only input.** Patterns 1, 2, 3 all converge on the same textarea (or its clipper twin). Resist the temptation to introduce a "rich capture component". The textarea stays plain. Image-paste is a `paste` event listener on it, not a new component.

No other shared primitives. Patterns 1 and 4 do not touch each other; Patterns 2 and 3 do not share code paths. Do not invent a "capture sources framework" — there are two, three is fine, four would be over-abstracted.

---

## 5 · HQ sync footprint

Per-pattern, what changes in `studio/content/hq/products/notes.md`:

**Pattern 1 — Resume strip**
- `majorFeatures`: add `Resume offer for stale drafts on tab return — 90s threshold, dismissed by typing`
- `nextActions`: retire anything mentioning "draft persistence" or "session recovery" if present
- `blockers`: none

**Pattern 2 — OCR-of-pasted-images**
- `majorFeatures`: add `Pasted images findable by text inside them — silent OCR, no AI framing`
- `nextActions`: retire "image attachment" if present; add `Decide OCR engine (recommend Tesseract.js)` and `Decide blob storage (recommend Vercel Blob)`
- `blockers`: `Blob storage not wired` until §6 resolved

**Pattern 3 — Web Clipper**
- `majorFeatures`: add `Web Clipper — selection + URL, 1.2s budget, Chrome and Firefox`
- `nextActions`: retire "browser extension" if present
- `blockers`: none (extension is greenfield; no infra dependency)

**Pattern 4 — Calendar-spawned note**
- `majorFeatures`: add `Calendar event spawns a pre-titled note — title + attendees only, never action items`
- `nextActions`: add `Operator: decide Google-first vs Microsoft-first`
- `blockers`: `OAuth credentials not registered` until operator decides provider

Engineering can copy these straight in after each cycle ships.

---

## 6 · Operator decisions outstanding

- **OCR engine: Tesseract.js (local, ~2MB bundle, on-device) vs cloud vision API (note bodies cross the boundary — clashes with PRODUCT.md §6).** Recommend **Tesseract.js**. Privacy-coherent, no external API key, no per-image cost. Quality is "good enough" for typed text and printed receipts; handwriting is weaker but already a v2 problem (we do not promise handwriting in v1 copy).
- **Blob storage for pasted images: Vercel Blob (same vendor as hosting) vs S3 (portable) vs Turso file storage (keeps it in one place).** Recommend **Vercel Blob** for v1 — one less credential, one less integration, easiest to revoke per-user on account delete. Migrate to S3 only if cost becomes a problem.
- **Calendar provider first: Google vs Microsoft.** Recommend **Google first**. Higher overlap with the 80% (small business, freelance, trades on Gmail). Microsoft can ship in a follow-on cycle.
- **Clipper browsers first: Chrome+Firefox vs Chrome+Safari.** Recommend **Chrome + Firefox**. Manifest V3 is shared; Safari requires Xcode + a separate App Store path that doubles the effort. Safari follows in Plan 10 with native mobile.
- **Feature flag shape for the calendar pattern: per-user opt-in setting vs operator allow-list.** Recommend **per-user opt-in** (toggle in account settings, OFF by default). The pattern is value-positive but it touches an external system the user already authenticated against; opt-in is the honest default.
- **Resume strip threshold: 90 seconds — confirm or adjust?** Recommend **90s** as a starting value, instrument it (no analytics on note bodies, only on the dismiss-vs-tap rate), revisit at the first user-feedback cycle.

---

## 7 · Closing

Every line that ships these four patterns must make capture more effortless than it is today, or the line does not ship. The resume strip is one ref and one conditional render. The OCR is invisible until search rewards the user. The clipper is the textarea in a popup. The meeting note is the title and the attendees, already there. None of these are features the user discovers in a tour — they are tightenings the user notices only as the absence of friction. Refuse the helpful chrome. Refuse the toggle. Refuse the AI badge. Refuse the action-item detector. Capture in three seconds, find it later, send to Tasks deliberately — that is still the whole product, and these are still that product.

— Dalí
