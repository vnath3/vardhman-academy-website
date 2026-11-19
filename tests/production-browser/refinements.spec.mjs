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
    await page.locator('#navLinks a[href="#first-month"]').click();
    if (mobile) { await expect(page.locator('#mobileToggle')).toHaveAttribute('aria-expanded', 'false'); await expect(page.locator('#navLinks')).toBeHidden(); }
  }
});
