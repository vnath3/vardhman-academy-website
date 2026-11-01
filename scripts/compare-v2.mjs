import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';

const referenceURL = process.env.REFERENCE_URL || 'http://127.0.0.1:4173';
const implementationURL = process.env.IMPLEMENTATION_URL || 'http://127.0.0.1:5174';
const output = process.env.PARITY_OUTPUT || 'qa/visual/parity';
const checkpoints = [
  ['hero', '#home'], ['parents', '#parents'], ['mentor', '#about'],
  ['gallery', '#life-at-vardhaman'], ['stories', '#stories'], ['values', '#approach'],
  ['classes', '#journey'], ['quiz', '#brainlab'], ['enquiry', '#enquiry'],
  ['faq', '.faq'], ['footer', '.footer']
];

async function ready(page) {
  await page.evaluate(() => document.fonts.ready);
  // Trigger lazy images and the original scroll-reveal observer at each checkpoint.
  for (const [, selector] of checkpoints) {
    await page.locator(selector).scrollIntoViewIfNeeded();
    await page.waitForTimeout(60);
  }
  for (const image of await page.locator('img').all()) {
    await image.scrollIntoViewIfNeeded();
    await image.evaluate(image => image.decode().catch(() => {}));
  }
  await page.evaluate(() => window.scrollTo(0, 0));
}

async function compareBuffers(reference, implementation, file) {
  const a = await sharp(reference).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const b = await sharp(implementation).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  if (a.info.width !== b.info.width || a.info.height !== b.info.height) {
    return { status: 'FAIL', reason: 'Image dimensions differ', reference: a.info, implementation: b.info };
  }
  const diff = Buffer.alloc(a.data.length);
  let changed = 0;
  for (let i = 0; i < a.data.length; i += 4) {
    const delta = Math.max(...[0, 1, 2].map(c => Math.abs(a.data[i + c] - b.data[i + c])));
    if (delta > 12) { changed++; diff[i] = 220; diff[i + 2] = 100; diff[i + 3] = 255; }
    else { diff[i] = diff[i + 1] = diff[i + 2] = 245; diff[i + 3] = 255; }
  }
  await sharp(diff, { raw: { width: a.info.width, height: a.info.height, channels: 4 } }).png().toFile(file);
  const percent = 100 * changed / (a.info.width * a.info.height);
  return { status: percent < 0.5 ? 'PASS' : 'REVIEW', changedPixels: changed, changedPercent: Number(percent.toFixed(4)) };
}

await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
try {
  for (const width of [1440, 390, 768]) {
    const height = width === 1440 ? 900 : width === 390 ? 844 : 1024;
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
    // Replay the exact captured font responses locally for the reference, avoiding
    // variable network font timing while keeping its source HTML/CSS unchanged.
    await context.route('https://fonts.googleapis.com/**', route => route.fulfill({ path: 'src/v2/fonts.css', contentType: 'text/css' }));
    await context.route('https://fonts.googleapis.com/fonts/**', async route => {
      const file = new URL(route.request().url()).pathname.split('/').at(-1);
      await route.fulfill({ path: `src/v2/fonts/${file}`, contentType: 'font/woff2' });
    });
    const reference = await context.newPage(), implementation = await context.newPage();
    const failures = [];
    for (const [label, page, url] of [['reference', reference, referenceURL], ['implementation', implementation, implementationURL]]) {
      page.on('pageerror', error => failures.push({ label, error: error.message }));
      page.on('requestfailed', request => failures.push({ label, url: request.url(), error: request.failure()?.errorText }));
      page.on('response', response => { if (response.status() >= 400) failures.push({ label, url: response.url(), status: response.status() }); });
      await page.goto(url, { waitUntil: 'networkidle' });
      await ready(page);
      await page.screenshot({ path: `${output}/${label}-${width}-full.png`, fullPage: true });
    }
    const metrics = {};
    for (const [label, page] of [['reference', reference], ['implementation', implementation]]) {
      metrics[label] = await page.evaluate(checkpoints => ({
        width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
        sections: checkpoints.map(([name, selector]) => {
          const element = document.querySelector(selector), rect = element.getBoundingClientRect();
          return { name, top: rect.top + scrollY, height: rect.height, order: getComputedStyle(element).order };
        })
      }), checkpoints);
    }
    async function capture(name, selector) {
      const shots = [];
      for (const [label, page] of [['reference', reference], ['implementation', implementation]]) {
        await page.bringToFront();
        await page.mouse.move(5, 5);
        if (name === 'hero') await page.evaluate(() => window.scrollTo(0, 0));
        else await page.locator(selector).evaluate(element => window.scrollTo(0, element.getBoundingClientRect().top + scrollY - 88));
        await page.waitForTimeout(100);
        shots.push(await page.screenshot({ path: `${output}/${label}-${width}-${name}.png`, animations: 'disabled' }));
      }
      const diff = await compareBuffers(shots[0], shots[1], `${output}/diff-${width}-${name}.png`);
      await sharp({ create: { width: width * 2, height, channels: 4, background: '#fff' } })
        .composite([{ input: shots[0], left: 0, top: 0 }, { input: shots[1], left: width, top: 0 }])
        .png().toFile(`${output}/pair-${width}-${name}.png`);
      return { name, ...diff };
    }
    const comparisons = [];
    for (const [name, selector] of checkpoints) comparisons.push(await capture(name, selector));
    const states = [
      ['gallery-achievements', '#life-at-vardhaman', page => page.locator('[data-category="achievements"].gallery-tab').click()],
      ['photo-modal', '#life-at-vardhaman', page => page.locator('[data-media="IMG-18"]').click()],
      ['video-modal', '#life-at-vardhaman', async page => { await page.locator('.media-modal-close').click(); await page.locator('[data-category="all"].gallery-tab').click(); await page.locator('[data-media="VID-03"]').click(); await page.locator('video').evaluate(video => new Promise(resolve => { if (video.readyState >= 2) resolve(); else video.addEventListener('loadeddata', resolve, { once: true }); })); }],
      ['stories-personal', '#stories', async page => { await page.locator('.media-modal-close').click(); await page.locator('#storyFilters [data-filter="personal"]').click(); }],
      ['class-9', '#journey', page => page.locator('#gradeTrack button').filter({ hasText: /^9$/ }).click()],
      ['class-10', '#journey', page => page.locator('#gradeTrack button').filter({ hasText: /^10$/ }).click()],
      ['quiz-feedback', '#brainlab', page => page.locator('#quizChoices button').nth(1).click()],
      ['enquiry-step-2', '#enquiry', async page => { await page.locator('#classSelect button').filter({ hasText: /^5$/ }).click(); await page.locator('#classNext').click(); }],
      ['enquiry-step-3', '#enquiry', async page => { await page.locator('#concernOptions button').first().click(); await page.locator('#concernNext').click(); }],
      ['enquiry-step-4', '#enquiry', page => page.locator('#noteNext').click()]
    ];
    for (const [name, selector, action] of states) {
      await reference.bringToFront(); await action(reference);
      await implementation.bringToFront(); await action(implementation);
      comparisons.push(await capture(name, selector));
    }
    results.push({ width, height, metrics, failures, comparisons });
    console.log(`Visual comparison ${width}px: ${JSON.stringify(comparisons)}`);
    await context.close();
  }
} finally { await browser.close(); }
await writeFile(`${output}/comparison.json`, JSON.stringify(results, null, 2));
console.log(`Saved paired screenshots, pixel differences and metrics to ${output}`);
