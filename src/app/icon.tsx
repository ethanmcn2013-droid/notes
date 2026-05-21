import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * Browser tab icon for Signal Notes. Compact mark — wordmark "n"
 * on Notes' own paper canvas (#fffefa, not the suite brand-soft),
 * in Notes' ink color (#161815), with the suite-locked indigo dot
 * bottom-right.
 *
 * Notes is intentionally outside the suite visual register
 * (green/mustard/Inter — see DESIGN.md §11). The icon honours
 * Notes' own paper field while preserving the suite's indigo-dot
 * wordmark gesture as the family signal.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#fffefa",
          color: "#161815",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: "-0.06em",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          borderRadius: 6,
        }}
      >
        <span style={{ display: "flex", marginLeft: 1 }}>n</span>
        <span
          style={{
            display: "flex",
            position: "absolute",
            right: 5,
            bottom: 7,
            width: 4,
            height: 4,
            borderRadius: 9999,
            background: "#4f46e5",
          }}
        />
      </div>
    ),
    size,
  );
}
