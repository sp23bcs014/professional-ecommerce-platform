import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import Navbar from "./Navbar";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"] });

export const metadata: Metadata = {
  title: "Fraz Modern Store | Elevate Your Home",
  description: "Shop modern furniture, lighting, and decor. Curated for style and comfort. Fast shipping, top-rated support.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Fraz Modern Store",
    description: "Shop modern furniture, lighting, and decor. Curated for style and comfort.",
    images: ["/logo.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={poppins.className + " bg-background min-h-screen flex flex-col"}>
        {/* Navbar */}
        <Navbar />
        <main className="flex-1 w-full">{children}</main>
      </body>
    </html>
  );
}
