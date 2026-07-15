import assert from "node:assert/strict";
import test from "node:test";
import { getAccessMode } from "./access-mode";

const original = {
  node: process.env.NODE_ENV,
  vercel: process.env.VERCEL_ENV,
  publicDeployment: process.env.NEXT_PUBLIC_SIGNAL_DEPLOYMENT_ENV,
  mode: process.env.SIGNAL_ACCESS_MODE,
  publicMode: process.env.NEXT_PUBLIC_SIGNAL_ACCESS_MODE,
};

test.after(() => {
  const env = process.env as Record<string, string | undefined>;
  env.NODE_ENV = original.node;
  env.VERCEL_ENV = original.vercel;
  env.NEXT_PUBLIC_SIGNAL_DEPLOYMENT_ENV = original.publicDeployment;
  env.SIGNAL_ACCESS_MODE = original.mode;
  env.NEXT_PUBLIC_SIGNAL_ACCESS_MODE = original.publicMode;
});

test("production deployment cannot activate demo mode", () => {
  const env = process.env as Record<string, string | undefined>;
  env.NODE_ENV = "production";
  delete env.VERCEL_ENV;
  delete env.NEXT_PUBLIC_SIGNAL_DEPLOYMENT_ENV;
  delete env.NEXT_PUBLIC_SIGNAL_ACCESS_MODE;
  env.SIGNAL_ACCESS_MODE = "demo";
  assert.equal(getAccessMode(), "production");
});

test("the client-visible production stamp also rejects review mode", () => {
  const env = process.env as Record<string, string | undefined>;
  env.NODE_ENV = "production";
  delete env.VERCEL_ENV;
  env.NEXT_PUBLIC_SIGNAL_DEPLOYMENT_ENV = "production";
  env.NEXT_PUBLIC_SIGNAL_ACCESS_MODE = "review";
  delete env.SIGNAL_ACCESS_MODE;
  assert.equal(getAccessMode(), "production");
});

test("a client-visible preview stamp permits deterministic review mode", () => {
  const env = process.env as Record<string, string | undefined>;
  env.NODE_ENV = "production";
  delete env.VERCEL_ENV;
  env.NEXT_PUBLIC_SIGNAL_DEPLOYMENT_ENV = "preview";
  env.NEXT_PUBLIC_SIGNAL_ACCESS_MODE = "review";
  delete env.SIGNAL_ACCESS_MODE;
  assert.equal(getAccessMode(), "review");
});
