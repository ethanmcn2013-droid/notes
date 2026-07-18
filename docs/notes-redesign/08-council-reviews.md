# Signal Notes Phase 1: council reviews

Status: three review rounds complete; hosted protection receipt pending
Council chair: primary implementation agent
Review date: 18 July 2026

## Council method

Seven specialist roles audited the same shared corpus, source, production-shaped preview, screenshots, tests, and performance evidence. Specialists were read-only. The chair alone integrated fixes, rebuilt, and reran acceptance.

The review intentionally separated:

- Verified behavior: source, live inspection, screenshots, test output, or measurement.
- Strong inference: a conclusion supported by the evidence but not directly measured in users or field telemetry.
- Evidence gap: external or production behavior the fixture lab cannot prove.

## Round 1: authoring council

The authoring review established the three direction theses and rejected any shared-shell recolour exercise.

| Role | Evidence reviewed | Authoring decision |
| --- | --- | --- |
| Product architecture and boundary | Canonical product docs, current notebook/actions, one-notebook fixtures, extraction reducer | Keep one notebook; remove workspace/Timeline/archive/voice/stats from the lab; capture saves only; selection and approval are mandatory for Tasks. |
| Visual and editorial design | Design tokens, baseline desktop/mobile, A/B/C screenshots | A is operational, B is editorial, C is spatial; keep neutral paper/ink, Geist, hairlines, restrained indigo, and no shadow/card theatre. |
| Interaction and mobile | Live baseline, keyboard paths, 320/390/768/1280/1440/1728 compositions | Native autofocus and serial mobile capture are invariant; protect Escape, place, exact draft, and every non-pointer action. |
| Accessibility | Baseline labels/targets/focus, initial axe work, responsive semantics | Use native textareas/buttons, a single polite live region, 44 px critical controls, focus return, forced-colour outlines, reduced motion, and a level-one mobile detail heading. |
| Front-end architecture and performance | Next/React shape, initial HTML, hydration, 96-note stream, build chunks | Server-render the capture field, lazy-load the active direction, isolate draft updates, share a pure reducer/store, and measure the production build without claiming field results. |
| Privacy and cross-product boundary | Auth/actions, Tasks transport, review mode, fixture code | Do not import server/auth/database/network/persistence capability; build only the exact approved payload; hard-close production; require a separate protected secret-free project. |
| Red-team benchmark | Official Apple Notes, Bear, Drafts, Simplenote, Notion, and Things documentation | Borrow readiness, exact-text survival, contextual search, recovery, and compact keyboard entry; reject their folders, tags, databases, task fields, and ecosystem complexity. |

Round 1 output: the audit, principles, privacy contract, state matrix, three coded directions, shared 96-note corpus, and initial automated/evidence harness.

## Round 2: fresh rejection review

The fresh council was instructed to reject the work when evidence was incomplete. It found material defects; the chair fixed them before final acceptance.

| Rejection finding | Severity | Resolution | Final proof |
| --- | --- | --- | --- |
| Dirty detail could be replaced by row, search-result, scenario/dataset/mode, or C shortcut navigation | Blocker | Reducer-level dirty guards plus shortcut ownership check | Browser test covers A row/search and C Command/Ctrl+K paths. |
| Empty/Loading capture could clear the field while hiding the new session note | Blocker | Session captures remain visible above unavailable fixture history | Model and browser tests cover Empty and Loading in all directions. |
| Async save/Tasks timers could settle into a changed mode or reset fixture | High | Timer-time state validation, generation/current-note checks, and reconnect rescheduling | Browser test covers Default to Offline, Error to Default, Saving to Default, and dataset reset during send. |
| Option C could hide controls while an active query still filtered the stream | High | Close search clears the active query; previous scenario transition is tracked once | Targeted regression and full 36-test matrix pass. |
| Parser-time draft bootstrap could install duplicate listeners/scripts | High | One insertion guard, permanent install sentinel, one-shot claim, exact pre-hydration Enter queue | Initial-HTML count and delayed-JavaScript duplicate execution tests pass. |
| Copying an intentionally empty dirty draft fell back to the old body | High | Copy uses the visible detail draft exactly | Browser test passes. |
| C hid conflict recovery at 320 px | High | State banner moved outside the mobile-hidden capture band | 320 px conflict actions and heading test passes. |
| Late dense-row focus could land offscreen | High | Detail/opener focus also scrolls into view with nearest alignment | Dense late-row viewport test covers A/B/C. |
| Text-spacing reflow could clip the auto-sized detail editor | High | Detail editor permits overflow and spacing test includes paragraph spacing | 320/reflow and text-spacing tests pass. |
| C mobile detail began at H2 | Medium | Mobile-only level-one `Private note detail` heading | 320 px browser test passes. |
| Closed rows retained controls to absent detail panels | Medium | `aria-controls` is emitted only while the controlled panel exists | Full axe matrix and browser suite pass. |
| Search movement announced count but not the active title | Medium | Settled movement announcement includes the result title | Search announcement tests pass. |
| Use Selection was actionable without a selection and focus did not enter the preview | Medium | Disable until exact selection; after activation focus Approved wording; receipt retains its own close focus | Extraction focus/cancel/receipt tests pass. |
| Canceling extraction erased a still-valid selection and prevented immediate reopening | Medium | Cancel clears transient extraction/task state but preserves the exact current textarea selection | Model test and both extraction focus browser tests pass. |
| Edited approved wording could be lost through Back, row/result navigation, C search shortcut, or review controls | Blocker | Open unsent extraction is protected work; every destructive path requires explicit keep/discard, in-flight sends block reset, and exact wording remains | Model guard test, cross-path browser test, 37/37 full matrix, and independent red-team live replay pass. |
| Mobile detail screenshots ended before the extraction boundary | Evidence blocker | Evidence script scrolls to `[data-extraction-state]` | Final A/B/C mobile detail captures show approval wording and send boundary. |
| Screenshot animation suppression corrupted transitional text in a retained receipt | Evidence blocker | Use reduced-motion context without Playwright fast-forwarding animations | Final 24-screen set recaptured after the change. |

Round 2 also rejected the performance-gate claim. No code change can erase the measured evidence: all three final candidates miss the requested focus, save, and search medians under the selected harsh synthetic profile. That remains a scored limitation.

## Round 3: final acceptance and evidence review

Final acceptance ran against a newly built preview-shaped production artifact.

| Discipline | Acceptance result | Remaining limitation |
| --- | --- | --- |
| Product architecture | Pass for Phase 1 | Fixture lab does not certify production conflict/offline APIs. |
| Visual/editorial | Pass for three distinct directions | B masthead/date grouping and C search rail remain trade-offs, not recommendations. |
| Interaction/mobile | Pass | No real soft-keyboard or touch-selection device run. |
| Accessibility | Automated acceptance pass | No external screen-reader, Safari, Firefox, or physical-device run. |
| Front-end architecture | Pass for isolated lab | Shared root Clerk/Sentry weight remains in the build; performance budgets miss. |
| Privacy/boundary | Pass inside lab source/runtime | Hosted environment and Vercel protection still require explicit verification. |
| Red-team benchmark | Pass with no imported taxonomy | Competitive review is documentation- and interaction-based, not a user study. |

Final receipts:

- 45/45 model/access tests passed.
- 17 lab files passed the capability scanner; 4/4 executable boundary tests passed.
- TypeScript passed with incremental output disabled.
- Optimized Next.js production build passed.
- 37/37 Playwright tests passed in 85.4 seconds.
- The browser matrix includes 27 A/B/C by mode automated WCAG scans.
- 24 screenshots, three videos, three traces, and a five-run-per-option performance record were regenerated from the final candidate.
- The preview-shaped route returns 200 and ordinary production markers hard-return 404 with no lab content.

## Specialist final positions

### 1. Product architecture and boundary critic

Verified strengths: one shared 96-note model, save-only capture, exact selection, editable approval, deterministic idempotency, retained source note, honest failure/conflict recovery, and no bloat taxonomy.

Risk retained: hosted privacy is operational until the separate project is proven secret-free and protected. Production creator scoping is audited, not simulated by owner-bearing fixtures.

Position: A is the best spine; add B reading and C deliberate-depth components.

### 2. Visual and editorial design critic

Verified strengths: A has the fastest visual scan; B has the best typography and reading rhythm; C is the most recognisably Signal. All three use disciplined neutral surfaces, one accent, borders instead of elevation, and no card wall.

Risk retained: A can feel generic, B can imply journaling/magazine, and C can become spatial ceremony.

Position: exact hybrid; do not carry B masthead/date grouping or C search rail.

### 3. Interaction and mobile capture critic

Verified strengths: native/pre-hydration capture, note/edit/unsent-extract loss prevention, stable return, visible sync state, full keyboard path, search focus retention, exact-copy behavior, and C full-screen mobile detail.

Risk retained: browser emulation cannot prove real soft-keyboard, touch selection, or platform editing behavior.

Position: A capture/search/recovery plus B reading and C responsive detail.

### 4. Accessibility critic

Verified strengths: 27 axe scans, 320 px reflow/conflict/heading, forced-colour focus, text and paragraph spacing, visible focus, target geometry, non-chattering announcements, and reversible focus states.

Risk retained: automated Chromium evidence is not WCAG conformance certification and does not replace VoiceOver/NVDA/TalkBack acceptance.

Position: the hybrid is acceptable for selection, subject to external AT acceptance in Phase 2.

### 5. Front-end architecture and performance critic

Verified strengths: initial HTML capture, shared pure model, isolated draft context, distinct lazy direction modules, deterministic async guards, dense typing stability, capability scanner, and strong testability.

Risk retained: native focus is 1.11-1.15 s, save 146-156 ms, and search 227-315 ms under the final synthetic profile. Root auth/telemetry chunks contribute parse/hydration cost.

Position: A is the safest implementation spine; C should contribute only high-value spatial components.

### 6. Privacy and cross-product boundary critic

Verified strengths: no server/auth/database/persistence/network import in the lab; no interaction fetch/XHR/beacon/WebSocket; exact three-field approved payload; no whole-note or first-line fallback; note remains private and present.

Risk retained: global CSP permits production-service hosts and the scanner deliberately focuses the lab module. The separate project must contain no inherited production credentials and must use platform authentication.

Position: pass only after hosted environment/protection receipts.

### 7. Red-team benchmark critic

Verified benchmark transfers: Drafts-like readiness and draft survival, Bear-like highlighted/contextual search, Simplenote-like honest sync/recovery, and Things-like compact keyboard completion. Apple/Notion breadth was deliberately refused.

Risk retained: a benchmark is not evidence that users prefer one composition; the selection gate remains necessary.

Position: no standalone option captures every strongest trait. Recommend the exact hybrid, then stop.

## Council recommendation and dissent

Unanimous useful intersection:

- A capture, flat recency, integrated search, keyboard, and failure recovery.
- B reading typography, line length, and contextual snippets.
- C desktop selected-row split, mobile full-screen detail, focus-only readiness caret, and private-to-approved boundary.

Explicit exclusions:

- No B masthead or date grouping in the recommended hybrid.
- No C search rail in the recommended hybrid.
- No production route replacement before selection.

Dissent and uncertainty are retained in the scorecard: B is the strongest standalone average, A the safest base, C the strongest brand expression, and performance remains below target for all three.

## Production non-change statement

The council authorizes only Phase 1 review. It does not select a direction or authorize replacing `/app`, changing schemas, touching real Notes/Tasks data, or publishing the redesign to ordinary production.
