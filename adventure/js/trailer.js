/**
 * TRAILER.js — Hollywood-style cinematic trailer.
 * Shares the SAME Three.js world as the Hero scene (Background3D) — the
 * camera flies through it during the trailer, then settles into the Hero
 * framing, so it reads as one continuous shot rather than a cut between
 * two different builds.
 *
 * Includes the Time Freeze Twist: everything (camera, particles, music)
 * freezes mid-trailer except the fairy, who leaves frame, returns with a
 * glowing star, places it in the logo, then everything resumes exactly
 * where it left off.
 */
const MovieTrailer = (() => {
  const hasDirector = () => window.gsap && typeof Background3D !== "undefined" && Background3D.CameraDirector;

  function setLetterbox(visible) {
    document.getElementById("letterbox-top")?.classList.toggle("is-visible", visible);
    document.getElementById("letterbox-bottom")?.classList.toggle("is-visible", visible);
  }

  function setParticlesVisible(visible) {
    const layer = document.getElementById("particles-js");
    const stars = document.getElementById("particles-stars");
    if (layer) layer.style.opacity = visible ? "1" : "0";
    if (stars) stars.style.opacity = visible ? "1" : "0";
  }

  function showLine(el, text, holdDuration) {
    return new Promise((resolve) => {
      el.textContent = text;
      if (window.gsap) {
        gsap.fromTo(el, { opacity: 0, letterSpacing: "0.4em", filter: "blur(14px)", scale: 1.22 },
          { opacity: 1, letterSpacing: "0.08em", filter: "blur(0px)", scale: 1, duration: 1.3, ease: "power2.out",
            onComplete: () => {
              gsap.to(el, { opacity: 0, filter: "blur(8px)", scale: 0.96, duration: 0.7, delay: holdDuration, onComplete: resolve });
            }
          });
      } else {
        setTimeout(resolve, holdDuration * 1000 + 900);
      }
    });
  }

  /** One continuous flight path toward the castle — each line is an
   *  absolute camera keyframe, not a relative nudge, so the moves build
   *  on each other into a real "flying through the world" arc instead of
   *  cancelling each other out. */
  const flightPath = [
    { pos: { x: 0,  y: 2,   z: 34 }, rot: { x: 0,     y: 0,    z: 0 } },
    { pos: { x: -5, y: 1,   z: 26 }, rot: { x: 0,     y: -0.15, z: 0 } },
    { pos: { x: 5,  y: 3,   z: 17 }, rot: { x: -0.05, y: 0.2,  z: 0 } },
    { pos: { x: 0,  y: 5,   z: 8  }, rot: { x: -0.1,  y: 0,    z: 0 } },
    { pos: { x: -4, y: 2,   z: 1  }, rot: { x: -0.05, y: 0.15, z: 0 } },
    { pos: { x: 3,  y: 1,   z: -4 }, rot: { x: 0,     y: -0.1, z: 0 } },
    { pos: { x: 0,  y: 1.5, z: -8 }, rot: { x: 0,     y: 0,    z: 0 } }
  ];

  function cameraBeat(i, duration) {
    if (!hasDirector()) return Promise.resolve();
    const kf = flightPath[i % flightPath.length];
    return Background3D.flyCamera(kf, duration, "power2.inOut");
  }

  /** Time Freeze Twist — plays once, mid-trailer */
  function timeFreezeTwist() {
    return new Promise((resolve) => {
      const fairy = document.getElementById("trailer-freeze-fairy");
      const line = document.getElementById("trailer-freeze-line");
      const logo = document.getElementById("trailer-logo");

      // Freeze the world: camera, ambient motion, particles, music.
      if (typeof Background3D !== "undefined") Background3D.setFrozen(true);
      setParticlesVisible(false);
      SoundManager.pauseTrailerBGM();

      if (!window.gsap) {
        // No-GSAP fallback: same beats, driven by plain style + setTimeout instead of a timeline.
        fairy.style.opacity = "1";
        fairy.style.transition = "transform 0.5s ease";
        fairy.style.transform = "translate(-50%, -50%) translateX(0vw)";
        setTimeout(() => {
          line.style.transition = "opacity 0.3s";
          line.style.opacity = "1";
          line.textContent = "Wait... I almost forgot something...";
        }, 550);
        setTimeout(() => { line.style.opacity = "0"; }, 1450);
        setTimeout(() => {
          fairy.style.transform = "translate(-50%, -50%) translateX(140vw)";
        }, 1750);
        setTimeout(() => {
          fairy.textContent = "🧚✨";
          fairy.style.transition = "none";
          fairy.style.transform = "translate(-50%, -50%) translateX(-10vw)";
          requestAnimationFrame(() => {
            fairy.style.transition = "transform 0.5s ease";
            fairy.style.transform = "translate(-50%, -50%) translateX(0vw)";
          });
          logo.hidden = false;
          logo.classList.add("is-lit");
          SoundManager.play("sparkle");
        }, 2500);
        setTimeout(() => { fairy.style.opacity = "0"; }, 3500);
        setTimeout(() => {
          if (typeof Background3D !== "undefined") Background3D.setFrozen(false);
          setParticlesVisible(true);
          SoundManager.resumeTrailerBGM();
          logo.hidden = true;
          logo.classList.remove("is-lit");
          resolve();
        }, 4200);
        return;
      }

      const tl = gsap.timeline({ onComplete: resolve });
      tl.set(fairy, { opacity: 1, x: "-140vw" })
        .to(fairy, { x: "0vw", duration: 0.55, ease: "power2.in" })
        .to(line, { opacity: 1, duration: 0.3 }, "-=0.1")
        .call(() => { line.textContent = "Wait... I almost forgot something..."; })
        .to({}, { duration: 0.9 }) // hold — she whispers
        .to(line, { opacity: 0, duration: 0.3 })
        .to(fairy, { x: "140vw", duration: 0.5, ease: "power2.in" })
        .to({}, { duration: 0.35 }) // brief empty beat — she's off collecting the star
        .set(fairy, { x: "-10vw", textContent: "🧚✨" })
        .to(fairy, { x: "0vw", duration: 0.5, ease: "power2.out" })
        .call(() => { logo.hidden = false; logo.classList.add("is-lit"); SoundManager.play("sparkle"); })
        .to({}, { duration: 0.5 })
        .to(fairy, { opacity: 0, duration: 0.5 })
        .call(() => {
          if (typeof Background3D !== "undefined") Background3D.setFrozen(false);
          setParticlesVisible(true);
          SoundManager.resumeTrailerBGM();
          logo.hidden = true;
          logo.classList.remove("is-lit");
        });
    });
  }

  async function play() {
    const overlay = document.getElementById("trailer");
    const line = document.getElementById("trailer-line");
    const logo = document.getElementById("trailer-logo");
    if (!overlay) { finish(); return; }

    overlay.style.display = "flex";
    setLetterbox(true);
    SoundManager.playTrailerBGM();

    if (typeof Background3D !== "undefined") {
      Background3D.enableDirector();
      Background3D.flyCamera({ position: { x: 0, y: 2, z: 42 } }, 0.01); // start further back for a grander fly-in
    }

    const lines = SITE_CONFIG.trailerLines;
    const freezeAfterIndex = Math.min(2, lines.length - 1); // freeze twist lands after the 3rd line
    const lineHold = 1.5;      // slower — each line lingers longer before fading
    const cameraDuration = 3.0; // matching slower pace, so moves feel deliberate, not rushed

    for (let i = 0; i < lines.length; i++) {
      await Promise.all([showLine(line, lines[i], lineHold), cameraBeat(i, cameraDuration)]);
      if (i === freezeAfterIndex) await timeFreezeTwist();
    }

    line.textContent = "";
    logo.textContent = SITE_CONFIG.trailerLogoLine;
    logo.hidden = false;

    await new Promise((resolve) => {
      if (window.gsap) {
        gsap.timeline({ onComplete: resolve })
          .fromTo(logo, { opacity: 0, scale: 0.7, filter: "blur(10px)" },
            { opacity: 1, scale: 1, filter: "blur(0px)", duration: 1.2, ease: "back.out(1.6)" })
          .call(() => logo.classList.add("is-lit"))
          .to({}, { duration: 1.8 });
      } else {
        logo.style.opacity = 1;
        setTimeout(resolve, 2400);
      }
    });

    // Arrive at the kingdom — pull back slightly from the close castle shot into a
    // readable establishing frame, but stay IN the world (same castle, same sky)
    // rather than resetting back out to the generic default. Same shot, new chapter.
    if (typeof Background3D !== "undefined") {
      await Background3D.flyCamera({ position: { x: 0, y: 1.5, z: 3 }, rotation: { x: 0, y: 0, z: 0 }, fov: 55 }, 2.0, "power2.out");
      Background3D.setWander(true); // the fairy-light companion starts wandering the kingdom from here on
    }

    setLetterbox(false);
    if (window.gsap) {
      await new Promise((resolve) => {
        gsap.to(overlay, { opacity: 0, duration: 1, ease: "power2.inOut", onComplete: resolve });
      });
    }
    overlay.style.display = "none";
    overlay.style.opacity = "";
    logo.classList.remove("is-lit");
    logo.hidden = true;
    if (typeof Background3D !== "undefined") Background3D.disableDirector();
    finish();
  }

  function finish() {
    if (typeof MainApp !== "undefined") MainApp.onTrailerFinished();
  }

  return { play };
})();
