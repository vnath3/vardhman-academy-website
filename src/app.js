const gallery = document.querySelector('#gallery');
const empty = document.querySelector('#gallery-empty');
const status = document.querySelector('#gallery-status');
const reviewToggle = document.querySelector('#private-review');
let cards = [];
let filter = 'All';

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function pauseVideos(except) {
  gallery.querySelectorAll('video').forEach(video => {
    if (video !== except) video.pause();
  });
}

const visibilityObserver = new IntersectionObserver(entries => {
  entries.forEach(({ target, isIntersecting }) => { if (!isIntersecting) target.pause(); });
}, { threshold: 0.15 });

function imageFor(card, poster = false) {
  const image = element('img', 'media-frame');
  image.src = poster ? card.poster : card.url;
  if (!poster && card.srcSet) {
    image.srcset = card.srcSet;
    image.sizes = '(max-width: 720px) 100vw, (max-width: 1000px) 50vw, 400px';
  }
  image.alt = poster ? '' : card.alt;
  image.loading = 'lazy';
  image.decoding = 'async';
  return image;
}

function renderGallery() {
  pauseVideos();
  visibilityObserver.disconnect();
  gallery.replaceChildren();
  const visible = cards.filter(card => filter === 'All' || card.group === filter);
  empty.hidden = visible.length > 0;
  status.textContent = visible.length ? `${visible.length} ${visible.length === 1 ? 'item' : 'items'}${reviewToggle?.checked ? ' · Private review; permissions still required' : ''}` : '';
  visible.forEach(card => {
    const article = element('article', 'media-card');
    article.dataset.mediaId = card.id;
    if (card.type === 'video') {
      const launch = element('button', 'video-launch');
      launch.type = 'button';
      launch.setAttribute('aria-label', `Play ${card.title}`);
      launch.append(imageFor(card, true), element('span', 'play-label', `▶ Play · ${Math.round(card.duration)}s`));
      launch.addEventListener('click', () => {
        pauseVideos();
        const video = element('video');
        video.controls = true;
        video.playsInline = true;
        video.preload = 'metadata';
        video.poster = card.poster;
        video.src = card.url;
        video.setAttribute('aria-label', card.title);
        const fallback = element('p', '', 'Your browser cannot play this video.');
        video.append(fallback);
        // Event clips have no verified speech transcript; describe their visual content nearby.
        const description = element('span', '', `Video: ${card.title}. ${card.caption}`);
        description.id = `description-${card.id}`;
        description.hidden = true;
        video.setAttribute('aria-describedby', description.id);
        launch.replaceWith(video, description);
        video.addEventListener('play', () => pauseVideos(video));
        visibilityObserver.observe(video);
        video.focus();
        video.play().catch(() => { /* Native controls remain available if playback is blocked. */ });
      });
      article.append(launch);
    } else article.append(imageFor(card));
    const copy = element('div', 'media-copy');
    copy.append(element('p', 'eyebrow', card.group), element('h3', '', card.title), element('p', '', card.caption));
    if (!card.approved) copy.append(element('div', 'media-review-note', 'Private review only · Not approved for publication'));
    article.append(copy);
    gallery.append(article);
  });
}

document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  filter = button.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  renderGallery();
}));

async function loadCatalogue() {
  const response = await fetch('/catalogue.json', { cache: 'no-store' });
  if (!response.ok) throw new Error('Catalogue unavailable');
  cards = await response.json();
  renderGallery();
}

reviewToggle?.addEventListener('change', async () => {
  reviewToggle.disabled = true;
  const reviewStatus = document.querySelector('#review-status');
  reviewStatus.hidden = true;
  pauseVideos();
  gallery.replaceChildren();
  cards = [];
  empty.hidden = false;
  try {
    const response = await fetch('/__review', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: reviewToggle.checked })
    });
    if (!response.ok) throw new Error('Review unavailable');
    await loadCatalogue();
  } catch {
    reviewToggle.checked = false;
    renderGallery();
    reviewStatus.textContent = 'Private review could not be changed. Reload the local preview to try again.';
    reviewStatus.hidden = false;
  } finally { reviewToggle.disabled = false; }
});

document.addEventListener('visibilitychange', () => { if (document.hidden) pauseVideos(); });
window.addEventListener('pagehide', () => pauseVideos());
loadCatalogue().catch(() => { status.textContent = 'The gallery is temporarily unavailable. Please try again later.'; });
