# Fufu Spaced Rep — Claude Code Context

## What this is

A spaced repetition tracker for math problems that Christopher ("Fufu") partially understands. Single HTML file hosted on GitHub Pages. Two users: Andrew (dad) and occasionally a math tutor.

**App URL**: https://grrarr.github.io/fufu-spaced-rep/
**Repo**: https://github.com/grrarr/fufu-spaced-rep
**Source**: `index.html` (single file — React + Babel standalone, localStorage for persistence)

## Primary task: Adding questions

Most sessions here are "add to spaced rep: [topic]". The workflow:

1. Andrew describes a topic/problem — often vague, like "add something about nCk combinations"
2. **Draft the full question** with 2-3 numerical examples + notes + solution
3. **Show Andrew for approval** before editing anything
4. Surgically edit `index.html` — insert a new entry into the `DEFAULT_QUESTIONS` array
5. `git commit` with a descriptive message + `git push`
6. Live on GitHub Pages in ~30 seconds

### Question format in DEFAULT_QUESTIONS:

```js
{
  id: N,  // increment from last entry
  question: "Full problem text with \\n for line breaks.\\n\\nExample 1: ...\\nExample 2: ...",
  notes: "Why this was added, what concept it tests, what Christopher struggled with.",
  solution: "Worked solutions for each example.",
  dateAdded: "YYYY-MM-DD",  // today's date
  attempts: ["YYYY-MM-DD"],  // today's date (first attempt)
},
```

### What makes a good question:

- **Self-contained** — full problem description, not just a topic name
- **2-3 numerical examples** — concrete, not abstract
- **Notes explain the why** — what triggered adding this, common mistakes
- **Solution is complete** — worked step-by-step for each example

## App architecture (for feature changes)

- Single `index.html` file — React 18 + Babel standalone via CDN
- `window.storage` shim wraps `localStorage` (originally built for Claude artifacts)
- Storage keys (DO NOT CHANGE): `fufu-spaced-rep-v1`, `fufu-spaced-rep-v1-backup`, `fufu-last-exported`
- On load: tries primary storage → backup → merges `DEFAULT_QUESTIONS` (by trimmed question text)
- `mergeDefaults` also backfills missing fields (e.g., solution) onto existing questions
- Save wipe guard: never overwrites N questions with 0
- Spacing schedule: 1 attempt→3d, 2→7d, 3→14d, 4+→30d

## Rules

- **At the start of every session, display the app URL**: https://grrarr.github.io/fufu-spaced-rep/
- **Always show the drafted question for approval before editing the file**
- **Always include a solution field** on new questions
- **Always `git push` after committing** — the app is served from GitHub Pages
- **Never edit storage keys** — they must stay identical across versions
- The `DEFAULT_QUESTIONS` array is the rebuild safety net — it must be easy to find at the top of the file
- Questions added via browser UI only persist in localStorage (not in git) — prefer adding via Claude Code

## Other files

- `WORKFLOW.md` — user-facing guide for what to do where (browser vs Claude Code vs Claude Chat)
- `CHAT_CONTEXT.md` — context doc for Claude Chat sessions (tutoring). Chat drafts questions, Claude Code adds them.

## Student context

Christopher is preparing for AMC 8 math competitions. See `christopher_amc8_math_reference.md` and `andrew_christopher_knowledge_doc_v3.md` in Dropbox for full student context.
