import type { Metadata, Viewport } from "next";
import { Inter, Geist } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Geist is the suite-wide wordmark font per the 2026-05-11 brand guide.
// Inter remains the Notes product surface font per the locked aesthetic.
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // D4 Layer-0: kill dark-UA chrome/tab before any CSS resolves.
  // LOADING_SYSTEM.md §2: "theme-color controls browser chrome (address bar, tab)."
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "Signal Notes — capture clarity",
  description:
    "A private place for thoughts before they become work. Write it down in three seconds. Decide later what becomes work.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://notes.signalstudio.ie"
  ),
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Signal Notes — capture clarity",
    description: "A private place for thoughts before they become work.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Signal Notes — capture clarity",
    description: "A private place for thoughts before they become work.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#4f46e5",
          colorBackground: "#ffffff",
          colorText: "#111111",
          fontFamily: "var(--font-inter)",
          borderRadius: "0.6rem",
        },
        elements: {
          // Mobile correctness — 48px min-height + 16px input font (no iOS
          // auto-zoom). Suite indigo accent per BRAND.md §5 D01.
          formFieldInput:
            "!min-h-[48px] !text-[16px]",
          formButtonPrimary:
            "!bg-[#4f46e5] hover:!bg-[#4338ca] !text-white rounded-full !min-h-[48px] !text-[15px]",
          socialButtonsBlockButton:
            "!min-h-[48px] !text-[15px]",
          card: "shadow-[0_22px_70px_rgba(20,21,26,0.12)]",
        },
      }}
    >
      {/*
        D4 Layer-0 instant canvas — DECISIONS.md D4, LOADING_SYSTEM.md §2.
        background:#fff on <html> fires before any stylesheet resolves.
        colorScheme:light prevents UA dark-mode grey void pre-CSS.
        These are the only two tokens that fix P1-1 without JavaScript.
        The inline <style> in <head> is belt-and-braces synchronous.
        Note: Notes notebook canvas (#fffefa) is NOT used here — the
        loading field precedes the product chrome (LOADING_SYSTEM.md §1).
      */}
      <html
        lang="en"
        className={`${inter.variable} ${geist.variable}`}
        style={{ background: "#fff", colorScheme: "light" }}
      >
        <head>
          {/* Belt-and-braces: inline style fires before linked stylesheet. */}
          <style dangerouslySetInnerHTML={{ __html: "html{background:#fff}" }} />
        </head>
        <body className="min-h-full" style={{ background: "#fff" }}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
