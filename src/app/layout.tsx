import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nextechcareer.co.za"),
  title: {
    default: "NexTech Career | AI-Powered Career Platform for SA Youth",
    template: "%s | NexTech Career",
  },
  description:
    "Bridge the gap between skills and employment. AI-powered resume builder, cover letter generator, and interview coach for South Africa's youth.",
  keywords: [
    "career",
    "AI",
    "resume",
    "interview",
    "South Africa",
    "youth employment",
    "job search",
    "NexTech",
    "cover letter",
    "career coaching",
  ],
  authors: [{ name: "NexTech Career", url: "https://nextechcareer.co.za" }],
  creator: "NexTech Career",
  publisher: "NexTech Career",
  icons: {
    icon: [
      { url: "/nextech-icon.png", sizes: "32x32", type: "image/png" },
      { url: "/nextech-icon.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/nextech-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: "https://nextechcareer.co.za",
    siteName: "NexTech Career",
    title: "NexTech Career | AI-Powered Career Platform for SA Youth",
    description:
      "Bridge the gap between skills and employment. AI-powered resume builder, cover letter generator, and interview coach for South Africa's youth.",
    images: [
      {
        url: "/nextech-hero.png",
        width: 1200,
        height: 630,
        alt: "NexTech Career - Empowering South Africa's Youth",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NexTech Career | AI-Powered Career Platform for SA Youth",
    description:
      "Bridge the gap between skills and employment. AI-powered tools for South Africa's youth.",
    images: ["/nextech-hero.png"],
  },
  alternates: {
    canonical: "https://nextechcareer.co.za",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0e1a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
