import type { MetadataRoute } from "next";

/**
 * PWA manifest — Signal Notes.
 *
 * Notes is intentionally outside the suite visual register
 * (green/mustard/Inter — see DESIGN.md §11 and the locked palette
 * comment in globals.css). The manifest uses Notes' own paper
 * canvas (#fffefa) as background_color so the install splash and
 * standalone shell read as a notebook, not as suite paper white.
 *
 * theme_color stays #ffffff to match layout.tsx — keeps the
 * cross-domain address-bar transitions white→white.
 *
 * start_url goes to /app — the notebook landing — because that's
 * where the value is. The single shortcut "My notes" honestly
 * names the destination (the notebook listing, not a blank
 * compose-from-scratch surface).
 *
 * Maskable icon at /icon1 (512×512) uses Notes' green accent
 * (#335f54) as the field so any Android adaptive mask reads as a
 * solid green silhouette with a paper "n" + indigo dot — preserves
 * Notes' own register at install time.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/signal-notes",
    name: "Signal Notes",
    short_name: "Notes",
    description:
      "A private place for thoughts before they become work.",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fffefa",
    theme_color: "#ffffff",
    lang: "en-IE",
    dir: "ltr",
    categories: ["productivity", "lifestyle"],
    icons: [
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon1",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon1",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "My notes",
        short_name: "Notes",
        url: "/app",
        description: "Your notebook.",
      },
    ],
  };
}
