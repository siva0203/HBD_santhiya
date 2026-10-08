/**
 * PARTICLES-CONFIG.js — ambient floating gold-dust + star layer
 * Two independent particles.js instances layered: a sparse layer of
 * slow-drifting four-point stars, and a denser layer of soft dust motes.
 * This mix reads as "magic in the air" rather than a generic dot field.
 */
document.addEventListener("DOMContentLoaded", () => {
  if (typeof particlesJS === "undefined") return;
  const isSmall = window.innerWidth < 700;

  // Layer 1 — soft, slow-drifting dust motes (the bulk of the atmosphere)
  particlesJS("particles-js", {
    particles: {
      number: { value: isSmall ? 32 : 60, density: { enable: true, value_area: 900 } },
      color: { value: ["#F0C86E", "#C9B6E4", "#8FD3FE", "#F5B8CE"] },
      shape: { type: "circle" },
      opacity: {
        value: 0.4, random: true,
        anim: { enable: true, speed: 0.35, opacity_min: 0.05, sync: false }
      },
      size: { value: 2.2, random: true, anim: { enable: true, speed: 0.6, size_min: 0.6, sync: false } },
      line_linked: { enable: false },
      move: {
        enable: true, speed: 0.45, direction: "top", random: true,
        straight: false, out_mode: "out", bounce: false,
        attract: { enable: true, rotateX: 500, rotateY: 900 }
      }
    },
    interactivity: {
      detect_on: "canvas",
      events: { onhover: { enable: true, mode: "bubble" }, resize: true },
      modes: { bubble: { distance: 90, size: 3.5, duration: 1.6, opacity: 0.7 } }
    },
    retina_detect: true
  });

  // Layer 2 — a sparse scatter of tiny four-point stars for a fairy-dust glint
  const starLayer = document.createElement("div");
  starLayer.id = "particles-stars";
  starLayer.className = "canvas-layer";
  starLayer.setAttribute("aria-hidden", "true");
  document.body.insertBefore(starLayer, document.getElementById("celebration-canvas"));

  particlesJS("particles-stars", {
    particles: {
      number: { value: isSmall ? 10 : 20, density: { enable: true, value_area: 1200 } },
      color: { value: "#FFDE9C" },
      shape: {
        type: "star",
        stroke: { width: 0 },
        polygon: { nb_sides: 4 }
      },
      opacity: {
        value: 0.7, random: true,
        anim: { enable: true, speed: 1, opacity_min: 0.15, sync: false }
      },
      size: { value: 3.4, random: true },
      line_linked: { enable: false },
      move: { enable: true, speed: 0.2, direction: "none", random: true, straight: false, out_mode: "out" }
    },
    interactivity: { detect_on: "canvas", events: { onhover: { enable: false }, resize: true } },
    retina_detect: true
  });
});
