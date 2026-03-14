import Image from "next/image";
import Link from "next/link";

import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = Boolean(user);

  const highlights = [
    {
      title: "Cycle clarity",
      text: "Understand period rhythm, symptom patterns, and monthly shifts with cleaner tracking.",
      href: "/cycle",
      label: "Explore cycle tools",
      image: "/images/landing/feature-cycle-tracking.jpg",
      alt: "Woman writing daily notes for cycle tracking",
      width: 4160,
      height: 6240,
    },
    {
      title: "Fertility planning",
      text: "Use trend data and timing context to plan with more confidence month over month.",
      href: "/insights",
      label: "View insights",
      image: "/images/landing/feature-daily-wellness.jpg",
      alt: "Woman checking wellness app on smartphone",
      width: 2686,
      height: 4032,
    },
    {
      title: "Pregnancy support",
      text: "Track weekly progress, kick counts, and contraction sessions in one calm workspace.",
      href: "/pregnancy",
      label: "Open pregnancy hub",
      image: "/images/landing/feature-reproductive-health.jpg",
      alt: "Reproductive health concept with calendar and tools",
      width: 6000,
      height: 4000,
    },
  ];

  return (
    <main className="bc-page">
      <section className="mb-5">
        <article className="bc-card overflow-hidden border-[var(--color-primary-200)] bg-gradient-to-r from-[var(--color-primary-50)] via-white to-[var(--color-support-50)] p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-primary-700)]">New in BloomCycle</p>
              <h2 className="text-xl font-semibold leading-tight">Your complete women&apos;s health command center is now live.</h2>
              <p className="text-sm bc-muted">Get stage-aware recommendations, trend charts, and daily logging in one place.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {isLoggedIn ? (
                <Link href="/dashboard" className="bc-btn-primary text-sm">
                  View Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/signup" className="bc-btn-primary text-sm">
                    Get Started
                  </Link>
                  <Link href="/login" className="bc-btn-secondary text-sm">
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="bc-card relative overflow-hidden p-6 md:p-8">
          <div className="absolute -left-12 -top-12 h-44 w-44 rounded-full bg-[var(--color-primary-100)] blur-2xl" />
          <div className="absolute -bottom-10 right-0 h-36 w-36 rounded-full bg-[var(--color-support-50)] blur-2xl" />

          <div className="relative space-y-6">
            <span className="bc-pill">BloomCycle Companion</span>
            <div className="space-y-3">
              <h1 className="bc-heading">Track your cycle, fertility, and pregnancy in one calm, private space.</h1>
              <p className="max-w-2xl text-[0.98rem] bc-muted">
                Built to help you understand patterns, stay prepared, and keep important health notes organized across every stage.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs font-medium">
              <span className="rounded-full bg-[var(--color-primary-50)] px-3 py-1 text-[var(--color-primary-700)]">Cycle care</span>
              <span className="rounded-full bg-[var(--color-support-50)] px-3 py-1 text-[var(--color-support-600)]">Fertility planning</span>
              <span className="rounded-full bg-[var(--color-accent-50)] px-3 py-1 text-[#8a251f]">Pregnancy support</span>
            </div>

            <div className="flex flex-wrap gap-3">
              {isLoggedIn ? (
                <Link href="/dashboard" className="bc-btn-primary inline-flex items-center gap-2 text-sm">
                  <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4 fill-current"><path d="M4 4h7v7H4V4Zm9 0h7v4h-7V4ZM4 13h4v7H4v-7Zm6 0h10v7H10v-7Z" /></svg>
                  Open dashboard
                </Link>
              ) : (
                <>
                  <Link href="/signup" className="bc-btn-primary inline-flex items-center gap-2 text-sm">
                    <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4 fill-current"><path d="M12 2a1 1 0 0 1 1 1v8h8a1 1 0 1 1 0 2h-8v8a1 1 0 1 1-2 0v-8H3a1 1 0 1 1 0-2h8V3a1 1 0 0 1 1-1Z" /></svg>
                    Start free
                  </Link>
                  <Link href="/login" className="bc-btn-secondary inline-flex items-center gap-2 text-sm">
                    <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4 fill-current"><path d="M10 4a1 1 0 0 1 1 1v1h6a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-6v1a1 1 0 1 1-2 0V5a1 1 0 0 1 1-1Zm-5 7a1 1 0 0 0 0 2h7.59l-2.3 2.3a1 1 0 1 0 1.42 1.4l4-4a1 1 0 0 0 0-1.4l-4-4a1 1 0 1 0-1.42 1.4l2.3 2.3H5Z" /></svg>
                    Login
                  </Link>
                </>
              )}
              {isLoggedIn ? (
                <Link href="/onboarding" className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-neutral-300)] bg-white px-4 py-2 text-sm font-medium">
                  <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4 fill-current"><path d="M4 4h16v3H4V4Zm0 6h16v3H4v-3Zm0 6h10v3H4v-3Z" /></svg>
                  Complete profile
                </Link>
              ) : null}
            </div>

            <p className="text-xs bc-muted">Non-diagnostic guidance only. For medical concerns, contact your healthcare provider.</p>
          </div>

          <div className="relative mt-6 overflow-hidden rounded-2xl border border-[var(--color-neutral-200)] bg-white">
            <Image
              src="/images/landing/hero-prenatal-consultation.jpg"
              alt="Pregnancy consultation in a supportive care setting"
              width={3870}
              height={2580}
              priority
              className="h-auto w-full"
            />
          </div>
        </article>

        <aside className="bc-card space-y-4 p-6 md:p-7">
          <h2 className="text-lg font-semibold">Why people choose BloomCycle</h2>
          <div className="space-y-3">
            <article className="rounded-2xl border border-[var(--color-primary-200)] bg-[var(--color-primary-50)] p-4">
              <p className="text-xs font-semibold text-[var(--color-primary-700)]">Private and secure</p>
              <p className="mt-1 text-sm bc-muted">User-scoped records and authenticated access with Supabase + RLS.</p>
            </article>
            <article className="rounded-2xl border border-[var(--color-support-200)] bg-[var(--color-support-50)] p-4">
              <p className="text-xs font-semibold text-[var(--color-support-600)]">Actionable insights</p>
              <p className="mt-1 text-sm bc-muted">Charts and summaries convert logs into easy-to-read patterns.</p>
            </article>
            <article className="rounded-2xl border border-[var(--color-accent-200)] bg-[var(--color-accent-50)] p-4">
              <p className="text-xs font-semibold text-[#8a251f]">Every stage supported</p>
              <p className="mt-1 text-sm bc-muted">Cycle tracking, TTC support, pregnancy tools, and educational content.</p>
            </article>
          </div>
          <Link href="/health/supabase" className="text-sm font-medium text-[var(--color-primary-700)] underline">
            Check system connection
          </Link>
        </aside>
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-3">
        <article className="bc-card p-5 text-center">
          <p className="text-2xl font-semibold">All-in-one</p>
          <p className="mt-1 text-sm bc-muted">Cycle, pregnancy, learning, and community in one dashboard.</p>
        </article>
        <article className="bc-card p-5 text-center">
          <p className="text-2xl font-semibold">Private by default</p>
          <p className="mt-1 text-sm bc-muted">Supabase-backed auth and user-scoped records with RLS policies.</p>
        </article>
        <article className="bc-card p-5 text-center">
          <p className="text-2xl font-semibold">Stage-aware</p>
          <p className="mt-1 text-sm bc-muted">Insights and recommendations adapt to your current health journey.</p>
        </article>
      </section>

      <section className="mt-5 space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Choose your starting path</h2>
          <p className="text-sm bc-muted">Set your goal in onboarding and BloomCycle personalizes your tracking journey.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {highlights.map((item) => (
            <article key={item.title} className="bc-card space-y-3 p-6">
              <Image
                src={item.image}
                alt={item.alt}
                width={item.width}
                height={item.height}
                className="h-36 w-full rounded-xl border border-[var(--color-neutral-200)] object-cover"
              />
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm bc-muted">{item.text}</p>
              <Link href={item.href} className="text-sm font-medium text-[var(--color-primary-700)] underline">{item.label}</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-2">
        <article className="bc-card space-y-4 p-6">
          <h2 className="text-xl font-semibold">How BloomCycle works</h2>
          <div className="space-y-3 text-sm bc-muted">
            <p><strong className="text-[var(--color-neutral-800)]">1. Set your goal:</strong> choose cycle tracking, TTC, or pregnancy stage.</p>
            <p><strong className="text-[var(--color-neutral-800)]">2. Log consistently:</strong> add periods, symptoms, and health check-ins in minutes.</p>
            <p><strong className="text-[var(--color-neutral-800)]">3. Learn patterns:</strong> view trend charts and recommendations on your dashboard.</p>
          </div>
          <Link href="/onboarding" className="bc-btn-secondary inline-flex w-fit items-center gap-2 text-sm">
            Start onboarding
          </Link>
        </article>

        <article className="bc-card space-y-4 p-6">
          <h2 className="text-xl font-semibold">What you can do today</h2>
          <div className="grid gap-3 text-sm">
            <Link href="/cycle/symptoms" className="rounded-xl border border-[var(--color-neutral-200)] bg-white px-4 py-3 hover:bg-[var(--color-neutral-100)]">
              Log a symptom update
            </Link>
            <Link href="/pregnancy/kick-counter" className="rounded-xl border border-[var(--color-neutral-200)] bg-white px-4 py-3 hover:bg-[var(--color-neutral-100)]">
              Start kick counter
            </Link>
            <Link href="/learn" className="rounded-xl border border-[var(--color-neutral-200)] bg-white px-4 py-3 hover:bg-[var(--color-neutral-100)]">
              Read personalized learning content
            </Link>
            <Link href="/community" className="rounded-xl border border-[var(--color-neutral-200)] bg-white px-4 py-3 hover:bg-[var(--color-neutral-100)]">
              Join community conversations
            </Link>
          </div>
        </article>
      </section>

      <section className="mt-5">
        <article className="overflow-hidden rounded-[1.25rem] border border-[var(--color-primary-700)] bg-gradient-to-r from-[var(--color-primary-700)] via-[var(--color-primary-600)] to-[var(--color-primary-500)] p-6 text-white shadow-[var(--shadow-soft)] md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-wide text-white">BloomCycle Plus Banner</p>
              <h2 className="text-2xl font-semibold leading-tight">One app for your full reproductive health journey.</h2>
              <p className="max-w-2xl text-sm text-white">Start with free tracking today and build high-quality personal data that supports better care conversations tomorrow.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {isLoggedIn ? (
                <Link href="/dashboard" className="rounded-xl bg-[var(--color-accent-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-accent-600)]">
                  Open dashboard
                </Link>
              ) : (
                <>
                  <Link href="/signup" className="rounded-xl bg-[var(--color-accent-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-accent-600)]">
                    Create account
                  </Link>
                  <Link href="/login" className="rounded-xl border border-white/60 px-4 py-2 text-sm font-semibold text-white">
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </article>
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-3">
        <article className="bc-card p-6">
          <p className="text-sm font-semibold text-[var(--color-primary-700)]">Secure records</p>
          <p className="mt-2 text-sm bc-muted">All user data is scoped per account. You control what to log and export.</p>
        </article>
        <article className="bc-card p-6">
          <p className="text-sm font-semibold text-[var(--color-support-600)]">Medical context ready</p>
          <p className="mt-2 text-sm bc-muted">Bring cleaner logs into appointments for more informed clinician conversations.</p>
        </article>
        <article className="bc-card p-6">
          <p className="text-sm font-semibold text-[#8a251f]">Designed for consistency</p>
          <p className="mt-2 text-sm bc-muted">Simple daily actions reduce drop-off and improve long-term trend visibility.</p>
        </article>
      </section>

      <section className="mt-5">
        <article className="bc-card space-y-3 p-6 text-center">
          <h2 className="text-xl font-semibold">Ready to get started?</h2>
          <p className="mx-auto max-w-2xl text-sm bc-muted">Create your profile, set your goal, and start logging in under two minutes.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {isLoggedIn ? (
              <Link href="/dashboard" className="bc-btn-primary text-sm">Go to dashboard</Link>
            ) : (
              <>
                <Link href="/signup" className="bc-btn-primary text-sm">Create free account</Link>
                <Link href="/login" className="bc-btn-secondary text-sm">I already have an account</Link>
              </>
            )}
          </div>
        </article>
      </section>
    </main>
  );
}
