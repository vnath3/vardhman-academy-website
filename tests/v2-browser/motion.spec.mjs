import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
test.use({ hasTouch: true });

const targets = '#parents h2, #parents .worry-item, #about .teacher-art, #about h2, .reveal-gallery';
const readable = async locator => {
  expect(await locator.evaluateAll(elements => elements.every(element => {
    const style = getComputedStyle(element);
    return style.opacity === '1' && style.transform === 'none' && element.getAnimations().length === 0;
  }))).toBe(true);
};

// Approach from outside the observer margin, then scroll at a reading pace.
async function slowEnter(page, selector) {
  await page.locator(selector).first().evaluate(element => scrollTo({ top: scrollY + element.getBoundingClientRect().top - innerHeight - 100, behavior: 'instant' }));
  await page.waitForTimeout(250); // Let the deliberate positioning jump settle.
  for (let i = 0; i < 12; i++) {
    await page.evaluate(() => scrollBy({ top: 16, behavior: 'instant' }));
    await page.waitForTimeout(45);
  }
}

for (const width of [1440, 390]) {
  test(`slow entrances play once with no nested reveal at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => {
      window.entrances = [];
      document.addEventListener('animationstart', event => {
        if (['section-entrance', 'become-underline'].includes(event.animationName) && event.target.matches('#parents h2, .become-word, #parents .worry-item, #about .teacher-art, #about h2, .reveal-gallery')) window.entrances.push({ name: event.animationName, className: event.target.className, time: performance.now() });
      });
    });
    for (const selector of ['#parents h2', '#parents .worry-item', '#about .teacher-art', '#about h2', '.reveal-gallery']) {
      // Desktop pairs can already have entered together.
      if (!await page.locator(selector).first().evaluate(element => element.classList.contains('visible'))) await slowEnter(page, selector);
      await expect(page.locator(selector).first()).toHaveClass(/visible/);
      if (selector === '#parents h2') await expect(page.locator(selector)).not.toHaveClass(/motion-instant/);
      if (selector === '#parents .worry-item') await expect.poll(() => page.locator('#parents .reveal.visible').evaluateAll(elements => elements.every(element => element.getAnimations({ subtree: true }).length === 0))).toBe(true);
    }
    const heading = page.locator('#parents h2');
    expect(await heading.evaluate(element => element.closest('.reveal') === element && !element.parentElement.closest('.reveal'))).toBe(true);
    expect(await page.locator('#about .teacher-grid').getAttribute('class')).not.toMatch(/reveal/);
    await expect(page.locator('.reveal-gallery')).toHaveCount(width === 390 ? 1 : 3);
    await expect.poll(() => page.evaluate(() => window.entrances.some(event => event.name === 'become-underline'))).toBe(true);
    const sequence = await page.evaluate(() => ({
      underline: window.entrances.find(event => event.name === 'become-underline').time,
      card: window.entrances.find(event => event.className.includes('reveal-concern'))?.time
    }));
    expect(sequence.card - sequence.underline).toBeGreaterThanOrEqual((width === 390 ? 260 : 420) - 50);
    await expect.poll(() => page.locator(targets).evaluateAll(elements => elements.every(element => element.getAnimations().length === 0))).toBe(true);
    const count = await page.evaluate(() => window.entrances.length);
    await page.evaluate(() => scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await page.locator('#parents').scrollIntoViewIfNeeded();
    await readable(page.locator('#parents h2, #parents .worry-item'));
    expect(await page.evaluate(() => window.entrances.length)).toBe(count);
    await mkdir('qa/visual', { recursive: true });
    await page.screenshot({ path: `qa/visual/scroll-parent-${width}.png` });
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
    await page.goto('/');
    await readable(page.locator(targets));
    expect(await page.locator('.become-word').evaluate(element => getComputedStyle(element, '::after').animationName)).toBe('none');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.locator('#parents').scrollIntoViewIfNeeded();
    await readable(page.locator(targets));
    await page.reload();
    await slowEnter(page, '#parents h2');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await readable(page.locator(targets));
  });

  test(`without JavaScript the sections and all gallery media remain available at ${width}px`, async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } });
    const page = await context.newPage();
    try {
      await page.goto('http://127.0.0.1:5176/');
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
  const trigger = page.locator('[data-media="VID-02"]');
  await trigger.tap();
  const video = page.locator('#mediaModal video');
  await expect.poll(() => video.evaluate(element => element.readyState)).toBeGreaterThanOrEqual(2);
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
