"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { createPortal } from "react-dom";

type NavItem = {
  href: string;
  label: string;
  icon: string;
};

const topNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/insights", label: "Insights", icon: "insights" },
  { href: "/community", label: "Community", icon: "community" },
];

const sidebarNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/cycle", label: "Cycle", icon: "cycle" },
  { href: "/cycle/symptoms", label: "Symptoms", icon: "symptoms" },
  { href: "/pregnancy", label: "Pregnancy", icon: "pregnancy" },
  { href: "/learn", label: "Learn", icon: "learn" },
  { href: "/appointments", label: "Appointments", icon: "appointments" },
  { href: "/medications", label: "Medications", icon: "medications" },
  { href: "/reminders", label: "Reminders", icon: "reminders" },
  { href: "/settings/data-export", label: "Export", icon: "export" },
  { href: "/onboarding", label: "Onboarding", icon: "onboarding" },
  { href: "/health/supabase", label: "Connection", icon: "connection" },
];

const mobileNav: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: "dashboard" },
  { href: "/cycle", label: "Cycle", icon: "cycle" },
  { href: "/pregnancy", label: "Pregnancy", icon: "pregnancy" },
  { href: "/learn", label: "Learn", icon: "learn" },
];

function isActive(pathname: string, href: string) {
  if (pathname === href) return true;
  return pathname.startsWith(`${href}/`);
}

function hideSidebarForRoute(pathname: string) {
  return pathname.startsWith("/insights") || pathname.startsWith("/community");
}

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const tone = active ? "text-[var(--color-primary-600)]" : "text-[var(--color-neutral-500)]";
  const cls = `h-4 w-4 ${tone}`;

  switch (name) {
    case "dashboard":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="currentColor" aria-hidden>
          <path d="M3 3h8v8H3V3Zm10 0h8v5h-8V3ZM3 13h5v8H3v-8Zm7 0h11v8H10v-8Z" />
        </svg>
      );
    case "insights":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="currentColor" aria-hidden>
          <path d="M4 20h16v2H2V4h2v16Zm3-3h2v-6H7v6Zm4 0h2V7h-2v10Zm4 0h2V10h-2v7Zm4 0h2V6h-2v11Z" />
        </svg>
      );
    case "cycle":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="currentColor" aria-hidden>
          <path d="M12 3a9 9 0 1 0 8.49 11.96 1 1 0 1 0-1.89-.66A7 7 0 1 1 12 5a1 1 0 1 0 0-2Z" />
        </svg>
      );
    case "symptoms":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="currentColor" aria-hidden>
          <path d="M12 2c3.4 0 6 2.63 6 6.1 0 4.38-3.58 7.4-6 10.4-2.42-3-6-6.02-6-10.4C6 4.63 8.6 2 12 2Zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
        </svg>
      );
    case "pregnancy":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="currentColor" aria-hidden>
          <path d="M14 3a1 1 0 1 0-2 0v4.1A5.5 5.5 0 0 0 8.5 12c0 2.4 1.6 4.44 3.8 5.1V21a1 1 0 1 0 2 0v-3.9A5.5 5.5 0 0 0 14 3Z" />
        </svg>
      );
    case "learn":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="currentColor" aria-hidden>
          <path d="M4 4h9a3 3 0 0 1 3 3v13H7a3 3 0 0 0-3 3V4Zm11 3a1 1 0 0 0-1-1H6v14.2c.58-.14 1.2-.2 1.8-.2H18V7h-3Z" />
        </svg>
      );
    case "community":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="currentColor" aria-hidden>
          <path d="M12 3a6 6 0 0 1 6 6v2h1a2 2 0 0 1 2 2v8H3v-8a2 2 0 0 1 2-2h1V9a6 6 0 0 1 6-6Zm-4 8h8V9a4 4 0 1 0-8 0v2Z" />
        </svg>
      );
    case "appointments":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="currentColor" aria-hidden>
          <path d="M7 2h2v2h6V2h2v2h3v18H4V4h3V2Zm11 8H6v10h12V10Z" />
        </svg>
      );
    case "medications":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="currentColor" aria-hidden>
          <path d="M9.3 4.9a4 4 0 0 1 5.66 0l4.24 4.24a4 4 0 0 1 0 5.66l-4.24 4.24a4 4 0 0 1-5.66 0L5.06 14.8a4 4 0 0 1 0-5.66L9.3 4.9Zm1.42 1.41L6.47 10.56a2 2 0 0 0 0 2.82l1.41 1.42 7.07-7.08-1.41-1.41a2 2 0 0 0-2.82 0Zm8.07 7.07-2.42-2.42L9.3 18.02l1.41 1.42a2 2 0 0 0 2.82 0l4.24-4.24a2 2 0 0 0 0-2.83Z" />
        </svg>
      );
    case "reminders":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="currentColor" aria-hidden>
          <path d="M12 2a6 6 0 0 1 6 6v3.6l1.56 2.6A1 1 0 0 1 18.7 16H5.3a1 1 0 0 1-.86-1.8L6 11.6V8a6 6 0 0 1 6-6Zm-2 16h4a2 2 0 1 1-4 0Z" />
        </svg>
      );
    case "export":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="currentColor" aria-hidden>
          <path d="M11 3h2v9.17l2.59-2.58L17 11l-5 5-5-5 1.41-1.41L11 12.17V3Zm-7 14h16v4H4v-4Z" />
        </svg>
      );
    case "onboarding":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="currentColor" aria-hidden>
          <path d="M3 5h18v3H3V5Zm0 5h12v3H3v-3Zm0 5h18v3H3v-3Z" />
        </svg>
      );
    case "connection":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="currentColor" aria-hidden>
          <path d="M4 11h3a5 5 0 0 1 10 0h3a8 8 0 0 0-16 0Zm0 4h16v2H4v-2Z" />
        </svg>
      );
    default:
      return <span className={`inline-block h-2 w-2 rounded-full ${tone.replace("text", "bg")}`} aria-hidden />;
  }
}

export function TopQuickNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden lg:flex items-center gap-1 rounded-full border border-[var(--color-neutral-200)] bg-white px-1 py-1 shadow-sm">
      {topNav.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={[
              "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-[var(--color-primary-50)] text-[var(--color-primary-700)]"
                : "text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)]",
            ].join(" ")}
          >
            <NavIcon name={item.icon} active={active} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function SidebarNav() {
  const pathname = usePathname();
  if (hideSidebarForRoute(pathname)) return null;

  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <nav className="sticky top-24 rounded-2xl border border-[var(--color-neutral-200)] bg-white/95 p-2 shadow-sm">
        <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-neutral-500)]">
          Workspace
        </p>
        <ul className="space-y-1">
          {sidebarNav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={[
                    "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-[var(--color-primary-50)] text-[var(--color-primary-700)]"
                      : "text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)]",
                  ].join(" ")}
                >
                  <NavIcon name={item.icon} active={active} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  if (hideSidebarForRoute(pathname)) return null;

  return (
    <nav className="fixed inset-x-0 bottom-3 z-40 px-3 lg:hidden">
      <div className="mx-auto grid max-w-xl grid-cols-4 rounded-2xl border border-[var(--color-neutral-200)] bg-white/95 p-1.5 shadow-lg backdrop-blur">
        {mobileNav.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-center text-xs font-semibold transition-colors",
                active
                  ? "bg-[var(--color-primary-50)] text-[var(--color-primary-700)]"
                  : "text-[var(--color-neutral-700)]",
              ].join(" ")}
            >
              <NavIcon name={item.icon} active={active} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function MobileMenuSheet() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const hideSidebar = hideSidebarForRoute(pathname);

  if (hideSidebar) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-neutral-200)] bg-white text-[var(--color-neutral-700)]"
        aria-label="Open navigation menu"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
          <path d="M4 6h16v2H4V6Zm0 5h16v2H4v-2Zm0 5h16v2H4v-2Z" />
        </svg>
      </button>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-50 lg:hidden">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute inset-0 bg-black/35"
                aria-label="Close navigation menu"
              />
              <aside className="absolute bottom-0 left-0 top-[68px] w-[85%] max-w-sm overflow-y-auto rounded-tr-2xl border-r border-t border-[var(--color-neutral-200)] bg-white p-4 shadow-xl">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold">Menu</p>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-neutral-200)]"
                    aria-label="Close navigation menu"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                      <path d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7l-1.4-1.4L9.2 12 2.9 5.7l1.4-1.4 6.3 6.3 6.3-6.3 1.4 1.4Z" />
                    </svg>
                  </button>
                </div>

                <ul className="space-y-1">
                  {sidebarNav.map((item) => {
                    const active = isActive(pathname, item.href);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={[
                            "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                            active
                              ? "bg-[var(--color-primary-50)] text-[var(--color-primary-700)]"
                              : "text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)]",
                          ].join(" ")}
                        >
                          <NavIcon name={item.icon} active={active} />
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </aside>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
