# Notes database migration 0007

`0007_note_task_send_outbox.sql` is applied only by the receipt-backed runner
in `scripts/db/migrate-note-task-outbox.mjs`. Do not run `drizzle-kit push`,
`drizzle-kit migrate`, `executeMultiple`, or a provider-console paste for this
migration. Those paths cannot atomically bind the production change to the
reviewed SQL, verified backup, isolated dry run, target database, and release.

The narrow ledger in `note-task-outbox-migration-ledger.json` binds the final
0007 SQL to its canonical LF SHA-256 and the exact outbox schema fingerprint:
17 columns, the `notes(id)` cascading foreign key, lifecycle/hash/version/
attempt checks, and three named indexes. Production also records an exact row
in `notes_schema_migrations` containing only hashes, release metadata, health
results, and the pre/post aggregate note count. It stores no credentials or
note content.

## Required production sequence

1. Freeze the release commit and use its full lowercase 40-character Git SHA.
2. Resolve and record only the normalized SHA-256 identity of the production
   database. Never put its URL or token in a receipt.
3. Create and verify a recoverable provider backup. Hash the backup bytes.
4. Restore that backup to an isolated local SQLite file. The file must be a
   checkpointed copy with no WAL/SHM sidecars, and its raw SHA-256 must equal
   the verified backup hash. Run the dedicated evidence mode (PowerShell shown;
   never point this command at production):

```powershell
$env:TURSO_DATABASE_URL='file:C:/absolute/path/to/isolated-notes.db'
node scripts/db/migrate-note-task-outbox.mjs dry-run --environment=test --confirm-dry-run=isolated-copy --backup-sha256=<verified-backup-hash> --release-sha=<full-40-character-git-sha>
```

   It verifies the source bytes, executes the same SQL and transactional
   proofs, checkpoints/closes the copy, and emits a `dryRunEvidence` object
   containing the final isolated-database hash. It cannot consume a production
   receipt or target a remote URL.
5. Record that exact `dryRunEvidence` object in a receipt conforming to
   `notes-migration-execution.schema.json`: exact ledger/SQL/schema hashes, equal
   before/after note counts, `integrity_check = ok`, and zero FK violations.
6. Inject `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` without printing them,
   then execute:

```text
node scripts/db/migrate-note-task-outbox.mjs --environment=production --confirm-production=notes --receipt=<absolute-or-repo-relative-receipt.json> --release-sha=<full-40-character-git-sha>
```

7. Run the identical production command again. The only acceptable result is `no-op`
   with the same database identity, receipt hash, schema fingerprint, ledger
   row, and health proof.

The runner fails closed if 0006 prerequisites are absent, if an outbox exists
without the exact ledger row, if the receipt targets another database/release,
or if any SQL/schema/backup/dry-run/health proof differs. On the first run, the
migration SQL, exact-object guards, note-count guard, integrity/FK guards, and
ledger insert are one write transaction. A failure rolls all of them back.

## Rollback posture

The migration is additive and must land before the Hybrid Notes sender is
enabled. The default application rollback is forward-only: disable the Hybrid
release flag and redeploy the current compatibility code, which protects both
pending and completed receipt bindings. Keep the additive outbox table in place.

Do not roll back to a pre-Hybrid binary after any outbox row has existed. That
code cannot protect completed receipt fields or understand outbox recovery. An
older immutable deployment is eligible only after a production proof that
`SELECT COUNT(*) FROM note_task_send_outbox` is exactly zero. Destructive schema
rollback requires a fresh verified backup and a separate reviewed operator
procedure; this runner intentionally does not expose one.
