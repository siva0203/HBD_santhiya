/**
 * LETTER.js — renders the friendship letter + generates a downloadable PDF
 * (elegantly formatted, NOT a "certificate" — a genuine letter layout)
 * Uses jsPDF (loaded from CDN in index.html).
 */

const FriendshipLetter = (() => {
  function render() {
    const body = document.getElementById("letter-body");
    if (!body) return;
    body.textContent = fillName(SITE_CONFIG.letterBody);
  }

  let inkRevealed = false;
  function revealInk(onComplete) {
    const body = document.getElementById("letter-body");
    if (!body || inkRevealed) { onComplete && onComplete(); return; }
    inkRevealed = true;
    const full = fillName(SITE_CONFIG.letterBody);
    body.textContent = "";
    let i = 0;
    const speed = full.length > 500 ? 6 : 14; // faster for long letters, still readable
    const typing = setInterval(() => {
      body.textContent += full[i];
      i++;
      if (i >= full.length) { clearInterval(typing); onComplete && onComplete(); }
    }, speed);
  }

  function downloadPDF() {
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) {
      alert("PDF library failed to load — check your internet connection and try again.");
      return;
    }
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 64;
    const maxWidth = pageWidth - margin * 2;

    const pageHeight = doc.internal.pageSize.getHeight();
    const lineHeight = 13.5 * 1.6;
    const contentBottom = pageHeight - 72;
    let y = 150;

    function drawPageFrame() {
      doc.setDrawColor(240, 200, 110);
      doc.setLineWidth(1.4);
      doc.rect(28, 28, pageWidth - 56, pageHeight - 56);
    }

    drawPageFrame();
    doc.setFont("times", "italic");
    doc.setFontSize(12);
    doc.setTextColor(120, 100, 60);
    doc.text("A Friendship Letter", margin, 70);

    doc.setFont("times", "bold");
    doc.setFontSize(26);
    doc.setTextColor(40, 30, 70);
    doc.text(`For ${SITE_CONFIG.friendName}`, margin, 105);

    doc.setDrawColor(200, 182, 228);
    doc.setLineWidth(0.6);
    doc.line(margin, 118, pageWidth - margin, 118);

    doc.setFont("times", "normal");
    doc.setFontSize(13.5);
    doc.setTextColor(40, 40, 60);
    const text = fillName(SITE_CONFIG.letterBody)
      .replace(/\*\*/g, "")
      .replace(/[—–]/g, "-")
      .replace(/·/g, "-")
      .replace(/[^\x20-\x7E\n\r]/g, "");

    text.split(/\r?\n/).forEach(paragraph => {
      const lines = paragraph ? doc.splitTextToSize(paragraph, maxWidth) : [""];
      lines.forEach(line => {
        if (y + lineHeight > contentBottom) {
          doc.addPage();
          drawPageFrame();
          doc.setFont("times", "italic");
          doc.setFontSize(12);
          doc.setTextColor(120, 100, 60);
          doc.text("A Friendship Letter - continued", margin, 70);
          doc.setFont("times", "normal");
          doc.setFontSize(13.5);
          doc.setTextColor(40, 40, 60);
          y = 95;
        }
        if (line) doc.text(line, margin, y);
        y += lineHeight;
      });
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let page = 1; page <= pageCount; page++) {
      doc.setPage(page);
      doc.setFont("times", "italic");
      doc.setFontSize(9.5);
      doc.setTextColor(140, 140, 160);
      doc.text(`Page ${page} of ${pageCount}`, pageWidth - margin, pageHeight - 48, { align: "right" });
    }

    doc.save(`Friendship-Letter-for-${SITE_CONFIG.friendName.replace(/\s+/g, "-")}.pdf`);
  }

  function init() {
    render();
    document.getElementById("download-letter-btn")?.addEventListener("click", downloadPDF);
  }
  return { init, revealInk };
})();

/* ==================== SPOTIFY / MUSIC CARD ==================== */
const MusicPlayer = (() => {
  let spotifyController = null;
  let localAudio = null;
  let localAudioUrl = null;

  function updatePlayback(isPlaying) {
    const vinyl = document.getElementById("vinyl");
    const playBtn = document.getElementById("music-play-btn");
    const visualizer = document.querySelector(".visualizer-bars");
    vinyl?.classList.toggle("is-spinning", isPlaying);
    visualizer?.classList.toggle("is-playing", isPlaying);
    playBtn.textContent = isPlaying ? "Ⅱ" : "▶";
    playBtn.setAttribute("aria-label", `${isPlaying ? "Pause" : "Play"} Eppadi Vandhaayo`);
    SoundManager.setExternalPlayback(isPlaying);
  }

  function formatTime(milliseconds) {
    const seconds = Math.floor(Math.max(0, milliseconds) / 1000);
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  }

  function parseTimestamp(value) {
    const match = String(value).trim().match(/^(\d+):([0-5]\d)$/);
    return match ? Number(match[1]) * 60 + Number(match[2]) : null;
  }

  function updateSeekRange(positionMs, durationMs) {
    const seek = document.getElementById("music-seek");
    const currentTime = document.getElementById("music-current-time");
    const durationTime = document.getElementById("music-duration");
    if (!seek || !durationMs) return;
    seek.disabled = false;
    seek.dataset.duration = String(durationMs);
    if (durationTime) durationTime.textContent = formatTime(durationMs);
    if (currentTime) currentTime.textContent = formatTime(positionMs);
    if (document.activeElement !== seek) {
      seek.value = String(Math.round((positionMs / durationMs) * Number(seek.max)));
    }
  }

  function seekTo(seconds) {
    const duration = localAudio?.duration;
    const maxSeconds = Number.isFinite(duration) ? duration : Number(document.getElementById("music-seek")?.dataset.duration) / 1000;
    const seek = document.getElementById("music-seek");
    const status = document.getElementById("spotify-status");
    if (!Number.isFinite(maxSeconds) || seconds > maxSeconds) {
      if (status) status.textContent = `That timestamp is beyond the available track length (${formatTime(maxSeconds * 1000)}).`;
      return;
    }
    if (localAudio) localAudio.currentTime = seconds;
    else spotifyController?.seek(Math.floor(seconds));
    if (seek && maxSeconds) seek.value = String(Math.round((seconds / maxSeconds) * Number(seek.max)));
    const timestamp = document.getElementById("music-timestamp");
    if (timestamp) timestamp.value = formatTime(seconds * 1000);
  }

  function pauseSpotifySafely() {
    try {
      const result = spotifyController?.pause();
      result?.catch(() => {});
    } catch (error) {
      // The embed can reject pause requests before it has loaded a playable item.
    }
  }

  function init() {
    const embed = document.getElementById("spotify-embed");
    const playBtn = document.getElementById("music-play-btn");
    const seek = document.getElementById("music-seek");
    const currentTime = document.getElementById("music-current-time");
    const durationTime = document.getElementById("music-duration");
    const status = document.getElementById("spotify-status");
    const fullTrackLink = document.getElementById("spotify-full-track");
    const timestampInput = document.getElementById("music-timestamp");

    const titleEl = document.getElementById("now-playing-title");
    const artistEl = document.getElementById("now-playing-artist");
    if (titleEl) titleEl.textContent = SITE_CONFIG.nowPlaying.title;
    if (artistEl) artistEl.textContent = SITE_CONFIG.nowPlaying.artist;

    const trackId = SITE_CONFIG.spotifyEmbedUrl.match(/spotify\.com\/(?:embed\/)?track\/([A-Za-z0-9]+)/)?.[1];
    if (!embed || !trackId || !playBtn) return;
    if (fullTrackLink) fullTrackLink.href = `https://open.spotify.com/track/${trackId}`;

    function loadLocalAudio(source, name, isObjectUrl = false) {
      if (localAudio) localAudio.pause();
      if (localAudioUrl) URL.revokeObjectURL(localAudioUrl);
      localAudioUrl = isObjectUrl ? source : null;
      pauseSpotifySafely();
      localAudio = new Audio(source);
      localAudio.preload = "metadata";
      playBtn.disabled = true;
      localAudio.addEventListener("loadedmetadata", () => {
        updateSeekRange(0, localAudio.duration * 1000);
        timestampInput.disabled = false;
        playBtn.disabled = false;
        playBtn.setAttribute("aria-label", `Play ${SITE_CONFIG.nowPlaying.title}`);
        status.textContent = `Full track loaded: ${name}. Enter any mm:ss timestamp to jump.`;
      }, { once: true });
      localAudio.addEventListener("timeupdate", () => {
        updateSeekRange(localAudio.currentTime * 1000, localAudio.duration * 1000);
        if (document.activeElement !== timestampInput) timestampInput.value = formatTime(localAudio.currentTime * 1000);
      });
      localAudio.addEventListener("play", () => updatePlayback(true));
      localAudio.addEventListener("pause", () => updatePlayback(false));
      localAudio.addEventListener("ended", () => updatePlayback(false));
      localAudio.addEventListener("error", () => {
        localAudio = null;
        if (spotifyController) playBtn.disabled = false;
        status.textContent = "The local track could not be played. Use the Spotify player below.";
      });
      status.textContent = `Loading ${name}...`;
    }

    playBtn.addEventListener("click", () => {
      if (localAudio) {
        if (localAudio.paused) localAudio.play().catch(() => {});
        else localAudio.pause();
      } else spotifyController?.togglePlay();
    });

    seek.addEventListener("input", () => {
      const duration = Number(seek.dataset.duration);
      if (duration && currentTime) {
        currentTime.textContent = formatTime((Number(seek.value) / Number(seek.max)) * duration);
      }
    });
    seek.addEventListener("change", () => {
      const duration = Number(seek.dataset.duration);
      if (duration) seekTo((Number(seek.value) / Number(seek.max)) * duration / 1000);
    });
    const submitTimestamp = () => {
      const seconds = parseTimestamp(timestampInput.value);
      if (seconds === null) {
        status.textContent = "Enter a timestamp as minutes:seconds, for example 1:25.";
        return;
      }
      seekTo(seconds);
    };
    timestampInput.addEventListener("keydown", event => {
      if (event.key === "Enter") submitTimestamp();
    });
    loadLocalAudio("assets/audio/Eppadi%20Vandhaayo.mp3", "Eppadi Vandhaayo.mp3");

    window.onSpotifyIframeApiReady = IFrameAPI => {
      IFrameAPI.createController(embed, { uri: `spotify:track:${trackId}`, width: "100%", height: 152 }, controller => {
        spotifyController = controller;
        document.querySelector("#music iframe")?.setAttribute("title", `Spotify player: ${SITE_CONFIG.nowPlaying.title}`);
        controller.addListener("playback_update", event => {
          const state = event.data;
          if (localAudio) return;
          updatePlayback(!state.isPaused);
          const duration = Number(state.duration) || 0;
          if (duration) {
            updateSeekRange(state.position, duration);
            timestampInput.disabled = false;
            status.textContent = state.isPaused ? "Choose a position in the available track." : "Playing. Drag the slider to choose a position.";
          } else {
            seek.disabled = true;
            timestampInput.disabled = true;
            delete seek.dataset.duration;
            if (durationTime) durationTime.textContent = "--:--";
            status.textContent = "No seekable preview is available. Open Spotify to choose a point in the full track.";
          }
          if (currentTime) currentTime.textContent = formatTime(state.position);
        });
      });
    };

    const api = document.createElement("script");
    api.src = "https://open.spotify.com/embed/iframe-api/v1";
    api.async = true;
    api.onerror = () => { status.textContent = "Spotify could not load. Check your connection and try again."; };
    document.head.appendChild(api);
  }
  return { init };
})();
