import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DangerZone } from "@/components/account/danger-zone";

export const metadata: Metadata = {
  title: "Account — Signal Notes",
  description: "Account management.",
};

/**
 * /app/account
 *
 * The Account surface in Notes. Only the destructive delete lives
 * here — Clerk owns identity, and Notes has no other per-user
 * settings to surface.
 */
export default async function AccountPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const email =
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress ?? "";

  return (
    <main className="mx-auto w-full max-w-[640px] px-6 py-16">
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        Settings · Account
      </p>
      <h1 className="mb-3 text-[32px] font-semibold leading-[1.15] text-ink">
        Your Signal account
      </h1>
      <p className="mb-8 max-w-[560px] text-[15px] leading-[1.6] text-ink-soft">
        Signed in as <span className="font-medium text-ink">{email}</span>.
        Profile, password, and sign-in methods live in your Clerk account —
        the destructive action below is the only thing Notes controls
        directly.
      </p>

      <DangerZone email={email} />
    </main>
  );
}
