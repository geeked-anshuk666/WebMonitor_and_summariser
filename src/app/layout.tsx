/**
 * ROOT LAYOUT
 * 
 * Provides the global structure, navigation, and theme styles for all pages.
 * Includes Inter and JetBrains Mono fonts and the global navigation bar.
 */

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Web Monitor - Track Page Changes",
  description:
    "Monitor web pages for changes. See visual diffs and AI-generated summaries of what changed.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            borderBottom: "1px solid var(--border)",
            background: "var(--bg-surface)",
          }}
        >
          <a
            href="/"
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "1.3rem" }}>◉</span>
            Web Monitor
          </a>
          <div style={{ display: "flex", gap: "20px", fontSize: "0.875rem" }}>
            <a href="/" style={{ color: "var(--text-secondary)" }}>
              Dashboard
            </a>
            <a href="/status" style={{ color: "var(--text-secondary)" }}>
              Status
            </a>
          </div>
        </nav>
        <main style={{ maxWidth: "960px", margin: "0 auto", padding: "24px" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
