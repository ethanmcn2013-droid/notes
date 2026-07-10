import type { ComponentType } from "react";
import { OptionTheNotebook } from "./option-the-notebook";
import { OptionNotebookFirst } from "./option-notebook-first";
import { OptionBeforeItFades } from "./option-before-it-fades";
import { OptionThreeSeconds } from "./option-three-seconds";
import { OptionTheCrossing } from "./option-the-crossing";
import { OptionBeforeItLeaves } from "./option-before-it-leaves";
import { OptionTheBlankLine } from "./option-the-blank-line";

/**
 * Notes hero showroom — registry.
 *
 * Review-only and never linked from the public marketing surface. The current
 * feature-branch homepage hero remains independent from work in this room.
 * Each option is a fully scoped hero: its rest state is the settled
 * composition, the intro plays once on mount inside
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
    slug: "before-it-leaves",
    name: "Before It Leaves",
    role: "polished",
    lens: "Operator pick · loss reversed by capture",
    headline: "Catch it before it leaves.",
    blurb:
      "The notebook is fixed from frame one. A thought moves toward the live indigo caret, is caught, and joins the private stream in under a second. Only after a visible approval does its action cross one way into Signal Tasks. One capture-native transformation, settled in just over three seconds.",
    Component: OptionBeforeItLeaves,
  },
  {
    slug: "three-seconds",
    name: "Three Seconds",
    role: "polished",
    lens: "Operator pick · the promise made literal",
    headline: "Written before the third second.",
    blurb:
      "A real notebook and a literal three-second rail. One thought types, logs at 1.8 seconds, and becomes findable before the budget closes. A separate approval then sends only its action to Signal Tasks. The timing is the proof, with rest just under four seconds.",
    Component: OptionThreeSeconds,
  },
  {
    slug: "the-blank-line",
    name: "The Blank Line",
    role: "polished",
    lens: "Playbook · the caret is the product",
    headline: "The blank line is ready.",
    blurb:
      "The blank page is not empty, it is ready. The whole hero is one indigo caret. Three lines type themselves out of it, the caret drops on the word write, and a capture field materialises around it. The blank line becomes the notebook. Swiss, minimal, more air than the flagship.",
    Component: OptionTheBlankLine,
  },
  {
    slug: "the-notebook",
    name: "The Notebook",
    role: "polished",
    lens: "Hybrid · capture to commit",
    headline: "Write it down before it becomes work.",
    blurb:
      "The whole Signal Notes story in one surface, fusing Notebook First and The Crossing. The live notebook is the hero: a caret writes, the stream fills, and one note's approved line crosses one way into Signal Tasks and commits as a task. The surface leads; the differentiator is a moment, not a static dot; the note stays private.",
    Component: OptionTheNotebook,
  },
  {
    slug: "notebook-first",
    name: "Notebook First",
    role: "polished",
    lens: "Product truth · the surface",
    headline: "The hero is the notebook.",
    blurb:
      "The marketing surface is the product surface. A focused capture field, the private empty line, and a stream that fills newest-first. One thought crosses into Tasks and earns the indigo dot. The Notebook First contract, made literal.",
    Component: OptionNotebookFirst,
  },
  {
    slug: "before-it-fades",
    name: "Before It Fades",
    role: "polished",
    lens: "Editorial · the feeling",
    headline: "Catch it before it’s gone.",
    blurb:
      "The emotional truth of capture: the difference between remembered and lost. A held indigo caret sits where you write it down, while the thoughts you didn’t catch fade at the margin. Swiss, quiet, typographic.",
    Component: OptionBeforeItFades,
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
