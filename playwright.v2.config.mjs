import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/v2-browser',
  outputDir: 'test-results-v2',
  workers: 1,
  fullyParallel: false,
  timeout: process.env.V2_MOTION_BASE_URL ? 120000 : 30000,
  reporter: 'list',
  use: {
    baseURL: process.env.V2_MOTION_BASE_URL || 'http://127.0.0.1:5176',
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  },
  projects: [
    { name: 'Chrome', testMatch: ['site.spec.mjs', 'stories.spec.mjs', 'motion.spec.mjs'], use: { browserName: 'chromium', launchOptions: { channel: 'chrome' } } },
    { name: 'Edge', testMatch: ['edge.spec.mjs', 'stories.spec.mjs', 'motion.spec.mjs'], grep: /390px|Edge mobile/, use: { browserName: 'chromium', launchOptions: { channel: 'msedge' } } }
  ],
  webServer: process.env.V2_MOTION_BASE_URL ? undefined : {
    command: 'node scripts/serve-v2.mjs --port 5176',
    url: 'http://127.0.0.1:5176',
    reuseExistingServer: false
  }
});
