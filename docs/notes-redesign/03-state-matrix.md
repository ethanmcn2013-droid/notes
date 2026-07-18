# Signal Notes Phase 1: state matrix

Status: implemented lab review matrix
Shared by: Options A, B, and C
Production status: unchanged

## How to use this matrix

The lab has four independent review controls:

- Direction: A, B, or C.
- Scenario: Capture, Stream, Search, or Detail + extraction.
- Dataset: Sparse, Normal, Dense, or Edge cases.
- Mode: Default, Empty, Loading, Saving, Saved, Offline, Error rehearsal, Conflict, or Read-only.

Changing direction preserves shared note state. Changing dataset resets the fixture. Reload resets everything.

The canonical query shape is:

    /__design-lab/notes?option={a|b|c}&scenario={capture|stream|search|detail}&dataset={sparse|normal|dense|edge}&mode={default|empty|loading|saving|saved|offline|error|conflict|read-only}&viewport={auto|390|768|1280|1440|1728}

Current local origin:

    http://127.0.0.1:4329

Protected preview origin:

    https://signal-notes-design-ho4ai9mm4-ethanmcn2013-1730s-projects.vercel.app

The protected preview uses the same path and query contract. Vercel Authentication is enabled for preview deployments; its anonymous response is a 302 SSO challenge with a 15-byte body and no lab or fixture content. Authenticated verification passed for all 12 A/B/C by scenario routes with the correct option marker and `noindex`. The ordinary Notes preview from the same source commit hard-returns a literal `Not Found` body with 404, private/no-store caching, and `noindex, nofollow, noarchive`. Exact protected links and deployment receipts are recorded in the three option briefs and `evidence/deployment-receipt.md`.

## Scenario matrix

| Scenario | Initial state | Required review | Shared expected outcome |
| --- | --- | --- | --- |
| Capture | Focused empty capture, normal corpus below | Type, multiline, Enter save, button save, Escape protection, pending/synced | One note appears immediately; no task state changes. |
| Stream | Normal corpus, no query, no open note | Scan, open, edit, copy, delete, undo, return to recency | Place remains understandable; created time stays fixed. |
| Search | Query prefilled with delivery | Highlight, context snippet, clear, previous/next, no results, keyboard focus | Same ordered matches in A, B, and C. |
| Detail + extraction | Venue note open with a known exact selection | Read, edit, save, select, preview, reshape, cancel, send, retry | Only approved wording enters the simulated payload; note remains. |

Exact local review URLs for Option A:

- [Capture](http://127.0.0.1:4329/__design-lab/notes?option=a&scenario=capture&dataset=normal&mode=default&viewport=auto)
- [Stream](http://127.0.0.1:4329/__design-lab/notes?option=a&scenario=stream&dataset=normal&mode=default&viewport=auto)
- [Search](http://127.0.0.1:4329/__design-lab/notes?option=a&scenario=search&dataset=normal&mode=default&viewport=auto)
- [Detail and extraction](http://127.0.0.1:4329/__design-lab/notes?option=a&scenario=detail&dataset=normal&mode=default&viewport=auto)

Replace option=a with option=b or option=c for the other two directions without changing the data or behavioral contract.

## Mode matrix

| Mode | Capture | Stream | Search | Detail and extraction | Recovery and announcement |
| --- | --- | --- | --- | --- | --- |
| Default | Ready; save inserts pending then syncs | Recency list with synced fixtures | Active and immediate | Edit, copy, delete, select, send | Saved and sent outcomes are announced once. |
| Empty | Capture remains ready | Quiet first-note state | A query can show no results | No note opens until one is captured | No tour or sample-data prompt. |
| Loading | Capture remains ready | Static loading geometry remains while new session captures appear immediately; unavailable fixture history stays hidden | Search control remains present by direction | No transient detail | Capture is ready while recent notes load. |
| Saving | Ready; new notes stay pending | A deterministic pending row is included | Pending row remains searchable | Local edit can remain pending | Saving locally; note is already visible. |
| Saved | Ready | A deterministic synced note is first in recency | The saved note is searchable | Normal read, edit, copy, delete, and extraction controls | Exact writing is shown in the stream and announced as saved. |
| Offline | Ready; new note stays queued | Pending state remains visible | Local fixture search still works | Approved wording is retained but cannot send | Leaving Offline syncs queued notes; no false success. |
| Error rehearsal | First save sync fails | Failed row retains exact body and offers retry | Failed row remains searchable | First Tasks reply is lost after acceptance; safe retry resolves one receipt | Error text states retention and next action. |
| Conflict | Capture remains available | Conflicted note remains in Notes and both retained versions are visible | Local fixture search remains available | Conflicted detail is read-only; edit, delete, and extraction are blocked until resolution | Keep this device, Use other device, or Keep both as notes resolves explicitly and produces a provenance receipt. |
| Read-only | Field is readable but capture is paused | Reading and search remain available | Full search and navigation work | Copy works; edit, delete, and send are paused | One read-only state banner explains the limit. |

Exact mode stress URLs:

- [Empty](http://127.0.0.1:4329/__design-lab/notes?option=a&scenario=capture&dataset=sparse&mode=empty&viewport=390)
- [Loading](http://127.0.0.1:4329/__design-lab/notes?option=a&scenario=stream&dataset=normal&mode=loading&viewport=390)
- [Saving](http://127.0.0.1:4329/__design-lab/notes?option=a&scenario=capture&dataset=normal&mode=saving&viewport=390)
- [Saved](http://127.0.0.1:4329/__design-lab/notes?option=a&scenario=stream&dataset=normal&mode=saved&viewport=390)
- [Offline](http://127.0.0.1:4329/__design-lab/notes?option=a&scenario=capture&dataset=edge&mode=offline&viewport=390)
- [Save error](http://127.0.0.1:4329/__design-lab/notes?option=a&scenario=capture&dataset=edge&mode=error&viewport=390)
- [Tasks ambiguity and retry](http://127.0.0.1:4329/__design-lab/notes?option=a&scenario=detail&dataset=edge&mode=error&viewport=1280)
- [Edit conflict](http://127.0.0.1:4329/__design-lab/notes?option=a&scenario=detail&dataset=normal&mode=conflict&viewport=1280)
- [Read-only](http://127.0.0.1:4329/__design-lab/notes?option=a&scenario=detail&dataset=normal&mode=read-only&viewport=1280)

## State transition matrix

### Capture and sync

| From | Event | To | User-visible truth |
| --- | --- | --- | --- |
| Draft | Enter or Save note | Pending row | Saved locally. Syncing. |
| Pending | Simulated success | Synced | Saved. |
| Pending | Simulated failure | Failed | Exact writing remains; retry is available. |
| Failed | Retry same note | Pending, same id | No duplicate was created. |
| Offline pending | Mode returns online | Synced | Pending writing is saved. |
| Draft | Escape | Loss-prevention prompt | Text remains until explicit discard. |

### Detail editing

| From | Event | To | User-visible truth |
| --- | --- | --- | --- |
| Closed | Open row | Detail open | Private body stays in Notes. |
| Open, clean | Edit | Open, dirty | Changes are local to detail draft. |
| Open, dirty | Command/Ctrl+S or Save changes | Open, pending | Created time is unchanged. |
| Open, dirty | Back or Escape | Loss-prevention prompt | Unsaved changes are not silently discarded. |
| Open | Copy | Open | Note copied, or copy unavailable; body unchanged. |
| Open | Delete, then confirm | Deleted with undo | Recovery snapshot is available. |
| Deleted | Undo | Restored at previous index | Note returns to its prior place. |

### Extraction

| From | Event | To | User-visible truth |
| --- | --- | --- | --- |
| Open note | Select text | Selection ready | Character count shown; nothing sent. |
| Selection ready | Use selection | Approval preview | The exact raw browser selection, including deliberate boundary and multiline whitespace, is copied into preview; there is no whole-note fallback. |
| Approval preview | Edit | Approval preview | Final payload preserves the exact approved field value, including deliberate whitespace. |
| Approval preview | Cancel | Idle | Nothing sent. |
| Approval preview | Send | Sending | Private note remains in place. |
| Sending | Success | Sent receipt | Approved extract sent in simulation. |
| Sending | Offline | Failed, retained | Approved wording remains for retry. |
| Sending | Accepted response lost | Failed with accepted ledger record | Retry safely with same identity. |
| Failed after acceptance | Retry | Sent, created false | Already accepted; no duplicate created. |

## Saved and conflict states

Saved and Conflict are both selectable top-level lab modes and valid route values.

Saved inserts one deterministic, synced fixture at the top of recency. The banner and live region state that the user's exact writing is safely in the stream. Re-selecting Saved upserts the same note id instead of creating duplicates.

Conflict is a complete fixture-backed recovery rehearsal, not a production API claim. Entering the mode opens one conflicted note and retains two immutable source versions:

- This device: the exact local body and local update timestamp.
- Other device: the exact remote body and remote update timestamp.
- Conflict detection time is retained separately.

While unresolved, ordinary detail editing, saving, deletion, and Tasks extraction are blocked. No version is silently overwritten and nothing leaves Notes. Resolution is always one of three explicit actions:

| Resolution | Result in Notes | Receipt |
| --- | --- | --- |
| Keep this device | The primary note keeps the exact local body. | Both original bodies, both source timestamps, detection time, resolution time, chosen resolution, and resulting note id remain in the resolution record. |
| Use other device | The primary note uses the exact remote body. | The same two-version provenance record remains available. |
| Keep both as notes | The primary note keeps the exact local body and one deterministic second note stores the exact remote body. | The receipt records both resulting note ids and both untouched originals. |

Resolution moves the review mode to Saved and leaves a visible resolution receipt whose expandable detail shows both originals. The store claims the conflict synchronously before dispatch, so repeated activation cannot resolve the same pair twice or create duplicate Keep both notes. A repeated reducer action after resolution is a no-op. This receipt is stable for the remainder of the in-memory lab session; dataset reset or page reload deliberately restores fixtures.

Conflict remains fixture-only in Phase 1. It does not imply that the current production persistence API detects or returns cross-device conflicts.

## Approved-extract boundary

The extraction path is selection -> visible approval preview -> optional edit -> explicit send. Validation rejects a missing or all-whitespace selection, but otherwise carries the raw browser selection into the preview exactly, including deliberate leading, trailing, and multiline whitespace. The payload builder then preserves the exact final approved field value. It constructs only `noteId`, `body`, and the lab `workspaceId`.

There is no whole-note payload path, no first-line fallback, and no surrounding-context enrichment. Private text outside the selection is absent from the simulated Tasks payload. If a search match exists only in a prior approved extract, its visible snippet is also built only from that approved text rather than substituting private note-body context. Sending or safely retrying never moves, deletes, or replaces the private note in Notes.

## Dataset matrix

The deterministic corpus contains 96 notes. Every option receives the same objects and ids.

| Dataset | Count | Purpose |
| --- | ---: | --- |
| Sparse | 6 | Empty-adjacent rhythm, first-screen hierarchy, short stream. |
| Normal | 24 | Primary screenshots and everyday interaction review. |
| Dense | 96 | Long-stream rendering, scanning, search consistency, and responsive stress. |
| Edge cases | 15 | Long title, large body, Unicode, emoji, non-English text, duplicates, links, private content, venue detail, pending, failed, approved, and already sent states. |

Required corpus cases include:

- Two-word capture.
- Very long first line.
- Multi-paragraph meeting note.
- Venue walkthrough.
- Supplier delivery change.
- Teacher parent-call reminders.
- Freelance kickoff asks.
- Private thought that must never be promoted.
- One approved extract.
- One already-created task receipt.
- Markdown-like text without a markdown requirement.
- Links, fictional phone numbers, names, dates, and punctuation.
- Duplicate and near-duplicate bodies.
- Search term in title, body, and approved extract.
- Unicode, emoji entered by the user, and non-English writing.
- Very old and very recent notes.
- Large note body.
- Offline pending and failed sync notes.

Dense stress URL:

[Dense edge rehearsal](http://127.0.0.1:4329/__design-lab/notes?option=c&scenario=search&dataset=dense&mode=default&viewport=1728)

## Viewport matrix

| Canvas setting | Review intent | Expected composition |
| --- | --- | --- |
| 390 | Narrow and large phone coverage | Capture first; serial stream/detail; 44 px targets; no horizontal overflow. |
| 768 | Tablet boundary | Comfortable single column or early spatial transition without compressed controls. |
| 1280 | Standard desktop | Full intended hierarchy for every option. |
| 1440 | Primary desktop evidence width | Typography, density, and detail relationship at the review baseline. |
| 1728 | Wide desktop | Line length remains controlled; whitespace does not become dead space. |
| auto | Browser-responsive | Used for manual resizing and external device profiles, including a 320 px narrow-phone check. |

The prompt also requires a narrow phone and large phone. Automated evidence should therefore use an actual 320 px browser viewport and at least one 390 or 430 px viewport in addition to the named canvas settings.

## Keyboard and non-pointer matrix

| Critical action | Keyboard path | Visible pointer/touch path |
| --- | --- | --- |
| Begin capture | Native autofocus | Tap capture field |
| Save capture | Enter | Save note |
| Add line | Shift+Enter | New line |
| Protect draft | Escape, then choose | Keep writing or Discard draft |
| Focus search | Command/Ctrl+K | Search field or Open search in C |
| Move search | Up/Down | Previous/Next |
| Clear search | Escape | Clear |
| Open note | Tab to row, Enter/Space | Tap row |
| Save edit | Command/Ctrl+S | Save changes |
| Return | Escape or Back control | Back to stream |
| Copy | Tab to Copy note, Enter/Space | Copy note |
| Delete | Tab to Delete, confirm | Delete note, confirm |
| Undo delete | Tab to Undo, Enter/Space | Undo delete |
| Prepare extract | Select with keyboard, Tab to Use selection | Select, then Use selection |
| Edit approved wording | Standard textarea keys | Tap field |
| Cancel or send | Tab and Enter/Space | Cancel or Send |

No critical function exists only on hover.

## Announcement policy

One screen-reader-only polite live region announces completed or material state changes.

Announce:

- Design direction or scenario change.
- Save start, save success, save failure, and retry.
- Search result count after a short debounce.
- Open/return.
- Copy outcome.
- Delete and undo.
- Extraction preview, cancel, send, failure, and receipt.

Do not announce:

- Every capture keystroke.
- Every detail-editor keystroke.
- Every change to the approved wording.
- Decorative hover, focus, or motion.
- Private note body or search query as telemetry.

## Known matrix limitation

The state matrix is broader than a single screenshot pass. Saved and conflict are implemented and automated in the fixture lab. The protected preview, anonymous authentication challenge, authenticated 12-route matrix, secret-free project posture, hosted Next.js and TypeScript builds, and the same-source ordinary-preview hard 404 are verified. The replaced protected deployment was removed after validation; the isolated design-lab project now contains exactly one READY Preview deployment. External screen-reader, non-Chromium, physical-device, field-performance, energy, and real-radio results remain evidence tasks. The scorecard retains the measured synthetic latency misses rather than treating this document as proof by itself.

## Production non-change statement

All states in this matrix run on deterministic fixtures at /__design-lab/notes. They do not read, create, edit, delete, search, archive, or promote production Notes. They do not call production Tasks. The production /app behavior remains unchanged until explicit selection.
