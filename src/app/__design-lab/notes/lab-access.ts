type LabAccessEnv = Partial<Record<
  | "NODE_ENV"
  | "VERCEL_ENV"
  | "NEXT_PUBLIC_SIGNAL_DEPLOYMENT_ENV"
  | "SIGNAL_NOTES_DESIGN_LAB"
  | "SIGNAL_ACCESS_MODE"
  | "NEXT_PUBLIC_SIGNAL_ACCESS_MODE",
  string
>>;

/**
 * The lab is intentionally impossible to expose from a production deployment.
 * Local development is frictionless; hosted access requires an explicitly
 * flagged Vercel preview running in the repo's keyless review posture.
 */
export function isNotesDesignLabAvailable(
  env: LabAccessEnv = process.env,
): boolean {
  const serverDeployment = env.VERCEL_ENV;
  const publicDeployment = env.NEXT_PUBLIC_SIGNAL_DEPLOYMENT_ENV;

  // Either production marker is sufficient to close the route. A public
  // preview marker can never override Vercel's authoritative server marker.
  if (serverDeployment === "production" || publicDeployment === "production") {
    return false;
  }
  if (
    serverDeployment &&
    publicDeployment &&
    serverDeployment !== publicDeployment
  ) {
    return false;
  }

  const deployment = serverDeployment ?? publicDeployment ?? "local";

  if (env.NODE_ENV === "development" && deployment === "local") return true;

  const serverAccessMode = env.SIGNAL_ACCESS_MODE;
  const publicAccessMode = env.NEXT_PUBLIC_SIGNAL_ACCESS_MODE;
  if (
    serverAccessMode &&
    publicAccessMode &&
    serverAccessMode !== publicAccessMode
  ) {
    return false;
  }
  const accessMode = publicAccessMode ?? serverAccessMode;
  return (
    deployment === "preview" &&
    env.SIGNAL_NOTES_DESIGN_LAB === "1" &&
    accessMode === "review"
  );
}
