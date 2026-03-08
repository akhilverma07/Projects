import type { Metadata } from "next";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";

export const metadata: Metadata = {
  title: "LiveSheet — Real-time Collaborative Spreadsheet",
  description: "A lightweight, real-time collaborative spreadsheet with formulas, formatting, and presence tracking. Built with Next.js, Firebase, and TypeScript.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
