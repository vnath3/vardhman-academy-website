import { test, expect } from '@playwright/test';
import { stubAnalytics } from './analytics.mjs';

test.beforeEach(async ({ page }, info) => {
  await stubAnalytics(page);
  page.on('pageerror', error => info.annotations.push({ type: 'pageerror', description: error.message }));
});
test.afterEach(async ({}, info) => {
  expect(info.annotations.filter(item => item.type === 'pageerror')).toEqual([]);
});

for (const width of [1280, 390]) {
  test(`gallery expands, collapses and resets filters accessibly at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const videos = []; page.on('request', request => { if (request.url().includes('.mp4')) videos.push(request.url()); });
    await page.goto('/');
    const initial = width <= 520 ? 1 : 3;
    const toggle = page.locator('#galleryToggle');
    await expect(page.locator('.gallery-card')).toHaveCount(10);
    await expect(page.locator('.gallery-card:visible')).toHaveCount(initial);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#gallerySummary')).toHaveText(`Showing ${initial} of 10 moments`);
    await toggle.focus(); await page.keyboard.press('Enter');
    await expect(toggle).toHaveText('Show fewer');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('.gallery-card:visible')).toHaveCount(10);
    await toggle.click();
    await expect(toggle).toBeFocused();
    await expect(page.locator('.gallery-card:visible')).toHaveCount(initial);
    await page.locator('[data-category="activities"].gallery-tab').click();
    await expect(page.locator('#gallerySummary')).toHaveText(`Showing ${initial} of 7 moments`);
    await toggle.click(); await expect(page.locator('.gallery-card:visible')).toHaveCount(7);
    await page.locator('[data-category="community"].gallery-tab').click();
    await expect(toggle).toBeHidden();
    await expect(page.locator('.gallery-card:visible')).toHaveCount(1);
    await page.locator('[data-category="all"].gallery-tab').click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('.gallery-card:visible')).toHaveCount(initial);
    await toggle.click();
    await page.setViewportSize({ width: width === 390 ? 1280 : 390, height: 900 });
    await expect(page.locator('.gallery-card:visible')).toHaveCount(10);
    await toggle.click();
    await expect(page.locator('.gallery-card:visible')).toHaveCount(width === 390 ? 3 : 1);
    expect(videos).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width === 390 ? 1280 : 390);
  });

  test(`journey icons animate, pause and respect reduced motion at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const stage = page.locator('#journeyStage'), icon = page.locator('#decoA'), control = page.locator('#journeyMotion');
    await stage.scrollIntoViewIfNeeded();
    await expect.poll(() => stage.evaluate(element => getComputedStyle(element).transform)).toMatch(/^(none|matrix\(1, 0, 0, 1, 0, 0\))$/);
    await expect(control).toHaveText('Pause icons'); await expect(control).toBeEnabled();
    const relativeTop = () => icon.evaluate(element => element.getBoundingClientRect().top - element.parentElement.getBoundingClientRect().top);
    const first = await relativeTop();
    await expect.poll(async () => Math.abs(await relativeTop() - first)).toBeGreaterThan(.2);
    await control.click(); await expect(control).toHaveText('Resume icons');
    const pausedDelta = await icon.evaluate(async element => {
      const relative = () => element.getBoundingClientRect().top - element.parentElement.getBoundingClientRect().top;
      const start = relative();
      await new Promise(resolve => setTimeout(resolve, 250));
      return Math.abs(relative() - start);
    });
    expect(pausedDelta).toBeLessThan(.1);
    await control.click(); await expect(control).toHaveText('Pause icons');
    const resumed = await relativeTop();
    await expect.poll(async () => Math.abs(await relativeTop() - resumed)).toBeGreaterThan(.2);
    await page.locator('#gradeTrack button').filter({ hasText: /^10$/ }).click();
    await expect(page.locator('#stageNumber')).toHaveText('10');
    const contained = await stage.evaluate(element => {
      const box = element.getBoundingClientRect();
      return [...element.querySelectorAll('.stage-deco')].every(icon => {
        const rect = icon.getBoundingClientRect();
        return rect.left >= box.left && rect.right <= box.right && rect.top >= box.top && rect.bottom <= box.bottom;
      });
    });
    expect(contained).toBe(true);
    expect(await stage.evaluate(element => element.scrollLeft)).toBe(0);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(control).toHaveText('Motion off'); await expect(control).toBeDisabled();
    expect(await icon.evaluate(element => getComputedStyle(element).animationName)).toBe('none');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect(control).toHaveText('Pause icons'); await expect(control).toBeEnabled();
  });
}

test('navigation wraps and centers at desktop widths and opens on tablets and 390px mobile', async ({ page }) => {
  test.setTimeout(60000);
  await page.goto('/'); await page.evaluate(() => document.fonts.ready);
  for (const width of [1440, 1280, 1100, 1051, 1024, 820, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => scrollTo(0, 0));
    const mobile = width <= 1050;
    if (mobile) { await expect(page.locator('#mobileToggle')).toBeVisible(); await page.locator('#mobileToggle').click(); }
    else await expect(page.locator('#mobileToggle')).toBeHidden();
    await expect(page.locator('#navLinks')).toBeVisible();
    const alignment = await page.locator('#navLinks a').evaluateAll(links => links.map(link => {
      const box = link.getBoundingClientRect(), range = document.createRange(); range.selectNodeContents(link);
      return { text: link.textContent, centered: getComputedStyle(link).textAlign === 'center', contained: box.left >= 0 && box.right <= innerWidth,
        linesCentered: [...range.getClientRects()].every(rect => Math.abs((rect.left + rect.right - box.left - box.right) / 2) < 3) };
    }));
    expect(alignment.every(item => item.centered && item.contained && item.linesCentered), `${width}px: ${JSON.stringify(alignment)}`).toBeTruthy();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    await page.locator('#navLinks a[href="#journey"]').click();
    if (mobile) { await expect(page.locator('#mobileToggle')).toHaveAttribute('aria-expanded', 'false'); await expect(page.locator('#navLinks')).toBeHidden(); }
  }
});
