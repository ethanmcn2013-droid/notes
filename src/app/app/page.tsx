import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { listNotes } from "@/server/actions/notes";
import { getCaptureEmail } from "@/server/actions/capture-email";
import { Notebook } from "./Notebook";
import { CaptureEmailRow } from "./CaptureEmailRow";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Signal Notes — notebook",
  description: "Capture in three seconds. Find it later.",
};

// Server component — fetches the user's notes once, hands the initial
// stream to the client Notebook. Subsequent edits flow through server
// actions; the client applies optimistic updates and reconciles.
export default async function NotebookPage() {
  // Fail open to sign-in, never to a 500. The proxy middleware gates
  // /app when Clerk keys are configured, but it bypasses entirely in
  // keyless/dev mode (see proxy.ts) — and listNotes()/requireUser()
  // throws UnauthorizedError when there's no session. Without this
  // guard an unauthenticated hit renders an unhandled 500 instead of
  // the sign-in screen. Belt-and-braces: correct even when the
  // middleware is doing its job.
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const [initialNotes, captureEmail] = await Promise.all([
    listNotes(),
    getCaptureEmail(),
  ]);
  // Three rendering branches:
  //   - tier=entitled: workspace+ user, inbound is wired → show address.
  //   - tier=free: free-tier user → show upgrade nudge.
  //   - null: workspace+ user, inbound NOT wired yet → hide entirely
  //     (don't show a fake-looking address that drops mail).
  let captureState: React.ComponentProps<typeof CaptureEmailRow>["state"] | null;
  if (captureEmail.ok) {
    captureState = { tier: "entitled", address: captureEmail.address };
  } else if (captureEmail.reason === "free-tier-not-enabled") {
    captureState = { tier: "free" };
  } else {
    captureState = null;
  }
  return (
    <>
      <Notebook initialNotes={initialNotes} />
      {captureState ? <CaptureEmailRow state={captureState} /> : null}
    </>
  );
}
