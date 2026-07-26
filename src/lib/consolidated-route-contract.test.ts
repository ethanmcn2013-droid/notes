import assert from "node:assert/strict";
import test from "node:test";

import nextConfig from "../../next.config";

test("retired Notes surfaces converge on the consolidated app and marketing origin", async () => {
  assert.ok(nextConfig.redirects);
  const redirects = await nextConfig.redirects();
  const bySource = new Map(redirects.map((redirect) => [redirect.source, redirect]));

  assert.deepEqual(bySource.get("/app"), {
    source: "/app",
    destination: "https://app.signalstudio.ie/app/notes",
    permanent: true,
  });
  assert.deepEqual(bySource.get("/"), {
    source: "/",
    destination: "https://signalstudio.ie/",
    permanent: true,
  });
  assert.equal(bySource.has("/app/account"), false);
  assert.equal(bySource.has("/api/:path*"), false);
});
