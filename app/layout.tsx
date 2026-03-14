import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";

import { signOut } from "@/app/auth/actions";
import { MobileBottomNav, MobileMenuSheet, SidebarNav, TopQuickNav } from "@/components/layout/app-shell-nav";
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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "BloomCycle",
  description: "Privacy-focused cycle, fertility, and pregnancy companion.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon",
  },
  openGraph: {
    title: "BloomCycle",
    description: "Privacy-focused cycle, fertility, and pregnancy companion.",
    images: [{ url: "/opengraph-image" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BloomCycle",
    description: "Privacy-focused cycle, fertility, and pregnancy companion.",
    images: ["/twitter-image"],
  },
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
        <div className="min-h-screen pb-20 lg:pb-0">
          <header className="border-b border-[var(--color-border)] bg-white/85 backdrop-blur-md">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-6">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/brand/bloomcycle-mark.svg"
                  alt="BloomCycle icon"
                  width={22}
                  height={22}
                  className="h-[22px] w-[22px]"
                  priority
                />
                <span className="text-lg font-semibold tracking-tight">BloomCycle</span>
              </Link>

              {user ? <TopQuickNav /> : null}

              {user ? (
                <div className="ml-auto flex items-center gap-2">
                  <div className="lg:hidden">
                    <MobileMenuSheet />
                  </div>
                  <Link href="/cycle" className="bc-btn-secondary hidden text-sm sm:inline-flex">
                    Log today
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
                <div className="ml-auto flex items-center gap-2">
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

          {user ? (
            <>
              <div className="mx-auto flex w-full max-w-6xl gap-5 px-4 md:px-6">
                <SidebarNav />
                <div className="min-w-0 flex-1">{children}</div>
              </div>
              <MobileBottomNav />
            </>
          ) : (
            children
          )}

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
