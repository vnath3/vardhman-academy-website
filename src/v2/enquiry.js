(() => {
  'use strict';
  const q = selector => document.querySelector(selector);
  const qa = selector => [...document.querySelectorAll(selector)];
  const settings = window.VARDHAMAN_SITE || {};
  const number = typeof settings.whatsappNumber === 'string' && /^[1-9]\d{7,14}$/.test(settings.whatsappNumber) ? settings.whatsappNumber : null;
  const concerns = [
    ['concepts', '🧩', 'Understanding concepts is difficult'],
    ['marks', '📈', 'Better marks and exam preparation'],
    ['confidence', '💬', 'Building confidence to participate'],
    ['habits', '🗓️', 'Homework, focus and study habits'],
    ['other', '💛', 'Something else — let me explain']
  ];
  let chosenClass = null, chosenConcern = null, message = '';
  const steps = qa('.form-step');
  const progress = q('#formProgress');
  for (const [attribute, value] of Object.entries({ role: 'progressbar', 'aria-label': 'Enquiry progress', 'aria-valuemin': '1', 'aria-valuemax': '4', 'aria-valuenow': '1', 'aria-valuetext': 'Step 1 of 4' })) progress.setAttribute(attribute, value);
  qa('#formProgress span').forEach(step => step.setAttribute('aria-hidden', 'true'));
  const whatsapp = q('#whatsappEnquiry');
  const availability = q('#whatsappAvailability');
  availability.textContent = settings.privateReview
    ? 'Private review: copy the draft to inspect it. WhatsApp opening is disabled here.'
    : number ? 'Review your draft, then choose Open WhatsApp. You will still need to press Send there.'
      : 'The academy’s WhatsApp contact is awaiting confirmation. You can copy your draft; this page does not send enquiries.';

  function goStep(index) {
    steps.forEach((step, position) => step.classList.toggle('active', index === position));
    progress.setAttribute('aria-valuenow', String(index + 1));
    progress.setAttribute('aria-valuetext', `Step ${index + 1} of 4`);
    qa('#formProgress span').forEach((step, position) => {
      step.classList.toggle('active', position <= index);
    });
    // Keep the draft out of link attributes: outbound-link analytics must not
    // receive an enquiry as a link_url parameter.
    whatsapp.hidden = index !== 3 || !number;
    const heading = steps[index].querySelector('h3');
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  }
  for (let grade = 5; grade <= 10; grade++) {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'choice'; button.textContent = grade;
    button.setAttribute('aria-label', `Class ${grade}`); button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      chosenClass = grade;
      qa('#classSelect .choice').forEach(item => { item.classList.toggle('active', item === button); item.setAttribute('aria-pressed', String(item === button)); });
      q('#classValidation').textContent = '';
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
      q('#concernValidation').textContent = '';
    });
    q('#concernOptions').append(button);
  }
  q('#classNext').addEventListener('click', () => chosenClass ? goStep(1) : q('#classValidation').textContent = 'Please choose a class to continue.');
  q('#concernNext').addEventListener('click', () => chosenConcern ? goStep(2) : q('#concernValidation').textContent = 'Please choose one concern to continue.');
  qa('[data-back]').forEach(button => button.addEventListener('click', () => goStep(Number(button.dataset.back))));
  q('#noteNext').addEventListener('click', () => {
    if (!chosenClass || !chosenConcern) return;
    const concern = concerns.find(item => item[0] === chosenConcern)[2];
    const note = q('#childNote').value.trim().slice(0, 350);
    message = `Hello Rushab Sir,\n\nI would like to enquire about tuition at Vardhaman Academy for my child.\n\nClass: ${chosenClass}\nMain concern: ${concern}${note ? `\nWhat I hope to see improve: ${note}` : ''}\n\nCould we discuss the next steps?`;
    q('#enquirySummary').textContent = message;
    q('#copyStatus').textContent = '';
    q('#whatsappStatus').textContent = '';
    goStep(3);
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
    if (!number || !message) { event.preventDefault(); return; }
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    q('#whatsappStatus').textContent = 'Review and send your draft in WhatsApp. This page cannot confirm delivery.';
  });
})();
