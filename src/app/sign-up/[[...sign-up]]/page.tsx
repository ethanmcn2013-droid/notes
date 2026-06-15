import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { SuiteLauncher } from "@/components/suite-launcher";
import { notesClerkAppearance } from "@/lib/clerk-appearance";

export const metadata = {
  title: "Sign up — Signal Notes",
};

export default function SignUpPage() {
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
      <main className="flex min-h-[calc(100vh-44px)] items-center justify-center px-6 py-16">
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
          <SignUp
            path="/sign-up"
            routing="path"
            signInUrl="/sign-in"
            forceRedirectUrl="/app"
            signInForceRedirectUrl="/app"
            appearance={notesClerkAppearance}
          />
          <p className="notes-auth-reassure">
            <span className="notes-auth-reassure-dot" aria-hidden />
            Private by default — your notes are only ever yours.
          </p>
        </div>
      </main>
    </>
  );
}
