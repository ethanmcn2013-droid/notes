# Planning Period integration

Signal Tasks remains the authority for Planning Period, Workspace, and current
Membership. Notes stores one nullable `notes.workspace_id` projection only.
`NULL` means Unfiled and remains a complete capture path.

## Rollout

- Apply `drizzle/0006_note_workspace_context.sql`. It preserves every existing
  Note id and body and leaves existing rows Unfiled.
- Set `SIGNAL_PLANNING_PERIODS_ENABLED=true` to show contextual selection.
- Configure `TASKS_API_URL` and `NOTES_TO_TASKS_SECRET` for the signed Tasks
  workspace catalog. Reads time out after two seconds and fail closed; capture
  continues Unfiled.
- A URL `workspaceId` or `planningPeriodId` is a navigation hint only. Notes
  selects it only when the fresh catalog for the Clerk subject contains it.
- Moving a note always rechecks current Membership and updates one owner-scoped
  Note. There is no mass reassignment or copied membership table.

## Timeline boundary

Notes prepares only `{title,date,completion,named audience}`. The command shape
cannot serialize the raw Note body. Until Timeline exposes the audience-bound
endpoint, the UI returns an unavailable receipt and performs no write. Enable
the adapter later with `TIMELINE_PROMOTION_API_URL` and
`NOTES_TO_TIMELINE_SECRET`; do not replace it with a direct database write.
