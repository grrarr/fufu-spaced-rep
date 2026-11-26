// FT-A2, FT-A3, FT-A4 (waiting-on-andrew v16, Andrew "defaults" 2026-11-25 22:35 ET).
// FT-A3: a load used to take the GitHub copy and drop every attempt logged on a device without the
//   GitHub key (the tutor's). Now the GitHub and local copies are MERGED: every attempt from both is
//   kept, one per card per day, the newest (`at` ms stamp) winning on a clash.
// FT-A4: a save refused with 409 (another device saved first) is retried once after re-reading GitHub
//   and merging, instead of failing every save for the rest of the session.
// FT-A2: TODAY is fixed at page load; on a new Eastern day the page reloads itself when the add-card
//   form is empty, otherwise shows a "new day - reload" banner (typed text is never lost).
// Run: node --test test-ft-a234.js   (also: node test-ft-a234.js)
const assert = require('assert');
const test = require('node:test');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const block = html.match(/\/\/ ---- pure: mergeQuestions ----([\s\S]*?)\/\/ ---- end pure mergeQuestions ----/);
// eslint-disable-next-line no-new-func
const lib = block && new Function(block[1] + '\nreturn { mergeQuestions, addFormEmpty };')();

const q = (id, attempts, extra = {}) => ({ id, question: 'q' + id, attempts, ...extra });

test('pure block present', () => { assert.ok(lib, 'mergeQuestions block missing from index.html'); });

test('keeps every attempt from both copies, sorted by date', () => {
  const out = lib.mergeQuestions(
    [q(1, [{ date: '2026-03-01', result: 'pass' }, { date: '2026-03-10', result: 'fail' }])],
    [q(1, [{ date: '2026-03-01', result: 'pass' }, { date: '2026-03-05', result: 'pass' }])]);
  assert.deepStrictEqual(out[0].attempts.map(a => a.date), ['2026-03-01', '2026-03-05', '2026-03-10']);
});

test('one attempt per card per day: newest stamp wins', () => {
  let out = lib.mergeQuestions(
    [q(1, [{ date: '2026-03-01', result: 'pass', at: 100 }])],
    [q(1, [{ date: '2026-03-01', result: 'fail', at: 200 }])]);
  assert.strictEqual(out[0].attempts.length, 1);
  assert.strictEqual(out[0].attempts[0].result, 'fail');
  out = lib.mergeQuestions(
    [q(1, [{ date: '2026-03-01', result: 'pass', at: 300 }])],
    [q(1, [{ date: '2026-03-01', result: 'fail', at: 200 }])]);
  assert.strictEqual(out[0].attempts[0].result, 'pass');
});

test('same day, no stamps: local copy wins; a stamped attempt beats an unstamped one', () => {
  let out = lib.mergeQuestions([q(1, [{ date: 'd', result: 'pass' }])], [q(1, [{ date: 'd', result: 'fail' }])]);
  assert.strictEqual(out[0].attempts[0].result, 'pass');
  out = lib.mergeQuestions([q(1, [{ date: 'd', result: 'pass' }])], [q(1, [{ date: 'd', result: 'fail', at: 1 }])]);
  assert.strictEqual(out[0].attempts[0].result, 'fail');
});

test('old string attempts are normalised', () => {
  const out = lib.mergeQuestions([q(1, ['2026-01-01'])], [q(1, [{ date: '2026-01-02', result: 'fail' }])]);
  assert.deepStrictEqual(out[0].attempts, [{ date: '2026-01-01', result: 'pass' }, { date: '2026-01-02', result: 'fail' }]);
});

test('cards only on one side are kept; order follows local, then remote-only', () => {
  const out = lib.mergeQuestions([q(2, []), q(1, [])], [q(1, []), q(3, [])]);
  assert.deepStrictEqual(out.map(x => x.id), [2, 1, 3]);
});

test('card fields come from the local copy', () => {
  const out = lib.mergeQuestions([q(1, [], { notes: 'mine' })], [q(1, [], { notes: 'theirs' })]);
  assert.strictEqual(out[0].notes, 'mine');
});

test('empty / missing inputs do not throw', () => {
  assert.deepStrictEqual(lib.mergeQuestions([], null), []);
  assert.deepStrictEqual(lib.mergeQuestions(null, [q(1, [])]).map(x => x.id), [1]);
});

test('addFormEmpty', () => {
  assert.strictEqual(lib.addFormEmpty(['', '  ', '']), true);
  assert.strictEqual(lib.addFormEmpty(['', 'x']), false);
});

test('wiring', () => {
  const load = html.slice(html.indexOf('// Try GitHub first'), html.indexOf('setQs(loaded);'));
  assert.ok(/mergeQuestions\(/.test(load), 'load does not merge GitHub with local');
  const save = html.slice(html.indexOf('const save = useCallback'), html.indexOf('useEffect(() => {'));
  assert.ok(/mergeQuestions\(/.test(save) && /409/.test(save), 'save does not merge + retry on 409');
  const att = html.slice(html.indexOf('const doAttempt'), html.indexOf('const doUndo'));
  assert.ok(/at:\s*Date\.now\(\)/.test(att), 'doAttempt does not stamp at');
  assert.ok(/visibilitychange/.test(html) && /etToday\(\)/.test(html), 'no new-day check');
  assert.ok(/location\.reload\(\)/.test(html) && /New day/.test(html), 'no reload / banner');
  assert.ok(/^const TODAY = /m.test(html), 'const TODAY line must stay (test-today-et-app.js)');
});
