export type Note = {
  id: string;
  body: string;
  /** Timestamp string like "2:14pm" */
  stamp: string;
  /** True when the note is freshly arrived in the stream (drives entrance animation). */
  fresh?: boolean;
};

export type Scene =
  | "boot"
  | "capture-1-type"
  | "capture-1-commit"
  | "capture-2-type"
  | "capture-2-commit"
  | "capture-3-type"
  | "capture-3-commit"
  | "search-type"
  | "search-result"
  | "reset";

export type Field = "capture" | "search";

export type DemoState = {
  notes: Note[];
  scene: Scene;
  /** Which field has the caret right now. */
  field: Field;
  /** Current text in the capture field (type-on animation source). */
  captureText: string;
  /** Current text in the search field. */
  searchText: string;
  /** Which note id should highlight as a search match. */
  searchHit: string | null;
  /** Rotating placeholder for the capture field. */
  placeholderIndex: number;
};

export const CAPTURE_SCRIPT: { text: string; stamp: string; placeholder: string }[] = [
  {
    text: "Lamb's Hill viewing — bring contract Friday.",
    stamp: "2:14pm",
    placeholder: "What just came up?",
  },
  {
    text: "Florist callback — ask about peonies.",
    stamp: "2:18pm",
    placeholder: "What's worth remembering?",
  },
  {
    text: "Mum's birthday vase.",
    stamp: "2:23pm",
    placeholder: "Three seconds. Type it now.",
  },
];

export const SEARCH_QUERY = "contract";
