import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zaib Stock Watcher",
  description: "Monitor zaibonline.com product availability",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">{children}</body>
    </html>
  );
}
