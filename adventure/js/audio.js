/**
 * AUDIO.js — central sound manager
 * All sound files are placeholders in /assets/audio/. Swap freely —
 * filenames must stay the same, or update the paths below.
 * Uses the WebAudio API with graceful fallback (no crash if files are missing).
 */

const SoundManager = (() => {
  const files = {
    ambient: "assets/audio/ambient-music.wav",
    ambientAct3: "assets/audio/ambient-music-act3.wav",
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

  function safeLoad(key, src, opts = {}) {
    const audio = new Audio(src);
    audio.preload = "auto";
    audio.loop = !!opts.loop;
    baseVolumes[key] = opts.volume ?? 1;
    audio.volume = baseVolumes[key] * masterVolume;
    audio.addEventListener("error", () => {
      console.info(`[SoundManager] "${key}" audio not found at ${src} — using silent fallback.`);
      try {
        audio.pause();
        audio.src = "";
      } catch (e) {}
    });
    players[key] = audio;
    return audio;
  }

  function init() {
    safeLoad("ambient", files.ambient, { loop: true, volume: 0.35 });
    safeLoad("ambientAct3", files.ambientAct3, { loop: true, volume: 0 });
    safeLoad("trailerBGM", files.trailerBGM, { loop: true, volume: 0.55 });
    safeLoad("pageFlip", files.pageFlip, { volume: 0.6 });
    safeLoad("sparkle", files.sparkle, { volume: 0.5 });
    safeLoad("giftOpen", files.giftOpen, { volume: 0.7 });
    safeLoad("puzzleComplete", files.puzzleComplete, { volume: 0.7 });
    safeLoad("fireworks", files.fireworks, { volume: 0.7 });
    safeLoad("wind", files.wind, { loop: true, volume: 0.2 });
    safeLoad("chime", files.chime, { volume: 0.5 });
  }

  function play(key) {
    if (muted) return;
    const p = players[key];
    if (!p) return;
    try {
      const node = p.cloneNode();
      node.volume = p.volume;
      node.play().catch(() => {});
    } catch (e) { /* ignore */ }
  }

  function playTrailerBGM() {
    const p = players.trailerBGM;
    if (!p || muted) return;
    p.currentTime = 0;
    p.play().catch(() => {});
  }
  function pauseTrailerBGM() { players.trailerBGM?.pause(); }
  function resumeTrailerBGM() { if (!muted) players.trailerBGM?.play().catch(() => {}); }
  function stopTrailerBGM() {
    const p = players.trailerBGM;
    if (!p) return;
    p.pause();
    p.currentTime = 0;
  }

  function startAmbient() {
    if (musicStarted || muted || externalPlayback) return;
    musicStarted = true;
    players.ambient?.play().catch(() => {});
    players.wind?.play().catch(() => {});
  }

  function resumeAmbientIfNeeded() {
    if (muted || externalPlayback) return;
    musicStarted = true;
    const activeTrack = players[activeAmbientKey];
    activeTrack?.play().catch(() => {});
    players.wind?.play().catch(() => {});
  }

  let activeAmbientKey = "ambient";
  let externalPlayback = false;
  let ambientWasPlaying = false;

  function setExternalPlayback(isPlaying) {
    if (externalPlayback === isPlaying) return;
    externalPlayback = isPlaying;
    const activeTrack = players[activeAmbientKey];
    const wasBackgroundPlaying = !muted && (
      musicStarted ||
      !!(activeTrack && !activeTrack.paused) ||
      !!(players.wind && !players.wind.paused)
    );

    if (isPlaying) {
      ambientWasPlaying = wasBackgroundPlaying;
      players.ambient?.pause();
      players.ambientAct3?.pause();
      players.wind?.pause();
      return;
    }

    if (!ambientWasPlaying && !musicStarted && !muted) {
      startAmbient();
      return;
    }

    if (!ambientWasPlaying || muted) return;
    resumeAmbientIfNeeded();
    ambientWasPlaying = false;
  }

  function crossfadeAmbient(toKey, duration = 2200) {
    if (!players[toKey] || !players[activeAmbientKey] || toKey === activeAmbientKey) return;
    if (externalPlayback) {
      if (files[toKey] !== files[activeAmbientKey]) activeAmbientKey = toKey;
      return;
    }
    if (files[toKey] === files[activeAmbientKey]) return;
    const from = players[activeAmbientKey];
    const to = players[toKey];
    const fromTargetVol = 0;
    const toTargetVol = muted ? 0 : (baseVolumes[toKey] ?? 0.35) * masterVolume;
    to.play().catch(() => {});
    const steps = 30;
    const stepMs = duration / steps;
    let i = 0;
    const fromStartVol = from.volume;
    const interval = setInterval(() => {
      i++;
      const t = i / steps;
      from.volume = Math.max(0, fromStartVol * (1 - t));
      to.volume = Math.min(toTargetVol, toTargetVol * t);
      if (i >= steps) {
        clearInterval(interval);
        from.pause();
        activeAmbientKey = toKey;
      }
    }, stepMs);
  }

  function stopAmbient() {
    players.ambient?.pause();
    players.ambientAct3?.pause();
    players.wind?.pause();
    musicStarted = false;
    ambientWasPlaying = false;
  }

  /**
   * Duck (fade down) the currently-active ambient track while leaving the
   * soft wind bed audible underneath — used for cinematic "music stops"
   * moments (the Gift twist, the Cake wish). Call restoreAmbient() after.
   */
  let duckInterval = null;
  function duckAmbient(duration = 600, keepWind = true) {
    clearInterval(duckInterval);
    const track = players[activeAmbientKey];
    if (!keepWind) players.wind && (players.wind.volume = 0);
    if (!track) return;
    const startVol = track.volume;
    const steps = 15;
    let i = 0;
    duckInterval = setInterval(() => {
      i++;
      track.volume = Math.max(0, startVol * (1 - i / steps));
      if (i >= steps) clearInterval(duckInterval);
    }, duration / steps);
  }
  function restoreAmbient(duration = 900) {
    clearInterval(duckInterval);
    const track = players[activeAmbientKey];
    const targetVol = muted ? 0 : (baseVolumes[activeAmbientKey] ?? 0.35) * masterVolume;
    if (players.wind) {
      const windTarget = muted ? 0 : (baseVolumes.wind ?? 0.2) * masterVolume;
      players.wind.volume = windTarget;
    }
    if (!track) return;
    const steps = 15;
    let i = 0;
    duckInterval = setInterval(() => {
      i++;
      track.volume = Math.min(targetVol, targetVol * (i / steps));
      if (i >= steps) clearInterval(duckInterval);
    }, duration / steps);
  }

  function setMuted(val) {
    muted = val;
    Object.values(players).forEach(p => { if (p) p.muted = val; });
    if (!val && !externalPlayback) {
      if (!musicStarted) startAmbient();
      else {
        players[activeAmbientKey]?.play().catch(() => {});
        players.wind?.play().catch(() => {});
      }
    }
  }

  function setVolume(v) {
    masterVolume = Math.max(0, Math.min(1, v));
    Object.entries(players).forEach(([key, player]) => {
      if (player) player.volume = Math.min(1, (baseVolumes[key] ?? 1) * masterVolume);
    });
  }

  return { init, play, startAmbient, crossfadeAmbient, stopAmbient, duckAmbient, restoreAmbient, setExternalPlayback,
    playTrailerBGM, pauseTrailerBGM, resumeTrailerBGM, stopTrailerBGM,
    setMuted, setVolume, get muted() { return muted; } };
})();
