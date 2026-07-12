import assert from "node:assert/strict";
import test from "node:test";
import { scrubEvent } from "./sentry-scrub";

test("Sentry removes URL credentials, secret fields, and sensitive breadcrumbs", () => {
  const event = scrubEvent({
    request: { url: "https://notes.signalstudio.ie/app?code=private&safe=1" },
    tags: { workspaceCount: "2", accessToken: "private" },
    extra: { nested: { authorization: "Bearer private", count: 2 } },
    breadcrumbs: [
      { data: { url: "https://notes.signalstudio.ie/api/calendar/google/callback?code=private" } },
      { data: { url: "https://notes.signalstudio.ie/app?safe=1&token=private" } },
    ],
  } as never)!;
  const serialized = JSON.stringify(event);
  assert.equal(serialized.includes("private"), false);
  assert.equal(event.breadcrumbs?.length, 1);
  assert.equal(event.extra?.nested && typeof event.extra.nested, "object");
});
