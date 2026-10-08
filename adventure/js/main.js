/**
 * MAIN.js — boot sequence:
 *   Opening screen (countdown to her birthday) → Loader → MovieTrailer →
 *   PinScreen (Chapter 1) → SceneManager (Act 2 + 3)
 * (countdown.html is the separate pre-birthday landing page that
 * redirects here once its own countdown reaches zero.)
 */
const MainApp = (() => {
  function applyTheme() {
    const theme = SITE_CONFIG.theme;
    if (!theme) return;
    const root = document.documentElement.style;
    Object.entries(theme.colors || {}).forEach(([varName, value]) => { if (value) root.setProperty(varName, value); });
    Object.entries(theme.fonts || {}).forEach(([varName, value]) => { if (value) root.setProperty(varName, value); });
  }

  function applyTextContent() {
    document.title = `Happy Birthday, ${SITE_CONFIG.friendName} 🎂✨`;
    document.querySelectorAll("[data-name]").forEach(el => { el.textContent = SITE_CONFIG.friendName; });
    document.querySelectorAll("[data-months]").forEach(el => { el.textContent = SITE_CONFIG.talkingMonths; });
    document.querySelectorAll("[data-years]").forEach(el => { el.textContent = SITE_CONFIG.yearsAcquainted; });
    document.querySelectorAll("[data-special-date]").forEach(el => { el.textContent = SITE_CONFIG.specialDate; });
    document.getElementById("hero-nicknames").textContent = SITE_CONFIG.nicknames.join("  •  ");
    const whisper = document.getElementById("final-whisper");
    if (whisper) whisper.textContent = SITE_CONFIG.finalWhisper;
  }

  function buildTimeline() {
    const track = document.getElementById("timeline-track");
    if (!track) return;
    track.innerHTML = '<div class="timeline-line" aria-hidden="true"></div>';
    SITE_CONFIG.timeline.forEach(item => {
      const el = document.createElement("div");
      el.className = "timeline-item glass-panel gsap-in";
      if (item.scratch) {
        el.innerHTML = `<span class="eyebrow">${item.year}</span><h3>${item.title}</h3>
          <p class="scratch-revealed-hint">✨ scratch to reveal the memory ✨</p>
          <div class="scratch-container" id="timeline-scratch-${item.year.replace(/\W+/g, "")}">
            <p style="margin:0;">${item.text}</p>
          </div>`;
      } else {
        el.innerHTML = `<span class="eyebrow">${item.year}</span><h3>${item.title}</h3><p>${item.text}</p>`;
      }
      track.appendChild(el);
    });

    if (typeof ScratchReveal !== "undefined") {
      track.querySelectorAll(".scratch-container").forEach(container => {
        const revealed = typeof Discoveries !== "undefined" && Discoveries.has(`scratch:${container.id}`);
        ScratchReveal.attach(container, { id: `scratch:${container.id}`, label: "✨ Scratch ✨", startRevealed: revealed });
      });
    }
  }

  function wireSoundControls() {
    const muteBtn = document.getElementById("mute-toggle");
    const volume = document.getElementById("volume-slider");
    let muted = false;
    muteBtn?.addEventListener("click", () => {
      muted = !muted;
      SoundManager.setMuted(muted);
      muteBtn.textContent = muted ? "🔇" : "🔊";
      muteBtn.setAttribute("aria-label", muted ? "Unmute sound" : "Mute sound");
    });
    volume?.addEventListener("input", (e) => SoundManager.setVolume(Number(e.target.value)));
  }

  function revealHero() {
    const hero = document.getElementById("hero");
    if (window.gsap) {
      gsap.set(hero.querySelectorAll(".gsap-in"), { opacity: 0, y: 40 });
    }
  }

  /* -------------------- boot chain -------------------- */

  function initStaticModules() {
    Discoveries.init();
    applyTheme();
    applyTextContent();
    buildTimeline();
    SoundManager.init();
    Storybook.init();
    MemoryBook.init();
    LibraryOfFuture.init();
    ChatMemories.init();
    EasterEggs.init();
    Puzzle.init();
    GiftBox.init();
    GreetingCard.init();
    Cake.init();
    Celebration.init();
    MoonMessage.init();
    MovieCredits.init();
    SecretEnding.init();
    FriendshipLetter.init();
    MusicPlayer.init();
    PinScreen.init();
    FairyCompanion.init();
    LivingWorld.init();
    wireActMusicCrossfade();
    wireHeroEmphasis();
    wireCurtain();
    wireSoundControls();
    Background3D.init();
    SkyGradient.init();
    CustomCursor.init();
    revealHero();
  }

  function wireActMusicCrossfade() {
    window.addEventListener("scenechange", (e) => {
      const trackKey = SITE_CONFIG.music?.[e.detail.id] || "ambient";
      SoundManager.crossfadeAmbient(trackKey);
    });
  }

  function wireHeroEmphasis() {
    let played = false;
    window.addEventListener("scenechange", (e) => {
      if (e.detail.id !== "hero" || played || !window.gsap) return;
      played = true;
      const h1 = document.querySelector("#hero h1");
      if (!h1) return;
      gsap.fromTo(h1, { textShadow: "0 0 0px rgba(240,200,110,0)" },
        { textShadow: "0 0 44px rgba(240,200,110,0.65)", duration: 1.4, ease: "power2.out",
          delay: 0.6, yoyo: true, repeat: 1 });
    });
  }

  function wireCurtain() {
    const curtain = document.getElementById("curtain");
    if (!curtain) return;
    const open = () => {
      if (curtain.classList.contains("is-open")) return;
      curtain.classList.add("is-open");
      SoundManager.play("pageFlip");
      setTimeout(() => { curtain.style.display = "none"; }, 1150);
    };
    curtain.addEventListener("click", open);
    curtain.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
  }

  function onTrailerFinished() {
    PinScreen.show();
  }

  function onPinUnlocked() {
    SoundManager.stopTrailerBGM();
    SceneManager.init("hero");
  }

  function boot() {
    document.addEventListener("DOMContentLoaded", () => {
      initStaticModules();
      OpeningScreen.init(() => Loader.run(() => MovieTrailer.play()));
    });
  }

  return { boot, onTrailerFinished, onPinUnlocked };
})();

MainApp.boot();
