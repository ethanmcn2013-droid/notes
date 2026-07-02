import { SuiteSwitcher } from "@/components/suite-switcher-pills";
import { UserButtonWithSuite } from "@/components/user-button-with-suite";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <header
        className="suitebar"
        aria-label="Signal Notes notebook chrome"
        style={{
          background: "color-mix(in srgb, var(--color-bg) 88%, transparent)",
          backdropFilter: "saturate(150%) blur(12px)",
          WebkitBackdropFilter: "saturate(150%) blur(12px)",
        }}
      >
        <div className="suitebar-inner">
          <div className="suite-breadcrumb">
            <SuiteSwitcher current="notes" />
          </div>
          <UserButtonWithSuite current="notes" />
        </div>
      </header>
      {children}
    </>
  );
}
