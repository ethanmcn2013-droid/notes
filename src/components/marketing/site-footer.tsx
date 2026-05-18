import Link from "next/link";
import {
  ANALYTICS_URL,
  NOTES_URL,
  ROADMAP_URL,
  STUDIO_URL,
  TASKS_URL,
} from "@/lib/product-urls";

/* ── Social destinations (order locked: X → YouTube → TikTok → LinkedIn) ── */
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

/* ── Suite cross-links ── */
const SUITE = [
  { name: "Signal Notes", url: NOTES_URL },
  { name: "Signal Tasks", url: TASKS_URL },
  { name: "Signal Roadmap", url: ROADMAP_URL },
  { name: "Signal Analytics", url: ANALYTICS_URL },
] as const;

/* ── Component ── */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="reveal mt-20 border-t pt-10"
      style={{ borderColor: "var(--color-line)" }}
    >
      {/* Brand line */}
      <p
        className="text-[13px]"
        style={{ color: "var(--color-ink-soft)" }}
      >
        A{" "}
        <a
          href={STUDIO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-dotted underline-offset-3"
          style={{ color: "var(--color-ink-soft)" }}
        >
          Signal Studio
        </a>{" "}
        product.
      </p>

      {/* Suite cross-links */}
      <nav
        aria-label="Signal Studio suite"
        className="mt-6 flex flex-wrap gap-x-6 gap-y-2"
      >
        {SUITE.map((product) => (
          <a
            key={product.name}
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12.5px] underline decoration-dotted underline-offset-3 transition-colors"
            style={{ color: "var(--color-ink-faint)" }}
          >
            {product.name}
          </a>
        ))}
      </nav>

      {/* Social row */}
      <nav
        aria-label="Signal Notes on social"
        className="mt-6 flex items-center gap-4"
      >
        {SOCIALS.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            title={s.title}
            aria-label={s.title}
            className="transition-opacity"
            style={{ color: "var(--color-ink-faint)", opacity: 0.7 }}
          >
            {s.svg}
          </a>
        ))}
      </nav>

      {/* Legal + copyright */}
      <div
        className="mt-8 border-t pt-6 font-mono text-[11px] tracking-wide"
        style={{
          borderColor: "var(--color-line)",
          color: "var(--color-ink-faint)",
        }}
      >
        <p>
          &copy; {year} Signal Notes.{" "}
          <a
            href={STUDIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-dotted underline-offset-2"
            style={{ color: "var(--color-ink-faint)" }}
          >
            A Signal Studio product.
          </a>
        </p>
      </div>
    </footer>
  );
}
