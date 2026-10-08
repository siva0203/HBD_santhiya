# 🎬 A Cinematic Friendship Birthday Adventure

**Two HTML files, one shared set of assets** — exactly as requested:

```
countdown.html   → pre-birthday landing page (live countdown, auto-redirects)
index.html       → the full cinematic experience (opens with its own
                    countdown-to-birthday screen, then loader → trailer →
                    PIN → the full chapter-by-chapter story)
css/, js/, config/, assets/  → shared by both files (countdown-specific
                    files are prefixed `countdown-` to avoid collisions)
```

## How it works

1. Send her the `countdown.html` link.
2. She sees a live countdown. At zero, it **automatically redirects** to
   `index.html` — no manual link-switching needed from you.
3. `index.html` opens with its own opening screen (a live countdown to her
   birthday + turning age), then the loader, cinematic trailer, PIN screen,
   and the full 15-chapter story.

## Editing

- Her name, PIN, dates, letter text, chapter titles, colors/fonts, music
  slots → `config/config.js`
- Countdown target date/redirect URL → `config/countdown-config.js`
- **Keep both dates in sync** if you change the birthday — `nextBirthdayDateTime`
  in `config/config.js` and `unlockDateTime` in `config/countdown-config.js`
  should match.

## Testing

```bash
python3 -m http.server 8080
```
Then open `http://localhost:8080/countdown.html?preview=true` (skips
straight to the redirect) or `http://localhost:8080/index.html?preview=true`
(skips straight past the opening screen's real-time wait — the on-page
countdown itself still shows real numbers, it just won't block you).

## What's fully implemented

Two-file structure, opening/loader/trailer/PIN boot chain, 15 chapters
(Fairy Kingdom → Story Book → Memory Book → Library of Future → Timeline →
Chat → Puzzle → Gift → Greeting Card → Cake → Celebration → Music Room →
Credits → Secret Ending), fairy companion, Time Freeze Twist, Fake Broken
Gift twist, Wish Constellation, Moon Message, Fake Ending/Fairy Returns,
Final Envelope, 5 scratch-to-reveal moments, Completion Whisper, original
synthesized sound effects and music, scene-based navigation via click,
swipe, keyboard, and scroll/wheel.

## What's intentionally simplified (and why)

- Camera movement is CSS/Three.js-camera-driven, not a full rigged 3D
  camera rig — reads as cinematic at a fraction of the build cost and
  stays performant on low-end Android.
- Fairy companion is a reactive emoji + text widget, not a rigged 3D/sprite
  character.
- Two Act-level music tracks with crossfade, not 13+ fully unique
  per-chapter compositions.
- "Living World" covers butterflies + fireflies; birds/trees/water are not
  implemented — same extension pattern (`js/livingworld.js`) would cover
  them if wanted later.

## Known follow-ups (not yet addressed)

- A dedicated visual/alignment audit pass across all 15 chapters — this
  session covered specific reported issues (gift portal, fireworks, fairy
  sequencing, opening screen) but a full pass on every chapter's spacing
  hasn't been done yet.
- The day→night sky gradient works and is confirmed changing color per
  chapter, but could be pushed to feel more dramatic/distinct.
