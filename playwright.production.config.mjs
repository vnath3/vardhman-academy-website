import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/production-browser',
  outputDir: 'test-results-production',
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5178',
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  },
  projects: [
    { name: 'Chrome', use: { browserName: 'chromium', channel: 'chrome' } },
    { name: 'Edge', use: { browserName: 'chromium', channel: 'msedge' }, grep: /390px/ }
  ],
  webServer: {
    // Deliberately does not build: exercise the exact artifact being reviewed.
    command: 'node scripts/preview-production.mjs --port 5178',
    url: 'http://127.0.0.1:5178',
    reuseExistingServer: false
  }
});
