# AGENTS.md — Signal Notes

This repo is part of the Signal Studio suite. Signal Notes is the context layer.

Before product work, read `docs/PRODUCT.md`.

## Signal HQ Sync

Signal HQ lives in the Studio repo at `ethanmcn2013-droid/studio` and is the internal source of truth for product, launch, growth, decisions, risks, metrics, and next actions.

When a change in Notes affects product state, roadmap, launch readiness, GTM, messaging, campaigns, demos, templates, outreach, pilots, metrics, decisions, risks, or strategic learning, update Signal HQ before the task is complete.

Before note extraction, decision, action, risk, sharing, guest-facing, or cross-product work, read `docs/COLLABORATION_LOOP.md`. Notes owns the context-to-work moment in the collaboration loop.

In practice, open or update a Studio PR that changes:

- `src/lib/hq/data.ts`
- `src/lib/hq/signals.ts` if derived signal logic changes
- relevant files under `signal-growth/`
- `CHANGELOG.md` for meaningful operator-visible changes — write entries in the dispatch shape (Studio BRAND.md §6.5): `## YYYY-MM-DD · N·NN · verb · headline`, then a bold impact-lead sentence, then prose. Verbs are `ships / tightens / cuts / holds / reads`.

Also bump `seedHqData.updatedAt` so `/hq` can detect newer repo-backed data.

## Locked Product Rule

Notes promotes to Tasks only when the user chooses it. Never auto-detect todos.
