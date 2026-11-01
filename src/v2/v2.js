/* V2 enhancements for the original interactive Vardhaman concept.
 * Designed for an owner-private review. Photos/videos of minors require
 * guardian permission before any public release. No network submission here.
 */
(() => {
  'use strict';
  const q = s => document.querySelector(s);
  const qa = s => [...document.querySelectorAll(s)];

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
    const crop=document.createElement('span');
    crop.className='official-logo-crop';
    crop.setAttribute('role','img');
    crop.setAttribute('aria-label','Vardhaman Academy official blue-green wordmark');
    link.append(crop);
    if(index>0) link.style.minWidth='0';
  });

  const header=q('.site-header');
  const notice=document.createElement('div');
  notice.className='v2-review-flag';
  notice.textContent='V2 owner review · Real student media included for private evaluation · Not cleared for public release';
  header?.before(notice);

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
  if(portrait) portrait.innerHTML='<img class="mentor-portrait" src="./media/hero/rushab-warm-hero-v1.png" alt="Rushab Sir speaking with a microphone in a warm Vardhaman-themed portrait" loading="eager" fetchpriority="high">';
  const heroArt=q('.mentor-hero');
  if(heroArt) heroArt.setAttribute('aria-label','Concept portrait of Rushab Sir; likeness approval pending');
  const plate=q('.mentor-nameplate span');
  if(plate) plate.textContent='Vardhaman Academy';

  const teacherArt=q('.teacher-art');
  if(teacherArt) teacherArt.innerHTML='<img class="mentor-event-photo" src="./media/mentor/rushab-seminar-img-12.jpeg" alt="Rushab Sir speaking during an external educational seminar" loading="lazy"><div class="teacher-photo-note">A real educational seminar appearance · External event, not hosted by Vardhaman Academy</div>';
  const teacherPreview=q('.teacher .placeholder');
  if(teacherPreview) teacherPreview.textContent='Real seminar photography. Authentic student reviews and quotations will be added after verification and permission.';
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

  const media=[
    {id:'IMG-14',category:'activities',type:'photo',title:'A game of cricket',desc:'Friends, teamwork and time outside the classroom.',src:'./media/gallery/cricket-img-14.jpeg',alt:'Students playing cricket together on a turf ground'},
    {id:'VID-03',category:'activities',type:'video',title:'A little teamwork goes a long way',desc:'A lively tug-of-war moment during a group activity.',src:'./media/video/tug-of-war-vid-03.mp4',poster:'./media/video-posters/vid-03.jpg',duration:'0:26'},
    {id:'VID-05',category:'activities',type:'video',title:'Football and friendship',desc:'A short, joyful glimpse of students at play.',src:'./media/video/football-vid-05.mp4',poster:'./media/video-posters/vid-05.jpg',duration:'0:08'},
    {id:'IMG-18',category:'achievements',type:'photo',title:'A moment of recognition',desc:'An award photograph awaiting the student’s approved story.',src:'./media/review/olympiad-medal-img-18.jpeg',alt:'Student holding a medal and certificate'},
    {id:'IMG-19',category:'achievements',type:'photo',title:'A proud milestone',desc:'An authentic certificate photograph; details pending verification.',src:'./media/review/certificate-img-19.jpeg',alt:'Student holding a framed award certificate'},
    {id:'VID-04',category:'activities',type:'video',title:'A day together',desc:'A wider view of the group event outside the academy.',src:'./media/video/outdoor-event-vid-04.mp4',poster:'./media/video-posters/vid-04.jpg',duration:'0:54'},
    {id:'IMG-16',category:'activities',type:'photo',title:'Ready for the next ball',desc:'Learning sportsmanship one playful moment at a time.',src:'./media/gallery/cricket-img-16.jpeg',alt:'Students gathered on a cricket field'},
    {id:'VID-02',category:'activities',type:'video',title:'Tug-of-war, from another angle',desc:'Extended footage from the outdoor group activity.',src:'./media/video/tug-of-war-vid-02.mp4',poster:'./media/video-posters/vid-02.jpg',duration:'0:57'},
    {id:'VID-06',category:'activities',type:'video',title:'Cricket in motion',desc:'A quick glimpse of a cricket game.',src:'./media/video/cricket-vid-06.mp4',poster:'./media/video-posters/vid-06.jpg',duration:'0:04'},
    {id:'IMG-17',category:'community',type:'photo',title:'A community moment',desc:'An academy gathering; the legacy printed banner is not a current course list.',src:'./media/gallery/academy-event-img-17.jpeg',alt:'A small group at a Vardhaman Academy community event'}
  ];

  const grid=gallery.querySelector('#galleryGrid');
  grid.innerHTML=media.map(item=>`
    <article class="gallery-card" data-category="${item.category}" data-type="${item.category==='achievements'?'achievement':item.type}">
      <button type="button" class="gallery-action" data-media="${item.id}" aria-label="${item.type==='video'?'Play video':'View photo'}: ${item.title}">
        <div class="gallery-media-wrap"><img class="gallery-media" src="${item.poster||item.src}" alt="${item.alt||item.title}" loading="lazy">${item.type==='video'?'<span class="gallery-play" aria-hidden="true">▶</span>':''}</div>
        <div class="gallery-body"><span class="gallery-category">${item.category}${item.duration?' · '+item.duration:''}</span><strong>${item.title}</strong><p>${item.desc}</p><div class="gallery-card-bottom"><span class="gallery-consent">Owner review · Consent pending</span><span class="gallery-arrow" aria-hidden="true">↗</span></div></div>
      </button>
    </article>`).join('');

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
  }));

  const modal=document.createElement('div');modal.className='media-modal';modal.id='mediaModal';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','Gallery media preview');
  modal.innerHTML='<div class="media-modal-panel"><button type="button" class="media-modal-close" aria-label="Close preview">×</button><div class="media-modal-stage" id="mediaModalStage"></div><div class="media-modal-caption" id="mediaModalCaption"></div></div>';
  document.body.append(modal);
  let lastFocused=null;
  function closeMedia(){const video=q('#mediaModalStage video');if(video)video.pause();q('#mediaModalStage').replaceChildren();modal.classList.remove('open');document.body.style.overflow='';lastFocused?.focus();}
  function openMedia(id){const item=media.find(x=>x.id===id);if(!item)return;lastFocused=document.activeElement;const stage=q('#mediaModalStage');stage.replaceChildren();let el;
    if(item.type==='video'){
      el=document.createElement('video');el.controls=true;el.playsInline=true;el.preload='metadata';el.poster=item.poster;el.src=item.src;
      el.setAttribute('aria-label',item.title);
    }else{
      el=document.createElement('img');el.src=item.src;el.alt=item.alt||item.title;
    }
    stage.append(el);q('#mediaModalCaption').innerHTML=`<strong>${item.title}</strong><p>${item.desc} · Private preview only; permission review pending.</p>`;modal.classList.add('open');document.body.style.overflow='hidden';q('.media-modal-close')?.focus();
  }
  qa('[data-media]').forEach(button=>button.addEventListener('click',()=>openMedia(button.dataset.media)));
  q('.media-modal-close')?.addEventListener('click',closeMedia);
  modal.addEventListener('click',e=>{if(e.target===modal)closeMedia();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('open'))closeMedia();});

  // Footer semantics and the FAQ are kept aligned with the confirmed grades.
  const faq=qa('.faq-answer').find(el=>el.textContent.includes('Classes 1 through 10'));
  if(faq)faq.textContent='Vardhaman Academy currently supports Classes 5 through 10.';

  // A simple safeguard to detect accidental public promotion of unapproved media.
  document.documentElement.dataset.mediaReview='private-only';
})();
