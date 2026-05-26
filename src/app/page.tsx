import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { NotesHeroLoader } from "@/components/showcase/notes-hero-loader";
import { Hero } from "@/components/showcase/hero";
import { NoteAnatomy } from "@/components/marketing/note-anatomy";
import { SuiteLauncher } from "@/components/suite-launcher";
import { UserButtonWithSuite } from "@/components/user-button-with-suite";
import { SiteFooter } from "@/components/marketing/site-footer";

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

      {/*
        Hero loader — full-width, outside the max-w container so the animation
        can use the full viewport. Immediately followed by the product intro +
        live demo, anatomy, and anti-features below.
      */}
      <NotesHeroLoader />

      <main className="mx-auto max-w-[860px] px-7 pt-16 pb-32 sm:pt-20">
        <Hero />

        <NoteAnatomy />

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

        <SiteFooter />
      </main>
    </>
  );
}
