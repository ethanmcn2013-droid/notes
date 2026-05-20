/**
 * Notes /app loading boundary — wordmark identity loader.
 *
 * Server Component, zero JS, inlined keyframes so motion paints with
 * the first HTML chunk — survives the cross-origin pre-CSS window
 * during sibling-product jumps.
 *
 * Choreography:
 *   1. Letters of "notes" rise into place with stagger (60ms apart,
 *      280ms cubic-bezier(0.16,1,0.3,1)).
 *   2. Indigo dot lands as the period with a soft overshoot bounce
 *      after the last letter starts.
 *   3. Once landed, the dot enters the canonical Notes caret blink —
 *      same gesture as the notebook header.
 *
 * Notes uses its own paper colour `#fffefa` (warm white) per the
 * Notes brand register, not the suite `--paper` token.
 *
 * Reduced motion: letters appear fully, dot lands without scale-bounce,
 * caret stops blinking.
 */
export default function NotesLoading() {
  const word = "notes";
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fffefa",
        zIndex: 9999,
      }}
    >
      <span
        style={{
          fontFamily:
            'var(--font-geist-sans), "Geist", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
          fontWeight: 600,
          fontSize: 36,
          letterSpacing: "-0.04em",
          lineHeight: 0.96,
          color: "#161815",
          display: "inline-flex",
          alignItems: "baseline",
          whiteSpace: "nowrap",
        }}
      >
        {word.split("").map((c, i) => (
          <span
            key={i}
            style={{
              display: "inline-block",
              animation: `signal-letter-rise 280ms cubic-bezier(0.16,1,0.3,1) ${i * 60}ms both`,
            }}
          >
            {c}
          </span>
        ))}
        <span
          style={{
            display: "inline-block",
            width: 11,
            height: 11,
            maxWidth: 11,
            maxHeight: 11,
            borderRadius: "50%",
            background: "#4f46e5",
            marginLeft: 6,
            transform: "translateY(-2px)",
            flexShrink: 0,
            animation: `signal-dot-land 360ms cubic-bezier(0.34,1.56,0.64,1) ${word.length * 60 + 80}ms both, signal-notes-caret 1.1s steps(1,end) ${word.length * 60 + 600}ms infinite`,
          }}
        />
      </span>
      <style>{`
        @keyframes signal-letter-rise {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes signal-dot-land {
          0%   { opacity: 0; transform: translateY(-2px) scale(0.4); }
          60%  { opacity: 1; transform: translateY(-2px) scale(1.18); }
          100% { opacity: 1; transform: translateY(-2px) scale(1); }
        }
        @keyframes signal-notes-caret {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes signal-letter-rise {
            from { opacity: 1; transform: none; }
            to   { opacity: 1; transform: none; }
          }
          @keyframes signal-dot-land {
            from, to { opacity: 1; transform: translateY(-2px) scale(1); }
          }
          @keyframes signal-notes-caret {
            from, to { opacity: 1; }
          }
        }
      `}</style>
    </div>
  );
}
