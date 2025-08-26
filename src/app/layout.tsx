import type { Metadata } from "next";
import { Geist, Geist_Mono, Asap_Condensed } from "next/font/google";
import { getBasePath } from "@/lib/basePath";
import "./globals.css";


// RootLayout: wraps every page. Controls global fonts, metadata, and shared UI (Navbar)
// Edit tips:
// - Fonts: adjust loaded Google fonts and CSS variables
// - Navbar: remove or move <Navbar /> to hide/show globally
// - Metadata: update title/description in `metadata`

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const asapCondensed = Asap_Condensed({
  variable: "--font-gamegrid-title",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GameGrid | All-in-One Platform",
  description: "Built for the grind. Engineered for every game. GameGrid is the ultimate sports league management platform with real-time stats, player dashboards, and strategy tools.",
  icons: {
    icon: [
      { url: getBasePath("/logos/gamegrid-logo.png"), sizes: "16x16", type: "image/png" },
      { url: getBasePath("/logos/gamegrid-logo.png"), sizes: "32x32", type: "image/png" },
      { url: getBasePath("/logos/gamegrid-logo.png"), sizes: "48x48", type: "image/png" },
    ],
    shortcut: getBasePath("/logos/gamegrid-logo.png"),
    apple: [
      { url: getBasePath("/logos/gamegrid-logo.png"), sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${asapCondensed.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
