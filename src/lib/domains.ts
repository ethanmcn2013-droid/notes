/**
 * Notes audience packs — same axis as Roadmap and Analytics.
 * Drives the AudienceToggle and reseeds the cinematic capture demo.
 *
 * PRODUCT.md §2.1 archetypes: planner, contractor, teacher, small-biz
 * owner, freelance designer. The "startup" pack was retired 2026-05-13
 * (tech-bro register — investor moat, SOC 2 auditor, fintech founder Y
 * — was the exact voice PRODUCT.md §2 says Notes is not for). Replaced
 * with "freelance" for a freelance designer's day-to-day capture.
 *
 * Tags removed from the type 2026-05-13 — Notes has no taxonomy per
 * §7. The previous version rendered #tag chips in the demo stream and
 * a Tags view that contradicted the lock.
 */

export type DomainId = "wedding" | "construction" | "launch" | "freelance";

export type CaptureEntry = {
  /** The note body the user types. */
  text: string;
  /** Timestamp pip shown next to the note in the stream. */
  stamp: string;
  /** Placeholder shown before this capture begins. */
  placeholder: string;
};

export type DomainPack = {
  id: DomainId;
  label: string;
  description: string;
  /** Eyebrow shown above the notebook title in the demo. */
  notebookEyebrow: string;
  /** Captures in order — the demo types these one by one. */
  captures: CaptureEntry[];
  /** Search query the demo types after the captures. */
  searchQuery: string;
  /** Index into captures[] that the search query should highlight. */
  searchHitIndex: number;
};

export const DOMAIN_ORDER: DomainId[] = [
  "wedding",
  "construction",
  "launch",
  "freelance",
];

export const DOMAINS: Record<DomainId, DomainPack> = {
  wedding: {
    id: "wedding",
    label: "Wedding plan",
    description:
      "a planner keeping the half-formed thought before it becomes a task",
    notebookEyebrow: "Notebook · today",
    captures: [
      {
        text: "Lamb's Hill viewing — bring contract Friday.",
        stamp: "2:14pm",
        placeholder: "What just came up?",
      },
      {
        text: "Florist callback — ask about peonies for the centrepieces.",
        stamp: "2:18pm",
        placeholder: "What's worth remembering?",
      },
      {
        text: "Mum's birthday vase — get from charity shop before Saturday.",
        stamp: "2:23pm",
        placeholder: "Three seconds. Type it now.",
      },
    ],
    searchQuery: "contract",
    searchHitIndex: 0,
  },
  construction: {
    id: "construction",
    label: "Building project",
    description: "a contractor keeping the site notes between the day's calls",
    notebookEyebrow: "Site notebook · today",
    captures: [
      {
        text: "Owner approved kitchen layout — get drawings countersigned.",
        stamp: "10:42am",
        placeholder: "What just came up?",
      },
      {
        text: "Window supplier called — 4 more weeks. Need to update timeline.",
        stamp: "11:18am",
        placeholder: "What's worth remembering?",
      },
      {
        text: "Insurance renewal — 12 March. Quote sitting in inbox.",
        stamp: "11:56am",
        placeholder: "Three seconds. Type it now.",
      },
    ],
    searchQuery: "owner",
    searchHitIndex: 0,
  },
  launch: {
    id: "launch",
    label: "Product launch",
    description: "a team keeping decisions and feedback before the next sync",
    notebookEyebrow: "Decisions log · today",
    captures: [
      {
        text: "Sarah: PDF exports must ship before launch — non-negotiable.",
        stamp: "9:14am",
        placeholder: "What just came up?",
      },
      {
        text: "Dan's idea: filter by tag inside search results page.",
        stamp: "10:02am",
        placeholder: "What's worth remembering?",
      },
      {
        text: "Customer call — priorities are speed and price, not features.",
        stamp: "11:31am",
        placeholder: "Three seconds. Type it now.",
      },
    ],
    searchQuery: "sarah",
    searchHitIndex: 0,
  },
  freelance: {
    id: "freelance",
    label: "Freelance studio",
    description:
      "a designer keeping the brief, the brand decision, and the thing the client said in passing",
    notebookEyebrow: "Studio notebook · today",
    captures: [
      {
        text: "Maeve wants the homepage hero copy by Friday — three options, not one.",
        stamp: "9:32am",
        placeholder: "What just came up?",
      },
      {
        text: "Print-quality export — InDesign job package goes out Monday at the latest.",
        stamp: "10:14am",
        placeholder: "What's worth remembering?",
      },
      {
        text: "Send the Q1 invoice — last one was 11 days late.",
        stamp: "11:08am",
        placeholder: "Three seconds. Type it now.",
      },
    ],
    searchQuery: "invoice",
    searchHitIndex: 2,
  },
};
