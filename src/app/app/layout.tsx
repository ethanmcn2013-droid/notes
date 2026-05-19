import { SuiteSwitcher } from "@/components/suite-switcher-pills";
import { UserButtonWithSuite } from "@/components/user-button-with-suite";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <header className="suitebar" aria-label="Signal Notes notebook chrome">
        {/* §14 (amended 2026-05-19): umbrella anchor (once) + always-visible
            4-product pill switcher. The active pill is the
            product-you-are-in indicator (no separate breadcrumb). */}
        <div className="suite-breadcrumb">
          <SuiteSwitcher current="notes" />
        </div>
        <UserButtonWithSuite current="notes" />
      </header>
      {children}
    </>
  );
}
