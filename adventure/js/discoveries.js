/**
 * DISCOVERIES.js — tracks every hidden interaction across the site.
 * Anything that wants to count toward the Completion Whisper just needs
 * to dispatch: window.dispatchEvent(new CustomEvent("discoveryfound", { detail: { id } }))
 * — this module does the rest (persistence, completion check).
 *
 * The tracked set is exactly what's actually built — 6 hidden easter eggs
 * in the Puzzle chapter, and the 5 scratch-to-reveal moments. Nothing here
 * is aspirational; if a future feature adds a new secret, just add its id
 * to ALL_IDS below and have it dispatch "discoveryfound" like the rest.
 */
const Discoveries = (() => {
  const ALL_IDS = [
    "egg:0", "egg:1", "egg:2", "egg:3", "egg:4", "egg:5",
    "scratch:timeline-scratch-28Feb2026",
    "scratch:memorybook:hiddenNote",
    "scratch:greeting:sentence",
    "scratch:greeting:wish",
    "scratch:secretending:feather"
  ];
  const STORAGE_KEY = "bday_discoveries_found";
  let found = new Set();

  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...found])); } catch (e) { /* ignore */ }
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) found = new Set(JSON.parse(raw));
    } catch (e) { /* ignore */ }
  }

  function has(id) { return found.has(id); }

  function isComplete() {
    return ALL_IDS.every(id => found.has(id));
  }

  function progress() {
    return { found: ALL_IDS.filter(id => found.has(id)).length, total: ALL_IDS.length };
  }

  function init() {
    load();
    window.addEventListener("discoveryfound", (e) => {
      const id = e.detail && e.detail.id;
      if (!id || found.has(id)) return;
      found.add(id);
      persist();
    });
  }

  return { init, has, isComplete, progress };
})();
