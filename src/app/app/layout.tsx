// Protected app shell. Middleware guards access; this just lays out nav + content.
import type { Metadata } from "next";
import { Nav } from "@/components/app/Nav";

export const metadata: Metadata = {
  title: "Move-In CRM · Our Moving Castle",
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-screen bg-cream text-walnut"
      style={{ cursor: "auto" }}
    >
      <Nav />
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
