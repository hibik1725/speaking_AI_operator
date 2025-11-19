import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI要件相談アシスタント",
  description: "業務委託の要件定義を音声で相談できるAIアシスタント",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
