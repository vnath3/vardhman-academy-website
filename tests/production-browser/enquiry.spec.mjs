import { test, expect } from '@playwright/test';
import { stubAnalytics } from './analytics.mjs';
import { readV2Settings } from '../../scripts/contracts.mjs';
import { siteRuntime } from '../../src/v2-settings.mjs';

test.beforeEach(async ({ page }) => { await stubAnalytics(page); });

async function prepareDraft(page, goal, grade = 8) {
  await page.locator('#classSelect button').filter({ hasText: new RegExp(`^${grade}$`) }).click();
  await page.locator('#classNext').click();
  await page.locator('#concernOptions button').first().click();
  await page.locator('#concernNext').click();
  await page.locator('#childNote').fill(goal);
  await page.locator('#noteNext').click();
}

for (const width of [1440, 390]) {
  test(`configured WhatsApp contact respects approval at ${width}px`, async ({ page, context }) => {
    const runtime = siteRuntime(await readV2Settings());
    // Exercise the generated artifact's real settings, but intercept the
    // destination before any request can reach WhatsApp or the academy.
    const outgoing = [];
    await context.route('https://wa.me/**', route => {
      outgoing.push(route.request().url());
      return route.fulfill({ contentType: 'text/html', body: '<title>Intercepted configured contact</title>' });
    });
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    expect(await page.evaluate(() => window.VARDHAMAN_SITE)).toEqual(runtime);
    const grade = width === 1440 ? 1 : 4;
    await prepareDraft(page, 'Synthetic configured-contact check.', grade);
    await expect(page.locator('#enquirySummary')).toContainText(`Class: ${grade}`);
    const action = page.locator('#whatsappEnquiry');
    if (!runtime.whatsappNumber) {
      await expect(action).toBeDisabled();
      expect(outgoing).toEqual([]);
      return;
    }
    await expect(action).toBeEnabled();
    const popup = context.waitForEvent('page');
    await action.click();
    const whatsapp = await popup;
    await whatsapp.waitForLoadState();
    expect(outgoing).toHaveLength(1);
    const url = new URL(outgoing[0]);
    expect(url.origin).toBe('https://wa.me');
    expect(url.pathname).toBe('/' + runtime.whatsappNumber);
    expect(url.searchParams.get('text')).toBe(await page.locator('#enquirySummary').innerText());
    await expect(page.locator('#whatsappStatus')).toContainText('cannot confirm delivery');
    await whatsapp.close();
  });

  test(`approved WhatsApp draft opens only after explicit action at ${width}px`, async ({ page, context }) => {
    const goal = 'Synthetic goal: fractions & confidence? <not markup> 🙂';
    // Fictional reserved example number, intercepted locally. No real contact.
    const settings = structuredClone(await readV2Settings());
    settings.enquiry = {
      whatsapp_number: '12025550123', number_approved: true,
      approval_record: { approved_by: 'Synthetic test only', approved_on: '2026-11-11', evidence: 'Intercepted browser fixture; no actual contact approval.' }
    };
    await page.route('**/site-settings.js', route => route.fulfill({ contentType: 'text/javascript', body: `window.VARDHAMAN_SITE=${JSON.stringify(siteRuntime(settings))};` }));
    const outgoing = [];
    await context.route('https://wa.me/**', route => { outgoing.push(route.request().url()); return route.fulfill({ contentType: 'text/html', body: '<title>Local WhatsApp handoff fixture</title>' }); });
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.locator('#whatsappEnquiry')).toBeHidden();
    await page.locator('#whatsappEnquiry').dispatchEvent('click');
    await prepareDraft(page, goal);
    const link = page.locator('#whatsappEnquiry');
    await expect(link).toBeVisible();
    await expect(link).toBeEnabled();
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
    expect(url.searchParams.get('text')).toBe(await page.locator('#enquirySummary').innerText());
    expect(url.searchParams.get('text')).toBe(`Hello Rushabh Sir,\n\nI would like to enquire about tuition at Vardhaman Academy for my child.\n\nClass: 8\nMain concern: Understanding concepts is difficult\nWhat I hope to see improve: ${goal}\n\nCould we discuss the next steps?`);
    expect(await page.evaluate(() => JSON.stringify(window.dataLayer))).not.toContain(goal);
    await expect(page.locator('#whatsappStatus')).toContainText('cannot confirm delivery');
    await whatsapp.close();
    await page.locator('.form-step.active [data-back]').click();
    await expect(link).toBeHidden();
    await expect(link).toBeDisabled();
    await link.dispatchEvent('click');
    expect(outgoing).toHaveLength(1);
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

for (const width of [1440, 390]) {
  for (const mode of ['missing', 'unapproved', 'private']) {
    test(`WhatsApp stays disabled for ${mode} contact and summary remains usable at ${width}px`, async ({ page, context }) => {
      const settings = structuredClone(await readV2Settings());
      settings.enquiry = { whatsapp_number: mode === 'unapproved' ? '12025550123' : null, number_approved: false, approval_record: null };
      const runtime = siteRuntime(settings);
      // A stale/injected number must not enable private-review handoffs either.
      if (mode === 'private') Object.assign(runtime, { privateReview: true, whatsappNumber: '12025550123' });
      await page.route('**/site-settings.js', route => route.fulfill({ contentType: 'text/javascript', body: `window.VARDHAMAN_SITE=${JSON.stringify(runtime)};` }));
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      const opened = [];
      await context.route('https://wa.me/**', route => { opened.push(route.request().url()); return route.fulfill({ body: 'Unexpected local test handoff' }); });
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await page.locator('#classNext').click();
      await expect(page.locator('#classValidation')).toContainText('Please choose');
      await page.locator('#classSelect button').first().click();
      await page.locator('#classNext').click();
      await page.locator('#concernNext').click();
      await expect(page.locator('#concernValidation')).toContainText('Please choose');
      await page.locator('.form-step.active [data-back]').click();
      await prepareDraft(page, 'A synthetic learning goal & confidence.');
      const action = page.locator('#whatsappEnquiry');
      await expect(action).toBeVisible();
      await expect(action).toBeDisabled();
      await expect(action).toHaveAttribute('aria-describedby', 'whatsappAvailability');
      await expect(page.locator('#whatsappAvailability')).toContainText(mode === 'private' ? 'Private review' : 'awaiting confirmation');
      // Even direct event dispatch cannot bypass the unavailable-contact guard.
      await action.dispatchEvent('click');
      await page.locator('#copyEnquiry').click();
      await expect(page.locator('#copyStatus')).toContainText('Copying does not send an enquiry');
      const copied = await page.evaluate(() => navigator.clipboard.readText());
      expect(copied.replaceAll('\r\n', '\n')).toBe(await page.locator('#enquirySummary').innerText());
      await page.locator('.form-step.active [data-back]').click();
      await expect(page.locator('#childNote')).toHaveValue('A synthetic learning goal & confidence.');
      await page.locator('#childNote').fill('');
      await page.locator('#noteNext').click();
      await expect(page.locator('#enquirySummary')).not.toContainText('What I hope to see improve:');
      await expect(action).toBeDisabled();
      expect(opened).toEqual([]);
      await expect(page.locator('#whatsappStatus')).toBeEmpty();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });
  }
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
