// One lead-capture popup for the whole site. Every "Book a demo class" button opens it,
// and it also appears once on its own after a parent has shown real interest (never at the start).
// Collects only the parent's name, mobile number and the child's class band.
// Inactive unless the owner approved lead capture in content/v2-settings.json (window.VARDHAMAN_SITE.leadsApi).
(() => {
  'use strict';
  const site = window.VARDHAMAN_SITE || {};
  const api = typeof site.leadsApi === 'string' && /^https:\/\//.test(site.leadsApi) ? site.leadsApi : null;
  if (!api) return; // not approved or private review: buttons keep their normal links
  const eventsUrl = typeof site.leadsEvents === 'string' && /^https:\/\//.test(site.leadsEvents) ? site.leadsEvents : null;
  const number = typeof site.whatsappNumber === 'string' && /^[1-9]\d{7,14}$/.test(site.whatsappNumber) ? site.whatsappNumber : null;
  const mr = document.documentElement.lang === 'mr';
  let base;
  try { base = new URL('.', document.currentScript.src).href; } catch (e) { base = new URL('./', location.href).href; }
  const consentUrl = new URL('consent/', base).href;

  const T = mr ? {
    eyebrow: 'वर्धमान अकॅडमी', title: 'डेमो क्लास बुक करा', sub: 'तुमचा नंबर द्या. आम्ही तुम्हाला परत कॉल करू.',
    name: 'पालकांचे नाव', phone: 'मोबाइल नंबर', cls: 'तुमचे मूल कोणत्या वर्गात आहे?', hName: 'पालकांचे नाव लिहा', hPhone: '10 अंकी मोबाइल नंबर लिहा (6–9 ने सुरू होणारा)', hClass: 'मुलाचा वर्ग निवडा', submit: 'मला कॉल करा', sending: 'पाठवत आहे…',
    note: 'सबमिट केल्यावर वर्धमान अकॅडमी ट्यूशनबद्दल तुमच्याशी संपर्क साधू शकते.', privacy: 'संमती व गोपनीयता',
    eName: 'कृपया पालकांचे नाव लिहा.', ePhone: 'कृपया 10 अंकी मोबाइल नंबर लिहा.', eClass: 'कृपया मुलाचा वर्ग निवडा.',
    eSend: 'पाठवता आली नाही. कृपया पुन्हा प्रयत्न करा.', thanks: 'धन्यवाद!', thanksText: 'तुमचा नंबर मिळाला आहे. आम्ही लवकरच कॉल करू.',
    wa: 'किंवा WhatsApp वर संदेश पाठवा', waText: 'नमस्कार, मी ट्यूशनबद्दल कॉल बॅकसाठी विनंती केली आहे.', close: 'बंद करा'
  } : {
    eyebrow: 'Vardhaman Academy', title: 'Book a demo class', sub: 'Leave your number and we will call you back.',
    name: 'Parent’s name', phone: 'Mobile number', cls: 'Which class is your child in?', hName: 'Enter the parent’s name', hPhone: 'Enter a 10-digit mobile number (starts with 6–9)', hClass: 'Choose your child’s class', submit: 'Request a call back', sending: 'Sending…',
    note: 'By submitting, you agree that Vardhaman Academy may contact you about tuition.', privacy: 'Consent & privacy',
    eName: 'Please enter the parent’s name.', ePhone: 'Please enter a valid 10-digit mobile number.', eClass: 'Please choose your child’s class.',
    eSend: 'Could not send. Please try again.', thanks: 'Thank you!', thanksText: 'We have your number and will call you soon.',
    wa: 'Or message us on WhatsApp', waText: 'Hi, I just asked for a call back about tuition.', close: 'Close'
  };

  // Storage can throw (private mode, blocked cookies): treat it as optional.
  const store = {
    get(area, key) { try { return window[area].getItem(key); } catch (e) { return null; } },
    set(area, key, value) { try { window[area].setItem(key, value); } catch (e) {} }
  };
  const DONE_KEY = 'va_lead_done', DISMISS_KEY = 'va_lead_dismissed', DONE_DAYS = 30;
  const alreadySubmitted = () => { const at = Number(store.get('localStorage', DONE_KEY)); return at > 0 && Date.now() - at < DONE_DAYS * 864e5; };

  const gtagEvent = (name, params) => { try { if (typeof window.gtag === 'function') window.gtag('event', name, params || {}); } catch (e) {} };
  const beacon = body => {
    if (!eventsUrl) return;
    const data = JSON.stringify(Object.assign({ page: location.pathname }, body));
    try { if (navigator.sendBeacon && navigator.sendBeacon(eventsUrl, new Blob([data], { type: 'text/plain' }))) return; } catch (e) {}
    try { fetch(eventsUrl, { method: 'POST', body: data, keepalive: true, headers: { 'content-type': 'text/plain' } }); } catch (e) {}
  };

  let pop = null, form = null, thanks = null, error = null, button = null, hint = null, openedBy = '', viewSent = false, escBound = false;

  function build() {
    if (pop) return;
    pop = document.createElement('div');
    pop.className = 'lead-pop';
    pop.id = 'leadPop';
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-modal', 'true');
    pop.setAttribute('aria-labelledby', 'leadTitle');
    pop.setAttribute('aria-hidden', 'true');
    pop.innerHTML =
      '<div class="lead-card">' +
        '<button type="button" class="lead-x" aria-label="' + T.close + '">×</button>' +
        '<form class="lead-form" novalidate>' +
          '<span class="eyebrow">' + T.eyebrow + '</span>' +
          '<h2 class="lead-title" id="leadTitle">' + T.title + '</h2>' +
          '<p class="lead-sub">' + T.sub + '</p>' +
          '<label class="lead-label" for="leadName">' + T.name + '</label>' +
          '<input class="lead-input" id="leadName" name="name" type="text" autocomplete="name" maxlength="60" enterkeyhint="next">' +
          '<label class="lead-label" for="leadPhone">' + T.phone + '</label>' +
          '<div class="lead-phone"><span aria-hidden="true">+91</span><input class="lead-input" id="leadPhone" name="phone" type="tel" inputmode="numeric" autocomplete="tel-national" enterkeyhint="done" placeholder="98765 43210"></div>' +
          '<fieldset class="lead-class"><legend class="lead-label lead-label-strong">' + T.cls + ' <span class="lead-req" aria-hidden="true">*</span></legend><div class="lead-pills">' +
            ['1-4|1–4', '5-7|5–7', '8-10|8–10'].map(o => { const p = o.split('|'); return '<label><input type="radio" name="class_band" value="' + p[0] + '"><span>' + p[1] + '</span></label>'; }).join('') +
          '</div></fieldset>' +
          '<input class="lead-hp" name="website" type="text" tabindex="-1" autocomplete="off" aria-hidden="true">' +
          '<p class="lead-hint" aria-live="polite"></p><p class="lead-error" role="alert"></p>' +
          '<button type="submit" class="btn primary lead-submit" disabled>' + T.submit + '</button>' +
          '<p class="lead-note">' + T.note + ' <a href="' + consentUrl + '">' + T.privacy + '</a></p>' +
        '</form>' +
        '<div class="lead-thanks" hidden tabindex="-1"><span class="lead-tick" aria-hidden="true">✓</span><h2 class="lead-title">' + T.thanks + '</h2><p class="lead-sub">' + T.thanksText + '</p></div>' +
      '</div>';
    document.body.appendChild(pop);
    form = pop.querySelector('form');
    thanks = pop.querySelector('.lead-thanks');
    error = pop.querySelector('.lead-error');
    button = pop.querySelector('.lead-submit');
    hint = pop.querySelector('.lead-hint');
    pop.querySelector('.lead-x').addEventListener('click', () => close());
    pop.addEventListener('click', event => { if (event.target === pop) close(); });
    form.addEventListener('submit', submit);
    // Mobile number: digits only, at most 10. Pasted +91 / 0 prefixes are removed.
    form.elements.phone.addEventListener('input', () => {
      let digits = form.elements.phone.value.replace(/\D/g, '');
      if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
      else if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
      digits = digits.slice(0, 10);
      if (form.elements.phone.value !== digits) form.elements.phone.value = digits;
    });
    // The button stays disabled until name, number and class are all valid; the line above it says what is missing.
    form.addEventListener('input', refresh);
    form.addEventListener('change', refresh);
    if (!escBound) { document.addEventListener('keydown', event => { if (event.key === 'Escape' && isOpen()) close(); }); escBound = true; }
  }

  const isOpen = () => !!pop && pop.classList.contains('open');

  function missing() {
    const f = form.elements;
    if (f.name.value.trim().length < 2) return T.hName;
    if (!/^[6-9]\d{9}$/.test(f.phone.value)) return T.hPhone;
    if (!form.querySelector('input[name=class_band]:checked')) return T.hClass;
    return '';
  }
  function refresh() {
    const why = missing();
    button.disabled = !!why;
    hint.textContent = why;
    if (!why) error.textContent = '';
  }

  function open(trigger, returnTo) {
    build();
    if (isOpen()) return;
    openedBy = trigger;
    form.hidden = false; thanks.hidden = true; error.textContent = '';
    button.textContent = T.submit; refresh();
    pop.classList.add('open');
    document.documentElement.classList.add('lead-lock');
    if (window.VardhamanDialogs) window.VardhamanDialogs.open(pop, returnTo || null);
    else { pop.setAttribute('aria-hidden', 'false'); pop.querySelector('.lead-x').focus(); }
    gtagEvent('lead_popup_open', { trigger });
    if (!viewSent) { viewSent = true; beacon({ type: 'form_view', action: openedBy }); }
  }

  function close() {
    if (!isOpen()) return;
    pop.classList.remove('open');
    document.documentElement.classList.remove('lead-lock');
    if (window.VardhamanDialogs) window.VardhamanDialogs.close(pop); else pop.setAttribute('aria-hidden', 'true');
    store.set('sessionStorage', DISMISS_KEY, '1'); // closed once: never auto-open again this visit
  }

  function submit(event) {
    event.preventDefault();
    error.textContent = '';
    const fields = form.elements, picked = form.querySelector('input[name=class_band]:checked');
    const phone = fields.phone.value.replace(/[\s-]/g, '');
    if (fields.name.value.trim().length < 2) { error.textContent = T.eName; fields.name.focus(); return; }
    if (!/^[6-9]\d{9}$/.test(phone)) { error.textContent = T.ePhone; fields.phone.focus(); return; }
    if (!picked) { error.textContent = T.eClass; return; }
    const params = new URLSearchParams(location.search);
    let referrer = '';
    try { referrer = document.referrer ? new URL(document.referrer).hostname : ''; } catch (e) {}
    const body = {
      name: fields.name.value, phone: fields.phone.value, class_band: picked.value, website: fields.website.value,
      source: (location.pathname || '/') + ' · ' + openedBy,
      device: /iPad|Tablet/i.test(navigator.userAgent) || (Math.min(screen.width, screen.height) >= 600 && matchMedia('(pointer:coarse)').matches) ? 'tablet' : (matchMedia('(pointer:coarse)').matches || innerWidth < 768 ? 'mobile' : 'desktop'),
      trigger: openedBy,
      utm_source: params.get('utm_source') || referrer, utm_medium: params.get('utm_medium') || '', utm_campaign: params.get('utm_campaign') || ''
    };
    button.disabled = true; button.textContent = T.sending;
    fetch(api, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
      .then(response => {
        if (!response.ok) throw new Error(String(response.status));
        store.set('localStorage', DONE_KEY, String(Date.now()));
        gtagEvent('generate_lead', { trigger: openedBy, class_band: picked.value });
        form.hidden = true; thanks.hidden = false;
        if (number && !thanks.querySelector('.lead-wa')) {
          const link = document.createElement('a');
          link.className = 'lead-wa';
          link.href = 'https://wa.me/' + number + '?text=' + encodeURIComponent(T.waText);
          link.target = '_blank'; link.rel = 'noopener';
          link.textContent = T.wa;
          thanks.appendChild(link);
        }
        thanks.focus();
      })
      .catch(() => { error.textContent = T.eSend; button.textContent = T.submit; refresh(); });
  }

  // 1) Every enquiry button, in any page, opens this same popup.
  const isOpener = el => el && (el.hasAttribute('data-lead-open') || /(^|\/|\.html)#enquiry$/.test(el.getAttribute('href') || ''));
  document.addEventListener('click', event => {
    const el = event.target && event.target.closest ? event.target.closest('a,button') : null;
    if (!el) return;
    const href = el.getAttribute('href') || '';
    if (isOpener(el)) {
      event.preventDefault(); event.stopPropagation(); // keep the page from scrolling to the old form section
      beacon({ type: 'cta', action: el.classList.contains('mobile-bottom') ? 'enquiry_bar' : 'enquiry_button' });
      open('button', el);
    } else if (/wa\.me|whatsapp/i.test(href)) beacon({ type: 'cta', action: 'whatsapp' });
    else if (/^tel:/i.test(href)) beacon({ type: 'cta', action: 'call' });
    else if (/maps/i.test(href)) beacon({ type: 'cta', action: 'map' });
  }, true);

  // 2) One gentle automatic appearance, home page only, and only after real interest:
  //    at least 20 seconds on the page AND (scrolled past the middle OR about to leave).
  //    Never again once it was closed this visit or a lead was sent in the last 30 days.
  if (document.getElementById('enquiry')) {
    const startedAt = Date.now(), MIN_MS = 20000;
    const busy = () => isOpen() || !!document.querySelector('.modal.open, .media-modal.open');
    let fired = false, timer = 0;
    const ready = () => !fired && Date.now() - startedAt >= MIN_MS && !busy() && !store.get('sessionStorage', DISMISS_KEY) && !alreadySubmitted();
    const fire = why => { if (!ready()) return false; fired = true; open('auto-' + why, null); return true; };
    const depth = () => { const h = document.documentElement; const max = h.scrollHeight - h.clientHeight; return max > 0 ? window.scrollY / max : 0; };
    window.addEventListener('scroll', () => {
      if (fired || depth() < 0.5) return;
      if (fire('scroll')) return;
      // Scrolled far enough but still inside the first 20 seconds: try again once the wait is over.
      clearTimeout(timer);
      timer = setTimeout(() => { if (depth() >= 0.5) fire('scroll'); }, Math.max(250, MIN_MS - (Date.now() - startedAt) + 100));
    }, { passive: true });
    // Desktop exit intent: pointer leaves through the top of the window.
    document.addEventListener('mouseout', event => { if (!event.relatedTarget && event.clientY <= 0) fire('exit'); });
  }
})();
