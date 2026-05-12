import type { DomainId } from "@/lib/domains";
import type { ViewMode } from "./view-toggle";

export type { DomainId, ViewMode };

export type Note = {
  id: string;
  body: string;
  stamp: string;
  tags?: string[];
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
  | "search-focus"
  | "search-type"
  | "search-result"
  | "view-morph-tags"
  | "tags-hold"
  | "view-morph-stream"
  | "long-press"
  | "promote-menu"
  | "promote-press"
  | "promote-flight"
  | "promote-done"
  | "reset";

export type Field = "capture" | "search";

export type DemoState = {
  notes: Note[];
  scene: Scene;
  view: ViewMode;
  field: Field;
  captureText: string;
  searchText: string;
  searchHit: string | null;
  placeholderIndex: number;
  /** Note id currently long-pressed (ring + menu). */
  pressedNoteId: string | null;
  /** True when the menu's Promote item is being clicked. */
  promotePressed: boolean;
  /** Note flying off-screen as a Tasks-card silhouette. */
  promotingNoteId: string | null;
  /** Pixel position the flying silhouette should animate from. */
  flightFrom: { x: number; y: number } | null;
  /** True when Tasks edge indicator should pulse-active. */
  tasksEdgeActive: boolean;
  domain: DomainId;
};
