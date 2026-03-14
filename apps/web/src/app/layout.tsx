import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header/header";
import { ThemeProvider } from "@/providers/theme-provider";
import { ScrollToTopButton } from "@repo/ui/components/scroll-to-top-button";

import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MoonCode | Track your coding activity with ease",
  description: "Track your coding time, languages and files with ease",
  metadataBase: new URL("https://mooncode.cc"),
  alternates: {
    canonical: "/",
  },

  openGraph: {
    title: "MoonCode",
    type: "website",
    url: "https://mooncode.cc",
    description: "Track your coding activity with ease",
    siteName: "MoonCode",
    images: "/opengraph-image.png",
  },

  twitter: {
    title: "MoonCode",
    creator: "@FriedrichC109",
    description: "Track your coding time, languages and files with ease",
    card: "summary_large_image",
    images: "/twitter-image.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="scroll-smooth"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <head />
      <body
        className={`${inter.className} flex w-svw flex-col overflow-x-hidden antialiased transition duration-300 ease-in-out`}
      >
        <ThemeProvider
          enableSystem
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
        >
          <Header />
          {children}
          <Footer />
          <ScrollToTopButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
