import { mediaUrl, canPublish, imageSrcSet } from './media.mjs';

export const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);

function renderHero({ e, content, hero, showHero, headline }) {
  return `    <section class="hero wrap" aria-labelledby="hero-heading">
      <div class="hero-copy"><p class="eyebrow"><span class="small-line" aria-hidden="true"></span>${e(content.hero.eyebrow)}</p>
        <h1 id="hero-heading">${headline}</h1>
        <p class="intro">${e(content.hero.body)}</p>
        <a class="button" href="${e(content.hero.cta.target)}">${e(content.hero.cta.label)} <span aria-hidden="true">↗</span></a>
        <p class="location"><span aria-hidden="true">⌖</span> ${e(content.hero.support_line)}</p>
      </div>
      <figure class="hero-portrait ${showHero ? '' : 'portrait-placeholder'}">
        ${showHero ? `<img src="${mediaUrl(hero.path)}" srcset="${imageSrcSet(hero.path)}" sizes="(max-width: 720px) 100vw, 600px" alt="${e(hero.alt)}" width="1672" height="941" fetchpriority="high">` : `<div class="portrait-monogram" aria-hidden="true">R</div><p>Rushab Mutha<br><span>Known to students as Rushab Sir</span></p>`}
        <figcaption><span class="mentor-dot" aria-hidden="true"></span><span><strong>Rushab Sir</strong><small>A little patience. A clearer path.</small></span></figcaption>
      </figure>
    </section>`;
}

function renderMentor({ e, section }) {
  return `    <section class="section wrap mentor-section" id="meet-mentor" aria-labelledby="mentor-heading">
      <div><p class="eyebrow">The person behind the learning</p><h2 id="mentor-heading">${e(section('meet-mentor').title)}<span class="green-period">.</span></h2></div>
      <div class="section-copy"><p class="lead">A familiar face. A thoughtful place to begin.</p><p>Rushab Mutha is the mentor behind Vardhaman Academy. Here, the conversation starts with your child: what feels clear, what feels difficult, and what they want to understand.</p><p class="editorial-note">A fuller introduction, in Rushab Sir’s own words, is being prepared.</p><a class="text-link" href="#contact">Start a conversation <span aria-hidden="true">↗</span></a></div>
    </section>`;
}

function renderParentEmpathy({ e, section }) {
  return `    <section class="empathy-section" id="parent-empathy" aria-labelledby="empathy-heading"><div class="wrap section">
      <p class="eyebrow">A question many parents share</p><h2 id="empathy-heading">${e(section('parent-empathy').title)}</h2>
      <div class="concerns">${section('parent-empathy').questions.map((question, index) => `<article class="concern"><span class="card-number">0${index + 1}</span><h3>${e(question)}</h3></article>`).join('')}</div>
      <p class="reassurance">You know your child best. A conversation is a good place to start.</p>
    </div></section>`;
}

function renderLearningApproach({ e, section }) {
  return `    <section class="section wrap" id="learning-approach" aria-labelledby="approach-heading">
      <div class="section-heading"><div><p class="eyebrow">One step at a time</p><h2 id="approach-heading">${e(section('learning-approach').title)}</h2></div><p class="section-aside">A proposed approach, awaiting Rushab Sir’s confirmation.</p></div>
      <div class="approach-grid">${section('learning-approach').items_proposed_pending_mentor_confirmation.map((item, index) => `<article><span class="approach-icon" aria-hidden="true">${['↗', '?', '✓'][index]}</span><h3>${e(item)}</h3><p>${['Making room to understand the idea behind an answer.', 'A space where a doubt can become a conversation.', 'Taking the next step with purpose and care.'][index]}</p></article>`).join('')}</div>
    </section>`;
}

function renderStudentJourneys({ e, section }) {
  return `    <section class="journey-section wrap" id="student-journeys" aria-labelledby="journeys-heading"><div><p class="eyebrow">Progress is personal</p><h2 id="journeys-heading">${e(section('student-journeys').title)}</h2></div><p>Every student’s experience deserves to be told with care. We’ll share their learning journeys here once the details and permissions are confirmed.</p></section>`;
}

function renderGallery({ e, section }) {
  return `    <section class="section wrap" id="beyond-books" aria-labelledby="gallery-heading">
      <div class="section-heading"><div><p class="eyebrow">Beyond books</p><h2 id="gallery-heading">${e(section('beyond-books').title)}</h2></div><p class="section-aside">Small moments of play, teamwork and discovery.</p></div>
      <div class="gallery-filters" role="group" aria-label="Filter gallery">${['All', 'Learning', 'Achievements', 'Activities', 'Seminars'].map((label, index) => `<button type="button" class="filter" data-filter="${label}" aria-pressed="${index === 0}">${label}</button>`).join('')}</div>
      <p id="gallery-status" class="gallery-status" role="status"></p><div id="gallery" class="gallery-grid"></div>
      <div id="gallery-empty" class="gallery-empty"><span class="empty-symbol" aria-hidden="true">↗</span><h3>A little more to the story</h3><p>Glimpses of learning and activities will appear here as photos and permissions are confirmed.</p></div>
      <noscript><p>The interactive gallery needs JavaScript. Photos and videos will be shared only after approval.</p></noscript>
    </section>`;
}

function renderReviews({ e, section }) {
  return `    <section class="voices-section" id="reviews" aria-labelledby="reviews-heading"><div class="wrap section"><p class="eyebrow">The voices that matter</p><h2 id="reviews-heading">${e(section('reviews').title)}</h2><p>Real experiences, shared with permission. This space is reserved for approved first-hand accounts from our community.</p></div></section>`;
}

function renderContact({ e, section, content }) {
  return `    <section class="section wrap contact-section" id="contact" aria-labelledby="contact-heading"><div><p class="eyebrow">A good next step</p><h2 id="contact-heading">${e(section('contact').title)}</h2><p>${e(section('contact').body)}</p></div><div class="contact-card"><p class="eyebrow">Vardhaman Academy</p><h3>Classes 5–10</h3><p>${e(content.academy.location_short)}</p><p class="contact-note">Phone and enquiry options will be added after confirmation. This page does not collect enquiry details.</p></div></section>`;
}

export function renderPage(content, assets, { localReview = false } = {}) {
  const e = escapeHtml;
  const hero = assets.find(asset => asset.id === content.hero.media_id);
  const showHero = hero && (localReview || canPublish(hero));
  const section = id => content.sections.find(item => item.id === id);
  const headlineBreak = content.hero.headline.indexOf('. ') + 1;
  const headline = `${e(content.hero.headline.slice(0, headlineBreak))}<br><em>${e(content.hero.headline.slice(headlineBreak).trim())}</em>`;
  const context = { e, content, hero, showHero, headline, section };
  const nav = `<a href="#meet-mentor">Meet Rushab Sir</a><a href="#learning-approach">Our approach</a><a href="#beyond-books">Beyond books</a>`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Vardhaman Academy | Classes 5–10 · Chhatrapati Sambhajinagar</title>
  <meta name="description" content="${e(content.hero.body)} Classes 5–10 in Bansilal Nagar, Chhatrapati Sambhajinagar.">
  <meta name="robots" content="noindex, nofollow">
  <meta name="theme-color" content="#F8F9F3">
  <meta property="og:title" content="Vardhaman Academy · Classes 5–10">
  <meta property="og:description" content="${e(content.hero.body)}">
  <meta property="og:type" content="website">
  <link rel="stylesheet" href="/styles.css">
  <script type="module" src="/app.js"></script>
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  ${localReview ? `<aside class="review-bar" aria-label="Private local review"><div class="wrap review-inner"><span><strong>Local review</strong> · Media and copy await approval</span><label class="review-switch"><input id="private-review" type="checkbox"> Show media for private review</label></div><p id="review-status" role="status" class="wrap" hidden></p></aside>` : ''}
  <header class="site-header wrap">
    <!-- Original isolated logo is missing. Preserve identity with text; never redraw the mark. -->
    <a class="wordmark" href="#" aria-label="Vardhaman Academy home">Vardhaman<span>ACADEMY</span></a>
    <nav class="desktop-nav" aria-label="Main navigation">${nav}</nav>
    <a class="button button-small" href="#contact">Let’s talk <span aria-hidden="true">↗</span></a>
  </header>
  <main id="main">
    ${renderHero(context)}
    <div class="intro-strip"><div class="wrap strip-inner"><span>For curious minds in <strong>Classes 5–10</strong></span><span>Understanding. Confidence. Learning habits.</span></div></div>
    ${renderMentor(context)}
    ${renderParentEmpathy(context)}
    ${renderLearningApproach(context)}
    ${renderStudentJourneys(context)}
    ${renderGallery(context)}
    ${renderReviews(context)}
    ${renderContact(context)}
  </main>
  <footer class="site-footer"><div class="wrap footer-inner"><a class="wordmark" href="#">Vardhaman<span>ACADEMY</span></a><p>Understanding today.<br>Confidence for the next step.</p><p>Classes 5–10<br>Bansilal Nagar, Chhatrapati Sambhajinagar</p></div></footer>
</body></html>`;
}
