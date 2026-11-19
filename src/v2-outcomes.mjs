import assert from 'node:assert/strict';
import { renderResults } from './v2-results.mjs';

// Real, owner-confirmed alumni outcomes — not illustrative stories. Each
// entry needs its own consent/evidence record before it can reach
// production, mirroring the approval-record pattern already used for
// gallery media and the WhatsApp/map settings. Default-deny: unapproved
// or unverified entries never render.
const safePath = (value, prefix) => typeof value === 'string'
  && value.startsWith(prefix) && new RegExp('^' + prefix + '(?:[a-z0-9_-]+/)*[a-z0-9_-]+\\.(png|jpe?g)$').test(value)
  && !value.includes('..');

function requireApproval(record, label) {
  for (const key of ['approved_by', 'approved_on', 'evidence']) assert.ok(typeof record?.[key] === 'string' && record[key].trim(), `${label}: missing ${key}`);
  assert.match(record.approved_on, /^\d{4}-\d{2}-\d{2}$/, `${label}: invalid date`);
}

export function validateOutcomes(doc) {
  assert.equal(doc.schema_version, '1.0', 'Unsupported outcomes schema');
  assert.equal(doc.release_policy, 'default_deny');
  assert.ok(Array.isArray(doc.outcomes), 'outcomes must be an array');
  const ids = new Set(), paths = new Set();
  for (const outcome of doc.outcomes) {
    assert.match(outcome.id, /^[A-Z0-9-]+$/, `Invalid outcome ID: ${outcome.id}`);
    assert.ok(!ids.has(outcome.id), `Duplicate outcome ID: ${outcome.id}`);
    ids.add(outcome.id);
    assert.ok(['approved', 'pending', 'rejected'].includes(outcome.approval_status), `Invalid approval status: ${outcome.id}`);
    for (const field of ['name', 'relationship', 'headline', 'description']) {
      assert.ok(typeof outcome[field] === 'string' && outcome[field].trim(), `Missing ${field}: ${outcome.id}`);
    }
    assert.ok(Array.isArray(outcome.required_verifications)
      && outcome.required_verifications.includes('usage_rights')
      && outcome.required_verifications.includes('subject_consent'), `Missing required verifications: ${outcome.id}`);
    assert.ok(Array.isArray(outcome.media) && outcome.media.length > 0, `Outcome needs at least one media item: ${outcome.id}`);
    for (const asset of outcome.media) {
      assert.ok(safePath(asset.source_path, 'media/vardhaman/outcomes/'), `Invalid source path: ${asset.id}`);
      assert.ok(safePath(asset.production_path, 'media/outcomes/'), `Invalid production path: ${asset.id}`);
      assert.ok(!paths.has(asset.production_path), `Duplicate production path: ${asset.id}`);
      paths.add(asset.production_path);
      for (const field of ['alt', 'caption']) assert.ok(typeof asset[field] === 'string' && asset[field].trim(), `Missing ${field}: ${asset.id}`);
      if (asset.role !== undefined) assert.ok(['hero', 'document'].includes(asset.role), `Invalid media role: ${asset.id}`);
    }
    if (outcome.approval_status === 'approved') {
      for (const requirement of outcome.required_verifications) assert.equal(outcome.verified?.[requirement], true, `Unverified ${requirement}: ${outcome.id}`);
      requireApproval(outcome.approval_record, `Outcome approval: ${outcome.id}`);
    }
  }
  return doc.outcomes;
}

export function planOutcomes(doc, { privateReview = false } = {}) {
  const outcomes = validateOutcomes(doc);
  const copies = new Map();
  const approved = outcomes.filter(outcome => privateReview || outcome.approval_status === 'approved');
  const runtime = approved.map(outcome => {
    for (const asset of outcome.media) copies.set(asset.production_path, { id: asset.id, source_path: asset.source_path, production_path: asset.production_path });
    return {
      id: outcome.id, name: outcome.name, relationship: outcome.relationship,
      headline: outcome.headline, description: outcome.description,
      media: outcome.media.map(asset => ({ src: './' + asset.production_path, alt: asset.alt, caption: asset.caption, role: asset.role === 'document' ? 'document' : 'hero' }))
    };
  });
  return { runtime, copies: [...copies.values()], files: [...copies.keys()].map(file => file.slice('media/'.length)) };
}

export function renderOutcomes(outcomes = [], results = []) {
  if (!outcomes.length && !results.length) return '';
  const escapeText = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const cards = outcomes.map(outcome => {
    const hero = outcome.media.find(item => item.role === 'hero') ?? outcome.media[0];
    const documents = outcome.media.filter(item => item !== hero);
    const thumbs = documents.map(item => `
          <figure class="outcome-thumb"><img src="${escapeText(item.src)}" alt="${escapeText(item.alt)}" loading="lazy"><figcaption>${escapeText(item.caption)}</figcaption></figure>`).join('');
    return `
    <article class="outcome-card reveal">
      <div class="outcome-hero"><img src="${escapeText(hero.src)}" alt="${escapeText(hero.alt)}" loading="lazy"></div>
      <div class="outcome-body">
        <span class="outcome-relationship">${escapeText(outcome.relationship)}</span>
        <h3>${escapeText(outcome.name)}</h3>
        <strong class="outcome-headline">${escapeText(outcome.headline)}</strong>
        <p>${escapeText(outcome.description)}</p>
        ${documents.length ? `<div class="outcome-thumbs">${thumbs}</div>` : ''}
      </div>
    </article>`;
  }).join('');
  const resultsBlock = results.length ? renderResults(results) : '';
  const alumni = outcomes.length ? `
      <div class="alumni-head reveal"><h3>Where some of our students are today</h3></div>
      <div class="outcome-grid">${cards}</div>` : '';
  const heading = results.length
    ? `<span class="eyebrow">Real results</span><h2 class="h2" id="outcomesTitle">Our students' <span style="color:var(--blue)">results.</span></h2>`
    : `<span class="eyebrow">Real outcomes</span><h2 class="h2" id="outcomesTitle">Where some of our students <span style="color:var(--blue)">are today.</span></h2>`;
  return `<section class="v2-outcomes section-space" id="outcomes" aria-labelledby="outcomesTitle"><div class="container">
      <div class="intro center reveal">${heading}</div>
      ${resultsBlock}${alumni}
    </div></section>`;
}
