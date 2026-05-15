import type { Metadata } from "next";
import Link from "next/link";
import { SuiteLauncher } from "@/components/suite-launcher";
import { OtherWorkedExamples } from "@/components/worked-examples";

export const metadata: Metadata = {
  title: "A freelancer's evening — a studio note — Signal Notes",
  description:
    "A worked example. What a designer carrying three jobs writes after shutting the laptop — what the client said in passing, what was decided, the invoice still not sent.",
};

const NOTE = {
  capturedLabel: "Captured Wednesday 7 May · 6:40pm",
  title: "Studio — where the three jobs actually are",
  body: [
    "Shut the laptop and opened this instead. Three live jobs, all at a different stage, and I keep carrying the status in my head. Writing it down so I stop doing it at 4am.",
    "",
    "Maeve — bakery rebrand:",
    "• She wants three homepage hero options by Friday, not one. She said it in passing on the call, not in the email. It's still the job.",
    "• Logo's signed off. Don't reopen it. If she asks for “one more tweak”, the answer is a change request, not a yes.",
    "• Print pack — the menu and the window vinyl go to the printer Monday. Miss Monday and the opening slips. That's her money, but it's my name on it.",
    "",
    "Tom — restaurant site:",
    "• Waiting on his photos for nine days. The build is done. I can't launch a food site with grey boxes. Chase once more, then park it and bill the milestone.",
    "• Deposit invoice still not paid. Eleven days. Last time it ran to thirty. Don't start the next stage until it clears.",
    "",
    "Studio, mine:",
    "• Q1 invoice still not sent. The work is done and delivered. Not sending it is just losing my own money politely. Send it tonight.",
    "• Portfolio case study for the bakery — only worth doing while it's fresh. Two hours, not a week. Block Thursday morning.",
    "",
    "Reading it back: none of these are stuck on the work. They're stuck on me — the invoice I won't send, the chase I keep softening, the change I should price instead of absorb. The three Friday things are decisions, not tasks.",
  ].join("\n"),
  meta: "Captured in 8 minutes before dinner. Three became tasks the next morning: send both invoices, the three hero options for Maeve, and the Thursday case-study block.",
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

export default function FreelanceStudioNotePage() {
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
          What a freelancer&rsquo;s note looks like.
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
          A designer carrying three jobs shut the laptop and opened this
          instead. Three clients, three stages, the status they kept holding
          in their head. What was said in passing, what they decided, and
          what is still waiting.
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
            One evening note becomes three tasks. The studio workspace in
            Tasks holds them. The shared roadmap is what each client sees
            without an email. The Monday briefing surfaces the invoice you
            keep not sending. Four layers, one job.
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
                href="https://tasks.signalstudio.ie/templates/freelance-studio-workspace"
                style={{
                  color: "var(--color-ink, #14151a)",
                  textDecoration: "underline",
                  textDecorationStyle: "dotted",
                  textUnderlineOffset: 4,
                }}
              >
                The studio workspace in Tasks &rarr;
              </Link>
            </li>
            <li>
              <Link
                href="https://roadmap.signalstudio.ie/freelance-studio/update"
                style={{
                  color: "var(--color-ink, #14151a)",
                  textDecoration: "underline",
                  textDecorationStyle: "dotted",
                  textUnderlineOffset: 4,
                }}
              >
                The roadmap each client sees &rarr;
              </Link>
            </li>
            <li>
              <Link
                href="https://analytics.signalstudio.ie/freelance-studio"
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

        <OtherWorkedExamples current="freelance-studio" />

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
