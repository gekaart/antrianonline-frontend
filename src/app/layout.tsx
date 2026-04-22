import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Antrian Online",
  description: "Sistem Antrian Online",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
