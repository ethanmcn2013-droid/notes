# Signal Notes Phase 1: design principles

Status: Phase 1 design-lab contract  
Applies to: Options A, B, and C  
Production status: unchanged

## North star

Capture in three seconds. Find it later. Decide what becomes work.

Every design decision is judged in that order. Capture gets the first second, retrieval gets the durable structure, and Tasks handoff remains one deliberate layer below private writing.

## Principle 1: readiness is the first interface

The first useful state is a focused plain-text capture field, not a dashboard, statistic, loading animation, workspace chooser, or navigation shell.

Required:

- Native autofocus is present in the initial capture markup.
- The field is visually obvious without becoming an oversized hero.
- A phone user can begin typing before scrolling.
- Readiness remains visible in reduced motion and forced colors.

Rejected:

- Focus that waits on a large client bundle.
- Animated placeholder sequences.
- A microphone, folder, workspace, or project choice before writing.

Evidence basis: the locked product budget, the current mobile hierarchy failure, and Drafts' officially documented ready-to-type launch model.

## Principle 2: exact writing is more important than optimistic neatness

Optimistic insertion is correct only when the user's text survives every result.

Required:

- A saved note appears in the stream immediately.
- Pending, synced, and failed are honest, quiet, and persistent enough to understand.
- Failure retains the exact body and stable note identity.
- Retry acts on the same identity and cannot create a duplicate.
- Escape never destroys non-empty writing without an explicit choice.

Rejected:

- Clearing the draft and then removing the only remaining copy.
- A success toast before the final state is known.
- Retry through a second create path.

Evidence basis: the current create failure defect and Simplenote's official emphasis on sync integrity and recovery.

## Principle 3: private capture and committed work are different categories

A note is uncommitted thought. A Task is an explicit commitment. The interface must make the category change visible and deliberate.

Required:

- Capture never sends to Tasks.
- Extraction starts from an exact text selection in an open private note.
- The selected wording enters a separate editable approval surface.
- Cancel leaves no cross-product effect.
- Send transmits only noteId, approved body, and workspaceId.
- A successful receipt leaves the note in its original stream position.

Rejected:

- First-line promotion.
- Todo detection.
- Raw-body payloads.
- Archiving or removing the source note after promotion.
- Direct Timeline publication from Notes.

## Principle 4: recency is structure enough

The notebook remains a flat stream. Hierarchy comes from typography, time, and the open-note relationship, not user-managed taxonomy.

Required:

- Newest notes are first.
- Search temporarily narrows the same stream.
- Opening preserves visible context and offers an obvious return.
- Long bodies remain readable in detail.

Rejected:

- Folders, tags, projects, views, graphs, dashboards, databases, pinning systems, or a journal calendar.
- A grid or card wall.
- Search as a separate analytics surface.

## Principle 5: typography carries the visual system

The product is ink on paper. The UI should feel authored and precise because type, line length, rhythm, and hairlines are disciplined.

Required:

- Geist is the sole interface family.
- Weights remain 400, 500, and 600.
- Predominantly neutral semantic surfaces.
- Indigo is reserved for focus, active selection, approved promotion, and small identity marks.
- Borders and surface contrast replace elevation.
- Long first lines, paragraphs, links, phone numbers, Unicode, and emoji wrap without breaking layout.

Rejected:

- Gradients, glass, neon, heavy shadows, decorative color coding, or per-note cards.
- Giant text used to simulate quality.
- Multiple accent colors for state.

## Principle 6: power appears one layer down

Capture and recency stay nearly self-explanatory. Editing, deletion, copying, and extraction appear after the user opens a note.

Required:

- Critical actions have visible button and keyboard paths.
- Opening a note does not teleport the user into a different product.
- Extraction is available only in note detail.
- The private-to-approved boundary is legible without becoming a warning wall.

Rejected:

- Dense action trays on every row.
- Hover-only controls.
- A persistent Tasks panel beside every note.

## Principle 7: mobile is a distinct composition

Mobile is the most likely capture context, not a compressed desktop proof.

Required:

- Capture comes first.
- Text inputs use a mobile-safe type size.
- Critical targets are at least 44 by 44 CSS pixels.
- A visible New line action supplements Shift+Enter on touch keyboards.
- Detail becomes a clear serial step when a desktop split cannot fit.
- Safe-area spacing protects bottom actions.

Rejected:

- Desktop columns squeezed into a phone.
- Horizontal scrolling.
- Actions that depend on hover, long press, or a hardware modifier.

## Principle 8: keyboard support is complete, not ornamental

Every critical action must be possible without a pointer, while text editing conventions remain predictable.

Shared model:

| Context | Key | Result |
| --- | --- | --- |
| Capture | Enter | Save the note only. |
| Capture | Shift+Enter | Insert a new line. |
| Capture | Command/Ctrl+Enter | Save the note only; never promote. |
| Capture | Escape with text | Open loss-prevention choices. |
| Global | Command/Ctrl+K | Focus search. |
| Search | Up/Down | Move through results and open the current result. |
| Search | Escape | Clear search and retain focus. |
| Detail | Command/Ctrl+S | Save changes. |
| Detail | Escape | Return to stream; if edits are dirty, protect them first. |

The current lab implements the save-only capture rule. Extraction has no one-stroke shortcut because approval must remain explicit.

## Principle 9: accessibility is part of the interaction architecture

Required:

- Semantic labels do not absorb unrelated help or controls.
- One polite live region announces completed state changes.
- Search results are announced after a short pause, not on every key.
- Errors identify retention and recovery.
- Focus moves to opened detail and returns to a sensible context.
- Forced-colors focus is visible.
- Reduced motion removes non-essential transitions.
- Loading uses static geometry rather than looping shimmer.

Rejected:

- Color-only state.
- Disabled controls with no explanation.
- Focus loss to the document body.
- Ambiguous icon-only critical controls.

## Principle 10: measurement must not observe private content

Interaction timing is useful; note bodies and search terms are not telemetry.

Allowed lab metrics:

- Time to focused capture.
- Save invocation to visible stream.
- Search input to result render.
- Visible result count.

Disallowed:

- Note body, title, selected text, approved wording, search query, email address, or clipboard contents.
- Session replay of private text.
- Network export from the fixture store.

The lab root and private fields carry replay-masking attributes, and the in-memory store intentionally resets on reload.

## Principle 11: failure language states what happened

Copy should answer three questions:

1. Is my writing still here?
2. Did anything leave Notes?
3. What can I safely do next?

Examples in the lab:

- Your exact writing is retained.
- Nothing has been sent.
- Retry the same note.
- Already accepted. No duplicate created.
- The note remains in this stream.

The language avoids false certainty, internal system jargon, celebratory tone, and decorative urgency.

## Principle 12: the three options test real trade-offs

| Option | Primary question | Structural choice |
| --- | --- | --- |
| A, Instant Notebook | How little interface is enough for precise daily capture? | Compact single column with detail inserted directly below its row. |
| B, Quiet Editorial Stream | How much reading quality can be added without weakening capture? | Editorial measure with secondary time groups and in-flow detail. |
| C, Capture Field | Can Signal express readiness, recency, and private depth as one spatial system? | Wide capture band, optional search rail, and stream/detail split on desktop. |

The options share fixtures, reducer behavior, state language, privacy boundary, and component semantics. They do not share one information hierarchy with cosmetic changes.

## Benchmark transfer policy

The audit's official-source benchmark identifies patterns worth learning from:

- Drafts: ready-to-type launch and retained unsaved capture.
- Bear: search context, highlighting, and deterministic result movement.
- Simplenote: legible sync and recovery.
- Apple Notes: quick entry from context.
- Things: concise keyboard capture and return.
- Notion: a useful counterexample where destination and structure can tax quick capture.

These are behavior-level observations. No benchmark's visual design, taxonomy, or feature breadth is copied.

## Acceptance guardrails

An option is not ready for selection if any of these are true:

- Typing requires a click on first load.
- A failed save can remove exact text.
- Capture can create a task.
- The full note crosses the Tasks boundary.
- A sent extract removes the source note.
- Mobile places capture below secondary content.
- Search opens a separate product surface.
- Critical actions are hover-only.
- Dense or long fixtures break layout.
- Options differ mainly by color.
- Accessibility or keyboard paths are incomplete.

## Production non-change statement

These principles govern the isolated Phase 1 lab. They do not change the production notebook, production data model, live Notes-to-Tasks behavior, or /app route. Production implementation begins only after an explicit A, B, C, or named hybrid selection.
