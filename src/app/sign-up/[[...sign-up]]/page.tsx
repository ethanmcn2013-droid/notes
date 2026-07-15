import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { NotesHeader } from "@/components/marketing/notes-header";
import { isDemoMode } from "@/lib/access-mode";
import { notesClerkAppearance } from "@/lib/clerk-appearance";

export const metadata = {
  title: "Sign up - Signal Notes",
};

export default function SignUpPage() {
  const showReviewShortcut = isDemoMode();

  return (
    <>
      <NotesHeader showAuth={false} />
      <main className="flex min-h-[calc(100vh-56px)] items-center justify-center px-6 py-16">
        {/*
          SSR skeleton mirrors /sign-in: Clerk is client-only, so this warm
          shell holds the moment before hydration instead of a blank void.
          Clerk replaces it on mount.
        */}
        <div className="flex flex-col items-center gap-6 text-center">
          <Link href="/" className="notes-mark text-[22px]" aria-label="Signal Notes home">
            <span className="word">notes</span>
            <span className="dot" aria-hidden />
          </Link>
          <p
            className="text-[15px]"
            style={{ color: "var(--color-ink-soft, #4a4a44)", letterSpacing: "-0.01em" }}
          >
            Start your notebook.
          </p>
          {showReviewShortcut ? (
            <div
              className="w-full max-w-[360px] rounded-[8px] border px-6 py-6 text-left"
              style={{
                borderColor: "var(--color-line)",
                background: "var(--color-paper)",
              }}
            >
              <p
                className="font-mono text-[11px] font-semibold uppercase"
                style={{
                  color: "var(--color-ink-faint)",
                  letterSpacing: "0.12em",
                }}
              >
                Review mode
              </p>
              <p
                className="mt-3 text-[20px] font-medium leading-tight"
                style={{ color: "var(--color-ink)" }}
              >
                Open the review notebook.
              </p>
              <p
                className="mt-3 text-[14px] leading-relaxed"
                style={{ color: "var(--color-ink-soft)" }}
              >
                This preview uses seed data, so there is no real account to
                create.
              </p>
              <Link
                href="/app"
                className="mt-5 inline-flex min-h-11 items-center rounded-full px-5 text-[14px] font-medium"
                style={{ background: "var(--color-signal)", color: "#fff" }}
              >
                Open the notebook
              </Link>
            </div>
          ) : (
            <SignUp
              path="/sign-up"
              routing="path"
              signInUrl="/sign-in"
              forceRedirectUrl="/app"
              signInForceRedirectUrl="/app"
              appearance={notesClerkAppearance}
            />
          )}
          <p className="notes-auth-reassure">
            <span className="notes-auth-reassure-dot" aria-hidden />
            Private by default. Your notes are only ever yours.
          </p>
        </div>
      </main>
    </>
  );
}
