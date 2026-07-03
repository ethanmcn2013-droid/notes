import Link from "next/link";
import {
  IOS_APP_URL,
  SIGNAL_URL,
  NOTES_URL,
  TIMELINE_URL,
  STUDIO_URL,
  TASKS_URL,
} from "@/lib/product-urls";

type FooterLink = {
  href: string;
  label: string;
  external?: boolean;
};

const SOCIALS = [
  {
    label: "X",
    href: "https://x.com/signalstudio_ie",
    title: "Signal Notes on X",
    svg: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden>
        <path d="M18.244 2H21l-6.59 7.53L22 22h-6.828l-4.78-6.234L4.8 22H2l7.06-8.07L1.5 2h6.91l4.32 5.69L18.244 2Zm-2.39 18.4h1.594L7.21 3.512H5.5L15.853 20.4Z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@signalstudio_ie",
    title: "Signal Notes on YouTube",
    svg: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden>
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@signalstudio_ie",
    title: "Signal Notes on TikTok",
    svg: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/signal-studio-ie",
    title: "Signal Notes on LinkedIn",
    svg: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden>
        <path d="M20.452 20.452h-3.554v-5.569c0-1.328-.024-3.037-1.852-3.037-1.853 0-2.136 1.447-2.136 2.94v5.666H9.356V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.602 0 4.268 2.37 4.268 5.455v6.286ZM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124ZM7.117 20.452H3.555V9h3.562v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" />
      </svg>
    ),
  },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="reveal mt-32 border-t pb-10 pt-16"
      style={{ borderColor: "var(--color-line)" }}
    >
      <div className="grid w-full gap-10 sm:grid-cols-2 lg:grid-cols-[1.35fr_repeat(4,1fr)]">
        <div className="sm:col-span-2 lg:col-span-1">
          <span className="notes-mark" style={{ fontSize: "1.25rem" }}>
            <span className="word">notes</span>
            <span className="dot" aria-hidden />
          </span>
          <p
            className="mt-4 max-w-xs text-[13.5px] leading-relaxed"
            style={{ color: "var(--color-ink-soft)" }}
          >
            Capture clarity for the thought before it becomes work.
          </p>
          <p
            className="mt-4 text-[12px]"
            style={{ color: "var(--color-ink-faint)" }}
          >
            Made by{" "}
            <a
              href={STUDIO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-dotted underline-offset-3"
            >
              Signal Studio
            </a>
            .
          </p>
          <SocialLinks />
        </div>

        <FooterCol
          heading="Product"
          links={[
            { href: "/app", label: "Open notebook" },
            { href: "/anatomy", label: "Anatomy" },
            { href: "/wedding-planning", label: "Wedding planning" },
            { href: "/freelance-studio", label: "Freelance studio" },
          ]}
        />
        <FooterCol
          heading="Company"
          links={[
            { href: "https://signalstudio.ie/pricing", label: "Pricing", external: true },
            { href: "https://signalstudio.ie/about", label: "About Signal Studio", external: true },
            { href: "https://signalstudio.ie/dispatch", label: "Dispatch", external: true },
            { href: "https://signalstudio.ie/contact", label: "Contact", external: true },
          ]}
        />
        <FooterCol
          heading="Resources"
          links={[
            { href: IOS_APP_URL, label: "iOS app", external: true },
            { href: "/building-project", label: "Building project" },
            { href: "/teaching-week", label: "Teaching week" },
            { href: "https://signalstudio.ie/security", label: "Security", external: true },
          ]}
        />
        <FooterCol
          heading="Suite"
          links={[
            { href: STUDIO_URL, label: "Signal Studio", external: true },
            { href: NOTES_URL, label: "Notes", external: true },
            { href: TASKS_URL, label: "Tasks", external: true },
            { href: TIMELINE_URL, label: "Timeline", external: true },
            { href: SIGNAL_URL, label: "Signal", external: true },
          ]}
        />
      </div>

      <div
        className="mt-12 flex flex-col items-start justify-between gap-2 border-t pt-6 text-[12px] md:flex-row md:items-center"
        style={{
          borderColor: "var(--color-line)",
          color: "var(--color-ink-faint)",
        }}
      >
        <span>&copy; {year} Signal Notes. Made by Signal Studio.</span>
        <span>Clarity, not configuration.</span>
      </div>
      <LegalLinks />
    </footer>
  );
}

function SocialLinks() {
  return (
    <nav
      aria-label="Signal Notes on social"
      className="-ml-2 mt-3 flex items-center"
      style={{ color: "var(--color-ink-faint)" }}
    >
      {SOCIALS.map(({ label, href, title, svg }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          title={title}
          aria-label={title}
          className="inline-flex h-10 w-10 items-center justify-center transition-opacity hover:opacity-100"
          style={{ opacity: 0.72 }}
        >
          {svg}
        </a>
      ))}
    </nav>
  );
}

function FooterCol({
  heading,
  links,
}: {
  heading: string;
  links: FooterLink[];
}) {
  return (
    <nav aria-label={heading}>
      <div
        className="mb-3 font-mono text-[11px] font-semibold uppercase"
        style={{ color: "var(--color-ink-faint)", letterSpacing: "0.14em" }}
      >
        {heading}
      </div>
      <ul className="space-y-2 text-[13.5px]" style={{ color: "var(--color-ink-soft)" }}>
        {links.map((link) => (
          <li key={`${heading}-${link.href}`}>
            {link.external ? (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[32px] items-center transition-colors hover:text-ink"
              >
                {link.label}
                <span
                  aria-hidden
                  className="ml-1 text-[11px]"
                  style={{ color: "var(--color-ink-faint)" }}
                >
                  &rarr;
                </span>
              </a>
            ) : (
              <Link
                href={link.href}
                className="inline-flex min-h-[32px] items-center transition-colors hover:text-ink"
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

function LegalLinks() {
  const links = [
    { href: "https://signalstudio.ie/privacy", label: "Privacy" },
    { href: "https://signalstudio.ie/terms", label: "Terms" },
    { href: "https://signalstudio.ie/security", label: "Security" },
    { href: "https://signalstudio.ie/accessibility", label: "Accessibility" },
  ];

  return (
    <nav
      aria-label="Legal"
      className="mt-4 flex flex-wrap items-center gap-x-1 gap-y-1 font-mono text-[11px] uppercase"
      style={{
        color: "var(--color-ink-faint)",
        letterSpacing: "0.08em",
        paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
      }}
    >
      {links.map((link, index) => (
        <span key={link.href} className="inline-flex items-center">
          {index > 0 && (
            <span aria-hidden className="px-1 opacity-50">
              &middot;
            </span>
          )}
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[32px] items-center px-2 py-1 transition-opacity hover:opacity-100"
            style={{ opacity: 0.8 }}
          >
            {link.label}
          </a>
        </span>
      ))}
    </nav>
  );
}
