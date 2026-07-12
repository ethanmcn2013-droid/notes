import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/access-mode";
import { listArchivedNotes, listNotes } from "@/server/actions/notes";
import { getCaptureEmail } from "@/server/actions/capture-email";
import {
  fetchTasksWorkspaceCatalog,
  selectAuthorizedWorkspaceHint,
} from "@/server/tasks-personalization";
import { Notebook } from "./Notebook";
import { CaptureEmailRow } from "./CaptureEmailRow";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Signal Notes, notebook",
  description: "Capture in three seconds. Find it later.",
};

// Server component, fetches the user's notes once, hands the initial
// stream to the client Notebook. Subsequent edits flow through server
// actions; the client applies optimistic updates and reconciles.
export default async function NotebookPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Fail open to sign-in, never to a 500. The proxy middleware gates
  // /app when Clerk keys are configured, but it bypasses entirely in
  // keyless/dev mode (see proxy.ts), and listNotes()/requireUser()
  // throws UnauthorizedError when there's no session. Without this
  // guard an unauthenticated hit renders an unhandled 500 instead of
  // the sign-in screen. Belt-and-braces: correct even when the
  // middleware is doing its job.
  // Demo/Review mode skips the sign-in gate entirely, the notebook renders
  // from the in-memory seed (listNotes/listArchivedNotes short-circuit).
  if (!isDemoMode()) {
    const { userId } = await auth();
    if (!userId) {
      redirect("/sign-in");
    }
  }

  const { userId } = await auth();
  const planningPeriodsEnabled =
    process.env.SIGNAL_PLANNING_PERIODS_ENABLED === "1" ||
    process.env.SIGNAL_PLANNING_PERIODS_ENABLED === "true";
  const params = await searchParams;
  const workspaceHint = typeof params.workspaceId === "string" ? params.workspaceId : null;
  const periodHint =
    typeof params.planningPeriodId === "string" ? params.planningPeriodId : null;

  const [initialNotes, initialArchivedNotes, captureEmail, tasksCatalog] = await Promise.all([
    listNotes(),
    listArchivedNotes(),
    getCaptureEmail(),
    userId && !isDemoMode()
      ? fetchTasksWorkspaceCatalog(userId)
      : Promise.resolve({ status: "unavailable" as const, planningPeriods: [], workspaces: [] }),
  ]);
  // URL context is navigation state, never authorization. Only select a hint
  // when the current subject's freshly-read Tasks catalog contains it.
  const hintedWorkspace = planningPeriodsEnabled
    ? selectAuthorizedWorkspaceHint(tasksCatalog, workspaceHint, periodHint)
    : null;
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
      <Notebook
        initialNotes={initialNotes}
        initialArchivedNotes={initialArchivedNotes}
        tasksWorkspaces={tasksCatalog.workspaces}
        tasksCatalogAvailable={tasksCatalog.status === "ready"}
        planningPeriodsEnabled={planningPeriodsEnabled}
        initialWorkspaceId={hintedWorkspace?.id ?? null}
      />
      {captureState ? <CaptureEmailRow state={captureState} /> : null}
    </>
  );
}
