
    const $=(s)=>document.querySelector(s), $$=(s)=>Array.from(document.querySelectorAll(s));
    const main=$('main');['.hero','.trust-strip','.parent-message','.teacher','.stories','.features','#journey','#brainlab','#enquiry','.faq'].forEach(selector=>main.append($(selector)));
    $('#year').textContent=new Date().getFullYear();
    $('#mobileToggle').addEventListener('click',()=>{const open=$('#navLinks').classList.toggle('open');$('#mobileToggle').setAttribute('aria-expanded',String(open));$('#mobileToggle').textContent=open?'×':'☰';});
    $$('#navLinks a').forEach(a=>a.addEventListener('click',()=>{$('#navLinks').classList.remove('open');$('#mobileToggle').setAttribute('aria-expanded','false');$('#mobileToggle').textContent='☰';}));
    let scrollScheduled=false;window.addEventListener('scroll',()=>{if(scrollScheduled)return;scrollScheduled=true;requestAnimationFrame(()=>{const d=document.documentElement;$('#readingProgress').style.width=((d.scrollTop/(d.scrollHeight-d.clientHeight))*100||0)+'%';scrollScheduled=false;});},{passive:true});
    if('IntersectionObserver' in window){const revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');revealObserver.unobserve(e.target);}}),{threshold:.11});$$('.reveal').forEach(e=>revealObserver.observe(e));}else{$$('.reveal').forEach(e=>e.classList.add('visible'));}
    const milestones={5:{title:'The curious explorer',desc:'Class 5 is about connecting ideas, growing independence and discovering the joy of solving problems.',label:'Building confidence',focus:['Stronger subject fundamentals','Growing learning confidence','Steady study habits'],deco:['✏️','📚'],bg:'#e4ebff'},6:{title:'The brave new explorer',desc:'New subjects, deeper concepts and more opportunities to become independent.',label:'A new learning leap',focus:['Adapting to deeper subjects','Asking thoughtful questions','Planning study time'],deco:['🌟','🔬'],bg:'#dff8ef'},7:{title:'The confident connector',desc:'A stage for connecting ideas across subjects and practising with purpose.',label:'Connecting the dots',focus:['Concept application','Science and mathematics reasoning','Study consistency'],deco:['🧠','🧪'],bg:'#fff0c5'},8:{title:'The focused thinker',desc:'Building a steady approach to more complex topics and examinations.',label:'Focus & understanding',focus:['Complex problem solving','Preparation and practice','Independent revision'],deco:['💡','🎯'],bg:'#eee7ff'},9:{title:'The determined learner',desc:'Stronger foundations and better habits for important academic choices.',label:'Growing determination',focus:['Subject-depth understanding','Exam strategy','Personal learning goals'],deco:['📐','📖'],bg:'#e2efff'},10:{title:'The future-ready achiever',desc:'A meaningful milestone — with preparation, focus and confidence for what comes next.',label:'Ready for next chapter',focus:['Board exam readiness','Confident revision routines','Preparing for the next chapter'],deco:['🎓','🚀'],bg:'#ffe5cd'}};
    let currentGrade=5;const icons=['📚','💡','🌱'];function setGrade(g){currentGrade=Math.max(5,Math.min(10,g));const d=milestones[currentGrade];$('#stageNumber').textContent=currentGrade;$('#gradeTitle').textContent=d.title;$('#gradeDesc').textContent=d.desc;$('#stageLabel').textContent=d.label;$('#decoA').textContent=d.deco[0];$('#decoB').textContent=d.deco[1];$('#journeyStage').style.background=d.bg;$('#gradeCount').textContent=`Class ${currentGrade} / 10`;$('#focusList').innerHTML=d.focus.map((x,i)=>`<div class="focus-item"><span>${icons[i]}</span>${x}</div>`).join('');$$('.grade-dot').forEach((b,i)=>b.setAttribute('aria-pressed',String(Number(b.textContent)===currentGrade)));$('#stageGlobe').style.transform=`rotate(${(currentGrade-5)*4}deg)`;$('#stageNumber').style.transform=`rotate(${(currentGrade-5)*1.5}deg)`;}
    for(let i=5;i<=10;i++){const b=document.createElement('button');b.className='grade-dot';b.textContent=i;b.type='button';b.setAttribute('aria-label',`Class ${i}`);b.addEventListener('click',()=>setGrade(i));$('#gradeTrack').append(b);}$('#prevGrade').addEventListener('click',()=>setGrade(currentGrade===5?10:currentGrade-1));$('#nextGrade').addEventListener('click',()=>setGrade(currentGrade===10?5:currentGrade+1));setGrade(5);
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
        $('#resultText').textContent=`You explored all three questions and found ${quizPoints} correct answer${quizPoints===1?'':'s'}. The best part is the curiosity to keep learning. Try another level or talk with Rushab Sir about your child's learning needs.`;
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
    const stories=[
      {type:'Aviation journey',title:'A dream takes flight',subtitle:'Curiosity today. Big skies tomorrow.',symbol:'✈️',theme:'#a8dcff',start:'A student who kept asking how things worked.',now:'A path toward an aviation career.',desc:'This sample narrative illustrates an alumnus who develops confidence in science and mathematics and later discovers an interest in aviation. We can showcase the actual turning points when verified.'},
      {type:'Medical journey',title:'The courage to care',subtitle:'From learning basics to helping others.',symbol:'🩺',theme:'#ffd5db',start:'A learner drawn to biology and helping people.',now:'A path toward medicine.',desc:'An illustrative arc from school lessons and steady practice to a future in healthcare. The production version can feature a real former student and their own reflections.'},
      {type:'Engineering journey',title:'Always building, always learning',subtitle:'Big solutions start with small questions.',symbol:'⚙️',theme:'#d4c7ff',start:'A child fascinated by how things fit together.',now:'An engineering pathway.',desc:'An example of how curiosity and stronger foundational concepts can be part of a longer educational story. Rushab Sir’s real alumni can bring this to life.'},
      {type:'Confidence journey',title:'From hesitant to fearless',subtitle:'Not every victory needs a trophy.',symbol:'🌟',theme:'#ffdf88',start:'A child hesitant to answer in class.',now:'More willing to ask, try and participate.',desc:'A growth story does not have to end with a prestigious job. A parent may recognise their own child in this example of growing confidence and willingness to learn.'},
      {type:'Creative journey',title:'Ideas become possibilities',subtitle:'The confidence to think differently.',symbol:'🎨',theme:'#b6eed6',start:'A curious child who liked creating things.',now:'Exploring a design-focused direction.',desc:'This placeholder demonstrates that successful students can choose creative fields, too. The real version should use authentic student achievements and permissioned materials.'}
    ];
    const track=$('#storyTrack'),storyGroups={all:[0,1,2,3,4],stem:[0,1,2],personal:[3,4]};
    let visibleStoryIds=storyGroups.all,storyIndex=0;
    function slidesPerView(){return window.innerWidth<=520?1:window.innerWidth<=1050?2:3;}
    function maxStoryIndex(){return Math.max(0,visibleStoryIds.length-slidesPerView());}
    function showStory(n){
      storyIndex=Math.max(0,Math.min(maxStoryIndex(),n));
      const first=track.querySelector('.story-card');if(!first)return;
      const shift=first.getBoundingClientRect().width+19;track.style.transform=`translateX(${-storyIndex*shift}px)`;
      $('#storyDots').innerHTML='';
      for(let i=0;i<=maxStoryIndex();i++){const b=document.createElement('button');b.setAttribute('aria-label',`View story group ${i+1}`);b.className=i===storyIndex?'active':'';b.addEventListener('click',()=>showStory(i));$('#storyDots').append(b);}
      $('#storyPrev').disabled=storyIndex===0;$('#storyNext').disabled=storyIndex===maxStoryIndex();
    }
    function renderStories(filter){
      visibleStoryIds=storyGroups[filter];
      track.style.transform='translateX(0)';
      track.classList.toggle('few',visibleStoryIds.length<3);
      track.innerHTML=visibleStoryIds.map(i=>{const s=stories[i];return `<button class="story-card" data-story="${i}" aria-label="Open sample story: ${s.title}"><div class="story-visual" style="--theme:${s.theme}"><span class="story-bubble">Sample story 0${i+1}</span><span class="story-object">${s.symbol}</span></div><div class="story-body"><span class="small">${s.type}</span><h3>${s.title}</h3><p>${s.subtitle}</p><div class="story-bottom"><span>Explore the journey</span><span>↗</span></div></div></button>`;}).join('');
      $$('#storyFilters button').forEach(b=>{const selected=b.dataset.filter===filter;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected));});
      showStory(0);
    }
    $$('#storyFilters button').forEach(b=>b.addEventListener('click',()=>renderStories(b.dataset.filter)));
    $('#storyPrev').addEventListener('click',()=>showStory(storyIndex-1));
    $('#storyNext').addEventListener('click',()=>showStory(storyIndex+1));
    window.addEventListener('resize',()=>showStory(storyIndex));
    renderStories('all');
    let lastFocus=null;function openStory(i){const s=stories[i];lastFocus=document.activeElement;$('#modalSymbol').textContent=s.symbol;$('#modalTitle').textContent=s.title;$('#modalDesc').textContent=s.desc;$('#modalStart').textContent=s.start;$('#modalNow').textContent=s.now;$('#storyModal').classList.add('open');document.body.style.overflow='hidden';$('#modalClose').focus();}function closeStory(){$('#storyModal').classList.remove('open');document.body.style.overflow='';if(lastFocus)lastFocus.focus();}track.addEventListener('click',e=>{const card=e.target.closest('[data-story]');if(card)openStory(Number(card.dataset.story));});$('#modalClose').addEventListener('click',closeStory);$('#modalEnd').addEventListener('click',closeStory);$('#storyModal').addEventListener('click',e=>{if(e.target===$('#storyModal'))closeStory();});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#storyModal').classList.contains('open'))closeStory();});
    const concerns=[['concepts','🧩','Understanding concepts is difficult'],['marks','📈','Better marks and exam preparation'],['confidence','💬','Building confidence to participate'],['habits','🗓️','Homework, focus and study habits'],['other','💛','Something else — let me explain']];let chosenClass=null,chosenConcern=null,currentStep=0;const formSteps=$$('.form-step'),progress=$$('#formProgress span');function goStep(n){currentStep=n;formSteps.forEach((s,i)=>s.classList.toggle('active',i===n));progress.forEach((p,i)=>p.classList.toggle('active',i<=n));}for(let i=5;i<=10;i++){const b=document.createElement('button');b.type='button';b.className='choice';b.textContent=i;b.setAttribute('aria-label',`Class ${i}`);b.addEventListener('click',()=>{chosenClass=i;$$('#classSelect .choice').forEach(x=>x.classList.toggle('active',x===b));$('#classValidation').textContent='';});$('#classSelect').append(b);}concerns.forEach(([id,emoji,label])=>{const b=document.createElement('button');b.type='button';b.className='option';b.innerHTML=`<span class="opt-emoji">${emoji}</span><span>${label}</span>`;b.addEventListener('click',()=>{chosenConcern=id;$$('#concernOptions .option').forEach(x=>x.classList.toggle('active',x===b));$('#concernValidation').textContent='';});$('#concernOptions').append(b);});$('#classNext').addEventListener('click',()=>chosenClass?goStep(1):$('#classValidation').textContent='Please choose a class to continue.');$('#concernNext').addEventListener('click',()=>chosenConcern?goStep(2):$('#concernValidation').textContent='Please choose one concern to continue.');$$('[data-back]').forEach(b=>b.addEventListener('click',()=>goStep(Number(b.dataset.back))));let enquiryMessage='';$('#noteNext').addEventListener('click',()=>{const concern=concerns.find(x=>x[0]===chosenConcern)?.[2]||'General learning support';const note=$('#childNote').value.trim();enquiryMessage=`Hello Rushab Sir,\n\nI would like to enquire about tuition for my child.\n\nClass: ${chosenClass}\nMain concern: ${concern}${note?`\nWhat I hope to see improve: ${note}`:''}\n\nCould we discuss the next steps?`;$('#enquirySummary').textContent=enquiryMessage;$('#copyStatus').innerHTML='';goStep(3);});$('#copyEnquiry').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(enquiryMessage);$('#copyStatus').innerHTML='<div class="success-banner">✓ Message copied. You can paste it into WhatsApp once the contact is supplied.</div>';}catch(e){const t=document.createElement('textarea');t.value=enquiryMessage;document.body.append(t);t.select();const ok=document.execCommand('copy');t.remove();$('#copyStatus').innerHTML=ok?'<div class="success-banner">✓ Message copied.</div>':'<p class="validation">Copy unavailable in this browser. Please select and copy the message above.</p>';}});
    $$('.faq-item button').forEach(b=>b.addEventListener('click',()=>{const p=b.closest('.faq-item');const next=!p.classList.contains('open');p.classList.toggle('open',next);b.setAttribute('aria-expanded',String(next));}));
  