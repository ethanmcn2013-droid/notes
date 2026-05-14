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
  const captureState =
    captureEmail.ok
      ? ({ tier: "pro", address: captureEmail.address } as const)
      : ({ tier: "free" } as const);
  return (
    <>
      <Notebook initialNotes={initialNotes} />
      <CaptureEmailRow state={captureState} />
    </>
  );
}
