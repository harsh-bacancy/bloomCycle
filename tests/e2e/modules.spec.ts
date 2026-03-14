import { expect, test } from '@playwright/test';

type RouteCase = {
  name: string;
  path: string;
};

const publicRoutes: RouteCase[] = [
  { name: 'Landing', path: '/' },
  { name: 'Login', path: '/login' },
  { name: 'Signup', path: '/signup' },
  { name: 'Reset Password', path: '/reset-password' },
  { name: 'Update Password', path: '/update-password' },
];

const protectedRoutes: RouteCase[] = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Insights', path: '/insights' },
  { name: 'Cycle', path: '/cycle' },
  { name: 'Symptoms', path: '/cycle/symptoms' },
  { name: 'Pregnancy', path: '/pregnancy' },
  { name: 'Kick Counter', path: '/pregnancy/kick-counter' },
  { name: 'Contraction Timer', path: '/pregnancy/contraction-timer' },
  { name: 'Learn', path: '/learn' },
  { name: 'Community', path: '/community' },
  { name: 'Appointments', path: '/appointments' },
  { name: 'Medications', path: '/medications' },
  { name: 'Reminders', path: '/reminders' },
  { name: 'Data Export', path: '/settings/data-export' },
  { name: 'Onboarding', path: '/onboarding' },
  { name: 'Supabase Health', path: '/health/supabase' },
];

test.describe('BloomCycle module smoke checks', () => {
  for (const route of publicRoutes) {
    test(`Public module: ${route.name} (${route.path})`, async ({ request }) => {
      const res = await request.get(route.path, { failOnStatusCode: false });
      expect(res.status(), `${route.path} should be reachable`).toBe(200);
      const body = await res.text();
      expect(body.length).toBeGreaterThan(0);
    });
  }

  for (const route of protectedRoutes) {
    test(`Protected module redirects when logged out: ${route.name} (${route.path})`, async ({ request }) => {
      const res = await request.get(route.path, {
        failOnStatusCode: false,
        maxRedirects: 0,
      });

      const status = res.status();
      if ([302, 303, 307, 308].includes(status)) {
        const location = res.headers()['location'] ?? '';
        expect(location, `${route.path} redirect should point to login`).toContain('/login');
        return;
      }

      expect(status, `${route.path} should not error when logged out`).toBe(200);
      const body = await res.text();
      expect(body.toLowerCase(), `${route.path} 200 response should show auth-facing content`).toMatch(
        /login|sign up|signup|auth|password/,
      );
    });
  }
});
