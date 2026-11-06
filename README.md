# CodeShift – AI Code Converter

Paste code in the left editor, choose a target language, and CodeShift converts it
using AI (via [Puter.js](https://developer.puter.com/), no API key required).

## Tech stack
- React 19 + Vite 7
- Tailwind CSS v4
- CodeMirror (`@uiw/react-codemirror`) with the Dracula theme
- lucide-react icons
- Puter.js AI (`puter.ai.chat`) loaded from `index.html`

## Getting started
```bash
npm install
npm run dev      # start dev server (http://localhost:5173)
npm run build    # production build into /dist
npm run lint     # run ESLint
```

## Features
- Convert to Python, Java, C++, C#, Go, Rust, TypeScript, Kotlin, Swift, PHP or Ruby
- Syntax-highlighted input and read-only output editors
- One-click copy of the converted code
- Loading state, success/error messages, and a reset button
- Automatically strips markdown code fences from the AI reply

## Notes
- The first time you convert, Puter may ask you to sign in / create a free account.
- An internet connection is required (the AI runs through Puter).
