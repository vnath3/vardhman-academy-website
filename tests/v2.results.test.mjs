import test from 'node:test';
import assert from 'node:assert/strict';
import { readV2Results } from '../scripts/contracts.mjs';
import { validateResults, planResults, renderResults } from '../src/v2-results.mjs';
import { renderOutcomes } from '../src/v2-outcomes.mjs';

const doc = await readV2Results();

test('published results use first name + last initial only and carry a consent approval record', () => {
  validateResults(doc);
  for (const year of planResults(doc)) for (const student of year.students) assert.match(student.name, /^[A-Z][a-z]+ [A-Z]\.$/);
  assert.equal(doc.verified.guardian_consent, true);
  assert.ok(doc.approval_record.evidence.length > 40);
});

test('results validation rejects full names, schools, ranks, photos and missing consent', () => {
  const bad = (mutate, pattern) => { const copy = structuredClone(doc); mutate(copy); assert.throws(() => validateResults(copy), pattern); };
  bad(c => { c.years[0].students[0].name = 'Laukik Karnawat'; }, /first name \+ last initial/);
  bad(c => { c.years[0].students[0].school = 'Some School'; }, /Field not allowed/);
  bad(c => { c.years[0].students[0].rank = 1; }, /Field not allowed/);
  bad(c => { c.years[0].students[0].percent = '101'; }, /out of range|Invalid percentage/);
  bad(c => { c.verified.guardian_consent = false; }, /Unverified guardian_consent/);
  bad(c => { c.approval_record = null; }, /Results approval/);
});

test('default-deny: unapproved or unverified students never render', () => {
  const copy = structuredClone(doc);
  copy.years[0].students[0].approval_status = 'pending';
  const planned = planResults(copy);
  assert.ok(!planned[0].students.some(s => s.name === 'Laukik K.'));
  assert.ok(planResults(copy, { privateReview: true })[0].students.some(s => s.name === 'Laukik K.'));
  const unverified = structuredClone(doc); unverified.verified.usage_rights = false;
  assert.throws(() => planResults(unverified), /Unverified usage_rights/);
});

test('results render: top three as cards, the rest behind a disclosure, no school or rank text', () => {
  const html = renderResults(planResults(doc));
  assert.equal((html.match(/class="result-card"/g) || []).length, 9);
  assert.match(html, /Show all 23 results/);
  assert.match(html, /<h3 class="results-year-title">2025–26<\/h3>/);
  assert.doesNotMatch(html, /RYAN|DGA|NVS|rank/i);
  const section = renderOutcomes([], planResults(doc));
  assert.match(section, /id="outcomes"/); assert.match(section, /id="results"/);
  assert.equal(renderOutcomes([], []), '');
});
