# Signal Notes redesign decision log

Status: Phase 1 complete locally; selection open
Decision owner: Ethan
Review date: 18 July 2026
Production implementation: not started

## Decision required

Choose one of:

- A - Instant Notebook
- B - Quiet Editorial Stream
- C - Capture Field
- Hybrid - with the exact components to combine

The branch deliberately retains all three directions. No recommendation is treated as a decision.

## Advisory recommendation

The council recommends this exact hybrid:

1. Use A's compact SSR-first capture, flat newest-first stream, integrated search, keyboard model, and attached failure recovery as the product spine.
2. Use B's 64-72 character detail measure, longer contextual search snippets, and editorial reading rhythm.
3. Use C's selected-row desktop stream/detail split, serial full-screen mobile detail, functional focus-only readiness caret, and explicit private-note to approved-extract boundary.
4. Keep the shared exact-selection, editable approval, idempotent receipt, source-note retention, and conflict-recovery model.
5. Exclude B's masthead and date grouping.
6. Exclude C's search rail; search remains integrated like A on every viewport.

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
- Whole-note, first-line, or surrounding-context fallback in a Tasks payload.
- Archiving/removing a note merely because an extract was sent.
- A card-grid stream, floating glass panels, ambient motion, gradient/neon theatre, or decorative state colours.
- A shared DOM with three colour themes.
- Replacing the production `/app` route before Ethan selects.

## Candidate and review records

- Source branch: `feat/notes-world-class-lab-20260716`
- Lab route: `/__design-lab/notes`
- Local evidence origin: `http://127.0.0.1:4330`
- Protected preview origin: pending final protected-deployment verification
- Source candidate commit: pending immutable candidate commit
- Pull request: pending publication
- HQ feature record: pending protected URL and immutable commit
- HQ operator selection todo: pending protected URL and immutable commit

All exact queries follow:

    /__design-lab/notes?option={a|b|c}&scenario={capture|stream|search|detail}&dataset={sparse|normal|dense|edge}&mode={default|empty|loading|saving|saved|offline|error|conflict|read-only}&viewport={auto|390|768|1280|1440|1728}

## Selection status

Awaiting Ethan. Phase 2 is hard-blocked until an explicit A, B, C, or specified hybrid selection is recorded.

After selection, the next decision-log entry must record the exact chosen components, rationale, reversible release mechanism, Phase 2 verification, production URL, rollback, HQ update, and changelog status.
