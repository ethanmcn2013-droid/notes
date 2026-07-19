import Link from "next/link";
import { SuiteLauncher } from "@/components/suite-launcher";
import { SuiteHeader, type SuiteNavItem } from "@/components/chrome/suite-header";
import { UserButtonWithSuite } from "@/components/user-button-with-suite";

type NotesHeaderProps = {
  isSignedIn?: boolean;
  sectionLabel?: string;
  showAuth?: boolean;
};

// One header contract (product-header-contract.md, 2026-07-06): the marketing
// header nav is exactly Pricing · Design, both umbrella links. Notes previously
// carried no nav; it now matches the other three products.
const UMBRELLA_PRICING = "https://signalstudio.ie/pricing";
const UMBRELLA_DESIGN = "https://signalstudio.ie/design";

const NAV: SuiteNavItem[] = [
  { href: UMBRELLA_PRICING, label: "Pricing", external: true },
  { href: UMBRELLA_DESIGN, label: "Design", external: true },
];

/**
 * Notes marketing header — a thin wrapper over the shared SuiteHeader shell.
 *
 * Its wordmark glyph is the `notes.` mark rendered at the shared md
 * size, matching the other products' lockup. The optional section label rides
 * the breadcrumb slot. Auth is the notes-flavoured account menu. Since the
 * 2026-07-02 green retirement, Notes shares the suite register — the warm
 * green-grey header hairline is gone; the shell is the one neutral suite rule.
 */
export function NotesHeader({
  isSignedIn = false,
  sectionLabel,
  showAuth = true,
}: NotesHeaderProps) {
  return (
    <SuiteHeader
      ariaLabel="Signal Notes notebook chrome"
      launcher={<SuiteLauncher current="notes" isAuthed={isSignedIn} />}
      wordmark={
        <Link
          href="/"
          className="notes-mark"
          aria-label="Signal Notes home"
          style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.05em" }}
        >
          <span className="word">notes</span>
          <span className="dot" aria-hidden />
        </Link>
      }
      nav={NAV}
      breadcrumb={
        sectionLabel ? (
          <span className="notes-section-breadcrumb">
            <span
              aria-hidden
              className="text-[12px]"
              style={{ color: "var(--ink-faint)" }}
            >
              /
            </span>
            <span className="text-[15px]" style={{ color: "var(--ink-soft)" }}>
              {sectionLabel}
            </span>
          </span>
        ) : undefined
      }
      account={
        showAuth ? (
          isSignedIn ? (
            <UserButtonWithSuite current="notes" />
          ) : (
            <Link
              href="/waitlist?source=header&product=notes"
              className="inline-flex min-h-8 items-center rounded-full px-3.5 text-[13px] font-medium text-white transition-transform hover:-translate-y-px"
              style={{ background: "var(--ink)" }}
            >
              Join the waitlist
            </Link>
          )
        ) : undefined
      }
    />
  );
}
