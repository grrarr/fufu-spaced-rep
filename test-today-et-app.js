// Pins the review date the APP stamps on attempts (index.html `const TODAY`).
// It must be the Eastern calendar date: at 20:30 ET the UTC date is already
// tomorrow, and a UTC stamp made the next day's review REPLACE that attempt
// (audit FT-A1, _doc-hygiene/proposals/fufu-tools-audit-2026-11-18.md).
// Run: node test-today-et-app.js
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const m = html.match(/^const TODAY = ([^\n]+);$/m);
assert.ok(m, 'const TODAY line not found in index.html');

function todayAt(iso) {
  const RealDate = Date;
  const pinned = new RealDate(iso).getTime();
  class FakeDate extends RealDate {
    constructor(...a) { if (a.length) super(...a); else super(pinned); }
    static now() { return pinned; }
  }
  // eslint-disable-next-line no-new-func
  return new Function('Date', `return ${m[1]};`)(FakeDate);
}

assert.strictEqual(todayAt('2026-11-18T01:30:00Z'), '2026-11-17'); // 20:30 EST
assert.strictEqual(todayAt('2026-07-01T00:30:00Z'), '2026-06-30'); // 20:30 EDT
assert.strictEqual(todayAt('2026-11-18T05:00:00Z'), '2026-11-18'); // 00:00 EST
console.log('ok test-today-et-app');
