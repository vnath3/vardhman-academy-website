import { test, expect } from '@playwright/test';

test('Edge mobile viewport smoke: menu, gallery dialog, class selector and quiz', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.locator('#mobileToggle').click();
  await page.locator('#navLinks a[href="#life-at-vardhaman"]').click();
  await expect(page.locator('#mobileToggle')).toHaveAttribute('aria-expanded', 'false');
  await page.locator('.gallery-tab[data-category="achievements"]').click();
  await expect(page.locator('.gallery-card:visible')).toHaveCount(2);
  await page.locator('[data-media="IMG-18"]').click();
  await expect(page.locator('#mediaModal img')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.locator('#gradeTrack button').filter({ hasText: /^9$/ }).click();
  await expect(page.locator('#stageNumber')).toHaveText('9');
  await page.locator('#quizChoices button').nth(1).click();
  await expect(page.locator('#quizFeedback')).toContainText('Well spotted!');
});
