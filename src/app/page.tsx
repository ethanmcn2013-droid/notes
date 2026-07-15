import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { NotesHeroNotebook } from "@/components/marketing/notes-hero-notebook";
import { NotesDemo } from "@/components/marketing/notes-demo";
import { NotesHeader } from "@/components/marketing/notes-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { isDemoMode, isUxAssuranceMode } from "@/lib/access-mode";
import { resolveDemoFixture } from "@/server/demo/fixtures";

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const demoMode = isDemoMode();
  if (demoMode && resolveDemoFixture((await searchParams).fixture) === "error") {
    throw new Error("Deliberate Signal Notes review fixture: homepage load failed");
  }
  const { userId } =
    isUxAssuranceMode() || demoMode ? { userId: null } : await auth();
  const isSignedIn = Boolean(userId);

  return (
    <>
      <NotesHeader isSignedIn={isSignedIn} />

      {/*
        Homepage hero: The Notebook — a ~10s SSR-safe, pure-CSS film of the whole
        product in one surface (capture -> find -> swipe one way to Tasks), resolving
        on the notes. wordmark. Reduced-motion / no-JS render the finished frame.
      */}
      <NotesHeroNotebook />

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
            Findable later, never filed.
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
