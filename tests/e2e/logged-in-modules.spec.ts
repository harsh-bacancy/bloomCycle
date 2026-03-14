import { expect, test } from '@playwright/test';

type RouteCase = {
  name: string;
  path: string;
  marker: string;
};

const loggedInRoutes: RouteCase[] = [
  { name: 'Dashboard', path: '/dashboard', marker: 'Welcome' },
  { name: 'Insights', path: '/insights', marker: 'Advanced health pattern insights' },
  { name: 'Cycle', path: '/cycle', marker: 'Cycle' },
  { name: 'Symptoms', path: '/cycle/symptoms', marker: 'Daily symptom tracking' },
  { name: 'Pregnancy', path: '/pregnancy', marker: 'Pregnancy' },
  { name: 'Kick Counter', path: '/pregnancy/kick-counter', marker: 'Kick' },
  { name: 'Contraction Timer', path: '/pregnancy/contraction-timer', marker: 'Contraction' },
  { name: 'Learn', path: '/learn', marker: 'Educational content library' },
  { name: 'Community', path: '/community', marker: 'Posts feed' },
  { name: 'Appointments', path: '/appointments', marker: 'Manage healthcare appointments' },
  { name: 'Medications', path: '/medications', marker: 'Medications' },
  { name: 'Reminders', path: '/reminders', marker: 'Reminders' },
  { name: 'Data Export', path: '/settings/data-export', marker: 'Export your cycle and pregnancy records' },
  { name: 'Onboarding', path: '/onboarding', marker: 'Set up your BloomCycle profile' },
  { name: 'Supabase Health', path: '/health/supabase', marker: 'Supabase connection status' },
];

const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;
const hasCredentials = Boolean(email && password);

test.describe('BloomCycle logged-in module checks', () => {
  test.skip(!hasCredentials, 'Set E2E_EMAIL and E2E_PASSWORD to run logged-in module checks.');

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(email!);
    await page.getByLabel('Password').fill(password!);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(/\/dashboard|\/onboarding/, { timeout: 20_000 });
  });

  for (const route of loggedInRoutes) {
    test(`Logged-in module: ${route.name} (${route.path})`, async ({ page }) => {
      await page.goto(route.path);
      await expect(page).not.toHaveURL(/\/login/);
      await expect(page.getByRole('main')).toContainText(route.marker);
    });
  }
});
