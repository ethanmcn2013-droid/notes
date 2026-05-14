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
  const [initialNotes, captureEmail] = await Promise.all([
    listNotes(),
    getCaptureEmail(),
  ]);
  // Three rendering branches:
  //   - tier=pro: workspace+ user, inbound is wired → show address.
  //   - tier=free: free-tier user → show upgrade nudge.
  //   - tier=hidden: pro user, inbound NOT wired yet → hide entirely
  //     (don't show a fake-looking address that drops mail).
  let captureState: React.ComponentProps<typeof CaptureEmailRow>["state"] | null;
  if (captureEmail.ok) {
    captureState = { tier: "pro", address: captureEmail.address };
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
