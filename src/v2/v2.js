/* V2 enhancements for the original interactive Vardhaman concept.
 * Designed for an owner-private review. Photos/videos of minors require
 * guardian permission before any public release. No network submission here.
 */
(() => {
  'use strict';
  const q = s => document.querySelector(s);
  const qa = s => [...document.querySelectorAll(s)];
  // Missing build data fails closed: no private media or review mode.
  const mediaConfig = window.VARDHAMAN_MEDIA || { privateReview: false, gallery: [] };
  const privateReview = mediaConfig.privateReview === true;
  const escapeText = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));

  document.title = 'Vardhaman Academy — Every Child Deserves Someone Who Understands';
  const meta = q('meta[name="description"]');
  if (meta) meta.content = 'Vardhaman Academy, Bansilal Nagar. Classes 5–10. Meet Rushab Sir, explore learning journeys, activities and a personal parent enquiry guide.';

  // Accurate brand name and grades throughout the pre-existing source copy.
  const replacements = [
    [/VARDHMAN ACADEMY/g, 'VARDHAMAN ACADEMY'],
    [/Vardhman Academy/g, 'Vardhaman Academy'],
    [/Classes 1–10/g, 'Classes 5–10'],
    [/Classes 1 through 10/g, 'Classes 5 through 10'],
    [/Class 1–10/g, 'Class 5–10'],
    [/\b1–10\b/g, '5–10']
  ];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const textNodes=[];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  textNodes.forEach(node => {
    let value=node.nodeValue;
    replacements.forEach(([from,to]) => value=value.replace(from,to));
    if(value!==node.nodeValue) node.nodeValue=value;
  });

  // The original wordmark is displayed as a pixel-perfect CSS viewport on the
  // historical flyer, not AI-redrawn. Replace with supplied SVG/PNG later.
  qa('a.logo').forEach((link, index) => {
    link.setAttribute('aria-label','Vardhaman Academy home');
    if (!mediaConfig.logo) { link.classList.add('logo-text-fallback'); return; }
    document.documentElement.style.setProperty('--v2-logo-image', `url("${mediaConfig.logo}")`);
    if (mediaConfig.logoLayout) {
      document.documentElement.style.setProperty('--v2-logo-size', mediaConfig.logoLayout.size);
      document.documentElement.style.setProperty('--v2-logo-position', mediaConfig.logoLayout.position);
    }
    const crop=document.createElement('span');
    crop.className='official-logo-crop';
    crop.setAttribute('role','img');
    crop.setAttribute('aria-label',mediaConfig.logoAlt || 'Vardhaman Academy official blue-green wordmark');
    link.append(crop);
    if(index>0) link.style.minWidth='0';
  });

  const header=q('.site-header');
  const notice=document.createElement('div');
  notice.className='v2-review-flag';
  notice.textContent='V2 owner review · Real student media included for private evaluation · Not cleared for public release';
  if (privateReview) header?.before(notice);

  const heroHeading=q('.hero-parent h1');
  if(heroHeading) heroHeading.innerHTML='Every child learns differently. <em>Every child deserves someone who understands.</em>';
  const heroBadge=q('.hero-parent .hero-badge');
  if(heroBadge) heroBadge.innerHTML='<span class="sparkle">♡</span> Bansilal Nagar · Classes 5–10';
  const heroLead=q('.hero-parent .lead');
  if(heroLead) heroLead.textContent='At Vardhaman Academy, Rushab Sir helps children build understanding, confidence and stronger learning habits. Because every child deserves to feel seen.';
  const heroButton=q('.hero-parent .hero-actions .btn.primary');
  if(heroButton) heroButton.innerHTML='Tell us about your child <span class="arrow">↗</span>';
  const heroTrust=q('.hero-parent .hero-trust p');
  if(heroTrust) heroTrust.innerHTML='<strong>500+ students taught — as shared by the academy</strong><br>Classes 5–10 · Bansilal Nagar';

  const portrait=q('.portrait-field');
  if(portrait && mediaConfig.hero) portrait.innerHTML=`<img class="mentor-portrait" src="${mediaConfig.hero}" alt="${escapeText(mediaConfig.heroAlt || 'Rushab Sir speaking with a microphone in a warm Vardhaman-themed portrait')}" loading="eager" fetchpriority="high">`;
  else portrait?.classList.add('media-placeholder');
  const heroArt=q('.mentor-hero');
  if(heroArt) heroArt.setAttribute('aria-label',mediaConfig.hero ? 'Portrait of Rushab Sir' : 'Rushab Sir portrait placeholder');
  const plate=q('.mentor-nameplate span');
  if(plate) plate.textContent='Vardhaman Academy';

  const teacherArt=q('.teacher-art');
  if(teacherArt && mediaConfig.mentor) teacherArt.innerHTML=`<img class="mentor-event-photo" src="${mediaConfig.mentor}" alt="${escapeText(mediaConfig.mentorAlt || 'Rushab Sir speaking during an external educational seminar')}" loading="lazy"><div class="teacher-photo-note">${escapeText(mediaConfig.mentorCaption || 'A real educational seminar appearance · External event, not hosted by Vardhaman Academy')}</div>`;
  else if(teacherArt) teacherArt.innerHTML='<span class="portrait-monogram" aria-hidden="true">RM</span><span class="teacher-photo-note">Meet Rushab Sir · Vardhaman Academy</span>';
  const teacherPreview=q('.teacher .placeholder');
  if(teacherPreview) teacherPreview.textContent=privateReview ? 'Real seminar photography. Authentic student reviews and quotations will be added after verification and permission.' : 'Student stories and photographs will be shared with permission.';
  const teacherEyebrow=q('.teacher-copy .eyebrow');
  if(teacherEyebrow) teacherEyebrow.textContent='The heart of Vardhaman';
  qa('.teacher-facts .pill').forEach((pill,i) => {
    if(i===0) pill.textContent='📚 Classes 5–10';
  });

  // Keep the original grade-journey game, but expose only the confirmed offer.
  const newNavLabels={
    '#journey':'Classes 5–10',
    '#brainlab':'Brain Spark'
  };
  qa('#navLinks a').forEach(link => { if(newNavLabels[link.getAttribute('href')]) link.textContent=newNavLabels[link.getAttribute('href')]; });
  const gradePrev=q('#prevGrade');
  const gradeNext=q('#nextGrade');
  function currentClass(){ return Number(q('#stageNumber')?.textContent) || 5; }
  if(gradePrev){
    const copy=gradePrev.cloneNode(true);gradePrev.replaceWith(copy);
    copy.addEventListener('click',()=>window.setGrade(currentClass()===5?10:currentClass()-1));
  }
  if(gradeNext){
    const copy=gradeNext.cloneNode(true);gradeNext.replaceWith(copy);
    copy.addEventListener('click',()=>window.setGrade(currentClass()===10?5:currentClass()+1));
  }
  const gradeCount=q('#gradeCount');
  if(gradeCount) gradeCount.textContent='Class 5 / 10';
  const gradeBtns=qa('#classSelect .choice');
  // Source controls already contain only Classes 5?10; never remove valid options.

  // The quiz stays interactive but uses grades within the actual academy range.
  const junior=q('#levelSwitch [data-level="junior"]');
  const middle=q('#levelSwitch [data-level="middle"]');
  const senior=q('#levelSwitch [data-level="senior"]');
  if(junior)junior.textContent='🌱 Class 5–6';
  if(middle)middle.textContent='🚀 Class 7–8';
  if(senior)senior.textContent='🎓 Class 9–10';
  const quizIntro=q('.brainlab .intro .muted');
  if(quizIntro)quizIntro.textContent='A playful three-question challenge for Class 5–10 learners and their parents. Pick a level and explore together.';

  // Bring a real, owner-review-only photo/video story into the original design.
  const gallery=document.createElement('section');
  gallery.className='v2-gallery';
  gallery.id='life-at-vardhaman';
  gallery.setAttribute('aria-labelledby','galleryTitle');
  gallery.innerHTML=`
    <div class="container">
      <div class="gallery-intro">
        <div><span class="eyebrow">Learning has many moments</span><h2 class="h2" id="galleryTitle">Beyond books. <span style="color:var(--blue)">Into life.</span></h2></div>
        <p class="muted">From a spirited game of cricket to moments worth celebrating, here's a closer look at the people and experiences behind the academy.</p>
      </div>
      <span class="gallery-chip">✦ Real media · Private concept review</span>
      <div class="gallery-toolbar" aria-label="Filter gallery">
        <button class="gallery-tab" type="button" data-category="all" aria-pressed="true">All moments</button>
        <button class="gallery-tab" type="button" data-category="activities" aria-pressed="false">⚽ Sports & play</button>
        <button class="gallery-tab" type="button" data-category="achievements" aria-pressed="false">🏅 Achievements</button>
        <button class="gallery-tab" type="button" data-category="community" aria-pressed="false">💚 Community</button>
      </div>
      <div class="gallery-grid" id="galleryGrid"></div>
      <div class="gallery-footnote"><span aria-hidden="true">🛡</span><div><strong>Private-review footage.</strong> These are authentic photos and videos shared by the academy. Public release requires parent/guardian permissions for identifiable students and verification of award details. The event-banner photograph contains an older course listing and must not be reused as a current offer.</div></div>
    </div>`;

  const media=mediaConfig.gallery;

  const grid=gallery.querySelector('#galleryGrid');
  grid.innerHTML=media.map(item=>`
    <article class="gallery-card" data-category="${item.category}" data-type="${item.category==='achievements'?'achievement':item.type}">
      <button type="button" class="gallery-action" data-media="${item.id}" aria-label="${item.type==='video'?'Play video':'View photo'}: ${escapeText(item.title)}">
        <div class="gallery-media-wrap"><img class="gallery-media" src="${item.poster||item.src}" alt="${escapeText(item.alt||item.title)}" loading="lazy">${item.type==='video'?'<span class="gallery-play" aria-hidden="true">▶</span>':''}</div>
        <div class="gallery-body"><span class="gallery-category">${item.category}${item.duration?' · '+item.duration:''}</span><strong>${escapeText(item.title)}</strong><p>${escapeText(item.desc)}</p><div class="gallery-card-bottom"><span class="gallery-consent">${privateReview?'Owner review · Consent pending':'Shared with permission'}</span><span class="gallery-arrow" aria-hidden="true">↗</span></div></div>
      </button>
    </article>`).join('');

  if (!privateReview) {
    gallery.querySelector('.gallery-chip').textContent='Life at Vardhaman';
    gallery.querySelector('.gallery-footnote').remove();
  }
  const empty=document.createElement('p');
  empty.className='gallery-empty muted';
  empty.setAttribute('role','status');
  empty.textContent='Photos and videos will be shared here with permission.';
  empty.hidden=media.length>0;
  grid.after(empty);

  // Important: the original HTML rearranges its sections on load. Insert our
  // new section into the *final* live order after the mentor section.
  const teacher=q('.teacher');
  teacher?.after(gallery);
  const nav=q('#navLinks');
  if(nav){const a=document.createElement('a');a.href='#life-at-vardhaman';a.textContent='Life at Vardhaman';nav.insertBefore(a,nav.querySelector('a[href="#enquiry"]'));a.addEventListener('click',()=>{nav.classList.remove('open');const toggle=q('#mobileToggle');if(toggle){toggle.setAttribute('aria-expanded','false');toggle.textContent='☰';}});}

  qa('.gallery-tab').forEach(tab=>tab.addEventListener('click',()=>{
    const category=tab.dataset.category;
    qa('.gallery-tab').forEach(x=>x.setAttribute('aria-pressed',String(x===tab)));
    qa('.gallery-card').forEach(card=>card.hidden=category!=='all'&&card.dataset.category!==category);
    empty.hidden=media.some(item=>category==='all'||item.category===category);
    empty.textContent=media.length ? 'No photos or videos in this category yet.' : 'Photos and videos will be shared here with permission.';
  }));

  const modal=document.createElement('div');modal.className='media-modal';modal.id='mediaModal';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','Gallery media preview');
  modal.innerHTML='<div class="media-modal-panel"><button type="button" class="media-modal-close" aria-label="Close preview">×</button><div class="media-modal-stage" id="mediaModalStage"></div><div class="media-modal-caption" id="mediaModalCaption"></div></div>';
  document.body.append(modal);
  let lastFocused=null;
  function closeMedia(){const video=q('#mediaModalStage video');if(video)video.pause();q('#mediaModalStage').replaceChildren();modal.classList.remove('open');document.body.style.overflow='';lastFocused?.focus();}
  function openMedia(id){const item=media.find(x=>x.id===id);if(!item)return;lastFocused=document.activeElement;const stage=q('#mediaModalStage');stage.replaceChildren();let el;
    if(item.type==='video'){
      el=document.createElement('video');el.controls=true;el.playsInline=true;el.preload='metadata';if(item.poster)el.poster=item.poster;el.src=item.src;
      el.setAttribute('aria-label',item.title);
    }else{
      el=document.createElement('img');el.src=item.src;el.alt=item.alt||item.title;
    }
    stage.append(el);q('#mediaModalCaption').innerHTML=`<strong>${escapeText(item.title)}</strong><p>${escapeText(item.desc)}${privateReview?' · Private preview only; permission review pending.':''}</p>`;modal.classList.add('open');document.body.style.overflow='hidden';q('.media-modal-close')?.focus();
  }
  qa('[data-media]').forEach(button=>button.addEventListener('click',()=>openMedia(button.dataset.media)));
  q('.media-modal-close')?.addEventListener('click',closeMedia);
  modal.addEventListener('click',e=>{if(e.target===modal)closeMedia();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('open'))closeMedia();});

  // Footer semantics and the FAQ are kept aligned with the confirmed grades.
  const faq=qa('.faq-answer').find(el=>el.textContent.includes('Classes 1 through 10'));
  if(faq)faq.textContent='Vardhaman Academy currently supports Classes 5 through 10.';

  // A simple safeguard to detect accidental public promotion of unapproved media.
  document.documentElement.dataset.mediaReview=privateReview?'private-only':'approved-only';
})();
