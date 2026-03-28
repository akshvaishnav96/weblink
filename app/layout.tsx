import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";

// Global CSS only — component/page styles are co-located CSS Modules
import "./globals.css";
import "@/styles/tokens.css";
import "@/styles/globals.css";
import BottomNav from "@/components/layout/BottomNav";
import FontLoader from "@/components/FontLoader";


const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
  display: "swap",
});


export const metadata: Metadata = {
  title: "valetvault - Book top barbers near you",
  description: "Book top barbers near you.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cormorant.variable}>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
      </head>
      <body>
        <FontLoader />
        <div className="app-shell">
          {/* <TopNav /> */}
          <main className="page-content">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
