import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/production-browser',
  testMatch: 'refinements.spec.mjs',
  outputDir: 'test-results-engines',
  workers: 1,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:5179', reducedMotion: 'reduce', screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  projects: [
    { name: 'Firefox', use: { browserName: 'firefox' } },
    { name: 'WebKit', use: { browserName: 'webkit' } }
  ],
  webServer: { command: 'node scripts/preview-production.mjs --port 5179', url: 'http://127.0.0.1:5179', reuseExistingServer: false }
});
