import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Hero } from "@/components/showcase/hero";
import { SuiteLauncher } from "@/components/suite-launcher";
import { UserButtonWithSuite } from "@/components/user-button-with-suite";
import {
  ANALYTICS_URL,
  ROADMAP_URL,
  STUDIO_URL,
  TASKS_URL,
} from "@/lib/product-urls";

const SIBLINGS = [
  { name: "Signal Tasks", note: "Run the work", url: TASKS_URL },
  { name: "Signal Roadmap", note: "Show the work", url: ROADMAP_URL },
  { name: "Signal Analytics", note: "Read the work", url: ANALYTICS_URL },
];

export default async function HomePage() {
  const { userId } = await auth();
  const isSignedIn = Boolean(userId);

  return (
    <>
      <header className="suitebar" aria-label="Signal Notes notebook chrome">
        <div className="suite-breadcrumb">
          <SuiteLauncher current="notes" isAuthed={isSignedIn} />
          <span aria-hidden className="text-[12px]" style={{ color: "var(--color-ink-faint)" }}>/</span>
          <Link href="/" className="notes-mark text-[15px]" aria-label="Signal Notes home">
            <span className="word">notes</span>
            <span className="dot" aria-hidden />
          </Link>
        </div>
        {isSignedIn ? (
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link
              href="/app"
              className="text-[13px] font-medium"
              style={{
                color: "var(--color-ink-soft)",
                textDecoration: "underline",
                textDecorationStyle: "dotted",
                textUnderlineOffset: 3,
              }}
            >
              Open the notebook
            </Link>
            <UserButtonWithSuite current="notes" />
          </div>
        ) : null}
      </header>

      <main className="mx-auto max-w-[860px] px-7 pt-24 pb-32 sm:pt-28">
        <Hero />

        {/* ── Anti-feature register (BRAND.md §6) ─────────────────────────── */}
        <section className="reveal mt-28 grid gap-5 sm:grid-cols-3">
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
          className="reveal mt-32 border-t pt-10"
          style={{ borderColor: "var(--color-line)" }}
        >
          <p
            className="font-mono text-[11px] uppercase"
            style={{
              letterSpacing: "0.14em",
              color: "var(--color-ink-faint)",
            }}
          >
            The rest of Signal Studio
          </p>
          <ul className="mt-5 grid gap-x-10 gap-y-4 sm:grid-cols-3">
            {SIBLINGS.map((s) => (
              <li key={s.name}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <span
                    className="text-[14px] font-semibold underline decoration-dotted underline-offset-4"
                    style={{ color: "var(--color-ink)" }}
                  >
                    {s.name}
                  </span>
                  <span
                    className="mt-1 block text-[12.5px]"
                    style={{ color: "var(--color-ink-soft)" }}
                  >
                    {s.note}
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <div
            className="mt-10 flex flex-col gap-2 border-t pt-6 font-mono text-[12px] tracking-wide sm:flex-row sm:items-center sm:justify-between"
            style={{
              borderColor: "var(--color-line)",
              color: "var(--color-ink-faint)",
            }}
          >
            <span>
              A{" "}
              <a
                href={STUDIO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-dotted"
                style={{ color: "var(--color-ink-soft)" }}
              >
                Signal Studio
              </a>{" "}
              product. Contact{" "}
              <a
                href="mailto:hello@signalstudio.ie"
                className="underline decoration-dotted"
                style={{ color: "var(--color-ink-soft)" }}
              >
                hello@signalstudio.ie
              </a>
              .
            </span>
            <span>Clarity, not configuration.</span>
          </div>
        </footer>
      </main>
    </>
  );
}
