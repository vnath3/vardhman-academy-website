import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { renderConceptScript } from '../src/v2-settings.mjs';
import { stubAnalytics } from '../tests/production-browser/analytics.mjs';

const [base = 'https://deploy-preview-1--va-academy.netlify.app/', label = 'hosted', widthArg = '390'] = process.argv.slice(2);
const width = Number(widthArg), height = width < 780 ? 844 : 900;
const captureUrl = new URL(base);
// Netlify's documented test-only option avoids its CSP-blocked collaboration
// drawer obscuring the recording. Application assets and motion are unchanged.
if (label !== 'before') captureUrl.searchParams.set('ntl-drawer-state', 'hidden');
const output = path.resolve('qa/visual', `${label}-${width}`);
await mkdir(output, { recursive: true });
const commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const normalize = text => text.replaceAll('\r\n', '\n');
const hash = text => createHash('sha256').update(normalize(text)).digest('hex');
const assets = [];
for (const name of ['concept.js', 'v2.css', 'v2.js']) {
  const response = await fetch(new URL(name, base));
  const served = await response.text();
  const source = execFileSync('git', ['show', `${commit}:src/v2/${name}`], { encoding: 'utf8' });
  const expected = name === 'concept.js' ? renderConceptScript(source) : source;
  assets.push({ name, status: response.status, sha256: hash(served), matchesCommit: hash(served) === hash(expected) });
}
if (assets.some(asset => asset.status !== 200 || !asset.matchesCommit)) throw new Error(`Hosted assets do not match ${commit}: ${JSON.stringify(assets)}`);
const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({ viewport: { width, height }, hasTouch: width < 780, isMobile: width < 780, reducedMotion: 'no-preference', recordVideo: { dir: output, size: { width, height } } });
const page = await context.newPage();
await stubAnalytics(page);
await page.addInitScript(() => {
  window.scrollEvidence = { events: [], samples: [], inputs: [] };
  const rect = element => {
    if (!element) return null;
    const { top, bottom } = element.getBoundingClientRect();
    return { top, bottom };
  };
  for (const type of ['animationstart', 'animationend', 'pointerdown']) document.addEventListener(type, event => {
    if (event.type === 'pointerdown') {
      window.scrollEvidence.inputs.push({ time: performance.now(), type: event.pointerType, section: event.target.closest('section')?.id });
    } else if (event.target.closest('#parents, #about, #life-at-vardhaman')) {
      window.scrollEvidence.events.push({ time: performance.now(), type, animation: event.animationName, target: event.target.className, pseudo: event.pseudoElement, y: scrollY, heading: rect(document.querySelector('#parents h2')), word: rect(document.querySelector('.become-word')) });
    }
  });
  setInterval(() => {
    const heading = document.querySelector('#parents h2'), word = document.querySelector('.become-word');
    if (!heading || !word) return;
    window.scrollEvidence.samples.push({ time: performance.now(), y: scrollY, heading: rect(heading), word: rect(word), headingClass: heading.className, opacity: getComputedStyle(heading).opacity, transform: getComputedStyle(heading).transform, underline: getComputedStyle(word, '::after').transform, progress: heading.style.getPropertyValue('--underline-progress'), cards: [...document.querySelectorAll('#parents .worry-item')].map(element => ({ ...rect(element), className: element.className, opacity: getComputedStyle(element).opacity })) });
  }, 80);
});
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const response = await page.goto(captureUrl.href, { waitUntil: 'domcontentloaded' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);
const shots = [];
async function screenshot(name) {
  const snapshot = await page.evaluate(() => ({ time: performance.now(), y: scrollY }));
  const file = path.join(output, `${shots.length}-${name}.png`);
  await page.screenshot({ path: file });
  shots.push({ ...snapshot, file });
}
await screenshot('top');
const touch = width < 780 ? await context.newCDPSession(page) : null;
let checkpoint = 0;
for (let stroke = 0; stroke < 28; stroke++) {
  if (touch) await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: width * .48, y: height * .78 }] });
  for (let step = 1; step <= 12; step++) {
    if (touch) await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: width * .48, y: height * .78 - step * 18 }] });
    else await page.mouse.wheel(0, 18);
    await page.waitForTimeout(70);
    const state = await page.locator('#parents').evaluate(element => ({ bottom: element.getBoundingClientRect().bottom, wordBottom: element.querySelector('.become-word').getBoundingClientRect().bottom, headingTop: element.querySelector('h2').getBoundingClientRect().top, visible: element.querySelector('h2').classList.contains('visible'), progress: Number(element.querySelector('h2').style.getPropertyValue('--underline-progress')), cards: [...element.querySelectorAll('.worry-item')].every(card => card.classList.contains('visible')) }));
    const current = label !== 'before';
    if (checkpoint === 0 && (current ? state.visible : state.headingTop < height * .86)) { await screenshot('heading-lift'); checkpoint++; }
    if (checkpoint === 1 && (current ? state.progress > .4 : state.wordBottom < height * .82)) { await screenshot('underline-drawing'); checkpoint++; }
    if (checkpoint === 2 && (current ? state.cards : state.bottom < height * .93)) { await screenshot('cards-follow'); checkpoint++; }
  }
  if (touch) await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  const done = await page.locator('#parents').evaluate(element => element.getBoundingClientRect().bottom < innerHeight * .7);
  if (done) break;
  await page.waitForTimeout(120);
}
await page.waitForTimeout(700);
const evidence = await page.evaluate(() => window.scrollEvidence);
const video = page.video();
await context.close();
await video.saveAs(path.join(output, 'scroll.webm'));
await browser.close();
await writeFile(path.join(output, 'evidence.json'), JSON.stringify({ base, captureUrl: captureUrl.href, commit, width, height, reducedMotion: false, input: touch ? 'CDP touch gestures in Chrome mobile emulation' : 'Chrome mouse wheel', status: response.status(), assets, shots, errors, ...evidence }, null, 2));
console.log(JSON.stringify({ output, commit, width, status: response.status(), assets, events: evidence.events, shots, errors }));
