/**
 * STARTEXT.js — reusable "stars converge into text" effect.
 * Used by the Cake chapter's Wish Constellation, and available for any
 * future moment that wants the same beat (a message spelled out in light).
 */
const StarText = (() => {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {string} color - CSS color for the stars
   * @returns controller: { showText(text), dissolve(), destroy() }
   */
  function create(canvas, color = "#F0C86E") {
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio, 2);
    let stars = [];
    let running = true;
    let dissolving = false;

    function size() {
      if (!canvas.clientWidth || !canvas.clientHeight) return false;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return true;
    }

    function textToPoints(text) {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return [];
      const off = document.createElement("canvas");
      off.width = w; off.height = h;
      const octx = off.getContext("2d");
      octx.fillStyle = "#fff";
      octx.font = `600 ${Math.min(40, w / 11)}px 'Cormorant Garamond', serif`;
      octx.textAlign = "center";
      octx.textBaseline = "middle";
      const words = text.split(" ");
      // wrap to a couple of lines if the message is long
      const lineHeight = Math.min(46, w / 10);
      const lines = [];
      let cur = "";
      words.forEach(w2 => {
        const test = cur ? cur + " " + w2 : w2;
        if (octx.measureText(test).width > w * 0.85 && cur) { lines.push(cur); cur = w2; }
        else cur = test;
      });
      if (cur) lines.push(cur);
      const startY = h / 2 - ((lines.length - 1) * lineHeight) / 2;
      lines.forEach((ln, i) => octx.fillText(ln, w / 2, startY + i * lineHeight));

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

    function showText(text) {
      if (!size()) return;
      const points = textToPoints(text);
      stars = points.map(p => ({
        tx: p.x, ty: p.y,
        x: Math.random() * canvas.clientWidth,
        y: Math.random() * canvas.clientHeight,
        vx: 0, vy: 0
      }));
      dissolving = false;
    }

    function dissolve() {
      dissolving = true;
      stars.forEach(s => {
        const angle = Math.random() * Math.PI * 2;
        s.vx = Math.cos(angle) * (0.6 + Math.random() * 0.8);
        s.vy = -Math.abs(Math.sin(angle)) * (0.8 + Math.random() * 1.2) - 0.4; // drift upward
      });
    }

    function loop() {
      if (!running) return;
      requestAnimationFrame(loop);
      if (!canvas.clientWidth) return;
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      ctx.fillStyle = color;
      stars.forEach(s => {
        if (dissolving) {
          s.x += s.vx;
          s.y += s.vy;
          s.vy -= 0.01;
        } else {
          s.x += (s.tx - s.x) * 0.06;
          s.y += (s.ty - s.y) * 0.06;
        }
        ctx.globalAlpha = dissolving ? Math.max(0, 0.85 - Math.abs(s.vy) * 0.05) : 0.85;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    window.addEventListener("resize", size);
    loop();

    return {
      showText,
      dissolve,
      destroy: () => { running = false; window.removeEventListener("resize", size); }
    };
  }

  return { create };
})();
