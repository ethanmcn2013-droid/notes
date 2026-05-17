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
        <SignIn
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          forceRedirectUrl="/app"
          signUpForceRedirectUrl="/app"
        />
      </main>
    </>
  );
}
