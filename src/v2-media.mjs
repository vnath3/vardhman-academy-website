import assert from 'node:assert/strict';

const sections = ['logo', 'hero', 'mentor', 'gallery', 'archive', 'poster'];
const statuses = ['approved', 'pending', 'rejected'];
const safePath = (value, prefix) => typeof value === 'string'
  && value.startsWith(prefix) && new RegExp('^' + prefix + '(?:[a-z0-9_-]+/)*[a-z0-9_-]+\\.(png|jpe?g|mp4)$').test(value)
  && !value.includes('..') && /\.(png|jpe?g|mp4)$/.test(value);

export function validateV2Manifest(manifest) {
  assert.equal(manifest.schema_version, '2.0', 'Unsupported V2 media schema');
  assert.equal(manifest.release_policy, 'default_deny');
  assert.ok(Array.isArray(manifest.assets), 'Media assets must be an array');
  const ids = new Map(), paths = new Set(), sources = new Set();
  for (const asset of manifest.assets) {
    assert.match(asset.id, /^[A-Z0-9-]+$/, 'Invalid media ID');
    assert.ok(!ids.has(asset.id), `Duplicate media ID: ${asset.id}`);
    ids.set(asset.id, asset);
    assert.ok(['image', 'video'].includes(asset.type), `Invalid media type: ${asset.id}`);
    assert.ok(sections.includes(asset.section), `Invalid section: ${asset.id}`);
    assert.ok(statuses.includes(asset.approval_status), `Invalid approval status: ${asset.id}`);
    assert.ok(safePath(asset.source_path, 'media/vardhaman/'), `Invalid source path: ${asset.id}`);
    assert.ok(safePath(asset.production_path, 'media/'), `Invalid production path: ${asset.id}`);
    assert.ok(!paths.has(asset.production_path), `Duplicate production path: ${asset.id}`);
    assert.ok(!sources.has(asset.source_path), `Duplicate source path: ${asset.id}`);
    paths.add(asset.production_path); sources.add(asset.source_path);
    assert.equal(asset.type === 'video', asset.source_path.endsWith('.mp4'), `Source extension/type mismatch: ${asset.id}`);
    assert.equal(asset.type === 'video', asset.production_path.endsWith('.mp4'), `Output extension/type mismatch: ${asset.id}`);
    for (const field of ['original_filename', 'title', 'alt', 'caption']) {
      assert.ok(typeof asset[field] === 'string' && asset[field].trim(), `Missing ${field}: ${asset.id}`);
    }
    assert.ok(Array.isArray(asset.required_verifications) && asset.required_verifications.includes('usage_rights'), `Usage rights requirement missing: ${asset.id}`);
    if (asset.contains_identifiable_students || asset.contains_student_voices) {
      assert.ok(asset.required_verifications.includes('guardian_consent'), `Guardian consent requirement missing: ${asset.id}`);
    }
    assert.ok(asset.verified && typeof asset.verified === 'object', `Missing verification record: ${asset.id}`);
    assert.equal(typeof asset.contains_identifiable_students, 'boolean', `Missing student-identity classification: ${asset.id}`);
    if (asset.type === 'video') {
      assert.equal(typeof asset.contains_student_voices, 'boolean', `Missing voice classification: ${asset.id}`);
      assert.ok(Number.isFinite(asset.duration_seconds) && asset.duration_seconds > 0, `Invalid video duration: ${asset.id}`);
    }
    if (asset.approval_status === 'approved') {
      for (const requirement of asset.required_verifications) assert.equal(asset.verified[requirement], true, `Unverified ${requirement}: ${asset.id}`);
      for (const field of ['approved_by', 'approved_on', 'evidence']) {
        assert.ok(typeof asset.approval_record?.[field] === 'string' && asset.approval_record[field].trim(), `Missing approval ${field}: ${asset.id}`);
      }
      assert.match(asset.approval_record.approved_on, /^\d{4}-\d{2}-\d{2}$/, `Invalid approval date: ${asset.id}`);
    }
    if (asset.section === 'gallery') {
      assert.ok(['activities', 'achievements', 'community'].includes(asset.category), `Invalid gallery category: ${asset.id}`);
    }
  }
  for (const asset of manifest.assets) {
    if (asset.type === 'video') {
      const poster = ids.get(asset.poster_id);
      assert.ok(poster?.section === 'poster' && poster.parent_id === asset.id && poster.type === 'image', `Video requires a linked poster: ${asset.id}`);
    }
    if (asset.section === 'poster') assert.equal(ids.get(asset.parent_id)?.poster_id, asset.id, `Orphan poster: ${asset.id}`);
  }
  for (const slot of ['logo', 'hero', 'mentor']) {
    for (const mode of ['review', 'public']) assert.equal(ids.get(manifest.slots?.[slot]?.[mode])?.type, 'image', `Invalid ${slot} ${mode} slot`);
  }
  return ids;
}

export function planMedia(manifest, { privateReview = false } = {}) {
  const byId = validateV2Manifest(manifest);
  const copies = new Map();
  const allowed = asset => asset && (privateReview || asset.approval_status === 'approved');
  const url = asset => {
    if (!allowed(asset)) return null;
    copies.set(asset.production_path, { id: asset.id, source_path: asset.source_path, production_path: asset.production_path });
    return './' + asset.production_path;
  };
  const slotAsset = slot => byId.get(manifest.slots[slot][privateReview ? 'review' : 'public']);
  const logo = slotAsset('logo'), hero = slotAsset('hero'), mentor = slotAsset('mentor');
  const runtime = {
    privateReview, logo: url(logo),
    logoLayout: logo.derivation ? { size: logo.derivation.display_background_size, position: logo.derivation.display_background_position } : null,
    logoAlt: logo.alt, hero: url(hero), heroAlt: hero.alt,
    mentor: url(mentor), mentorAlt: mentor.alt, mentorCaption: mentor.caption, gallery: []
  };
  const gallery = manifest.assets.filter(asset => asset.section === 'gallery')
    .sort((a, b) => (a.gallery_order ?? Number.MAX_SAFE_INTEGER) - (b.gallery_order ?? Number.MAX_SAFE_INTEGER));
  for (const asset of gallery) {
    if (!allowed(asset)) continue;
    const poster = asset.type === 'video' ? byId.get(asset.poster_id) : null;
    if (poster && !allowed(poster)) continue;
    const seconds = Math.round(asset.duration_seconds || 0);
    runtime.gallery.push({
      id: asset.id, category: asset.category, type: asset.type === 'video' ? 'video' : 'photo',
      title: asset.title, desc: privateReview ? asset.review_caption || asset.caption : asset.caption,
      alt: asset.alt, src: url(asset), ...(poster ? { poster: url(poster), duration: `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}` } : {})
    });
  }
  if (privateReview) for (const asset of manifest.assets) url(asset);
  return { runtime, copies: [...copies.values()], files: [...copies.keys()].map(file => file.slice('media/'.length)) };
}
