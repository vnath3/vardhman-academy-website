import assert from 'node:assert/strict';

// Student results shown on the public site. Privacy rules enforced here, not by convention:
// first name + last initial only, no school names, no ranks, no photos, no aggregate claims.
// Default-deny: a student renders only when approved AND the batch consent flags are true
// AND an owner approval record exists.
const BOARDS = ['CBSE', 'ICSE', 'SSC'];

function requireApproval(record, label) {
  for (const key of ['approved_by', 'approved_on', 'evidence']) assert.ok(typeof record?.[key] === 'string' && record[key].trim(), `${label}: missing ${key}`);
  assert.match(record.approved_on, /^\d{4}-\d{2}-\d{2}$/, `${label}: invalid date`);
}

export function validateResults(doc) {
  assert.equal(doc.schema_version, '1.0', 'Unsupported results schema');
  assert.equal(doc.release_policy, 'default_deny');
  assert.ok(Array.isArray(doc.required_verifications)
    && doc.required_verifications.includes('usage_rights') && doc.required_verifications.includes('guardian_consent'), 'Results require usage_rights and guardian_consent verifications');
  assert.ok(Array.isArray(doc.years), 'years must be an array');
  const seen = new Set();
  let anyApproved = false;
  for (const year of doc.years) {
    assert.match(year.year, /^\d{4}–\d{2}$/, `Invalid year label: ${year.year}`);
    assert.ok(Array.isArray(year.students) && year.students.length > 0, `Year needs students: ${year.year}`);
    for (const student of year.students) {
      assert.match(student.name, /^[A-Z][a-z]+ [A-Z]\.$/, `Name must be first name + last initial: ${student.name}`);
      assert.match(student.percent, /^\d{2,3}(\.\d)?$/, `Invalid percentage: ${student.name}`);
      assert.ok(Number(student.percent) <= 100 && Number(student.percent) > 0, `Percentage out of range: ${student.name}`);
      if (student.board !== undefined) assert.ok(BOARDS.includes(student.board), `Invalid board: ${student.name}`);
      assert.ok(['approved', 'pending', 'rejected'].includes(student.approval_status), `Invalid approval status: ${student.name}`);
      const key = `${year.year}|${student.name}`;
      assert.ok(!seen.has(key), `Duplicate result: ${key}`);
      seen.add(key);
      for (const forbidden of ['school', 'rank', 'photo', 'image']) assert.ok(!(forbidden in student), `Field not allowed: ${forbidden}`);
      if (student.approval_status === 'approved') anyApproved = true;
    }
  }
  if (anyApproved) {
    for (const requirement of doc.required_verifications) assert.equal(doc.verified?.[requirement], true, `Unverified ${requirement}`);
    requireApproval(doc.approval_record, 'Results approval');
  }
  return doc.years;
}

export function planResults(doc, { privateReview = false } = {}) {
  const years = validateResults(doc);
  const verified = doc.required_verifications.every(requirement => doc.verified?.[requirement] === true);
  return years.map(year => ({
    year: year.year,
    students: year.students
      .filter(student => privateReview || (student.approval_status === 'approved' && verified))
      .map(student => ({ name: student.name, percent: student.percent, ...(student.board ? { board: student.board } : {}) }))
      .sort((a, b) => Number(b.percent) - Number(a.percent))
  })).filter(year => year.students.length > 0);
}

const escapeText = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

export function renderResults(years = []) {
  if (!years.length) return '';
  const panels = years.map(({ year, students }) => {
    const top = students.slice(0, 3), rest = students.slice(3);
    const cards = top.map(student => `<li class="result-card"><strong class="result-percent">${escapeText(student.percent)}<small>%</small></strong><span class="result-name">${escapeText(student.name)}</span>${student.board ? `<span class="result-board">${escapeText(student.board)}</span>` : ''}</li>`).join('');
    const more = rest.length ? `<details class="results-more"><summary>Show all ${students.length} results</summary><ul class="results-list">${rest.map(student => `<li><span>${escapeText(student.name)}</span><b>${escapeText(student.percent)}%</b>${student.board ? `<i>${escapeText(student.board)}</i>` : ''}</li>`).join('')}</ul></details>` : '';
    return `<div class="results-year" data-year="${escapeText(year)}"><h3 class="results-year-title">${escapeText(year)}</h3><ul class="results-top">${cards}</ul>${more}</div>`;
  }).join('');
  return `<div class="results" id="results">${panels}</div>`;
}
