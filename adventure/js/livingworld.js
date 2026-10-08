/**
 * LIVINGWORLD.js — persistent ambient life (butterflies + fireflies).
 * Kept intentionally lightweight (CSS-driven emoji sprites, not sprite
 * sheets or physics) so it layers on top of the existing Three.js/particle
 * background without adding real rendering cost.
 */
const LivingWorld = (() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function spawnLayer(containerId, emojis, count, className) {
    const container = document.getElementById(containerId);
    if (!container || reduced) return;
    for (let i = 0; i < count; i++) {
      const el = document.createElement("span");
      el.className = className;
      el.textContent = emojis[i % emojis.length];
      el.style.left = `${Math.random() * 92 + 2}%`;
      el.style.top = `${Math.random() * 80 + 6}%`;
      el.style.animationDuration = `${8 + Math.random() * 10}s`;
      el.style.animationDelay = `${Math.random() * 6}s`;
      el.setAttribute("aria-hidden", "true");
      container.appendChild(el);
    }
  }

  function init() {
    spawnLayer("living-world-butterflies", ["🦋"], window.innerWidth < 700 ? 3 : 6, "living-butterfly");
    spawnLayer("living-world-fireflies", ["✨"], window.innerWidth < 700 ? 5 : 10, "living-firefly");
  }

  return { init };
})();
