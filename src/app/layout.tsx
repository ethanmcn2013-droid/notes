import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { DevBanner } from "@/components/dev-banner";
import {
  clerkPublishableKey,
  isDemoMode,
  isUxAssuranceMode,
} from "@/lib/access-mode";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "Notes · before it fades",
  description:
    "A private place for thoughts before they become work. Write it down in three seconds. Decide later what becomes work.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://notes.signalstudio.ie",
  ),
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Notes · before it fades",
    description: "A private place for thoughts before they become work.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Notes · before it fades",
    description: "A private place for thoughts before they become work.",
  },
};

function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {children}
      <DevBanner />
    </>
  );
}

function AuthShell({ children }: Readonly<{ children: React.ReactNode }>) {
  if (isUxAssuranceMode() || isDemoMode()) {
    return <AppShell>{children}</AppShell>;
  }

  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey()}
      appearance={{
        variables: {
          colorPrimary: "#4f46e5",
          colorBackground: "#ffffff",
          colorForeground: "#111111",
          fontFamily: "var(--font-sans)",
          borderRadius: "0.6rem",
        },
        elements: {
          formFieldInput: "!min-h-[48px] !text-[16px]",
          formButtonPrimary:
            "!bg-[#4f46e5] hover:!bg-[#4338ca] !text-white rounded-full !min-h-[48px] !text-[15px]",
          socialButtonsBlockButton: "!min-h-[48px] !text-[15px]",
          card: "shadow-[0_22px_70px_rgba(20,21,26,0.12)]",
        },
      }}
    >
      <AppShell>{children}</AppShell>
    </ClerkProvider>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable}`}
      style={{ background: "#fff", colorScheme: "light" }}
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: "html{background:#fff}" }} />
      </head>
      <body className="min-h-full" style={{ background: "#fff" }}>
        <AuthShell>{children}</AuthShell>
      </body>
    </html>
  );
}
