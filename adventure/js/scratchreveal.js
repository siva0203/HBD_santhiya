/**
 * SCRATCHREVEAL.js — reusable "scratch away magical dust" interaction.
 * Used across Memory Book, Timeline, Greeting Card, and Secret Ending.
 * Canvas-based (destination-out compositing) so it works reliably with
 * both mouse and touch, without any external library.
 */
const ScratchReveal = (() => {
  const REVEAL_THRESHOLD = 0.45; // fraction scratched away before auto-completing

  /**
   * @param {HTMLElement} container - a `position: relative` element the
   *   scratch canvas will exactly cover. Content underneath (the reveal)
   *   should already be in the DOM, behind the canvas.
   * @param {Object} opts
   * @param {string} [opts.label] - text shown on the scratchable cover
   * @param {Function} [opts.onReveal] - called once, when fully revealed
   * @param {boolean} [opts.startRevealed] - skip the cover entirely (for
   *   persisting "already found this one" across revisits)
   */
  function attach(container, opts = {}) {
    if (opts.startRevealed) { opts.onReveal && opts.onReveal(true); return { destroy() {}, forceReveal() {} }; }

    const canvas = document.createElement("canvas");
    canvas.className = "scratch-canvas";
    canvas.setAttribute("role", "button");
    canvas.setAttribute("aria-label", opts.label ? `Scratch to reveal: ${opts.label}` : "Scratch to reveal");
    container.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    let revealed = false;
    let lastSoundAt = 0;
    let lastCheckAt = 0;
    let destroyed = false;
    let sizedWidth = 0;
    let sizedHeight = 0;

    function drawCover() {
      const w = canvas.width, h = canvas.height;
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, "#8a6fd6");
      grad.addColorStop(1, "#c9b6e4");
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      // glitter texture
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      for (let i = 0; i < Math.max(20, (w * h) / 900); i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 1.3 + 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      if (opts.label) {
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.font = `600 ${Math.max(11, Math.min(15, w / 16))}px 'Poppins', sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(opts.label, w / 2, h / 2);
      }
    }

    function size() {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (!width || !height) return false;
      if (width === sizedWidth && height === sizedHeight) return true;
      sizedWidth = width;
      sizedHeight = height;
      canvas.width = width;
      canvas.height = height;
      drawCover();
      return true;
    }

    function spawnGlitter(x, y) {
      for (let i = 0; i < 3; i++) {
        const bit = document.createElement("span");
        bit.className = "scratch-glitter";
        bit.style.left = x + (Math.random() * 16 - 8) + "px";
        bit.style.top = y + (Math.random() * 16 - 8) + "px";
        container.appendChild(bit);
        setTimeout(() => bit.remove(), 700);
      }
    }

    function checkThreshold(now) {
      if (now - lastCheckAt < 140) return; // throttle — sampling full pixel data is not free
      lastCheckAt = now;
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let cleared = 0;
      const step = 4 * 8; // sample every 8th pixel for speed
      let sampled = 0;
      for (let i = 3; i < data.length; i += step) {
        sampled++;
        if (data[i] < 40) cleared++;
      }
      if (sampled && cleared / sampled > REVEAL_THRESHOLD) completeReveal();
    }

    function completeReveal() {
      if (revealed) return;
      revealed = true;
      SoundManager.play("chime");
      if (window.gsap) {
        gsap.to(canvas, { opacity: 0, duration: 0.7, ease: "power2.out", onComplete: () => canvas.remove() });
      } else {
        canvas.style.transition = "opacity 0.6s";
        canvas.style.opacity = "0";
        setTimeout(() => canvas.remove(), 600);
      }
      if (opts.id) window.dispatchEvent(new CustomEvent("discoveryfound", { detail: { type: "scratch", id: opts.id } }));
      opts.onReveal && opts.onReveal(false);
    }

    function scratchAt(x, y) {
      if (revealed || destroyed) return;
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, Math.max(16, canvas.width / 14), 0, Math.PI * 2);
      ctx.fill();
      const now = performance.now();
      if (now - lastSoundAt > 220) { SoundManager.play("sparkle"); lastSoundAt = now; }
      spawnGlitter(x, y);
      checkThreshold(now);
    }

    function posFromEvent(e) {
      const rect = canvas.getBoundingClientRect();
      const point = e.touches ? e.touches[0] : e;
      return {
        x: (point.clientX - rect.left) * (canvas.width / rect.width),
        y: (point.clientY - rect.top) * (canvas.height / rect.height)
      };
    }

    let scratching = false;
    function down(e) { scratching = true; const p = posFromEvent(e); scratchAt(p.x, p.y); }
    function move(e) { if (!scratching) return; e.preventDefault(); const p = posFromEvent(e); scratchAt(p.x, p.y); }
    function up() { scratching = false; }

    canvas.addEventListener("mousedown", down);
    canvas.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    canvas.addEventListener("touchstart", down, { passive: true });
    canvas.addEventListener("touchmove", move, { passive: false });
    canvas.addEventListener("touchend", up);

    const resizeHandler = () => size();
    window.addEventListener("resize", resizeHandler);
    const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(size) : null;
    resizeObserver?.observe(container);
    size();

    return {
      destroy() {
        destroyed = true;
        window.removeEventListener("resize", resizeHandler);
        resizeObserver?.disconnect();
        window.removeEventListener("mouseup", up);
        canvas.remove();
      },
      forceReveal: completeReveal
    };
  }

  return { attach };
})();
