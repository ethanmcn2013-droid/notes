import type { Metadata } from "next";
import NotesDesignLabPage from "../../__design-lab/notes/page";

// Next treats leading-underscore folders as private. `%5F%5Fdesign-lab`
// intentionally decodes to the required `/__design-lab` review URL while all
// implementation remains isolated in the private sibling directory.
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
    googleBot: { index: false, follow: false, noimageindex: true },
  },
  referrer: "no-referrer",
};

export default NotesDesignLabPage;
