# Planning Period integration

Signal Tasks remains the authority for Planning Period, Workspace, and current
Membership. Notes stores one nullable `notes.workspace_id` projection only.
`NULL` means Unfiled and remains a complete capture path.

## Rollout

- Apply `drizzle/0006_note_workspace_context.sql`. It preserves every existing
  Note id and body and leaves existing rows Unfiled.
- Set `SIGNAL_PLANNING_PERIODS_ENABLED=true` to show contextual selection.
- Configure `TASKS_API_URL` and `NOTES_TO_TASKS_SECRET` for the signed Tasks
  v2 workspace catalog at `/api/internal/workspaces?contractVersion=2`.
  The response is membership-first, excludes archived destinations, and groups
  owned Workspaces under finite Planning Period DTOs. Reads time out after two
  seconds and fail closed; capture continues Unfiled.
- A URL `workspaceId` or `planningPeriodId` is a navigation hint only. Notes
  selects it only when the fresh catalog for the Clerk subject contains it.
- Moving a note always rechecks current Membership and updates one owner-scoped
  Note. There is no mass reassignment or copied membership table.

## Timeline boundary

Notes prepares only `{title,date,completion,named audience}`. The command shape
cannot serialize the raw Note body. Timeline now exposes the audience-bound
`POST /api/internal/notes-timeline` receiver. It verifies the short-lived
`signal-timeline.note-projection` assertion, rechecks current Tasks membership,
creates a frozen public-safe projection, publishes a one-time token, and
returns the public URL. Configure `NOTES_TO_TIMELINE_SECRET`; preview/staging
may override `TIMELINE_PROMOTION_API_URL`, while production defaults to the
canonical Timeline endpoint. Duplicate Note promotions are rejected rather
than creating a second public link.
