# SpeakDaily

**Daily English speaking practice made simple.**

A responsive English speaking practice web app for Hindi-speaking users.

## Stack

- React + Vite
- Tailwind CSS v4
- React Router
- lucide-react icons
- localStorage for favorites and recent practice (no backend)

## Getting started

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (http://localhost:5299).

## Build

```bash
npm run build
npm run preview
```

## Adding content

Edit `src/data/content.js`:

- `speakingTopics` — full topic objects with sentences, tasks, and model answers
- `hindiToEnglishPractice` — standalone Hindi/English pairs
- `sentencePatterns` — sentence builder patterns

## Features

- Onboarding with localStorage
- 12 speaking topics in one category
- Text-to-speech (browser `speechSynthesis`)
- Voice recording UI (MediaRecorder when permitted)
- Favorites and recent practice (Continue Learning)
- Search on topics and Hindi–English lists
- Desktop: centered 430px app shell
