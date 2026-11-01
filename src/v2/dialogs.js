(() => {
  'use strict';
  let active = null, trigger = null, background = [];
  const focusable = dialog => [...dialog.querySelectorAll('button, a[href], input, textarea, select, video[controls], [tabindex]')]
    .filter(element => !element.disabled && element.tabIndex >= 0 && element.getClientRects().length);
  window.VardhamanDialogs = {
    open(dialog, returnTo) {
      if (active) this.close(active);
      active = dialog; trigger = returnTo;
      background = [...document.body.children].filter(element => element !== dialog && element.tagName !== 'SCRIPT')
        .map(element => ({ element, inert: element.inert }));
      for (const item of background) item.element.inert = true;
      dialog.setAttribute('aria-hidden', 'false');
      (focusable(dialog)[0] || dialog).focus();
    },
    close(dialog) {
      if (active !== dialog) return;
      for (const item of background) item.element.inert = item.inert;
      const returnTo = trigger;
      active = null; trigger = null; background = [];
      dialog.setAttribute('aria-hidden', 'true');
      if (returnTo?.isConnected) returnTo.focus();
    }
  };
  document.addEventListener('keydown', event => {
    if (!active || event.key !== 'Tab') return;
    const items = focusable(active), first = items[0], last = items.at(-1);
    if (!items.length) { event.preventDefault(); active.focus(); return; }
    if (event.shiftKey && (document.activeElement === first || !active.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && (document.activeElement === last || !active.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
  }, true);
  document.addEventListener('focusin', event => {
    if (active && !active.contains(event.target)) (focusable(active)[0] || active).focus();
  });
})();
