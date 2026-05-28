import "./globals.css";

import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";

const bricolage = Bricolage_Grotesque({
   variable: "--font-bricolage",
   subsets: ["latin"],
   display: "swap",
});

const inter = Inter({
   variable: "--font-inter",
   subsets: ["latin"],
   display: "swap",
});

export const metadata: Metadata = {
   title: "VedaAI",
   description: "AI-powered assignment grading platform",
   openGraph: {
      title: "VedaAI",
      description: "AI-powered assignment grading platform",
      images: ["/assets/og/og-veda-ai.png"],
      type: "website",
   },
   twitter: {
      card: "summary_large_image",
      title: "VedaAI",
      description: "AI-powered assignment grading platform",
      images: ["/assets/og/og-veda-ai.png"],
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
         className={`${bricolage.variable} ${inter.variable} h-full antialiased`}
      >
         <body className="h-full">
            {children}
            <Toaster position="top-center" richColors />
            <Analytics />
         </body>
      </html>
   );
}
