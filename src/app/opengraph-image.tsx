import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "Signal Notes, capture clarity";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#ffffff",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        {/* Subtle grid rule, a single horizontal line for visual grounding */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: 120,
              left: 80,
              right: 80,
              height: 1,
              background: "#e7e4d8",
            }}
          />
        </div>

        {/* Wordmark */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 0,
            marginBottom: 32,
          }}
        >
          <span
            style={{
              fontSize: 72,
              fontWeight: 600,
              letterSpacing: "-0.04em",
              color: "#111111",
              lineHeight: 1,
            }}
          >
            signal studio
          </span>
          <span
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#4f46e5",
              lineHeight: 1,
              marginLeft: 3,
            }}
          >
            .
          </span>
        </div>

        {/* Product name */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 500,
            letterSpacing: "-0.01em",
            color: "#4a4a44",
            marginBottom: 16,
          }}
        >
          Signal Notes
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 22,
            fontWeight: 400,
            color: "#9b9b94",
            letterSpacing: "0em",
          }}
        >
          capture clarity
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
