(() => {
  'use strict';
  const q = selector => document.querySelector(selector);
  const settings = window.VARDHAMAN_SITE || {};
  const number = settings.privateReview !== true && typeof settings.whatsappNumber === 'string' && /^[1-9]\d{7,14}$/.test(settings.whatsappNumber) ? settings.whatsappNumber : null;

  // Enquiries are captured by the popup (popup.js). Call, WhatsApp and directions are
  // deliberately kept low on the page: the footer, plus one quiet line under the enquiry button.
  // The number is the owner-approved one from content/v2-settings.json.
  const footerContact = q('#footerContact');
  if (number) {
    const national = /^91(\d{10})$/.exec(number)?.[1];
    const readable = national ? `+91 ${national.slice(0, 5)} ${national.slice(5)}` : `+${number}`;
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
    const alt = q('#enquiryAlt');
    if (alt) {
      alt.append('Prefer to chat? ');
      const link = document.createElement('a');
      link.href = `https://wa.me/${number}`;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = 'Message us on WhatsApp';
      alt.append(link);
    }
  }

  // Footer directions link uses the owner-approved map link.
  const footerMap = q('#footerMap');
  if (footerMap && typeof settings.mapUrl === 'string' && /^https:/.test(settings.mapUrl)) {
    const directions = document.createElement('a');
    directions.href = settings.mapUrl;
    directions.target = '_blank';
    directions.rel = 'noopener';
    directions.textContent = 'Get directions ↗';
    footerMap.append(directions);
  }
})();
