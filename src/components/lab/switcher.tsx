"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { OPTIONS } from "./registry";

/**
 * Sticky lab switcher. Keys 1..N jump between options; R replays the
 * intro (router.refresh re-mounts the option so its pure-CSS intro runs
 * again). Dev-only chrome; never ships.
 */
export function Switcher({ current }: { current: string }) {
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.key.toLowerCase() === "r") {
        router.refresh();
        return;
      }
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= OPTIONS.length) {
        router.push(`/lab/${OPTIONS[n - 1].slug}`);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <div className="lab-switcher">
      <style>{CSS}</style>
      <Link href="/lab" className="lab-switcher-home">
        <span className="lab-switcher-word">lab</span>
        <span className="lab-switcher-dot" aria-hidden />
      </Link>
      <nav className="lab-switcher-nav" aria-label="Hero directions">
        {OPTIONS.map((o, i) => (
          <Link
            key={o.slug}
            href={`/lab/${o.slug}`}
            className={
              o.slug === current
                ? "lab-switcher-item is-active"
                : "lab-switcher-item"
            }
          >
            <span className="lab-switcher-key">{i + 1}</span>
            <span className="lab-switcher-name">{o.name}</span>
            {o.role === "wildcard" ? (
              <span className="lab-switcher-wild">wildcard</span>
            ) : null}
          </Link>
        ))}
      </nav>
      <span className="lab-switcher-hint" aria-hidden>
        1–{OPTIONS.length} jump · R replays
      </span>
    </div>
  );
}

const CSS = `
.lab-switcher {
  position: sticky; top: 0; z-index: 50;
  display: flex; align-items: center; gap: 20px;
  padding: 10px 20px;
  background: color-mix(in srgb, var(--paper, white) 86%, transparent);
  backdrop-filter: saturate(150%) blur(12px);
  -webkit-backdrop-filter: saturate(150%) blur(12px);
  border-bottom: 1px solid var(--hairline);
  font-family: var(--font-geist-mono), ui-monospace, monospace;
}
.lab-switcher-home {
  display: inline-flex; align-items: baseline; gap: 2px;
  text-decoration: none; color: var(--ink); font-weight: 500;
  font-family: var(--font-geist-sans), system-ui, sans-serif;
  letter-spacing: -0.03em; font-size: 15px;
}
.lab-switcher-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--accent); display: inline-block;
}
.lab-switcher-nav {
  display: flex; align-items: center; gap: 4px;
  flex-wrap: wrap; min-width: 0;
}
.lab-switcher-item {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 5px 10px; border-radius: 7px;
  text-decoration: none; color: var(--ink-faint);
  font-size: 12px; letter-spacing: 0.01em;
  transition: color 160ms var(--ease-out), background 160ms var(--ease-out);
}
.lab-switcher-item:hover { color: var(--ink); background: var(--paper-deep); }
.lab-switcher-item.is-active { color: var(--ink); background: var(--paper-deep); }
.lab-switcher-key {
  display: inline-flex; align-items: center; justify-content: center;
  width: 16px; height: 16px; border-radius: 4px;
  background: var(--paper-deep); color: var(--ink-faint);
  font-size: 10px; font-weight: 500;
}
.lab-switcher-item.is-active .lab-switcher-key {
  background: var(--accent); color: white;
}
.lab-switcher-name {
  font-family: var(--font-geist-sans), system-ui, sans-serif;
  letter-spacing: -0.01em;
}
.lab-switcher-wild {
  font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em;
  color: var(--accent);
}
.lab-switcher-hint {
  margin-left: auto; font-size: 10.5px; letter-spacing: 0.06em;
  text-transform: uppercase; color: var(--ink-faint); white-space: nowrap;
}
@media (max-width: 760px) {
  .lab-switcher { gap: 12px; padding: 9px 14px; }
  .lab-switcher-hint { display: none; }
  .lab-switcher-name { display: none; }
}
`;
