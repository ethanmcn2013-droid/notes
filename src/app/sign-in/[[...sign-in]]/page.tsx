import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { SuiteLauncher } from "@/components/suite-launcher";

export const metadata = {
  title: "Sign in — Signal Notes",
};

export default function SignInPage() {
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
          SSR skeleton: Clerk is client-only so <main> is empty before hydration.
          This shell is visible on slow connections / sales calls and prevents a
          blank white void. Clerk replaces it on hydration via the SignIn mount.
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
            Sign in to your notebook
          </p>
          <SignIn
            path="/sign-in"
            routing="path"
            signUpUrl="/sign-up"
            forceRedirectUrl="/app"
            signUpForceRedirectUrl="/app"
          />
        </div>
      </main>
    </>
  );
}
