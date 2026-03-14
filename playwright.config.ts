import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:3000',
  },
  webServer: {
    command: 'npm run build && PORT=3000 npm run start',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: true,
    timeout: 240_000,
  },
});
