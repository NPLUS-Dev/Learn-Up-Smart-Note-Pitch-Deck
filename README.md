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
5. AI Generation Engine — formula / graph / diagram / 3D / sim / animation / illustration *(live demo)*
6. Context-Aware AI Tutor *(live demo)*
7. 3D Note Universe — search *(live demo)*
8. Traction (OBT)
9. Market & Roadmap
10. Team & Vision
11. Founder · Engineer
12. Founder · Operator
13. The Ask — investment slider *(live demo)*

## Files

```
smart-note-pitch/
├─ index_en.html        # English deck
├─ css/deck.css          # shared design system + layout/demo styles
└─ js/
   ├─ deck.js             # navigation / outline / fullscreen (shared by both decks)
   ├─ universe.js         # 3D Note Universe canvas (Korean)
   ├─ universe.en.js       # 3D Note Universe canvas (English)
   ├─ demos.js            # interactive demo logic (Korean)
   └─ demos.en.js          # interactive demo logic (English)
```
