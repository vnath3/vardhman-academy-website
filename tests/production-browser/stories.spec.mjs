import { test, expect } from '@playwright/test';
import { stubAnalytics } from './analytics.mjs';

test.beforeEach(async ({ page }) => { await stubAnalytics(page); });

for (const width of [1440, 768, 390, 320]) {
  test(`story carousel synchronizes keyboard focus, controls, filters and resize at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    // Exercise real slide transitions on mobile as well as reduced motion.
    if (width === 390) await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    const cards = page.locator('.story-card');
    const viewport = page.locator('.story-viewport');
    const perView = width <= 520 ? 1 : width <= 1050 ? 2 : 3;
    const activeGroup = index => expect(page.locator('#storyDots button.active')).toHaveAttribute('aria-label', `View story group ${index + 1}`);
    const cardIsVisible = async index => {
      await expect.poll(() => cards.nth(index).evaluate(card => {
        const box = card.getBoundingClientRect(), view = card.closest('.story-viewport').getBoundingClientRect();
        return box.left >= view.left - 1 && box.right <= view.right + 1;
      })).toBeTruthy();
      await expect.poll(() => viewport.evaluate(element => element.scrollLeft)).toBe(0);
    };

    await cards.first().focus();
    for (let index = 0; index < 5; index++) {
      if (index) await page.keyboard.press('Tab');
      await expect(cards.nth(index)).toBeFocused();
      await cardIsVisible(index);
      await activeGroup(Math.max(0, index - perView + 1));
    }
    await expect(page.locator('#storyNext')).toBeDisabled();
    // Moving back through offscreen cards must also move the visible group.
    for (let index = 3; index >= 0; index--) {
      await page.keyboard.press('Shift+Tab');
      await expect(cards.nth(index)).toBeFocused();
      await cardIsVisible(index);
    }
    await activeGroup(0);

    // Original failure: keyboard-scroll to the last card, then click Next.
    for (let index = 0; index < 4; index++) await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');
    const current = Number((await page.locator('#storyDots button.active').getAttribute('aria-label')).match(/\d+/)[0]) - 1;
    await page.locator('#storyPrev').click();
    await activeGroup(current - 1);
    await cardIsVisible(current - 1);
    await page.locator('#storyNext').click();
    await activeGroup(current);
    await cardIsVisible(current);
    await page.locator('#storyDots button').first().click();
    await cardIsVisible(0);
    await page.locator('#storyNext').click();
    await activeGroup(1);
    await cardIsVisible(1);

    // Dialog focus return must preserve the current card/group.
    await cards.nth(1).click();
    await page.keyboard.press('Escape');
    await expect(cards.nth(1)).toBeFocused();
    await cardIsVisible(1);
    await page.locator('#storyFilters [data-filter="personal"]').click();
    await expect(cards).toHaveCount(2);
    await activeGroup(0);
    await cardIsVisible(0);
    await page.locator('#storyFilters [data-filter="all"]').click();
    await cards.last().focus();
    await cardIsVisible(4);
    await page.setViewportSize({ width: width > 520 ? 390 : 1440, height: 900 });
    await cardIsVisible(4);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width > 520 ? 390 : 1440);
  });
}
