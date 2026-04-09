import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Songbook",
  description: "A small editorial songbook",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-50 text-stone-900 antialiased">
        <header className="border-b border-stone-200 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-6 flex items-baseline justify-between">
            <Link href="/" className="font-serif text-2xl tracking-tight">
              Songbook
            </Link>
            <nav className="text-sm text-stone-600">
              <Link href="/" className="hover:text-stone-900">Index</Link>
              <span className="mx-2 text-stone-300">·</span>
              <Link href="/how-to-read" className="hover:text-stone-900">How to Read</Link>
              <span className="mx-2 text-stone-300">·</span>
              <Link href="/notes" className="hover:text-stone-900">Notes</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
        <footer className="mt-16 border-t border-stone-200 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-6 text-xs text-stone-500">
            Rendered as-is from source data.{" "}
            <Link href="/notes" className="underline hover:text-stone-800">
              Known data issues
            </Link>
            .
          </div>
        </footer>
      </body>
    </html>
  );
}
