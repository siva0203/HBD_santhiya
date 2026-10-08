/**
 * COUNTDOWN.js — live countdown, fairy/envelope state, auto-redirect at zero
 */
const CountdownApp = (() => {
  let interval, msgInterval;

  function pad(n) { return String(n).padStart(2, "0"); }
  function getUnlockDate() { return new Date(COUNTDOWN_CONFIG.unlockDateTime); }
  function isUnlocked() { return isPreviewMode() || Date.now() >= getUnlockDate().getTime(); }

  function tick() {
    const diff = getUnlockDate().getTime() - Date.now();
    if (diff <= 0) { clearInterval(interval); unlock(); return; }
    document.getElementById("cd-days").textContent = pad(Math.floor(diff / 86400000));
    document.getElementById("cd-hours").textContent = pad(Math.floor((diff % 86400000) / 3600000));
    document.getElementById("cd-mins").textContent = pad(Math.floor((diff % 3600000) / 60000));
    document.getElementById("cd-secs").textContent = pad(Math.floor((diff % 60000) / 1000));
  }

  function rotateMessages() {
    const el = document.getElementById("rotating-message");
    const msgs = COUNTDOWN_CONFIG.rotatingMessages;
    let i = 0;
    el.textContent = msgs[0];
    msgInterval = setInterval(() => {
      i = (i + 1) % msgs.length;
      if (window.gsap) {
        gsap.to(el, { opacity: 0, duration: 0.4, onComplete: () => {
          el.textContent = msgs[i];
          gsap.to(el, { opacity: 1, duration: 0.4 });
        }});
      } else {
        el.textContent = msgs[i];
      }
    }, 3800);
  }

  function unlock() {
    clearInterval(msgInterval);
    const fairy = document.getElementById("fairy");
    const envelope = document.getElementById("envelope");
    const flash = document.getElementById("unlocked-flash");
    const countdown = document.querySelector(".countdown");
    const msg = document.getElementById("rotating-message");

    fairy.textContent = "🧚‍♀️✨";
    fairy.classList.add("is-awake");
    envelope.textContent = "💌";
    envelope.classList.add("is-glowing");
    if (countdown) countdown.style.display = "none";
    if (msg) msg.textContent = "It's time...";

    if (window.gsap) {
      gsap.timeline()
        .to(flash, { opacity: 1, duration: 0.6, ease: "power2.out" })
        .to(envelope, { scale: 1.3, duration: 0.5, ease: "back.out(2)" }, "<")
        .to(flash, { opacity: 0, duration: 1, delay: 0.3 })
        .to("main", { opacity: 0, duration: 1, ease: "power2.inOut",
            onComplete: () => { window.location.href = COUNTDOWN_CONFIG.redirectUrl; } });
    } else {
      setTimeout(() => { window.location.href = COUNTDOWN_CONFIG.redirectUrl; }, 2200);
    }
  }

  function init() {
    document.getElementById("message").textContent = COUNTDOWN_CONFIG.message;
    document.getElementById("submessage").textContent = COUNTDOWN_CONFIG.subMessage;
    document.title = `A Surprise For ${COUNTDOWN_CONFIG.friendName} ✨`;

    if (isPreviewMode()) {
      const note = document.createElement("p");
      note.className = "preview-note";
      note.textContent = "Preview mode — will auto-redirect immediately.";
      document.body.appendChild(note);
    }

    if (isUnlocked()) { unlock(); return; }
    tick();
    interval = setInterval(tick, 1000);
    rotateMessages();
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", () => {
  CountdownApp.init();
  Background3D.init();
});
