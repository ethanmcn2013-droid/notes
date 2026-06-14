# Demo / Review Mode — Signal Notes

Signal Notes ships a controlled **access-mode** layer so the product can be
publicly viewed, shared, and reviewed during development without weakening the
production authentication model. Full suite-level rationale lives in the
`studio` repo at `docs/DEMO_REVIEW_MODE.md`; this file is the Notes specifics.

## The four modes

Set by `SIGNAL_ACCESS_MODE` (server) + `NEXT_PUBLIC_SIGNAL_ACCESS_MODE` (client):

| Mode | Auth | Data |
|------|------|------|
| `production` | Real Clerk session required | Real Turso DB, per-user |
| `development` | Keyless dev bypass (existing) | Real DB / dev identity |
| `demo` | **No login wall** | **In-memory seed only** |
| `review` | Same as demo | Same as demo |

Default when unset: `production` under `NODE_ENV=production`, else `development`.
`NEXT_PUBLIC_DEMO_MODE=true` is accepted as a shorthand for `demo`.

## Safety invariant

Demo/review **never query the real database.** `requireUser()` returns the
synthetic `DEMO_USER_ID` and every read (`listNotes`, `listArchivedNotes`,
`searchNotes`, `getCaptureEmail`) short-circuits to `src/server/demo/notes-demo.ts`
*before* any `db` call. So even if the flag were mis-deployed to a build that
still has DB credentials, there is no real tenant data reachable to leak.

## Enable it

Local:
```bash
cp .env.example .env.local
# set both to demo (or review)
SIGNAL_ACCESS_MODE=demo
NEXT_PUBLIC_SIGNAL_ACCESS_MODE=demo
npm run dev
```

Preview deployment (Vercel): set both env vars to `demo` (or `review`) on the
preview environment. No Clerk or Turso keys are required for the app to render.

## Disable it / restore production auth

Set both vars back to `production` (or remove them — production is the default
in a production build). The Clerk gate in `src/proxy.ts` and `requireUser()`
return to their exact prior behaviour; no other code changes are needed.

## Review routes

- `/app` — the notebook (seeded)
- `/` — marketing homepage
- `/wedding-planning`, `/building-project`, `/teaching-week`, `/freelance-studio`
  — audience showcase pages (already public)

The suite-wide review hub lives at `https://signalstudio.ie/review`.

## Files

- `src/lib/access-mode.ts` — central resolver (canonical across the suite)
- `src/server/demo/notes-demo.ts` — seed dataset + `DEMO_USER_ID`
- `src/components/dev-banner.tsx` — the "in development" marker
- `src/proxy.ts`, `src/server/auth.ts`, `src/server/actions/*` — mode branches

## Remaining technical debt

- Writes (createNote etc.) still call `requireUser()` → `DEMO_USER_ID`, then hit
  the DB. In demo mode the proxy is open but the notebook is read-focused; demo
  write attempts are not seeded round-trips. If interactive demo writes are
  wanted later, branch the write actions to a no-op/in-memory store too.
