import { listNotes } from "@/server/actions/notes";
import { Notebook } from "./Notebook";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Signal Notes — notebook",
  description: "Capture in three seconds. Find it later.",
};

// Server component — fetches the user's notes once, hands the initial
// stream to the client Notebook. Subsequent edits flow through server
// actions; the client applies optimistic updates and reconciles.
export default async function NotebookPage() {
  const initialNotes = await listNotes();
  return <Notebook initialNotes={initialNotes} />;
}
