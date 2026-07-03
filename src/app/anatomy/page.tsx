import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { NoteAnatomy } from "@/components/marketing/note-anatomy";
import { NotesHeader } from "@/components/marketing/notes-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { isDemoMode, isUxAssuranceMode } from "@/lib/access-mode";

/**
 * /anatomy - deep-link route for the animated Note Anatomy decomposition.
 *
 * Caravaggio walkover row 1: NoteAnatomy was moved off the marketing home
 * to keep the home hero a clean three-beat (wordmark -> sentence -> CTA).
 * The anatomy remains a reachable artefact for marketing deep-links,
 * spec references, and onboarding moments. Same component, quieter route.
 */
export default async function AnatomyPage() {
  const { userId } =
    isUxAssuranceMode() || isDemoMode() ? { userId: null } : await auth();
  const isSignedIn = Boolean(userId);

  return (
    <>
      <NotesHeader isSignedIn={isSignedIn} sectionLabel="anatomy" />

      <main className="mx-auto max-w-[860px] px-7 pt-14 pb-32 sm:pt-16">
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
          Anatomy of a note
        </p>
        <h1
          style={{
            maxWidth: "18ch",
            fontSize: "clamp(2rem, 1.45rem + 2.6vw, 3.7rem)",
            fontWeight: 600,
            lineHeight: 1.02,
            letterSpacing: "-0.04em",
            color: "var(--color-ink)",
            margin: 0,
          }}
        >
          Five honest slots.
        </h1>
        <p
          style={{
            marginTop: 22,
            maxWidth: "40rem",
            fontSize: 16,
            lineHeight: 1.6,
            color: "var(--color-ink-soft)",
          }}
        >
          Title is the first line of the body. Preview is the rest. A stamp
          tells you when. A pip tells you whether it crossed into Tasks.
          Nothing else.
        </p>

        <NoteAnatomy />

        <section
          className="mt-28 border-t pt-16 sm:mt-32 sm:pt-20"
          style={{ borderColor: "var(--color-line)" }}
        >
          <div className="flex flex-wrap items-center gap-3">
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
              href="/"
              className="inline-flex min-h-11 items-center rounded-full border px-5 text-[14px] font-medium transition-colors"
              style={{
                borderColor: "var(--color-line-strong)",
                color: "var(--color-ink-soft)",
              }}
            >
              Back to home
            </Link>
          </div>
        </section>

        <SiteFooter />
      </main>
    </>
  );
}

export const metadata = {
  title: "Anatomy of a note · Signal Notes",
  description:
    "Five honest slots: title, preview, stamp, pip, draft. The five parts behind the three-second capture promise.",
};
