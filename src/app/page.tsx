import Link from "next/link";
import { Hero } from "@/components/showcase/hero";
import { SuiteLauncher } from "@/components/suite-launcher";

export default function HomePage() {
  return (
    <>
      <header className="suitebar" aria-label="Signal Notes notebook chrome">
        <div className="suite-breadcrumb">
          <SuiteLauncher current="notes" />
          <span aria-hidden className="text-[12px]" style={{ color: "var(--color-ink-faint)" }}>/</span>
          <Link href="/" className="notes-mark text-[15px]" aria-label="Signal Notes home">
            <span className="word">notes</span>
            <span className="dot" aria-hidden />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[860px] px-7 pt-24 pb-32 sm:pt-28">
        <Hero />

        {/* ── Anti-feature register (BRAND.md §6) ─────────────────────────── */}
        <section className="mt-28 grid gap-5 sm:grid-cols-3">
          {[
            {
              label: "Not a wiki.",
              copy: "No links between notes. No backlinks. No graph view.",
            },
            {
              label: "Not a filing system.",
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
