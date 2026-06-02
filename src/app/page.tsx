import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { NotesHeroVoice } from "@/components/marketing/notes-hero-voice";
import { Hero } from "@/components/showcase/hero";
import { NoteAnatomy } from "@/components/marketing/note-anatomy";
import { SuiteLauncher } from "@/components/suite-launcher";
import { UserButtonWithSuite } from "@/components/user-button-with-suite";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SuiteArrows } from "@/components/suite-arrows";

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
          <div style={{ display: "flex", alignItems: "center" }}>
            <UserButtonWithSuite current="notes" />
          </div>
        ) : (
          /* Sign in is a visible affordance, never a gate — public scanning
             stays open (canonical product header, DESIGN.md §14). */
          <Link href="/sign-in" className="notes-signin">
            Sign in
          </Link>
        )}
      </header>

      <SuiteArrows current="notes" />

      {/*
        Page order: animated wordmark hero, live notebook demo, animated
        anatomy, final CTA. No upper CTA cluster.
      */}
      <NotesHeroVoice />

      <main className="mx-auto max-w-[860px] px-7 pt-14 pb-32 sm:pt-16">
        <Hero />

        <NoteAnatomy />

        <section
          className="reveal mt-28 border-t py-20 sm:mt-32 sm:py-24"
          style={{ borderColor: "var(--color-line)" }}
        >
          <p
            className="font-mono"
            style={{
              marginBottom: 18,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--color-ink-faint)",
            }}
          >
            Start with the thought
          </p>
          <h2
            style={{
              maxWidth: "15ch",
              fontSize: "clamp(2rem, 1.45rem + 2.6vw, 3.7rem)",
              fontWeight: 600,
              lineHeight: 1.02,
              letterSpacing: "-0.04em",
              color: "var(--color-ink)",
              margin: 0,
            }}
          >
            Capture it before it becomes work.
          </h2>
          <p
            style={{
              marginTop: 22,
              maxWidth: "40rem",
              fontSize: 16,
              lineHeight: 1.6,
              color: "var(--color-ink-soft)",
            }}
          >
            Open the notebook when the thought is still fresh. Write it down
            fast, find it later, and choose what crosses into Tasks.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/app"
              className="inline-flex min-h-11 items-center rounded-full px-5 text-[14px] font-medium transition-opacity hover:opacity-90"
              style={{
                background: "var(--color-signal)",
                color: "#ffffff",
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
              See a worked notebook
            </Link>
          </div>
        </section>

        <SiteFooter />
      </main>
    </>
  );
}
