import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';

const output = 'qa/visual/details';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const results = [];
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: width === 1440 ? 900 : 844 }, reducedMotion: 'reduce' });
    await context.route('https://fonts.googleapis.com/**', route => route.fulfill({ path: 'src/v2/fonts.css', contentType: 'text/css' }));
    await context.route('https://fonts.googleapis.com/fonts/**', route => route.fulfill({ path: `src/v2/fonts/${new URL(route.request().url()).pathname.split('/').at(-1)}`, contentType: 'font/woff2' }));
    const reference = await context.newPage(), implementation = await context.newPage();
    const pages = [['reference', reference], ['implementation', implementation]];
    for (const [label, page] of pages) {
      await page.goto(label === 'reference' ? 'http://127.0.0.1:4173' : 'http://127.0.0.1:5174', { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      for (const reveal of await page.locator('.reveal').all()) await reveal.scrollIntoViewIfNeeded();
      for (const image of await page.locator('img').all()) {
        await image.scrollIntoViewIfNeeded();
        await image.evaluate(image => image.decode().catch(() => {}));
      }
    }
    const checkpoints = [
      ['hero-full', '#home'], ['mentor-full', '#about'], ['gallery-full', '#life-at-vardhaman'],
      ['stories-full', '#stories', page => page.locator('#storyFilters [data-filter="personal"]').click()],
      ['class-5-full', '#journey'],
      ['class-9-full', '#journey', page => page.locator('#gradeTrack button').filter({ hasText: /^9$/ }).click()],
      ['class-10-full', '#journey', page => page.locator('#gradeTrack button').filter({ hasText: /^10$/ }).click()],
      ['quiz-full', '#brainlab', page => page.locator('#quizChoices button').nth(1).click()],
      ['enquiry-1-full', '#enquiry'],
      ['enquiry-2-full', '#enquiry', async page => { await page.locator('#classSelect button').filter({ hasText: /^5$/ }).click(); await page.locator('#classNext').click(); }],
      ['enquiry-3-full', '#enquiry', async page => { await page.locator('#concernOptions button').first().click(); await page.locator('#concernNext').click(); }],
      ['enquiry-4-full', '#enquiry', page => page.locator('#noteNext').click()]
    ];
    for (const [name, selector, action] of checkpoints) {
      const shots = [];
      for (const [label, page] of pages) {
        await page.bringToFront();
        if (action) await action(page);
        await page.mouse.move(5, 5);
        await page.waitForTimeout(100);
        // Fixed/sticky viewport chrome otherwise appears at a different point inside
        // an element screenshot as Playwright scrolls tall sections into capture.
        // Its real behavior is covered by the unmodified viewport comparisons.
        shots.push(await page.locator(selector).screenshot({
          path: `${output}/${label}-${width}-${name}.png`, animations: 'disabled',
          style: '.site-header, .reading-progress, .mobile-bottom { visibility: hidden !important; } .form-lead { position: static !important; }'
        }));
      }
      const a = await sharp(shots[0]).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      const b = await sharp(shots[1]).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      let changed = 0;
      const dimensionsMatch = a.info.width === b.info.width && a.info.height === b.info.height;
      if (dimensionsMatch) {
        for (let i = 0; i < a.data.length; i += 4) if ([0, 1, 2].some(c => Math.abs(a.data[i + c] - b.data[i + c]) > 12)) changed++;
      }
      await sharp({ create: { width: a.info.width + b.info.width, height: Math.max(a.info.height, b.info.height), channels: 4, background: '#fff' } })
        .composite([{ input: shots[0], left: 0, top: 0 }, { input: shots[1], left: a.info.width, top: 0 }])
        .png().toFile(`${output}/pair-${width}-${name}.png`);
      const changedPercent = dimensionsMatch ? changed * 100 / (a.info.width * a.info.height) : null;
      results.push({ width, name, dimensionsMatch, changedPixels: changed, changedPercent, status: dimensionsMatch && changedPercent < 0.5 ? 'PASS' : 'REVIEW' });
    }
    await context.close();
    console.log(`Full-section comparisons completed at ${width}px.`);
  }
} finally { await browser.close(); }
await writeFile(`${output}/comparison.json`, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results));
