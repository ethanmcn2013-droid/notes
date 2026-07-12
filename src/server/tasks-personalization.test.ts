import assert from "node:assert/strict";
import test from "node:test";
import {
  parseTasksWorkspaceCatalog,
  selectAuthorizedWorkspaceHint,
} from "./tasks-personalization";

test("catalog parser keeps only least-privilege Planning Period DTO fields", () => {
  const catalog = parseTasksWorkspaceCatalog({
    periods: [
      {
        period: {
          id: "period_1",
          name: "Wedding 2027",
          contextType: "wedding",
          startDate: null,
          endDate: "2027-08-14",
          timezone: "Europe/Dublin",
          sponsorSecret: "must-drop",
        },
        workspaces: [
          {
            id: "ws_1",
            name: "Maeve and Dara",
            role: "member",
            contextType: "wedding",
            primaryDate: "2027-08-14",
            primaryDateLabel: "Wedding day",
            rawNoteBody: "must-drop",
          },
        ],
      },
    ],
  });
  assert.equal(catalog.status, "ready");
  assert.equal(catalog.workspaces.length, 1);
  assert.equal(JSON.stringify(catalog).includes("must-drop"), false);
  assert.equal(catalog.workspaces[0]?.planningPeriodId, "period_1");
});

test("incoming context selects only ids present in the current membership catalog", () => {
  const catalog = parseTasksWorkspaceCatalog({
    workspaces: [{ id: "ws_allowed", name: "Allowed", role: "member" }],
  });
  assert.equal(
    selectAuthorizedWorkspaceHint(catalog, "ws_attacker", null),
    null,
  );
  assert.equal(
    selectAuthorizedWorkspaceHint(catalog, "ws_allowed", null)?.id,
    "ws_allowed",
  );
});
