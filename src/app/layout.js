import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Head from "next/head";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "SmartEnglish +",
  description: "Six Mois de Coaching Premium en Anglais",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/apple-touch-icon.png" />
        <meta name="theme-color" content="#000000" />
        <meta name="description" content="Six Mois de Coaching Premium en Anglais" />
        <title>SmartEnglish +</title>
      </Head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Analytics />
        <SpeedInsights />
        {children}
      </body>
    </html>
  );
}
