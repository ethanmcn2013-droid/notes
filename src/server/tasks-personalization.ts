import "server-only";
import { createTasksPersonalizationAssertion } from "./cross-product-assertion";

export type TasksPersonalization = {
  headline: string;
  body: string;
  firstTaskExample: string;
  workspaceTitle: string;
  primaryUseCase: string | null;
};

/**
 * Read segment empty-state copy from Tasks for the signed-in user's email.
 * Uses the same bearer secret as notes-extract cross-repo calls.
 */
export async function fetchTasksPersonalization(
  clerkId: string,
): Promise<TasksPersonalization | null> {
  const base =
    process.env.TASKS_API_URL?.replace(/\/+$/, "") ??
    "https://tasks.signalstudio.ie";
  const secret = process.env.NOTES_TO_TASKS_SECRET;
  if (!secret) return null;

  try {
    const assertion = createTasksPersonalizationAssertion(clerkId, secret);
    const res = await fetch(
      `${base}/api/internal/workspace-personalization`,
      {
        headers: { authorization: `Bearer ${assertion}` },
        next: { revalidate: 300 },
      },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as {
      ok?: boolean;
      personalization?: TasksPersonalization | null;
    };
    return json.personalization ?? null;
  } catch {
    return null;
  }
}
