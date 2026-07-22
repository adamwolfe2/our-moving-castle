"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  FolderOpen,
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
  Flame,
  Wrench,
  Receipt,
} from "lucide-react";
import { cx } from "./ui";
import { MOVE, daysUntilMoveIn } from "@/lib/move-data";

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
  const days = daysUntilMoveIn();

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-walnut/10 bg-linen/50 px-4 py-6 md:flex">
      <Link href="/app" className="mb-6 px-2">
        <div className="flex items-center gap-2">
          <Flame size={18} className="text-terracotta" />
          <span className="font-serif text-lg text-walnut">Moving Castle</span>
        </div>
        <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-dust">
          {MOVE.address}
        </div>
      </Link>

      <div className="mb-5 rounded-2xl bg-walnut px-3.5 py-3 text-cream">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-cream/60">
          Move-in
        </div>
        <div className="font-serif text-3xl leading-none">
          {days > 0 ? `${days}` : days === 0 ? "Today" : "Moved"}
          {days > 0 && <span className="ml-1 text-base text-cream/60">days</span>}
        </div>
        <div className="mt-1 text-xs text-cream/70">Wed Jun 17 · 5 PM</div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cx(
              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
              isActive(href)
                ? "bg-white text-walnut shadow-sm"
                : "text-walnut/60 hover:bg-white/60 hover:text-walnut",
            )}
          >
            <Icon size={17} />
            {label}
          </Link>
        ))}
      </nav>

      <button
        onClick={logout}
        className="mt-2 flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm text-walnut/50 transition hover:bg-white/60 hover:text-terracotta"
      >
        <LogOut size={17} />
        Sign out
      </button>
    </aside>
  );
}

// Mobile top bar — MUST be rendered full-width ABOVE the flex row, not as a
// flex sibling of <main> (that squished it into a column). Sticky + safe-area.
export function MobileTopBar() {
  const { logout, isActive } = useNav();
  const days = daysUntilMoveIn();

  return (
    <div
      className="sticky top-0 z-30 border-b border-walnut/10 bg-cream/90 backdrop-blur md:hidden"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Flame size={16} className="text-terracotta" />
          <span className="font-serif text-base text-walnut">Moving Castle</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-mono text-xs text-walnut/70">
            {days > 0 ? `${days}d to keys` : days === 0 ? "Move day" : "Moved in"}
          </span>
          <button
            onClick={logout}
            aria-label="Sign out"
            className="-mr-2 flex h-11 w-11 cursor-pointer items-center justify-center text-walnut/50 active:text-terracotta"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-2 [scrollbar-width:none]">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cx(
              "flex min-h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs transition",
              isActive(href)
                ? "bg-walnut text-cream"
                : "bg-white/60 text-walnut/60",
            )}
          >
            <Icon size={14} />
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
