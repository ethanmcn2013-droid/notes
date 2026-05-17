/**
 * Root-level App Router loading boundary for Signal Notes.
 *
 * Renders the Notes per-product gesture (caret — indigo dot blinks at
 * 1.1s steps(1,end), like a held text cursor) centered on Notes's warm
 * notebook paper background (#fffefa).
 *
 * The mark size is hard-clamped at 10px so it can never scale unbounded
 * during font-swap or pre-hydration windows. R3-mount remediation.
 */
export default function Loading() {
  return (
    <div
      aria-label="Loading Signal Notes"
      role="status"
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fffefa",
      }}
    >
      <span
        className="notes-mark"
        aria-hidden="true"
        style={{ fontSize: 16 }}
      >
        <span className="word">notes</span>
        <span className="dot" />
      </span>
    </div>
  );
}
