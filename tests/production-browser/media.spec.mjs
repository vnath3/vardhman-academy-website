import { test, expect } from '@playwright/test';
import { access } from 'node:fs/promises';
import path from 'node:path';
import { root, readV2Manifest } from '../../scripts/contracts.mjs';
import { planMedia } from '../../src/v2-media.mjs';
import { stubAnalytics } from './analytics.mjs';

test.beforeEach(async ({ page }) => { await stubAnalytics(page); });

for (const width of [1440, 390]) {
  test(`manifest-only future media activation preserves filters and controls at ${width}px`, async ({ page }) => {
    // Browser-only fixtures. No real release statuses or dist files are changed.
    const manifest = structuredClone(await readV2Manifest());
    for (const asset of manifest.assets.filter(asset => ['gallery', 'poster'].includes(asset.section))) asset.approval_status = 'pending';
    const approve = asset => {
      asset.approval_status = 'approved';
      asset.verified = Object.fromEntries(asset.required_verifications.map(key => [key, true]));
      asset.approval_record = { approved_by: 'Synthetic test only', approved_on: '2026-11-01', evidence: 'Browser interception only; no actual approval is granted.' };
      return asset;
    };
    const photo = approve({ ...structuredClone(manifest.assets.find(asset => asset.id === 'IMG-14')), id: 'FIXTURE-PHOTO', category: 'community', source_path: 'media/vardhaman/gallery/fixture-photo.png', production_path: 'media/fixtures/photo.png', title: 'Photo "quoted" <img data-injected>', caption: 'A synthetic caption & a truthful context.' });
    const video = approve({ ...structuredClone(manifest.assets.find(asset => asset.id === 'VID-05')), id: 'FIXTURE-VIDEO', source_path: 'media/vardhaman/video/fixture-video.mp4', production_path: 'media/fixtures/video.mp4', poster_id: 'FIXTURE-POSTER', title: 'Local video control fixture' });
    const poster = approve({ ...structuredClone(manifest.assets.find(asset => asset.id === 'VID-05-POSTER')), id: 'FIXTURE-POSTER', source_path: 'media/vardhaman/video-posters/fixture-poster.png', production_path: 'media/fixtures/poster.png', parent_id: video.id });
    manifest.assets.push(photo, video, poster);
    const runtime = planMedia(manifest).runtime;
    const errors = [], failures = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) failures.push(response.url()); });
    await page.route('**/media-data.js', route => route.fulfill({ contentType: 'text/javascript', body: `window.VARDHAMAN_MEDIA=${JSON.stringify(runtime).replaceAll('<', '\\u003c')};` }));
    await page.route('**/media/fixtures/*.png', route => route.fulfill({ contentType: 'image/png', path: 'tests/fixtures/media/synthetic-image.png' }));
    // The existing local review clip exercises decoding; it is not copied into
    // public output, and its real pending permission record is never changed.
    await page.route('**/media/fixtures/video.mp4', route => route.fulfill({ contentType: 'video/mp4', path: 'media/vardhaman/video/football-vid-05.mp4' }));
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.locator('.gallery-card')).toHaveCount(2);
    await expect(page.locator('[data-injected]')).toHaveCount(0);
    await expect(page.locator('.gallery-consent').first()).toHaveText('Shared with permission');
    for (const [category, count] of [['activities', 1], ['community', 1], ['achievements', 0], ['all', 2]]) {
      await page.locator(`.gallery-tab[data-category="${category}"]`).click();
      await expect(page.locator('.gallery-card:visible')).toHaveCount(count);
      if (!count) await expect(page.locator('.gallery-empty')).toBeVisible();
    }
    const imageTrigger = page.locator('[data-media="FIXTURE-PHOTO"]');
    await imageTrigger.click();
    await expect(page.locator('#mediaModalCaption')).toContainText(photo.title);
    await expect.poll(() => page.locator('#mediaModal img').evaluate(img => img.complete && img.naturalWidth > 0)).toBeTruthy();
    await page.keyboard.press('Escape');
    await expect(imageTrigger).toBeFocused();
    await page.locator('[data-media="FIXTURE-VIDEO"]').click();
    const player = page.locator('#mediaModal video');
    await expect.poll(() => player.evaluate(video => video.readyState)).toBeGreaterThanOrEqual(2);
    expect(await player.evaluate(video => video.controls && video.playsInline && video.paused && !video.autoplay)).toBeTruthy();
    const handle = await player.elementHandle();
    await player.evaluate(video => video.play());
    await expect.poll(() => player.evaluate(video => video.currentTime)).toBeGreaterThan(0);
    await page.locator('.media-modal-close').click();
    expect(await handle.evaluate(video => video.paused)).toBeTruthy();
    expect(errors).toEqual([]); expect(failures).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    for (const asset of [photo, video, poster]) {
      await expect(access(path.join(root, 'dist', asset.production_path))).rejects.toMatchObject({ code: 'ENOENT' });
    }
  });
}
