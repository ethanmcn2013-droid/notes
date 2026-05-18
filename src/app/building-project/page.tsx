import type { Metadata } from "next";
import Link from "next/link";
import { SuiteLauncher } from "@/components/suite-launcher";
import { OtherWorkedExamples } from "@/components/worked-examples";
import { SiteFooter } from "@/components/marketing/site-footer";

export const metadata: Metadata = {
  title: "A building job — a site note — Signal Notes",
  description:
    "A worked example. What a contractor writes on the tailgate before the crew leaves — what was found, what was decided, what is still waiting on someone else.",
};

const NOTE = {
  capturedLabel: "Captured Thursday 8 May · 5:10pm",
  title: "Site walk — Maple Road extension, week 6",
  body: [
    "Walked the Maple Road job with Tom before the crew left. Roof's on, first fix nearly done. We're two days behind, not a week — recoverable if the windows land Tuesday.",
    "",
    "What I found:",
    "• Steel's in clean. Building control signed off the beam this morning — keep the cert with the file, the bank will ask for it.",
    "• Kitchen floor level is out 18mm front to back. The left bay needs a re-pour. Half a day, not a disaster, but it pushes the tiling.",
    "• Client asked again about moving the side door 300mm. Third time. That changes the lintel and the drainage run. Not a free change.",
    "• Skip is full. Booked the swap for Monday 7am — yard closes early for the bank holiday.",
    "",
    "What I decided:",
    "• Windows chased. Supplier confirmed Tuesday morning delivery. If they slip again we lose the dry-in before Thursday's rain. I want that in writing.",
    "• Re-pour the left bay Friday so it cures over the weekend. Tiler still starts Wednesday.",
    "• The side-door change goes in writing with a price before anyone lifts a tool. No verbal yeses on this one.",
    "",
    "What still needs an answer:",
    "• Electrician's first-fix date. He said “next week” — I need a day. Can't close the walls without it.",
    "• Client's tile choice. Showroom visit was a fortnight ago and still nothing. Wednesday's tiling won't wait.",
    "• Final payment stage. We hit the agreed point at dry-in. The invoice goes the day the windows are in, not a week after like the last job.",
    "",
    "Reading it back: the build is fine. The risks aren't the build — they're the three things waiting on other people. The windows, the sparks, the tile choice. Tuesday tells me whether Thursday holds.",
  ].join("\n"),
  meta: "Captured in 9 minutes on the tailgate. Three of these became tasks the next morning: chase the window delivery in writing, price the side-door change, invoice at dry-in.",
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

export default function BuildingProjectNotePage() {
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
          What a site note looks like.
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
          A contractor walked the job at the end of the day. This is what he
          wrote on the tailgate before the crew left. What he found, what he
          decided, and the three things still waiting on someone else.
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
            One site note becomes three tasks. The job&rsquo;s workspace in
            Tasks holds them. The shared roadmap is what the client sees
            without ringing you. The morning briefing surfaces what is still
            waiting on someone else. Four layers, one job.
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
                href="https://tasks.signalstudio.ie"
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
                Your notes become the workspace. The window chase, the side-door price, the invoice — held in one place.
              </p>
            </li>
            <li>
              <a
                href="https://roadmap.signalstudio.ie"
                style={{
                  color: "var(--color-ink, #14151a)",
                  textDecoration: "underline",
                  textDecorationStyle: "dotted",
                  textUnderlineOffset: 4,
                }}
              >
                Signal Roadmap &rarr;
              </a>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-ink-quiet, #6f6f68)", lineHeight: 1.5 }}>
                A shared view for the client. They see where the job stands without ringing you.
              </p>
            </li>
            <li>
              <a
                href="https://analytics.signalstudio.ie"
                style={{
                  color: "var(--color-ink, #14151a)",
                  textDecoration: "underline",
                  textDecorationStyle: "dotted",
                  textUnderlineOffset: 4,
                }}
              >
                Signal Analytics &rarr;
              </a>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-ink-quiet, #6f6f68)", lineHeight: 1.5 }}>
                A morning briefing that surfaces what is still waiting on someone else before the day starts.
              </p>
            </li>
          </ul>
        </section>

        <OtherWorkedExamples current="building-project" />

        <SiteFooter />
      </main>
    </div>
  );
}
