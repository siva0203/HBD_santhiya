/**
 * OPENING.js — the very first thing shown when the page loads: a live,
 * ticking breakdown of exactly how long she's been alive (years, months,
 * days, hours, minutes, seconds since her birth date), with a "Begin The
 * Story" button that hands off to the existing loader -> trailer -> PIN
 * boot chain.
 *
 * NOTE: this is deliberately elapsed time SINCE birth, not a countdown to
 * her next birthday — that countdown already lives on countdown.html.
 */
const OpeningScreen = (() => {
  let interval = null;

  function pad(n) { return String(n).padStart(2, "0"); }

  /** Calendar-aware elapsed time — handles varying month lengths correctly,
   *  not just a raw millisecond division (which would misrepresent months/years). */
  function elapsedSince(birthDate, now) {
    let years = now.getFullYear() - birthDate.getFullYear();
    let months = now.getMonth() - birthDate.getMonth();
    let days = now.getDate() - birthDate.getDate();
    let hours = now.getHours() - birthDate.getHours();
    let minutes = now.getMinutes() - birthDate.getMinutes();
    let seconds = now.getSeconds() - birthDate.getSeconds();

    if (seconds < 0) { seconds += 60; minutes--; }
    if (minutes < 0) { minutes += 60; hours--; }
    if (hours < 0) { hours += 24; days--; }
    if (days < 0) {
      const daysInPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
      days += daysInPrevMonth;
      months--;
    }
    if (months < 0) { months += 12; years--; }
    return { years, months, days, hours, minutes, seconds };
  }

  function tick() {
    const birth = new Date(SITE_CONFIG.birthDateTime);
    const e = elapsedSince(birth, new Date());
    document.getElementById("open-years").textContent = pad(e.years);
    document.getElementById("open-months").textContent = pad(e.months);
    document.getElementById("open-days").textContent = pad(e.days);
    document.getElementById("open-hours").textContent = pad(e.hours);
    document.getElementById("open-mins").textContent = pad(e.minutes);
    document.getElementById("open-secs").textContent = pad(e.seconds);
  }

  /** @param {Function} onBegin - called once, when the visitor taps through */
  function init(onBegin) {
    const screen = document.getElementById("opening-screen");
    const btn = document.getElementById("opening-begin-btn");
    if (!screen) { onBegin(); return; }

    tick();
    interval = setInterval(tick, 1000);

    btn.addEventListener("click", () => {
      clearInterval(interval);
      if (window.gsap) {
        gsap.to(screen, {
          opacity: 0, duration: 0.8, ease: "power2.inOut",
          onComplete: () => { screen.style.display = "none"; onBegin(); }
        });
      } else {
        screen.style.display = "none";
        onBegin();
      }
    });
  }

  return { init };
})();
