// The supplied Google tag initializer, hosted locally to respect script CSP.
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', 'G-4F7P27EQSF');

// Lightweight engagement events (no personal data; never reads form text).
// Events use the same GA4 tag above. All wrapped so analytics can never break the page.
(function () {
  function track(name, params) { try { gtag('event', name, params || {}); } catch (e) {} }
  try {
    // 1) Section reach: fires once per section the first time ~40% is visible.
    var names = { home: 'hero', parents: 'parent_message', journey: 'class_journey', brainlab: 'brain_lab', approach: 'approach', about: 'mentor', enquiry: 'enquiry' };
    var targets = [];
    Object.keys(names).forEach(function (id) { var el = document.getElementById(id); if (el) targets.push([el, names[id]]); });
    [['.v2-gallery', 'gallery'], ['.v2-outcomes', 'outcomes'], ['.faq', 'faq']].forEach(function (p) { var el = document.querySelector(p[0]); if (el) targets.push([el, p[1]]); });
    if ('IntersectionObserver' in window) {
      var seen = {};
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var name = e.target.__fx; io.unobserve(e.target);
          if (!seen[name]) { seen[name] = 1; track('section_view', { section: name }); }
        });
      }, { threshold: 0.4 });
      targets.forEach(function (t) { t[0].__fx = t[1]; io.observe(t[0]); });
    }
    // 2) Scroll depth milestones.
    var marks = [25, 50, 75, 100], fired = {};
    window.addEventListener('scroll', function () {
      var h = document.documentElement; var max = h.scrollHeight - h.clientHeight; if (max <= 0) return;
      var pct = (window.scrollY / max) * 100;
      marks.forEach(function (m) { if (pct >= m - 1 && !fired[m]) { fired[m] = 1; track('scroll_depth', { percent: m }); } });
    }, { passive: true });
    // 3) Taps on key actions, classified by destination only.
    document.addEventListener('click', function (ev) {
      var el = ev.target && ev.target.closest ? ev.target.closest('a,button') : null;
      if (!el) return;
      var href = el.getAttribute('href') || '', id = el.id || '', kind = '';
      if (/wa\.me|whatsapp/i.test(href)) kind = 'whatsapp';
      else if (/^tel:/i.test(href)) kind = 'call';
      else if (/maps/i.test(href)) kind = 'map';
      else if (href === '#enquiry') kind = el.classList.contains('mobile-bottom') ? 'enquiry_bar' : 'enquiry_button';
      else if (id === 'whatsappEnquiry') kind = 'whatsapp_draft';
      else if (id === 'copyEnquiry') kind = 'copy_draft';
      else if (id === 'classNext') kind = 'enquiry_step1_continue';
      if (kind) track('cta_click', { action: kind });
    }, true);
  } catch (e) {}
})();
