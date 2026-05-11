import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Signal Notes — capture clarity",
  description:
    "Capture in three seconds. Find it later. Promote it when it matters. Signal Notes is the context layer of Signal Studio.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://notes.signalstudio.ie"
  ),
  openGraph: {
    title: "Signal Notes — capture clarity",
    description: "Capture in three seconds. Find it later. Promote it when it matters.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
