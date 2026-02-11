(function () {
  const STATE_KEY = "global_bgm_state_v1";
  const PLAYLIST_PATH = "data/music-playlist.json";

  function injectStyle() {
    if (document.getElementById("global-music-style")) return;
    const style = document.createElement("style");
    style.id = "global-music-style";
    style.textContent = `
      .global-music-tools {
        position: fixed;
        right: 12px;
        bottom: 12px;
        z-index: 1200;
      }
      .global-music-btn {
        width: 30px;
        height: 30px;
        border: none;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.72);
        color: #664680;
        font-size: 0.9rem;
        line-height: 1;
        cursor: pointer;
        opacity: 0.82;
      }
      .global-music-btn.playing {
        opacity: 1;
      }
      .global-music-panel {
        position: fixed;
        right: 12px;
        bottom: 48px;
        width: 160px;
        padding: 8px;
        border-radius: 12px;
        border: 1px solid rgba(199, 162, 227, 0.65);
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(6px);
        box-shadow: 0 8px 18px rgba(160, 99, 132, 0.18);
        z-index: 1200;
      }
      .global-music-panel[hidden] {
        display: none !important;
      }
      .global-music-track {
        font-size: 0.75rem;
        color: #5b3b74;
        margin-bottom: 7px;
        width: 100%;
        height: 20px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      .global-music-controls {
        display: flex;
        justify-content: space-between;
        gap: 6px;
      }
      .global-music-controls button {
        flex: 1;
        border: 1px solid rgba(198, 165, 224, 0.7);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.9);
        color: #5a3a74;
        font-size: 0.9rem;
        line-height: 1;
        padding: 7px 0;
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);
  }

  function ensureElements() {
    let panel = document.getElementById("musicPanel");
    let trackName = document.getElementById("musicTrackName");
    let prevBtn = document.getElementById("musicPrev");
    let playPauseBtn = document.getElementById("musicPlayPause");
    let nextBtn = document.getElementById("musicNext");
    let musicToggle = document.getElementById("musicToggle");
    let music = document.getElementById("ourMusic");

    if (!panel) {
      panel = document.createElement("div");
      panel.id = "musicPanel";
      panel.className = "music-panel global-music-panel";
      panel.hidden = true;
      panel.innerHTML = `
        <p id="musicTrackName" class="music-track-name global-music-track">未播放</p>
        <div class="music-controls global-music-controls">
          <button id="musicPrev" type="button" aria-label="上一首">⏮</button>
          <button id="musicPlayPause" type="button" aria-label="播放或暂停">▶</button>
          <button id="musicNext" type="button" aria-label="下一首">⏭</button>
        </div>
      `;
      document.body.appendChild(panel);
      trackName = panel.querySelector("#musicTrackName");
      prevBtn = panel.querySelector("#musicPrev");
      playPauseBtn = panel.querySelector("#musicPlayPause");
      nextBtn = panel.querySelector("#musicNext");
    }

    if (!musicToggle) {
      let tools = document.querySelector(".corner-tools");
      if (!tools) {
        tools = document.createElement("div");
        tools.className = "corner-tools global-music-tools";
        document.body.appendChild(tools);
      }
      musicToggle = document.createElement("button");
      musicToggle.id = "musicToggle";
      musicToggle.className = "music-fab global-music-btn";
      musicToggle.type = "button";
      musicToggle.setAttribute("aria-label", "展开音乐控制");
      musicToggle.setAttribute("aria-expanded", "false");
      musicToggle.textContent = "🎵";
      tools.appendChild(musicToggle);
    }

    if (!music) {
      music = document.createElement("audio");
      music.id = "ourMusic";
      music.preload = "none";
      music.loop = false;
      document.body.appendChild(music);
    }

    return { panel, trackName, prevBtn, playPauseBtn, nextBtn, musicToggle, music };
  }

  function readState() {
    try {
      const raw = localStorage.getItem(STATE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;
      return parsed;
    } catch (_) {
      return null;
    }
  }

  function writeState(state) {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch (_) {}
  }

  async function loadPlaylist(audio) {
    try {
      const response = await fetch(PLAYLIST_PATH, { cache: "no-store" });
      if (!response.ok) throw new Error("playlist load failed");
      const payload = await response.json();
      if (!Array.isArray(payload)) throw new Error("playlist invalid");
      const playlist = payload
        .map((item) => ({
          src: typeof item.src === "string" ? item.src : "",
          name: typeof item.name === "string" ? item.name : "未命名歌曲",
          artist: typeof item.artist === "string" ? item.artist : "未知作者"
        }))
        .filter((item) => item.src);
      if (playlist.length) return playlist;
      throw new Error("playlist empty");
    } catch (_) {
      const source = audio.querySelector("source");
      const fallbackSrc = source ? source.getAttribute("src") : "";
      if (!fallbackSrc) return [];
      return [{ src: fallbackSrc, name: "未命名歌曲", artist: "未知作者" }];
    }
  }

  function syncPlayPauseIcon(audio, playPauseBtn, musicToggle) {
    playPauseBtn.textContent = audio.paused ? "▶" : "⏸";
    musicToggle.classList.toggle("playing", !audio.paused);
  }

  async function init() {
    injectStyle();
    const { panel, trackName, prevBtn, playPauseBtn, nextBtn, musicToggle, music } = ensureElements();

    const playlist = await loadPlaylist(music);
    if (!playlist.length) return;
    music.volume = 0.55;

    let currentIndex = 0;
    let saveTimer = null;

    const saved = readState();
    if (saved && Number.isInteger(saved.index)) {
      currentIndex = ((saved.index % playlist.length) + playlist.length) % playlist.length;
    }

    function currentTrack() {
      return playlist[currentIndex];
    }

    function renderTrackName() {
      const track = currentTrack();
      trackName.textContent = `${track.name} - ${track.artist}`;
    }

    function saveState() {
      writeState({
        index: currentIndex,
        time: Number.isFinite(music.currentTime) ? music.currentTime : 0,
        isPlaying: !music.paused,
        updatedAt: Date.now()
      });
    }

    function scheduleSave() {
      if (saveTimer) return;
      saveTimer = setTimeout(() => {
        saveTimer = null;
        saveState();
      }, 250);
    }

    async function loadTrack(index, options = {}) {
      const { autoPlay = false, seekTime = 0 } = options;
      currentIndex = ((index % playlist.length) + playlist.length) % playlist.length;
      const track = currentTrack();
      music.src = track.src;
      renderTrackName();
      music.load();

      const applySeek = () => {
        if (seekTime > 0 && Number.isFinite(seekTime)) {
          try {
            music.currentTime = seekTime;
          } catch (_) {}
        }
      };

      if (seekTime > 0) {
        music.addEventListener("loadedmetadata", applySeek, { once: true });
      }

      if (autoPlay) {
        try {
          await music.play();
        } catch (_) {}
      }
      syncPlayPauseIcon(music, playPauseBtn, musicToggle);
      saveState();
    }

    musicToggle.addEventListener("click", () => {
      const willOpen = panel.hidden;
      panel.hidden = !willOpen;
      musicToggle.setAttribute("aria-expanded", String(willOpen));
    });

    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (!panel.contains(target) && !musicToggle.contains(target)) {
        panel.hidden = true;
        musicToggle.setAttribute("aria-expanded", "false");
      }
    });

    playPauseBtn.addEventListener("click", async () => {
      if (music.paused) {
        try {
          await music.play();
        } catch (_) {}
      } else {
        music.pause();
      }
      syncPlayPauseIcon(music, playPauseBtn, musicToggle);
      saveState();
    });

    prevBtn.addEventListener("click", () => {
      loadTrack(currentIndex - 1, { autoPlay: !music.paused });
    });

    nextBtn.addEventListener("click", () => {
      loadTrack(currentIndex + 1, { autoPlay: !music.paused });
    });

    music.addEventListener("play", () => {
      syncPlayPauseIcon(music, playPauseBtn, musicToggle);
      saveState();
    });
    music.addEventListener("pause", () => {
      syncPlayPauseIcon(music, playPauseBtn, musicToggle);
      saveState();
    });
    music.addEventListener("timeupdate", scheduleSave);
    music.addEventListener("ended", () => loadTrack(currentIndex + 1, { autoPlay: true }));
    window.addEventListener("beforeunload", saveState);

    const initialTime = saved && typeof saved.time === "number" ? saved.time : 0;
    const shouldPlay = Boolean(saved && saved.isPlaying);
    await loadTrack(currentIndex, { autoPlay: shouldPlay, seekTime: initialTime });

    if (shouldPlay && music.paused) {
      const unlock = async () => {
        try {
          await music.play();
        } catch (_) {}
        if (!music.paused) {
          document.removeEventListener("pointerdown", unlock);
          document.removeEventListener("keydown", unlock);
          saveState();
        }
      };
      document.addEventListener("pointerdown", unlock, { passive: true });
      document.addEventListener("keydown", unlock, { passive: true });
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
