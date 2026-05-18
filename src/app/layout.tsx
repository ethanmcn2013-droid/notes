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
  openGraph: {
    title: "Signal Notes — capture clarity",
    description: "A private place for thoughts before they become work.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#335f54",
          colorBackground: "#fffefa",
          colorText: "#161815",
          fontFamily: "var(--font-inter)",
          borderRadius: "0.6rem",
        },
        elements: {
          // Mobile correctness — 48px min-height + 16px input font (no iOS
          // auto-zoom). Notes's green/mustard palette preserved per
          // feedback_notes_aesthetic; only sizing changes.
          formFieldInput:
            "!min-h-[48px] !text-[16px]",
          formButtonPrimary:
            "bg-[#161815] hover:bg-[#335f54] text-[#fffefa] rounded-full !min-h-[48px] !text-[15px]",
          socialButtonsBlockButton:
            "!min-h-[48px] !text-[15px]",
          card: "shadow-[0_22px_70px_rgba(41,48,37,0.12)]",
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
          {/* RW-5 Layer-0 pre-paint primitive — ARCH_SPEC §3, CREATIVE_SPEC §3.
              Two synchronous inlines that fire before any linked stylesheet
              or script resolves. Together they kill the dark frame on every
              cross-origin hop:
              1. <style>: white field on html + body; body::before = full-screen
                 white overlay (z:9998); body::after = centred 12px #4f46e5 dot
                 (z:9999). All literals — no var(), no em, no JS. Identical
                 across all 5 repos so the dot appears at the same coords on
                 both sides of a cross-origin hop → perceptually continuous.
                 globals.css overrides body::before/after to content:none once
                 the stylesheet loads, handing off to SuiteLoader.
              2. <script>: reads sessionStorage key `signal_dot_nav`. If set,
                 clears it and marks <html data-dot-landing="1"> so that the
                 dot-land @keyframes in globals.css fires on the wordmark period.
          */}
          {/* eslint-disable-next-line react/no-danger */}
          <style dangerouslySetInnerHTML={{ __html: "html,body{background:#fff}body::before{content:\"\";position:fixed;inset:0;background:#fff;z-index:9998;pointer-events:none}body::after{content:\"\";position:fixed;top:50%;left:50%;width:12px;height:12px;background:#4f46e5;border-radius:50%;transform:translate(-50%,-50%);z-index:9999;pointer-events:none}" }} />
          {/* eslint-disable-next-line react/no-danger */}
          <script dangerouslySetInnerHTML={{ __html: "(function(){var k='signal_dot_nav';if(sessionStorage.getItem(k)==='1'){sessionStorage.removeItem(k);document.documentElement.setAttribute('data-dot-landing','1');}})()" }} />
        </head>
        <body className="min-h-full" style={{ background: "#fff" }}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
