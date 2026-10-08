/**
 * SCENES.js — logic for each interactive chapter
 */

/* ==================== STORYBOOK (typewriter pages) ==================== */
const Storybook = (() => {
  const pages = [
    `For three whole years, our paths kept crossing without ever really meeting — same world, different orbits.`,
    `We knew OF each other. Familiar face, familiar name. Never once did we actually talk.`,
    `Then, on one completely ordinary February day... that changed. Nobody saw it coming — least of all us.`,
    `What started as a random hello turned into Ten months of absolute chaos — chats that never seemed to end.`,
    `Somewhere between the reels, the gossip, and the 1am voice notes, "friend" stopped being enough of a word.`,
    `They became Makku and Thayir Saatham — nicknames earned in record time, pure ridiculous love.`,
    `Plot twist: it only took Ten months to feel like a lifetime. And on this page, that story is still being written.`
  ];
  let current = 0, typing = null;
  const twistPageIndex = 2; // the "then, on one ordinary February day..." reveal

  // Reveals text one character at a time via setInterval — used for the
  // storybook's typewriter effect. `done` fires once the full string is shown.
  function typeText(text, el, done) {
    el.textContent = "";
    let i = 0;
    clearInterval(typing);
    typing = setInterval(() => {
      el.textContent += text[i];
      i++;
      if (i >= text.length) { clearInterval(typing); done && done(); }
    }, 22);
  }

  // The gold screen-flash + confetti burst that fires the moment the
  // page-turn lands on the "twist" page (see twistPageIndex below).
  function flashTwist() {
    const flash = document.getElementById("story-flash");
    if (!flash) return;
    SoundManager.play("chime");
    Celebration.burst("story");
    if (window.gsap) {
      gsap.fromTo(flash, { opacity: 0.9 }, { opacity: 0, duration: 0.9, ease: "power2.out" });
    } else {
      flash.style.opacity = 0.9;
      flash.style.transition = "opacity 0.9s ease-out";
      requestAnimationFrame(() => { flash.style.opacity = 0; });
    }
  }

  function render() {
    const pageEl = document.getElementById("book-page-text");
    const indicator = document.getElementById("page-indicator");
    indicator.textContent = `Page ${current + 1} of ${pages.length}`;
    typeText(pages[current], pageEl);
    SoundManager.play("pageFlip");
  }

  function turnTo(newIndex) {
    const pageEl = document.getElementById("book-page-text");
    const indicator = document.getElementById("page-indicator");
    pageEl.classList.add("is-turning");
    SoundManager.play("pageFlip");
    // Swap the text at the flip's midpoint (page is edge-on to the viewer)
    setTimeout(() => {
      current = newIndex;
      indicator.textContent = `Page ${current + 1} of ${pages.length}`;
      typeText(pages[current], pageEl);
      if (current === twistPageIndex) flashTwist();
    }, 340);
    setTimeout(() => pageEl.classList.remove("is-turning"), 720);
  }

  function next() { if (current < pages.length - 1) turnTo(current + 1); }
  function prev() { if (current > 0) turnTo(current - 1); }

  function init() {
    document.getElementById("book-next")?.addEventListener("click", next);
    document.getElementById("book-prev")?.addEventListener("click", prev);
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) { render(); observer.disconnect(); } });
    }, { threshold: 0.4 });
    const book = document.getElementById("storybook");
    if (book) observer.observe(book);
  }
  return { init };
})();

/* ==================== EASTER EGGS ==================== */
const EasterEggs = (() => {
  let found = new Set();
  const eggs = [
    { emoji: "⭐", msg: "Makku detected 😂" },
    { emoji: "☁️", msg: "Thayir Saatham unlocked 🍚" },
    { emoji: "🌸", msg: "✨ sparkle magic ✨" },
    { emoji: "🏰", msg: "You found the hidden room in the castle!" },
    { emoji: "🌙", msg: SITE_CONFIG.secretQuote },
    { emoji: "🦋", msg: "A butterfly remembers: three years of almost, and it still found you." }
  ];

  // Positions are randomized (within a safe grid) on every visit — no two
  // playthroughs look the same, and eggs never overlap.
  function randomizedPositions(count) {
    const cols = 3, rows = Math.ceil(count / cols);
    const cellW = 100 / cols, cellH = 100 / rows;
    const cells = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells.push({ r, c });
    for (let i = cells.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cells[i], cells[j]] = [cells[j], cells[i]];
    }
    return cells.slice(0, count).map(({ r, c }) => ({
      x: `${c * cellW + 8 + Math.random() * (cellW - 24)}%`,
      y: `${r * cellH + 6 + Math.random() * (cellH - 24)}%`
    }));
  }

  function render() {
    const field = document.getElementById("egg-field");
    if (!field) return;
    const positions = randomizedPositions(eggs.length);
    eggs.forEach((egg, i) => {
      const btn = document.createElement("button");
      btn.className = "egg-item is-floating-slow";
      btn.style.left = positions[i].x;
      btn.style.top = positions[i].y;
      btn.style.animationDelay = (i * 0.35) + "s";
      btn.setAttribute("aria-label", "Hidden surprise");
      btn.textContent = egg.emoji;
      if (typeof Discoveries !== "undefined" && Discoveries.has(`egg:${i}`)) {
        btn.classList.add("is-found");
        btn.disabled = true;
        found.add(i);
      }
      btn.addEventListener("click", () => reveal(i, btn));
      field.appendChild(btn);
    });
    updateCounter();
  }

  function reveal(i, btn) {
    if (btn.disabled) return;
    const toast = document.getElementById("egg-toast");
    SoundManager.play("sparkle");
    Celebration.burst(btn);
    btn.classList.add("is-found");
    btn.disabled = true;
    found.add(i);
    updateCounter();
    window.dispatchEvent(new CustomEvent("discoveryfound", { detail: { id: `egg:${i}` } }));

    if (window.gsap) {
      gsap.to(toast, {
        opacity: 0, y: -6, duration: 0.15, onComplete: () => {
          toast.textContent = eggs[i].msg;
          gsap.fromTo(toast, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" });
        }
      });
    } else {
      toast.textContent = eggs[i].msg;
    }

    if (found.size === eggs.length) {
      setTimeout(() => {
        toast.textContent = "🏆 All secrets found — Best Friend Award unlocked!";
        Celebration.burst("egg-field");
        SoundManager.play("puzzleComplete");
      }, 500);
    }
  }

  function updateCounter() {
    const counter = document.getElementById("egg-counter");
    if (counter) counter.textContent = `${found.size} / ${eggs.length} secrets found`;
  }

  function init() { render(); }
  return { init };
})();

/* ==================== PUZZLE (3x3 sliding puzzle) ==================== */
const Puzzle = (() => {
  const size = 3;
  let tiles = [], blankIndex = size * size - 1;

  // Shuffles by performing valid random slides from the solved state —
  // guarantees the puzzle is always solvable (unlike a fully random shuffle).
  function shuffle() {
    tiles = [...Array(size * size).keys()];
    // Perform valid random slide moves so it's always solvable
    let bi = blankIndex;
    for (let i = 0; i < 150; i++) {
      const neighbors = getNeighbors(bi);
      const swapWith = neighbors[Math.floor(Math.random() * neighbors.length)];
      [tiles[bi], tiles[swapWith]] = [tiles[swapWith], tiles[bi]];
      bi = swapWith;
    }
    blankIndex = bi;
  }

  // Returns the tile indices adjacent to index i (up/down/left/right) — the tiles the blank can legally swap with.
  function getNeighbors(i) {
    const row = Math.floor(i / size), col = i % size;
    const result = [];
    if (row > 0) result.push(i - size);
    if (row < size - 1) result.push(i + size);
    if (col > 0) result.push(i - 1);
    if (col < size - 1) result.push(i + 1);
    return result;
  }

  function render() {
    const grid = document.getElementById("puzzle-grid");
    if (!grid) return;
    grid.innerHTML = "";
    tiles.forEach((val, i) => {
      const btn = document.createElement("button");
      if (val === size * size - 1) {
        btn.className = "puzzle-tile is-blank";
        btn.setAttribute("aria-label", "empty");
      } else {
        btn.className = "puzzle-tile";
        const row = Math.floor(val / size), col = val % size;
        btn.style.backgroundImage = "url('assets/images/puzzle-source.jpeg')";
        btn.style.backgroundPosition = `-${col * 86}px -${row * 86}px`;
        btn.setAttribute("aria-label", `puzzle piece ${val + 1}`);
      }
      btn.addEventListener("click", () => tryMove(i));
      grid.appendChild(btn);
    });
  }

  function tryMove(i) {
    if (getNeighbors(blankIndex).includes(i)) {
      [tiles[i], tiles[blankIndex]] = [tiles[blankIndex], tiles[i]];
      blankIndex = i;
      render();
      checkWin();
    }
  }

  function checkWin() {
    const solved = tiles.every((v, i) => v === i);
    const status = document.getElementById("puzzle-status");
    if (solved) {
      status.textContent = "✨ You unlocked today's surprise! ✨";
      SoundManager.play("puzzleComplete");
      Celebration.burst("puzzle-status");
      setTimeout(() => {
        status.textContent = "Plot twist: the real puzzle was the friendship we solved along the way. 😂";
      }, 2200);
      setTimeout(() => {
        if (typeof SceneManager !== "undefined") SceneManager.goTo("gift", { transition: "portal" });
      }, 4200);
    }
  }

  function init() {
    shuffle();
    render();
  }
  return { init };
})();

/* ==================== GIFT BOX (with a fake-out twist) ==================== */
const GiftBox = (() => {
  let busy = false;

  // Rapid on/off toggle of the dim overlay — the "lights flickering" beat in the gift twist.
  function flicker(times = 3) {
    const dim = document.getElementById("cinematic-dim");
    if (!dim) return Promise.resolve();
    return new Promise((resolve) => {
      let i = 0;
      const tick = () => {
        dim.classList.toggle("is-visible", i % 2 === 0);
        i++;
        if (i < times * 2) setTimeout(tick, 110);
        else resolve();
      };
      tick();
    });
  }

  // Quick side-to-side jitter (GSAP if available, CSS keyframe fallback otherwise).
  function shake(box) {
    if (window.gsap) {
      return new Promise((resolve) => {
        gsap.fromTo(box, { x: 0 }, { x: 8, duration: 0.06, repeat: 7, yoyo: true, ease: "power1.inOut",
          onComplete: () => { gsap.set(box, { x: 0 }); resolve(); } });
      });
    }
    box.style.animation = "shakeBox 0.5s ease";
    return new Promise((resolve) => setTimeout(() => { box.style.animation = ""; resolve(); }, 500));
  }

  function wait(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

  async function playFakeBrokenGiftTwist(box, hint) {
    const dim = document.getElementById("cinematic-dim");
    const twist = SITE_CONFIG.giftTwist;

    SceneManager.lock();
    box.classList.add("is-cracking");
    await shake(box);
    hint.textContent = "Wait... something's wrong.";
    dim.classList.add("is-visible");
    SoundManager.duckAmbient();
    await flicker(3);
    dim.classList.add("is-visible"); // stay dark
    await wait(300);

    await FairyCompanion.sayTemporary(twist.shockLine, "The gift... it's cracking?!", 1300);

    for (const line of twist.failLines) {
      await FairyCompanion.sayTemporary("🪄🧚", line, 950);
      await flicker(1);
    }

    // The big spell — golden healing light.
    SoundManager.play("sparkle");
    box.classList.add("is-healing");
    await FairyCompanion.sayTemporary(twist.successLine, "Got it!", 1200);
    dim.classList.remove("is-visible");
    box.classList.remove("is-cracking");
    box.classList.add("is-luxurious");
    hint.textContent = "The gift glows brighter than before... ✨";
    SoundManager.restoreAmbient();
    SceneManager.unlock();
    await wait(700);
    box.classList.remove("is-healing");

    open(box, hint);
  }

  function open(box, hint) {
    box.classList.add("is-open");
    SoundManager.play("giftOpen");
    hint.textContent = "The box dissolves into a portal of stars and clouds... ✨";
    Celebration.burst(box);
    // The gift literally transforms into a portal to the next scene.
    setTimeout(() => { if (typeof SceneManager !== "undefined") SceneManager.goTo("greeting", { transition: "portal" }); }, 1600);
  }

  function init() {
    const box = document.getElementById("gift-box");
    const hint = document.getElementById("gift-hint");
    if (!box) return;

    const handle = () => {
      if (busy || box.classList.contains("is-open")) return;
      busy = true;
      playFakeBrokenGiftTwist(box, hint);
    };
    box.addEventListener("click", handle);
    box.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handle(); }
    });
  }
  return { init };
})();


/* ==================== CAKE + MIC BLOW DETECTION ==================== */
const Cake = (() => {
  let audioCtx, analyser, micStream, rafId, blownOut = false;
  const THRESHOLD = 32; // tune sensitivity here

  async function startListening() {
    const statusEl = document.getElementById("mic-status");
    const levelFill = document.getElementById("mic-level-fill");
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(micStream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      statusEl.textContent = "Go ahead — blow into your mic to blow out the candles 🎂";
      monitor(levelFill, statusEl);
    } catch (err) {
      statusEl.textContent = "Mic access unavailable — tap the candles to blow them out instead.";
      document.getElementById("cake-tap-fallback").hidden = false;
    }
  }

  // Polls the mic's frequency data each frame; once average volume crosses
  // THRESHOLD, treats it as a "blow" and triggers blowOutCandles().
  function monitor(levelFill, statusEl) {
    const data = new Uint8Array(analyser.frequencyBinCount);
    function loop() {
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((a, b) => a + b, 0) / data.length;
      levelFill.style.width = Math.min(100, avg * 2) + "%";
      if (avg > THRESHOLD && !blownOut) {
        blowOutCandles();
        return;
      }
      rafId = requestAnimationFrame(loop);
    }
    loop();
  }

  function wait(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

  async function playWishConstellation() {
    const dim = document.getElementById("cinematic-dim");
    const statusEl = document.getElementById("mic-status");
    const countdown = document.getElementById("wish-countdown");
    const canvas = document.getElementById("wish-canvas");
    const cfg = SITE_CONFIG.wishConstellation;

    SceneManager.lock();
    dim.classList.add("is-visible");
    SoundManager.duckAmbient(700, true); // ambient fades, soft wind stays

    await FairyCompanion.sayTemporary("🧚💭", cfg.fairyPrompt, 2200);
    statusEl.textContent = cfg.fairyPrompt;

    // Silent 5-second countdown — five tiny stars light up one at a time, no numbers.
    countdown.hidden = false;
    const stars = [...countdown.querySelectorAll(".wish-star")];
    for (const star of stars) {
      star.classList.add("is-lit");
      await wait(1000);
    }
    countdown.hidden = true;

    // Stars gather into the constellation.
    if (typeof StarText !== "undefined" && canvas) {
      canvas.hidden = false;
      const controller = StarText.create(canvas, "#F0C86E");
      controller.showText(cfg.constellationText);
      SoundManager.play("chime");
      await wait(3800);
      controller.dissolve();
      await wait(1800);
      controller.destroy();
      canvas.hidden = true;
    }

    dim.classList.remove("is-visible");
    SoundManager.restoreAmbient();
    SceneManager.unlock();
    if (typeof FairyCompanion !== "undefined") FairyCompanion.settle();
    statusEl.textContent = "🎉 Wish made. Let's celebrate!";
  }

  function blowOutCandles() {
    blownOut = true;
    cancelAnimationFrame(rafId);
    document.querySelectorAll(".flame").forEach(f => f.style.opacity = "0");
    document.getElementById("mic-status").textContent = "🎉 Candles out — make a wish!";
    SoundManager.play("sparkle");
    Celebration.burst("cake");
    if (micStream) micStream.getTracks().forEach(t => t.stop());
    if (audioCtx) audioCtx.close();
    setTimeout(() => playWishConstellation(), 1200);
  }

  function initFallbackTap() {
    document.getElementById("cake-tap-fallback")?.addEventListener("click", () => {
      if (!blownOut) blowOutCandles();
    });
  }

  function init() {
    initFallbackTap();
    const btn = document.getElementById("mic-enable-btn");
    btn?.addEventListener("click", () => {
      btn.hidden = true;
      startListening();
    });
  }
  return { init };
})();

/* ==================== CELEBRATION (confetti + fireworks canvas) ==================== */
const Celebration = (() => {
  let canvas, ctx, particles = [];
  const colors = ["#F0C86E", "#8FD3FE", "#F5B8CE", "#C9B6E4", "#FFFFFF"];

  // Lazily grabs/sizes the shared celebration canvas — called before any burst.
  function ensureCanvas() {
    canvas = document.getElementById("celebration-canvas");
    if (!canvas) return null;
    ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    return ctx;
  }

  function burst(origin) {
    if (!ensureCanvas()) return;
    const originEl = typeof origin === "string" ? document.getElementById(origin) : origin;
    const rect = originEl ? originEl.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2 };
    const x = rect.left + (rect.width || 0) / 2;
    const y = rect.top + (rect.height || 0) / 2;

    for (let i = 0; i < 90; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 60 + Math.random() * 30,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 5 + 2
      });
    }
    if (!running) run();
  }

  function grandFinale() {
    SoundManager.play("fireworks");
    if (!ensureCanvas()) return;
    for (let i = 0; i < 9; i++) {
      setTimeout(() => {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight * 0.55;
        for (let j = 0; j < 160; j++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 9 + 3;
          particles.push({
            x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
            life: 80 + Math.random() * 50, color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 6 + 2
          });
        }
        flashScreen();
        if (i % 3 === 0) SoundManager.play("fireworks"); // re-trigger the boom on some bursts, not just once at the start
        if (!running) run(); // each deferred burst must (re-)start the loop — it may have already exited
      }, i * 300);
    }
  }

  /** A quick bright pulse behind the fireworks — sells the "boom" moment beyond just particles. */
  function flashScreen() {
    const dim = document.getElementById("cinematic-dim");
    if (!dim) return;
    const prevBg = dim.style.background;
    dim.style.transition = "none";
    dim.style.background = "radial-gradient(circle, rgba(255,240,200,0.35), transparent 70%)";
    dim.classList.add("is-visible");
    requestAnimationFrame(() => {
      dim.style.transition = "opacity 0.5s ease";
      setTimeout(() => {
        dim.classList.remove("is-visible");
        setTimeout(() => { dim.style.background = prevBg; dim.style.transition = ""; }, 500);
      }, 90);
    });
  }

  let running = false;
  // The particle animation loop — self-terminates once all particles have
  // died out (running = false), and gets restarted by the next burst.
  function run() {
    running = true;
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life--;
      ctx.globalAlpha = Math.max(p.life / 90, 0);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    particles = particles.filter(p => p.life > 0);
    if (particles.length > 0) {
      requestAnimationFrame(run);
    } else {
      running = false;
    }
  }

  function init() {
    ensureCanvas();
    window.addEventListener("resize", () => {
      if (canvas) { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    });
  }
  return { init, burst, grandFinale };
})();

/* ==================== MOON MESSAGE (Celebration follow-up) ==================== */
const MoonMessage = (() => {
  function wait(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

  async function play() {
    const moonGlow = document.getElementById("moon-glow");
    const canvas = document.getElementById("moon-canvas");
    if (!moonGlow || !canvas) return;
    const cfg = SITE_CONFIG.moonMessage;

    if (typeof Background3D !== "undefined") {
      Background3D.enableDirector();
      Background3D.CameraDirector.crane(7, 2.6); // camera pans upward toward the moon
    }
    moonGlow.classList.add("is-visible");
    SoundManager.play("chime");
    await wait(1400);

    if (typeof StarText !== "undefined") {
      canvas.hidden = false;
      const controller = StarText.create(canvas, "#FFF3D6");
      controller.showText(fillName(cfg.text));
      await wait(3600);
      controller.dissolve();
      await wait(1800);
      controller.destroy();
      canvas.hidden = true;
    }
    moonGlow.classList.remove("is-visible");
    if (typeof Background3D !== "undefined") Background3D.disableDirector();
  }

  function init() {
    let played = false;
    window.addEventListener("scenechange", async (e) => {
      if (e.detail.id !== "celebration" || played) return;
      played = true;
      Celebration.grandFinale(); // the fireworks finale — previously defined but never triggered anywhere
      await wait(3200);
      play();
    });
  }
  return { init };
})();

/* ==================== CHAT MEMORIES (fake phone chat UI) ==================== */
const ChatMemories = (() => {
  function render() {
    const thread = document.getElementById("chat-thread");
    if (!thread) return;
    SITE_CONFIG.chatMemories.forEach((msg, i) => {
      const bubble = document.createElement("div");
      bubble.className = `chat-bubble chat-bubble--${msg.from === "me" ? "sent" : "received"} gsap-reveal`;
      bubble.style.transitionDelay = (i * 0.08) + "s";
      bubble.textContent = msg.text;
      thread.appendChild(bubble);
    });
  }
  function init() { render(); }
  return { init };
})();

/* ==================== MOVIE CREDITS (auto-scrolling reel) ==================== */
const MovieCredits = (() => {
  function render() {
    const reel = document.getElementById("credits-reel");
    if (!reel) return;
    SITE_CONFIG.credits.forEach(c => {
      const block = document.createElement("div");
      block.className = "credit-block";
      block.innerHTML = c.role
        ? `<p class="credit-role">${c.role}</p><p class="credit-name">${fillName(c.name)}</p>`
        : `<p class="credit-name credit-name--solo">${fillName(c.name)}</p>`;
      reel.appendChild(block);
    });
  }
  function init() { render(); }
  return { init };
})();

/* ==================== SECRET ENDING (stars form text + finale sequence) ==================== */
const SecretEnding = (() => {
  // "The End?" is no longer the opening line here — the Fake Ending beat
  // (full black + silence) now establishes that feeling visually, so the
  // text sequence picks up right after the Fairy Returns twist.
  const sequenceLines = [
    "No...",
    "📖 Reserved for Future Memories.",
    "🧚 collects everything we made together..."
  ];

  function wait(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

  /** Fake Ending: fade to black, true silence, long enough she thinks it's over. */
  async function fakeEnding() {
    const dim = document.getElementById("cinematic-dim");
    SceneManager.lock();
    if (window.gsap) {
      await new Promise((resolve) => {
        gsap.to(dim, { opacity: 1, duration: 1.6, ease: "power2.inOut", onStart: () => dim.classList.add("is-visible"), onComplete: resolve });
      });
    } else {
      dim.classList.add("is-visible");
    }
    SoundManager.duckAmbient(900, false); // false = kill the wind bed too, true silence
    await wait(3200); // the hold — long enough to believe it's actually over
  }

  /** Fairy Returns: breaks back into the world with a line, then the screen "cracks" back to life. */
  async function fairyReturns() {
    const fairy = document.getElementById("trailer-freeze-fairy");
    const line = document.getElementById("trailer-freeze-line");
    const dim = document.getElementById("cinematic-dim");
    const flash = document.getElementById("story-flash"); // reused gold flash element

    if (window.gsap) {
      const tl = gsap.timeline();
      tl.set(fairy, { opacity: 1, x: "-140vw", textContent: "🧚" })
        .to(fairy, { x: "0vw", duration: 0.6, ease: "power2.out" })
        .to(line, { opacity: 1, duration: 0.3 }, "-=0.1")
        .call(() => { line.textContent = SITE_CONFIG.fakeEndingBeat.fairyReturnsLine; })
        .to({}, { duration: 1.6 })
        .to(line, { opacity: 0, duration: 0.3 });
      await new Promise((resolve) => { tl.eventCallback("onComplete", resolve); });
    } else {
      fairy.style.opacity = "1";
      line.style.opacity = "1";
      line.textContent = SITE_CONFIG.fakeEndingBeat.fairyReturnsLine;
      await wait(2200);
      line.style.opacity = "0";
    }

    // The screen "breaks" back into the hidden world — a gold flash standing in for a shatter effect.
    SoundManager.play("sparkle");
    if (flash && window.gsap) {
      gsap.fromTo(flash, { opacity: 0.9 }, { opacity: 0, duration: 0.8, ease: "power2.out" });
    }
    dim.classList.remove("is-visible");
    SoundManager.restoreAmbient(600);
    await wait(400);
    if (window.gsap) await new Promise((resolve) => gsap.to(fairy, { opacity: 0, duration: 0.5, onComplete: resolve }));
    else fairy.style.opacity = "0";
    SceneManager.unlock();
  }

  function playTextSequence() {
    return new Promise((resolve) => {
      const el = document.getElementById("secret-sequence-line");
      if (!el) { resolve(); return; }
      let i = 0;
      el.style.opacity = 1;
      el.textContent = sequenceLines[0];
      const advance = () => {
        i++;
        if (i >= sequenceLines.length) {
          if (window.gsap) gsap.to(el, { opacity: 0, duration: 0.8, onComplete: resolve });
          else { el.style.opacity = 0; resolve(); }
          return;
        }
        if (window.gsap) {
          gsap.to(el, { opacity: 0, duration: 0.35, onComplete: () => {
            el.textContent = sequenceLines[i];
            gsap.to(el, { opacity: 1, duration: 0.35 });
            setTimeout(advance, 1500);
          }});
        } else {
          el.textContent = sequenceLines[i];
          setTimeout(advance, 1500);
        }
      };
      setTimeout(advance, 1500);
    });
  }

  /** Final Envelope: collects everything made throughout the journey, seals,
   *  and floats away while the camera pulls back — ending on a single star. */
  async function finalEnvelope() {
    const wrap = document.getElementById("secret-envelope-wrap");
    const icon = document.getElementById("secret-envelope-icon");
    const collectLine = document.getElementById("secret-envelope-line");
    const cfg = SITE_CONFIG.finalEnvelope;
    if (!wrap) return;

    wrap.hidden = false;
    if (window.gsap) gsap.fromTo(wrap, { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.6)" });

    for (const line of cfg.collecting) {
      collectLine.textContent = line;
      SoundManager.play("sparkle");
      await wait(650);
    }
    collectLine.textContent = "";
    icon.textContent = "💌";
    SoundManager.play("chime");
    await wait(600);

    // wax seal
    icon.textContent = "💌🔴";
    await wait(500);
    collectLine.textContent = cfg.closingLine;
    await wait(2200);

    if (typeof Background3D !== "undefined") Background3D.CameraDirector.pullBack(3.2);

    if (window.gsap) {
      await new Promise((resolve) => {
        gsap.to(wrap, { y: "-38vh", scale: 0.15, opacity: 0, duration: 3, ease: "power2.in", onComplete: resolve });
      });
    } else {
      await wait(2600);
    }
    wrap.hidden = true;
    collectLine.textContent = "";
  }

  function revealFeather() {
    const wrap = document.getElementById("secret-feather-wrap");
    const container = document.getElementById("secret-feather");
    if (!wrap || !container) return;
    container.querySelector("p").textContent = SITE_CONFIG.scratchReveals.featherMessage;
    wrap.hidden = false;
    if (window.gsap) gsap.fromTo(wrap, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" });

    if (typeof ScratchReveal === "undefined") return;
    const featherId = "scratch:secretending:feather";
    ScratchReveal.attach(container, {
      id: featherId, label: "🪶 Scratch 🪶",
      startRevealed: typeof Discoveries !== "undefined" && Discoveries.has(featherId)
    });
  }

  function maybeShowCompletionWhisper() {
    const el = document.getElementById("completion-whisper");
    if (!el || typeof Discoveries === "undefined") return;
    if (!Discoveries.isComplete()) return; // stays completely silent otherwise, as intended
    el.textContent = SITE_CONFIG.completionWhisper;
    el.hidden = false;
    requestAnimationFrame(() => el.classList.add("is-visible"));
  }

  async function playFullSequence() {
    await fakeEnding();
    await fairyReturns();
    await playTextSequence();
    await finalEnvelope();
    revealFeather();
    setTimeout(maybeShowCompletionWhisper, 2000); // give the feather a moment to land first
  }

  function wirePostCredit() {
    const trigger = document.getElementById("postcredit-trigger");
    const message = document.getElementById("postcredit-message");
    if (!trigger || !message) return;
    trigger.addEventListener("click", () => {
      const expanded = trigger.getAttribute("aria-expanded") === "true";
      if (expanded) {
        message.hidden = true;
        trigger.setAttribute("aria-expanded", "false");
        trigger.textContent = "🎬 wait, there's one more thing...";
        return;
      }
      message.textContent = `Real talk: three years of knowing you and doing nothing about it was the biggest waste of time. Glad we fixed that on ${SITE_CONFIG.specialDate}. — see you at your next birthday, ${SITE_CONFIG.friendName}.`;
      message.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      trigger.textContent = "🎬 (close this before it gets sappier)";
      SoundManager.play("chime");
      Celebration.burst(trigger);
    });
  }

  function init() {
    const canvas = document.getElementById("ending-canvas");
    wirePostCredit();
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio, 2);
    let started = false;
    let msgInterval = null;

    function size() {
      // Guard: a hidden fullscreen scene has 0 clientWidth/Height — skip until it's visible.
      if (!canvas.clientWidth || !canvas.clientHeight) return false;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return true;
    }

    const messages = [`Happy Birthday`, SITE_CONFIG.friendName, `Thank You For Being`, `My Best Friend`];
    let msgIndex = 0;
    let points = [];

    function textToPoints(text) {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return [];
      const off = document.createElement("canvas");
      off.width = w; off.height = h;
      const octx = off.getContext("2d");
      octx.fillStyle = "#fff";
      octx.font = `600 ${Math.min(46, w / 10)}px 'Cormorant Garamond', serif`;
      octx.textAlign = "center";
      octx.textBaseline = "middle";
      octx.fillText(text, w / 2, h / 2);
      const data = octx.getImageData(0, 0, w, h).data;
      const pts = [];
      for (let y = 0; y < h; y += 4) {
        for (let x = 0; x < w; x += 4) {
          const idx = (y * w + x) * 4 + 3;
          if (data[idx] > 128) pts.push({ x, y });
        }
      }
      return pts;
    }

    let stars = [];
    function setMessage(text) {
      points = textToPoints(text);
      stars = points.map(p => ({
        tx: p.x, ty: p.y,
        x: Math.random() * canvas.clientWidth,
        y: Math.random() * canvas.clientHeight
      }));
    }

    function loop() {
      if (!canvas.clientWidth) { requestAnimationFrame(loop); return; }
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      ctx.fillStyle = "#F0C86E";
      stars.forEach(s => {
        s.x += (s.tx - s.x) * 0.06;
        s.y += (s.ty - s.y) * 0.06;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 1.4, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(loop);
    }

    function start() {
      if (started || !size()) return;
      started = true;
      setMessage(messages[0]);
      msgInterval = setInterval(() => {
        msgIndex = (msgIndex + 1) % messages.length;
        setMessage(messages[msgIndex]);
      }, 3200);
      loop();
    }

    window.addEventListener("resize", () => { if (started) size(); });
    window.addEventListener("scenechange", (e) => {
      if (e.detail.id === "secretending") {
        start();
        playFullSequence();
      }
    });
  }
  return { init };
})();

/* ==================== LIBRARY OF FUTURE (blank books, waiting) ==================== */
const LibraryOfFuture = (() => {
  const years = [2027, 2028, 2029, 2030, 2031];

  function openBook(year) {
    const panel = document.getElementById("future-book-panel");
    const yearEl = document.getElementById("future-book-year");
    yearEl.textContent = year;
    panel.hidden = false;
    SoundManager.play("pageFlip");
    if (window.gsap) gsap.fromTo(panel, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
  }

  function closeBook() {
    document.getElementById("future-book-panel").hidden = true;
  }

  function render() {
    const shelf = document.getElementById("future-shelf");
    if (!shelf) return;
    years.forEach((year, i) => {
      const book = document.createElement("button");
      book.className = "future-book-spine";
      book.style.setProperty("--book-hue", (i * 47) % 360);
      book.textContent = year;
      book.setAttribute("aria-label", `Open the ${year} book`);
      book.addEventListener("click", () => openBook(year));
      shelf.appendChild(book);
    });
    document.getElementById("future-book-close")?.addEventListener("click", closeBook);
  }

  function init() { render(); }
  return { init };
})();

/* ==================== BOOK OF MEMORIES (flip-book gallery) ==================== */
const MemoryBook = (() => {
  const pages = [
    { img: "assets/images/placeholder-friends-1.svg", caption: "Reel-watching marathon", quote: "Some of our best conversations happened over the worst reels." },
    { img: "assets/images/placeholder-friends-2.svg", caption: "Gossip session #482", quote: "We could talk for six hours and still say \"okay one more thing.\"" },
    { img: "assets/images/placeholder-friends-3.svg", caption: "Makku 😂", quote: "A nickname earned, never given." },
    { img: "assets/images/placeholder-friends-4.svg", caption: "Thayir Saatham 🍚", quote: "Don't ask. You had to be there." },
    { img: "assets/images/placeholder-friends-1.svg", caption: "28 Feb 2026 — Special Page", quote: "The day everything actually started." },
    { img: "assets/images/placeholder-friends-3.svg", caption: "A Hidden Note", hiddenNote: true },
    { img: "assets/images/placeholder-friends-2.svg", caption: "This Very Moment", quote: "Still going, four months strong." }
  ];
  let current = 0;
  let scratchController = null;

  function render() {
    const img = document.getElementById("memorybook-img");
    const caption = document.getElementById("memorybook-caption");
    const quote = document.getElementById("memorybook-quote");
    const indicator = document.getElementById("memorybook-indicator");
    const page = pages[current];
    img.src = page.img;
    img.alt = page.caption;
    caption.textContent = page.caption;
    indicator.textContent = `Page ${current + 1} of ${pages.length}`;

    if (scratchController) { scratchController.destroy(); scratchController = null; }

    if (page.hiddenNote) {
      const scratchId = "scratch:memorybook:hiddenNote";
      const alreadyFound = typeof Discoveries !== "undefined" && Discoveries.has(scratchId);
      quote.innerHTML = `<span class="scratch-revealed-hint">✨ some magical glitter is covering a note ✨</span>
        <div class="scratch-container" id="memorybook-scratch-area"><p style="margin:0;">${SITE_CONFIG.scratchReveals.memoryBookNote}</p></div>`;
      if (typeof ScratchReveal !== "undefined") {
        scratchController = ScratchReveal.attach(document.getElementById("memorybook-scratch-area"),
          { id: scratchId, label: "✨ Scratch ✨", startRevealed: alreadyFound });
      }
    } else {
      quote.textContent = `"${page.quote}"`;
    }
  }

  function turnTo(newIndex) {
    const pageEl = document.getElementById("memorybook-page");
    pageEl.classList.add("is-turning");
    SoundManager.play("pageFlip");
    setTimeout(() => { current = newIndex; render(); }, 340);
    setTimeout(() => pageEl.classList.remove("is-turning"), 720);
  }

  function next() { if (current < pages.length - 1) turnTo(current + 1); }
  function prev() { if (current > 0) turnTo(current - 1); }

  async function downloadPagePNG() {
    if (typeof html2canvas === "undefined") {
      alert("PNG export library failed to load — check your internet connection and try again.");
      return;
    }
    const pageEl = document.getElementById("memorybook-page");
    const canvas = await html2canvas(pageEl, { backgroundColor: "#171c4d", scale: 3 });
    const link = document.createElement("a");
    link.download = `Memory-Page-${current + 1}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function downloadBookPDF() {
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) { alert("PDF library failed to load — check your internet connection and try again."); return; }
    const doc = new jsPDF({ unit: "pt", format: "a5" });
    pages.forEach((page, i) => {
      if (i > 0) doc.addPage();
      const w = doc.internal.pageSize.getWidth();
      const h = doc.internal.pageSize.getHeight();
      doc.setFillColor(23, 28, 77);
      doc.rect(0, 0, w, h, "F");
      doc.setDrawColor(240, 200, 110);
      doc.setLineWidth(1.2);
      doc.rect(18, 18, w - 36, h - 36);
      doc.setFont("times", "bold");
      doc.setFontSize(16);
      doc.setTextColor(255, 222, 156);
      doc.text(page.caption, w / 2, 60, { align: "center" });
      doc.setFont("times", "italic");
      doc.setFontSize(12);
      doc.setTextColor(220, 220, 240);
      const lines = doc.splitTextToSize(page.quote, w - 80);
      doc.text(lines, w / 2, 100, { align: "center", lineHeightFactor: 1.5 });
      doc.setFont("times", "normal");
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 180);
      doc.text(`Page ${i + 1} of ${pages.length}`, w / 2, h - 30, { align: "center" });
    });
    doc.save(`Book-Of-Memories-${SITE_CONFIG.friendName.replace(/\s+/g, "-")}.pdf`);
  }

  function init() {
    if (!document.getElementById("memorybook-page")) return;
    render();
    document.getElementById("memorybook-next")?.addEventListener("click", next);
    document.getElementById("memorybook-prev")?.addEventListener("click", prev);
    document.getElementById("memorybook-download-png")?.addEventListener("click", downloadPagePNG);
    document.getElementById("memorybook-download-pdf")?.addEventListener("click", downloadBookPDF);
  }
  return { init };
})();

/* ==================== GREETING CARD (wax seal + letter) ==================== */
const GreetingCard = (() => {
  function revealScratchBlocks() {
    const sentenceWrap = document.getElementById("greeting-hidden-sentence-wrap");
    const sentenceContainer = document.getElementById("greeting-hidden-sentence");
    const wishWrap = document.getElementById("greeting-wish-wrap");
    const wishContainer = document.getElementById("greeting-wish");
    if (!sentenceWrap || !wishWrap) return;

    sentenceContainer.querySelector("p").textContent = SITE_CONFIG.scratchReveals.letterHiddenSentence;
    wishContainer.querySelector("p").textContent = SITE_CONFIG.scratchReveals.greetingWish;
    sentenceWrap.hidden = false;
    wishWrap.hidden = false;

    if (typeof ScratchReveal === "undefined") return;
    const sentenceId = "scratch:greeting:sentence";
    const wishId = "scratch:greeting:wish";
    ScratchReveal.attach(sentenceContainer, {
      id: sentenceId, label: "✨ Scratch ✨",
      startRevealed: typeof Discoveries !== "undefined" && Discoveries.has(sentenceId)
    });
    ScratchReveal.attach(wishContainer, {
      id: wishId, label: "✨ Scratch Here ✨",
      startRevealed: typeof Discoveries !== "undefined" && Discoveries.has(wishId)
    });
  }

  function open() {
    const card = document.getElementById("greeting-card");
    if (card.classList.contains("is-open")) return;
    card.classList.add("is-open");
    SoundManager.play("sparkle");
    Celebration.burst(card);
    if (typeof FriendshipLetter !== "undefined") {
      setTimeout(() => FriendshipLetter.revealInk(revealScratchBlocks), 500);
    }
  }

  function init() {
    const seal = document.getElementById("greeting-seal");
    if (!seal) return;
    seal.addEventListener("click", open);
    seal.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
  }
  return { init };
})();
