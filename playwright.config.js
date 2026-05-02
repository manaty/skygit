import { defineConfig, devices } from '@playwright/test';

const skipWebServer = process.env.PLAYWRIGHT_SKIP_WEB_SERVER === '1';

export default defineConfig({
  testDir: './test/e2e',
  fullyParallel: true,
  reporter: [['list']],
  use: {
    trace: 'retain-on-failure'
  },
  webServer: skipWebServer
    ? undefined
    : {
        command: 'npm run dev -- --host 127.0.0.1',
        url: 'http://127.0.0.1:5173/',
        reuseExistingServer: !process.env.CI,
        timeout: 120000
      },
  projects: [
    {
      name: 'api',
      testMatch: /api\/.*\.spec\.js/
    },
    {
      name: 'ui',
      testMatch: /ui\/.*\.spec\.js/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://127.0.0.1:5173/'
      }
    }
  ]
});
