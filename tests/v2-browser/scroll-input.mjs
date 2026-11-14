// Native browser input, starting wherever the user currently is. No scrollTo,
// scrollIntoView or source-side animation hooks are used for slow-scroll checks.
export async function slowScrollUntil(page, predicate, mobile, maxSteps = 260) {
  const viewport = page.viewportSize();
  const touch = mobile ? await page.context().newCDPSession(page) : null;
  let steps = 0;
  try {
    while (steps < maxSteps) {
      if (await page.evaluate(predicate)) return;
      if (touch) await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: viewport.width * .48, y: viewport.height * .78 }] });
      let done = false;
      for (let step = 1; step <= 12 && steps < maxSteps; step++, steps++) {
        if (touch) await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: viewport.width * .48, y: viewport.height * .78 - step * 18 }] });
        else await page.mouse.wheel(0, 18);
        await page.waitForTimeout(50);
        if (await page.evaluate(predicate)) { done = true; break; }
      }
      if (touch) await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      if (done) return;
      await page.waitForTimeout(80);
    }
    throw new Error('Slow native scroll did not reach the expected visible state');
  } finally { await touch?.detach(); }
}
