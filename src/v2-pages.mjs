// Static content pages (class bands, area, demo class, parent guides).
// Facts here come only from what the academy has confirmed: Classes 1–10, CBSE/SSC/ICSE, English and Marathi,
// small batches, timings that follow each school's schedule, demo class, fees discussed after understanding the child,
// parent updates by calls, visit invitations and test results. No fees, ranks or outcome claims.
import { robotsPolicy } from './v2-settings.mjs';

const esc = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = value => value.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const DATE = '2026-11-19';

const CLASS_FAQ = [
  ['Is a demo class available?', 'Yes. Book a demo class first so your child can see how it feels before deciding anything.'],
  ['Which language are classes taught in?', 'Both English and Marathi, depending on what your child is comfortable with.'],
  ['How big are the batches?', 'Batches are small, so the teacher can give each child full attention.'],
  ['What about timings?', 'Timings depend on your child\'s school schedule. Tell us when school ends and we will plan around it.']
];

export const PAGES = [
  {
    slug: 'classes-1-4', kind: 'page', nav: 'Classes 1–4',
    title: 'Tuition for Classes 1–4 in Bansilal Nagar | Vardhaman Academy',
    description: 'Small-batch tuition for Classes 1–4 in Bansilal Nagar, Chhatrapati Sambhajinagar. English and Marathi. Book a demo class at Vardhaman Academy.',
    h1: 'Tuition for <em>Classes 1–4</em> in Bansilal Nagar',
    intro: 'The early years decide how a child feels about learning. At Vardhaman Academy we help children in Classes 1–4 understand their lessons, build reading and number confidence, and enjoy coming to class.',
    sections: [
      ['What this stage needs', '<p>Children in Classes 1–4 are still forming habits. They need patience, simple explanations and a teacher who notices when something has not clicked yet. Small batches make that possible: nobody gets lost at the back.</p>'],
      ['How we work with your child', '<ul><li>We first understand where your child is right now, before planning anything.</li><li>Lessons follow your child\'s school (CBSE, SSC or ICSE) and are explained in English, Marathi or both.</li><li>Timings are planned around your child\'s school schedule.</li><li>We keep parents updated through calls, invitations to visit, and test results.</li></ul>'],
      ['Signs this may help your child', '<ul><li>Reads or writes slower than classmates and feels shy about it.</li><li>Memorises tables or answers but cannot explain them.</li><li>Dislikes homework time or avoids a particular subject.</li><li>Needs more attention than a large class can give.</li></ul>']
    ],
    mr: 'वर्धमान अकॅडमी, बन्सीलाल नगर — इयत्ता १ ते ४ साठी लहान बॅचमध्ये शिकवणी. इंग्रजी आणि मराठी दोन्हीत शिकवले जाते. डेमो क्लास उपलब्ध.',
    faq: CLASS_FAQ,
    related: ['classes-5-7', 'demo-class', 'guides/is-my-child-understanding-or-memorising']
  },
  {
    slug: 'classes-5-7', kind: 'page', nav: 'Classes 5–7',
    title: 'Tuition for Classes 5–7 in Bansilal Nagar | Vardhaman Academy',
    description: 'Small-batch tuition for Classes 5–7 in Bansilal Nagar, Chhatrapati Sambhajinagar. CBSE, SSC and ICSE, English and Marathi. Book a demo class.',
    h1: 'Tuition for <em>Classes 5–7</em> in Bansilal Nagar',
    intro: 'Classes 5–7 are where subjects get harder and gaps start to show. We help children build solid understanding now, so Class 8 and board years feel manageable instead of frightening.',
    sections: [
      ['What this stage needs', '<p>Children in Classes 5–7 are growing more independent, and more distracted. They need clear explanations, regular practice and someone who understands their behaviour, not only their marks. Small batches let the teacher spot a slipping subject early.</p>'],
      ['How we work with your child', '<ul><li>We start by understanding how your child is doing today.</li><li>We teach CBSE, SSC and ICSE syllabi in English, Marathi or both.</li><li>Timings follow your child\'s school schedule.</li><li>Parents hear from us through calls, visit invitations and test results.</li></ul>'],
      ['Signs this may help your child', '<ul><li>Marks that were fine in Class 4 are slipping.</li><li>Understands in class but forgets by the test.</li><li>Struggles to switch between English and Marathi terms.</li><li>Spends long hours on homework without much result.</li></ul>']
    ],
    mr: 'वर्धमान अकॅडमी, बन्सीलाल नगर — इयत्ता ५ ते ७ साठी लहान बॅचमध्ये शिकवणी. CBSE, SSC आणि ICSE. इंग्रजी आणि मराठी दोन्हीत. डेमो क्लास उपलब्ध.',
    faq: CLASS_FAQ,
    related: ['classes-1-4', 'classes-8-10', 'guides/balancing-studies-games-and-friends']
  },
  {
    slug: 'classes-8-10', kind: 'page', nav: 'Classes 8–10',
    title: 'Tuition for Classes 8–10 in Bansilal Nagar | Vardhaman Academy',
    description: 'Small-batch tuition for Classes 8–10 in Bansilal Nagar, Chhatrapati Sambhajinagar. CBSE, SSC and ICSE board preparation in English and Marathi.',
    h1: 'Tuition for <em>Classes 8–10</em> in Bansilal Nagar',
    intro: 'These years carry real pressure: harder subjects, and the Class 10 board exam ahead. We help students understand the syllabus properly, practise steadily and walk into exams with confidence.',
    sections: [
      ['What this stage needs', '<p>Students in Classes 8–10 need more than extra lectures. They need a clear plan, honest feedback and a teacher they are comfortable asking "silly" questions. We keep batches small so every student gets that attention.</p>'],
      ['How we work with your child', '<ul><li>We begin by understanding the student\'s current level in each subject.</li><li>We teach to the CBSE, SSC or ICSE syllabus, in English, Marathi or both.</li><li>Timings are planned around school hours and the student\'s other commitments.</li><li>Parents are kept informed through calls, visit invitations and test results.</li></ul>'],
      ['Signs this may help your child', '<ul><li>Understands the chapter but loses marks in tests.</li><li>Feels anxious about the Class 10 board exam.</li><li>Is weak in one subject that pulls everything down.</li><li>Needs a steady routine rather than last-minute cramming.</li></ul>']
    ],
    mr: 'वर्धमान अकॅडमी, बन्सीलाल नगर — इयत्ता ८ ते १० साठी लहान बॅचमध्ये शिकवणी. CBSE, SSC आणि ICSE. इंग्रजी आणि मराठी दोन्हीत. डेमो क्लास उपलब्ध.',
    faq: CLASS_FAQ,
    related: ['classes-5-7', 'demo-class', 'guides/questions-to-ask-before-joining-a-tuition']
  },
  {
    slug: 'tuition-bansilal-nagar', kind: 'page', nav: 'Tuition in Bansilal Nagar',
    title: 'Tuition in Bansilal Nagar, Chhatrapati Sambhajinagar | Vardhaman Academy',
    description: 'Looking for tuition in Bansilal Nagar, Chhatrapati Sambhajinagar? Vardhaman Academy teaches Classes 1–10 in small batches, in English and Marathi.',
    h1: 'Tuition in <em>Bansilal Nagar,</em> Chhatrapati Sambhajinagar',
    intro: 'Vardhaman Academy is a neighbourhood tuition academy in Bansilal Nagar, Chhatrapati Sambhajinagar, for students of Classes 1–10, led by Rushabh Mutha (Rushabh Sir).',
    sections: [
      ['Who we teach', '<p>Students from Class 1 to Class 10 following the CBSE, Maharashtra State Board (SSC) or ICSE syllabus. Lessons are in English, Marathi or both.</p>'],
      ['Why parents in the area choose a small batch', '<p>A smaller batch means the teacher knows each child, notices quickly when someone is stuck, and can adjust. Timings are planned around each child\'s school schedule, so tuition does not cost them their evenings, games or friends.</p>'],
      ['Find us', '<p>We are in Bansilal Nagar, Chhatrapati Sambhajinagar. Search "Vardhaman Academy Bansilal Nagar" on Google Maps to get directions, or use the Call button on our main page and we will guide you.</p>'],
      ['Meet the teacher', '<p>Rushabh Sir is a young engineer by background, comfortable with technology, and understands how students think and behave, including the distractions that come with growing up. He also believes students need friends, games and celebrations, not only books.</p>']
    ],
    mr: 'वर्धमान अकॅडमी — बन्सीलाल नगर, छत्रपती संभाजीनगर येथे इयत्ता १ ते १० साठी शिकवणी. ऋषभ सर यांच्या मार्गदर्शनाखाली लहान बॅचमध्ये. डेमो क्लास उपलब्ध.',
    faq: [
      ['Where is Vardhaman Academy?', 'In Bansilal Nagar, Chhatrapati Sambhajinagar. Search "Vardhaman Academy Bansilal Nagar" on Google Maps.'],
      ['Which classes do you teach?', 'Classes 1 to 10, for CBSE, SSC and ICSE students.'],
      ['Is there a demo class?', 'Yes, a demo class is available.']
    ],
    related: ['classes-1-4', 'classes-5-7', 'classes-8-10', 'demo-class']
  },
  {
    slug: 'demo-class', kind: 'page', nav: 'Demo class',
    title: 'Book a Demo Class | Vardhaman Academy, Bansilal Nagar',
    description: 'Book a demo class at Vardhaman Academy, Bansilal Nagar. See how Classes 1–10 tuition works in small batches before you decide.',
    h1: 'Start with a <em>demo class</em>',
    intro: 'Choosing a tuition for your child is a big decision. A demo class lets your child and you see how we teach before committing to anything.',
    sections: [
      ['How it starts', '<ol><li><strong>Tell us about your child.</strong> Share the class, board and what worries you most, using the enquiry on our main page.</li><li><strong>Attend a demo class.</strong> Your child experiences a lesson in a small batch.</li><li><strong>We understand how your child is doing.</strong> The teacher looks at current understanding, not just marks.</li><li><strong>We talk about the plan.</strong> Only after that do we discuss fees, because the right plan depends on your child.</li></ol>'],
      ['Fees', '<p>Our fees are affordable. We discuss them after we understand how your child is currently doing, so the plan fits the child.</p>'],
      ['Language and timings', '<p>Classes are in English, Marathi or both. Timings follow your child\'s school schedule.</p>'],
      ['After joining', '<p>We keep parents updated through calls, invitations to visit, and test results.</p>']
    ],
    mr: 'डेमो क्लास उपलब्ध आहे. आपल्या पाल्याला शिकवण्याची पद्धत अनुभवा, मग निर्णय घ्या. इयत्ता १ ते १०, इंग्रजी आणि मराठी दोन्हीत.',
    faq: [
      ['Is the demo class free?', 'Please ask us when you enquire. We will tell you the details clearly.'],
      ['Who should attend?', 'Your child, with a parent if you wish. Parents are welcome to visit.']
    ],
    related: ['classes-1-4', 'classes-5-7', 'classes-8-10', 'tuition-bansilal-nagar']
  },
  {
    slug: 'guides/is-my-child-understanding-or-memorising', kind: 'guide', nav: 'Understanding or memorising?',
    title: 'Is My Child Understanding or Just Memorising? | Vardhaman Academy',
    description: 'Five simple checks parents can do at home to see whether a child really understands a lesson or is only memorising it.',
    h1: 'Is my child <em>understanding</em> or just memorising?',
    intro: 'Many children can repeat an answer without knowing why it is right. That works until the question is asked in a different way. Here are five simple checks you can do at home.',
    sections: [
      ['1. Ask them to teach you', '<p>Ask your child to explain a topic as if you were a younger child. If they can only repeat the textbook lines, the idea has not settled yet.</p>'],
      ['2. Change the question', '<p>Take a solved example and change one number or word. A child who understands will adapt. A child who has memorised will freeze.</p>'],
      ['3. Ask "why", not only "what"', '<p>"Why did you add here?" "Why is this the right word?" Reasons show understanding; answers alone do not.</p>'],
      ['4. Watch for the same mistake', '<p>A repeated mistake usually means a missing foundation, not carelessness. Notice which type of question keeps going wrong.</p>'],
      ['5. Check the next day', '<p>Ask about yesterday\'s lesson without looking at the notebook. What survives a night is what was understood.</p>'],
      ['When to ask for help', '<p>If several checks fail in one subject, a small-batch class where the teacher can find the gap is often more useful than more hours of homework.</p>']
    ],
    faq: [], related: ['classes-5-7', 'demo-class', 'guides/questions-to-ask-before-joining-a-tuition']
  },
  {
    slug: 'guides/balancing-studies-games-and-friends', kind: 'guide', nav: 'Studies, games and friends',
    title: 'Balancing Studies, Games and Friends: A Guide for Parents | Vardhaman Academy',
    description: 'Why children still need games, friends and celebrations, and how to keep studies and social life in balance.',
    h1: 'Balancing <em>studies, games</em> and friends',
    intro: 'Many parents worry that play and friends take time away from studies. In practice, children who feel happy and connected usually learn better. The aim is balance, not a choice between the two.',
    sections: [
      ['Why social life matters', '<p>Friends, games and celebrations teach children teamwork, confidence and how to handle disappointment. A child who is only studying often becomes tired and starts avoiding books.</p>'],
      ['Fix the study block, protect the rest', '<p>Decide a fixed time for tuition and homework, and protect free time just as firmly. A clear routine reduces daily arguments.</p>'],
      ['Work with the school schedule', '<p>Tuition timings should follow the child\'s school hours, not compete with them. This is why we plan batch timings around each child\'s school schedule.</p>'],
      ['Notice the signals', '<p>Constant tiredness, irritability or sudden dislike of a subject can be signals that the load is too high or the child is stuck somewhere. Talk first, then adjust.</p>'],
      ['Celebrate small wins', '<p>A small treat or a family outing after a good week of effort teaches children that effort is noticed. This matters more than marks alone.</p>']
    ],
    faq: [], related: ['classes-5-7', 'classes-8-10', 'guides/is-my-child-understanding-or-memorising']
  },
  {
    slug: 'guides/questions-to-ask-before-joining-a-tuition', kind: 'guide', nav: 'Questions to ask before joining a tuition',
    title: '8 Questions to Ask Before Joining a Tuition | Vardhaman Academy',
    description: 'A practical checklist for parents choosing a tuition: batch size, language, timings, demo class, progress updates and more.',
    h1: '8 questions to ask <em>before joining</em> a tuition',
    intro: 'Choosing a tuition is easier when you know what to ask. Use this checklist with any academy, including ours.',
    sections: [
      ['The questions', '<ol><li><strong>How big are the batches?</strong> Smaller batches usually mean more attention.</li><li><strong>Which language is used?</strong> Make sure it matches how your child learns best.</li><li><strong>Do timings fit my child\'s school schedule?</strong></li><li><strong>Is there a demo class?</strong> Let your child try before you decide.</li><li><strong>Do you understand my child\'s level before planning?</strong></li><li><strong>How will I be updated?</strong> Calls, visits and test results are good signs.</li><li><strong>Is the syllabus matched to my child\'s board?</strong> CBSE, SSC and ICSE differ.</li><li><strong>How are fees explained?</strong> A good academy explains fees after understanding the child.</li></ol>'],
      ['How we answer these', '<p>At Vardhaman Academy: small batches, English and Marathi, timings planned around the school schedule, a demo class, and parent updates through calls, visits and test results. We discuss fees after understanding how your child is doing.</p>']
    ],
    faq: [], related: ['demo-class', 'classes-8-10', 'tuition-bansilal-nagar']
  }
];

const GUIDES = PAGES.filter(page => page.kind === 'guide');
export const pageUrls = settings => ['classes', 'guides', ...PAGES.map(page => page.slug)].map(slug => new URL(slug + '/', settings.site_url).href);

function head({ title, description, canonical, robots, prefix, jsonLd, privateReview, media }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="${robots}">
  <meta name="theme-color" content="#faf7f0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${esc(canonical)}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="en_IN">
  <meta property="og:site_name" content="Vardhaman Academy">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${esc(canonical)}">
  <meta property="og:image" content="${esc(new URL('/share-card.jpg', canonical).href)}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="${prefix}favicon.ico" sizes="any">
  <link rel="icon" type="image/png" href="${prefix}favicon.png" sizes="48x48">
  <link rel="icon" type="image/png" href="${prefix}icon-192.png" sizes="192x192">
  <link rel="apple-touch-icon" href="${prefix}apple-touch-icon.png">
  <link rel="stylesheet" href="${prefix}fonts.css">
  <link rel="stylesheet" href="${prefix}base.css">
  <link rel="stylesheet" href="${prefix}v2.css">${privateReview ? '' : `
  <script defer src="${prefix}analytics.js"></script>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-4F7P27EQSF"></script>`}
  ${logoStyle(media, prefix)}
  ${jsonLd}
</head>`;
}

export function logoStyle(media, prefix) {
  if (!media?.logo) return '';
  const layout = media.logoLayout;
  return `<style>:root{--v2-logo-image:url("${prefix}${media.logo}")${layout ? `;--v2-logo-size:${layout.size};--v2-logo-position:${layout.position}` : ''}}</style>`;
}
const logoMarkup = (media, prefix) => media?.logo
  ? `<a href="${prefix}index.html" class="logo" aria-label="Vardhaman Academy home"><span class="official-logo-crop" role="img" aria-label="Vardhaman Academy"></span></a>`
  : `<a href="${prefix}index.html" class="logo logo-text-fallback" aria-label="Vardhaman Academy home"><span class="mark">V.</span><span class="brand">VARDHAMAN ACADEMY</span></a>`;

export function renderConsent(source, media) {
  return source.replace('<!-- logo-style -->', logoStyle(media, '../')).replace('<!-- logo-link -->', logoMarkup(media, '../'));
}

const ld = graph => `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replaceAll('<', '\\u003c')}</script>`;

export function renderPage(page, settings, { privateReview = false, media = null } = {}) {
  const depth = page.slug.split('/').length;
  const prefix = '../'.repeat(depth);
  const canonical = new URL(page.slug + '/', settings.site_url).href;
  const robots = robotsPolicy(settings, { privateReview });
  const crumbs = [['Home', settings.site_url], ...(page.kind === 'guide' ? [['Guides', new URL('guides/', settings.site_url).href]] : []), [page.nav, canonical]];
  const graph = [
    { '@type': 'BreadcrumbList', itemListElement: crumbs.map(([name, item], i) => ({ '@type': 'ListItem', position: i + 1, name, item })) },
    page.kind === 'guide'
      ? { '@type': 'Article', headline: strip(page.h1), description: page.description, datePublished: DATE, dateModified: DATE, mainEntityOfPage: canonical, author: { '@type': 'Organization', name: 'Vardhaman Academy' }, publisher: { '@type': 'Organization', name: 'Vardhaman Academy' } }
      : { '@type': 'WebPage', name: page.title, description: page.description, url: canonical, isPartOf: { '@id': settings.site_url + '#organization' } },
    ...(page.faq?.length ? [{ '@type': 'FAQPage', mainEntity: page.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }] : [])
  ];
  const related = (page.related || []).map(slug => {
    const target = PAGES.find(p => p.slug === slug);
    return `<a class="related-link" href="${prefix}${slug}/">${esc(target.nav)} →</a>`;
  }).join('');
  const body = `<body class="consent-page content-page">
  <header class="site-header"><nav class="container nav" aria-label="Main navigation">${logoMarkup(media, prefix)}<a class="btn primary nav-cta" href="${prefix}index.html#enquiry">Tell us about your child</a></nav></header>
  <main id="main" class="consent-main">
    <div class="container consent-wrap">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="${prefix}index.html">Home</a> / ${page.kind === 'guide' ? `<a href="${prefix}guides/">Guides</a> / ` : ''}<span>${esc(page.nav)}</span></nav>
      <h1 class="h2">${page.h1}</h1>
      <p class="lead-in">${esc(page.intro)}</p>
      ${page.sections.map(([heading, html]) => `<h2>${esc(heading)}</h2>\n      ${html}`).join('\n      ')}
      ${page.mr ? `<p class="mr-note" lang="mr">${esc(page.mr)}</p>` : ''}
      ${page.faq?.length ? `<h2>Common questions</h2>\n      ${page.faq.map(([q, a]) => `<h3 class="faq-q">${esc(q)}</h3><p>${esc(a)}</p>`).join('\n      ')}` : ''}
      <div class="page-cta"><strong>Want to see how it works for your child?</strong><p>Tell us the class and what worries you. We will help you start with a demo class.</p><a class="btn primary" href="${prefix}index.html#enquiry">Tell us about your child ↓</a></div>
      ${related ? `<h2>Keep reading</h2><div class="related">${related}</div>` : ''}
    </div>
  </main>
  <footer class="footer"><div class="container"><div class="footer-bottom"><span>© Vardhaman Academy</span><a href="${prefix}index.html">Home</a><a href="${prefix}consent/">Consent &amp; privacy</a></div></div></footer>
</body>
</html>
`;
  return head({ title: page.title, description: page.description, canonical, robots, prefix, jsonLd: ld(graph), privateReview, media }) + '\n' + body;
}

export function renderClassesIndex(settings, { privateReview = false, media = null } = {}) {
  return renderIndex({ settings, privateReview, media, slug: 'classes', crumb: 'Classes', title: 'Classes 1-10 Tuition in Bansilal Nagar | Vardhaman Academy', description: 'Find the right class: tuition for Classes 1-4, 5-7 and 8-10 at Vardhaman Academy, Bansilal Nagar. Small batches, English and Marathi.', h1: 'Find the right <em>class</em> for your child', lead: 'Pick your child\'s stage. Every page explains how we work, and a demo class is available.', items: PAGES.filter(p => ['classes-1-4', 'classes-5-7', 'classes-8-10', 'tuition-bansilal-nagar', 'demo-class'].includes(p.slug)).map(p => [p.slug, strip(p.h1), p.description]) });
}

export function renderGuidesIndex(settings, { privateReview = false, media = null } = {}) {
  return renderIndex({ settings, privateReview, media, slug: 'guides', crumb: 'Guides', title: 'Parent Guides | Vardhaman Academy, Bansilal Nagar', description: 'Short, practical guides for parents of Class 1–10 students from Vardhaman Academy, Bansilal Nagar.', h1: 'Guides for <em>parents</em>', lead: 'Short, practical reading for parents of students in Classes 1–10.', items: GUIDES.map(g => [g.slug, strip(g.h1), g.description]) });
}

function renderIndex({ settings, privateReview, media, slug, crumb, title, description, h1, lead, items }) {
  const prefix = '../';
  const canonical = new URL(slug + '/', settings.site_url).href;
  const graph = [{ '@type': 'CollectionPage', name: title, description, url: canonical }];
  const list = items.map(([target, heading, text]) => `<li><a href="${prefix}${target}/"><strong>${esc(heading)}</strong></a><p>${esc(text)}</p></li>`).join('\n        ');
  return head({ title, description, canonical, robots: robotsPolicy(settings, { privateReview }), prefix, jsonLd: ld(graph), privateReview, media }) + `
<body class="consent-page content-page">
  <header class="site-header"><nav class="container nav" aria-label="Main navigation">${logoMarkup(media, prefix)}<a class="btn primary nav-cta" href="${prefix}index.html#enquiry">Tell us about your child</a></nav></header>
  <main id="main" class="consent-main">
    <div class="container consent-wrap">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="${prefix}index.html">Home</a> / <span>${esc(crumb)}</span></nav>
      <h1 class="h2">${h1}</h1>
      <p class="lead-in">${esc(lead)}</p>
      <ul class="guide-list">
        ${list}
      </ul>
    </div>
  </main>
  <footer class="footer"><div class="container"><div class="footer-bottom"><span>© Vardhaman Academy</span><a href="${prefix}index.html">Home</a><a href="${prefix}consent/">Consent &amp; privacy</a></div></div></footer>
</body>
</html>
`;
}
