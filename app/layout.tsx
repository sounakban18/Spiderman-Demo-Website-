import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spider Nexus — Interactive Reveal",
  description: "An unofficial cinematic Spider-Man fan interface with an interactive spotlight reveal.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
