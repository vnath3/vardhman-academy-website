// Build-time gallery markup: the same approved media remains readable without JS.
const escapeText = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
export function renderGallery({ gallery: media = [], privateReview = false } = {}) {
  const cards = media.map(item=>`
    <article class="gallery-card" data-category="${item.category}" data-type="${item.category==='achievements'?'achievement':item.type}">
      <a href="${escapeText(item.src)}" class="gallery-action" data-media="${item.id}" aria-label="${item.type==='video'?'Play video':'View photo'}: ${escapeText(item.title)}">
        <div class="gallery-media-wrap"><img class="gallery-media" src="${item.poster||item.src}" alt="${escapeText(item.alt||item.title)}" loading="lazy">${item.type==='video'?'<span class="gallery-play" aria-hidden="true">▶</span>':''}</div>
        <div class="gallery-body"><span class="gallery-category">${({activities:'Sports &amp; play',achievements:'Achievements',community:'Community'})[item.category]||item.category}${item.duration?' · '+item.duration:''}</span><strong>${escapeText(item.title)}</strong><p>${escapeText(item.desc)}</p><div class="gallery-card-bottom">${privateReview?'<span class="gallery-consent">Owner review · Not published</span>':''}<span class="gallery-arrow" aria-hidden="true">↗</span></div></div>
      </a>
    </article>`).join('');
  return `<section class="v2-gallery" id="life-at-vardhaman" aria-labelledby="galleryTitle">
    <div class="container">
      <div class="gallery-intro">
        <div><span class="eyebrow">Learning has many moments</span><h2 class="h2" id="galleryTitle">Beyond books. <span style="color:var(--blue)">Into life.</span></h2></div>
        <p class="muted">From a spirited game of cricket to moments worth celebrating, here's a closer look at the people and experiences behind the academy.</p>
      </div>
      <span class="gallery-chip">${privateReview ? '✦ Real media · Private concept review' : 'Life at Vardhaman · shared with each family\'s permission'}</span>
      <div hidden class="gallery-toolbar" aria-label="Filter gallery">
        <button class="gallery-tab" type="button" data-category="all" aria-pressed="true">All moments</button>
        <button class="gallery-tab" type="button" data-category="activities" aria-pressed="false">⚽ Sports & play</button>
        <button class="gallery-tab" type="button" data-category="achievements" aria-pressed="false">🏅 Achievements</button>
        <button class="gallery-tab" type="button" data-category="community" aria-pressed="false">💚 Community</button>
      </div>
      <div class="gallery-grid" id="galleryGrid">${cards}</div><p class="gallery-empty muted" role="status"${media.length ? ' hidden' : ''}>Photos and videos will be shared here with permission.</p>
      <div hidden class="gallery-disclosure"><p class="muted" id="gallerySummary" role="status" aria-live="polite"></p><button class="btn light" type="button" id="galleryToggle" aria-controls="galleryGrid" aria-expanded="false">View all moments</button></div>
      ${privateReview ? `<div class="gallery-footnote"><span aria-hidden="true">🛡</span><div><strong>Private-review footage.</strong> These are authentic photos and videos shared by the academy. Public release requires parent/guardian permissions for identifiable students and verification of award details. The event-banner photograph contains an older course listing and must not be reused as a current offer.</div></div>` : ''}
    </div></section>`;
}
