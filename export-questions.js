// Extracts DEFAULT_QUESTIONS from index.html → exports/YYYY-MM-DD.json
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

// Extract the array between "const DEFAULT_QUESTIONS = [" and the closing "];"
const start = html.indexOf('const DEFAULT_QUESTIONS = [');
if (start === -1) { console.error('DEFAULT_QUESTIONS not found'); process.exit(1); }
const arrayStart = html.indexOf('[', start);
let depth = 0, end = -1;
for (let i = arrayStart; i < html.length; i++) {
  if (html[i] === '[') depth++;
  if (html[i] === ']') depth--;
  if (depth === 0) { end = i + 1; break; }
}
const arrayText = html.slice(arrayStart, end);

// Eval it (it's JS object syntax, not JSON — has unquoted keys, trailing commas)
const questions = eval(arrayText);

// Write to exports/YYYY-MM-DD.json
const today = new Date().toISOString().slice(0, 10);
const outDir = path.join(__dirname, 'exports');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
const outPath = path.join(outDir, `${today}.json`);
fs.writeFileSync(outPath, JSON.stringify(questions, null, 2) + '\n');
console.log(`Exported ${questions.length} questions → exports/${today}.json`);
