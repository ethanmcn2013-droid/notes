import { Suspense } from "react";
import { SuiteSwitcher } from "@/components/suite-switcher-pills";
import { UserButtonWithSuite } from "@/components/user-button-with-suite";
import { SuiteHeader } from "@/components/chrome/suite-header";
import { AppAccessGate } from "@/components/app-access-gate";
import AppLoading from "./loading";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {/* Shared SuiteHeader shell (switcher lockup, no wordmark). Notes shares
          the suite chrome since the 2026-07-02 green retirement; the warm
          .suitebar with its green-grey hairline is gone. */}
      <SuiteHeader
        ariaLabel="Signal Notes notebook chrome"
        launcher={<SuiteSwitcher current="notes" />}
        nav={[]}
        account={<UserButtonWithSuite current="notes" />}
      />
      {/* Closed-beta gate: only allowlisted accounts reach the notebook
          (production only); the wordmark loader paints during the check. */}
      <Suspense fallback={<AppLoading />}>
        <AppAccessGate>{children}</AppAccessGate>
      </Suspense>
    </>
  );
}
