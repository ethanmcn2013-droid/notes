# Option C: Capture Field

Status: complete coded Phase 1 direction  
Thesis: the most distinctive Signal relationship between readiness, memory, search, and deliberate promotion  
Production status: unchanged

## Direction

Capture Field treats Notes as a spatial system with three depths:

1. Readiness: a wide capture band.
2. Memory: the recency field and optional search rail.
3. Deliberation: an opened private note, then an invited approval boundary.

Nothing floats. Nothing animates ambiently. The caret/readiness idea is functional because focus is real and capture is always the first working field.

## Structural composition

### Desktop

- A wide canvas up to 1480 px.
- A restrained header with Notes identity and one Open search control.
- A full-width capture band, with state language occupying a secondary column only when needed.
- At rest, the stream uses the available width.
- Opening search creates a narrow left rail and a wider recency field.
- Opening a note creates a 4/8 stream/detail split.
- Opening both search and detail creates a 3/3/6 rail/stream/detail composition.
- Detail uses a quiet paper-soft surface rather than a floating card.

### Tablet

- Capture state stacks below the composer.
- If detail and search are both active, the search rail yields so stream and detail remain usable.
- The transition is progressive, not a squeezed three-column desktop.

### Mobile

- Header, capture, optional search, and stream are serial.
- Opening a note hides the other layers and presents full-screen private detail.
- Back to stream restores the serial notebook.
- The detail surface has a full-height paper background and safe touch controls.

This is the most responsive-specific option. Desktop gains simultaneous context; mobile gains a clear single task.

## Capture moment

What the user sees:

- Notes identity and a broad capture field.
- State language beside capture on wide screens and below it on smaller screens.
- A functional ready caret through true focus, not a decorative loop.

What happens:

- The shared save-only keyboard contract applies.
- A new note appears immediately in the recency field.
- Pending, failure, offline, and reconnect state are visible without interrupting capture.
- Escape protects the draft.

Why it fits C:

- Readiness forms a distinct horizontal layer above memory.
- Save feedback appears in the relationship between capture and stream, not as a detached notification.
- The layout expresses calm on the surface and depth only when invited.

## Stream moment

What the user sees:

- A full-width Recency field at rest.
- Compact rows with title, one-line context, time, and state.
- When detail opens, recency remains visible beside it on desktop.

What happens:

- Opening a note rebalances the workspace instead of expanding the row.
- The selected row remains marked in the stream.
- Detail editing, copy, delete, undo, and return use the shared behavior.
- On mobile the same event becomes a full-screen detail step.

Why it fits C:

- Desktop keeps recent memory present while the user reads or edits.
- Mobile avoids a tiny split view.
- The spatial transition explains depth without cards or a new route.

## Search moment

What the user sees:

- Search starts collapsed behind Open search.
- On desktop it becomes a dedicated narrow rail beside recency.
- The rail contains the same search, result count, previous/next, and plain explanation.
- On mobile it becomes an in-flow section above the stream.

What happens:

- Command/Ctrl+K opens the rail and focuses search.
- The Search scenario opens it automatically with delivery prefilled.
- Search narrows the same stream.
- Clear restores recency.
- Search remains available only when invited.

Why it fits C:

- Retrieval has a distinct place but not a separate product.
- The left rail exists only for search, honoring the locked refusal of folder trees.

Acceptance resolution:

- Closing the search rail clears the active query before hiding the controls, so the stream always returns to visible newest-first order. A hidden filter cannot survive the close action.

## Detail and approved extraction moment

What the user sees:

- Desktop: selected recency at left, private detail at right.
- Mobile: a full-screen private note with a clear Back to stream control.
- Extraction appears inside detail only after exact text selection.
- The private-to-approved boundary reads as a deeper layer, not a permanent adjacent product.

What happens:

- The user reads and edits without losing recency context on desktop.
- Selection enters an editable approval surface.
- Cancel returns to private detail.
- Send produces one simulated Tasks receipt.
- Error mode supports safe retry after an ambiguous response.
- The source note remains selected and present.

Why it fits C:

- Spatial depth maps directly to privacy depth.
- Recency, detail, and approval are progressively disclosed.
- Mobile remains focused on one layer at a time.

## State treatment

| State | C treatment |
| --- | --- |
| Empty | Capture band remains dominant; recency field has one quiet line. |
| Loading | Capture is usable; static loading geometry stays visible and any new session capture appears immediately. |
| Saving | State sits beside capture on wide screens and on the pending row. |
| Saved | Recency stabilizes without a toast or layout shift. |
| Offline | Capture band explains queueing; rows retain pending state. |
| Failed | Recovery remains attached to the affected row. |
| Read-only | Spatial system remains navigable; mutation controls pause. |
| Extraction failure | The detail layer retains approved wording and Retry safely. |

## Exact local review URLs

### Desktop, 1440 canvas

| Review moment | URL |
| --- | --- |
| Capture | [Open C capture desktop](http://127.0.0.1:4329/__design-lab/notes?option=c&scenario=capture&dataset=normal&mode=default&viewport=1440) |
| Stream | [Open C stream desktop](http://127.0.0.1:4329/__design-lab/notes?option=c&scenario=stream&dataset=normal&mode=default&viewport=1440) |
| Search | [Open C search desktop](http://127.0.0.1:4329/__design-lab/notes?option=c&scenario=search&dataset=normal&mode=default&viewport=1440) |
| Detail + extraction | [Open C detail desktop](http://127.0.0.1:4329/__design-lab/notes?option=c&scenario=detail&dataset=normal&mode=default&viewport=1440) |

### Mobile, 390 canvas

| Review moment | URL |
| --- | --- |
| Capture | [Open C capture mobile](http://127.0.0.1:4329/__design-lab/notes?option=c&scenario=capture&dataset=normal&mode=default&viewport=390) |
| Stream | [Open C stream mobile](http://127.0.0.1:4329/__design-lab/notes?option=c&scenario=stream&dataset=normal&mode=default&viewport=390) |
| Search | [Open C search mobile](http://127.0.0.1:4329/__design-lab/notes?option=c&scenario=search&dataset=normal&mode=default&viewport=390) |
| Detail + extraction | [Open C detail mobile](http://127.0.0.1:4329/__design-lab/notes?option=c&scenario=detail&dataset=normal&mode=default&viewport=390) |

### Protected preview, 1440 canvas

Vercel Authentication is enabled. These exact routes passed authenticated 200, `data-option="c"`, and `noindex` checks.

| Review moment | Protected URL |
| --- | --- |
| Capture | [Open protected C capture](https://signal-notes-design-ho4ai9mm4-ethanmcn2013-1730s-projects.vercel.app/__design-lab/notes?option=c&scenario=capture&dataset=normal&mode=default&viewport=1440) |
| Stream | [Open protected C stream](https://signal-notes-design-ho4ai9mm4-ethanmcn2013-1730s-projects.vercel.app/__design-lab/notes?option=c&scenario=stream&dataset=normal&mode=default&viewport=1440) |
| Search | [Open protected C search](https://signal-notes-design-ho4ai9mm4-ethanmcn2013-1730s-projects.vercel.app/__design-lab/notes?option=c&scenario=search&dataset=normal&mode=default&viewport=1440) |
| Detail + extraction | [Open protected C detail](https://signal-notes-design-ho4ai9mm4-ethanmcn2013-1730s-projects.vercel.app/__design-lab/notes?option=c&scenario=detail&dataset=normal&mode=default&viewport=1440) |

## Stress routes

- [Wide search and dense recency](http://127.0.0.1:4329/__design-lab/notes?option=c&scenario=search&dataset=dense&mode=default&viewport=1728)
- [Wide detail split](http://127.0.0.1:4329/__design-lab/notes?option=c&scenario=detail&dataset=edge&mode=default&viewport=1728)
- [Mobile full-screen detail](http://127.0.0.1:4329/__design-lab/notes?option=c&scenario=detail&dataset=edge&mode=default&viewport=390)
- [Offline capture band](http://127.0.0.1:4329/__design-lab/notes?option=c&scenario=capture&dataset=edge&mode=offline&viewport=390)
- [Ambiguous Tasks retry](http://127.0.0.1:4329/__design-lab/notes?option=c&scenario=detail&dataset=edge&mode=error&viewport=1440)

## Strengths

- Most distinctive Signal Studio information architecture.
- Desktop retains recency while reading or editing.
- Search is genuinely progressive.
- Private-to-approved depth has a strong spatial explanation.
- Mobile detail is purpose-built rather than a compressed split.
- The wide capture band gives readiness a functional identity.

## Trade-offs and risks

| Risk | Why it matters | Acceptance test |
| --- | --- | --- |
| Hidden active query after closing search | Filtered results can become inexplicable. | Close an active search and require clear state or automatic clear. |
| More responsive branches | Complexity can create breakpoint defects. | Test 320, 390, 430, 768, 1024, 1280, 1440, and 1728 px. |
| Desktop split narrows stream context | Long titles may wrap excessively beside detail. | Open detail in dense and edge datasets at 1024 and 1280 px. |
| Mobile full-screen detail hides capture and stream | Return must be effortless and context must restore. | Open, edit, save, back, and inspect prior place by touch and keyboard. |
| Spatial novelty can distract from speed | Distinctiveness must not become ceremony. | Compare focus and save timings directly with A. |
| Search rail could drift toward a sidebar | The product forbids navigation trees. | Keep the rail search-only with no saved filters, folders, or tags. |

## Source map

- Direction composition and search disclosure: src/app/__design-lab/notes/option-c.tsx
- Shared interaction components: src/app/__design-lab/notes/lab-components.tsx
- Shared state and actions: src/app/__design-lab/notes/lab-store.tsx
- Responsive grid and mobile full-screen detail: src/app/__design-lab/notes/notes-lab.module.css
- Functional Notes wordmark: src/app/__design-lab/notes/lab-wordmark.tsx

## Selection profile

Choose C if the strongest evidence favors:

- A distinctly Signal spatial system.
- Simultaneous recency and detail on desktop.
- Progressive search and extraction.
- Purpose-built mobile detail.
- Readiness and privacy expressed through structure, not decoration.

Do not choose C if final testing shows hidden search state, breakpoint fragility, slower capture, or a weaker return-to-recency path than A or B.

## Production non-change statement

Option C exists only at the isolated design-lab route and uses fixture state. It does not replace /app, mutate real notes, call Tasks, change schemas, or alter production deployment.
