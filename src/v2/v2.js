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

  // Metadata is rendered during the build from the owner's site settings.

  // Accurate brand name and grades throughout the pre-existing source copy.
  const replacements = [
    [/VARDHMAN ACADEMY/g, 'VARDHAMAN ACADEMY'],
    [/Vardhman Academy/g, 'Vardhaman Academy']
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
  if(heroBadge) heroBadge.innerHTML='<span class="sparkle">♡</span> Bansilal Nagar · Classes 1–10';
  const heroLead=q('.hero-parent .lead');
  if(heroLead) heroLead.textContent='At Vardhaman Academy, Rushabh Sir helps children build understanding, confidence and stronger learning habits. Because every child deserves to feel seen.';
  const heroButton=q('.hero-parent .hero-actions .btn.primary');
  if(heroButton) heroButton.innerHTML='Tell us about your child <span class="arrow">↗</span>';
  const heroTrust=q('.hero-parent .hero-trust p');
  if(heroTrust) heroTrust.innerHTML='<strong>5,000+ students taught</strong><br>Classes 1–10 · Bansilal Nagar';

  const portrait=q('.portrait-field');
  if(portrait && mediaConfig.hero) {
    if(!portrait.querySelector('.mentor-portrait')) portrait.innerHTML=`<img class="mentor-portrait" src="${mediaConfig.hero}" alt="${escapeText(mediaConfig.heroAlt || 'Rushabh Sir speaking with a microphone in a warm Vardhaman-themed portrait')}" loading="eager" fetchpriority="high">`;
  } else portrait?.classList.add('media-placeholder');
  const heroArt=q('.mentor-hero');
  if(heroArt) heroArt.setAttribute('aria-label',mediaConfig.hero ? 'Portrait of Rushabh Sir' : 'Rushabh Mutha, Vardhaman Academy');
  const plate=q('.mentor-nameplate span');
  if(plate) plate.textContent='Vardhaman Academy';

  const teacherArt=q('.teacher-art');
  if(teacherArt && mediaConfig.mentor) {
    if(!teacherArt.querySelector('.mentor-event-photo')) teacherArt.innerHTML=`<img class="mentor-event-photo" src="${mediaConfig.mentor}" alt="${escapeText(mediaConfig.mentorAlt || 'Rushabh Sir speaking during an external educational seminar')}" loading="lazy"><div class="teacher-photo-note">${escapeText(mediaConfig.mentorCaption || 'A real educational seminar appearance · External event, not hosted by Vardhaman Academy')}</div>`;
  } else if(teacherArt) teacherArt.innerHTML='<span class="portrait-note">Rushabh Mutha · Vardhaman Academy</span>';
  const teacherEyebrow=q('.teacher-copy .eyebrow');
  if(teacherEyebrow) teacherEyebrow.textContent='The heart of Vardhaman';
  qa('.teacher-facts .pill').forEach((pill,i) => {
    if(i===0) pill.textContent='📚 Classes 1–10';
  });

  // Keep the original grade-journey game, but expose only the confirmed offer.
  const newNavLabels={
    '#journey':'Classes 1–10',
    '#brainlab':'Brain Spark'
  };
  qa('#navLinks a').forEach(link => { if(newNavLabels[link.getAttribute('href')]) link.textContent=newNavLabels[link.getAttribute('href')]; });
  // The source journey owns the full 1–10 range and its wraparound controls.

  // The quiz stays interactive but uses grades within the actual academy range.
  const junior=q('#levelSwitch [data-level="junior"]');
  const middle=q('#levelSwitch [data-level="middle"]');
  const senior=q('#levelSwitch [data-level="senior"]');
  if(junior)junior.textContent='🌱 Class 1–4';
  if(middle)middle.textContent='🚀 Class 5–7';
  if(senior)senior.textContent='🎓 Class 8–10';
  const quizIntro=q('.brainlab .intro .muted');
  if(quizIntro)quizIntro.textContent='A playful three-question challenge for Class 1–10 learners and their parents. Pick a level and explore together.';

  // Enhance the build-rendered gallery; links also open originals without JS.
  const gallery=q('#life-at-vardhaman');
  const media=mediaConfig.gallery;
  const empty=gallery.querySelector('.gallery-empty');
  gallery.querySelector('.gallery-toolbar').hidden=false;

  // Important: the original HTML rearranges its sections on load. Insert our
  // new section into the *final* live order after the mentor section.
  const teacher=q('.teacher');
  teacher?.after(gallery);


  let selectedCategory='all',expanded=privateReview;
  const galleryToggle=gallery.querySelector('#galleryToggle');
  const gallerySummary=gallery.querySelector('#gallerySummary');
  function renderGalleryVisibility(){
    const limit=matchMedia('(max-width:520px)').matches?1:matchMedia('(max-width:780px)').matches?2:3;
    const matches=media.filter(item=>selectedCategory==='all'||item.category===selectedCategory);
    let shown=0;
    qa('.gallery-card').forEach(card=>{
      const included=selectedCategory==='all'||card.dataset.category===selectedCategory;
      card.hidden=!included||(!expanded&&shown>=limit);
      if(included&&!card.hidden)shown++;
    });
    empty.hidden=matches.length>0;
    empty.textContent=media.length?'No photos or videos in this category.':'Photos and videos will be shared here with permission.';
    gallerySummary.textContent=`Showing ${shown} of ${matches.length} moments`;
    gallery.querySelector('.gallery-disclosure').hidden=!matches.length;
    galleryToggle.hidden=matches.length<=limit;
    galleryToggle.setAttribute('aria-expanded',String(expanded));
    galleryToggle.textContent=expanded?'Show fewer':`View all ${matches.length} moments`;
  }
  qa('.gallery-tab').forEach(tab=>tab.addEventListener('click',()=>{
    selectedCategory=tab.dataset.category;expanded=privateReview;
    qa('.gallery-tab').forEach(x=>x.setAttribute('aria-pressed',String(x===tab)));
    renderGalleryVisibility();
  }));
  galleryToggle.addEventListener('click',()=>{
    expanded=!expanded;renderGalleryVisibility();
    galleryToggle.focus({preventScroll:true});
    if(!expanded)galleryToggle.scrollIntoView({block:'nearest'});
  });
  for(const query of ['(max-width:520px)','(max-width:780px)'])matchMedia(query).addEventListener('change',renderGalleryVisibility);
  renderGalleryVisibility();

  const modal=document.createElement('div');modal.className='media-modal';modal.id='mediaModal';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','Gallery media preview');
  modal.innerHTML='<div class="media-modal-panel"><button type="button" class="media-modal-close" aria-label="Close preview">×</button><div class="media-modal-stage" id="mediaModalStage"></div><div class="media-modal-caption" id="mediaModalCaption"></div></div>';
  document.body.append(modal);
  let lastFocused=null;
  function closeMedia(){const video=q('#mediaModalStage video');if(video)video.pause();q('#mediaModalStage').replaceChildren();modal.classList.remove('open');document.body.style.overflow='';window.VardhamanDialogs.close(modal);}
  function openMedia(id){const item=media.find(x=>x.id===id);if(!item)return;lastFocused=document.activeElement;const stage=q('#mediaModalStage');stage.replaceChildren();let el;
    if(item.type==='video'){
      el=document.createElement('video');el.controls=true;el.playsInline=true;el.preload='metadata';if(item.poster)el.poster=item.poster;el.src=item.src;
      el.setAttribute('aria-label',item.title);
    }else{
      el=document.createElement('img');el.src=item.src;el.alt=item.alt||item.title;
    }
    stage.append(el);q('#mediaModalCaption').innerHTML=`<strong>${escapeText(item.title)}</strong><p>${escapeText(item.desc)}${privateReview?' · Private media review.':''}</p>`;modal.classList.add('open');document.body.style.overflow='hidden';q('.media-modal-close')?.focus();window.VardhamanDialogs.open(modal,lastFocused);
    el.addEventListener('error', () => {
      const error=document.createElement('p');error.setAttribute('role','alert');
      error.textContent='This media could not be loaded. Please close the preview and try again later.';
      q('#mediaModalCaption').append(error);
    }, { once: true });
  }
  qa('[data-media]').forEach(button=>button.addEventListener('click',event=>{event.preventDefault();openMedia(button.dataset.media);}));
  q('.media-modal-close')?.addEventListener('click',closeMedia);
  modal.addEventListener('click',e=>{if(e.target===modal)closeMedia();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('open'))closeMedia();});

  // Footer semantics and the FAQ are kept aligned with the confirmed grades.
  const faq=qa('.faq-answer').find(el=>el.textContent.includes('Classes 1 through 10'));
  if(faq)faq.textContent='Vardhaman Academy currently supports Classes 1 through 10.';

  // A simple safeguard to detect accidental public promotion of unapproved media.
  document.documentElement.dataset.mediaReview=privateReview?'private-only':'approved-only';
})();
