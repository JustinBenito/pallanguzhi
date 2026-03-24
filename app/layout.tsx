import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pallanguzhi - பல்லாங்குழி",
  description: "Traditional South Indian board game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="a3cf85e1-a0e0-46e6-a720-ea0f0e22ee9a"
          strategy="afterInteractive"
        />
        {children}
      </body>
    </html>
  );
}
