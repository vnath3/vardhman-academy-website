(() => {
  'use strict';
  const q = selector => document.querySelector(selector);
  const qa = selector => [...document.querySelectorAll(selector)];
  const settings = window.VARDHAMAN_SITE || {};
  const number = settings.privateReview !== true && typeof settings.whatsappNumber === 'string' && /^[1-9]\d{7,14}$/.test(settings.whatsappNumber) ? settings.whatsappNumber : null;
  const concerns = [
    ['concepts', '🧩', 'Understanding concepts is difficult'],
    ['marks', '📈', 'Better marks and exam preparation'],
    ['confidence', '💬', 'Building confidence to participate'],
    ['habits', '🗓️', 'Homework, focus and study habits'],
    ['other', '💛', 'Something else — let me explain']
  ];
  let chosenClass = null, chosenConcern = null, message = '';
  const whatsapp = q('#whatsappEnquiry');
  const availability = q('#whatsappAvailability');
  availability.textContent = settings.privateReview
    ? 'Private review: copy the draft to inspect it. WhatsApp opening is disabled here.'
    : number ? 'Review your draft, then choose Open WhatsApp. You will still need to press Send there.'
      : 'The academy’s WhatsApp contact is awaiting confirmation. You can copy your draft; this page does not send enquiries.';

  // Give parents without WhatsApp, or who simply prefer to call, a visible
  // fallback contact. Same approved number already used for the enquiry
  // draft link (content/v2-settings.json) — nothing new to approve, just
  // shown in the open instead of only inside a wa.me href.
  const footerContact = q('#footerContact');
  if (number) {
    const national = /^91(\d{10})$/.exec(number)?.[1];
    const readable = national ? `+91 ${national.slice(0, 5)} ${national.slice(5)}` : `+${number}`;
    // Phones: a one-tap call icon beside the menu button (same approved number).
    const navCall = q('#navCall');
    if (navCall) {
      navCall.href = `tel:+${number}`;
      navCall.hidden = false;
    }
    if (footerContact) {
      const call = document.createElement('a');
      call.className = 'footer-action';
      call.href = `tel:+${number}`;
      call.textContent = `Call ${readable}`;
      const chat = document.createElement('a');
      chat.className = 'footer-action';
      chat.href = `https://wa.me/${number}`;
      chat.target = '_blank';
      chat.rel = 'noopener';
      chat.textContent = '💬 WhatsApp us';
      footerContact.append(call, chat);
    }
  }

  // Footer directions link uses the same owner-approved map link as the hero badge.
  const footerMap = q('#footerMap');
  if (footerMap && typeof settings.mapUrl === 'string' && /^https:/.test(settings.mapUrl)) {
    const directions = document.createElement('a');
    directions.href = settings.mapUrl;
    directions.target = '_blank';
    directions.rel = 'noopener';
    directions.textContent = 'Get directions ↗';
    footerMap.append(directions);
  }

  // Hero locality badge opens the owner-approved map link (content/v2-settings.json).
  // Falls back to its harmless in-page "#home" anchor when unapproved/private review.
  const heroMapBadge = q('#heroMapBadge');
  if (heroMapBadge && typeof settings.mapUrl === 'string' && /^https:/.test(settings.mapUrl)) {
    heroMapBadge.href = settings.mapUrl;
    heroMapBadge.target = '_blank';
    heroMapBadge.rel = 'noopener';
  }

  // One screen, no "Continue" taps: pick a class and a concern (in any order)
  // and the draft message plus Open WhatsApp / Copy appear right below.
  function buildMessage() {
    if (!chosenClass || !chosenConcern) return;
    const concern = concerns.find(item => item[0] === chosenConcern)[2];
    const note = q('#childNote').value.trim().slice(0, 350);
    message = `Hello Rushabh Sir,\n\nI would like to enquire about tuition at Vardhaman Academy for my child.\n\nClass: ${chosenClass}\nMain concern: ${concern}${note ? `\nWhat I hope to see improve: ${note}` : ''}\n\nCould we discuss the next steps?`;
    q('#enquirySummary').textContent = message;
  }
  function revealReview() {
    if (!chosenClass || !chosenConcern) return;
    const wasHidden = q('#reviewPanel').hidden;
    buildMessage();
    q('#reviewPanel').hidden = false;
    // Keep the draft out of link attributes: outbound-link analytics must not
    // receive an enquiry as a link_url parameter.
    whatsapp.hidden = false;
    whatsapp.disabled = !number;
    q('#copyEnquiry').hidden = false;
    q('#copyStatus').textContent = '';
    q('#whatsappStatus').textContent = '';
    if (wasHidden) setTimeout(() => q('#reviewPanel').scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }), 60);
  }
  for (let grade = 1; grade <= 10; grade++) {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'choice'; button.textContent = grade;
    button.setAttribute('aria-label', `Class ${grade}`); button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      chosenClass = grade;
      qa('#classSelect .choice').forEach(item => { item.classList.toggle('active', item === button); item.setAttribute('aria-pressed', String(item === button)); });
      revealReview();
    });
    q('#classSelect').append(button);
  }
  for (const [id, emoji, label] of concerns) {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'option';
    const icon = document.createElement('span'); icon.className = 'opt-emoji'; icon.textContent = emoji; icon.setAttribute('aria-hidden', 'true');
    const text = document.createElement('span'); text.textContent = label;
    button.append(icon, text); button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      chosenConcern = id;
      qa('#concernOptions .option').forEach(item => { item.classList.toggle('active', item === button); item.setAttribute('aria-pressed', String(item === button)); });
      revealReview();
    });
    q('#concernOptions').append(button);
  }
  q('#childNote').addEventListener('input', () => {
    buildMessage();
    q('#copyStatus').textContent = '';
    q('#whatsappStatus').textContent = '';
  });
  q('#copyEnquiry').addEventListener('click', async () => {
    if (!message) return;
    try {
      await navigator.clipboard.writeText(message);
      q('#copyStatus').textContent = 'Message copied. Copying does not send an enquiry.';
    } catch {
      const area = document.createElement('textarea'); area.value = message;
      area.setAttribute('aria-label', 'Enquiry message to copy'); document.body.append(area); area.select();
      let copied = false;
      try { copied = document.execCommand('copy'); } catch { /* Manual copy remains available. */ }
      area.remove(); q('#copyEnquiry').focus();
      q('#copyStatus').textContent = copied ? 'Message copied. Copying does not send an enquiry.' : 'Copy is unavailable. Select and copy the draft above; this page does not send enquiries.';
    }
  });
  whatsapp.addEventListener('click', event => {
    if (!number || !message || whatsapp.disabled || q('#reviewPanel').hidden) { event.preventDefault(); return; }
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    q('#whatsappStatus').textContent = 'Review and send your draft in WhatsApp. This page cannot confirm delivery.';
  });
})();
