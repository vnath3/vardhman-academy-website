import { cp, mkdir, readFile, writeFile, rm, realpath, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { root, readV2Manifest, readV2Settings, readV2Outcomes, readV2Results } from './contracts.mjs';
import { PAGES, mrPages, renderPage, renderGuidesIndex, renderClassesIndex, renderConsent } from '../src/v2-pages.mjs';
import { planMedia } from '../src/v2-media.mjs';
import { planOutcomes } from '../src/v2-outcomes.mjs';
import { planResults } from '../src/v2-results.mjs';
import { siteRuntime, renderSiteHtml, renderConceptScript, robotsFile, sitemapFile, verificationFile, productionHeaders } from '../src/v2-settings.mjs';
export { planMedia } from '../src/v2-media.mjs';
export { planOutcomes } from '../src/v2-outcomes.mjs';

export const v2Output = path.join(root, '.local-preview-v2');
export const v2Source = path.join(root, 'src', 'v2');
export const v2MediaPaths = (await readV2Manifest()).assets.map(asset => asset.production_path.slice('media/'.length));

const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
function renderMediaReview(manifest) {
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Private V2 media review</title><body><h1>Private V2 media review</h1><p>All supplied originals remain available here, including rejected historical references. This index is never packaged in dist. <a href="/">Return to V2</a></p>${manifest.assets.map(asset => `<article><h2>${escape(asset.id)} - ${escape(asset.approval_status)}</h2><p>${escape(asset.caption)}</p><a href="./${asset.production_path}">Open ${escape(asset.original_filename)}</a>${asset.type === 'image' ? `<p><img src="./${asset.production_path}" alt="${escape(asset.alt)}" loading="lazy" style="max-width:480px;width:100%"></p>` : `<p><video controls preload="none" src="./${asset.production_path}" aria-label="${escape(asset.alt)}" style="max-width:480px;width:100%"></video></p>`}</article>`).join('')}</body></html>`;
}

export async function buildV2({ privateReview = false } = {}) {
  if (privateReview && process.env.NODE_ENV === 'production') {
    throw new Error('Private V2 media cannot be built in production mode.');
  }
  const manifest = await readV2Manifest();
  const settings = await readV2Settings();
  const outcomesDoc = await readV2Outcomes();
  const runtimeSettings = siteRuntime(settings, { privateReview });
  const plan = planMedia(manifest, { privateReview });
  const outcomesPlan = planOutcomes(outcomesDoc, { privateReview });
  const resultsPlan = planResults(await readV2Results(), { privateReview });
  const archive = await realpath(path.join(root, 'media', 'vardhaman'));
  for (const asset of [...plan.copies, ...outcomesPlan.copies]) {
    const source = await realpath(path.join(root, asset.source_path));
    if (!source.startsWith(archive + path.sep)) throw new Error(`Media source escapes archive: ${asset.id}`);
  }
  const output = privateReview ? v2Output : path.join(root, 'dist');
  // Both paths are fixed generated directories inside this checkout.
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  for (const file of ['base.css', 'v2.css', 'v2.js', 'enquiry.js', 'dialogs.js', 'fonts.css', 'fonts', 'favicon.ico', 'favicon.png', 'share-card.jpg', 'icon-192.png', 'apple-touch-icon.png']) {
    await cp(path.join(v2Source, file), path.join(output, file), { recursive: true });
  }
  await writeFile(path.join(output, 'concept.js'), renderConceptScript(await readFile(path.join(v2Source, 'concept.js'), 'utf8'), { privateReview }));
  await writeFile(path.join(output, 'index.html'), renderSiteHtml(await readFile(path.join(v2Source, 'index.html'), 'utf8'), settings, { privateReview, media: planMedia(manifest).runtime, galleryMedia: plan.runtime, outcomesMedia: outcomesPlan.runtime, results: resultsPlan }));
  await mkdir(path.join(output, 'consent'), { recursive: true });
  await writeFile(path.join(output, 'consent', 'index.html'), renderConsent(await readFile(path.join(v2Source, 'consent.html'), 'utf8'), planMedia(manifest).runtime));
  for (const page of [...PAGES, ...mrPages()]) {
    await mkdir(path.join(output, page.slug), { recursive: true });
    await writeFile(path.join(output, page.slug, 'index.html'), renderPage(page, settings, { privateReview, media: planMedia(manifest).runtime }));
  }
  await mkdir(path.join(output, 'classes'), { recursive: true });
  await writeFile(path.join(output, 'classes', 'index.html'), renderClassesIndex(settings, { privateReview, media: planMedia(manifest).runtime }));
  await mkdir(path.join(output, 'guides'), { recursive: true });
  await writeFile(path.join(output, 'guides', 'index.html'), renderGuidesIndex(settings, { privateReview, media: planMedia(manifest).runtime }));
  await writeFile(path.join(output, 'site-settings.js'), `window.VARDHAMAN_SITE = ${JSON.stringify(runtimeSettings).replaceAll('<', '\\u003c')};\n`);
  if (!privateReview) {
    await cp(path.join(v2Source, 'analytics.js'), path.join(output, 'analytics.js'));
  }
  await writeFile(path.join(output, 'media-data.js'),
    `window.VARDHAMAN_MEDIA = ${JSON.stringify(plan.runtime).replaceAll('<', '\\u003c')};\n`);
  await writeFile(path.join(output, 'robots.txt'), robotsFile(settings, { privateReview }));
  const verification = verificationFile(settings);
  if (verification) await writeFile(path.join(output, verification.name), verification.content);
  const sitemap = sitemapFile(settings, { privateReview });
  if (sitemap) await writeFile(path.join(output, 'sitemap.xml'), sitemap);
  if (privateReview) await writeFile(path.join(output, 'media-review.html'), renderMediaReview(manifest));
  if (!privateReview) {
    for (const asset of [...plan.copies, ...outcomesPlan.copies]) {
      const destination = path.join(output, asset.production_path);
      await mkdir(path.dirname(destination), { recursive: true });
      // Prefer the committed optimized derivative (scripts/optimize-media.mjs); originals stay untouched.
      const optimized = path.join(root, 'media-optimized', asset.production_path);
      const useOptimized = await access(optimized).then(() => true, () => false);
      await cp(useOptimized ? optimized : path.join(root, asset.source_path), destination);
    }
    // Also supports manual dist/ uploads; Netlify reads these headers itself.
    await writeFile(path.join(output, '_headers'), productionHeaders(await readFile(path.join(root, 'config', 'production-headers.txt'), 'utf8'), settings));
  }
  return { output, html: await readFile(path.join(output, 'index.html'), 'utf8'), mediaFiles: privateReview ? [] : plan.files, outcomesFiles: privateReview ? [] : outcomesPlan.files };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await buildV2({ privateReview: process.argv.includes('--private-review') });
  console.log(`${process.argv.includes('--private-review') ? 'Private review' : 'Production'} V2 build: ${result.output}\nPublic media files: ${result.mediaFiles.length}\nOutcomes media files: ${result.outcomesFiles.length}`);
}
