/**
 * SCENEMANAGER.js — fullscreen cinematic scene navigation
 * (replaces scrolling entirely: Next/Prev, keyboard, swipe, and the
 * scene-dot rail all move between full-viewport .scene elements.)
 */
const SceneManager = (() => {
  // Order matters — this is the story's Act 2 + Act 3 sequence.
  const scenes = [
    { id: "hero",         title: "The Fairy Kingdom",              n: 2 },
    { id: "storybook",    title: "The Story Book",                 n: 3 },
    { id: "memorybook",   title: "The Book Of Memories",           n: 4 },
    { id: "libraryoffuture", title: "The Library Of Future",       n: 5 },
    { id: "timeline",     title: "Our Timeline",                   n: 6 },
    { id: "chat",         title: "Chat Memories",                  n: 7 },
    { id: "puzzle",       title: "Unlock The Secret Puzzle",       n: 8 },
    { id: "gift",         title: "The Birthday Gift",              n: 9 },
    { id: "greeting",     title: "A Greeting Card",                n: 10 },
    { id: "cake",         title: "Make A Birthday Wish",           n: 11 },
    { id: "celebration",  title: "The Grand Celebration",          n: 12 },
    { id: "music",        title: "The Spotify Room",               n: 13 },
    { id: "credits",      title: "Credits",                        n: 14 },
    { id: "secretending", title: "Until We Meet Someday",          n: 15 }
  ];
  // Automatic per-scene cycling only uses push/fly (opacity+transform based).
  // portal/door use clip-path, which blocks hit-testing during the ~0.9s
  // animation — fine for a deliberate, JS-triggered moment (Gift/Puzzle
  // already wait before the user can interact again), but risky as a
  // default for every scene arrival, where a fast click could silently
  // land on nothing.
  const transitionCycle = ["push", "fly"];
  let currentIndex = -1;
  let dotEls = [];

  function byId(id) { return scenes.find(s => s.id === id); }

  function buildDots() {
    const rail = document.getElementById("chapter-rail");
    if (!rail) return;
    rail.innerHTML = "";
    scenes.forEach(s => {
      const btn = document.createElement("button");
      btn.dataset.target = s.id;
      btn.setAttribute("aria-label", "Go to " + s.title);
      btn.addEventListener("click", () => goTo(s.id));
      rail.appendChild(btn);
    });
    dotEls = [...rail.querySelectorAll("button")];
  }

  function updateDots() {
    dotEls.forEach(d => d.classList.toggle("is-active", d.dataset.target === scenes[currentIndex].id));
  }

  function updateNavButtons() {
    const nextBtn = document.getElementById("scene-next");
    const prevBtn = document.getElementById("scene-prev");
    const hint = document.querySelector(".scene-nav-hint");
    const isLast = currentIndex === scenes.length - 1;
    const isFirst = currentIndex === 0;
    if (nextBtn) {
      nextBtn.hidden = isLast;
      nextBtn.disabled = isLast;
    }
    if (prevBtn) prevBtn.hidden = isFirst;
    if (hint) hint.hidden = isLast;
  }

  function flashChapterCard(scene) {
    const layer = document.getElementById("chapter-card");
    const numberEl = document.getElementById("chapter-card-number");
    const titleEl = document.getElementById("chapter-card-title");
    if (!layer) return;
    numberEl.textContent = "Chapter " + scene.n;
    titleEl.textContent = scene.title;
    layer.classList.add("is-visible");
    if (window.gsap) {
      gsap.fromTo(layer, { opacity: 0 }, {
        opacity: 1, duration: 0.4, ease: "power2.out",
        onComplete: () => gsap.to(layer, { opacity: 0, duration: 0.5, delay: 0.9,
          onComplete: () => layer.classList.remove("is-visible") })
      });
    } else {
      setTimeout(() => layer.classList.remove("is-visible"), 1400);
    }
  }

  function revealContent(el) {
    if (!window.gsap) return;
    const targets = el.querySelectorAll(".gsap-in, .gsap-reveal, h2, .eyebrow");
    gsap.fromTo(targets, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.06, ease: "power2.out", delay: 0.15 });
  }

  function goTo(id, opts = {}) {
    if (locked && !opts.force) return;
    const nextScene = byId(id);
    if (!nextScene) return;
    const nextIndex = scenes.indexOf(nextScene);
    const prevEl = currentIndex >= 0 ? document.getElementById(scenes[currentIndex].id) : null;
    const nextEl = document.getElementById(id);
    if (!nextEl) return;

    const transitionType = opts.transition || transitionCycle[nextIndex % transitionCycle.length];

    if (prevEl) {
      prevEl.classList.remove("is-active", "is-entering-push", "is-entering-portal", "is-entering-fly");
    }
    nextEl.classList.add("is-active", `is-entering-${transitionType}`);
    currentIndex = nextIndex;
    updateDots();
    updateNavButtons();
    flashChapterCard(nextScene);
    revealContent(nextEl);
    if (typeof FairyCompanion !== "undefined") FairyCompanion.setScene(id);
    if (typeof SkyGradient !== "undefined") SkyGradient.setProgress(currentIndex / (scenes.length - 1));
    window.dispatchEvent(new CustomEvent("scenechange", { detail: { id } }));
  }

  let locked = false;
  function lock() {
    locked = true;
    document.querySelector(".scene-nav")?.classList.add("is-locked");
    document.getElementById("chapter-rail")?.classList.add("is-locked");
  }
  function unlock() {
    locked = false;
    document.querySelector(".scene-nav")?.classList.remove("is-locked");
    document.getElementById("chapter-rail")?.classList.remove("is-locked");
  }

  function next() {
    if (locked) return;
    if (currentIndex < scenes.length - 1) goTo(scenes[currentIndex + 1].id);
  }
  function prev() {
    if (locked) return;
    if (currentIndex > 0) goTo(scenes[currentIndex - 1].id);
  }

  function wireControls() {
    document.getElementById("scene-next")?.addEventListener("click", next);
    document.getElementById("scene-prev")?.addEventListener("click", prev);

    document.addEventListener("keydown", (e) => {
      const pinScreen = document.getElementById("pin-screen");
      if (pinScreen && getComputedStyle(pinScreen).display !== "none") return; // don't steal keys from PIN entry
      if (locked) return;
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft") prev();
    });

    let touchStartX = null;
    document.addEventListener("touchstart", (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    document.addEventListener("touchend", (e) => {
      if (locked || touchStartX === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 60) { dx < 0 ? next() : prev(); }
      touchStartX = null;
    }, { passive: true });

    // Wheel/trackpad scroll — one gesture = one scene change, with a cooldown
    // so a single scroll swipe doesn't fly through multiple scenes at once.
    // If the active scene's own content is tall enough to scroll internally,
    // that takes priority — scenes only change once you hit the edge.
    let wheelCooldown = false;
    document.addEventListener("wheel", (e) => {
      if (locked || wheelCooldown) return;
      const pinScreen = document.getElementById("pin-screen");
      if (pinScreen && getComputedStyle(pinScreen).display !== "none") return;
      if (Math.abs(e.deltaY) < 12) return; // ignore tiny/inertial trailing scroll noise

      const activeScene = document.querySelector(".scene.is-active");
      if (activeScene && activeScene.scrollHeight > activeScene.clientHeight + 4) {
        const atTop = activeScene.scrollTop <= 0;
        const atBottom = activeScene.scrollTop + activeScene.clientHeight >= activeScene.scrollHeight - 4;
        if (e.deltaY > 0 && !atBottom) return; // let it scroll down within the scene first
        if (e.deltaY < 0 && !atTop) return;    // let it scroll up within the scene first
      }

      e.deltaY > 0 ? next() : prev();
      wheelCooldown = true;
      setTimeout(() => { wheelCooldown = false; }, 900);
    }, { passive: true });
  }

  function init(startId) {
    buildDots();
    wireControls();
    goTo(startId || scenes[0].id, { transition: "push" });
  }

  return { init, goTo, next, prev, scenes, lock, unlock };
})();
