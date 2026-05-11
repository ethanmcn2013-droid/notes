import { SignIn } from "@clerk/nextjs";

export const metadata = {
  title: "Sign in — Signal Notes",
};

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
        forceRedirectUrl="/app"
        signUpForceRedirectUrl="/app"
      />
    </main>
  );
}
