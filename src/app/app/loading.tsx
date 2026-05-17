/**
 * Loading boundary for the authenticated /app segment.
 *
 * Renders inside the AppLayout shell (suitebar already painted by the
 * layout). Shows the caret mark centered in the remaining viewport so
 * the user has a brand-consistent signal while the notebook data loads.
 *
 * Dot is hard-clamped at 10px (same contract as globals.css R3-mount
 * fix) so the mark never scales unbounded before Geist resolves.
 */
export default function AppLoading() {
  return (
    <div
      aria-label="Loading your notebook"
      role="status"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 44px)",
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
