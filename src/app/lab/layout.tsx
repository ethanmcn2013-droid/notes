import type { ReactNode } from "react";

/**
 * Lab layout — hides dev chrome so hero options review on a clean field.
 *
 * Review-only. This route is never linked from shipped surfaces. It nests
 * under the root layout (fonts + globals.css load), so design tokens
 * resolve; no marketing header renders here by design — the field is clean.
 */
export default function LabLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{`
        /* Clerk keyless dev badge */
        #clerk-components,
        [class*="cl-keyless"],
        [data-clerk-keyless] { display: none !important; }
        /* Next.js dev toast / build indicator */
        [data-nextjs-toast],
        [data-next-badge],
        nextjs-portal { display: none !important; }
      `}</style>
      {children}
    </>
  );
}
