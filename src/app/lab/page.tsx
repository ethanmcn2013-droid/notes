import Link from "next/link";
import { OPTIONS } from "@/components/lab/registry";

/**
 * Lab index — the showroom door. Review-only. Lists every hero direction
 * as a card. Not linked from any shipped surface.
 */
export const metadata = {
  title: "Notes hero lab",
  robots: { index: false, follow: false },
};

export default function LabIndexPage() {
  return (
    <main className="lab-index">
      <style>{CSS}</style>
      <header className="lab-index-head">
        <p className="lab-index-kicker">Signal Notes · hero showroom</p>
        <h1 className="lab-index-title">
          Ways into the notebook<span className="lab-index-dot" aria-hidden />
        </h1>
        <p className="lab-index-lede">
          A review-only lab of hero directions for the Signal Notes homepage,
          each grounded in what Notes really is: capture before it becomes work,
          findable not organised, one-way into Tasks. Lab changes do not replace
          the current homepage hero. Open one, then press 1–{OPTIONS.length} to
          jump or use Replay.
        </p>
      </header>

      <ul className="lab-index-grid">
        {OPTIONS.map((o, i) => (
          <li key={o.slug}>
            <Link href={`/lab/${o.slug}`} className="lab-card">
              <div className="lab-card-top">
                <span className="lab-card-num">{String(i + 1).padStart(2, "0")}</span>
                <span
                  className={
                    o.role === "wildcard"
                      ? "lab-card-badge is-wild"
                      : "lab-card-badge"
                  }
                >
                  {o.role}
                </span>
              </div>
              <p className="lab-card-lens">{o.lens}</p>
              <h2 className="lab-card-headline">{o.name}</h2>
              <p className="lab-card-say">{o.headline}</p>
              <p className="lab-card-blurb">{o.blurb}</p>
              <span className="lab-card-open">
                Open <span aria-hidden>&rarr;</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

const CSS = `
.lab-index {
  max-width: 1080px; margin: 0 auto;
  padding: clamp(56px, 10vh, 104px) 24px 96px;
  background: var(--paper, white);
  font-family: var(--font-geist-sans), system-ui, sans-serif;
  color: var(--ink);
}
.lab-index-head { max-width: 720px; }
.lab-index-kicker {
  margin: 0 0 20px; font-family: var(--font-geist-mono), ui-monospace, monospace;
  font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--ink-faint);
}
.lab-index-title {
  margin: 0; font-size: clamp(2.2rem, 1.6rem + 2.6vw, 3.6rem);
  font-weight: 600; letter-spacing: -0.04em; line-height: 1.02;
}
.lab-index-dot {
  display: inline-block; width: 0.14em; height: 0.14em; min-width: 8px; min-height: 8px;
  max-width: 12px; max-height: 12px; margin-left: 0.06em;
  border-radius: 50%; background: var(--accent); vertical-align: baseline;
}
.lab-index-lede {
  margin: 24px 0 0; max-width: 60ch;
  font-size: 17px; line-height: 1.6; color: var(--ink-soft);
}
.lab-index-grid {
  list-style: none; margin: 56px 0 0; padding: 0;
  display: grid; gap: 1px; background: var(--hairline);
  border: 1px solid var(--hairline);
  grid-template-columns: repeat(2, 1fr);
}
@media (max-width: 720px) { .lab-index-grid { grid-template-columns: 1fr; } }
.lab-card {
  display: flex; flex-direction: column; height: 100%;
  padding: 28px; background: var(--paper, white);
  text-decoration: none; color: inherit;
  transition: background 160ms var(--ease-out);
}
.lab-card:hover { background: var(--paper-soft); }
.lab-card:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}
.lab-card-top {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 22px;
}
.lab-card-num {
  font-family: var(--font-geist-mono), ui-monospace, monospace;
  font-size: 12px; color: var(--ink-faint); letter-spacing: 0.04em;
}
.lab-card-badge {
  font-family: var(--font-geist-mono), ui-monospace, monospace;
  font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em;
  color: var(--ink-faint); padding: 3px 8px; border-radius: 999px;
  border: 1px solid var(--hairline);
}
.lab-card-badge.is-wild { color: var(--accent); border-color: var(--accent-soft); }
.lab-card-lens {
  margin: 0 0 8px; font-size: 12px; letter-spacing: 0.02em;
  color: var(--ink-faint);
}
.lab-card-headline {
  margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.02em;
}
.lab-card-say {
  margin: 10px 0 0; font-size: 16px; color: var(--ink-soft);
  letter-spacing: -0.01em;
}
.lab-card-blurb {
  margin: 14px 0 0; font-size: 13.5px; line-height: 1.55; color: var(--ink-faint);
}
.lab-card-open {
  margin-top: 22px; font-size: 13px; font-weight: 500; color: var(--accent);
  display: inline-flex; gap: 6px; align-items: center;
}
`;
