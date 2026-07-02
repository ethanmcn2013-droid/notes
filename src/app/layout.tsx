import type { Metadata, Viewport } from "next";
import { Geist, Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { DevBanner } from "@/components/dev-banner";
import {
  clerkPublishableKey,
  isDemoMode,
  isUxAssuranceMode,
} from "@/lib/access-mode";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "Signal Notes - capture clarity",
  description:
    "A private place for thoughts before they become work. Write it down in three seconds. Decide later what becomes work.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://notes.signalstudio.ie",
  ),
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Signal Notes - capture clarity",
    description: "A private place for thoughts before they become work.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Signal Notes - capture clarity",
    description: "A private place for thoughts before they become work.",
  },
};

function AuthBoundary({ children }: { children: React.ReactNode }) {
  const keylessReview =
    isDemoMode() && !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (isUxAssuranceMode() || keylessReview) return <>{children}</>;

  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey()}
      appearance={{
        variables: {
          colorPrimary: "#4f46e5",
          colorBackground: "#ffffff",
          colorText: "#111111",
          fontFamily: "var(--font-inter)",
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
      {children}
    </ClerkProvider>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthBoundary>
      <html
        lang="en"
        className={`${inter.variable} ${geist.variable}`}
        style={{ background: "#fff", colorScheme: "light" }}
      >
        <head>
          <style dangerouslySetInnerHTML={{ __html: "html{background:#fff}" }} />
        </head>
        <body className="min-h-full" style={{ background: "#fff" }}>
          {children}
          <DevBanner />
        </body>
      </html>
    </AuthBoundary>
  );
}
