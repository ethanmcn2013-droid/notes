import type { DomainId } from "@/lib/domains";

export type { DomainId };

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
  | "reset";

export type Field = "capture" | "search";

export type DemoState = {
  notes: Note[];
  scene: Scene;
  field: Field;
  captureText: string;
  searchText: string;
  searchHit: string | null;
  placeholderIndex: number;
  domain: DomainId;
};
