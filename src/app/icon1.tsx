import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

/**
 * Android maskable icon — Signal Notes.
 *
 * Notes is intentionally outside the suite visual register
 * (green/mustard/Inter — DESIGN.md §11). For the maskable variant
 * the field is Notes' green accent (#335f54) — solid color is
 * required by maskable spec, and the green-paper-indigo trio
 * preserves Notes' own register at install time. White paper "n"
 * glyph + indigo dot inside the 80%-diameter safe zone.
 */
export default function MaskableIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#335f54",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            color: "#fffefa",
            fontSize: 220,
            fontWeight: 700,
            letterSpacing: "-0.06em",
          }}
        >
          <span style={{ display: "flex" }}>n</span>
          <span
            style={{
              display: "flex",
              width: 28,
              height: 28,
              borderRadius: 9999,
              background: "#4f46e5",
              marginLeft: 12,
              marginBottom: 12,
            }}
          />
        </div>
      </div>
    ),
    size,
  );
}
