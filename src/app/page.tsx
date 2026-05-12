import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <header className="suitebar" aria-label="Signal Studio suite">
        <a href="https://signalstudio.ie">
          signal studio<span>.</span>
        </a>
        <nav>
          <a href="https://tasks.signalstudio.ie">tasks</a>
          <a href="https://roadmap.signalstudio.ie">roadmap</a>
          <a href="https://analytics.signalstudio.ie">analytics</a>
          <strong>notes</strong>
        </nav>
      </header>

      <main className="mx-auto max-w-[860px] px-7 pt-24 pb-32 sm:pt-28">
        <p
          className="mb-5 font-mono text-[11px] uppercase tracking-[0.14em] font-semibold"
          style={{ color: "var(--color-ink-faint)" }}
        >
          Signal Notes <span style={{ color: "var(--color-accent-2)" }}>·</span> capture clarity
        </p>

        <h1
          className="text-[clamp(2.8rem,1.6rem+4vw,5rem)] font-semibold leading-[0.98] tracking-normal"
          style={{ color: "var(--color-ink)" }}
        >
          Your private layer.
          <br />
          Capture the thought.
          <br />
          Decide later.
        </h1>

        <p
          className="mt-7 max-w-[36rem] text-[17px] leading-[1.6]"
          style={{ color: "var(--color-ink-soft)" }}
        >
          A notebook for the half-formed thought, the thing not ready for the
          room, and the decision you need to understand before it becomes work.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            href="/app"
            className="inline-flex min-h-11 items-center rounded-full px-5 text-[14px] font-medium transition-opacity hover:opacity-90"
            style={{
              background: "var(--color-ink)",
              color: "var(--color-paper)",
            }}
          >
            Open the notebook
          </Link>
          <Link
            href="/wedding-planning"
            className="inline-flex min-h-11 items-center rounded-full border px-5 text-[14px] font-medium transition-colors"
            style={{
              borderColor: "var(--color-line-strong)",
              color: "var(--color-ink-soft)",
            }}
          >
            See a worked example
          </Link>
        </div>

        {/* ── Anti-feature register (BRAND.md §6) ─────────────────────────── */}
        <section className="mt-28 grid gap-5 sm:grid-cols-3">
          {[
            {
              label: "Not a wiki.",
              copy: "No links between notes. No backlinks. No graph view.",
            },
            {
              label: "Not a second brain.",
              copy: "It's a stream and a search field. Nothing to set up.",
            },
            {
              label: "Not AI-tagged.",
              copy: "Nothing auto-detects, auto-summarises, or auto-promotes.",
            },
          ].map((item) => (
            <div key={item.label}>
              <p
                className="text-[14px] font-semibold"
                style={{ color: "var(--color-ink)" }}
              >
                {item.label}
              </p>
              <p
                className="mt-2 text-[13.5px] leading-[1.55]"
                style={{ color: "var(--color-ink-soft)" }}
              >
                {item.copy}
              </p>
            </div>
          ))}
        </section>

        <footer
          className="mt-32 border-t pt-8 text-[12px] font-mono tracking-wide"
          style={{
            borderColor: "var(--color-line)",
            color: "var(--color-ink-faint)",
          }}
        >
          Signal Notes · part of{" "}
          <a
            href="https://signalstudio.ie"
            className="underline decoration-dotted"
            style={{ color: "var(--color-ink-soft)" }}
          >
            Signal Studio
          </a>
          . Contact{" "}
          <a
            href="mailto:hello@signalstudio.ie"
            className="underline decoration-dotted"
            style={{ color: "var(--color-ink-soft)" }}
          >
            hello@signalstudio.ie
          </a>
          .
        </footer>
      </main>
    </>
  );
}
