# Signal Notes consolidated-app contract

Last verified: 2026-07-26

Signal Studio is one application. Signal Notes is the Notes product inside
that application, not a separate signed-in app.

## Canonical surfaces

- Signed-in Notes: `https://app.signalstudio.ie/app/notes`
- Notes marketing: `https://signalstudio.ie/notes`
- Tasks receipts from Notes:
  `https://app.signalstudio.ie/app/tasks?taskId={trusted task id}`

The consolidated implementation and its product experience live in the
`ethanmcn2013-droid/tasks` repository. This repository remains a compatibility
and service boundary while migration responsibilities are retired.

## Routes still owned here

- `/app/account` until the unified export and deletion migration is complete
- `/api/*` service contracts
- legacy sign-in and sign-up compatibility
- the local not-found and error boundary

The old `/app` product entry and Notes marketing pages are redirect inputs.
They must not be treated as independently shipped product surfaces or followed
into production by this repository's rendered-experience CI.

## Verification ownership

- `src/lib/consolidated-route-contract.test.ts` proves the exact redirects.
- `experience/capture-plan.json` captures only routes still rendered here.
- The consolidated app owns Notes product fixtures, responsive evidence, and
  accessibility acceptance.
- Studio owns the marketing product page and its visual evidence.

Historical Notes design-lab and hybrid-notebook records remain useful design
history. They are not current production routing authority.
