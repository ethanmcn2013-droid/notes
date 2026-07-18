# Option B: Quiet Editorial Stream

Status: complete coded Phase 1 direction  
Thesis: exceptional reading quality without weakening three-second capture  
Production status: unchanged

## Direction

Quiet Editorial Stream treats captured thought as writing worth reading, while keeping capture at the top and structure optional.

The direction is ordered as:

1. Notes masthead and a short privacy-oriented line.
2. Focused capture.
3. Honest state language.
4. Search.
5. A measured stream grouped by broad captured-time bands.
6. Detail and extraction in the editorial flow.

The groups are Today, This week, and Earlier. They are passive time landmarks derived from deterministic captured time, not journal pages, user-managed folders, or a calendar.

## Structural composition

### Desktop

- A centered 920 px canvas.
- An editorial stream constrained to about 72 characters for reading.
- A masthead balances the Notes wordmark with one quiet sentence.
- Capture retains primary placement above search.
- The stream uses a small 88 px time-label column and a wider writing column.
- Row excerpts can use natural line height and more context than A or C.
- Opening a note replaces the grouped stream with a centered Reading view; Back restores its created-time place.

### Mobile

- Masthead, capture, state, and search stack into one column.
- Time labels move above each group instead of consuming a side column.
- Long excerpts wrap naturally.
- Detail becomes a single-column Reading view with full-width critical actions.
- The composition remains an application because controls, state language, and recency stay explicit.

## Capture moment

What the user sees:

- A quiet masthead, followed immediately by the private capture composer.
- A three-line writing area on desktop and a mobile-safe minimum height.
- Clear save and multiline rules.

What happens:

- The shared save-only keyboard contract applies.
- The note enters the newest time group immediately.
- Pending, failed, offline, and saved state remain attached to the writing.
- Escape invokes loss prevention.

Why it fits B:

- Capture is given generous breathing room without becoming marketing.
- The first saved note joins a readable page rather than a compressed feed.

## Stream moment

What the user sees:

- The recent page, followed by Today, This week, and Earlier.
- A first-line title and a longer context excerpt.
- Relative time and quiet extraction/sync metadata.
- No cards, avatars, folders, or journal calendar.

What happens:

- Opening replaces the grouped stream with a dedicated Reading view; returning restores the note inside its captured-time group.
- Long-form detail uses a comfortable reading measure and auto-growing editor.
- Save, copy, delete, undo, and back are explicit.
- Editing does not move the note to a different group in the fixture because grouping uses created time.

Why it fits B:

- Broad time landmarks reduce scanning effort without asking the user to organize.
- Natural excerpts make meeting notes and longer thought easier to recognize.
- Created-time grouping avoids the category drift of a daily-note or journal model.

## Search moment

What the user sees:

- Search between capture and the editorial stream.
- While searching, date groups collapse into one Matches group.
- Snippets center the first matching term.
- Matching text is marked in title or context.
- Previous and Next move through results.

What happens:

- Command/Ctrl+K focuses search.
- Search uses the shared normalized ordering.
- Up and Down open the next or previous result.
- Escape or Clear restores broad time groups and recency.
- A polite result count is announced after a short delay.

Why it fits B:

- Context snippets answer why a result matched.
- Collapsing to Matches avoids false time hierarchy during retrieval.
- Search remains part of the same page, not a separate mode.

## Detail and approved extraction moment

What the user sees:

- The complete private note at a readable measure.
- A deliberate editorial cut: selected private wording becomes an editable approved extract.
- Boundary copy explains that the raw note stays in Notes.

What happens:

- Exact selection is required.
- Approved wording can be tightened without editing the source note.
- Cancel has no effect outside the transient preview.
- Send produces an idempotent simulated receipt.
- Failure and safe retry stay next to the approved wording.
- The source note returns to its original created-time group when Reading closes.

Why it fits B:

- Extraction reads as an editorial decision, not a shortcut or automatic classification.
- The relationship between private context and committed wording is visually explicit.

## State treatment

| State | B treatment |
| --- | --- |
| Empty | Capture plus a quiet writing-first empty line; no template offer. |
| Loading | Capture remains ready; static loading geometry stays visible and any new session capture appears immediately above the unavailable fixture history. |
| Saving | Pending note occupies its proper editorial place immediately. |
| Saved | Status recedes; body rhythm stays stable. |
| Offline | One restrained state line and retained pending notes. |
| Failed | Recovery stays attached to the exact note. |
| Read-only | The page remains useful for search and reading. |
| Extraction failure | The editorial-cut panel retains approved wording and safe retry. |

## Exact local review URLs

### Desktop, 1440 canvas

| Review moment | URL |
| --- | --- |
| Capture | [Open B capture desktop](http://127.0.0.1:4329/__design-lab/notes?option=b&scenario=capture&dataset=normal&mode=default&viewport=1440) |
| Stream | [Open B stream desktop](http://127.0.0.1:4329/__design-lab/notes?option=b&scenario=stream&dataset=normal&mode=default&viewport=1440) |
| Search | [Open B search desktop](http://127.0.0.1:4329/__design-lab/notes?option=b&scenario=search&dataset=normal&mode=default&viewport=1440) |
| Detail + extraction | [Open B detail desktop](http://127.0.0.1:4329/__design-lab/notes?option=b&scenario=detail&dataset=normal&mode=default&viewport=1440) |

### Mobile, 390 canvas

| Review moment | URL |
| --- | --- |
| Capture | [Open B capture mobile](http://127.0.0.1:4329/__design-lab/notes?option=b&scenario=capture&dataset=normal&mode=default&viewport=390) |
| Stream | [Open B stream mobile](http://127.0.0.1:4329/__design-lab/notes?option=b&scenario=stream&dataset=normal&mode=default&viewport=390) |
| Search | [Open B search mobile](http://127.0.0.1:4329/__design-lab/notes?option=b&scenario=search&dataset=normal&mode=default&viewport=390) |
| Detail + extraction | [Open B detail mobile](http://127.0.0.1:4329/__design-lab/notes?option=b&scenario=detail&dataset=normal&mode=default&viewport=390) |

### Protected preview, 1440 canvas

Vercel Authentication is enabled. These exact routes passed authenticated 200, `data-option="b"`, and `noindex` checks.

| Review moment | Protected URL |
| --- | --- |
| Capture | [Open protected B capture](https://signal-notes-design-7os3l8464-ethanmcn2013-1730s-projects.vercel.app/__design-lab/notes?option=b&scenario=capture&dataset=normal&mode=default&viewport=1440) |
| Stream | [Open protected B stream](https://signal-notes-design-7os3l8464-ethanmcn2013-1730s-projects.vercel.app/__design-lab/notes?option=b&scenario=stream&dataset=normal&mode=default&viewport=1440) |
| Search | [Open protected B search](https://signal-notes-design-7os3l8464-ethanmcn2013-1730s-projects.vercel.app/__design-lab/notes?option=b&scenario=search&dataset=normal&mode=default&viewport=1440) |
| Detail + extraction | [Open protected B detail](https://signal-notes-design-7os3l8464-ethanmcn2013-1730s-projects.vercel.app/__design-lab/notes?option=b&scenario=detail&dataset=normal&mode=default&viewport=1440) |

## Stress routes

- [Dense editorial stream at 1728](http://127.0.0.1:4329/__design-lab/notes?option=b&scenario=stream&dataset=dense&mode=default&viewport=1728)
- [Long-content edge cases](http://127.0.0.1:4329/__design-lab/notes?option=b&scenario=detail&dataset=edge&mode=default&viewport=1440)
- [Edge-case search at 390](http://127.0.0.1:4329/__design-lab/notes?option=b&scenario=search&dataset=edge&mode=default&viewport=390)
- [Offline capture](http://127.0.0.1:4329/__design-lab/notes?option=b&scenario=capture&dataset=edge&mode=offline&viewport=390)
- [Ambiguous Tasks retry](http://127.0.0.1:4329/__design-lab/notes?option=b&scenario=detail&dataset=edge&mode=error&viewport=1440)

## Strengths

- Best long-form reading and recognition.
- Useful search context without introducing advanced query syntax.
- Broad time grouping improves scan orientation without requiring organization.
- Capture remains above retrieval.
- The private-to-approved transition has an intuitive editorial metaphor.
- Long notes are allowed to feel like writing rather than database rows.

## Trade-offs and risks

| Risk | Why it matters | Acceptance test |
| --- | --- | --- |
| Time groups may imply journaling | Journaling is a locked refusal. | User review must read groups as passive recency landmarks, not daily-note structure. |
| More vertical spacing reduces density | Dense operators may prefer A. | Compare 24 and 96-note scan speed on desktop and phone. |
| Masthead adds first-screen material | Capture must remain the dominant useful element. | Measure capture position and attention at 320 and 390 px. |
| Inline long detail can lengthen a group | Return-to-place may feel distant. | Open the large body in Earlier, edit, then return by keyboard and touch. |
| Editorial tone can drift toward magazine layout | This must remain a working application. | Verify state, controls, and focus are clearer than decorative layout. |
| Group copy and implementation must agree on created time | Updated-time wording would be misleading. | Keep documentation and UI explicitly tied to capture/created time. |

## Source map

- Direction composition and grouping: src/app/__design-lab/notes/option-b.tsx
- Shared interaction components: src/app/__design-lab/notes/lab-components.tsx
- Shared state and actions: src/app/__design-lab/notes/lab-store.tsx
- Deterministic timestamps and fixtures: src/app/__design-lab/notes/lab-fixtures.ts
- Editorial measure and responsive groups: src/app/__design-lab/notes/notes-lab.module.css

## Selection profile

Choose B if the strongest evidence favors:

- Long-form reading.
- Search recognition through context.
- A humane, authored feeling.
- Passive time orientation without user-managed organization.
- A clear editorial metaphor for deliberate extraction.

Do not choose B if final testing shows that spacing slows scanning, date groups feel like a journal, or masthead/editorial treatment delays capture.

## Production non-change statement

Option B exists only at the isolated design-lab route and uses fixture state. It does not replace /app, mutate real notes, call Tasks, change schemas, or alter production deployment.
