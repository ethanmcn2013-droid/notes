# Notes 0007 production migration evidence contract

Status: execution receipt pending production backup and isolated-copy dry run.

This file defines the non-secret evidence that must exist before production
execution. It is not an execution receipt and does not authorize touching the
production database.

## Immutable source identity

- Migration: `0007_note_task_send_outbox`
- Canonical migration-ledger SHA-256:
  `9f4831b482c17fa9257f4fbe8af67f9b16ccddd4a0735890e47fdedc2ef35db5`
- Canonical LF SQL SHA-256:
  `7ca4b8ad41ab1b04762b60659e8aa4aef553f42fe7b7d951e2ac67ef8131dbf9`
- Exact outbox schema fingerprint SHA-256:
  `43634421861827463660df38784e8a526a945b0dd3e04811bbc9e81bf3c0f98a`
- Shape: 17 columns, one cascading Notes foreign key, three named indexes.

## Operator evidence required

Create a separate, uncommitted-or-access-controlled JSON execution receipt
that validates against `drizzle/notes-migration-execution.schema.json` and is
passed explicitly to the runner. It must contain:

- only the normalized SHA-256 of the target database identity;
- the exact full Git release SHA;
- the canonical SHA-256 of `note-task-outbox-migration-ledger.json`;
- a verified backup-byte SHA-256 and verification timestamp;
- the isolated-copy database SHA-256 after the dry run;
- the exact migration SQL and schema fingerprint hashes above;
- equal aggregate note counts before and after the dry run;
- `PRAGMA integrity_check = ok` and zero `foreign_key_check` rows;
- no database URL, auth token, user id, note id, note body, selection, approved
  body, workspace id, or task id.

Generate the dry-run fields from the runner’s isolated-copy mode, not by
manually declaring success:

```powershell
$env:TURSO_DATABASE_URL='file:C:/absolute/path/to/isolated-notes.db'
node scripts/db/migrate-note-task-outbox.mjs dry-run --environment=test --confirm-dry-run=isolated-copy --backup-sha256=<verified-backup-hash> --release-sha=<full-40-character-git-sha>
```

The command refuses remote databases, production environment labels, source
files whose raw hash differs from the verified backup, and copies with WAL/SHM
sidecars. Copy its `dryRunEvidence` fields verbatim into the production receipt.

The production result JSON and `notes_schema_migrations` row are the execution
receipt’s machine-verifiable companion. Retain the first-run `applied` result
and the second-run `no-op` result with deployment evidence; neither output
contains a credential or note body.
