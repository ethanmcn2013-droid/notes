import type { ComponentType } from "react";
import { OptionNotebookFirst } from "./option-notebook-first";
import { OptionBeforeItFades } from "./option-before-it-fades";
import { OptionThreeSeconds } from "./option-three-seconds";
import { OptionTheCrossing } from "./option-the-crossing";

/**
 * Notes hero showroom — registry.
 *
 * Review-only. Dev route (`/lab`). Never linked from shipped surfaces,
 * never promoted to `/`. Each option is a fully scoped hero: its rest
 * state is the settled composition, the intro plays once on mount inside
 * `@media (prefers-reduced-motion: no-preference)` only, so SSR, no-JS,
 * and reduced-motion all render the finished frame.
 *
 * Grounding: every direction is anchored in docs/PRODUCT.md. Notebook
 * First is the §9 marketing contract made literal; Before It Fades is the
 * §3 promise ("before it is work"); Three Seconds is the §3 design budget;
 * The Crossing is the §6 one-way extraction edge into Signal Tasks.
 */
export type OptionRole = "polished" | "wildcard";

export type LabOption = {
  slug: string;
  name: string;
  role: OptionRole;
  lens: string;
  headline: string;
  blurb: string;
  Component: ComponentType;
};

export const OPTIONS: LabOption[] = [
  {
    slug: "notebook-first",
    name: "Notebook First",
    role: "polished",
    lens: "Product truth · the surface",
    headline: "The hero is the notebook.",
    blurb:
      "The marketing surface is the product surface. A focused capture field, the private empty line, and a stream that fills newest-first. One thought crosses into Tasks and earns the indigo dot. This is the PRODUCT.md §9 Notebook First contract made literal.",
    Component: OptionNotebookFirst,
  },
  {
    slug: "before-it-fades",
    name: "Before It Fades",
    role: "polished",
    lens: "Editorial · the feeling",
    headline: "Catch it before it's gone.",
    blurb:
      "The emotional truth of capture: the difference between remembered and lost. A held indigo caret sits where you write it down, while the thoughts you didn't catch fade at the margin. Swiss, quiet, typographic.",
    Component: OptionBeforeItFades,
  },
  {
    slug: "three-seconds",
    name: "Three Seconds",
    role: "polished",
    lens: "The promise · the budget",
    headline: "Three seconds from thought to written.",
    blurb:
      "The locked design budget as the whole story. A calm editorial headline, the notes. wordmark, and a monospace proof line that settles the capture time. No spectacle. The claim is the restraint.",
    Component: OptionThreeSeconds,
  },
  {
    slug: "the-crossing",
    name: "The Crossing",
    role: "wildcard",
    lens: "The mechanism · the one-way edge",
    headline: "Decide what becomes work.",
    blurb:
      "The one distinctive move no capture tool has: a private note, approved by you, crossing one way into Signal Tasks. The raw note stays; only the extract travels; the indigo dot is left behind. Bold, but dead on-truth.",
    Component: OptionTheCrossing,
  },
];

export function getOption(slug: string): LabOption | undefined {
  return OPTIONS.find((o) => o.slug === slug);
}
