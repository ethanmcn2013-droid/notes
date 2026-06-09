/**
 * NoteProvenanceChip — N·24 (Pattern 4) cross-cutting primitive.
 *
 * The handoff §4 names two provenance affordances that converge on
 * the same chip shape:
 *   - kind="calendar"     → green "from calendar" pill (Pattern 4)
 *   - kind="image-match"  → mustard "found in image" pill (Pattern 2)
 *
 * Same weight, same Geist-Mono fallback (ui-monospace), same
 * disappear-on-interaction rule. One component, two colour tokens,
 * no extra design surface.
 *
 * Pattern 2 is not shipping in this cycle — the `image-match` branch
 * is wired so the OCR pass (Cycle 3) can use this primitive without
 * rebuilding it.
 *
 * Visual register (per the handoff):
 *   - 10px monospace, ink-faint, no icon
 *   - kind=calendar    → green #6B8E5A  (Notes green register)
 *   - kind=image-match → mustard #C7A24A (Notes accent-2 register)
 *   - one chip per row, inline with the existing .note-meta span
 *
 * The disappear rule (Pattern 4): the calendar chip only renders
 * while the spawned note is untouched (createdAt === updatedAt).
 * That decision lives in the *caller* (NoteRow.tsx), not here — the
 * chip is a dumb pill.
 */

export type NoteProvenanceKind = "calendar" | "image-match";

const LABELS: Record<NoteProvenanceKind, string> = {
  calendar: "from calendar",
  "image-match": "found in image",
};

const COLORS: Record<NoteProvenanceKind, string> = {
  // Locked palette refs from the handoff spec; not new tokens. If a
  // future cycle introduces palette tokens for these, swap in place.
  calendar: "#6B8E5A",
  "image-match": "#C7A24A",
};

export function NoteProvenanceChip({ kind }: { kind: NoteProvenanceKind }) {
  return (
    <span
      className="note-provenance-chip"
      data-kind={kind}
      style={{ color: COLORS[kind] }}
      aria-label={LABELS[kind]}
    >
      {LABELS[kind]}
    </span>
  );
}
