import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readV2Settings } from '../../scripts/contracts.mjs';
const siteSettings = await readV2Settings();
import { mkdir, writeFile } from 'node:fs/promises';

for (const width of [1440, 768, 390, 320]) {
  test(`V2 renders all original sections, media and navigation at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 1440 ? 900 : 844 });
    const errors = [], failures = [], requests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => requests.push({ url: request.url(), method: request.method() }));
    page.on('response', response => { if (response.status() >= 400) failures.push(response.url()); });
    await page.goto('/');
    await expect(page).toHaveTitle(siteSettings.seo.title);
    await expect(page.locator('.official-logo-crop').first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    await expect(page.locator('.gallery-card')).toHaveCount(10);
    for (const selector of ['#home', '#parents', '#about', '#life-at-vardhaman', '#stories', '#approach', '#journey', '#brainlab', '#enquiry', '.faq', '.footer']) {
      await page.locator(selector).scrollIntoViewIfNeeded();
      await expect(page.locator(selector)).toBeVisible();
    }
    for (const image of await page.locator('img').all()) {
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate(item => item.complete && item.naturalWidth > 0)).toBeTruthy();
    }
    expect(requests.some(request => request.url.includes('.mp4'))).toBeFalsy();
    expect(requests.every(request => request.url.startsWith('http://127.0.0.1:5176/') && request.method === 'GET')).toBeTruthy();
    expect(await page.locator('body').innerText()).not.toMatch(/Vardhman|Classes 1–10|Classes 1 through 10/);
    await page.evaluate(() => scrollTo(0, 0));
    if (width <= 780) {
      const menu = page.locator('#mobileToggle');
      await menu.focus(); await page.keyboard.press('Enter');
      await expect(menu).toHaveAttribute('aria-expanded', 'true');
      await page.locator('#navLinks a[href="#journey"]').click();
      await expect(menu).toHaveAttribute('aria-expanded', 'false');
      await expect(page).toHaveURL(/#journey$/);
    }
    await page.locator('.hero-actions a.primary').click();
    await expect(page).toHaveURL(/#enquiry$/);
    await expect(page.locator('#enquiry')).toBeInViewport();
    expect(errors).toEqual([]); expect(failures).toEqual([]);
  });
}

test('gallery filters, photo/video dialogs, Escape, focus return and all five clips', async ({ page }) => {
  await page.goto('/');
  for (const [category, count] of [['activities', 7], ['achievements', 2], ['community', 1], ['all', 10]]) {
    await page.locator(`.gallery-tab[data-category="${category}"]`).click();
    await expect(page.locator('.gallery-card:visible')).toHaveCount(count);
    await expect(page.locator(`.gallery-tab[data-category="${category}"]`)).toHaveAttribute('aria-pressed', 'true');
  }
  const trigger = page.locator('[data-media="IMG-18"]');
  await trigger.click();
  await expect(page.locator('#mediaModal')).toBeVisible();
  await expect(page.locator('.media-modal-close')).toBeFocused();
  await expect(page.locator('#mediaModalCaption')).toContainText('approved story');
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  for (const id of ['VID-02', 'VID-03', 'VID-04', 'VID-05', 'VID-06']) {
    const button = page.locator(`[data-media="${id}"]`);
    await button.click();
    const video = page.locator('#mediaModal video');
    await expect.poll(() => video.evaluate(item => item.readyState)).toBeGreaterThanOrEqual(2);
    expect(await video.evaluate(item => item.paused && !item.autoplay && item.controls && item.playsInline)).toBeTruthy();
    const handle = await video.elementHandle();
    await video.evaluate(item => item.play());
    await expect.poll(() => video.evaluate(item => item.currentTime)).toBeGreaterThan(0);
    await page.locator('.media-modal-close').click();
    expect(await handle.evaluate(item => item.paused)).toBeTruthy();
    await expect(button).toBeFocused();
  }
});

test('illustrative story carousel, category switches and modal', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.story-card')).toHaveCount(5);
  await expect(page.locator('.story-note')).toContainText('illustrative sample content');
  await page.locator('#storyNext').click();
  expect(await page.locator('#storyTrack').evaluate(item => item.style.transform)).not.toBe('translateX(0px)');
  await page.locator('#storyPrev').click();
  await expect(page.locator('#storyPrev')).toBeDisabled();
  for (const [category, count] of [['stem', 3], ['personal', 2], ['all', 5]]) {
    await page.locator(`#storyFilters [data-filter="${category}"]`).click();
    await expect(page.locator('.story-card')).toHaveCount(count);
  }
  const story = page.locator('.story-card').first();
  await story.click();
  await expect(page.locator('#storyModal')).toBeVisible();
  await expect(page.locator('#storyModal')).toContainText('Illustrative sample story');
  await page.keyboard.press('Escape');
  await expect(story).toBeFocused();
});

test('class 5–10 states, selected controls and wraparound navigation', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#gradeTrack button')).toHaveCount(6);
  for (const grade of [5, 9, 10]) {
    const button = page.locator('#gradeTrack button').filter({ hasText: new RegExp(`^${grade}$`) });
    await button.click();
    await expect(page.locator('#stageNumber')).toHaveText(String(grade));
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#gradeTrack [aria-pressed="true"]')).toHaveCount(1);
  }
  await page.locator('#nextGrade').click();
  await expect(page.locator('#stageNumber')).toHaveText('5');
  await page.locator('#prevGrade').click();
  await expect(page.locator('#stageNumber')).toHaveText('10');
  await page.evaluate(() => window.setGrade(2));
  await expect(page.locator('#stageNumber')).toHaveText('5');
});

test('quiz levels, wrong/right feedback, three-question progress and reset', async ({ page }) => {
  await page.goto('/');
  for (const [level, answers] of [['junior', [1, 1, 2]], ['middle', [1, 3, 0]], ['senior', [2, 3, 0]]]) {
    await page.locator(`#levelSwitch [data-level="${level}"]`).click();
    await expect(page.locator('#quizNext')).toBeDisabled();
    for (let i = 0; i < answers.length; i++) {
      await expect(page.locator('#quizCount')).toHaveText(`Question ${i + 1} of 3`);
      await page.locator('#quizChoices button').nth(answers[i]).click();
      await expect(page.locator('#quizFeedback')).toContainText(level === 'junior' && i === 0 ? 'Nice try!' : 'Well spotted!');
      await page.locator('#quizNext').click();
    }
    await expect(page.locator('#quizResult')).toBeVisible();
    await expect(page.locator('#resultText')).toContainText(level === 'junior' ? '2 correct answers' : '3 correct answers');
    await page.locator('#quizAgain').click();
    await expect(page.locator('#quizCount')).toHaveText('Question 1 of 3');
  }
});

test('four-step parent demo validates, supports back/edit/copy and transmits no data', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const transmissions = [];
  page.on('request', request => { if (request.method() !== 'GET') transmissions.push(request.url()); });
  await page.goto('/');
  await expect(page.locator('#classSelect button')).toHaveCount(6);
  await page.locator('#classNext').click();
  await expect(page.locator('#classValidation')).toContainText('Please choose');
  await page.locator('#classSelect button').filter({ hasText: /^9$/ }).click();
  await page.locator('#classNext').click();
  await expect(page.locator('.form-step.active')).toHaveAttribute('data-step', '1');
  await page.locator('#concernNext').click();
  await expect(page.locator('#concernValidation')).toContainText('Please choose');
  await page.locator('#concernOptions button').first().click();
  await page.locator('#concernNext').click();
  await page.locator('#childNote').fill('Synthetic demo goal: practise maths with confidence.');
  await page.locator('#noteNext').click();
  await expect(page.locator('#enquirySummary')).toContainText('Class: 9');
  await expect(page.locator('#enquirySummary')).toContainText('Synthetic demo goal');
  await page.locator('#copyEnquiry').click();
  await expect(page.locator('#copyStatus')).toContainText('Message copied');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('Class: 9');
  await page.locator('.form-step.active [data-back]').click();
  await expect(page.locator('#childNote')).toHaveValue('Synthetic demo goal: practise maths with confidence.');
  await page.locator('.faq-item button').nth(2).click();
  await expect(page.locator('.faq-item').nth(2)).toHaveClass(/open/);
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length, cookies: document.cookie }))).toEqual({ local: 0, session: 0, cookies: '' });
  expect(transmissions).toEqual([]);
  await page.reload();
  await expect(page.locator('#childNote')).toHaveValue('');
});

test('gallery dialog traps keyboard focus', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-media="IMG-14"]').click();
  await page.keyboard.press('Tab');
  expect(await page.locator('#mediaModal').evaluate(item => item.contains(document.activeElement))).toBeTruthy();
});

test('V2 meets automated WCAG checks across revealed sections', async ({ page }) => {
  await page.goto('/');
  for (const reveal of await page.locator('.reveal').all()) await reveal.scrollIntoViewIfNeeded();
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  await mkdir('qa/visual', { recursive: true });
  await writeFile('qa/visual/v2-axe-final.json', JSON.stringify(result, null, 2));
  expect(result.violations.map(item => ({ id: item.id, nodes: item.nodes.length }))).toEqual([]);
});
