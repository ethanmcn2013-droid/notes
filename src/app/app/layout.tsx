import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <header className="suitebar" aria-label="Signal Notes notebook chrome">
        <Link href="/" className="notes-mark text-[15px]" aria-label="Signal Notes home">
          <span className="word">notes</span>
          <span className="dot" aria-hidden />
        </Link>
        <nav className="flex items-center gap-4">
          <a
            href="https://signalstudio.ie"
            className="text-[12px]"
            style={{ color: "var(--color-ink-faint)" }}
          >
            signal studio
          </a>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-7 w-7",
              },
            }}
          />
        </nav>
      </header>
      {children}
    </>
  );
}
