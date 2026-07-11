import "server-only";
import { createHmac, randomUUID } from "node:crypto";
import { createTasksPersonalizationAssertion } from "./cross-product-assertion";

export type TasksPersonalization = {
  headline: string;
  body: string;
  firstTaskExample: string;
  workspaceTitle: string;
  primaryUseCase: string | null;
};

export type TasksWorkspaceDestination = {
  id: string;
  name: string;
  role: "owner" | "member";
};

export async function fetchTasksWorkspaces(
  clerkId: string,
): Promise<TasksWorkspaceDestination[]> {
  const baseRaw = process.env.TASKS_API_URL ??
    (process.env.VERCEL_ENV === "production" ? "https://tasks.signalstudio.ie" : null);
  if (!baseRaw) return [];
  const base = baseRaw.replace(/\/+$/, "");
  const secret = process.env.NOTES_TO_TASKS_SECRET;
  if (!secret) return [];
  try {
    const assertion = createTasksWorkspaceAssertion(clerkId, secret);
    const res = await fetch(`${base}/api/internal/workspaces`, {
      headers: { authorization: `Bearer ${assertion}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = (await res.json()) as {
      workspaces?: Array<{ id?: unknown; name?: unknown; role?: unknown }>;
    };
    return (json.workspaces ?? []).flatMap((workspace) =>
      typeof workspace.id === "string" && typeof workspace.name === "string" &&
      (workspace.role === "owner" || workspace.role === "member")
        ? [{ id: workspace.id, name: workspace.name, role: workspace.role }]
        : [],
    );
  } catch {
    return [];
  }
}

function createTasksWorkspaceAssertion(subject: string, secret: string): string {
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    v: 1 as const,
    iss: "signal-notes" as const,
    aud: "signal-tasks.workspace-list" as const,
    sub: subject,
    iat: now,
    exp: now + 300,
    jti: randomUUID(),
    traceId: randomUUID(),
  };
  const encoded = Buffer.from(JSON.stringify(claims), "utf8").toString("base64url");
  // Server modules run in Node; use the same narrow HMAC envelope as the
  // Notes→Tasks write assertion without adding a JWT dependency.
  return `${encoded}.${createHmac("sha256", secret).update(encoded).digest("base64url")}`;
}

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
