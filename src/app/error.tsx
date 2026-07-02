"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Root error boundary. Notes throws raw Errors from its server actions
 * and reads from Turso server-side in app/page.tsx with no boundary —
 * a render-time throw or a DB blip would otherwise be an unstyled
 * white-screen crash on a privacy-sensitive surface. Kept in Notes'
 * own quiet register, not the suite register.
 */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("notes: uncaught error", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 1.5rem",
        background: "var(--color-bg)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "26rem",
          background: "var(--color-paper)",
          border: "1px solid var(--color-line)",
          borderRadius: "12px",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "1.15rem",
            fontWeight: 600,
            color: "var(--color-ink)",
            marginBottom: "0.5rem",
          }}
        >
          This didn&rsquo;t open.
        </h1>
        <p
          style={{
            fontSize: "0.875rem",
            lineHeight: 1.6,
            color: "var(--color-ink-soft)",
            marginBottom: "1.5rem",
          }}
        >
          Nothing was lost. Your notes are saved — this was a loading
          hiccup. Try again in a moment.
        </p>
        {error.digest ? (
          <p
            style={{
              fontFamily: "monospace",
              fontSize: "0.7rem",
              color: "var(--color-ink-faint)",
              marginBottom: "1rem",
            }}
          >
            ref · {error.digest}
          </p>
        ) : null}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={reset}
            style={{
              background: "var(--color-accent)",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "0.6rem 1rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          <Link
            href="/app"
            style={{
              border: "1px solid var(--color-line)",
              color: "var(--color-ink-soft)",
              borderRadius: "8px",
              padding: "0.6rem 1rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Back to notes
          </Link>
        </div>
      </div>
    </div>
  );
}
