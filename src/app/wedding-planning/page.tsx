import type { Metadata } from "next";
import Link from "next/link";
import { SuiteLauncher } from "@/components/suite-launcher";
import { OtherWorkedExamples } from "@/components/worked-examples";
import { SiteFooter } from "@/components/marketing/site-footer";

export const metadata: Metadata = {
  title: "Wedding planning, a venue meeting note · Signal Notes",
  description:
    "A worked example. What a single Sunday-evening note looks like after a venue meeting, plain sentences, decisions, questions, the things that need a reply by Tuesday.",
};

const NOTE = {
  capturedLabel: "Captured Sunday 7 May · 8:42pm",
  title: "Harbour House visit, second walkthrough",
  body: [
    "Sat down with Aoife & Conor after the second walkthrough at Harbour House. The room is right. The light at 5pm is right. The pricing is not yet right.",
    "",
    "What was said:",
    "• Aoife loves the long room over the marquee option. Conor is on the fence, wants the marquee for the dance.",
    "• Niamh confirmed they can hold the date until 31 May. After that it goes back on the public calendar.",
    "• Deposit is €4,200, not €3,800. The website is wrong. She asked us to flag this to whoever asks.",
    "• Couple's parents want a Friday rehearsal dinner on site. Niamh said yes in principle but the kitchen needs to be cleared by 6pm Saturday.",
    "",
    "What was decided:",
    "• We hold the date until 28 May. Two days of buffer.",
    "• Long room as the working assumption. Marquee stays on the table only if weather forecast is wrong by the week before.",
    "• I send a single follow-up email by Tuesday with the deposit number, the date hold, and the rehearsal dinner ask.",
    "",
    "What still needs an answer:",
    "• Dietary list, Niamh asked four days ago. No reply has gone back. Aoife said she'd handle it by Wednesday.",
    "• Photographer access, Harbour House restricts drone and a few of the corners. Need the list emailed across before we sign with Conleth.",
    "• Final guest count, sitting at 84 invited, 71 confirmed, 9 unanswered. Conor's brother (the +1 question) still open.",
    "",
    "Reading this back: the venue is decided in everything but the deposit. The deposit is decided in everything but the timing. The timing is decided in everything but the Friday dinner ask. Tuesday's email closes three things at once.",
  ].join("\n"),
  meta: "Captured in 11 minutes. Promoted to Tasks the next morning as three items: send the venue email, follow up on dietary list, lock photographer.",
};

const PAGE_BG = "var(--color-bg)";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 11,
        letterSpacing: "0.14em",
        fontWeight: 600,
        color: "var(--color-ink-quiet, #6f6f68)",
        fontFamily: "var(--font-mono-stack, ui-monospace, SFMono-Regular, Menlo, monospace)",
        textTransform: "uppercase",
        marginBottom: 20,
      }}
    >
      {children}
    </p>
  );
}

function TransitionalRibbon() {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "6px 12px",
        borderRadius: 999,
        background: "color-mix(in srgb, var(--accent, #4f46e5) 10%, transparent)",
        color: "var(--accent, #4f46e5)",
        fontSize: 11.5,
        fontWeight: 600,
        letterSpacing: "0.04em",
        marginBottom: 28,
      }}
    >
      <span
        aria-hidden
        style={{
          display: "inline-block",
          width: 6,
          height: 6,
          borderRadius: 999,
          background: "currentColor",
        }}
      />
      A worked example · seeded note · not your data
    </div>
  );
}

export default function WeddingPlanningNotePage() {
  return (
    <div style={{ background: PAGE_BG, minHeight: "100vh" }}>
      <header
        aria-label="Signal Notes notebook chrome"
        style={{
          maxWidth: 1040,
          margin: "0 auto",
          padding: "20px 24px",
          display: "flex",
          gap: 12,
          alignItems: "baseline",
          fontSize: 13,
          fontFamily: "var(--font-geist, ui-sans-serif)",
        }}
      >
        <SuiteLauncher current="notes" />
        <span aria-hidden style={{ color: "var(--color-ink-faint, #9b9b94)", fontSize: 12 }}>/</span>
        <Link href="/" className="notes-mark text-[15px]" aria-label="Signal Notes home">
          <span className="word">notes</span>
          <span className="dot" aria-hidden />
        </Link>
      </header>

      <main
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "72px 24px 120px",
        }}
      >
        <Eyebrow>Notes · A worked example</Eyebrow>
        <h1
          style={{
            fontSize: "clamp(2rem, 1.4rem + 2.6vw, 2.8rem)",
            fontWeight: 600,
            letterSpacing: "-0.035em",
            lineHeight: 1.05,
            color: "var(--color-ink, #14151a)",
            marginBottom: 16,
            maxWidth: "20ch",
          }}
        >
          What a venue meeting note looks like.
        </h1>
        <p
          style={{
            fontSize: 17,
            color: "var(--color-ink-soft, #4a4a44)",
            lineHeight: 1.6,
            maxWidth: 560,
            marginBottom: 40,
          }}
        >
          A planner sat through a venue walkthrough on a Sunday evening. This is the note
          she captured before she got in the car. Plain sentences. What was said, what was
          decided, what still needs an answer.
        </p>

        <TransitionalRibbon />

        <article
          aria-label="Example note"
          style={{
            background: "#fdfcf7",
            border: "1px solid var(--color-line, #e7e4d8)",
            borderRadius: 18,
            padding: "32px clamp(24px, 4vw, 44px)",
            boxShadow: "0 1px 0 rgba(0,0,0,0.02), 0 24px 48px -32px rgba(20,21,26,0.16)",
            fontFamily: "var(--font-sans, ui-sans-serif)",
          }}
        >
          <header
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 16,
              marginBottom: 24,
              paddingBottom: 18,
              borderBottom: "1px dashed var(--color-line, #e7e4d8)",
              fontSize: 12.5,
              color: "var(--color-ink-quiet, #6f6f68)",
            }}
          >
            <span>{NOTE.capturedLabel}</span>
            <span style={{ fontFamily: "var(--font-mono-stack, ui-monospace)", letterSpacing: "0.06em" }}>
              private
            </span>
          </header>

          <h2
            style={{
              fontSize: "clamp(1.4rem, 1.1rem + 1.2vw, 1.8rem)",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              color: "var(--color-ink, #14151a)",
              marginBottom: 22,
            }}
          >
            {NOTE.title}
          </h2>

          <pre
            style={{
              whiteSpace: "pre-wrap",
              fontFamily: "inherit",
              fontSize: 15,
              lineHeight: 1.72,
              color: "var(--color-ink-soft, #2f2f2a)",
              margin: 0,
              overflowWrap: "break-word",
              wordBreak: "break-word",
            }}
          >
            {NOTE.body}
          </pre>

          <footer
            style={{
              marginTop: 32,
              paddingTop: 20,
              borderTop: "1px dashed var(--color-line, #e7e4d8)",
              fontSize: 12.5,
              color: "var(--color-ink-quiet, #6f6f68)",
              lineHeight: 1.6,
            }}
          >
            {NOTE.meta}
          </footer>
        </article>

        <section
          aria-label="Cross-product"
          style={{
            marginTop: 64,
            paddingTop: 32,
            borderTop: "1px solid var(--color-line, #e7e4d8)",
          }}
        >
          <Eyebrow>Where this fits</Eyebrow>
          <p
            style={{
              fontSize: 15.5,
              lineHeight: 1.65,
              color: "var(--color-ink-soft, #4a4a44)",
              maxWidth: 560,
              marginBottom: 24,
            }}
          >
            One note becomes three items. The wedding workspace in Tasks holds the items.
            The shared timeline is what the couple sees. The morning briefing surfaces
            what still needs an answer. Four tools, one job.
          </p>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "grid",
              gap: 20,
              fontSize: 14,
            }}
          >
            <li>
              <a
                href="https://tasks.signalstudio.ie/templates/wedding-planning-workspace"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "var(--color-ink, #14151a)",
                  textDecoration: "underline",
                  textDecorationStyle: "dotted",
                  textUnderlineOffset: 4,
                }}
              >
                Signal Tasks &rarr;
              </a>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-ink-quiet, #6f6f68)", lineHeight: 1.5 }}>
                Your notes become the workspace. Three actions from this note, held in one place.
              </p>
            </li>
            <li>
              <a
                href="https://timeline.signalstudio.ie/the-wedding"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "var(--color-ink, #14151a)",
                  textDecoration: "underline",
                  textDecorationStyle: "dotted",
                  textUnderlineOffset: 4,
                }}
              >
                Signal Timeline &rarr;
              </a>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-ink-quiet, #6f6f68)", lineHeight: 1.5 }}>
                A shared view for the couple. They see progress. You keep the detail.
              </p>
            </li>
            <li>
              <a
                href="https://signal.signalstudio.ie/wedding-planning"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "var(--color-ink, #14151a)",
                  textDecoration: "underline",
                  textDecorationStyle: "dotted",
                  textUnderlineOffset: 4,
                }}
              >
                Signal &rarr;
              </a>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-ink-quiet, #6f6f68)", lineHeight: 1.5 }}>
                A morning briefing that surfaces what still needs an answer before the day starts.
              </p>
            </li>
          </ul>
          <p style={{ margin: "28px 0 0", fontSize: 13, color: "var(--color-ink-quiet, #6f6f68)", lineHeight: 1.5 }}>
            For the venue-led version of the loop, see{" "}
            <a
              href="https://signalstudio.ie/venues/demo"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "var(--color-ink, #14151a)",
                textDecoration: "underline",
                textDecorationStyle: "dotted",
                textUnderlineOffset: 4,
              }}
            >
              the Venue Edition demo &rarr;
            </a>
          </p>
        </section>

        <OtherWorkedExamples current="wedding-planning" />

        <SiteFooter />
      </main>
    </div>
  );
}
