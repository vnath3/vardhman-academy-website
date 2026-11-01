export const PUBLIC_BASE = '/media/vardhaman/';

// A release status is an allowlist, never a truthy/falsy approval flag.
export function mediaUrl(path) {
  if (typeof path !== 'string' || !/^assets\/[a-z0-9/-]+\.(png|jpe?g|mp4)$/.test(path)
      || path.includes('..')) throw new Error(`Invalid media path: ${path}`);
  return PUBLIC_BASE + path.slice('assets/'.length);
}

export function canPublish(asset) {
  return asset.publish_status === 'approved_for_public';
}

export function imageVariants(source) {
  if (!/\.(png|jpe?g)$/.test(source)) return [];
  const original = mediaUrl(source);
  return [480, 960, 1440].map(width => ({ width, url: original.replace(/\.(png|jpe?g)$/, `.${width}w.webp`) }));
}

export function imageSrcSet(source) {
  return imageVariants(source).map(({ width, url }) => `${url} ${width}w`).join(', ');
}

export function selectMedia(assets, { privateReview = false } = {}) {
  return assets.filter(asset => canPublish(asset)
    || (privateReview && asset.publish_status !== 'reference_only'));
}

export function toCard(asset) {
  const group = { activities: 'Activities', achievements: 'Achievements', mentor: 'Seminars' }[asset.category];
  return {
    id: asset.id, type: asset.type, title: asset.title,
    alt: asset.alt || asset.title, url: mediaUrl(asset.path),
    poster: asset.poster_path ? mediaUrl(asset.poster_path) : null,
    srcSet: asset.type === 'image' ? imageSrcSet(asset.path) : '',
    group: group || 'Learning', duration: asset.duration_seconds || null,
    caption: asset.category === 'mentor'
      ? 'Rushab Sir speaking at an external educational seminar. No school affiliation is implied.'
      : asset.category === 'achievements'
        ? 'Private review only. Award details and academy attribution remain unverified.'
        : asset.id === 'VID-04'
          ? 'Student activities. The camera turns sideways near the end; original footage is preserved.'
          : 'Student activities. Event dates and frequency are not confirmed.',
    approved: canPublish(asset)
  };
}
