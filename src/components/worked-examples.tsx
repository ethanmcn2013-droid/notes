import Link from "next/link";

/**
 * Single source of truth for the worked-example pages. Each page
 * renders <OtherWorkedExamples current="..." /> so adding a new
 * example wires it into every existing page automatically — no
 * per-page reciprocal-link edits, no drift between them.
 *
 * Server component, plain anchors — crawler/no-JS safe.
 */
export const WORKED_EXAMPLES = [
  {
    slug: "wedding-planning",
    href: "/wedding-planning",
    label: "a wedding planner’s venue note",
  },
  {
    slug: "building-project",
    href: "/building-project",
    label: "a builder’s site note",
  },
  {
    slug: "teaching-week",
    href: "/teaching-week",
    label: "a teacher’s week note",
  },
  {
    slug: "freelance-studio",
    href: "/freelance-studio",
    label: "a freelancer’s evening note",
  },
] as const;

export type WorkedExampleSlug = (typeof WORKED_EXAMPLES)[number]["slug"];

/**
 * Maps a demo-audience domain (src/lib/domains.ts DomainId) to its
 * worked-example route, so the homepage hero CTA takes a visitor to
 * the example for the audience they picked in the toggle — their own
 * use case, not a default. Keep in sync with DomainId.
 */
export const WORKED_EXAMPLE_BY_DOMAIN: Record<
  "wedding" | "construction" | "teacher" | "freelance",
  { href: string; label: string }
> = {
  wedding: { href: "/wedding-planning", label: "See a wedding example" },
  construction: { href: "/building-project", label: "See a building example" },
  teacher: { href: "/teaching-week", label: "See a teaching example" },
  freelance: { href: "/freelance-studio", label: "See a freelance example" },
};

export function OtherWorkedExamples({
  current,
}: {
  current: WorkedExampleSlug;
}) {
  const others = WORKED_EXAMPLES.filter((e) => e.slug !== current);
  if (others.length === 0) return null;

  return (
    <section
      aria-label="Other worked examples"
      style={{
        marginTop: 48,
        paddingTop: 28,
        borderTop: "1px solid var(--color-line, #e7e4d8)",
      }}
    >
      <p
        style={{
          fontSize: 11,
          letterSpacing: "0.14em",
          fontWeight: 600,
          color: "var(--color-ink-quiet, #6f6f68)",
          fontFamily:
            "var(--font-mono-stack, ui-monospace, SFMono-Regular, Menlo, monospace)",
          textTransform: "uppercase",
          marginBottom: 16,
        }}
      >
        Other examples
      </p>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "grid",
          gap: 10,
          fontSize: 14,
        }}
      >
        {others.map((e) => (
          <li key={e.slug}>
            <Link
              href={e.href}
              style={{
                color: "var(--color-ink-soft, #4a4a44)",
                textDecoration: "underline",
                textDecorationStyle: "dotted",
                textUnderlineOffset: 4,
              }}
            >
              {e.label} &rarr;
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
