import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "LI.FI Yield Agent | Autonomous Cross-Chain Yield Optimization",
  description: "AI-powered agent that monitors yields across chains and automatically rebalances via LI.FI for maximum returns",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sora.variable} font-sora antialiased`}>
        {children}
      </body>
    </html>
  );
}
