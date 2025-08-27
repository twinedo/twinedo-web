import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "@/provider/useReactQuery";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Twin Edo Nugraha - Frontend Developer Portfolio",
  description: "Passionate Frontend Developer specializing in React, Next.js, TypeScript, and Mobile Development. Crafting beautiful, responsive web applications and mobile experiences.",
  keywords: ["Frontend Developer", "React", "Next.js", "TypeScript", "Mobile Development", "Web Applications", "UI/UX", "JavaScript"],
  authors: [{ name: "Twin Edo Nugraha", url: "https://twinedo.dev" }],
  openGraph: {
    title: "Twin Edo Nugraha - Frontend Developer",
    description: "Passionate Frontend Developer crafting beautiful, responsive web applications and mobile experiences",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Twin Edo Nugraha - Frontend Developer",
    description: "Passionate Frontend Developer crafting beautiful, responsive web applications",
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ReactQueryProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          suppressHydrationWarning
        >
          {children}
        </body>
      </html>
    </ReactQueryProvider>
  );
}
