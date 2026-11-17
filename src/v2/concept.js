
    const $=(s)=>document.querySelector(s), $$=(s)=>Array.from(document.querySelectorAll(s));
    const main=$('main');['.hero','.trust-strip','.parent-message','.teacher','.stories','.features','#journey','#brainlab','#enquiry','.faq'].forEach(selector=>{const section=$(selector);if(section)main.append(section);});
    $('#year').textContent=new Date().getFullYear();
    $('#mobileToggle').addEventListener('click',()=>{const open=$('#navLinks').classList.toggle('open');$('#mobileToggle').setAttribute('aria-expanded',String(open));$('#mobileToggle').textContent=open?'×':'☰';});
    $$('#navLinks a').forEach(a=>a.addEventListener('click',()=>{$('#navLinks').classList.remove('open');$('#mobileToggle').setAttribute('aria-expanded','false');$('#mobileToggle').textContent='☰';}));
    // One rAF-batched scroll tick drives three bits of chrome at once: the
    // reading-progress bar, a header that tightens up once you're past the
    // hero, and a back-to-top control — rather than three separate listeners.
    const siteHeader=$('.site-header'), backToTop=$('#backToTop');
    let headerScrolled=false, backVisible=false;
    let scrollScheduled=false;window.addEventListener('scroll',()=>{if(scrollScheduled)return;scrollScheduled=true;requestAnimationFrame(()=>{
      const d=document.documentElement;
      $('#readingProgress').style.width=((d.scrollTop/(d.scrollHeight-d.clientHeight))*100||0)+'%';
      const y=scrollY;
      const scrolled=y>12;
      if(scrolled!==headerScrolled){siteHeader?.classList.toggle('scrolled',scrolled);headerScrolled=scrolled;}
      const show=y>innerHeight*.8;
      if(show!==backVisible){backToTop?.classList.toggle('visible',show);backToTop?.setAttribute('aria-hidden',String(!show));if(backToTop)backToTop.tabIndex=show?0:-1;backVisible=show;}
      scrollScheduled=false;
    });},{passive:true});
    if(backToTop)backToTop.addEventListener('click',()=>{
      window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    });
    // Scrollspy: highlight whichever section the nav is pointing at as it
    // comes into view, so the nav itself gives feedback while scrolling.
    if('IntersectionObserver' in window){
      const navLinks=$$('#navLinks a[href^="#"]').filter(a=>a.getAttribute('href').length>1);
      const linkFor=id=>navLinks.find(a=>a.getAttribute('href')==='#'+id);
      const spySections=navLinks.map(a=>document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
      const spy=new IntersectionObserver(entries=>{
        entries.forEach(entry=>{
          const link=linkFor(entry.target.id);
          if(link)link.classList.toggle('current',entry.isIntersecting);
        });
      },{rootMargin:'-45% 0px -50% 0px'});
      spySections.forEach(section=>spy.observe(section));
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
        if (element.closest('.hero, #journey, #brainlab, #enquiry, #parents, #about, .features, .faq, .v2-outcomes')) element.classList.remove('reveal');
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
      // Gallery photos get a zoom-in instead, and now every card in the grid
      // gets one (not just the first row) — each still only animates once it
      // actually scrolls into view.
      const columns = matchMedia('(max-width:520px)').matches ? 1 : matchMedia('(max-width:780px)').matches ? 2 : 3;
      $$('.gallery-card:not([hidden])').forEach((element, index) => add(element, 'zoom', index % columns));
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
    const milestones={1:{"title":"Little discoveries","desc":"Class 1 is a chance to explore letters, numbers and the joy of learning.","label":"First discoveries","focus":["Letter and number familiarity","Listening and expression","Comfort with learning routines"],"deco":["✏️","📚"],"bg":"#e4ebff"},2:{"title":"The growing explorer","desc":"Class 2 builds on early reading, counting and the confidence to ask questions.","label":"Growing curiosity","focus":["Reading practice","Number confidence","Asking questions"],"deco":["🌱","🔎"],"bg":"#dff8ef"},3:{"title":"Building connections","desc":"Class 3 connects reading and number skills with everyday ideas and discoveries.","label":"Connecting ideas","focus":["Reading understanding","Mathematics practice","Explaining ideas"],"deco":["📖","🧩"],"bg":"#fff0c5"},4:{"title":"The curious problem-solver","desc":"Class 4 encourages step-by-step reasoning and growing independence with familiar skills.","label":"Learning with purpose","focus":["Applying the basics","Step-by-step reasoning","Independent learning habits"],"deco":["💡","📚"],"bg":"#eee7ff"},5:{title:'The curious explorer',desc:'Class 5 is about connecting ideas, growing independence and discovering the joy of solving problems.',label:'Building confidence',focus:['Stronger subject fundamentals','Growing learning confidence','Steady study habits'],deco:['✏️','📚'],bg:'#e4ebff'},6:{title:'The brave new explorer',desc:'New subjects, deeper concepts and more opportunities to become independent.',label:'A new learning leap',focus:['Adapting to deeper subjects','Asking thoughtful questions','Planning study time'],deco:['🌟','🔬'],bg:'#dff8ef'},7:{title:'The confident connector',desc:'A stage for connecting ideas across subjects and practising with purpose.',label:'Connecting the dots',focus:['Concept application','Science and mathematics reasoning','Study consistency'],deco:['🧠','🧪'],bg:'#fff0c5'},8:{title:'The focused thinker',desc:'Building a steady approach to more complex topics and examinations.',label:'Focus & understanding',focus:['Complex problem solving','Preparation and practice','Independent revision'],deco:['💡','🎯'],bg:'#eee7ff'},9:{title:'The determined learner',desc:'Stronger foundations and better habits for important academic choices.',label:'Growing determination',focus:['Subject-depth understanding','Exam strategy','Personal learning goals'],deco:['📐','📖'],bg:'#e2efff'},10:{title:'The future-ready achiever',desc:'A meaningful milestone — with preparation, focus and confidence for what comes next.',label:'Ready for next chapter',focus:['Board exam readiness','Confident revision routines','Preparing for the next chapter'],deco:['🎓','🚀'],bg:'#ffe5cd'}};
    let currentGrade=1;const icons=['📚','💡','🌱'];function setGrade(g){currentGrade=Math.max(1,Math.min(10,g));const d=milestones[currentGrade];$('#stageNumber').textContent=currentGrade;$('#gradeTitle').textContent=d.title;$('#gradeDesc').textContent=d.desc;$('#stageLabel').textContent=d.label;$('#decoA').textContent=d.deco[0];$('#decoB').textContent=d.deco[1];$('#journeyStage').style.background=d.bg;$('#gradeCount').textContent=`Class ${currentGrade} / 10`;$('#focusList').innerHTML=d.focus.map((x,i)=>`<div class="focus-item"><span>${icons[i]}</span>${x}</div>`).join('');$$('.grade-dot').forEach((b,i)=>b.setAttribute('aria-pressed',String(Number(b.textContent)===currentGrade)));$('#stageGlobe').style.transform=`rotate(${(currentGrade-1)*4}deg)`;$('#stageNumber').style.transform=`rotate(${(currentGrade-1)*1.5}deg)`;}
    for(let i=1;i<=10;i++){const b=document.createElement('button');b.className='grade-dot';b.textContent=i;b.type='button';b.setAttribute('aria-label',`Class ${i}`);b.addEventListener('click',()=>setGrade(i));$('#gradeTrack').append(b);}$('#prevGrade').addEventListener('click',()=>setGrade(currentGrade===1?10:currentGrade-1));$('#nextGrade').addEventListener('click',()=>setGrade(currentGrade===10?1:currentGrade+1));setGrade(1);

    const journeyMotion=$('#journeyMotion'),motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
    let iconsPaused=false;
    function syncJourneyMotion(){
      const reduced=motionPreference.matches,paused=iconsPaused||reduced;
      $('#journeyStage').dataset.motionPaused=String(paused);
      journeyMotion.disabled=reduced;
      journeyMotion.setAttribute('aria-pressed',String(paused));
      journeyMotion.textContent=reduced?'Motion off':iconsPaused?'Resume icons':'Pause icons';
      journeyMotion.title=reduced?'Your device has reduced motion enabled.':'';
    }
    journeyMotion.addEventListener('click',()=>{iconsPaused=!iconsPaused;syncJourneyMotion();});
    motionPreference.addEventListener('change',syncJourneyMotion);syncJourneyMotion();
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
