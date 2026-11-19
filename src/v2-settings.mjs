import { pageUrls } from './v2-pages.mjs';
import assert from 'node:assert/strict';
import { renderGallery } from './v2-gallery.mjs';
import { renderOutcomes } from './v2-outcomes.mjs';

const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
function requireApproval(record, label) {
  for (const key of ['approved_by', 'approved_on', 'evidence']) assert.ok(typeof record?.[key] === 'string' && record[key].trim(), `${label}: missing ${key}`);
  assert.match(record.approved_on, /^\d{4}-\d{2}-\d{2}$/, `${label}: invalid date`);
}

// Section flags: build-time visibility of optional page sections. A disabled
// section is not shipped at all (markup, nav and footer links are removed).
// Hero, enquiry, header and footer are core and cannot be flagged.
export const SECTION_FLAGS = {
  trust_strip: [], parent_message: ['parents'], first_month: ['first-month'], brainlab: ['brainlab'], approach: ['approach'],
  mentor: ['about'], gallery: ['life-at-vardhaman'], outcomes: ['outcomes'], faq: ['faq']
};

export function sectionEnabled(settings, key) {
  return settings.sections?.[key] !== false;
}

export function validateSettings(settings) {
  assert.equal(settings.schema_version, '1.0');
  const site = new URL(settings.site_url);
  assert.ok(site.protocol === 'https:' && !site.username && !site.password && !site.search && !site.hash && site.pathname === '/', 'Site URL must be an HTTPS origin with a trailing slash');
  for (const key of ['title', 'description']) assert.ok(typeof settings.seo?.[key] === 'string' && settings.seo[key].trim(), `Missing SEO ${key}`);
  assert.equal(typeof settings.seo.indexing_enabled, 'boolean');
  if (settings.seo.google_site_verification !== undefined) assert.match(settings.seo.google_site_verification, /^google[0-9a-f]{16}\.html$/, 'Invalid Google verification file name');
  if (settings.seo.ai_training_crawlers !== undefined) assert.ok(['allow', 'block'].includes(settings.seo.ai_training_crawlers), 'seo.ai_training_crawlers must be "allow" or "block"');
  if (settings.seo.indexing_enabled) requireApproval(settings.seo.launch_approval, 'Indexing approval');
  if (settings.sections !== undefined) {
    for (const [key, value] of Object.entries(settings.sections)) {
      assert.ok(key in SECTION_FLAGS, `Unknown section flag: ${key}`);
      assert.equal(typeof value, 'boolean', `Section flag ${key} must be a boolean`);
    }
  }
  assert.equal(typeof settings.enquiry?.number_approved, 'boolean');
  const number = settings.enquiry.whatsapp_number;
  if (number !== null) assert.ok(typeof number === 'string' && /^[1-9]\d{7,14}$/.test(number), 'WhatsApp number must contain 8–15 international digits, without +, spaces or punctuation');
  if (settings.enquiry.number_approved) {
    assert.ok(number, 'Approved WhatsApp destination requires a number');
    requireApproval(settings.enquiry.approval_record, 'WhatsApp approval');
  }
  if (settings.location !== undefined) {
    assert.equal(typeof settings.location.map_approved, 'boolean', 'location.map_approved must be a boolean');
    const mapUrl = settings.location.map_url;
    if (mapUrl !== null && mapUrl !== undefined) assert.equal(new URL(mapUrl).protocol, 'https:', 'location.map_url must be an HTTPS URL');
    if (settings.location.map_approved) {
      assert.ok(mapUrl, 'Approved map link requires a URL');
      requireApproval(settings.location.approval_record, 'Map link approval');
    }
  }
  return settings;
}

export function siteRuntime(settings, { privateReview = false } = {}) {
  validateSettings(settings);
  return {
    privateReview,
    whatsappNumber: !privateReview && settings.enquiry.number_approved ? settings.enquiry.whatsapp_number : null,
    mapUrl: !privateReview && settings.location?.map_approved ? settings.location.map_url : null
  };
}

export function robotsPolicy(settings, { privateReview = false } = {}) {
  validateSettings(settings);
  return !privateReview && settings.seo.indexing_enabled ? 'index, follow' : 'noindex, nofollow';
}

export function productionHeaders(template, settings, options = {}) {
  return template.replace(/X-Robots-Tag: [^\r\n]+/, 'X-Robots-Tag: ' + robotsPolicy(settings, options));
}

const AI_SEARCH_BOTS = ['OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User'];
const AI_TRAINING_BOTS = ['GPTBot', 'ClaudeBot', 'Google-Extended', 'Applebot-Extended', 'CCBot'];

export function robotsFile(settings, options = {}) {
  if (robotsPolicy(settings, options).startsWith('noindex')) return 'User-agent: *\nDisallow: /\n';
  const group = (agents, rule) => agents.map(agent => `User-agent: ${agent}`).join('\n') + `\n${rule}\n`;
  const training = settings.seo.ai_training_crawlers === 'allow' ? 'Allow: /' : 'Disallow: /';
  return [
    'User-agent: *\nAllow: /\n',
    '# AI search and answer assistants: allowed, so families can find and be pointed to the academy',
    group(AI_SEARCH_BOTS, 'Allow: /'),
    `# AI model-training crawlers (${settings.seo.ai_training_crawlers === 'allow' ? 'allowed' : 'opted out'}; this does not affect Google Search or AI search results)`,
    group(AI_TRAINING_BOTS, training),
    `Sitemap: ${new URL('sitemap.xml', settings.site_url).href}\n`
  ].join('\n');
}

export function sitemapFile(settings, options = {}) {
  if (robotsPolicy(settings, options).startsWith('noindex')) return null;
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  ${[settings.site_url, ...pageUrls(settings)].map(url => `  <url><loc>${escape(url)}</loc></url>`).join('\n').trimStart()}\n</urlset>\n`;
}

// Structured data only ships when the site is public, and is built from the same
// approved settings and the page's own FAQ markup so it can never disagree with the page.
export function structuredData(settings, html, { image = null, logo = null } = {}) {
  const phone = settings.enquiry?.number_approved && /^[1-9]\d{7,14}$/.test(settings.enquiry.whatsapp_number || '') ? '+' + settings.enquiry.whatsapp_number : null;
  const text = value => value.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
  const organization = {
    '@type': ['EducationalOrganization', 'LocalBusiness'],
    '@id': settings.site_url + '#organization',
    name: 'Vardhaman Academy',
    url: settings.site_url,
    description: settings.seo.description,
    ...(image ? { image } : {}),
    ...(logo ? { logo } : {}),
    ...(phone ? { telephone: phone } : {}),
    address: { '@type': 'PostalAddress', addressLocality: 'Bansilal Nagar, Chhatrapati Sambhajinagar', addressRegion: 'Maharashtra', addressCountry: 'IN' },
    areaServed: { '@type': 'City', name: 'Chhatrapati Sambhajinagar' },
    knowsLanguage: ['English', 'Marathi'],
    ...(settings.location?.map_approved ? { hasMap: settings.location.map_url } : {}),
    founder: { '@type': 'Person', name: 'Rushabh Mutha', jobTitle: 'Teacher and mentor' }
  };
  const faqItems = [...html.matchAll(/<div class="faq-item[^"]*"><button[^>]*>([\s\S]*?)<span class="plus">[\s\S]*?<\/span><\/button><div class="faq-answer">([\s\S]*?)<\/div><\/div>/g)]
    .map(match => ({ '@type': 'Question', name: text(match[1]), acceptedAnswer: { '@type': 'Answer', text: text(match[2]) } }));
  const graph = [organization, ...(faqItems.length ? [{ '@type': 'FAQPage', mainEntity: faqItems }] : [])];
  return `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replaceAll('<', '\\u003c')}</script>`;
}

export function renderConceptScript(source, { privateReview = false } = {}) {
  return privateReview ? source : source.replace(/\s*\/\/ private-stories:start[\s\S]*?\/\/ private-stories:end\r?\n/g, '\n');
}

export function renderSiteHtml(source, settings, { privateReview = false, media, galleryMedia = media, outcomesMedia = [], results = [] } = {}) {
  validateSettings(settings);
  const seo = settings.seo;
  let html = source.replace(/<title>[^<]*<\/title>/, `<title>${escape(seo.title)}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${escape(seo.description)}">`)
    .replace(/<meta name="robots" content="[^"]*">/, `<meta name="robots" content="${robotsPolicy(settings, { privateReview })}">`);
  // Sharing uses only an already-approved public image, even in local review.
  const image = media?.hero ? new URL(media.hero, settings.site_url).href : null;
  const icon = media?.logo || null;
  const metadata = [
    `<link rel="canonical" href="${escape(settings.site_url)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:locale" content="en_IN">`,
    `<meta property="og:site_name" content="Vardhaman Academy">`,
    `<meta property="og:title" content="${escape(seo.title)}">`,
    `<meta property="og:description" content="${escape(seo.description)}">`,
    `<meta property="og:url" content="${escape(settings.site_url)}">`,
    `<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}">`,
    ...(image ? [`<meta property="og:image" content="${escape(image)}">`, `<meta property="og:image:alt" content="${escape(media.heroAlt)}">`] : []),
    ...(icon ? [`<link rel="icon" type="image/png" href="${escape(icon)}">`] : [])
  ].join('\n  ');
  html = html.replace('<!-- site-metadata -->', metadata + '\n  <!-- structured-data -->');
  html = html.replace('<!-- gallery-section -->', sectionEnabled(settings, 'gallery') ? renderGallery(galleryMedia) : '');
  html = html.replace('<!-- outcomes-section -->', sectionEnabled(settings, 'outcomes') ? renderOutcomes(outcomesMedia, results) : '');
  html = html.replace('<!-- hero-media -->', media?.hero
    ? `<img class="mentor-portrait" src="${escape(media.hero)}" alt="${escape(media.heroAlt)}" loading="eager" fetchpriority="high">`
    : '<span class="portrait-note">Rushabh Mutha · Vardhaman Academy</span>');
  html = html.replace('<!-- seminar-media -->', media?.mentor
    ? `<img class="mentor-event-photo" src="${escape(media.mentor)}" alt="${escape(media.mentorAlt)}" loading="lazy"><div class="teacher-photo-note">${escape(media.mentorCaption)}</div>`
    : '<span class="portrait-note">Rushabh Mutha · Vardhaman Academy</span>');
  for (const [key, anchors] of Object.entries(SECTION_FLAGS)) {
    const block = new RegExp(`[ \\t]*<!-- section:${key} -->\\r?\\n?([\\s\\S]*?)[ \\t]*<!-- /section:${key} -->\\r?\\n?`);
    html = html.replace(block, sectionEnabled(settings, key) ? '$1' : '');
    if (!sectionEnabled(settings, key)) for (const id of anchors) html = html.replace(new RegExp(`<a\\b[^>]*href="#${id}"[^>]*>[\\s\\S]*?<\\/a>`, 'g'), '');
  }
  if (!privateReview) html = html.replace(/\s*<!-- private-preview:start -->[\s\S]*?<!-- private-preview:end -->/g, '')
    .replace(/<a\b[^>]*href="#stories"[^>]*>[\s\S]*?<\/a>/g, '');
  if (privateReview) html = html.replace(/  <!-- Google tag \(gtag.js\): production only -->[\s\S]*?  <!-- \/Google tag -->\r?\n/, '');
  html = html.replace('\n  <!-- structured-data -->', !privateReview && settings.seo.indexing_enabled ? '\n  ' + structuredData(settings, html, { image, logo: icon ? new URL(icon, settings.site_url).href : null }) : '');
  return html;
}

export function verificationFile(settings) {
  const name = settings.seo.google_site_verification;
  return name ? { name, content: `google-site-verification: ${name}` } : null;
}
