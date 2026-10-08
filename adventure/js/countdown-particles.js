/**
 * COUNTDOWN-PARTICLES.js — ambient floating gold-dust layer for the
 * countdown page. Same visual language as the main site's particles
 * (js/particles-config.js), kept separate since this page is much
 * lighter-weight (fewer particles, no star layer).
 */
document.addEventListener("DOMContentLoaded", () => {
  if (typeof particlesJS === "undefined") return;
  particlesJS("particles-js", {
    particles: {
      number: { value: window.innerWidth < 700 ? 26 : 50, density: { enable: true, value_area: 900 } },
      color: { value: ["#F0C86E", "#C9B6E4", "#8FD3FE", "#F5B8CE"] },
      shape: { type: "circle" },
      opacity: { value: 0.4, random: true, anim: { enable: true, speed: 0.35, opacity_min: 0.05, sync: false } },
      size: { value: 2.2, random: true },
      line_linked: { enable: false },
      move: { enable: true, speed: 0.4, direction: "top", random: true, straight: false, out_mode: "out" }
    },
    interactivity: { detect_on: "canvas", events: { onhover: { enable: false }, resize: true } },
    retina_detect: true
  });
});
