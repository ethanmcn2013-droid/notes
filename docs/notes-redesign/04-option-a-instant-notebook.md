# Option A: Instant Notebook

Status: complete coded Phase 1 direction  
Thesis: the fastest, calmest, most operationally precise notebook  
Production status: unchanged

## Direction

Instant Notebook asks how little interface is needed to make private capture, recency, search, editing, and deliberate extraction feel complete.

The direction is compact, typographic, and linear:

1. Notes identity and compact search.
2. Focused capture.
3. Honest state language.
4. Flat newest-first stream.
5. Detail inserted directly beneath the selected row.

It is intentionally not a developer console. Labels use plain language, note text keeps comfortable line height, and the stream exposes context rather than reducing every note to a terse command row.

## Structural composition

### Desktop

- One centered column with a maximum width of 840 px.
- A hairline header pairs the Notes wordmark with compact search.
- The capture field is large enough to establish readiness but uses the compact composer.
- A flat ordered list provides title, context, relative time, extract state, and sync state.
- Opening a note inserts the editor immediately below that row, preserving the row's stream position.
- Extraction appears inside the open note only after a selection is prepared.

### Mobile

- The same hierarchy becomes one column with mobile-safe 16 px inputs.
- Header content and search stack.
- Capture maintains a 96 px minimum writing area.
- Rows become a single content column with time and state below the copy.
- Detail stays in the stream rather than becoming a new route.
- Critical buttons expand to stable touch targets and extraction actions become full width.

This continuity makes A the easiest direction to learn across devices. On mobile, capture remains ahead of compact search in both DOM and visual order, so readiness owns the first product moment.

## Capture moment

What the user sees:

- Capture a private note.
- A focused textarea with a quiet private-by-default cue.
- Save and multiline rules in one short help line.
- New line and Save note controls for touch users.

What happens:

- Enter and Command/Ctrl+Enter save only.
- Shift+Enter adds a line.
- The new note appears at the top immediately as saving.
- Simulated success becomes saved without moving the row.
- Failure retains exact text and offers Retry same note.
- Escape protects non-empty writing with Keep writing and Discard draft choices.

Why it fits A:

- The composer and first stream row are close together.
- Feedback stays attached to the note rather than opening a toast stack.
- No workspace, Tasks, Timeline, stats, email, voice, or archive control competes with capture.

## Stream moment

What the user sees:

- Recent notes in one ungrouped list.
- First-line title, useful following context, relative captured time, and quiet status.
- Hairlines instead of cards.

What happens:

- Every row is one keyboard-focusable open action.
- Failed notes expose recovery directly under the affected row.
- Open detail appears beneath the chosen row.
- Editing preserves created time.
- Copy has an explicit control.
- Delete requires confirmation and exposes Undo.
- Back to stream closes detail, with dirty-edit protection when needed.

Why it fits A:

- Recency remains the dominant navigation.
- No date headings interrupt rapid scanning.
- Detail is spatially tied to the note that opened it.

## Search moment

What the user sees:

- A compact search field in the header.
- Result count only while a query is active.
- Context snippets and highlighted matching text.
- Previous and Next controls.

What happens:

- Command/Ctrl+K focuses search.
- Up and Down move through the ordered results and open the current result.
- Escape or Clear removes the query.
- Clearing removes result metadata and restores recency.
- Search uses the same shared normalized ordering as B and C.

Why it fits A:

- Search never becomes a separate screen.
- The control is continuously discoverable.
- Result chrome disappears when it is not useful.

Trade-off:

- Persistent search adds more first-screen chrome than C's collapsed rail.
- Search before capture on narrow screens needs final hierarchy validation.

## Detail and approved extraction moment

What the user sees:

- A private-note heading, created timestamp, editable body, and restrained toolbar.
- Selection length and Nothing has been sent language.
- A separate private-note to approved-extract boundary only after Use selection.

What happens:

- The user selects exact wording.
- Use selection opens the preview.
- Approved wording can be edited.
- Cancel clears the transient handoff.
- Send runs the in-memory idempotent Tasks simulation.
- Error mode rehearses an accepted request with a lost response.
- Retry returns the same receipt and says no duplicate was created.
- The private note remains in the stream throughout.

Why it fits A:

- Extraction stays one layer below detail.
- The boundary is explicit without creating a permanent secondary pane.

## State treatment

| State | A treatment |
| --- | --- |
| Empty | Capture plus one quiet first-note line. |
| Loading | Capture remains ready; static stream placeholders remain and any new session capture appears immediately. |
| Saving | Row is already visible with saving text. |
| Saved | Status quiets without celebratory motion. |
| Offline | One compact banner plus queued row state. |
| Failed | Recovery is attached to the failed row. |
| Read-only | Search and reading stay active; writing controls pause. |
| Extraction failure | Failure and Retry safely remain in the approval panel. |

## Exact local review URLs

### Desktop, 1440 canvas

| Review moment | URL |
| --- | --- |
| Capture | [Open A capture desktop](http://127.0.0.1:4329/__design-lab/notes?option=a&scenario=capture&dataset=normal&mode=default&viewport=1440) |
| Stream | [Open A stream desktop](http://127.0.0.1:4329/__design-lab/notes?option=a&scenario=stream&dataset=normal&mode=default&viewport=1440) |
| Search | [Open A search desktop](http://127.0.0.1:4329/__design-lab/notes?option=a&scenario=search&dataset=normal&mode=default&viewport=1440) |
| Detail + extraction | [Open A detail desktop](http://127.0.0.1:4329/__design-lab/notes?option=a&scenario=detail&dataset=normal&mode=default&viewport=1440) |

### Mobile, 390 canvas

| Review moment | URL |
| --- | --- |
| Capture | [Open A capture mobile](http://127.0.0.1:4329/__design-lab/notes?option=a&scenario=capture&dataset=normal&mode=default&viewport=390) |
| Stream | [Open A stream mobile](http://127.0.0.1:4329/__design-lab/notes?option=a&scenario=stream&dataset=normal&mode=default&viewport=390) |
| Search | [Open A search mobile](http://127.0.0.1:4329/__design-lab/notes?option=a&scenario=search&dataset=normal&mode=default&viewport=390) |
| Detail + extraction | [Open A detail mobile](http://127.0.0.1:4329/__design-lab/notes?option=a&scenario=detail&dataset=normal&mode=default&viewport=390) |

The protected preview uses identical queries on the verified preview origin. Exact protected links are added to the durable decision record after deployment protection is tested.

## Stress routes

- [Dense stream at 1728](http://127.0.0.1:4329/__design-lab/notes?option=a&scenario=stream&dataset=dense&mode=default&viewport=1728)
- [Edge-case search at 390](http://127.0.0.1:4329/__design-lab/notes?option=a&scenario=search&dataset=edge&mode=default&viewport=390)
- [Failed save and retry](http://127.0.0.1:4329/__design-lab/notes?option=a&scenario=capture&dataset=edge&mode=error&viewport=390)
- [Ambiguous Tasks retry](http://127.0.0.1:4329/__design-lab/notes?option=a&scenario=detail&dataset=edge&mode=error&viewport=1440)
- [Read-only detail](http://127.0.0.1:4329/__design-lab/notes?option=a&scenario=detail&dataset=normal&mode=read-only&viewport=1440)

## Strengths

- Shortest visual path from capture to recency.
- Lowest conceptual overhead.
- Strong keyboard model.
- Search is always discoverable.
- Row-attached failure recovery is difficult to miss.
- Inline detail creates a clear note-to-editor relationship.
- Compact composition should perform well across ordinary laptops.

## Trade-offs and risks

| Risk | Why it matters | Acceptance test |
| --- | --- | --- |
| Search precedes capture visually on mobile | It may dilute capture-first hierarchy. | Compare first screen and first focus at 320, 390, and 430 px. |
| Inline detail expands the list | A long note can push surrounding recency far away. | Open the large-body fixture in the dense dataset and verify return context. |
| Compact rhythm can feel clinical | Notes must still feel humane and readable. | Editorial review of long paragraphs, links, Unicode, and private writing. |
| Persistent search consumes header space | It is less calm than a collapsed rail when unused. | Compare first-paint attention with C. |
| Single-column width limits wide-screen distinctiveness | Very wide displays may feel conservative. | Inspect at 1728 px and confirm whitespace feels intentional. |

## Source map

- Direction composition: src/app/__design-lab/notes/option-a.tsx
- Shared capture, search, row, detail, and extraction: src/app/__design-lab/notes/lab-components.tsx
- Shared state and actions: src/app/__design-lab/notes/lab-store.tsx
- Deterministic model and search: src/app/__design-lab/notes/lab-model.ts
- Responsive visual system: src/app/__design-lab/notes/notes-lab.module.css

## Selection profile

Choose A if the strongest evidence favors:

- Fastest routine capture.
- Minimal learning cost.
- Compact recency scanning.
- One continuous desktop and mobile mental model.
- Product discipline over expressive spatial identity.

Do not choose A if final testing shows that compactness weakens long-note reading, mobile capture hierarchy, or wide-screen presence.

## Production non-change statement

Option A exists only at the isolated design-lab route and uses fixture state. It does not replace /app, mutate real notes, call Tasks, change schemas, or alter production deployment.
