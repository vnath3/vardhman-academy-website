import { test, expect } from '@playwright/test';
import { stubAnalytics } from './analytics.mjs';

test.beforeEach(async ({ page }) => { await stubAnalytics(page); });

async function prepareDraft(page, goal) {
  await page.locator('#classSelect button').filter({ hasText: /^8$/ }).click();
  await page.locator('#classNext').click();
  await page.locator('#concernOptions button').first().click();
  await page.locator('#concernNext').click();
  await page.locator('#childNote').fill(goal);
  await page.locator('#noteNext').click();
}

for (const width of [1440, 390]) {
  test(`approved WhatsApp draft opens only after explicit action at ${width}px`, async ({ page, context }) => {
    const goal = 'Synthetic goal: fractions & confidence? <not markup> 🙂';
    // Fictional reserved example number, intercepted locally. No real contact.
    await page.route('**/site-settings.js', route => route.fulfill({ contentType: 'text/javascript', body: 'window.VARDHAMAN_SITE={privateReview:false,whatsappNumber:"12025550123"};' }));
    const outgoing = [];
    await context.route('https://wa.me/**', route => { outgoing.push(route.request().url()); return route.fulfill({ contentType: 'text/html', body: '<title>Local WhatsApp handoff fixture</title>' }); });
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.locator('#whatsappEnquiry')).toBeHidden();
    await prepareDraft(page, goal);
    const link = page.locator('#whatsappEnquiry');
    await expect(link).toBeVisible();
    expect(outgoing).toEqual([]);
    await expect(link).not.toHaveAttribute('href', /./);
    await expect(page.locator('#enquirySummary')).toContainText(goal);
    await expect(page.locator('#enquirySummary script, #enquirySummary img')).toHaveCount(0);
    await expect(page.locator('.form-step.active .privacy-note').last()).toContainText('press Send there');
    const opened = context.waitForEvent('page');
    await link.click();
    const whatsapp = await opened;
    await whatsapp.waitForLoadState();
    expect(outgoing).toHaveLength(1);
    const url = new URL(outgoing[0]);
    expect(url.origin).toBe('https://wa.me');
    expect(url.pathname).toBe('/12025550123');
    expect(url.searchParams.get('text')).toContain(goal);
    expect(url.searchParams.get('text')).toContain('Class: 8');
    expect(await page.evaluate(() => JSON.stringify(window.dataLayer))).not.toContain(goal);
    await expect(page.locator('#whatsappStatus')).toContainText('cannot confirm delivery');
    await whatsapp.close();
    await page.locator('.form-step.active [data-back]').click();
    await expect(link).not.toHaveAttribute('href', /./);
    await page.locator('#childNote').fill('Edited synthetic goal');
    await page.locator('#noteNext').click();
    const editedPopup = context.waitForEvent('page');
    await link.click();
    const edited = await editedPopup; await edited.waitForLoadState();
    expect(new URL(outgoing[1]).searchParams.get('text')).toContain('Edited synthetic goal');
    await edited.close();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  });
}

test('story dialog contains focus and leaves sample claims clearly labelled', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.story-note')).toContainText('not verified alumni testimonials');
  const trigger = page.locator('.story-card').first();
  await trigger.click();
  await expect(page.locator('main')).toHaveAttribute('inert', '');
  await page.keyboard.press('Shift+Tab');
  await expect(page.locator('#modalEnd')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('#modalClose')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('main')).not.toHaveAttribute('inert', '');
  await expect(trigger).toBeFocused();
});
