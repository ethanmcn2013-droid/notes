import { SuiteSwitcher } from "@/components/suite-switcher-pills";
import { UserButtonWithSuite } from "@/components/user-button-with-suite";
import { SuiteHeader } from "@/components/chrome/suite-header";

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
      {children}
    </>
  );
}
