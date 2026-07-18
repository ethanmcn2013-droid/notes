import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  isNotesDesignLabAvailable,
  notesDesignLabBoundary,
} from "./lab-access";

type TestEnv = {
  NODE_ENV: string | undefined;
  VERCEL_ENV: string | undefined;
  NEXT_PUBLIC_SIGNAL_DEPLOYMENT_ENV: string | undefined;
  SIGNAL_NOTES_DESIGN_LAB: string | undefined;
  SIGNAL_ACCESS_MODE: string | undefined;
  NEXT_PUBLIC_SIGNAL_ACCESS_MODE: string | undefined;
};

function env(overrides: Partial<TestEnv> = {}): TestEnv {
  return {
    NODE_ENV: undefined,
    VERCEL_ENV: undefined,
    NEXT_PUBLIC_SIGNAL_DEPLOYMENT_ENV: undefined,
    SIGNAL_NOTES_DESIGN_LAB: undefined,
    SIGNAL_ACCESS_MODE: undefined,
    NEXT_PUBLIC_SIGNAL_ACCESS_MODE: undefined,
    ...overrides,
  };
}

describe("Signal Notes design-lab access boundary", () => {
  it("denies the exact lab route before auth unless the review gate is complete", () => {
    assert.equal(
      notesDesignLabBoundary(
        "/__design-lab/notes",
        env({
          NODE_ENV: "production",
          VERCEL_ENV: "preview",
          SIGNAL_ACCESS_MODE: "review",
          NEXT_PUBLIC_SIGNAL_ACCESS_MODE: "review",
        }),
      ),
      "deny",
    );
    assert.equal(
      notesDesignLabBoundary(
        "/__design-lab/notes",
        env({
          NODE_ENV: "production",
          VERCEL_ENV: "preview",
          SIGNAL_NOTES_DESIGN_LAB: "1",
          SIGNAL_ACCESS_MODE: "review",
          NEXT_PUBLIC_SIGNAL_ACCESS_MODE: "review",
        }),
      ),
      "allow",
    );
    assert.equal(notesDesignLabBoundary("/app", env()), "not-lab");
  });

  it("hard-disables every production deployment, even with every enabling flag", () => {
    for (const productionSource of [
      { VERCEL_ENV: "production" },
      {
        VERCEL_ENV: "preview",
        NEXT_PUBLIC_SIGNAL_DEPLOYMENT_ENV: "production",
      },
    ]) {
      assert.equal(
        isNotesDesignLabAvailable(
          env({
            NODE_ENV: "development",
            SIGNAL_NOTES_DESIGN_LAB: "1",
            SIGNAL_ACCESS_MODE: "review",
            NEXT_PUBLIC_SIGNAL_ACCESS_MODE: "review",
            ...productionSource,
          }),
        ),
        false,
      );
    }
  });

  it("never lets a public preview marker override Vercel production", () => {
    assert.equal(
      isNotesDesignLabAvailable({
        NODE_ENV: "production",
        VERCEL_ENV: "production",
        NEXT_PUBLIC_SIGNAL_DEPLOYMENT_ENV: "preview",
        SIGNAL_NOTES_DESIGN_LAB: "1",
        SIGNAL_ACCESS_MODE: "review",
        NEXT_PUBLIC_SIGNAL_ACCESS_MODE: "review",
      }),
      false,
    );
  });

  it("allows frictionless local development only in a local deployment", () => {
    assert.equal(
      isNotesDesignLabAvailable(env({ NODE_ENV: "development" })),
      true,
    );
    assert.equal(
      isNotesDesignLabAvailable(
        env({ NODE_ENV: "development", VERCEL_ENV: "preview" }),
      ),
      false,
    );
    assert.equal(
      isNotesDesignLabAvailable(env({ NODE_ENV: "production" })),
      false,
    );
  });

  it("allows a hosted preview only with the exact lab flag and review posture", () => {
    const validPreview = env({
      NODE_ENV: "production",
      VERCEL_ENV: "preview",
      SIGNAL_NOTES_DESIGN_LAB: "1",
      SIGNAL_ACCESS_MODE: "review",
    });
    assert.equal(isNotesDesignLabAvailable(validPreview), true);

    for (const invalid of [
      { ...validPreview, SIGNAL_NOTES_DESIGN_LAB: undefined },
      { ...validPreview, SIGNAL_NOTES_DESIGN_LAB: "true" },
      { ...validPreview, SIGNAL_ACCESS_MODE: undefined },
      { ...validPreview, SIGNAL_ACCESS_MODE: "demo" },
      { ...validPreview, VERCEL_ENV: "development" },
      { ...validPreview, VERCEL_ENV: "staging" },
    ]) {
      assert.equal(isNotesDesignLabAvailable(invalid), false);
    }
  });

  it("accepts the explicit public review-mode marker used by the client shell", () => {
    assert.equal(
      isNotesDesignLabAvailable(
        env({
          NODE_ENV: "production",
          NEXT_PUBLIC_SIGNAL_DEPLOYMENT_ENV: "preview",
          SIGNAL_NOTES_DESIGN_LAB: "1",
          NEXT_PUBLIC_SIGNAL_ACCESS_MODE: "review",
        }),
      ),
      true,
    );
  });

  it("fails closed when a public access-mode marker contradicts the server marker", () => {
    for (const [serverMode, publicMode] of [
      ["review", "demo"],
      ["demo", "review"],
    ]) {
      assert.equal(
        isNotesDesignLabAvailable(
          env({
            NODE_ENV: "production",
            VERCEL_ENV: "preview",
            SIGNAL_NOTES_DESIGN_LAB: "1",
            SIGNAL_ACCESS_MODE: serverMode,
            NEXT_PUBLIC_SIGNAL_ACCESS_MODE: publicMode,
          }),
        ),
        false,
      );
    }
  });
});
