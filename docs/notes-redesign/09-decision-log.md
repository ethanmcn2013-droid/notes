# Signal Notes redesign decision log

Status: Founder selected the exact hybrid; Phase 2 in progress
Decision owner: Ethan
Review date: 18 July 2026
Production implementation: in progress behind a fail-off server gate; not yet shipped

## Founder selection - recorded 18 July 2026

Ethan authorised Codex to proceed with the council's exact hybrid recommendation and push the verified implementation to production. The normalised selection record is:

> SELECT HYBRID — A's compact SSR-first capture, flat newest-first stream, integrated search, keyboard and recovery model; B's 64–72 character reading measure, contextual snippets, and editorial rhythm; C's selected-row desktop split, mobile full-screen detail, focused readiness caret, and private-to-approved boundary; plus the shared exact-selection, editable approval, idempotent receipt, source-note retention, and version-checked conflict model. Exclude B's masthead/date grouping and C's search rail.

This selection ends the Phase 1 decision gate and authorises Phase 2 implementation. The protected A/B/C evidence remains intact for provenance and comparison. It does not itself claim that the hybrid has shipped to production.

## Selected hybrid implementation contract

The founder selected this exact hybrid:

1. Use A's compact SSR-first capture, flat newest-first stream, integrated search, keyboard model, and attached failure recovery as the product spine.
2. Use B's 64-72 character detail measure, longer contextual search snippets, and editorial reading rhythm.
3. Use C's selected-row desktop stream/detail split, serial full-screen mobile detail, functional focus-only readiness caret, and explicit private-note to approved-extract boundary.
4. Keep the shared exact-selection, editable approval, idempotent receipt, source-note retention, and conflict-recovery model.
5. Exclude B's masthead and date grouping.
6. Exclude C's search rail; search remains integrated like A on every viewport.
7. Keep the note body editable in detail and retain exact offline writing plus safe retry.
8. Replace silent last-write-wins with version-checked conflicts and explicit **Keep local**, **Use remote**, and **Keep both** recovery.
9. Supersede direct whole-note/first-line `Cmd/Ctrl+Enter` promotion and archive-on-send. The only Tasks path is exact selected wording → editable approval → explicit send; the source note remains.

Why: A is the safest coherent base, B is the strongest reading system, and C contributes the most distinctive high-value depth without requiring its full responsive/search complexity.

## Standalone trade-offs

| Direction | Choose it for | Do not choose it if |
| --- | --- | --- |
| A - Instant Notebook | Operational speed, density, recency, keyboard clarity, simplest production spine | The product must feel more authored or distinct than a highly refined utility notebook. |
| B - Quiet Editorial Stream | Long-form reading, human excerpts, contextual search, editorial calm | Date grouping feels like a journal or generous vertical rhythm slows dense scanning. |
| C - Capture Field | Strongest Signal expression, desktop context, full-screen mobile detail, spatial private depth | Responsive/search complexity and the weakest maintainability score outweigh distinctiveness. |

## Decisions already locked in Phase 1

| Decision | Rationale | Status |
| --- | --- | --- |
| Keep one notebook with capture, recency, and search | Canonical product contract | Locked |
| Capture saves a private note only | Notes is capture; Tasks is commitment | Locked |
| Require exact selection, editable preview, and explicit send | Prevent accidental/raw-note promotion | Locked |
| Keep the source note after Tasks handoff | An extract is an approved edge, not a move | Locked |
| Preserve exact writing and stable identity through failure | Optimism cannot trade away text safety | Locked |
| Keep Phase 1 in-memory and non-persistent | Protect production Notes/Tasks data | Locked |
| Hard-close the route under production markers | Lab must not become an ordinary production surface | Locked |
| Retain A/B/C after recommendation | Selection must remain reversible and evidence-based | Locked |
| Report the 9.9 and latency gates as missed | Evidence is more important than presentation | Locked |

## Explicitly rejected

- Folders, tags, projects, databases, graphs, wiki/backlink systems, or a second-brain model.
- Required titles, due dates, statuses, assignees, or workspace choice during capture.
- Automatic todo detection or silent task creation.
- Whole-note, first-line, or surrounding-context fallback in a Tasks payload, including direct `Cmd/Ctrl+Enter` promotion.
- Archiving/removing a note merely because an extract was sent, including archive-on-send.
- A card-grid stream, floating glass panels, ambient motion, gradient/neon theatre, or decorative state colours.
- A shared DOM with three colour themes.
- Replacing the production `/app` route before Ethan selects.

## Candidate and review records

- Source branch: `feat/notes-world-class-lab-20260716`
- Lab route: `/__design-lab/notes`
- Local evidence origin: `http://127.0.0.1:4329`
- Protected preview origin: `https://signal-notes-design-ho4ai9mm4-ethanmcn2013-1730s-projects.vercel.app`
- Source candidate commit: `9769f28c96871abae23ee9c3e674db195a54c5f4`
- Source pull request: [notes#24](https://github.com/ethanmcn2013-droid/notes/pull/24)
- Deployment: `dpl_6jaK1j5a82ZaxUQbtahy68MYubjK` in [Vercel Inspector](https://vercel.com/ethanmcn2013-1730s-projects/signal-notes-design-lab/6jaK1j5a82ZaxUQbtahy68MYubjK)
- Vercel project: `signal-notes-design-lab` (`prj_hg1BjcZCrm77Agk9D0ofDKcMVE8S`)
- Preview protection: `ssoProtection.deploymentType=preview`
- Hosted environment: exactly three plain Preview flags (`SIGNAL_NOTES_DESIGN_LAB=1`, `SIGNAL_ACCESS_MODE=review`, `NEXT_PUBLIC_SIGNAL_ACCESS_MODE=review`); no production secrets, integrations, or analytics
- Anonymous access: 302 to `vercel.com/sso-api`; 15-byte body with no A/B/C, lab, or fixture strings
- Authenticated access: all 12 A/B/C by Capture/Stream/Search/Detail routes returned 200 with the correct `data-option` and `noindex`
- Hosted build: Vercel Next.js build and TypeScript passed
- Hosted runtime: no error logs
- Ordinary Notes preview: `https://notes-2gyfkyu96-ethanmcn2013-1730s-projects.vercel.app` (`dpl_6541G26eVBYc9jFKbbovi36j1ao3`), built from the same source commit, returned 404 with literal body `Not Found`, `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate`, `X-Robots-Tag: noindex, nofollow, noarchive`, and no lab or fixture content
- Deployment lifecycle: previous protected preview removed after replacement validation; the isolated project now contains exactly one READY Preview deployment
- HQ feature record: [`notes-three-direction-review-lab`](https://github.com/ethanmcn2013-droid/studio/blob/docs/notes-design-lab-phase1-20260718/content/hq/features/notes-three-direction-review-lab.md)
- HQ operator selection todo: [`choose-notes-design-lab-direction`](https://github.com/ethanmcn2013-droid/studio/blob/docs/notes-design-lab-phase1-20260718/content/hq/operator-todos/choose-notes-design-lab-direction.md)
- HQ review pull request: [studio#77](https://github.com/ethanmcn2013-droid/studio/pull/77)

All exact queries follow:

    /__design-lab/notes?option={a|b|c}&scenario={capture|stream|search|detail}&dataset={sparse|normal|dense|edge}&mode={default|empty|loading|saving|saved|offline|error|conflict|read-only}&viewport={auto|390|768|1280|1440|1728}

## Phase 2 release and rollback status

Phase 2 implementation is in progress. The release mechanism is locked before code promotion:

- `NOTES_HYBRID_NOTEBOOK_ENABLED=1` is a server-only flag that selects the new hybrid component.
- Missing, empty, or any non-`1` value fails off to the retained legacy component.
- The legacy component remains in the production build through rollout verification. The safe rollback is forward-only: disable the flag and redeploy the current compatibility code so pending and completed outbox receipts remain protected.
- The pre-Hybrid deployment `dpl_4AHTSVtR65ozDzwfVn8xNnzLSQQa` is eligible only while a production query proves the total `note_task_send_outbox` row count is zero. Once any row exists, that older binary is not a safe rollback target.
- Promotion requires production build/tests, authenticated journey checks, the production URL and deployment receipt, a rollback drill/receipt, and the HQ record update.
- The historical `CHANGELOG.md` remains untouched while implementation is in progress. It will be updated only after verified production shipment.

No production shipment is claimed in this entry. The production implementation, verification receipts, production URL, rollback result, HQ closeout, and changelog entry remain pending.
