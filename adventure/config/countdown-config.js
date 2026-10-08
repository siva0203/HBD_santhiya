/**
 * CONFIG.js — countdown micro-site settings
 * This is a fully separate project from /birthday. Edit this file to
 * personalize the countdown, then edit /birthday/config/config.js
 * separately for the main experience.
 */
const COUNTDOWN_CONFIG = {
  friendName: "Santhiya",

  // Must match the unlock moment you want. Format: "YYYY-MM-DDTHH:MM:SS"
  unlockDateTime: "2026-12-10T00:00:00",

  // Where to send the visitor once the countdown hits zero.
  // Both files now live in the same folder, so a simple relative filename works.
  redirectUrl: "index.html",

  message: "A magical surprise has been prepared especially for you...",
  subMessage: "This gift will unlock only on your birthday.",

  rotatingMessages: [
    "The fairies are still decorating...",
    "Somewhere, a cake is being lit...",
    "The stars are almost aligned...",
    "Patience... good things are being wrapped in gold..."
  ]
};

function resolveCountdownSettings() {
  try {
    const params = new URLSearchParams(window.location.search);
    const overrideDate = params.get("unlock") || params.get("date");
    return {
      ...COUNTDOWN_CONFIG,
      unlockDateTime: overrideDate || COUNTDOWN_CONFIG.unlockDateTime
    };
  } catch (e) {
    return { ...COUNTDOWN_CONFIG };
  }
}

function isPreviewMode() {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("preview") === "true") localStorage.setItem("bday_countdown_preview", "1");
    return localStorage.getItem("bday_countdown_preview") === "1";
  } catch (e) { return false; }
}
