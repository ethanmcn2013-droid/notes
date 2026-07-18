# Signal Notes design-lab deployment receipt

Receipt date: 18 July 2026

Status: protected preview verified

Production Notes status: unchanged

## Immutable source and deployment

| Field | Receipt |
| --- | --- |
| Source branch | `feat/notes-world-class-lab-20260716` |
| Candidate commit | `9769f28c96871abae23ee9c3e674db195a54c5f4` |
| Source pull request | [notes#24](https://github.com/ethanmcn2013-droid/notes/pull/24) |
| Preview origin | `https://signal-notes-design-ho4ai9mm4-ethanmcn2013-1730s-projects.vercel.app` |
| Deployment id | `dpl_6jaK1j5a82ZaxUQbtahy68MYubjK` |
| Inspector | [Open deployment inspector](https://vercel.com/ethanmcn2013-1730s-projects/signal-notes-design-lab/6jaK1j5a82ZaxUQbtahy68MYubjK) |
| Vercel project | `signal-notes-design-lab` (`prj_hg1BjcZCrm77Agk9D0ofDKcMVE8S`) |

The deployment was created from the immutable candidate commit in a separate Vercel project. It is a preview deployment, not a production Notes deployment. The previous protected preview was removed after this replacement passed validation; the isolated project now contains exactly one READY Preview deployment.

## Protection and environment inventory

- Vercel Authentication is explicitly configured as `ssoProtection.deploymentType=preview`.
- An anonymous request returned 302 to `vercel.com/sso-api`.
- The anonymous response body was 15 bytes and contained no Option A/B/C marker or fixture string.
- The project contains exactly three plain Preview-scoped environment values:

| Variable | Value | Scope | Secret |
| --- | --- | --- | --- |
| `SIGNAL_NOTES_DESIGN_LAB` | `1` | Preview | No |
| `SIGNAL_ACCESS_MODE` | `review` | Preview | No |
| `NEXT_PUBLIC_SIGNAL_ACCESS_MODE` | `review` | Preview | No |

No production secrets, Vercel integrations, or analytics are configured for this project.

## Authenticated route matrix

All 12 routes below returned 200 through authenticated Vercel access. Each response contained the expected `data-option` marker and a `noindex` directive.

| Direction | Capture | Stream | Search | Detail + extraction |
| --- | --- | --- | --- | --- |
| A | [Open](https://signal-notes-design-ho4ai9mm4-ethanmcn2013-1730s-projects.vercel.app/__design-lab/notes?option=a&scenario=capture&dataset=normal&mode=default&viewport=1440) | [Open](https://signal-notes-design-ho4ai9mm4-ethanmcn2013-1730s-projects.vercel.app/__design-lab/notes?option=a&scenario=stream&dataset=normal&mode=default&viewport=1440) | [Open](https://signal-notes-design-ho4ai9mm4-ethanmcn2013-1730s-projects.vercel.app/__design-lab/notes?option=a&scenario=search&dataset=normal&mode=default&viewport=1440) | [Open](https://signal-notes-design-ho4ai9mm4-ethanmcn2013-1730s-projects.vercel.app/__design-lab/notes?option=a&scenario=detail&dataset=normal&mode=default&viewport=1440) |
| B | [Open](https://signal-notes-design-ho4ai9mm4-ethanmcn2013-1730s-projects.vercel.app/__design-lab/notes?option=b&scenario=capture&dataset=normal&mode=default&viewport=1440) | [Open](https://signal-notes-design-ho4ai9mm4-ethanmcn2013-1730s-projects.vercel.app/__design-lab/notes?option=b&scenario=stream&dataset=normal&mode=default&viewport=1440) | [Open](https://signal-notes-design-ho4ai9mm4-ethanmcn2013-1730s-projects.vercel.app/__design-lab/notes?option=b&scenario=search&dataset=normal&mode=default&viewport=1440) | [Open](https://signal-notes-design-ho4ai9mm4-ethanmcn2013-1730s-projects.vercel.app/__design-lab/notes?option=b&scenario=detail&dataset=normal&mode=default&viewport=1440) |
| C | [Open](https://signal-notes-design-ho4ai9mm4-ethanmcn2013-1730s-projects.vercel.app/__design-lab/notes?option=c&scenario=capture&dataset=normal&mode=default&viewport=1440) | [Open](https://signal-notes-design-ho4ai9mm4-ethanmcn2013-1730s-projects.vercel.app/__design-lab/notes?option=c&scenario=stream&dataset=normal&mode=default&viewport=1440) | [Open](https://signal-notes-design-ho4ai9mm4-ethanmcn2013-1730s-projects.vercel.app/__design-lab/notes?option=c&scenario=search&dataset=normal&mode=default&viewport=1440) | [Open](https://signal-notes-design-ho4ai9mm4-ethanmcn2013-1730s-projects.vercel.app/__design-lab/notes?option=c&scenario=detail&dataset=normal&mode=default&viewport=1440) |

## Build receipt

- Vercel's Next.js build passed.
- TypeScript passed as part of the hosted build.
- The authenticated pages retain `noindex`.
- No runtime error logs were present for the protected deployment.

## Ordinary Notes preview boundary receipt

The same immutable candidate commit was also built as the ordinary Notes Preview, without the isolated project's review flags:

| Field | Receipt |
| --- | --- |
| Preview origin | `https://notes-2gyfkyu96-ethanmcn2013-1730s-projects.vercel.app` |
| Deployment id | `dpl_6541G26eVBYc9jFKbbovi36j1ao3` |
| Source commit | `9769f28c96871abae23ee9c3e674db195a54c5f4` |
| Route response | 404 with literal body `Not Found` |
| Cache control | `private, no-cache, no-store, max-age=0, must-revalidate` |
| Robots policy | `noindex, nofollow, noarchive` |

The 404 response contained no lab markers, A/B/C option markers, or fixture content. This hosted same-source receipt verifies the ordinary-preview boundary independently of the protected review deployment.

## Boundary statement

This receipt proves the access control, minimal environment inventory, deployment lifecycle, and route behavior of the current immutable protected preview, plus the same-source ordinary-preview hard boundary. It does not authorize a Phase 2 production replacement, certify production Notes or Tasks persistence, or record a design selection.
