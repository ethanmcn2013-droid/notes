/**
 * E3 — Notes wordmark loader.
 *
 * Replaces the bare indigo circle seen on /app page-load with the
 * `notes·` wordmark fading in on paper-white. Scoped to the /app
 * route only — other products are unaffected.
 *
 * Design: paper-white field, centred wordmark (Geist 20px, weight 500),
 * opacity 0→1 over 300ms cubic-bezier(0.16,1,0.3,1). The indigo dot
 * carries the caret animation as it does in the notebook header — brand
 * presence without motion noise.
 *
 * Server Component — zero JS overhead on first paint.
 */
export default function AppLoading() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        zIndex: 9999,
      }}
    >
      <span
        style={{
          fontFamily:
            '"Geist", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          fontWeight: 500,
          fontSize: 20,
          letterSpacing: "-0.025em",
          color: "#161815",
          display: "inline-flex",
          alignItems: "baseline",
          lineHeight: 1,
          whiteSpace: "nowrap",
          animation: "notes-loader-fade 300ms cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        notes
        <span
          style={{
            width: "min(0.16em, 10px)",
            height: "min(0.16em, 10px)",
            maxWidth: 10,
            maxHeight: 10,
            borderRadius: "50%",
            background: "#4f46e5",
            display: "inline-block",
            marginLeft: "0.06em",
            marginBottom: "0.06em",
            alignSelf: "flex-end",
            flexShrink: 0,
          }}
        />
      </span>
      <style>{`
        @keyframes notes-loader-fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes notes-loader-fade {
            from { opacity: 1; }
            to   { opacity: 1; }
          }
        }
      `}</style>
    </div>
  );
}
