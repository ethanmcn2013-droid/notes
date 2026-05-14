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
};

export const metadata: Metadata = {
  title: "Signal Notes — capture clarity",
  description:
    "A private capture layer for thoughts before they become work. Signal Notes is the context layer of Signal Studio.",
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
      <html lang="en" className={`${inter.variable} ${geist.variable}`}>
        <body className="min-h-full">{children}</body>
      </html>
    </ClerkProvider>
  );
}
