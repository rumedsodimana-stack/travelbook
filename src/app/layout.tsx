import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Travel Book — Plan, Book & Share Trips",
  description:
    "AI-powered social travel platform. Discover destinations, book flights and hotels, share travel stories, and connect with travelers and providers worldwide.",
  keywords: [
    "travel",
    "booking",
    "social travel",
    "trip planner",
    "hotel booking",
    "flight booking",
    "travel community",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#07161d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        <Script id="travelpayouts-drive" strategy="beforeInteractive">
          {`(function () {
    var script = document.createElement("script");
    script.async = 1;
    script.src = "https://emrldtp.cc/NTE4NDQ2.js?t=518446";
    document.head.appendChild(script);
  })();`}
        </Script>
      </head>
      <body className="min-h-full bg-[#07161d] text-white font-sans">
        {children}
      </body>
    </html>
  );
}
