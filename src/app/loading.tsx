// app/loading.tsx — Signal Notes loading boundary.
// Signal Studio loading boundary — LOADING_SYSTEM.md §1.
// One dot. Paper white field (#ffffff — NOT #fffefa notebook canvas).
// No wordmark. No chrome. No skeleton.
// Server Component: zero JS overhead, paints with the RSC shell.
//
// Notes special case (LOADING_SYSTEM.md §1 table):
//   Notes uses #fffefa as its notebook canvas background.
//   The loading field uses var(--paper, #ffffff) — paper white — because
//   the loading state precedes the product chrome. The warm canvas is the
//   notebook surface, applied after the shell paints.
//
// Canonical contract: LOADING_SYSTEM.md §1 · DECISIONS.md D3
// Hard refusals: no wordmark, no skeleton, no spinner, no warm bg, no text.
export default function Loading() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--paper, #ffffff)",
        zIndex: 9999,
      }}
    >
      <div
        className="signal-loading-dot"
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "var(--indigo, #4f46e5)",
          flexShrink: 0,
          willChange: "transform, opacity",
        }}
      />
    </div>
  );
}
