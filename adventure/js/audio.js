/**
 * AUDIO.js — central sound manager
 * All sound files are placeholders in /assets/audio/. Swap freely —
 * filenames must stay the same, or update the paths below.
 * Uses the WebAudio API with graceful fallback (no crash if files are missing).
 */

const SoundManager = (() => {
  const files = {
    ambient: "assets/audio/Our Cycle - Flute _ Instrumental.mp3",
    ambientAct3: "assets/audio/Our Cycle - Flute _ Instrumental.mp3",
    trailerBGM: "assets/audio/trailer-bgm.wav",
    pageFlip: "assets/audio/page-flip.wav",
    sparkle: "assets/audio/sparkle.wav",
    giftOpen: "assets/audio/gift-open.wav",
    puzzleComplete: "assets/audio/puzzle-complete.wav",
    fireworks: "assets/audio/fireworks.wav",
    wind: "assets/audio/ambient-music.wav",
    chime: "assets/audio/chime.wav"
  };

  const players = {};
  const baseVolumes = {};
  let muted = false;
  let masterVolume = 0.5;
  let musicStarted = false;
