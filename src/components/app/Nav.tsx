"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  FolderOpen,
  Home,
  LayoutDashboard,
  ListChecks,
  LogOut,
  NotebookPen,
  Phone,
  PiggyBank,
  ShoppingCart,
  Sparkles,
  Store,
  Wallet,
  Wrench,
  Receipt,
} from "lucide-react";
import { cx } from "./ui";
import { MOVE } from "@/lib/move-data";

const NAV = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/app/maintenance", label: "Maintenance", icon: Wrench },
  { href: "/app/bills", label: "Bills", icon: Receipt },
  { href: "/app/tasks", label: "Tasks", icon: ListChecks },
  { href: "/app/cleaning", label: "Cleaning", icon: Sparkles },
  { href: "/app/shopping", label: "Shopping", icon: ShoppingCart },
  { href: "/app/marketplace", label: "Marketplace", icon: Store },
  { href: "/app/money", label: "Money", icon: Wallet },
  { href: "/app/budget", label: "Budget", icon: PiggyBank },
  { href: "/app/contacts", label: "Contacts", icon: Phone },
  { href: "/app/files", label: "Files", icon: FolderOpen },
  { href: "/app/brief", label: "Daily Brief", icon: NotebookPen },
];

function useNav() {
  const pathname = usePathname();
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }
  const isActive = (href: string) =>
    href === "/app" ? pathname === "/app" : pathname.startsWith(href);
  return { logout, isActive };
}

// Desktop sidebar — lives inside the flex row (left of <main>).
export function Sidebar() {
  const { logout, isActive } = useNav();

  return (
    <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-line bg-surface px-3 py-5 md:flex">
      <Link href="/app" className="mb-5 px-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-ink text-white">
            <Home size={13} strokeWidth={2.2} />
          </span>
          <span className="text-[13px] font-semibold tracking-[-0.01em] text-ink">
            Moving Castle
          </span>
        </div>
        <div className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3">
          {MOVE.address}
        </div>
      </Link>

      <nav className="flex flex-1 flex-col gap-0.5">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cx(
              "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors",
              isActive(href)
                ? "bg-cream-deep font-medium text-ink"
                : "text-ink-2 hover:bg-canvas hover:text-ink",
            )}
          >
            <Icon
              size={15}
              className={isActive(href) ? "text-ink" : "text-ink-3"}
            />
            {label}
          </Link>
        ))}
      </nav>

      <button
        onClick={logout}
        className="mt-2 flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] text-ink-2 transition-colors hover:bg-canvas hover:text-ink"
      >
        <LogOut size={15} className="text-ink-3" />
        Sign out
      </button>
    </aside>
  );
}

// Mobile top bar — MUST be rendered full-width ABOVE the flex row, not as a
// flex sibling of <main> (that squished it into a column). Sticky + safe-area.
export function MobileTopBar() {
  const { logout, isActive } = useNav();

  return (
    <div
      className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur md:hidden"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-ink text-white">
            <Home size={13} strokeWidth={2.2} />
          </span>
          <span className="text-[13px] font-semibold tracking-[-0.01em] text-ink">
            Moving Castle
          </span>
        </div>
        <button
          onClick={logout}
          aria-label="Sign out"
          className="-mr-2 flex h-11 w-11 cursor-pointer items-center justify-center text-ink-3 active:text-ink"
        >
          <LogOut size={17} />
        </button>
      </div>
      <nav className="flex gap-1.5 overflow-x-auto px-3 pb-2 [scrollbar-width:none]">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cx(
              "flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition-colors",
              isActive(href)
                ? "border-ink bg-ink text-white"
                : "border-line bg-surface text-ink-2",
            )}
          >
            <Icon size={13} />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

// Back-compat wrapper. Prefer importing Sidebar + MobileTopBar directly so the
// layout can position each correctly.
export function Nav() {
  return (
    <>
      <Sidebar />
      <MobileTopBar />
    </>
  );
}
