# Signal Notes Phase 1: comparison scorecard

Status: final candidate accepted locally and verified on the protected preview
Review date: 18 July 2026
Scoring rule: equal-weight 15-category review; no score is rounded up to meet the brief
Production status: unchanged

## Chair verdict

All three directions are complete, interactive, and materially stronger than the audited production baseline. None meets the requested 9.9 average with every category at 9.5 or above. The gate is therefore reported as **not met**, chiefly because the final synthetic mobile profile misses all three latency budgets and because external assistive-technology and physical-device evidence is not available.

Option B has the highest equal-weight final score at 9.06. Option A is the safest product and implementation spine. Option C is the most distinctive and now has the fastest measured native-focus and search medians, but it carries the most responsive and state complexity.

The council recommendation is a specified hybrid, not an automatic selection:

- A: compact SSR-first capture, flat newest-first recency, integrated search, keyboard model, and attached recovery.
- B: 64-72 character detail measure, longer contextual snippets, and editorial reading rhythm; exclude the masthead and date grouping.
- C: selected-row desktop stream/detail split, serial full-screen mobile detail, focus-only readiness caret, and explicit private-to-approved boundary; exclude the search rail.
- Shared: exact-selection extraction, editable approval, idempotent receipt, source-note retention, conflict recovery, and the in-memory privacy boundary.

Ethan still selects A, B, C, or an exact hybrid before any production route changes.

## Final acceptance scorecard

| Category | A | B | C | Evidence used for all three scores |
| --- | ---: | ---: | ---: | --- |
| Capture speed | 8.8 | 8.6 | 8.4 | `evidence/screenshots/{a,b,c}-capture-mobile.png`; initial-HTML, delayed-hydration, autofocus, and first-input tests in `tests/design-lab/notes-lab.spec.ts`; `evidence/performance.json` |
| Retrieval clarity | 9.2 | 9.3 | 9.0 | `{a,b,c}-search-{mobile,desktop}.png`; multi-term/accent/approved-extract model tests; search clear, next/previous, focus-retention, and C close-filter browser tests |
| Reading quality | 8.6 | 9.5 | 9.1 | `{a,b,c}-detail-{mobile,desktop}.png`; long-body edge fixture; A inline, B Reading replacement, and C split/full-screen source compositions |
| Editing confidence | 9.1 | 9.2 | 9.2 | Dirty-navigation guards, Command/Ctrl+S, copy-exact-draft, delete/undo, opener return, and async-reset tests |
| Extraction clarity | 9.4 | 9.5 | 9.6 | Detail/extraction screenshots; exact browser-selection, editable approval, cancel, hard failure, ambiguous acceptance, retry, and receipt tests |
| Privacy legibility | 9.5 | 9.5 | 9.6 | Visible private-note to approved-extract boundary; 17-file capability scanner; four executable boundary tests; zero interaction network calls |
| Mobile ergonomics | 9.0 | 8.8 | 9.2 | 390 px screenshots; real-phone versus review-canvas geometry; 320 px conflict, heading, reflow, and target checks; C serial full-screen detail |
| Keyboard quality | 9.2 | 9.2 | 9.0 | Roving direction tabs, autofocus, Enter/Shift+Enter, Escape protection, search navigation, open/edit/delete/undo, extraction, receipt, and focus-return tests |
| Accessibility | 8.9 | 9.0 | 8.9 | 27 A/B/C by mode axe scans, forced-colours focus, reduced-motion CSS, text-spacing/paragraph-spacing, visible-focus, heading, and live-region tests; no external screen-reader run |
| Visual craft | 8.9 | 9.4 | 9.3 | 24 deterministic screenshots at 390 and 1440; three interaction videos; neutral paper/ink, hairline, Geist, and restrained indigo system |
| Brand distinctiveness | 8.3 | 8.9 | 9.5 | A operational notebook, B editorial Reading replacement, and C spatial readiness/private-depth composition; not shared-DOM recolours |
| State completeness | 9.4 | 9.4 | 9.3 | Default, Empty, Loading, Saving, Saved, Offline, Error, Conflict, and Read-only tests; visible session captures during Empty/Loading; three conflict resolutions |
| Performance | 7.7 | 7.8 | 7.7 | Five cold runs per option under the documented 4x CPU/150 ms latency mobile profile; every option misses focus, save, and search targets |
| Maintainability | 8.8 | 8.6 | 7.9 | One shared pure reducer/store/corpus; lazy-loaded distinct directions; capability scanner; C has the largest breakpoint/search-disclosure surface |
| Overall product coherence | 9.2 | 9.2 | 9.1 | Product contract, state matrix, option source, screenshots, and automatic-failure audit; all preserve one notebook and Notes to Tasks separation |
| **Equal-weight average** | **8.93** | **9.06** | **8.99** | Arithmetic mean of the 15 unweighted category scores |

### Gate result

- Target average 9.9: not met by A, B, or C.
- No category below 9.5: not met by A, B, or C.
- Automatic failure: none remains in the final tested candidate.
- Phase 1 usability/implementation acceptance: passed, with the limitations below retained as explicit evidence gaps.

## Final production-shaped performance evidence

Source: `docs/notes-redesign/evidence/performance.json`, generated 18 July 2026 against the production build at `http://127.0.0.1:4329`.

| Metric | A | B | C | Brief target | Verdict |
| --- | ---: | ---: | ---: | --- | --- |
| First paint median | 772 ms | 740 ms | 748 ms | Informational | Recorded |
| Native focused capture median | 1,147.9 ms | 1,135.9 ms | 1,112.2 ms | Under 1,000 ms where achievable | Miss |
| Native focus captured | 5/5 | 5/5 | 5/5 | Capture present and focused | Pass |
| Lab hydration marker median | 3,398.7 ms | 3,253.9 ms | 3,265.7 ms | Informational | Recorded |
| Save to visible stream median | 146.1 ms | 153.4 ms | 155.7 ms | Under 100 ms perceived | Miss |
| Search to first result median | 315.4 ms | 308.2 ms | 227.2 ms | Under 200 ms | Miss |
| Dense-96 typing median / p95 | 16.7 / 18.7 ms | 16.6 / 19.0 ms | 16.5 / 18.6 ms | Responsive | Pass |
| Long-task p95 / maximum | 304 / 525 ms | 254 / 269 ms | 325 / 540 ms | Lower is better | Limitation |

Method: local production build, Chromium 149, 390 by 844 viewport, cache disabled, 4x CPU slowdown, 150 ms request latency, 1.6 Mbps down, 750 Kbps up, five cold isolated contexts per option. Native focus is the first `focusin` event. Typing uses synthetic input through the next paint approximation. These are local synthetic measurements, not field INP, real-radio, energy, or protected-preview measurements.

The final run is slower than an earlier rehearsal in save/search medians but materially more stable for C long tasks. The final run supersedes the rehearsal because it matches the accepted source and rebuilt artifact.

## Browser, accessibility, privacy, and artifact receipts

| Receipt | Final result | Durable evidence |
| --- | --- | --- |
| Pure model and access tests | 45/45 passed | `src/app/__design-lab/notes/lab-model.test.ts`, `lab-access.test.ts` |
| Capability boundary | 17 source files clean; 4/4 executable tests passed | `scripts/design-lab/privacy-boundary.mjs` and `.test.mjs` |
| Production browser matrix | 37/37 passed in 85.4 s | `tests/design-lab/notes-lab.spec.ts`, `notes-lab-geometry.spec.ts` |
| Automated WCAG matrix | 27 option/mode axe scans with no violations | Browser test `all direction and mode combinations pass automated WCAG 2.2 AA checks` |
| Network isolation | No fetch, XHR, beacon, or WebSocket during interactions; initial requests local-origin only | Browser tests `lab interactions issue no...` and `initial load contacts only...` |
| Screenshots | 24 final captures: A/B/C by four scenarios by mobile/desktop | `evidence/screenshot-manifest.json` and `evidence/screenshots/` |
| Interaction records | Three videos and three source-bearing Playwright traces | `evidence/videos/` and `evidence/traces/` |
| Production build | Next.js optimized build passed | Build receipt recorded in council review |
| Ordinary production boundary | Same build returns hard 404 with no fixture/lab content under production markers | Access tests plus production-shaped route receipt |
| Protected Vercel preview | Preview authentication enabled; anonymous request challenged; 12/12 authenticated scenario routes returned 200 with the correct option marker and `noindex` | `evidence/deployment-receipt.md` |
| Hosted environment isolation | Exactly three plain preview flags; no production secrets, integrations, or analytics | `evidence/deployment-receipt.md` |

## Automatic-failure audit

| Condition | Final verdict | Evidence |
| --- | --- | --- |
| More than one click before typing | Denied | Capture is in initial HTML, natively autofocused, and pre-hydration input/save are tested. |
| Folders, graphs, databases, or second brain | Denied | Shared fixture model and all three canvases remain capture, recency, search, detail. |
| Automatic task creation | Denied | Capture is save-only; exact selection, editable preview, and explicit send are mandatory. |
| Raw note leakage | Denied inside the lab | Payload has only noteId, exact approved body, and fixture workspaceId; scanner and no-network tests pass. |
| Shrunken-desktop mobile | Denied | All options reflow; C deliberately replaces split view with full-screen serial detail. |
| Card-wall stream | Denied | Every direction uses flat hairline rows. |
| Search as a separate product | Denied | Search filters the same in-memory stream; closing C search clears the active query. |
| Failed sync or navigation loses writing | Denied | Exact note bodies, detail edits, and unsent approved wording remain protected; stable identities are retryable and cross-mode timers are guarded. |
| Recolour-only option | Denied | A inline detail, B replacement Reading view, and C desktop split/mobile full-screen detail are structurally distinct. |
| Dense or long text breaks layout | Denied in tested matrix | 96-note corpus, 1,500-character fixture, 320/390/1440/1728 checks, visible-focus scrolling, and text-spacing checks pass. |
| Accessibility or keyboard missing | Denied | 37-test matrix includes full keyboard paths, 27 axe scans, forced colours, reflow, focus, and announcement behavior. |

## Evidence limitations that remain

- No VoiceOver, NVDA, TalkBack, Safari, Firefox, or physical-device acceptance was available in this Windows/Chromium run.
- Timing evidence is synthetic local evidence and does not prove field Core Web Vitals, energy, memory, or real radio behavior.
- Offline, sync, conflict, and Tasks behavior are deterministic simulations; they do not certify the production persistence APIs.
- The lab proves its own exact-selection payload and isolation model. It does not prove production creator scoping or guest/public exclusions beyond the audited production source.
- Hosted access was verified on the immutable candidate, but Vercel Authentication proves preview access control rather than production authorization or production Notes/Tasks behavior.

## Selection posture

Recommendation: the exact hybrid defined at the top of this document.

Selection status: awaiting Ethan. No production Notes component, route, persistence behavior, schema, Tasks integration, or real data has been changed.
