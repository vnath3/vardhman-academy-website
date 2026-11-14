import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { slowScrollUntil } from './scroll-input.mjs';
import { stubAnalytics } from '../production-browser/analytics.mjs';
test.use({ hasTouch: true });
test.beforeEach(async ({ page }) => { await stubAnalytics(page); });

const targets = '#parents h2, #parents .worry-item, #about .teacher-art, #about h2, .reveal-gallery';
const readable = async locator => {
  expect(await locator.evaluateAll(elements => elements.every(element => {
    const style = getComputedStyle(element);
    return style.opacity === '1' && style.transform === 'none' && element.getAnimations().length === 0;
  }))).toBe(true);
};

for (const width of [1440, 390]) {
  test(`natural scroll shows the parent sequence in view and never replays at ${width}px`, async ({ page }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => {
      window.entrances = [];
      document.addEventListener('animationstart', event => {
        if (event.target.closest('#parents')) window.entrances.push({ name: event.animationName, time: performance.now(), bottom: event.target.getBoundingClientRect().bottom });
      });
    });
    const mobile = width === 390;
    await slowScrollUntil(page, () => document.querySelector('#parents h2').classList.contains('visible'), mobile);
    const heading = page.locator('#parents h2');
    await expect(heading).not.toHaveClass(/motion-instant/);
    expect(await heading.evaluate(element => element.getBoundingClientRect().bottom)).toBeLessThan(900);
    await slowScrollUntil(page, () => Number(document.querySelector('#parents h2').style.getPropertyValue('--underline-progress')) >= .3, mobile);
    const progress = () => heading.evaluate(element => Number(element.style.getPropertyValue('--underline-progress')));
    const partial = await progress();
    expect(partial).toBeLessThan(.8);
    const word = page.locator('.become-word');
    expect(await word.evaluate(element => element.getBoundingClientRect().bottom)).toBeLessThan(900 * .79);
    await page.waitForTimeout(500);
    expect(Math.abs(await progress() - partial)).toBeLessThan(.02);
    // Starting a new touch on the section must not skip the remaining sequence.
    const box = await word.boundingBox();
    await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
    await expect(heading).not.toHaveClass(/motion-instant/);
    expect(Math.abs(await progress() - partial)).toBeLessThan(.02);
    await slowScrollUntil(page, () => [...document.querySelectorAll('#parents .worry-item')].every(element => element.classList.contains('visible')), mobile);
    await expect.poll(() => page.locator('#parents .reveal').evaluateAll(elements => elements.every(element => element.getAnimations().length === 0))).toBe(true);
    expect(await progress()).toBe(1);
    await expect(page.locator('#parents .motion-instant')).toHaveCount(0);
    await readable(page.locator('#parents .reveal'));
    expect(await heading.evaluate(element => !element.parentElement.closest('.reveal'))).toBe(true);
    expect(await page.locator('#about .teacher-grid').getAttribute('class')).not.toMatch(/reveal/);
    await expect(page.locator('.reveal-gallery')).toHaveCount(mobile ? 1 : 3);
    const starts = await page.evaluate(() => window.entrances);
    expect(starts.filter(event => event.name === 'parent-entrance')).toHaveLength(1);
    const cards = starts.filter(event => event.name === 'concern-entrance');
    expect(cards).toHaveLength(3);
    expect(cards[1].time).toBeGreaterThan(cards[0].time + 30);
    expect(cards[2].time).toBeGreaterThan(cards[1].time + 30);
    await mkdir('qa/visual', { recursive: true });
    await page.screenshot({ path: `qa/visual/scroll-parent-${width}.png` });
    await page.mouse.wheel(0, -4000);
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    await page.waitForTimeout(300);
    await slowScrollUntil(page, () => document.querySelector('.become-word').getBoundingClientRect().bottom < innerHeight * .7, mobile);
    expect(await progress()).toBe(1);
    expect(await page.evaluate(() => window.entrances.length)).toBe(starts.length);
    await readable(page.locator('#parents .reveal'));
  });

  test(`menu jumps and initial hashes land on readable content at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    for (const hash of ['#about', '#life-at-vardhaman', '#journey', '#brainlab', '#enquiry']) {
      await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
      if (width === 390) await page.locator('#mobileToggle').click();
      await page.locator(`#navLinks a[href="${hash}"]`).click();
      await expect(page).toHaveURL(new RegExp(`${hash}$`));
      await readable(page.locator(`${hash} .reveal`));
    }
    for (const hash of ['#parents', '#about', '#life-at-vardhaman']) {
      await page.goto(`/${hash}`);
      await readable(page.locator(`${hash} .reveal`));
      await expect(page.locator(hash)).toBeInViewport();
    }
  });

  test(`reduced motion and changing the preference show everything at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
    await readable(page.locator(targets));
    expect(await page.locator('.become-word').evaluate(element => getComputedStyle(element, '::after').animationName)).toBe('none');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.locator('#parents').scrollIntoViewIfNeeded();
    await readable(page.locator(targets));
    await page.reload();
    await slowScrollUntil(page, () => document.querySelector('#parents h2').classList.contains('visible'), width === 390);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await readable(page.locator(targets));
  });

  test(`without JavaScript the sections and all gallery media remain available at ${width}px`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } });
    const page = await context.newPage();
    try {
      await page.goto(baseURL);
      await readable(page.locator('#parents h2, #parents .worry-item, #about .teacher-art, #about h2, .gallery-card'));
      await expect(page.locator('.gallery-card')).toHaveCount(10);
      await expect(page.locator('.gallery-toolbar')).toBeHidden();
      await expect(page.locator('.gallery-disclosure')).toBeHidden();
      await expect(page.locator('[data-media="VID-02"]')).toHaveAttribute('href', /\.mp4$/);
      await page.locator('[data-media="IMG-18"]').click();
      await expect(page).toHaveURL(/olympiad-medal.*\.jpeg$/);
    } finally { await context.close(); }
  });
}

test('fast 390px swipes settle skipped content, controls stay usable, and video remains tap-to-play', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const videos = [];
  page.on('request', request => { if (request.url().includes('.mp4')) videos.push(request.url()); });
  await page.goto('/');
  await expect(page.locator('.hero-actions a.primary')).toBeVisible();
  await readable(page.locator('#journey .journey-details, #brainlab .brain-panel, #enquiry .enquiry'));
  const touch = await page.context().newCDPSession(page);
  await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 195, y: 700 }] });
  for (const y of [550, 400, 250, 100]) {
    await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 195, y }] });
    await page.waitForTimeout(16);
  }
  await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(300);
  for (const section of ['#parents', '#about', '#life-at-vardhaman']) {
    await page.locator(section).evaluate(element => scrollTo({ top: scrollY + element.getBoundingClientRect().top - 100, behavior: 'instant' }));
    await expect.poll(() => page.locator(`${section} .reveal`).evaluateAll(elements => elements.filter(element => element.getBoundingClientRect().top < innerHeight).every(element => element.classList.contains('motion-instant')))).toBe(true);
    await readable(page.locator(`${section} .reveal.motion-instant`));
  }
  expect(videos).toEqual([]);
  const toggle = page.locator('#galleryToggle');
  if (await toggle.getAttribute('aria-expanded') === 'false' && await toggle.isVisible()) await toggle.click();
  const trigger = page.locator('[data-media="VID-02"]');
  await trigger.tap();
  const video = page.locator('#mediaModal video');
  await expect.poll(() => video.evaluate(element => element.readyState), { timeout: 30000 }).toBeGreaterThanOrEqual(2);
  expect(await video.evaluate(element => element.paused && !element.autoplay && element.controls)).toBe(true);
  const box = await video.boundingBox();
  await video.tap({ position: { x: 30, y: box.height - 25 } });
  await expect.poll(() => video.evaluate(element => element.currentTime)).toBeGreaterThan(0);
  await page.locator('.media-modal-close').click();
  await expect(trigger).toBeFocused();
});

test('without IntersectionObserver content remains readable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => { delete window.IntersectionObserver; });
  await page.goto('/');
  await readable(page.locator(targets));
  await page.locator('#gradeTrack button').filter({ hasText: /^10$/ }).click();
  await expect(page.locator('#stageNumber')).toHaveText('10');
});
