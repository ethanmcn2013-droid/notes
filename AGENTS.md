# AGENTS.md - Signal Notes

This repo is part of the Signal Studio suite. Signal Notes is the capture-clarity
product.

Before product work, read `docs/PRODUCT.md`.

## Signal HQ Sync

Signal HQ lives in the Studio repo and is the internal source of truth for
product, launch, growth, decisions, risks, metrics, and next actions.

When a change in Notes affects product state, launch readiness, GTM, messaging,
campaigns, demos, templates, outreach, pilots, metrics, decisions, risks, or
strategic learning, update Signal HQ before the task is complete.

Before note extraction, decision, action, risk, sharing, guest-facing, or
cross-product work, read `docs/COLLABORATION_LOOP.md`. Notes owns the
context-to-work moment in the collaboration loop.

Open or update a Studio PR that changes the canonical source file:

- feature scope, status, or impact: `content/hq/features/<id>.md`
- risk surfaced or mitigation changed: `content/hq/risks/<id>.md`
- decision affecting pricing, brand, GTM, or product: `content/hq/decisions/<id>.md`
- campaign goal, blocker, or progress: `content/hq/campaigns/<id>.md`
- cross-product flow, data shape, or cron schedule: `content/atlas/<slug>.md`
- growth learning: relevant files under `signal-growth/`
- shipped operator-visible change: `CHANGELOG.md`

Do not update `src/lib/hq/data.ts` unless the live Studio code path still reads
from it. The markdown and typed source files above are canonical for migrated HQ
sections.

## Locked Product Rule

Notes promotes to Tasks only when the user chooses it. Never auto-detect todos.
