/**
 * FAIRY.js — the fairy companion. A lightweight, emoji-based reactive
 * guide (not a rigged 3D character — that's a much bigger undertaking;
 * this gives the "living companion" feel called for in the brief with
 * a fraction of the engineering cost).
 */
const FairyCompanion = (() => {
  const states = {
    hero:         { emoji: "👋🧚", line: "Welcome to the Fairy Kingdom!" },
    storybook:    { emoji: "📖🧚", line: "Let me tell you a story..." },
    memorybook:   { emoji: "🖼️🧚", line: "Flip through the memories." },
    libraryoffuture: { emoji: "🔮🧚", line: "Let's peek into the chapters ahead." },
    timeline:     { emoji: "✨🧚", line: "Watch how far we've come." },
    chat:         { emoji: "💬🧚", line: "I remember these chats!" },
    puzzle:       { emoji: "👉🧚", line: "Try solving this..." },
    gift:         { emoji: "🎁🧚", line: "Go on, open it." },
    greeting:     { emoji: "💌🧚", line: "A card, just for you." },
    cake:         { emoji: "🎂🧚", line: "Make a wish!" },
    celebration:  { emoji: "🎉🧚", line: "Let's celebrate!!" },
    music:        { emoji: "🎵🧚", line: "I love this song." },
    credits:      { emoji: "🎬🧚", line: "Almost there..." },
    secretending: { emoji: "👋🧚", line: "Until next time..." }
  };

  function el() { return document.getElementById("fairy-companion"); }

  function setScene(sceneId) {
    const fairy = el();
    if (!fairy) return;
    currentSceneId = sceneId;
    const state = states[sceneId] || states.hero;
    const emojiEl = fairy.querySelector(".fairy-emoji");
    const lineEl = fairy.querySelector(".fairy-line");
    if (window.gsap) {
      gsap.fromTo(fairy, { scale: 0.85, opacity: 0.5 }, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(2)" });
    }
    emojiEl.textContent = state.emoji;
    lineEl.textContent = state.line;
  }

  let currentSceneId = "hero";

  /**
   * Temporarily override the fairy's emoji/line for a one-off reaction
   * (e.g. shock, spell-casting). Does NOT auto-revert — if you're chaining
   * several of these in a sequence (like the Gift twist), each one flows
   * straight into the next without flickering back to the default line.
   * Call settle() explicitly once your whole sequence is finished, or just
   * let the next scene change handle it naturally.
   */
  function sayTemporary(emoji, line, duration = 1400) {
    const fairy = el();
    if (!fairy) return Promise.resolve();
    const emojiEl = fairy.querySelector(".fairy-emoji");
    const lineEl = fairy.querySelector(".fairy-line");
    if (window.gsap) {
      gsap.fromTo(fairy, { scale: 0.9 }, { scale: 1, duration: 0.3, ease: "back.out(2)" });
    }
    emojiEl.textContent = emoji;
    lineEl.textContent = line;
    return new Promise((resolve) => setTimeout(resolve, duration));
  }

  /** Revert the fairy back to whatever the current scene's default line is. */
  function settle() {
    const fairy = el();
    if (!fairy) return;
    const state = states[currentSceneId] || states.hero;
    fairy.querySelector(".fairy-emoji").textContent = state.emoji;
    fairy.querySelector(".fairy-line").textContent = state.line;
  }

  function init() {
    const fairy = el();
    if (!fairy) return;
    fairy.innerHTML = `<span class="fairy-emoji" aria-hidden="true">🧚</span><span class="fairy-line"></span>`;
  }

  return { init, setScene, sayTemporary, settle };
})();
