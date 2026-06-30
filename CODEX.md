# Codex Instructions - Signal Notes

Read `../CODEX.md` first, then `AGENTS.md` and `docs/PRODUCT.md`.

Signal Notes is the capture-clarity product in the Signal Studio suite.

Before note extraction, decision, action, risk, sharing, guest-facing, or
cross-product work, read `docs/COLLABORATION_LOOP.md`.

If a change affects product state, launch readiness, GTM, messaging, campaigns,
demos, templates, outreach, pilots, metrics, decisions, risks, or strategic
learning, update Signal HQ before the task is complete.

Use Studio's canonical HQ sources:

- `studio/content/hq/features/<id>.md`
- `studio/content/hq/risks/<id>.md`
- `studio/content/hq/decisions/<id>.md`
- `studio/content/hq/campaigns/<id>.md`
- `studio/content/atlas/<slug>.md`
- `studio/signal-growth/**`
- `studio/CHANGELOG.md`

Do not update `studio/src/lib/hq/data.ts` unless the live Studio code path still
reads from it.

Locked product rule: Notes promotes to Tasks only when the user chooses it.
Never auto-detect todos.
