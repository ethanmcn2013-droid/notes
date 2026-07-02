import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { NotesHeroVoice } from "@/components/marketing/notes-hero-voice";
import { NotesDemo } from "@/components/marketing/notes-demo";
import { NotesHeader } from "@/components/marketing/notes-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { isDemoMode, isUxAssuranceMode } from "@/lib/access-mode";

export default async function HomePage() {
  const { userId } =
    isUxAssuranceMode() || isDemoMode() ? { userId: null } : await auth();
  const isSignedIn = Boolean(userId);

  return (
    <>
      <NotesHeader isSignedIn={isSignedIn} />

      {/*
        Page order (Caravaggio walkover, row 1): animated wordmark hero ->
        one-sentence promise -> "Open the notebook". The second hero
        (live notebook demo) and the animated NoteAnatomy were cut from
        the home. NoteAnatomy now lives at /anatomy as a deep-link.
      */}
      <NotesHeroVoice />

      <main className="mx-auto max-w-[860px] px-7 pt-0 pb-32">
        <section
          className="reveal mt-0 py-14 sm:py-20"
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
              href="/anatomy"
              className="inline-flex min-h-11 items-center rounded-full border px-5 text-[14px] font-medium transition-colors"
              style={{
                borderColor: "var(--color-line-strong)",
                color: "var(--color-ink-soft)",
              }}
            >
              Anatomy of a note
            </Link>
          </div>
        </section>

        {/* Product demo - the capture -> promote loop, shown in one calm note.
            Parity with the other products' homepage demos (review issue 07). */}
        <NotesDemo />

        <SiteFooter />
      </main>
    </>
  );
}
