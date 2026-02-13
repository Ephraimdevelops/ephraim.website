import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Instrument_Serif } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import { LenisProvider } from "@/components/providers/LenisProvider";
import { GhostCursor } from "@/components/ui/GhostCursor";

// ═══════════════════════════════════════════════════════════════
// FONT CONFIGURATION - The Typographic Hierarchy
// Editorial Serif + Technical Mono = Awwwards Aesthetic
// ═══════════════════════════════════════════════════════════════

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Instrument Serif - Sharp, Editorial, Expensive
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

// ═══════════════════════════════════════════════════════════════
// SEO & PWA METADATA
// ═══════════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: {
    default: "Ephraim | Digital Architect",
    template: "%s | Ephraim",
  },
  description:
    "Forging digital empires for the boldest brands. High-end web design, Next.js development, and Stop-Scroll Marketing strategies.",
  keywords: [
    "Digital Architect",
    "Stop-Scroll Marketing",
    "High-End Web Design",
    "Next.js Developer",
    "Tanzania",
    "Africa",
    "Portfolio",
    "Creative Agency",
    "React",
    "AI Automation"
  ],
  authors: [{ name: "Ephraim" }],
  creator: "Ephraim",
  metadataBase: new URL("https://ephraim.website"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ephraim.website",
    siteName: "Ephraim | Digital Architect",
    title: "Ephraim | Digital Architect",
    description:
      "Forging digital empires for the boldest brands. High-end web design meets Stop-Scroll Marketing.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Ephraim - Digital Architect",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ephraim | Digital Architect",
    description:
      "Forging digital empires for the boldest brands. High-end web design meets Stop-Scroll Marketing.",
    images: ["/og-image.jpg"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#02040A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// ═══════════════════════════════════════════════════════════════
// ROOT LAYOUT
// ═══════════════════════════════════════════════════════════════

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`
          ${geistSans.variable} 
          ${geistMono.variable} 
          ${instrumentSerif.variable}
          antialiased
          bg-[#02040A]
          text-[#E8ECF4]
          min-h-screen
          overflow-x-hidden
        `}
      >
        <ConvexClientProvider>
          <LenisProvider>
            {/* The Ghost Cursor - mix-blend-mode difference */}
            <GhostCursor />

            {/* The Film Grain Noise Overlay */}
            <div className="noise-overlay" aria-hidden="true" />

            {/* Main Content */}
            <main>{children}</main>
          </LenisProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
