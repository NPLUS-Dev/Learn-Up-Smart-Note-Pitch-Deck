# Smart Note — Pitch Deck

Interactive, dependency-free HTML pitch deck for **Smart Note**, an AI-native markdown workspace. 13 slides, several with live interactive demos.

## View it live

**https://nplus-dev.github.io/Learn-Up-Smart-Note-Pitch-Deck/**

## Controls

| Key | Action |
|---|---|
| `→` `Space` `Enter` `PageDown` | Next slide |
| `←` `PageUp` | Previous slide |
| `Home` / `End` | First / last slide |
| `M` | Toggle outline (agenda) |
| `F` | Toggle fullscreen |
| Swipe (mobile) | Change slide |

Typing in a demo's input/editor/search box doesn't trigger slide navigation. Append `#5` to the URL to jump straight to slide 5.

## Slides

1. Cover
2. Problem
3. Solution
4. Proofreader — logic-error detection *(live demo)*
5. AI Generation Engine — 3D / simulation *(live demo)*
6. Context-Aware AI Tutor *(live demo)*
7. Handwriting → LaTeX *(product footage video)*
8. Traction (OBT)
9. Market & Roadmap
10. Business Model — B2C → B2B → B2G
11. Growth Loop — peer-referral credits
12. Founder Deep-Dive
13. The Ask — $300k pre-seed + use of funds

## Files

```
smart-note-pitch/
├─ index.html                       # the deck (English)
├─ css/deck.css                     # design system + layout/demo styles
├─ js/
│  ├─ deck.js                       # navigation / outline / fullscreen
│  ├─ universe.en.js                # cover backdrop starfield canvas
│  ├─ demos.en.js                   # interactive demo logic
│  ├─ universe.js, demos.js         # unused — leftover from a since-removed Korean deck
├─ data/traction.json               # Traction slide's sign-up number; overwritten by the workflow below
├─ scripts/fetch-traction.mjs       # pulls product-usage numbers into data/traction.json
└─ .github/workflows/update-traction.yml  # daily cron that runs the script above
```

The Traction slide's metrics (time-to-first-value, AI generation usage, feature retention)
fetch `data/traction.json` at load time; each tile stays at its placeholder if that file is
missing or unreachable.
