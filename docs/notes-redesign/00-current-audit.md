# Signal Notes Phase 1: current experience audit

Status: Phase 1 design-lab record  
Audit date: 17 July 2026  
Source branch: feat/notes-world-class-lab-20260716  
Review route: /__design-lab/notes  
Production status: unchanged

## Executive finding

Signal Notes already has the right product thesis and several useful implementation seams, but the current notebook does not reliably uphold the thesis under failure, mobile pressure, or Tasks promotion.

The three most important confirmed defects are:

1. A failed create can remove the optimistic note after clearing the capture draft, which can lose the user's exact writing.
2. Direct promotion can derive a task from the first line without a selected-text preview, then archive the source note. That conflicts with the locked private-note and deliberate-extract contract.
3. The existing review-mode mutation path can resolve to a synthetic user while still calling real database actions. It is not a safe foundation for a public or semi-public design review.

The Phase 1 lab therefore uses deterministic, in-memory fixtures and a new interaction model. It does not import the production Notebook component, call production actions, persist browser data, or change the /app route.

## Audit scope and method

The audit combined:

- Canonical product and collaboration contracts in docs/PRODUCT.md and docs/COLLABORATION_LOOP.md.
- Workspace and repository operating instructions.
- Design-system tokens and component guidance.
- Source review of the current notebook, server actions, authentication, search, persistence, and cross-product writes.
- A live local run of the current /app surface on desktop and phone-sized viewports.
- Keyboard, target-size, accessibility, privacy, failure, and long-content review.
- Development-profile timing observations for initial DOM, first paint, focus readiness, and a throttled mobile rehearsal.
- A red-team comparison using current official documentation from Apple, Bear, Drafts, Simplenote, Notion, and Things.

This is not a production performance certification. Development timings establish architecture risk and a baseline for comparison; production-build evidence belongs in the final Phase 1 scorecard.

Durable live-baseline captures:

- `docs/notes-redesign/evidence/baseline/baseline-desktop-1440.png`
- `docs/notes-redesign/evidence/baseline/baseline-mobile-390.png`

These show the audited production notebook before any lab work. The design lab never replaced that route.

## Locked product contract

The following statements are treated as product constraints, not preferences:

- Notes is capture clarity.
- The promise is: Capture in three seconds. Find it later. Decide what becomes work.
- The artifact is one notebook: capture above, recency below, search as access.
- Notes contains private, uncommitted thought.
- Raw note bodies do not enter Tasks, Timeline, Signal, shared workspaces, guest views, or public surfaces.
- Only wording explicitly selected, reviewed, and approved by the user may be sent to Tasks.
- The note remains in Notes after an approved extract is sent.
- Search and recency are the default retrieval system.
- No folders, tags, projects, required titles, statuses, due dates, assignees, graph, wiki, second-brain model, dashboard, or automatic task detection.
- The suite sequence remains Notes to Tasks to Timeline to Signal.
- The product should feel calm at the surface and reveal power one layer down.

## Repository and runtime inventory

| Concern | Confirmed implementation | Audit consequence |
| --- | --- | --- |
| Framework | Next.js 16.2.5 App Router, React 19.2.4, TypeScript, Tailwind CSS 4 | The capture field can be server-rendered, but the current notebook is a large client surface. |
| Product route | Authenticated notebook at /app | Phase 1 must not replace or redirect this route. |
| Authentication | Clerk-backed creator scope through requireUser() in production actions | Raw reads are creator-scoped. Review-mode mutation safety is a separate problem. |
| Persistence | Turso/Drizzle server actions with an optimistic client prepend | Optimistic speed is appropriate, but failure recovery is unsafe today. |
| Capture | Enter saves; Shift+Enter adds a line; Command/Ctrl+Enter can save and directly promote | Direct promotion violates the required selected-extract review step. |
| Search | FTS5 server search with client fallback and diacritic normalization | The foundation is useful, but search presentation and announcement behavior need refinement. |
| Tasks handoff | Bearer-authenticated POST to Tasks, idempotent by user and note identity | The two-step selected extract is the correct seam. The direct first-line path is not. |
| Other input paths | Email capture exists behind operator configuration; voice capture is present in the notebook | Neither belongs in the primary Phase 1 comparison canvas. |
| Design system | Geist, semantic ink/paper tokens, indigo accent, hairlines, restrained motion | The current notebook includes off-contract shadows, green state seams, and mixed chrome. |
| Tests | Unit and repository checks, Playwright browser tooling, axe tooling, experience capture harness | The lab can be tested without a new production dependency. |
| Review convention | Review access mode can bypass normal authentication | The lab needs its own fail-closed route and a zero-production-data architecture. |

## Confirmed current behavior

### Capture and persistence

- The current client creates a temporary note, prepends it to the stream, and clears the draft before the server create resolves. See src/app/app/Notebook.tsx:740-795.
- If createNote throws, the temporary note is removed and the error is shown, but the cleared draft is not restored. See src/app/app/Notebook.tsx:819-822.
- Escape clears a non-empty capture draft immediately. See src/app/app/Notebook.tsx:1095-1101.
- Command/Ctrl+Enter calls commit with direct promotion. See src/app/app/Notebook.tsx:1102-1108.

Consequence: perceived save is fast, but exact user text is not protected in the two failure paths where protection matters most.

### Notes-to-Tasks boundary

- The direct promote action reads the owned note, derives the first non-empty line, and sends that line to Tasks. See src/server/actions/notes.ts:507-595.
- On success it writes the extract and task id, and archives the note. See src/server/actions/notes.ts:628-638.
- A separate selected-extract path exists and can send an explicitly shaped extract.
- The existing notebook also contains workspace selection, a direct Timeline form, an In Tasks archive section, and remove/unpromote behavior.

Consequence: the implementation contains a sound authenticated transport and idempotency seam, but the dominant interaction model blurs capture, commitment, workspace filing, and Timeline publication. It also treats promotion as a move when the contract defines it as a one-way approved edge.

### Retrieval and detail

- Recency and full-text search exist.
- Search can be focused with Command/Ctrl+K and cleared with Escape.
- The current stream serializes full note bodies to the client and renders a large list without an explicit long-stream rendering strategy.
- Open-note interaction exposes many controls before a simple read/edit/copy loop feels settled.
- The current detail surface does not provide the Phase 1 lab's explicit editable reading state, exact selection boundary, and durable return-to-place treatment as one coherent flow.

### Mobile and visual hierarchy

The live audit confirmed:

- On narrow mobile, the product stats rail precedes the primary capture field.
- At a 320 px rehearsal width, capture began around y=477 and the first note row around y=824. Capture therefore failed the first-screen priority test.
- The desktop surface uses a large capture treatment, modal-like elevation, and a side rail that compete with the notebook.
- Dense and long notes are truncated into a compact pattern that does not support confident long-form reading.
- Several row actions depend on hover, long press, or small targets rather than always-visible or keyboard-equivalent controls.

### Accessibility

Confirmed review findings:

- The microphone control measured about 20 by 20 CSS pixels in the current surface, below the intended 44 px product target and below a comfortable touch target.
- A wrapping label can cause the capture textarea's accessible name to absorb nearby microphone and hint content.
- Search result announcements can be triggered too frequently while typing.
- Escape can clear writing and leave focus on the document body.
- Opening and acting on a row requires a long focus journey.
- Forced-colors focus indication is not consistently preserved.
- The existing automated accessibility path does not fully exercise the intended WCAG 2.2 AA target-size rule set.

## Baseline performance observations

Local development measurements recorded during the audit:

| Profile | DOM/content observation | First contentful paint | Capture focus readiness | Interpretation |
| --- | ---: | ---: | ---: | --- |
| Desktop local development | 277 ms | 540 ms | 1.19 s | Useful architecture baseline, not a production result. |
| Simulated constrained mobile, 4x CPU slowdown plus network latency | Not treated as a shipping metric | Not treated as a shipping metric | About 8.5 s | Confirms that focus is coupled to a large hydrated client path. |

The production contract is stricter:

- Warm focus should feel instant.
- Cold focus should be under one second on a realistic mid-tier mobile profile where achievable.
- Save to visible stream should remain under 100 ms perceived.
- Search to first result should remain under 200 ms for the supported corpus.

These targets are acceptance gates. They are not claimed as achieved until a production build is measured.

## Defect register

| Priority | Finding | Evidence | Required Phase 1 response |
| --- | --- | --- | --- |
| P0 | Failed create can lose exact writing | Notebook.tsx:756-821 | Retain the optimistic row and exact body, mark it failed, and retry the same note identity. |
| P0 | Direct promote bypasses selected-text approval | Notebook.tsx:1102-1108; notes.ts:507-595 | Capture saves only. Extraction begins from a selection inside an open note. |
| P0 | Successful promotion archives/removes the private note | notes.ts:628-638 | A sent extract adds a receipt/indicator; the source note remains in recency. |
| P0 | Review-mode mutations are not isolated fixtures | Production actions still own database writes | Use a pure in-memory store with no server, database, auth, fetch, or persistence imports. |
| P1 | Escape destroys draft without confirmation | Notebook.tsx:1095-1101 | Present a loss-prevention choice and return focus to the editor. |
| P1 | Mobile hierarchy delays capture | Live 320 px audit | Put capture first and keep it immediately usable at every target width. |
| P1 | Product chrome obscures the notebook | Live desktop and mobile audit | Remove stats, workspace, Timeline, archive, email, and voice controls from comparison canvases. |
| P1 | Search announcements can chatter | Accessibility review | Debounce one polite result announcement and keep count text non-live. |
| P1 | Small or hidden action targets | Axe and manual target review | Use 44 px critical targets and a visible non-pointer path. |
| P1 | Focus readiness depends on hydration | Development timing and client architecture | Keep native autofocus in initial markup and minimize the active client island. |
| P2 | Full bodies and unbounded row effects raise dense-stream cost | Source review | Keep rows simple, avoid per-row timers, and test the 96-note fixture. |

## Current official benchmark

Reviewed 17 July 2026. The fact column is limited to what each vendor currently documents. The Signal inference column is a design conclusion, not a claim made by that vendor.

| Product | Confirmed official fact | Signal Notes inference | What Signal explicitly rejects |
| --- | --- | --- | --- |
| Apple Notes | Apple documents fast note creation, Quick Notes from another app or screen, and rich attachments such as scans, audio, images, and links. [Apple Notes guide](https://support.apple.com/en-euro/guide/iphone/iph9e04f3be2/ios) | Immediate entry from context is valuable. Signal should borrow readiness and clear save confidence, not breadth. | Folders, tags, Smart Folders, attachment breadth, collaboration, and feature accumulation as the main model. |
| Bear | Bear documents search as you type, highlighted search terms, in-note next/previous navigation, and keyboard Quick Open. [Bear search guide](https://bear.app/faq/how-to-search-notes-in-bear/) | Search should behave like navigation with useful context and deterministic movement. | Nested tags, backlinks, wiki links, special-search grammar, and a knowledge-management sidebar. |
| Drafts | Drafts documents launching directly to a ready editor without first naming or filing a document. Its Mac capture window retains unsaved text until explicitly saved or cleared. [Drafts getting started](https://docs.getdrafts.com/gettingstarted/) and [capture window](https://docs.getdrafts.com/docs/extensions/capture-window) | Ready-to-type entry and draft survival are the strongest relevant patterns. | Actions ecosystem, flags, workspaces, syntax modes, and capture routing in the primary notebook. |
| Simplenote | Simplenote documents instant search with keyword highlighting, visible sync behavior, Trash recovery, and note version history. [Simplenote overview](https://simplenote.com/simple/) and [official help](https://simplenote.com/help/) | Sync state and recovery should be legible without blocking writing. Search matches should expose useful context. | Tags, pinning, publishing, collaboration, internal links, and user-selected sort modes. |
| Notion | Notion documents a new-page command on desktop and mobile, while Web Clipper asks the user to choose a destination and can add task/database structure. [Create a page](https://www.notion.com/help/create-your-first-page) and [Web Clipper](https://www.notion.com/en-US/web-clipper) | A direct new-writing affordance is useful. Destination choice demonstrates the delay Signal must avoid at capture time. | Databases, page types, required destinations, templates, tags, assignment, and workspace structure in capture. |
| Things | Things documents a global Quick Entry shortcut, keyboard save with Command+Return, and immediate return to the prior app. It also documents Escape as discard in Quick Entry. [Things Quick Entry](https://culturedcode.com/things/support/articles/2249437/) | A complete keyboard path and compact transient feedback are valuable. Signal should add stronger loss prevention because a private note may be irreplaceable. | Task fields, lists, dates, tags, projects, and treating all captured text as committed work. |

### Benchmark conclusion

No benchmark justifies importing another product's taxonomy. The transferable strengths are narrower:

1. Ready-to-type launch.
2. Exact-text survival.
3. Immediate, honest save feedback.
4. Search with context, highlighting, and keyboard movement.
5. Deliberate transitions when text changes category.

Signal's distinctive opportunity is the private-to-approved boundary. None of the benchmark patterns changes the locked separation between an uncommitted note and committed work.

## Confirmed facts, inferences, unknowns, recommendations

### Confirmed facts

- Current optimistic save can discard exact writing on failure.
- Current direct promote does not require selection and archives the note.
- Current /app contains workspace, Timeline, archive, voice, and stats surfaces beyond the core notebook.
- The current mobile hierarchy does not prioritize capture.
- The repository already has the required browser, unit, and accessibility tooling.
- The isolated lab route is gated away from ordinary production and uses deterministic fixtures.

### Strong inferences

- A thinner initial capture island should materially improve focus readiness under constrained devices.
- Separating capture from extraction will reduce accidental commitment and make privacy easier to understand.
- Persistent visible state language will improve confidence more than decorative save animation.
- Structurally distinct options are necessary because compact operations, editorial reading, and spatial depth represent real trade-offs.

### Unknowns to close with final evidence

- Production-build cold-focus time under the final protected preview profile.
- Actual save-to-stream and search-to-result timing across all target browsers.
- Screen-reader behavior in VoiceOver and NVDA beyond automated semantics.
- Whether Vercel deployment protection is enforced for an unauthenticated visitor.
- Whether the 96-note dense fixture creates long-task or memory pressure on a realistic phone.

### Recommendations

1. Keep Phase 1 entirely isolated and non-persistent.
2. Make capture save-only across every key combination.
3. Preserve exact text in every failed or ambiguous save.
4. Allow Tasks handoff only from selected text, followed by an editable preview and explicit send.
5. Keep the private note in place after the handoff.
6. Compare three genuinely different hierarchies against the same reducer, fixtures, and state matrix.
7. Do not alter /app until Ethan selects A, B, C, or a named hybrid.

## Production non-change statement

This audit does not authorize or implement a production redesign. The Phase 1 branch adds only an isolated review route, fixtures, tests, evidence, and documentation. Production Notes routes, real Notes data, Tasks data, schema, authentication, and deployment behavior remain unchanged.
