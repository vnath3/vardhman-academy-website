import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const viewport of [{ width: 1440, height: 1000 }, { width: 768, height: 1024 }, { width: 390, height: 844 }, { width: 320, height: 740 }]) {
  test(`responsive layout, assets and accessibility at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const errors = [];
    const requests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => requests.push(request.url()));
    await page.goto('/');
    await expect(page).toHaveTitle(/Vardhaman Academy \| Classes 5–10/);
    await expect(page.locator('#private-review')).not.toBeChecked();
    await expect(page.locator('#gallery-empty')).toBeVisible();
    await expect(page.locator('.hero-portrait img')).toBeVisible();
    expect(await page.locator('.hero-portrait img').evaluate(image => image.complete && image.naturalWidth > 0)).toBeTruthy();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
    await page.getByRole('link', { name: 'Tell Us About Your Child' }).click();
    await expect(page).toHaveURL(/#contact$/);
    await expect(page.locator('#contact')).toBeInViewport();
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(axe.violations).toEqual([]);
    expect(requests.every(url => url.startsWith('http://127.0.0.1:5175/'))).toBeTruthy();
    expect(requests.some(url => /\.mp4|video-posters|cricket-img|certificate-img/.test(url))).toBeFalsy();
    expect(errors).toEqual([]);
    if (viewport.width === 1440 || viewport.width === 390) {
      await page.goto('/');
      await page.screenshot({ path: `test-results/home-${viewport.width}.png`, fullPage: true });
    }
  });
}

test('keyboard toggle, filters, lazy video playback and review revocation', async ({ page }) => {
  const mp4Requests = [];
  page.on('request', request => { if (request.url().includes('.mp4')) mp4Requests.push(request.url()); });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  const toggle = page.locator('#private-review');
  await toggle.focus();
  await page.keyboard.press('Space');
  await expect(page.locator('.media-card')).toHaveCount(11);
  expect(mp4Requests).toEqual([]);
  await page.getByRole('button', { name: 'Activities', exact: true }).click();
  await expect(page.locator('.media-card')).toHaveCount(7);
  await page.getByRole('button', { name: 'Learning', exact: true }).click();
  await expect(page.locator('#gallery-empty')).toBeVisible();
  await page.getByRole('button', { name: 'Seminars', exact: true }).click();
  await expect(page.locator('.media-card')).toHaveCount(2);
  await expect(page.locator('#gallery')).toContainText('external educational seminar');
  await page.getByRole('button', { name: 'Activities', exact: true }).click();
  const launch = page.getByRole('button', { name: 'Play Football play' });
  await launch.click();
  const video = page.locator('[data-media-id="VID-05"] video');
  await expect(video).toBeVisible();
  await expect.poll(() => video.evaluate(item => item.readyState)).toBeGreaterThanOrEqual(2);
  expect(await video.evaluate(item => ({ controls: item.controls, autoplay: item.autoplay, playsInline: item.playsInline }))).toEqual({ controls: true, autoplay: false, playsInline: true });
  await expect.poll(() => video.evaluate(item => item.currentTime)).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Play Students playing tug-of-war' }).click();
  expect(await video.first().evaluate(item => item.paused)).toBeTruthy();
  const playingVideo = page.locator('[data-media-id="VID-03"] video');
  await expect.poll(() => playingVideo.evaluate(item => item.readyState)).toBeGreaterThanOrEqual(2);
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect.poll(() => playingVideo.evaluate(item => item.paused)).toBeTruthy();
  await toggle.uncheck();
  await expect(page.locator('.media-card')).toHaveCount(0);
  expect((await page.request.get('/media/vardhaman/video/football-vid-05.mp4')).status()).toBe(404);
  await toggle.check();
  await expect(page.locator('.media-card')).toHaveCount(7);
  await page.reload();
  await expect(toggle).not.toBeChecked();
  await expect(page.locator('.media-card')).toHaveCount(0);
});

test('all review photos and five video files load and decode', async ({ page }) => {
  await page.goto('/');
  await page.locator('#private-review').check();
  await expect(page.locator('.media-card')).toHaveCount(11);
  for (const image of await page.locator('.media-card img').all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate(item => item.complete && item.naturalWidth > 0)).toBeTruthy();
  }
  for (const id of ['VID-02', 'VID-03', 'VID-04', 'VID-05', 'VID-06']) {
    const card = page.locator(`[data-media-id="${id}"]`);
    await card.getByRole('button').click();
    const video = card.locator('video');
    await expect.poll(() => video.evaluate(item => item.readyState)).toBeGreaterThanOrEqual(2);
    expect(await video.evaluate(item => item.videoWidth > 0 && item.videoHeight > 0 && item.duration > 0)).toBeTruthy();
  }
});

test('VID-04 preserves encoded orientation at beginning and near end', async ({ page }) => {
  await page.goto('/');
  await page.locator('#private-review').check();
  await page.getByRole('button', { name: 'Play Group event at academy setting' }).click();
  const video = page.locator('video');
  await expect.poll(() => video.evaluate(item => item.readyState)).toBeGreaterThanOrEqual(2);
  const metadata = await video.evaluate(item => ({ width: item.videoWidth, height: item.videoHeight, duration: item.duration }));
  expect(metadata.width).toBeGreaterThan(0);
  expect(metadata.height).toBeGreaterThan(0);
  console.log('VID-04 metadata:', metadata);
  await video.evaluate(item => { item.pause(); item.currentTime = 1; });
  await expect.poll(() => video.evaluate(item => item.seeking)).toBeFalsy();
  await video.screenshot({ path: 'test-results/vid-04-start.png' });
  await video.evaluate(item => { item.currentTime = item.duration - 2; });
  await expect.poll(() => video.evaluate(item => item.seeking)).toBeFalsy();
  await video.screenshot({ path: 'test-results/vid-04-end.png' });
  expect(await video.evaluate(item => getComputedStyle(item).objectFit)).toBe('contain');
});

test('reduced motion and private gallery accessibility', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
  await page.locator('#private-review').check();
  await expect(page.locator('.media-card')).toHaveCount(11);
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(axe.violations).toEqual([]);
});
