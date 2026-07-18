import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EarlyDraftBootstrap } from "./early-draft-bootstrap";
import { isNotesDesignLabAvailable } from "./lab-access";
import { NotesDesignLab } from "./notes-design-lab";
import type {
  LabDataset,
  LabMode,
  LabOption,
  LabScenario,
  LabViewport,
} from "./lab-types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Notes capture design lab",
  description: "Private Phase 1 review surface for Signal Notes.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
  referrer: "no-referrer",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function choice<T extends string>(
  value: string | undefined,
  values: readonly T[],
  fallback: T,
): T {
  return values.includes(value as T) ? (value as T) : fallback;
}

export default async function NotesDesignLabPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  if (!isNotesDesignLabAvailable()) notFound();

  const params = await searchParams;
  const initialConfig = {
    option: choice<LabOption>(one(params.option), ["a", "b", "c"], "a"),
    scenario: choice<LabScenario>(
      one(params.scenario),
      ["capture", "stream", "search", "detail"],
      "capture",
    ),
    dataset: choice<LabDataset>(
      one(params.dataset),
      ["sparse", "normal", "dense", "edge"],
      "normal",
    ),
    mode: choice<LabMode>(
      one(params.mode),
      [
        "default",
        "empty",
        "loading",
        "saving",
        "saved",
        "offline",
        "error",
        "conflict",
        "read-only",
      ],
      "default",
    ),
  };
  const initialViewport = choice<LabViewport>(
    one(params.viewport),
    ["auto", "390", "768", "1280", "1440", "1728"],
    "auto",
  );

  return (
    <>
      <EarlyDraftBootstrap />
      <NotesDesignLab initialConfig={initialConfig} initialViewport={initialViewport} />
    </>
  );
}
