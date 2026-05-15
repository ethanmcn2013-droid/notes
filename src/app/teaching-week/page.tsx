import type { Metadata } from "next";
import Link from "next/link";
import { SuiteLauncher } from "@/components/suite-launcher";
import { OtherWorkedExamples } from "@/components/worked-examples";

export const metadata: Metadata = {
  title: "A teacher's week — a Friday note — Signal Notes",
  description:
    "A worked example. What a teacher writes in the empty classroom after the last bell — who needs a call, what was decided, what is still open before Monday.",
};

const NOTE = {
  capturedLabel: "Captured Friday 9 May · 4:25pm",
  title: "Year 8 — end of a long week",
  body: [
    "Sat in the empty classroom for ten minutes before I forget half of this. The week wasn't bad. It's the loose ends that lose me.",
    "",
    "Who needs a call:",
    "• Daniel's reading has gone backwards, not flat — backwards. His parents need a real conversation, not a line on a report. Ring before Tuesday.",
    "• Amara's been quiet all week and ate lunch alone twice. Probably nothing. I'd rather be wrong having checked. Quiet word with her form tutor first.",
    "• Jack's dad emailed Monday about the trip payment. Still haven't replied. That one's on me — do it tonight.",
    "",
    "What I decided:",
    "• Move Tuesday's assessment to the library. The projector in 2B is dead and IT's “the order's in” means three weeks. Don't fight it, just move it.",
    "• Swap Thursday's lesson order so the cover teacher gets the easy one. I'm out for the dentist at 2 — told the office, the plan goes on the desk, not in my head.",
    "• Reports: five a night from Monday. Twenty-eight left. Leaving them to the deadline weekend is how last term went wrong.",
    "",
    "What's still open:",
    "• Parents' evening slots — the sign-up sheet is a mess, three families double-booked. The office needs to know before it goes out Monday.",
    "• The SEN paperwork for two pupils was due last Friday. It is now this Friday. It cannot become next Friday.",
    "• Trip risk assessment — the venue still hasn't sent the form. No form, no trip. Chase Monday first thing or pull the date.",
    "",
    "Reading it back: the teaching is fine. It's the dozen small promises to other people that pile up — the calls, the forms, the office. Five reports a night, the three calls by Tuesday, and the week stops following me home.",
  ].join("\n"),
  meta: "Captured in 10 minutes after the last bell. Three became tasks over the weekend: the parent calls, the SEN paperwork deadline, and chase the trip form Monday.",
};

const PAGE_BG = "var(--bg, #fafaf7)";

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

export default function TeachingWeekNotePage() {
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
        <a
          href="/"
          style={{ color: "var(--color-ink, #14151a)", textDecoration: "none", fontWeight: 600 }}
        >
          notes<span style={{ color: "var(--accent-2, #d4a534)" }}>.</span>
        </a>
      </header>

      <main
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "72px 24px 120px",
        }}
      >
        <Eyebrow>Signal Notes · A worked example</Eyebrow>
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
          What a teacher&rsquo;s week note looks like.
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
          A teacher sat in the empty classroom after the last bell on Friday.
          This is what she wrote before the week followed her home. Who needs
          a call, what she decided, and what is still open before Monday.
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
            fontFamily: "var(--font-notes, Inter, ui-sans-serif)",
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
            One Friday note becomes three tasks. The term&rsquo;s workspace in
            Tasks holds them. The shared roadmap is what the year team sees.
            The Monday briefing surfaces what is still open before the week
            starts. Four layers, one job.
          </p>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "grid",
              gap: 12,
              fontSize: 14,
            }}
          >
            <li>
              <Link
                href="https://tasks.signalstudio.ie/templates/teaching-term-workspace"
                style={{
                  color: "var(--color-ink, #14151a)",
                  textDecoration: "underline",
                  textDecorationStyle: "dotted",
                  textUnderlineOffset: 4,
                }}
              >
                The term workspace in Tasks &rarr;
              </Link>
            </li>
            <li>
              <Link
                href="https://roadmap.signalstudio.ie/teaching-term/update"
                style={{
                  color: "var(--color-ink, #14151a)",
                  textDecoration: "underline",
                  textDecorationStyle: "dotted",
                  textUnderlineOffset: 4,
                }}
              >
                The roadmap the year team sees &rarr;
              </Link>
            </li>
            <li>
              <Link
                href="https://analytics.signalstudio.ie/teaching-term"
                style={{
                  color: "var(--color-ink, #14151a)",
                  textDecoration: "underline",
                  textDecorationStyle: "dotted",
                  textUnderlineOffset: 4,
                }}
              >
                Monday morning briefing &rarr;
              </Link>
            </li>
          </ul>
        </section>

        <OtherWorkedExamples current="teaching-week" />

        <footer
          style={{
            marginTop: 56,
            paddingTop: 28,
            borderTop: "1px solid var(--color-line, #e7e4d8)",
            fontSize: 12,
            fontFamily: "var(--font-mono-stack, ui-monospace)",
            letterSpacing: "0.04em",
            color: "var(--color-ink-faint, #9b9b94)",
          }}
        >
          Signal Notes · part of{" "}
          <a
            href="https://signalstudio.ie"
            style={{ color: "var(--color-ink-soft, #4a4a44)", textDecoration: "underline", textDecorationStyle: "dotted" }}
          >
            Signal Studio
          </a>
          . Contact{" "}
          <a
            href="mailto:hello@signalstudio.ie"
            style={{ color: "var(--color-ink-soft, #4a4a44)", textDecoration: "underline", textDecorationStyle: "dotted" }}
          >
            hello@signalstudio.ie
          </a>
          .
        </footer>
      </main>
    </div>
  );
}
