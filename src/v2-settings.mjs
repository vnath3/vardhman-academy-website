import assert from 'node:assert/strict';

const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
function requireApproval(record, label) {
  for (const key of ['approved_by', 'approved_on', 'evidence']) assert.ok(typeof record?.[key] === 'string' && record[key].trim(), `${label}: missing ${key}`);
  assert.match(record.approved_on, /^\d{4}-\d{2}-\d{2}$/, `${label}: invalid date`);
}

export function validateSettings(settings) {
  assert.equal(settings.schema_version, '1.0');
  const site = new URL(settings.site_url);
  assert.ok(site.protocol === 'https:' && !site.username && !site.password && !site.search && !site.hash && site.pathname === '/', 'Site URL must be an HTTPS origin with a trailing slash');
  for (const key of ['title', 'description']) assert.ok(typeof settings.seo?.[key] === 'string' && settings.seo[key].trim(), `Missing SEO ${key}`);
  assert.equal(typeof settings.seo.indexing_enabled, 'boolean');
  if (settings.seo.indexing_enabled) requireApproval(settings.seo.launch_approval, 'Indexing approval');
  assert.equal(typeof settings.enquiry?.number_approved, 'boolean');
  const number = settings.enquiry.whatsapp_number;
  if (number !== null) assert.ok(typeof number === 'string' && /^[1-9]\d{7,14}$/.test(number), 'WhatsApp number must contain 8–15 international digits, without +, spaces or punctuation');
  if (settings.enquiry.number_approved) {
    assert.ok(number, 'Approved WhatsApp destination requires a number');
    requireApproval(settings.enquiry.approval_record, 'WhatsApp approval');
  }
  return settings;
}

export function siteRuntime(settings, { privateReview = false } = {}) {
  validateSettings(settings);
  return {
    privateReview,
    whatsappNumber: !privateReview && settings.enquiry.number_approved ? settings.enquiry.whatsapp_number : null
  };
}

export function robotsPolicy(settings, { privateReview = false } = {}) {
  validateSettings(settings);
  return !privateReview && settings.seo.indexing_enabled ? 'index, follow' : 'noindex, nofollow';
}

export function productionHeaders(template, settings, options = {}) {
  return template.replace(/X-Robots-Tag: [^\r\n]+/, 'X-Robots-Tag: ' + robotsPolicy(settings, options));
}

export function robotsFile(settings, options = {}) {
  return `User-agent: *\n${robotsPolicy(settings, options).startsWith('noindex') ? 'Disallow: /' : 'Allow: /'}\n`;
}

export function renderSiteHtml(source, settings, { privateReview = false, media } = {}) {
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
  html = html.replace('<!-- site-metadata -->', metadata);
  if (privateReview) html = html.replace(/  <!-- Google tag \(gtag.js\): production only -->[\s\S]*?  <!-- \/Google tag -->\r?\n/, '');
  return html;
}
