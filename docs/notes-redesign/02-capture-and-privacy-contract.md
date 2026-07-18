# Signal Notes Phase 1: capture and privacy contract

Status: implemented lab contract  
Applies to: shared reducer and all three design directions  
Production status: unchanged

## Contract summary

The lab treats capture and extraction as two separate state machines.

Capture:

    private draft -> local note -> background sync -> synced or recoverable failure

Extraction:

    private note -> exact selection -> editable approved wording -> explicit send -> idempotent receipt

There is no transition from the capture field directly to Tasks. There is no transition that moves a private note out of Notes.

## Capture contract

### Ready

- A plain textarea is present and focused.
- No folder, title, tag, workspace, project, or task choice blocks typing.
- The accessible label is Capture a private note.
- Private by default is visible context, not part of the control name.
- The lab can measure focus readiness, but never records the draft.

### Type

- Text remains controlled by the shared in-memory store.
- Shift+Enter inserts a line.
- A visible New line button provides the same outcome on touch keyboards.
- Command/Ctrl+Enter follows the save-only rule. It does not promote.
- Input method composition is respected before keyboard commands run.

### Save

- Enter or Save note creates one stable lab note identity.
- The note is inserted at the top of the stream before simulated sync resolves.
- The capture field clears only after the note exists in the local state.
- A same-event-loop guard advances the operation sequence before another keypress can reuse it.
- The lab measures save invocation to the next rendered frame. The body is not part of the metric.

### Pending and synced

- Pending is shown on the note row as saving.
- In Default mode, simulated sync changes pending to synced.
- In Saving mode, the note remains pending so the state can be inspected.
- No blocking spinner replaces the note.

### Failed

- In Error mode, the first simulated sync fails.
- The row remains in the stream with the exact body and the same note identity.
- The failure language states: Your exact writing is retained.
- Retry same note changes that note back to pending and then synced.
- Retry does not call capture and cannot allocate a second identity.

### Offline and reconnect

- In Offline mode, new writing is inserted and stays pending.
- Retry while still offline announces that the note remains queued.
- Leaving Offline mode triggers a simulated reconnect and syncs pending notes.
- No success is shown until the simulated reconnect completes.

### Escape and loss prevention

- Escape on an empty field has no destructive effect.
- Escape on a non-empty capture opens a small alert dialog.
- Keep writing restores focus to the textarea and preserves text.
- Discard draft requires an explicit second action.

## Capture keyboard model

| Input | Result | Cross-product effect |
| --- | --- | --- |
| Enter | Save one note | None |
| Shift+Enter | Insert line break | None |
| Command/Ctrl+Enter | Save one note | None |
| Escape with text | Ask whether to keep or discard | None |
| Save note button | Save one note | None |
| New line button | Insert line break | None |

This intentionally supersedes the current production direct-promote chord inside the lab. It does not alter production behavior during Phase 1.

## Editing, copy, and deletion

### Open and edit

- Opening a row sets one open note id and copies its body into an editable detail draft.
- The note's created time remains fixed.
- Command/Ctrl+S or Save changes commits the detail draft locally and marks it pending.
- Returning with dirty edits invokes loss prevention.
- Returning with no dirty edits closes detail immediately.

### Copy

- Copy note uses the browser clipboard only after an explicit action.
- Clipboard failure is announced without changing the note.
- Clipboard content is never added to telemetry or fixture persistence.

### Delete and undo

- Delete note first asks for confirmation in the detail toolbar.
- Confirmation removes the note from the in-memory array and stores one recovery snapshot.
- Undo restores the exact note at its previous index.
- Reload resets the entire lab, including deleted and restored state.

## Extraction contract

### Boundary

The private body and the approved extract are different data classes:

| Data | Visibility | Can be edited | Can cross to Tasks simulation |
| --- | --- | --- | --- |
| Raw note body | Private Notes detail | Yes | No |
| Current text selection | Private transient state | By changing selection | No |
| Approved wording | Explicit approval panel | Yes, before send | Yes |
| Receipt | Lab-only task ledger | No | It is the simulated response |

### Required sequence

1. Open a private note.
2. Select exact wording in the note body.
3. Choose Use selection.
4. Review the private-note to approved-extract boundary.
5. Edit the approved wording if needed.
6. Choose Cancel or Send approved extract to Tasks.
7. Inspect an honest failure or receipt.

Nothing is sent when text is merely selected. Nothing is sent when the preview opens. Cancel clears the transient extraction state.

### Exact payload

The lab constructs exactly three fields:

    {
      noteId,
      body: approvedText,
      workspaceId: "lab_workspace_review"
    }

The body field is the exact editable approved wording, including deliberate leading, trailing, and multiline whitespace. It is not populated from the raw note except through the user's exact selection and visible preview.

Explicitly excluded:

- Raw note body.
- First-line fallback.
- Note title or excerpt.
- Search query.
- User identity, email, or authentication token.
- Timeline fields.
- Tags, project, due date, status, or assignee.

### Send and idempotency

- Sending acquires an immediate in-memory lock to prevent a rapid double action.
- The receipt identity is deterministic for the note.
- The task ledger is keyed by note identity.
- If an existing receipt is found, retry returns created: false and does not create another simulated task.
- A note already marked with a promoted task id cannot be sent again.

### Ambiguous failure

Error mode rehearses the dangerous case where Tasks accepted an idempotency key but the response was lost:

1. The first send stores the accepted receipt in the private lab ledger.
2. The UI reports that the reply was lost and offers Retry safely.
3. Retry uses the same note identity.
4. The ledger returns the existing task identity with created: false.
5. The UI states that no duplicate was created.

This prevents false success and proves why idempotency is a product behavior, not only an API detail.

### Successful receipt

On success:

- The approved extract and task receipt are attached to the note's lab metadata.
- The note remains in its original stream.
- The UI states that only approved wording was sent.
- The row gains a quiet extract sent indicator.
- Closing the receipt does not remove or archive the source note.

## Lab isolation contract

The Phase 1 lab must never access production Notes or Tasks data.

### Data architecture

- Fixture ids use the lab_ prefix.
- The corpus and timestamps are deterministic.
- State exists only in a React reducer and context.
- There is no server-action import.
- There is no fetch, database client, auth call, cookie, localStorage, IndexedDB, Cache API, or service-worker persistence in the lab module.
- The only external browser capability is explicit clipboard write for Copy note.
- Reload reconstructs the original fixture.

### Route and deployment gates

- Local development may render /__design-lab/notes.
- Ordinary production deployment must return not found even if lab flags are supplied.
- A hosted lab requires a Vercel preview environment, SIGNAL_NOTES_DESIGN_LAB=1, and review access mode.
- The page metadata requests no indexing, no following, no caching, no image indexing, and no referrer.
- The lab and private fields include session-replay masking attributes.
- A separate protected preview deployment must be checked from an unauthenticated browser before its URL is treated as review-ready.

Application route gating is defense in depth. It does not replace Vercel deployment protection.

## Privacy threat review

| Threat | Lab control | Residual verification |
| --- | --- | --- |
| Review action reaches production database | Pure client reducer; no production imports | Static import/capability check. |
| Review action calls Tasks | No fetch or server action | Runtime zero-network assertion after initial page load. |
| Raw note leaks into approved payload | Payload builder accepts only approvedText | Unit test with private sentinel text. |
| Double send creates duplicate | Immediate sending lock and note-keyed ledger | Browser test with rapid double action and retry. |
| Ambiguous timeout shows false failure or creates duplicate | Accepted receipt retained, retry returns created: false | Error-mode browser test. |
| Session replay captures note text | Root and private controls are masked | Inspect rendered attributes; deploy with no replay credentials. |
| Search or note content enters timing telemetry | Metrics store durations and counts only | Static review and runtime inspection. |
| Lab becomes publicly discoverable | Hard production 404, noindex metadata, protected preview | External unauthenticated verification. |
| Preview receives production secrets | Separate Vercel project with only review flags | Inspect preview project environment before sharing. |

## Invariants suitable for automated tests

1. One save creates one lab note.
2. A rapid second key event cannot reuse an id.
3. Editing never changes createdAt.
4. Failure never removes body text.
5. Retry uses the same note id.
6. Search results are the same in A, B, and C.
7. Capture cannot call extraction.
8. Extraction requires a non-empty selection and explicit preview.
9. Payload body equals the final approved wording.
10. Private sentinel text outside the selection is absent from the payload.
11. Cancel produces no receipt.
12. Double send produces one task id.
13. Ambiguous retry reports created: false.
14. A sent extract leaves the source note in the stream.
15. Reload resets every edit, note, deletion, and receipt.

## Production non-change statement

This contract is implemented only in the isolated Phase 1 lab. It records the intended replacement behavior for later selection, but it does not modify the current production capture action, database schema, auth boundary, Tasks API, Timeline integration, or /app notebook.
