import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
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
      <body className="min-h-full bg-[#07161d] text-white font-sans">
        {children}
      </body>
    </html>
  );
}
