"use client";

type Props = {
  stamp: string;
};

/**
 * The mono timestamp pip — the "captured" confirmation. Appears the
 * instant a note commits, in mustard, with letter-spacing to feel discrete.
 */
export function NotePip({ stamp }: Props) {
  return (
    <span
      className="font-mono"
      style={{
        fontSize: 10.5,
        color: "var(--color-accent-2)",
        letterSpacing: "0.04em",
        textTransform: "lowercase",
        fontWeight: 500,
        flexShrink: 0,
      }}
    >
      {stamp}
    </span>
  );
}
