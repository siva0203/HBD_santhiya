/**
 * LOADER.js — brief loading screen, then hands off to LockGate
 */

const Loader = (() => {
  function run(onDone) {
    const loader = document.getElementById("loader");
    const fill = document.getElementById("loader-bar-fill");
    const text = document.getElementById("loader-text");
    const messages = SITE_CONFIG.loadingMessages;
    let msgIndex = 0;

    text.textContent = messages[0];
    const msgInterval = setInterval(() => {
      msgIndex = (msgIndex + 1) % messages.length;
      text.textContent = messages[msgIndex];
    }, 900);

    let progress = 0;
    const progInterval = setInterval(() => {
      progress += Math.random() * 12 + 6;
      if (progress >= 100) {
        progress = 100;
        clearInterval(progInterval);
        clearInterval(msgInterval);
        setTimeout(() => {
          if (window.gsap) {
            gsap.to(loader, {
              opacity: 0, duration: 0.8, ease: "power2.inOut",
              onComplete: () => { loader.style.display = "none"; onDone(); }
            });
          } else {
            loader.style.display = "none";
            onDone();
          }
        }, 350);
      }
      fill.style.width = progress + "%";
    }, 180);
  }

  return { run };
})();
