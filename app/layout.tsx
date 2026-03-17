import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";

// Global CSS only — component/page styles are co-located CSS Modules
import "./globals.css";
import "@/styles/tokens.css";
import "@/styles/globals.css";


const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Groomly",
  description: "Book top barbers near you.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable}`}>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="app-shell">
          {/* <TopNav /> */}
          <main className="page-content">{children}</main>
          {/* <BottomNav /> */}
        </div>
      </body>
    </html>
  );
}
