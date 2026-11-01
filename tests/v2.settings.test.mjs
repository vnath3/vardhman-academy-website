import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { readV2Settings, readV2Manifest, root } from '../scripts/contracts.mjs';
import { validateSettings, siteRuntime, renderSiteHtml, robotsFile, productionHeaders } from '../src/v2-settings.mjs';
import { planMedia } from '../src/v2-media.mjs';
import path from 'node:path';

const settings = await readV2Settings();
const approval = { approved_by: 'Synthetic fixture only', approved_on: '2026-11-01', evidence: 'Test record, not an actual owner approval.' };

test('WhatsApp destinations require a valid international number and explicit owner approval', () => {
  const config = structuredClone(settings);
  config.enquiry = { whatsapp_number: '12025550123', number_approved: false, approval_record: null };
  assert.equal(siteRuntime(config).whatsappNumber, null);
  config.enquiry.number_approved = true;
  assert.throws(() => validateSettings(config), /WhatsApp approval/);
  config.enquiry.approval_record = approval;
  assert.equal(siteRuntime(config).whatsappNumber, '12025550123');
  assert.equal(siteRuntime(config, { privateReview: true }).whatsappNumber, null);
  for (const number of ['+1 202 555 0123', 'javascript:alert(1)', '0123456789', '', null]) {
    config.enquiry.whatsapp_number = number;
    assert.throws(() => validateSettings(config));
  }
});

test('indexing remains denied without launch approval and changes all indexing controls together', () => {
  const config = structuredClone(settings); config.seo.indexing_enabled = true; config.seo.launch_approval = null;
  assert.throws(() => validateSettings(config), /Indexing approval/);
  config.seo.launch_approval = approval;
  const source = '<title>Old</title><meta name="description" content="Old"><meta name="robots" content="noindex, nofollow"><!-- site-metadata -->';
  assert.match(renderSiteHtml(source, config), /content="index, follow"/);
  assert.match(robotsFile(config), /Allow: \//);
  assert.match(productionHeaders('X-Robots-Tag: noindex, nofollow\n', config), /X-Robots-Tag: index, follow/);
  assert.match(renderSiteHtml(source, config, { privateReview: true }), /noindex, nofollow/);
  assert.match(robotsFile(config, { privateReview: true }), /Disallow: \//);
});

test('canonical, sharing and favicon use configured origin and already-approved assets', async () => {
  const source = await readFile(path.join(root, 'src/v2/index.html'), 'utf8');
  const media = planMedia(await readV2Manifest()).runtime;
  const config = structuredClone(settings); config.seo.indexing_enabled = false;
  const html = renderSiteHtml(source, config, { media });
  assert.match(html, /rel="canonical" href="https:\/\/va-academy.netlify.app\/"/);
  assert.match(html, /property="og:image" content="https:\/\/va-academy.netlify.app\/media\/hero\/rushab-warm-hero-v1.png"/);
  assert.match(html, /rel="icon" type="image\/png" href=".\/media\/brand\/vardhaman-logo.png"/);
  assert.doesNotMatch(renderSiteHtml(source, config, { media: {} }), /og:image|rel="icon"/);
  assert.doesNotMatch(renderSiteHtml(source, config, { privateReview: true, media }), /googletagmanager|analytics\.js/);
  config.seo.title = 'Academy "quoted" <script>';
  assert.match(renderSiteHtml(source, config), /Academy &quot;quoted&quot; &lt;script&gt;/);
});
