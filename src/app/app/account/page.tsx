import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DangerZone } from "@/components/account/danger-zone";
import { ManageIdentityButton } from "@/components/account/manage-identity-button";
import { isDemoMode } from "@/lib/access-mode";

export const metadata: Metadata = {
  title: "Account · Signal Notes",
  description: "Account management.",
};

/**
 * /app/account
 *
 * The Account surface in Notes. Only the destructive delete lives
 * here, Clerk owns identity, and Notes has no other per-user
 * settings to surface.
 */
export default async function AccountPage() {
  // Demo/Review: render the settings surface with a synthetic identity so it
  // is reviewable without a session. Never touches Clerk.
  const demoMode = isDemoMode();
  let email: string;
  if (demoMode) {
    email = "you@theorchard.example";
  } else {
    const user = await currentUser();
    if (!user) redirect("/sign-in");
    email =
      user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
        ?.emailAddress ?? "";
  }

  return (
    <main className="mx-auto w-full max-w-[640px] px-6 py-16">
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
        Settings · Account
      </p>
      <h1 className="mb-3 text-[32px] font-semibold leading-[1.15] text-ink">
        Your Signal account
      </h1>
      <p className="mb-7 max-w-[560px] text-[15px] leading-[1.6] text-ink-soft">
        Signed in as <span className="font-medium text-ink">{email}</span>, one
        account across Notes, Tasks, Timeline, and Signal. Notes keeps only what
        you write; your password and sign-in methods live in your Signal
        account.
      </p>

      {demoMode ? (
        <p className="rounded-lg border border-hairline bg-paper px-5 py-4 text-body-sm leading-body text-ink-soft">
          Identity and account deletion controls are unavailable in this
          seed-only review. Production keeps both controls behind your real
          Signal account.
        </p>
      ) : (
        <>
          <ManageIdentityButton />
          <DangerZone email={email} />
        </>
      )}
    </main>
  );
}
