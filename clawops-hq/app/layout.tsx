import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClawOps HQ",
  description: "Command Center for ClawOps AI Agent Swarm",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0e1a] text-white antialiased min-h-screen">{children}</body>
    </html>
  );
}
