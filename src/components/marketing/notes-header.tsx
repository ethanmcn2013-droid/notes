import Link from "next/link";
import { SuiteLauncher } from "@/components/suite-launcher";
import { SuiteHeader } from "@/components/chrome/suite-header";
import { UserButtonWithSuite } from "@/components/user-button-with-suite";

type NotesHeaderProps = {
  isSignedIn?: boolean;
  sectionLabel?: string;
  showAuth?: boolean;
};

/**
 * Notes marketing header — a thin wrapper over the shared SuiteHeader shell.
 *
 * Notes carries no marketing nav links (nav={[]}), so no mobile menu button
 * renders. Its wordmark glyph is the `notes.` mark rendered at the shared md
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
      nav={[]}
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
            <Link href="/sign-in" className="notes-signin">
              Sign in
            </Link>
          )
        ) : undefined
      }
    />
  );
}
