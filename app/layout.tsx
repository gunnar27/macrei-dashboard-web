import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MacREI Portfolio Dashboard",
  description: "Portfolio insights for MacREI Properties",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
