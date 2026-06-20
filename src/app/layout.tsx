import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Workflow Viz — AI Automation Workflows",
  description:
    "Visualisering af AI automation workflows: LLMs, APIs, ERP-systemer og agenter.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="da" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
