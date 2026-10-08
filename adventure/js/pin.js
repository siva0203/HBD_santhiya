/**
 * PIN.js — Chapter 1: The Secret Invitation
 * A mobile-style PIN keypad. Correct PIN → magic explosion + unlock.
 * Wrong PIN → cute shake + a funny fairy message, then resets.
 */

const PinScreen = (() => {
  let entered = "";
  const fairyMessages = [
    "Hmm, that's not it... the fairy is judging you 🧚",
    "Nope! Try thinking about a very specific date 💭",
    "The castle door didn't even budge 🏰",
    "So close... or not. Try again! ✨"
  ];

  function render() {
    const dotsEl = document.getElementById("pin-dots");
    if (!dotsEl) return;
    dotsEl.innerHTML = "";
    const len = SITE_CONFIG.pin.length;
    for (let i = 0; i < len; i++) {
      const dot = document.createElement("span");
      dot.className = "pin-dot" + (i < entered.length ? " is-filled" : "");
      dotsEl.appendChild(dot);
    }
  }

  function press(digit) {
    if (entered.length >= SITE_CONFIG.pin.length) return;
    entered += digit;
    render();
    SoundManager.play("chime");
    if (entered.length === SITE_CONFIG.pin.length) {
      setTimeout(check, 200);
    }
  }

  function backspace() {
    entered = entered.slice(0, -1);
    render();
  }

  function check() {
    const card = document.querySelector(".pin-card");
    const msg = document.getElementById("pin-message");
    if (entered === SITE_CONFIG.pin) {
      msg.textContent = "The invitation glows... ✨";
      card.classList.add("is-correct");
      const emblem = document.getElementById("pin-lock-emblem");
      if (emblem) { emblem.textContent = "🔓"; emblem.classList.add("is-glowing"); }
      SoundManager.play("sparkle");
      Celebration.burst("pin-card");
      setTimeout(unlock, 1000);
    } else {
      card.classList.add("is-wrong");
      msg.textContent = fairyMessages[Math.floor(Math.random() * fairyMessages.length)];
      setTimeout(() => {
        card.classList.remove("is-wrong");
        entered = "";
        render();
      }, 600);
    }
  }

  function unlock() {
    const screen = document.getElementById("pin-screen");
    if (window.gsap) {
      gsap.to(screen, {
        opacity: 0, duration: 1, ease: "power2.inOut",
        onComplete: () => { screen.style.display = "none"; proceed(); }
      });
    } else {
      screen.style.display = "none";
      proceed();
    }
  }

  function proceed() {
    document.body.classList.remove("scroll-locked");
    SoundManager.startAmbient();
    if (typeof MainApp !== "undefined") MainApp.onPinUnlocked();
  }

  function wireKeypad() {
    document.querySelectorAll(".pin-key[data-digit]").forEach(btn => {
      btn.addEventListener("click", () => press(btn.dataset.digit));
    });
    document.getElementById("pin-backspace")?.addEventListener("click", backspace);

    document.addEventListener("keydown", (e) => {
      const screen = document.getElementById("pin-screen");
      if (!screen || screen.style.display === "none") return;
      if (/^[0-9]$/.test(e.key)) press(e.key);
      if (e.key === "Backspace") backspace();
    });
  }

  function show() {
    const screen = document.getElementById("pin-screen");
    if (!screen) return;
    screen.style.display = "flex";
    entered = "";
    render();
  }

  function init() {
    wireKeypad();
  }

  return { init, show };
})();
