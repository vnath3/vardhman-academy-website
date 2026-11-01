import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { readV2Manifest } from '../../scripts/contracts.mjs';
import { planMedia } from '../../src/v2-media.mjs';

const publicPlan = planMedia(await readV2Manifest());

for (const width of [1440, 768, 390, 320]) {
  test(`production V2 loads all assets and retains its interactions at ${width}px`, async ({ page, context }) => {
    await page.setViewportSize({ width, height: width === 1440 ? 900 : 844 });
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const errors = [], failures = [], requests = [], csp = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) failures.push(response.url()); });
    page.on('requestfailed', request => failures.push(request.url()));
    page.on('request', request => requests.push({ url: request.url(), method: request.method() }));
    await page.exposeFunction('recordCspViolation', event => csp.push(event));
    await page.addInitScript(() => document.addEventListener('securitypolicyviolation', event => window.recordCspViolation(event.violatedDirective)));
    await page.goto('/');
    await expect(page).toHaveTitle(/Vardhaman Academy/);
    await expect(page.locator('html')).toHaveAttribute('data-media-review', 'approved-only');
    await expect(page.locator('.official-logo-crop').first()).toBeVisible();
    await expect(page.locator('.mentor-portrait')).toBeVisible();
    await expect(page.locator('.mentor-event-photo')).toBeVisible();
    await expect(page.locator('.teacher-photo-note')).toContainText('External event, not hosted by Vardhaman Academy');
    await expect(page.locator('.portrait-monogram')).toHaveCount(0);
    await expect(page.locator('.v2-review-flag')).toHaveCount(0);
    await expect(page.locator('.gallery-footnote')).toHaveCount(0);
    await expect(page.locator('.gallery-card')).toHaveCount(publicPlan.runtime.gallery.length);
    if (!publicPlan.runtime.gallery.length) await expect(page.locator('.gallery-empty')).toContainText('shared here with permission');
    for (const selector of ['#home', '#parents', '#about', '#life-at-vardhaman', '#stories', '#approach', '#journey', '#brainlab', '#enquiry', '.faq', '.footer']) {
      await page.locator(selector).scrollIntoViewIfNeeded();
      await expect(page.locator(selector)).toBeVisible();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    for (const img of await page.locator('img').all()) {
      await img.scrollIntoViewIfNeeded();
      await expect.poll(() => img.evaluate(item => item.complete && item.naturalWidth > 0)).toBeTruthy();
    }
    expect(await page.locator('.mentor-portrait').evaluate(item => getComputedStyle(item).objectPosition)).toBe('9% 50%');
    expect(await page.locator('.mentor-event-photo').evaluate(item => getComputedStyle(item).objectPosition)).toBe('30% 50%');
    const loadedFonts = await page.evaluate(async () => {
      // Explicitly load the checked weights: unused faces remain unloaded even
      // after fonts.ready, while the page legitimately uses Outfit 800/900.
      const faces = await Promise.all(['400 16px "DM Sans"', '800 16px Outfit'].map(font => document.fonts.load(font, 'Vardhaman Academy')));
      return faces.map(items => items.map(face => face.status));
    });
    expect(loadedFonts).toEqual([['loaded'], ['loaded']]);
    for (const category of ['activities', 'achievements', 'community', 'all']) {
      const tab = page.locator(`.gallery-tab[data-category="${category}"]`);
      await tab.click();
      await expect(tab).toHaveAttribute('aria-pressed', 'true');
      const count = publicPlan.runtime.gallery.filter(item => category === 'all' || item.category === category).length;
      await expect(page.locator('.gallery-card:visible')).toHaveCount(count);
      if (!count) await expect(page.locator('.gallery-empty')).toBeVisible();
    }
    await page.evaluate(() => scrollTo(0, 0));
    if (width <= 780) {
      await page.locator('#mobileToggle').click();
      await page.locator('#navLinks a[href="#journey"]').click();
      await expect(page.locator('#mobileToggle')).toHaveAttribute('aria-expanded', 'false');
    }
    await page.locator('#gradeTrack button').filter({ hasText: /^10$/ }).click();
    await expect(page.locator('#stageNumber')).toHaveText('10');
    await page.locator('#nextGrade').click();
    await expect(page.locator('#stageNumber')).toHaveText('5');
    await page.locator('#prevGrade').click();
    await expect(page.locator('#stageNumber')).toHaveText('10');
    await page.locator('#levelSwitch [data-level="middle"]').click();
    for (const answer of [1, 3, 0]) {
      await page.locator('#quizChoices button').nth(answer).click();
      await expect(page.locator('#quizFeedback')).toContainText('Well spotted!');
      await page.locator('#quizNext').click();
    }
    await expect(page.locator('#resultText')).toContainText('3 correct answers');
    await page.locator('#quizAgain').click();
    await expect(page.locator('#quizCount')).toHaveText('Question 1 of 3');
    await page.locator('#storyFilters [data-filter="personal"]').click();
    await expect(page.locator('.story-card')).toHaveCount(2);
    const story = page.locator('.story-card').first();
    await story.click();
    await expect(page.locator('#storyModal')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(story).toBeFocused();
    await page.locator('.hero-actions a.primary').click();
    await expect(page).toHaveURL(/#enquiry$/);
    await page.locator('#classNext').click();
    await expect(page.locator('#classValidation')).toContainText('Please choose');
    await page.locator('#classSelect button').filter({ hasText: /^9$/ }).click();
    await page.locator('#classNext').click();
    await page.locator('#concernOptions button').first().click();
    await page.locator('#concernNext').click();
    await page.locator('#childNote').fill('Synthetic production regression goal.');
    await page.locator('#noteNext').click();
    await expect(page.locator('#enquirySummary')).toContainText('Class: 9');
    await page.locator('#copyEnquiry').click();
    await expect(page.locator('#copyStatus')).toContainText('Message copied');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('Synthetic production regression goal.');
    await page.locator('.faq-item button').nth(2).click();
    await expect(page.locator('.faq-item button').nth(2)).toHaveAttribute('aria-expanded', 'true');
    expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length, cookies: document.cookie }))).toEqual({ local: 0, session: 0, cookies: '' });
    expect(requests.every(request => request.method === 'GET' && request.url.startsWith('http://127.0.0.1:5178/'))).toBeTruthy();
    const approvedUrls = publicPlan.copies.map(asset => `http://127.0.0.1:5178/${asset.production_path}`);
    expect(requests.filter(request => request.url.includes('/media/')).every(request => approvedUrls.includes(request.url))).toBeTruthy();
    expect(errors).toEqual([]); expect(failures).toEqual([]); expect(csp).toEqual([]);
    await page.reload();
    await expect(page.locator('#childNote')).toHaveValue('');
    await mkdir('qa/visual/production', { recursive: true });
    await page.screenshot({ path: `qa/visual/production/${test.info().project.name}-${width}.png`, fullPage: true });
  });
}

test('KNOWN DEFECT: production V2 passes automated WCAG checks', async ({ page }) => {
  test.fail(true, 'Inherited V2 contrast failures remain; recorded in the readiness report, outside this build-pipeline change.');
  await page.goto('/');
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  await mkdir('qa/visual/production', { recursive: true });
  await writeFile('qa/visual/production/axe.json', JSON.stringify(result, null, 2));
  expect(result.violations.map(item => ({ id: item.id, nodes: item.nodes.length }))).toEqual([]);
});
