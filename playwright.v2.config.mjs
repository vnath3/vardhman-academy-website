import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/v2-browser',
  outputDir: 'test-results-v2',
  workers: 1,
  fullyParallel: false,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5176',
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  },
  projects: [
    { name: 'Chrome', testMatch: 'site.spec.mjs', use: { browserName: 'chromium', launchOptions: { channel: 'chrome' } } },
    { name: 'Edge', testMatch: 'edge.spec.mjs', use: { browserName: 'chromium', launchOptions: { channel: 'msedge' } } }
  ],
  webServer: {
    command: 'node scripts/serve-v2.mjs --port 5176',
    url: 'http://127.0.0.1:5176',
    reuseExistingServer: false
  }
});
