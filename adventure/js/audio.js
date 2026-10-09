/**
 * AUDIO.js — central sound manager
 * All sound files are placeholders in /assets/audio/. Swap freely —
 * filenames must stay the same, or update the paths below.
 * Uses the WebAudio API with graceful fallback (no crash if files are missing).
 */

const SoundManager = (() => {
  const files = {
    ambient: "assets/audio/Our%20Cycle%20-%20Flute%20_%20Instrumental.mp3",
    ambientAct3: "assets/audio/Our%20Cycle%20-%20Flute%20_%20Instrumental.mp3",
    // "Heartbeat 5sec Int.wav" by Benboncan, CC BY 4.0: https://freesound.org/people/Benboncan/sounds/108207
    heartbeat: "assets/audio/heartbeat.mp3",
    trailerBGM: "assets/audio/trailer-bgm.wav",
    pageFlip: "assets/audio/page-flip.wav",
    sparkle: "assets/audio/sparkle.wav",
    giftOpen: "assets/audio/gift-open.wav",
    puzzleComplete: "assets/audio/puzzle-complete.wav",
    fireworks: "assets/audio/fireworks.wav",
    chime: "assets/audio/chime.wav"
  };

  const players = {};
  const baseVolumes = {};
  let muted = false;
  let masterVolume = 0.5;
  let musicStarted = false;
  let autoplayRecoveryBound = false;

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
    safeLoad("heartbeat", files.heartbeat, { volume: 0.75 });
    safeLoad("trailerBGM", files.trailerBGM, { loop: true, volume: 0.55 });
    safeLoad("pageFlip", files.pageFlip, { volume: 0.6 });
    safeLoad("sparkle", files.sparkle, { volume: 0.5 });
    safeLoad("giftOpen", files.giftOpen, { volume: 0.7 });
    safeLoad("puzzleComplete", files.puzzleComplete, { volume: 0.7 });
    safeLoad("fireworks", files.fireworks, { volume: 0.7 });
    safeLoad("chime", files.chime, { volume: 0.5 });
    registerAutoplayRecovery();
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
    if (muted || externalPlayback) return;
    musicStarted = true;
    const activeTrack = players[activeAmbientKey];
    if (activeTrack && activeTrack.paused) activeTrack.play().catch(() => {});
  }

  function resumeAmbientIfNeeded() {
    if (muted || externalPlayback) return;
    musicStarted = true;
    const activeTrack = players[activeAmbientKey];
    if (activeTrack && activeTrack.paused) activeTrack.play().catch(() => {});
  }

  function registerAutoplayRecovery() {
    if (autoplayRecoveryBound || !document) return;
    autoplayRecoveryBound = true;
    const onUserInteraction = () => {
      if (muted || externalPlayback) return;
      if (musicStarted) resumeAmbientIfNeeded();
    };
    ["pointerdown", "touchstart", "keydown", "click"].forEach(eventName => {
      document.addEventListener(eventName, onUserInteraction, { passive: true });
    });
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
      !!(activeTrack && !activeTrack.paused)
    );

    if (isPlaying) {
      ambientWasPlaying = wasBackgroundPlaying;
      players.ambient?.pause();
      players.ambientAct3?.pause();
      return;
    }

    if (muted) return;
    if (!ambientWasPlaying && !musicStarted) {
      startAmbient();
      return;
    }

    if (!ambientWasPlaying) return;
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
    musicStarted = false;
    ambientWasPlaying = false;
  }

  /**
   * Duck (fade down) the currently-active ambient track for cinematic
   * "music stops" moments (the Gift twist, the Cake wish).
   * Call restoreAmbient() after.
   */
  let duckInterval = null;
  function duckAmbient(duration = 600) {
    clearInterval(duckInterval);
    const track = players[activeAmbientKey];
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
