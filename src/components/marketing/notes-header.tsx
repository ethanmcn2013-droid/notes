import Link from "next/link";
import { SuiteLauncher } from "@/components/suite-launcher";
import { UserButtonWithSuite } from "@/components/user-button-with-suite";

type NotesHeaderProps = {
  isSignedIn?: boolean;
  sectionLabel?: string;
  showAuth?: boolean;
};

export function NotesHeader({
  isSignedIn = false,
  sectionLabel,
  showAuth = true,
}: NotesHeaderProps) {
  return (
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
          <SuiteLauncher current="notes" isAuthed={isSignedIn} />
          <span
            aria-hidden
            className="text-[12px]"
            style={{ color: "var(--color-ink-faint)" }}
          >
            /
          </span>
          <Link href="/" className="notes-mark text-[15px]" aria-label="Signal Notes home">
            <span className="word">notes</span>
            <span className="dot" aria-hidden />
          </Link>
          {sectionLabel ? (
            <span className="notes-section-breadcrumb">
              <span
                aria-hidden
                className="text-[12px]"
                style={{ color: "var(--color-ink-faint)" }}
              >
                /
              </span>
              <span
                className="text-[15px]"
                style={{ color: "var(--color-ink-soft)" }}
              >
                {sectionLabel}
              </span>
            </span>
          ) : null}
        </div>
        {showAuth ? (
          isSignedIn ? (
            <div style={{ display: "flex", alignItems: "center" }}>
              <UserButtonWithSuite current="notes" />
            </div>
          ) : (
            <Link href="/sign-in" className="notes-signin">
              Sign in
            </Link>
          )
        ) : null}
      </div>
    </header>
  );
}
