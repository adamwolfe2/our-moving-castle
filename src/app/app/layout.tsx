// Protected app shell. Middleware guards access; this just lays out nav + content.
// Mobile bar sits full-width ABOVE the flex row; desktop sidebar sits inside it.
import type { Metadata } from "next";
import { Sidebar, MobileTopBar } from "@/components/app/Nav";

export const metadata: Metadata = {
  title: "Move-In CRM · Our Moving Castle",
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="crm min-h-screen bg-canvas text-ink antialiased"
      style={{ cursor: "auto" }}
    >
      <MobileTopBar />
      <div className="flex md:min-h-screen">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <div
            className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-10"
            style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
