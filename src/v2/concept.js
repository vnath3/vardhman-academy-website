
    const $=(s)=>document.querySelector(s), $$=(s)=>Array.from(document.querySelectorAll(s));
    const main=$('main');['.hero','.trust-strip','.parent-message','.teacher','.v2-outcomes','.stories','.v2-gallery','.features','#first-month','#brainlab','.faq','#enquiry'].forEach(selector=>{const section=$(selector);if(section)main.append(section);});
    $('#year').textContent=new Date().getFullYear();
    $('#mobileToggle').addEventListener('click',()=>{const open=$('#navLinks').classList.toggle('open');$('#mobileToggle').setAttribute('aria-expanded',String(open));$('#mobileToggle').textContent=open?'×':'☰';});
    $$('#navLinks a').forEach(a=>a.addEventListener('click',()=>{$('#navLinks').classList.remove('open');$('#mobileToggle').setAttribute('aria-expanded','false');$('#mobileToggle').textContent='☰';}));
    // One rAF-batched scroll tick drives three bits of chrome at once: the
    // reading-progress bar, a header that tightens up once you're past the
    // hero, and a back-to-top control — rather than three separate listeners.
    // Hero recede: copy and portrait each get a 0..1 progress that starts as
    // that element scrolls off the top, so on mobile (stacked) the portrait
    // isn't faded before you've even reached it.
    const heroEl=$('.hero-parent'), heroCopy=heroEl&&heroEl.querySelector('.hero-copy'), heroArt=heroEl&&heroEl.querySelector('.mentor-hero');
    const heroReduce=matchMedia('(prefers-reduced-motion: reduce)');
    let heroSpans=null, heroLast={copy:-1,art:-1};
    function measureHero(){
      if(!heroEl)return;
      heroEl.style.setProperty('--hp-copy',0);heroEl.style.setProperty('--hp-art',0);
      const span=el=>{if(!el)return null;const r=el.getBoundingClientRect();return {start:r.top+scrollY-40,len:Math.max(220,r.height*.9)};};
      heroSpans={copy:span(heroCopy),art:span(heroArt)};heroLast={copy:-1,art:-1};
    }
    function heroRecede(y){
      if(!heroEl||heroReduce.matches)return;
      if(!heroSpans)measureHero();
      for(const [key,name] of [['copy','--hp-copy'],['art','--hp-art']]){
        const s=heroSpans[key];if(!s)continue;
        const p=Math.round(Math.min(1,Math.max(0,(y-s.start)/s.len))*200)/200;
        if(p!==heroLast[key]){heroEl.style.setProperty(name,p);heroLast[key]=p;}
      }
    }
    window.addEventListener('resize',()=>{heroSpans=null;});
    // Count-up stats: numbers climb to their value the first time they're seen.
    (function(){
      const nodes=$$('.hero-trust .proof-seal strong, .trust-item strong');
      if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
      const ease=t=>1-Math.pow(1-t,3);
      const prepare=el=>{
        const text=el.textContent.trim();let m,from=0,to,fmt;
        if((m=text.match(/^([\d,]+)(\+?)$/))){to=parseInt(m[1].replace(/,/g,''),10);fmt=n=>Math.round(n).toLocaleString('en-US')+m[2];}
        else if((m=text.match(/^(\d+)([–-])(\d+)$/))){from=+m[1];to=+m[3];fmt=n=>m[1]+m[2]+Math.round(n);}
        else return null;
        // Keep the box the width of the final number so nothing shifts while counting.
        const w=el.getBoundingClientRect().width;
        if(getComputedStyle(el).display==='inline')el.style.display='inline-block';
        el.style.minWidth=w+'px';
        el.classList.add('count-up');
        el.innerHTML='<span aria-hidden="true"></span><span class="sr-only"></span>';
        el.lastChild.textContent=text;const shown=el.firstChild;shown.textContent=fmt(from);
        return {el,shown,from,to,fmt};
      };
      const items=nodes.map(prepare).filter(Boolean);
      const run=item=>{
        const t0=performance.now(),dur=1700;
        const step=now=>{const t=Math.min(1,(now-t0)/dur);item.shown.textContent=item.fmt(item.from+(item.to-item.from)*ease(t));if(t<1)requestAnimationFrame(step);};
        requestAnimationFrame(step);
      };
      const io=new IntersectionObserver(entries=>entries.forEach(e=>{
        if(!e.isIntersecting)return;io.unobserve(e.target);
        const item=items.find(i=>i.el===e.target);
        if(item)setTimeout(()=>run(item),e.target.closest('.hero')?650:0);
      }),{threshold:.6});
      items.forEach(i=>io.observe(i.el));
    })();
    const siteHeader=$('.site-header'), backToTop=$('#backToTop');
    let headerScrolled=false, backVisible=false;
    let lastScrollY=0,scrollingUp=false;const mobileMQ=matchMedia('(max-width: 780px)');
    let scrollScheduled=false;window.addEventListener('scroll',()=>{if(scrollScheduled)return;scrollScheduled=true;requestAnimationFrame(()=>{
      const d=document.documentElement;
      $('#readingProgress').style.width=((d.scrollTop/(d.scrollHeight-d.clientHeight))*100||0)+'%';
      const y=scrollY;
      const scrolled=y>12;
      if(scrolled!==headerScrolled){siteHeader?.classList.toggle('scrolled',scrolled);headerScrolled=scrolled;}
      // On phones the button only appears while scrolling up, so it never sits over content that is being read.
      if(Math.abs(y-lastScrollY)>4){scrollingUp=y<lastScrollY;lastScrollY=y;}
      const show=y>innerHeight*.8&&(!mobileMQ.matches||scrollingUp);
      if(show!==backVisible){backToTop?.classList.toggle('visible',show);backToTop?.setAttribute('aria-hidden',String(!show));if(backToTop)backToTop.tabIndex=show?0:-1;backVisible=show;}
      heroRecede(y);
      if(window.__scrollFx)window.__scrollFx(y);
      scrollScheduled=false;
    });},{passive:true});
    if(backToTop)backToTop.addEventListener('click',()=>{
      window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    });
    // Scrollspy: exactly one nav link is current, chosen from scroll position
    // (the last linked section whose top has passed the reading line), so it
    // is independent of DOM/visual order and never double-highlights.
    {
      const navLinks=$$('#navLinks a[href^="#"]').filter(a=>a.getAttribute('href').length>1);
      const items=navLinks.map(a=>({a,el:document.getElementById(a.getAttribute('href').slice(1))})).filter(i=>i.el);
      let currentLink=null,ticking=false;
      const update=()=>{
        ticking=false;
        const line=(document.querySelector('.site-header')?.offsetHeight||72)+window.innerHeight*.28;
        let best=null;
        items.forEach(i=>{const r=i.el.getBoundingClientRect();if(r.top<=line&&r.bottom>line&&(!best||r.top>best.el.getBoundingClientRect().top))best=i;});
        const next=best?best.a:null;
        if(next===currentLink)return;
        if(currentLink){currentLink.classList.remove('current');currentLink.removeAttribute('aria-current');}
        if(next){next.classList.add('current');next.setAttribute('aria-current','true');}
        currentLink=next;
      };
      const request=()=>{if(!ticking){ticking=true;requestAnimationFrame(update);}};
      window.addEventListener('scroll',request,{passive:true});
      window.addEventListener('resize',request);
      update();
    }
    // Register after the final page/gallery layout. Text stays readable before
    // an entrance; only the parent underline is linked to scroll distance.
    document.addEventListener('DOMContentLoaded', () => {
      const preference = matchMedia('(prefers-reduced-motion: reduce)');
      const parentHeading = $('#parents h2'), parentWord = $('#parents .become-word');
      const targets = new Set(), pending = new Set(), recentScroll = [];
      const canObserve = 'IntersectionObserver' in window;
      let observer, underlineProgress = 0, fastUntil = 0, lastY = scrollY, scheduled = false;
      const progress = value => {
        underlineProgress = Math.max(underlineProgress, Math.min(1, Math.max(0, value)));
        parentHeading?.style.setProperty('--underline-progress', underlineProgress);
      };
      const finish = element => {
        if (element === parentHeading) progress(1);
        element.classList.add('motion-instant', 'visible');
        pending.delete(element);
        observer?.unobserve(element);
      };
      const enter = (element, instant = false) => {
        if (!pending.has(element)) return;
        if (instant || preference.matches) finish(element);
        else {
          element.classList.add('visible');
          pending.delete(element);
          observer?.unobserve(element);
        }
      };
      const add = (element, kind, order = 0) => {
        if (!element) return;
        element.classList.add('reveal', `reveal-${kind}`);
        element.style.setProperty('--reveal-order', order);
        targets.add(element); pending.add(element);
      };
      // Sections handled explicitly below (cards, gallery) are excluded here
      // so they don't also pick up the plain, unstaggered treatment.
      $$('.reveal').forEach(element => {
        if (element.closest('.hero, #first-month, #brainlab, #enquiry, #parents, #about, .features, .faq, .v2-outcomes')) element.classList.remove('reveal');
        else { element.classList.add('reveal-card'); targets.add(element); pending.add(element); }
      });
      add(parentHeading, 'parent');
      const concerns = $$('#parents .worry-item');
      concerns.forEach((element, index) => add(element, 'concern', index));
      add($('#about .teacher-art'), 'mentor');
      add($('#about h2'), 'mentor');
      // These groups previously had no scroll-entrance at all (a dead .reveal
      // class with nothing wiring it up) — feature tiles, FAQ rows and the
      // outcome cards now fade+rise in, staggered across each row.
      add($('.features .intro'), 'card');
      $$('.feature-card').forEach((element, index) => add(element, 'card', index));
      add($('.faq-grid > div:first-child'), 'card');
      $$('.faq-grid > div:last-child .faq-item').forEach((element, index) => add(element, 'card', index));
      add($('.v2-outcomes .intro'), 'card');
      $$('.outcome-card').forEach((element, index) => add(element, 'card', index));
      // The gallery is a self-moving carousel now; the strip as a whole eases in.
      add($('#galleryGrid'), 'card');
      const finishWithin = section => targets.forEach(element => {
        if (section?.contains(element)) finish(element);
      });
      const updateParent = () => {
        if (!canObserve || preference.matches || !parentHeading || !parentWord) return;
        const mobile = matchMedia('(max-width:780px)').matches;
        // Wait until the entire heading is above the mobile CTA / viewport edge.
        // Compensate for its lift so animation does not itself draw the line.
        const transform = getComputedStyle(parentHeading).transform;
        const lift = transform === 'none' ? 0 : new DOMMatrixReadOnly(transform).m42;
        const headingBottom = parentHeading.getBoundingClientRect().bottom - lift;
        if (headingBottom <= innerHeight * (mobile ? .89 : .94)) enter(parentHeading);
        const wordBottom = parentWord.getBoundingClientRect().bottom - lift;
        if (parentHeading.classList.contains('visible')) {
          // About 190-210px of natural scroll, entirely inside the viewport.
          progress((innerHeight * .79 - wordBottom) / (innerHeight * .23));
        }
        if (underlineProgress === 1) concerns.forEach(element => {
          if (element.getBoundingClientRect().top < innerHeight * (mobile ? .85 : .90)) enter(element);
        });
      };
      const jump = hash => {
        let section;
        try { section = document.getElementById(decodeURIComponent(hash.slice(1))); } catch { return; }
        if (!section) return;
        fastUntil = performance.now() + 1200;
        finishWithin(section);
      };
      if (!canObserve || preference.matches) targets.forEach(finish);
      else {
        parentHeading?.classList.add('parent-scroll');
        parentHeading?.style.setProperty('--underline-progress', 0);
        observer = new IntersectionObserver(entries => entries.forEach(entry => {
          if (entry.isIntersecting) enter(entry.target, performance.now() < fastUntil);
        }), { threshold: .08, rootMargin: '0px 0px -64px 0px' });
        pending.forEach(element => {
          if (!element.closest('#parents')) observer.observe(element);
        });
      }
      if (location.hash) jump(location.hash);
      requestAnimationFrame(updateParent);
      document.addEventListener('click', event => {
        const link = event.target.closest('a[href]');
        if (!link) return;
        const url = new URL(link.href, location.href);
        if (url.origin === location.origin && url.pathname === location.pathname && url.hash) jump(url.hash);
      });
      window.addEventListener('hashchange', () => jump(location.hash));
      window.addEventListener('scroll', () => {
        const now = performance.now(), distance = Math.abs(scrollY - lastY);
        recentScroll.push({ time: now, distance });
        while (recentScroll.length && recentScroll[0].time < now - 120) recentScroll.shift();
        // A normal wheel tick or slow touch stroke is not a fast swipe. Require
        // substantial travel in a short window instead of one instantaneous rate.
        if (recentScroll.reduce((sum, sample) => sum + sample.distance, 0) > Math.max(300, innerHeight * .45)) fastUntil = now + 180;
        lastY = scrollY;
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(() => {
          scheduled = false;
          targets.forEach(element => {
            const rect = element.getBoundingClientRect();
            if (rect.bottom < 0 || (performance.now() < fastUntil && rect.top < innerHeight)) finish(element);
          });
          updateParent();
        });
      }, { passive: true });
      // Keyboard focus and real controls bypass delays. A touch starting a
      // scrolling gesture on text must not consume the whole parent sequence.
      for (const type of ['focusin', 'pointerdown']) document.addEventListener(type, event => {
        if (event.target.closest('a, button, input, textarea, select, [tabindex]')) finishWithin(event.target.closest('section'));
      });
      window.addEventListener('resize', () => { finishWithin($('#life-at-vardhaman')); updateParent(); });
      preference.addEventListener('change', () => {
        if (preference.matches) targets.forEach(finish);
      });
    }, { once: true });
    if($('#quizNext')){
    const quizSets={
      junior:[
        {subject:'NUMBER SPARK',question:'What number comes right after 29?',choices:['30','31','28','39'],correct:0,why:'You counted forward one step — that takes us to 30.'},
        {subject:'WORD SPARK',question:'Which of these is an action word?',choices:['Blue','Jump','Round','Quiet'],correct:1,why:'Jump is something we can do, so it is an action word.'},
        {subject:'SHAPE SPARK',question:'How many sides does a triangle have?',choices:['2','4','3','5'],correct:2,why:'A triangle always has three sides.'}
      ],
      middle:[
        {subject:'MATH SPARK',question:'What is ¾ of 20?',choices:['12','15','16','18'],correct:1,why:'One quarter of 20 is 5. Three quarters make 15.'},
        {subject:'SCIENCE SPARK',question:'Which part of a plant absorbs water from soil?',choices:['Flower','Leaf','Stem','Roots'],correct:3,why:'Roots take in water and minerals from the soil.'},
        {subject:'WORD SPARK',question:'Which word is closest in meaning to “curious”?',choices:['Interested','Angry','Sleepy','Silent'],correct:0,why:'Curious means eager to know or understand something.'}
      ],
      senior:[
        {subject:'ALGEBRA SPARK',question:'Solve 2x + 6 = 18. What is x?',choices:['4','5','6','12'],correct:2,why:'Subtract 6 from both sides to get 2x = 12, then divide by 2.'},
        {subject:'BIOLOGY SPARK',question:'Which gas do green plants absorb during photosynthesis?',choices:['Oxygen','Nitrogen','Hydrogen','Carbon dioxide'],correct:3,why:'Plants use carbon dioxide, water and light to produce sugars.'},
        {subject:'GEOMETRY SPARK',question:'In a right triangle, a² + b² equals…',choices:['c²','2c','a + b','c³'],correct:0,why:'Pythagoras’ theorem states a² + b² = c² for a right triangle.'}
      ]
    };
    let quizLevel='middle',quizStep=0,quizPoints=0,quizAnswered=false;
    function renderQuiz(){
      const items=quizSets[quizLevel],finished=quizStep>=items.length;
      $('#quizPlay').hidden=finished;$('#quizResult').hidden=!finished;
      $('#quizProgress').style.width=(finished?100:((quizStep+1)/items.length)*100)+'%';
      $('#quizScore').textContent=`${quizPoints} discovered ✨`;
      if(finished){
        $('#quizCount').textContent='Challenge complete';
        $('#resultSymbol').textContent=quizPoints===3?'🏆':'🌟';
        $('#resultHeadline').textContent=quizPoints===3?'Brilliant brain sparks!':'Curiosity unlocked!';
        $('#resultText').textContent=`You explored all three questions and found ${quizPoints} correct answer${quizPoints===1?'':'s'}. The best part is the curiosity to keep learning. Try another level or talk with Rushabh Sir about your child's learning needs.`;
        return;
      }
      const item=items[quizStep];quizAnswered=false;
      $('#quizCount').textContent=`Question ${quizStep+1} of ${items.length}`;
      $('#quizSubject').textContent=item.subject;$('#quizQuestion').textContent=item.question;
      $('#quizFeedback').textContent='';$('#quizFeedback').className='quiz-feedback';
      $('#quizNext').disabled=true;$('#quizNext').textContent=quizStep===items.length-1?'See your spark ✨':'Next question →';
      const list=$('#quizChoices');list.innerHTML='';
      item.choices.forEach((choice,index)=>{const button=document.createElement('button');button.type='button';button.className='quiz-choice';button.textContent=choice;button.addEventListener('click',()=>answerQuiz(index));list.append(button);});
    }
    function answerQuiz(choiceIndex){
      if(quizAnswered)return;quizAnswered=true;
      const item=quizSets[quizLevel][quizStep],correct=choiceIndex===item.correct;
      if(correct)quizPoints++;
      $$('#quizChoices .quiz-choice').forEach((button,index)=>{button.disabled=true;if(index===item.correct)button.classList.add('correct');else if(index===choiceIndex)button.classList.add('incorrect');});
      const feedback=$('#quizFeedback');feedback.className='quiz-feedback '+(correct?'good':'try');feedback.textContent=(correct?'✓ Well spotted! ':'✦ Nice try! ')+item.why;
      $('#quizScore').textContent=`${quizPoints} discovered ✨`;$('#quizNext').disabled=false;
    }
    function resetQuiz(level){quizLevel=level;quizStep=0;quizPoints=0;$$('#levelSwitch button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.level===level)));renderQuiz();}
    $$('#levelSwitch button').forEach(b=>b.addEventListener('click',()=>resetQuiz(b.dataset.level)));
    $('#quizNext').addEventListener('click',()=>{if(quizAnswered){quizStep++;renderQuiz();}});
    $('#quizAgain').addEventListener('click',()=>resetQuiz(quizLevel));
    renderQuiz();
    } // end brainlab
    // private-stories:start
    if($('#storyTrack')){
    const stories=[
      {type:'Aviation journey',title:'A dream takes flight',subtitle:'Curiosity today. Big skies tomorrow.',symbol:'✈️',theme:'#a8dcff',start:'A student who kept asking how things worked.',now:'A path toward an aviation career.',desc:'This sample narrative illustrates an alumnus who develops confidence in science and mathematics and later discovers an interest in aviation. We can showcase the actual turning points when verified.'},
      {type:'Medical journey',title:'The courage to care',subtitle:'From learning basics to helping others.',symbol:'🩺',theme:'#ffd5db',start:'A learner drawn to biology and helping people.',now:'A path toward medicine.',desc:'An illustrative arc from school lessons and steady practice to a future in healthcare. The production version can feature a real former student and their own reflections.'},
      {type:'Engineering journey',title:'Always building, always learning',subtitle:'Big solutions start with small questions.',symbol:'⚙️',theme:'#d4c7ff',start:'A child fascinated by how things fit together.',now:'An engineering pathway.',desc:'An example of how curiosity and stronger foundational concepts can be part of a longer educational story. Rushabh Sir’s real alumni can bring this to life.'},
      {type:'Confidence journey',title:'From hesitant to fearless',subtitle:'Not every victory needs a trophy.',symbol:'🌟',theme:'#ffdf88',start:'A child hesitant to answer in class.',now:'More willing to ask, try and participate.',desc:'A growth story does not have to end with a prestigious job. A parent may recognise their own child in this example of growing confidence and willingness to learn.'},
      {type:'Creative journey',title:'Ideas become possibilities',subtitle:'The confidence to think differently.',symbol:'🎨',theme:'#b6eed6',start:'A curious child who liked creating things.',now:'Exploring a design-focused direction.',desc:'This placeholder demonstrates that successful students can choose creative fields, too. The real version should use authentic student achievements and permissioned materials.'}
    ];
    const track=$('#storyTrack'),storyViewport=track.closest('.story-viewport'),storyGroups={all:[0,1,2,3,4],stem:[0,1,2],personal:[3,4]};
    let visibleStoryIds=storyGroups.all,storyIndex=0;
    function slidesPerView(){return window.innerWidth<=520?1:window.innerWidth<=1050?2:3;}
    function maxStoryIndex(){return Math.max(0,visibleStoryIds.length-slidesPerView());}
    function showStory(n){
      storyIndex=Math.max(0,Math.min(maxStoryIndex(),n));
      const first=track.querySelector('.story-card');if(!first)return;
      const shift=first.getBoundingClientRect().width+19;track.style.transform=`translateX(${-storyIndex*shift}px)`;
      // The transform owns horizontal position. Native focus scrolling must
      // not add a second offset that can leave the viewport blank.
      storyViewport.scrollLeft=0;
      $('#storyDots').innerHTML='';
      for(let i=0;i<=maxStoryIndex();i++){const b=document.createElement('button');b.setAttribute('aria-label',`View story group ${i+1}`);b.className=i===storyIndex?'active':'';b.addEventListener('click',()=>showStory(i));$('#storyDots').append(b);}
      $('#storyPrev').disabled=storyIndex===0;$('#storyNext').disabled=storyIndex===maxStoryIndex();
    }
    function renderStories(filter){
      visibleStoryIds=storyGroups[filter];
      track.style.transform='translateX(0)';
      track.classList.toggle('few',visibleStoryIds.length<3);
      track.innerHTML=visibleStoryIds.map((i,idx)=>{const s=stories[i];return `<button class="story-card" style="--i:${idx}" data-story="${i}" aria-label="Open sample story: ${s.title}"><div class="story-visual" style="--theme:${s.theme}"><span class="story-bubble">Sample story 0${i+1}</span><span class="story-object">${s.symbol}</span></div><div class="story-body"><span class="small">${s.type}</span><h3>${s.title}</h3><p>${s.subtitle}</p><div class="story-bottom"><span>Explore the journey</span><span>↗</span></div></div></button>`;}).join('');
      $$('#storyFilters button').forEach(b=>{const selected=b.dataset.filter===filter;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected));});
      showStory(0);
    }
    $$('#storyFilters button').forEach(b=>b.addEventListener('click',()=>renderStories(b.dataset.filter)));
    $('#storyPrev').addEventListener('click',()=>showStory(storyIndex-1));
    $('#storyNext').addEventListener('click',()=>showStory(storyIndex+1));
    function syncStoryFocus(target){
      const card=target.closest?.('.story-card');
      const index=Array.from(track.children).indexOf(card);
      let nextIndex=Math.min(storyIndex,maxStoryIndex());
      if(index>=0){
        if(index<nextIndex)nextIndex=index;
        else if(index>=nextIndex+slidesPerView())nextIndex=index-slidesPerView()+1;
      }
      showStory(nextIndex);
    }
    track.addEventListener('focusin',event=>syncStoryFocus(event.target));
    storyViewport.addEventListener('scroll',()=>{if(storyViewport.scrollLeft)storyViewport.scrollLeft=0;});
    window.addEventListener('resize',()=>syncStoryFocus(document.activeElement));
    renderStories('all');
    // The cards slide in from the right the first time this section scrolls
    // into view. .pending is what makes a card start hidden — so with no
    // IntersectionObserver support, cards are just visible, never stuck.
    const storiesSection=document.querySelector('.stories');
    if('IntersectionObserver' in window && storiesSection){
      track.classList.add('pending');
      const storyObserver=new IntersectionObserver(entries=>{
        entries.forEach(entry=>{if(entry.isIntersecting){track.classList.add('cards-in');track.classList.remove('pending');storyObserver.disconnect();}});
      },{threshold:.2});
      storyObserver.observe(storiesSection);
    }
    let lastFocus=null;function openStory(i){const s=stories[i];lastFocus=document.activeElement;$('#modalSymbol').textContent=s.symbol;$('#modalTitle').textContent=s.title;$('#modalDesc').textContent=s.desc;$('#modalStart').textContent=s.start;$('#modalNow').textContent=s.now;$('#storyModal').classList.add('open');document.body.style.overflow='hidden';$('#modalClose').focus();window.VardhamanDialogs.open($('#storyModal'),lastFocus);}function closeStory(){$('#storyModal').classList.remove('open');document.body.style.overflow='';window.VardhamanDialogs.close($('#storyModal'));}track.addEventListener('click',e=>{const card=e.target.closest('[data-story]');if(card)openStory(Number(card.dataset.story));});$('#modalClose').addEventListener('click',closeStory);$('#modalEnd').addEventListener('click',closeStory);$('#storyModal').addEventListener('click',e=>{if(e.target===$('#storyModal'))closeStory();});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#storyModal').classList.contains('open'))closeStory();});
    }
    // private-stories:end
    $$('.faq-item button').forEach(b=>b.addEventListener('click',()=>{const p=b.closest('.faq-item');const next=!p.classList.contains('open');p.classList.toggle('open',next);b.setAttribute('aria-expanded',String(next));}));

// ---- Scroll-linked set pieces: word-fill headline, in-frame photo parallax. All driven from the shared scroll tick above. ----
(function(){
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const $=(s)=>document.querySelector(s),$$=(s)=>Array.from(document.querySelectorAll(s));
  const fx=[];

  // 1. Headline fills in word by word as it scrolls into the reading zone.
  (function(){
    const h=$('#parents h2');if(!h||reduce.matches)return;
    const words=[];
    const wrap=node=>Array.from(node.childNodes).forEach(n=>{
      if(n.nodeType===3){
        const frag=document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part=>{
          if(!part)return;
          if(/^\s+$/.test(part)){frag.append(part);return;}
          const w=document.createElement('span');w.className='fw';w.textContent=part;frag.append(w);words.push(w);
        });
        n.replaceWith(frag);
      }else if(n.nodeType===1){
        if(n.classList.contains('become-word')){const w=document.createElement('span');w.className='fw';while(n.firstChild)w.append(n.firstChild);n.append(w);words.push(w);}
        else wrap(n);
      }
    });
    wrap(h);h.classList.add('fill-ready');
    let shown=-1;
    fx.push(()=>{
      const top=h.getBoundingClientRect().top,vh=innerHeight;
      const p=Math.min(1,Math.max(0,(vh*.88-top)/(vh*.5)));
      const count=Math.round(p*words.length);
      if(count===shown)return;
      shown=count;words.forEach((w,i)=>w.classList.toggle('on',i<count));
    });
  })();

  // 2. Photos drift slightly slower than their frames.
  (function(){
    if(reduce.matches||!('IntersectionObserver' in window))return;
    const items=$$('.gallery-media, .outcome-hero img').map(img=>({img,box:img.parentElement,vis:false,last:null}));
    if(!items.length)return;
    const io=new IntersectionObserver(es=>es.forEach(e=>{const it=items.find(i=>i.box===e.target);if(it)it.vis=e.isIntersecting;}),{rootMargin:'80px 0px'});
    items.forEach(it=>{io.observe(it.box);it.img.classList.add('px');});
    fx.push(()=>items.forEach(it=>{
      if(!it.vis)return;
      const r=it.box.getBoundingClientRect();
      const t=Math.max(-1,Math.min(1,((r.top+r.height/2)-innerHeight/2)/(innerHeight/2+r.height/2)));
      const ty=Math.round(-t*Math.min(14,r.height*.05)*2)/2;
      if(ty!==it.last){it.img.style.setProperty('--py',ty+'px');it.last=ty;}
    }));
  })();

  window.__scrollFx=y=>fx.forEach(f=>f(y));
  addEventListener('load',()=>window.__scrollFx(scrollY));
  document.addEventListener('DOMContentLoaded',()=>window.__scrollFx(scrollY));
  window.__scrollFx(scrollY);
})();

// Mobile menu polish: label follows state, Escape / outside tap close it, focus moves in and back out.
(function () {
  var toggle = document.getElementById('mobileToggle'), menu = document.getElementById('navLinks');
  if (!toggle || !menu) return;
  function sync() {
    var open = menu.classList.contains('open');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  toggle.addEventListener('click', function () {
    sync();
    if (menu.classList.contains('open')) { var first = menu.querySelector('a'); if (first) first.focus({ preventScroll: true }); }
  });
  function close(returnFocus) {
    if (!menu.classList.contains('open')) return;
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false'); toggle.textContent = '☰'; sync();
    if (returnFocus) toggle.focus();
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(true); });
  document.addEventListener('click', function (e) {
    if (!menu.classList.contains('open')) return;
    if (menu.contains(e.target) || toggle.contains(e.target)) return;
    close(false);
  });
  menu.addEventListener('click', sync);
})();

// Results: year tabs (without JS every year simply shows in turn).
(function () {
  var root = document.getElementById('results');
  if (!root) return;
  var panels = Array.prototype.slice.call(root.querySelectorAll('.results-year'));
  if (panels.length < 2) return;
  var tabs = document.createElement('div');
  tabs.className = 'results-tabs'; tabs.setAttribute('role', 'tablist'); tabs.setAttribute('aria-label', 'Results by year');
  panels.forEach(function (panel, i) {
    panel.id = 'results-panel-' + i; panel.setAttribute('role', 'tabpanel'); panel.setAttribute('aria-labelledby', 'results-tab-' + i);
    var button = document.createElement('button');
    button.type = 'button'; button.className = 'results-tab'; button.id = 'results-tab-' + i;
    button.setAttribute('role', 'tab'); button.setAttribute('aria-controls', panel.id); button.textContent = panel.getAttribute('data-year');
    tabs.appendChild(button);
  });
  root.insertBefore(tabs, root.firstChild); root.classList.add('tabs-ready');
  var buttons = Array.prototype.slice.call(tabs.children);
  function select(i, focus) {
    panels.forEach(function (panel, j) { panel.classList.toggle('active', i === j); });
    buttons.forEach(function (button, j) { button.setAttribute('aria-selected', String(i === j)); button.tabIndex = i === j ? 0 : -1; });
    if (focus) buttons[i].focus();
  }
  buttons.forEach(function (button, i) {
    button.addEventListener('click', function () {
      select(i);
      try { if (window.gtag) window.gtag('event', 'results_year', { year: panels[i].getAttribute('data-year') }); } catch (e) {}
    });
  });
  tabs.addEventListener('keydown', function (e) {
    var i = buttons.indexOf(document.activeElement); if (i < 0) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); select((i + 1) % buttons.length, true); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); select((i - 1 + buttons.length) % buttons.length, true); }
  });
  select(0);
})();

// Motion pack: lively but quiet. Everything is gated by html.mx, which is set
// only when IntersectionObserver exists and the visitor has NOT asked for
// reduced motion, so content is never hidden when motion is off or JS fails.
(function () {
  try {
    if (!('IntersectionObserver' in window)) return;
    // Visitors who asked for reduced motion (often a Windows/battery-saver setting
    // they never chose) get "calm" mode: fades, count-ups and reveals, but no
    // movement, bounces, tilting, sparkles or looping effects.
    var calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var doc = document.documentElement;
    if (calm) doc.classList.add('mx-calm');
    var $ = function (s, r) { return (r || document).querySelector(s); };
    var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
    doc.classList.add('mx');
    function seen(els, cb, threshold) {
      if (!els.length) return;
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); cb(e.target); } });
      }, { threshold: threshold || 0.35 });
      els.forEach(function (el) { io.observe(el); });
    }

    // 1. Hero: headline rises word by word, a marker sweeps under the key line,
    //    and the "I can do it." note writes itself.
    var hero = $('.hero-parent');
    // v2.js rewrites the hero headline after this script runs, so the word
    // split happens once the DOM is complete (and only once).
    function prepHero() {
      var h1 = $('.hero-parent h1'), n = 0;
      if (!h1 || $('.mx-w', h1)) { if (h1) h1.classList.add('mx-ready'); return; }
      (function wrap(node, inEm) {
        Array.prototype.slice.call(node.childNodes).forEach(function (child) {
          if (child.nodeType === 3) {
            var frag = document.createDocumentFragment();
            child.textContent.split(/(\s+)/).forEach(function (part) {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
              var span = document.createElement('span');
              span.className = 'mx-w' + (inEm ? ' mx-em' : '');
              span.style.setProperty('--i', n++);
              span.textContent = part;
              frag.appendChild(span);
            });
            node.replaceChild(frag, child);
          } else if (child.nodeType === 1) wrap(child, inEm || child.tagName === 'EM');
        });
      })(h1, false);
      $$('.mx-em', h1).forEach(function (w, k) { w.style.setProperty('--k', k); });
      h1.classList.add('mx-ready');
    }
    var note = $('.mentor-handnote');
    if (note && note.firstChild && note.firstChild.nodeType === 3) {
      var write = document.createElement('span'); write.className = 'mx-write'; write.textContent = note.firstChild.textContent;
      note.replaceChild(write, note.firstChild);
    }
    var started = false;
    var start = function () {
      if (started) return; started = true;
      try { prepHero(); } catch (e) { var h = $('.hero-parent h1'); if (h) h.classList.add('mx-ready'); }
      requestAnimationFrame(function () { if (hero) hero.classList.add('mx-go'); });
    };
    var afterDom = function (fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); };
    afterDom(function () {
      if (document.fonts && document.fonts.ready) { var t = setTimeout(start, 700); document.fonts.ready.then(function () { clearTimeout(t); start(); }); } else start();
      setTimeout(function () { var h = $('.hero-parent h1'); if (h) h.classList.add('mx-ready'); }, 1800);
    });

    // 2. Results: percentages count up, a bar fills, cards rise in turn.
    var cards = $$('#results .result-card').filter(function (card) {
      var p = $('.result-percent', card), text = p && p.firstChild && p.firstChild.nodeType === 3 ? p.firstChild : null;
      var m = text && /^(\d+(?:\.\d+)?)$/.exec(text.nodeValue.trim());
      if (!m) return false;
      card.__v = parseFloat(m[1]); card.__dec = (m[1].split('.')[1] || '').length; card.__t = text;
      return true;
    });
    cards.forEach(function (card, i) {
      card.style.setProperty('--d', (i % 3) * 90 + 'ms'); card.classList.add('mx-pre');
      var bar = document.createElement('span'), fill = document.createElement('i');
      bar.className = 'result-bar'; bar.setAttribute('aria-hidden', 'true'); fill.style.setProperty('--p', (card.__v / 100).toFixed(3));
      bar.appendChild(fill); card.appendChild(bar);
      card.__t.nodeValue = (0).toFixed(card.__dec);
    });
    seen(cards, function (card) {
      card.classList.add('mx-in');
      var start = null, dur = 1200, delay = parseInt(card.style.getPropertyValue('--d'), 10) || 0;
      (function tick(now) {
        if (start === null) start = now + delay;
        var p = Math.min(1, Math.max(0, (now - start) / dur)), e = 1 - Math.pow(1 - p, 3);
        card.__t.nodeValue = (card.__v * e).toFixed(card.__dec);
        if (p < 1) requestAnimationFrame(tick); else card.__t.nodeValue = card.__v.toFixed(card.__dec);
      })(performance.now());
    }, 0.5);

    // 3. How it starts: the path draws as you scroll, numbers pop, the button shimmers once.
    var steps = $('.start-steps');
    if (steps) {
      $$('.start-step', steps).forEach(function (s, i) { s.style.setProperty('--i', i); s.classList.add('mx-pre'); });
      seen($$('.start-step', steps), function (s) { s.classList.add('mx-in'); }, 0.6);
      var ticking = false;
      var update = function () {
        ticking = false;
        var r = steps.getBoundingClientRect(), vh = window.innerHeight;
        var p = (vh * 0.78 - r.top) / (r.height * 0.9 + vh * 0.05);
        steps.style.setProperty('--sp', Math.max(0, Math.min(1, p)).toFixed(3));
      };
      window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
      window.addEventListener('resize', update); update();
      seen($$('.start-cta .btn'), function (b) { b.classList.add('mx-shine'); }, 0.9);
    }

    // 4. Rushabh Sir: the card settles in; the pills pop one by one.
    var grid = $('.teacher-grid');
    if (grid) { grid.classList.add('mx-pre'); seen([grid], function (el) { el.classList.add('mx-in'); }, 0.25); }
    var facts = $('.teacher-facts');
    if (facts) { $$('.pill', facts).forEach(function (p, i) { p.style.setProperty('--i', i); }); seen([facts], function (el) { el.classList.add('mx-in'); }, 0.6); }

    // 5. FAQ answers glide open (measured heights so the motion is exact).
    var sizeFaq = function () { $$('.faq-answer').forEach(function (a) { a.style.setProperty('--mx-h', (a.scrollHeight + 30) + 'px'); }); };
    sizeFaq(); window.addEventListener('resize', sizeFaq);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(sizeFaq);

    // 6. Enquiry: chips bounce, and a few sparkles when WhatsApp opens.
    document.addEventListener('click', function (e) {
      var chip = e.target.closest && e.target.closest('#classSelect .choice, #concernOptions .option');
      if (chip && !calm) { chip.classList.remove('mx-tap'); void chip.offsetWidth; chip.classList.add('mx-tap'); }
      var wa = e.target.closest && e.target.closest('#whatsappEnquiry');
      if (wa && !wa.disabled && !wa.hidden && !calm) {
        var r = wa.getBoundingClientRect(), layer = document.createElement('div'), marks = ['✦', '✧', '💛', '✨'];
        layer.className = 'mx-burst'; layer.style.left = (r.left + r.width / 2) + 'px'; layer.style.top = (r.top + r.height / 2) + 'px';
        for (var k = 0; k < 12; k++) {
          var s = document.createElement('span'), a = (k / 12) * Math.PI * 2 + Math.random() * 0.5, d = 46 + Math.random() * 46;
          s.textContent = marks[k % marks.length];
          s.style.setProperty('--dx', Math.cos(a) * d + 'px'); s.style.setProperty('--dy', Math.sin(a) * d - 14 + 'px'); s.style.setProperty('--r', (Math.random() * 120 - 60) + 'deg');
          layer.appendChild(s);
        }
        document.body.appendChild(layer); setTimeout(function () { layer.remove(); }, 1100);
      }
    });
  } catch (err) { /* Motion is an enhancement; never block the page. */ }
})();

/* Sticky enquiry bar: only after the hero button has scrolled away, and never over the form */
(function () {
  var bar = document.querySelector('.mobile-bottom');
  var hero = document.querySelector('.hero-actions .btn.primary');
  var form = document.querySelector('#enquiry');
  if (!bar || !hero || !('IntersectionObserver' in window)) return;
  var heroSeen = true, formSeen = false;
  function apply() { bar.classList.toggle('mb-hide', heroSeen || formSeen); }
  new IntersectionObserver(function (e) { heroSeen = e[e.length - 1].isIntersecting; apply(); }).observe(hero);
  if (form) new IntersectionObserver(function (e) { formSeen = e[e.length - 1].isIntersecting; apply(); }, { threshold: 0.15 }).observe(form);
  apply();
})();
