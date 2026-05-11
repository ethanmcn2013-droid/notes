import { SignUp } from "@clerk/nextjs";

export const metadata = {
  title: "Sign up — Signal Notes",
};

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <SignUp
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
        forceRedirectUrl="/app"
        signInForceRedirectUrl="/app"
      />
    </main>
  );
}
