import type { Metadata } from "next";
import "./globals.css";
import { Frame } from "@/components/shell";

export const metadata: Metadata = {
  title: "AI Business OS",
  description: "The daily workspace for a small business.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a
          href="#field"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-raise focus:px-rise focus:py-step"
        >
          Skip to the field
        </a>
        <Frame>{children}</Frame>
      </body>
    </html>
  );
}
