import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";

import { signOut } from "@/app/auth/actions";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { createClient } from "@/utils/supabase/server";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const mainNav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/insights", label: "Insights" },
  { href: "/cycle", label: "Cycle" },
  { href: "/cycle/symptoms", label: "Symptoms" },
  { href: "/pregnancy", label: "Pregnancy" },
  { href: "/learn", label: "Learn" },
  { href: "/community", label: "Community" },
  { href: "/appointments", label: "Appointments" },
  { href: "/medications", label: "Medications" },
  { href: "/reminders", label: "Reminders" },
  { href: "/settings/data-export", label: "Export" },
  { href: "/onboarding", label: "Onboarding" },
  { href: "/health/supabase", label: "Connection" },
] as const;

export const metadata: Metadata = {
  title: "BloomCycle",
  description: "Privacy-focused cycle, fertility, and pregnancy companion.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="min-h-screen">
          <header className="border-b border-[var(--color-border)] bg-white/85 backdrop-blur-md">
            <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
              <Link href="/" className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-[var(--color-primary-500)]" />
                <span className="text-lg font-semibold tracking-tight">BloomCycle</span>
              </Link>

              <nav className="flex flex-wrap items-center gap-2 text-sm">
                {mainNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-full border border-transparent px-3 py-1.5 text-[var(--color-neutral-700)] hover:border-[var(--color-primary-200)] hover:bg-[var(--color-primary-50)]"
                  >
                    {item.label}
                  </Link>
                ))}
                <span className="rounded-full bg-[var(--color-neutral-100)] px-3 py-1.5 text-[var(--color-neutral-500)]">
                  Fertility
                </span>
              </nav>

              {user ? (
                <div className="flex items-center gap-2">
                  <Link href="/dashboard" className="bc-btn-secondary text-sm">
                    Dashboard
                  </Link>
                  <form action={signOut}>
                    <FormSubmitButton
                      pendingText="Logging out..."
                      showFullScreenLoader
                      className="bc-btn-primary text-sm"
                    >
                      Logout
                    </FormSubmitButton>
                  </form>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" className="bc-btn-secondary text-sm">
                    Login
                  </Link>
                  <Link href="/signup" className="bc-btn-primary text-sm">
                    Signup
                  </Link>
                </div>
              )}
            </div>
          </header>

          {children}

          <footer className="border-t border-[var(--color-border)] bg-white/80">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 text-xs text-[var(--color-neutral-500)] md:px-6">
              <p>BloomCycle supports health awareness and does not provide medical diagnosis.</p>
              <Link href="/health/supabase" className="underline">
                System status
              </Link>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
