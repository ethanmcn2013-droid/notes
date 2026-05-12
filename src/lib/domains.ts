/**
 * Notes audience packs — same axis as Roadmap and Analytics.
 * Drives the AudienceToggle and reseeds the cinematic capture demo.
 */

export type DomainId = "wedding" | "construction" | "launch" | "startup";

export type CaptureEntry = {
  /** The note body the user types. */
  text: string;
  /** Timestamp pip shown next to the note in the stream. */
  stamp: string;
  /** Placeholder shown before this capture begins. */
  placeholder: string;
  /** Tags that should appear as chips when the note commits. */
  tags?: string[];
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
  "startup",
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
        tags: ["venue"],
      },
      {
        text: "Florist callback — ask about peonies for the centrepieces.",
        stamp: "2:18pm",
        placeholder: "What's worth remembering?",
        tags: ["vendor"],
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
        tags: ["owner", "kitchen"],
      },
      {
        text: "Window supplier called — 4 more weeks. Need to update timeline.",
        stamp: "11:18am",
        placeholder: "What's worth remembering?",
        tags: ["vendor", "delay"],
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
        tags: ["feedback", "launch"],
      },
      {
        text: "Dan's idea: filter by tag inside search results page.",
        stamp: "10:02am",
        placeholder: "What's worth remembering?",
        tags: ["idea"],
      },
      {
        text: "Customer call — priorities are speed and price, not features.",
        stamp: "11:31am",
        placeholder: "Three seconds. Type it now.",
        tags: ["customer"],
      },
    ],
    searchQuery: "sarah",
    searchHitIndex: 0,
  },
  startup: {
    id: "startup",
    label: "Startup plan",
    description: "a founder keeping the half-formed thoughts between meetings",
    notebookEyebrow: "Founder log · today",
    captures: [
      {
        text: "Investor question: what's the moat? Need a sharper answer.",
        stamp: "9:42am",
        placeholder: "What just came up?",
        tags: ["investor"],
      },
      {
        text: "SOC 2 auditor confirmed for April 1 — calendar block.",
        stamp: "10:18am",
        placeholder: "What's worth remembering?",
        tags: ["compliance"],
      },
      {
        text: "Tom referral — introduce to fintech founder Y this week.",
        stamp: "11:04am",
        placeholder: "Three seconds. Type it now.",
        tags: ["intro"],
      },
    ],
    searchQuery: "auditor",
    searchHitIndex: 1,
  },
};
