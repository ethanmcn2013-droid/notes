import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * Apple touch icon for Signal Notes. Full "notes" wordmark on
 * Notes' own paper canvas (#fffefa, not the suite brand-soft),
 * in Notes' ink color (#161815), with the suite-locked indigo
 * dot.
 *
 * Notes is intentionally outside the suite visual register
 * (green/mustard/Inter — see DESIGN.md §11). The apple-icon
 * honours Notes' own paper field while preserving the suite's
 * indigo-dot wordmark gesture as the family signal — same
 * grammar as tasks/analytics/roadmap/studio apple-icons.
 *
 * No transparency — Apple draws a tile under transparent icons.
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#fffefa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 26,
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          borderRadius: 36,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            color: "#161815",
            fontSize: 96,
            fontWeight: 700,
            letterSpacing: "-0.05em",
          }}
        >
          <span style={{ display: "flex" }}>notes</span>
          <span
            style={{
              display: "flex",
              width: 16,
              height: 16,
              borderRadius: 9999,
              background: "#4f46e5",
              marginLeft: 8,
              marginBottom: 6,
            }}
          />
        </div>
      </div>
    ),
    size,
  );
}
