import "server-only";

/**
 * N·24 (Pattern 4), Google Calendar OAuth + read helpers.
 *
 * This module is the *only* place that talks to Google. Everything
 * else in the spawn pipeline reads a normalised CalendarEvent shape
 * (see types below) so a future Microsoft Graph adapter slots in
 * without touching the spawn or pill code.
 *
 * Why hand-rolled instead of `googleapis`: the v1 surface area we
 * need is two endpoints (OAuth token exchange + events.list). The
 * `googleapis` package is ~4MB on disk and pulls a dependency tree
 * larger than the rest of this app combined. We use Node's fetch.
 * If/when we add Drive, Gmail, etc., revisit the dep.
 *
 * Refusal anchor (PRODUCT.md §8): nothing in this file extracts
 * action items from event descriptions. The event body is not even
 * fetched into the spawn, only `summary` (title) and `attendees`
 * cross into the spawned note.
 *
 * Required env vars (operator owes these):
 *   - GOOGLE_OAUTH_CLIENT_ID
 *   - GOOGLE_OAUTH_CLIENT_SECRET
 *   - GOOGLE_OAUTH_REDIRECT_URI  (e.g. https://notes.signalstudio.ie/api/calendar/google/callback)
 */

export const GOOGLE_OAUTH_SCOPES = [
  // Read-only is sufficient: we only ever *read* events. We never
  // write back to the calendar (no "Notes added" event, no agenda
  // injection). PRODUCT.md §6 boundary stays clean.
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar.events.readonly",
] as const;

export type CalendarEvent = {
  id: string;
  title: string;
  /** Display strings only, never the raw attendee object. */
  attendees: string[];
  /** Epoch ms; the start of *this occurrence* for recurring events. */
  start: number;
  isAllDay: boolean;
  /** Has the signed-in user declined? Spawn refuses if so. */
  userDeclined: boolean;
};

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
};

function googleEnv(): {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
} {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "Google Calendar OAuth is not configured (GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET / GOOGLE_OAUTH_REDIRECT_URI missing)"
    );
  }
  return { clientId, clientSecret, redirectUri };
}

/**
 * Build the OAuth authorisation URL. The `state` param carries the
 * Clerk userId so the callback can attribute the connection to the
 * right account (the route signs/verifies it; this helper trusts
 * its caller).
 */
export function buildGoogleAuthUrl(state: string): string {
  const { clientId, redirectUri } = googleEnv();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: GOOGLE_OAUTH_SCOPES.join(" "),
    access_type: "offline", // we need a refresh token
    prompt: "consent", // ensure refresh_token comes back on re-consent
    include_granted_scopes: "true",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Exchange the auth code from the callback for tokens. Returns the
 * refresh token (long-lived; stored) and the initial access token
 * (short-lived; discarded after this call).
 */
export async function exchangeGoogleCode(code: string): Promise<{
  refreshToken: string;
  accessToken: string;
  expiresAt: number;
}> {
  const { clientId, clientSecret, redirectUri } = googleEnv();
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Google token exchange failed (${res.status})`);
  }
  const data = (await res.json()) as TokenResponse;
  if (!data.refresh_token) {
    // No refresh_token can happen if the user has previously consented
    // without prompt=consent. We forced prompt=consent in the URL, so
    // this is genuinely unexpected, surface clearly.
    throw new Error("Google did not return a refresh_token");
  }
  return {
    refreshToken: data.refresh_token,
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
}

/**
 * Mint a fresh access token from a stored refresh token. Called once
 * per poll cycle per connection.
 */
export async function refreshGoogleAccessToken(
  refreshToken: string
): Promise<string> {
  const { clientId, clientSecret } = googleEnv();
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Google token refresh failed (${res.status})`);
  }
  const data = (await res.json()) as TokenResponse;
  return data.access_token;
}

/**
 * Best-effort revoke of a stored OAuth token at Google's revocation
 * endpoint. Called during account deletion so a deleted user's
 * long-lived refresh token can no longer mint access tokens against
 * their calendar, closing the window where a DB purge removes the row
 * but the credential stays valid at Google.
 *
 * Deliberately swallows all failures: the DB row is already (or about
 * to be) gone, so a revoke failure must never block account deletion.
 * Google's endpoint needs only the token (no client secret), and 400s
 * on an already-invalid/expired token, which is a success for our
 * purposes. Returns true only when Google confirms the revocation.
 */
export async function revokeGoogleToken(token: string): Promise<boolean> {
  if (!token) return false;
  try {
    const res = await fetch("https://oauth2.googleapis.com/revoke", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token }),
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Internal Google event shape, only the fields we care about. The
 * full event object carries description, attachments, hangoutLink,
 * extendedProperties, conferenceData, etc. We intentionally do not
 * read those. PRODUCT.md §8: title + attendees, that is the entire
 * scaffold.
 */
type GoogleEvent = {
  id: string;
  status?: string;
  summary?: string;
  start?: { dateTime?: string; date?: string };
  attendees?: Array<{
    email?: string;
    displayName?: string;
    self?: boolean;
    responseStatus?: string;
  }>;
};

/**
 * Fetch upcoming events between `from` and `to` (epoch ms) for a
 * calendar. Single-instance expansion for recurring events
 * (singleEvents=true), ordered by start time. We cap at 50, five
 * minutes of meetings rarely exceeds that.
 */
export async function listGoogleEvents(
  accessToken: string,
  calendarId: string,
  fromMs: number,
  toMs: number
): Promise<CalendarEvent[]> {
  const params = new URLSearchParams({
    timeMin: new Date(fromMs).toISOString(),
    timeMax: new Date(toMs).toISOString(),
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "50",
    // Only fetch the fields we care about. Cheaper, and the body
    // (description, attachments…) literally never enters the process
    // memory. §8 refusal is implemented at the wire level.
    fields:
      "items(id,status,summary,start,attendees(email,displayName,self,responseStatus))",
  });
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
    calendarId
  )}/events?${params.toString()}`;
  const res = await fetch(url, {
    headers: { authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Google events list failed (${res.status})`);
  }
  const data = (await res.json()) as { items?: GoogleEvent[] };
  const items = data.items ?? [];

  const out: CalendarEvent[] = [];
  for (const e of items) {
    if (!e.id) continue;
    if (e.status === "cancelled") continue;

    const startIso = e.start?.dateTime ?? null;
    const allDayIso = e.start?.date ?? null;
    if (!startIso && !allDayIso) continue;

    const isAllDay = !startIso && !!allDayIso;
    const start = startIso
      ? Date.parse(startIso)
      : Date.parse(`${allDayIso}T00:00:00Z`);
    if (!Number.isFinite(start)) continue;

    const userDeclined = (e.attendees ?? []).some(
      (a) => a.self === true && a.responseStatus === "declined"
    );

    // Display strings only. We never store the raw attendee object;
    // emails round-trip through this code path but never land on
    // disk except as a line inside the note body the user owns.
    const attendees = (e.attendees ?? [])
      .filter((a) => a.self !== true) // omit the user themself
      .map((a) => (a.displayName?.trim() || a.email?.trim() || "").trim())
      .filter((s) => s.length > 0);

    out.push({
      id: e.id,
      title: (e.summary ?? "").trim() || "Untitled meeting",
      attendees,
      start,
      isAllDay,
      userDeclined,
    });
  }
  return out;
}
