import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "MVP Platform",
  description: "MVP маркетплейс музыкальной индустрии"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <header className="border-b border-border bg-card/50">
          <div className="container flex items-center justify-between py-4">
            <Link href="/" className="text-lg font-semibold">
              Platform
            </Link>
            <nav className="flex gap-4 text-sm text-muted">
              <Link href="/tasks">Tasks</Link>
              <Link href="/tasks/new">New Task</Link>
              <Link href="/me">Profile</Link>
              <Link href="/login">Login</Link>
            </nav>
          </div>
        </header>
        <main className="container py-8">{children}</main>
      </body>
    </html>
  );
}
