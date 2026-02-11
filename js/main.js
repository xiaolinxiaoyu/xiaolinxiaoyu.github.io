const startDate = new Date(2025, 10, 25, 0, 0, 0);
const SECONDS_PER_DAY = 24 * 60 * 60;
const MS_PER_DAY = SECONDS_PER_DAY * 1000;
const MANUAL_THEME_KEY = "manual_home_theme";
const MANUAL_THEME_EXPIRES_KEY = "manual_home_theme_expires_at";
let autoThemeTimerId = null;

const beijingTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  hour12: false,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit"
});

function getTodayDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function getTogetherDays(todayDate) {
  return Math.floor((todayDate - startDate) / MS_PER_DAY);
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
}

function setTextById(id, text) {
  const element = document.getElementById(id);
  if (element) {
    element.innerText = text;
  }
}

function updateTogetherTime() {
  const now = new Date();
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = getTogetherDays(todayDate);

  const totalSeconds = Math.floor((now - startDate) / 1000);
  let remainder = totalSeconds - days * SECONDS_PER_DAY;
  remainder = ((remainder % SECONDS_PER_DAY) + SECONDS_PER_DAY) % SECONDS_PER_DAY;

  const hours = Math.floor(remainder / 3600);
  const minutes = Math.floor((remainder % 3600) / 60);
  const seconds = remainder % 60;

  setTextById("days", `已经在一起 ${days} 天啦 💕`);
  setTextById("time_detail", `${days}天 ${hours}小时 ${minutes}分钟 ${seconds}秒`);
}

function getNextBirthdayTarget(todayDate, month, day) {
  const currentYear = todayDate.getFullYear();
  let target = new Date(currentYear, month - 1, day);
  if (target < todayDate) {
    target = new Date(currentYear + 1, month - 1, day);
  }
  return target;
}

function updateCountdowns() {
  const todayDate = getTodayDate();
  const togetherDays = getTogetherDays(todayDate);

  const nextMilestone = (Math.floor(togetherDays / 100) + 1) * 100;
  const milestoneTarget = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate() + nextMilestone
  );
  const milestoneRemaining = Math.max(
    0,
    Math.round((milestoneTarget - todayDate) / MS_PER_DAY)
  );

  const anniversaryTarget = getNextBirthdayTarget(todayDate, 11, 25);
  const anniversaryRemaining = Math.max(
    0,
    Math.round((anniversaryTarget - todayDate) / MS_PER_DAY)
  );

  const linBirthdayTarget = getNextBirthdayTarget(todayDate, 5, 18);
  const linBirthdayRemaining = Math.max(
    0,
    Math.round((linBirthdayTarget - todayDate) / MS_PER_DAY)
  );

  const yuBirthdayTarget = getNextBirthdayTarget(todayDate, 1, 4);
  const yuBirthdayRemaining = Math.max(
    0,
    Math.round((yuBirthdayTarget - todayDate) / MS_PER_DAY)
  );
  const valentineTarget = getNextBirthdayTarget(todayDate, 2, 14);
  const valentineRemaining = Math.max(
    0,
    Math.round((valentineTarget - todayDate) / MS_PER_DAY)
  );

  setTextById("countdown_valentine_days", `还有 ${valentineRemaining} 天`);
  setTextById("countdown_valentine_target", `目标日期：${formatDate(valentineTarget)}`);
  setTextById("countdown_anniversary_days", `还有 ${anniversaryRemaining} 天`);
  setTextById("countdown_anniversary_target", `目标日期：${formatDate(anniversaryTarget)}`);
  setTextById(
    "countdown_milestone_days",
    `还有 ${milestoneRemaining} 天（第 ${nextMilestone} 天）`
  );
  setTextById("countdown_milestone_target", `目标日期：${formatDate(milestoneTarget)}`);
  setTextById("countdown_lin_days", `还有 ${linBirthdayRemaining} 天`);
  setTextById("countdown_lin_target", `目标日期：${formatDate(linBirthdayTarget)}`);
  setTextById("countdown_yu_days", `还有 ${yuBirthdayRemaining} 天`);
  setTextById("countdown_yu_target", `目标日期：${formatDate(yuBirthdayTarget)}`);
}

function openImagePreview(src, alt) {
  const overlay = document.createElement("div");
  overlay.className = "preview-overlay";
  overlay.innerHTML = `
    <div class="preview-box">
      <img src="${src}" alt="${alt}">
      <span class="close-btn" aria-label="关闭预览">&times;</span>
    </div>
  `;

  const close = () => {
    if (overlay.parentNode) {
      document.body.removeChild(overlay);
    }
  };

  overlay.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.classList.contains("preview-overlay") || target.classList.contains("close-btn")) {
      close();
    }
  });

  document.body.appendChild(overlay);
}

function initCarousel() {
  const carousel = document.getElementById("photoCarousel");
  const track = document.getElementById("carouselTrack");
  const dotsContainer = document.getElementById("carouselDots");
  if (!carousel || !track || !dotsContainer) return;

  const slides = Array.from(track.querySelectorAll("img"));
  if (slides.length <= 1) return;

  let currentIndex = 0;
  let timer = null;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchDeltaX = 0;
  let isSwiping = false;
  let suppressClick = false;

  slides.forEach((_, index) => {
    const dot = document.createElement("span");
    dot.addEventListener("click", () => {
      currentIndex = index;
      render();
      restart();
    });
    dotsContainer.appendChild(dot);
  });

  const dots = Array.from(dotsContainer.children);

  function render() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === currentIndex);
    });
  }

  function goTo(index, shouldRestart = false) {
    currentIndex = (index + slides.length) % slides.length;
    render();
    if (shouldRestart) {
      restart();
    }
  }

  function next(shouldRestart = false) {
    goTo(currentIndex + 1, shouldRestart);
  }

  function prev(shouldRestart = false) {
    goTo(currentIndex - 1, shouldRestart);
  }

  function start() {
    clearInterval(timer);
    timer = setInterval(() => {
      next(false);
    }, 6000);
  }

  function restart() {
    start();
  }

  slides.forEach((slide) => {
    slide.addEventListener("click", () => {
      if (suppressClick) {
        suppressClick = false;
        return;
      }
      const originalSrc = slide.getAttribute("src");
      if (originalSrc) {
        openImagePreview(originalSrc, slide.getAttribute("alt") || "Preview");
      }
    });
  });

  track.addEventListener("mouseenter", () => clearInterval(timer));
  track.addEventListener("mouseleave", () => start());

  carousel.addEventListener(
    "touchstart",
    (event) => {
      const touch = event.touches[0];
      if (!touch) return;
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchDeltaX = 0;
      isSwiping = false;
      clearInterval(timer);
    },
    { passive: true }
  );

  carousel.addEventListener(
    "touchmove",
    (event) => {
      const touch = event.touches[0];
      if (!touch) return;
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      touchDeltaX = deltaX;
      if (Math.abs(deltaX) > 10 && Math.abs(deltaX) > Math.abs(deltaY)) {
        isSwiping = true;
      }
    },
    { passive: true }
  );

  carousel.addEventListener(
    "touchend",
    () => {
      const swipeThreshold = 36;
      if (isSwiping && Math.abs(touchDeltaX) >= swipeThreshold) {
        suppressClick = true;
        if (touchDeltaX < 0) {
          next(true);
        } else {
          prev(true);
        }
      } else {
        start();
      }

      touchDeltaX = 0;
      isSwiping = false;
    },
    { passive: true }
  );

  render();
  start();
}

function initMusic() {
  const music = document.getElementById("ourMusic");
  const panel = document.getElementById("musicPanel");
  const trackName = document.getElementById("musicTrackName");
  const prevBtn = document.getElementById("musicPrev");
  const playPauseBtn = document.getElementById("musicPlayPause");
  const nextBtn = document.getElementById("musicNext");
  const musicToggle = document.getElementById("musicToggle");

  if (!music || !musicToggle || !panel || !trackName || !prevBtn || !playPauseBtn || !nextBtn) return;

  music.volume = 0.55;
  music.loop = false;
  let playlist = [];
  let currentIndex = 0;
  let recentErrorCount = 0;

  function getDefaultPlaylist() {
    const source = music.querySelector("source");
    const sourceSrc = source ? source.getAttribute("src") : "";
    if (!sourceSrc) return [];
    return [{ src: sourceSrc, name: "未命名歌曲", artist: "未知作者" }];
  }

  async function loadPlaylistData() {
    try {
      const response = await fetch("data/music-playlist.json", { cache: "no-store" });
      if (!response.ok) throw new Error("playlist load failed");
      const payload = await response.json();
      if (!Array.isArray(payload)) throw new Error("playlist is not array");

      playlist = payload
        .map((item) => ({
          src: typeof item.src === "string" ? item.src : "",
          name: typeof item.name === "string" ? item.name : "未命名歌曲",
          artist: typeof item.artist === "string" ? item.artist : "未知作者"
        }))
        .filter((item) => item.src);

      if (!playlist.length) throw new Error("playlist is empty");
    } catch (_) {
      playlist = getDefaultPlaylist();
    }
  }

  function syncPlayPauseIcon() {
    playPauseBtn.textContent = music.paused ? "▶" : "⏸";
  }

  function renderTrackNameLine(text) {
    const line = document.createElement("div");
    line.className = "music-track-line";
    const content = document.createElement("span");
    content.className = "music-track-line-text";
    content.textContent = text || "";
    line.appendChild(content);
    return { line, content };
  }

  function updateTrackTitle(name, artist) {
    trackName.innerHTML = "";
    const mergedText = `${name} - ${artist}`;
    const mergedLine = renderTrackNameLine(mergedText);
    trackName.appendChild(mergedLine.line);

    requestAnimationFrame(() => {
      const { line, content } = mergedLine;
      line.classList.remove("marquee");
      const distance = content.scrollWidth - line.clientWidth;
      if (distance > 2) {
        line.style.setProperty("--marquee-distance", `${distance + 16}px`);
        line.style.setProperty("--marquee-duration", `${Math.max(9, (distance + 16) / 10)}s`);
        line.classList.add("marquee");
      } else {
        line.style.removeProperty("--marquee-distance");
        line.style.removeProperty("--marquee-duration");
      }
    });
  }

  async function loadTrack(index, autoPlay = false) {
    if (!playlist.length) return;

    currentIndex = (index + playlist.length) % playlist.length;
    const currentTrack = playlist[currentIndex];
    music.src = currentTrack.src;
    updateTrackTitle(currentTrack.name, currentTrack.artist);
    music.load();

    if (autoPlay) {
      try {
        await music.play();
      } catch (_) {
        music.pause();
      }
    }
    syncPlayPauseIcon();
  }

  musicToggle.addEventListener("click", () => {
    const willOpen = panel.hidden;
    panel.hidden = !willOpen;
    musicToggle.setAttribute("aria-expanded", String(willOpen));
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Node)) return;
    const clickedInsidePanel = panel.contains(target);
    const clickedToggle = musicToggle.contains(target);
    if (!clickedInsidePanel && !clickedToggle) {
      panel.hidden = true;
      musicToggle.setAttribute("aria-expanded", "false");
    }
  });

  playPauseBtn.addEventListener("click", async () => {
    try {
      if (music.paused) {
        await music.play();
        musicToggle.classList.add("playing");
      } else {
        music.pause();
        musicToggle.classList.remove("playing");
      }
      syncPlayPauseIcon();
    } catch (_) {
      musicToggle.classList.remove("playing");
      syncPlayPauseIcon();
    }
  });

  prevBtn.addEventListener("click", () => {
    if (!playlist.length) return;
    const autoPlay = !music.paused;
    loadTrack(currentIndex - 1, autoPlay);
    if (autoPlay) musicToggle.classList.add("playing");
  });

  nextBtn.addEventListener("click", () => {
    if (!playlist.length) return;
    const autoPlay = !music.paused;
    loadTrack(currentIndex + 1, autoPlay);
    if (autoPlay) musicToggle.classList.add("playing");
  });

  music.addEventListener("ended", () => {
    if (!playlist.length) return;
    loadTrack(currentIndex + 1, true);
    musicToggle.classList.add("playing");
  });

  music.addEventListener("play", () => {
    musicToggle.classList.add("playing");
    syncPlayPauseIcon();
  });

  music.addEventListener("pause", () => {
    musicToggle.classList.remove("playing");
    syncPlayPauseIcon();
  });

  music.addEventListener("error", () => {
    if (!playlist.length) return;
    recentErrorCount += 1;
    if (recentErrorCount >= playlist.length) {
      recentErrorCount = 0;
      music.pause();
      return;
    }
    loadTrack(currentIndex + 1, true);
  });

  loadPlaylistData().then(async () => {
    await loadTrack(0, true);
    if (music.paused) {
      musicToggle.classList.remove("playing");
      syncPlayPauseIcon();
    }
  });

  const unlockEvents = ["pointerdown", "touchstart", "keydown"];
  const tryForcePlayFirstTrack = async () => {
    if (!playlist.length) return;
    if (!music.src) {
      await loadTrack(0, false);
    }
    if (music.paused) {
      try {
        await music.play();
        musicToggle.classList.add("playing");
        syncPlayPauseIcon();
      } catch (_) {
        musicToggle.classList.remove("playing");
        syncPlayPauseIcon();
      }
    }
  };

  unlockEvents.forEach((eventName) => {
    const handler = async () => {
      await tryForcePlayFirstTrack();
      if (!music.paused) {
        unlockEvents.forEach((name) => {
          document.removeEventListener(name, handler);
        });
      }
    };
    document.addEventListener(eventName, handler, { passive: true });
  });
}

function updateThemeButtonLabel(isNightMode) {
  const themeToggle = document.getElementById("themeToggle");
  if (!themeToggle) return;
  themeToggle.textContent = isNightMode ? "☀️" : "🌙";
}

function applyTheme(theme) {
  const isNightMode = theme === "night";
  document.body.classList.toggle("theme-night", isNightMode);
  updateThemeButtonLabel(isNightMode);
}

function getBeijingTimeParts() {
  const parts = beijingTimeFormatter.formatToParts(new Date());
  const valueMap = {};
  parts.forEach((part) => {
    if (part.type !== "literal") {
      valueMap[part.type] = Number(part.value);
    }
  });

  return {
    hour: valueMap.hour || 0,
    minute: valueMap.minute || 0,
    second: valueMap.second || 0
  };
}

function getAutoThemeByBeijingTime() {
  const { hour, minute } = getBeijingTimeParts();
  const totalMinutes = hour * 60 + minute;
  const nightStartMinutes = 18 * 60 + 30;
  const dayStartMinutes = 6 * 60 + 30;
  return totalMinutes >= nightStartMinutes || totalMinutes < dayStartMinutes ? "night" : "day";
}

function getMillisecondsUntilNextSwitch() {
  const { hour, minute, second } = getBeijingTimeParts();
  const totalSeconds = hour * 3600 + minute * 60 + second;
  const dayStartSeconds = (6 * 60 + 30) * 60;
  const nightStartSeconds = (18 * 60 + 30) * 60;
  let targetSeconds;

  if (totalSeconds < dayStartSeconds) {
    targetSeconds = dayStartSeconds;
  } else if (totalSeconds < nightStartSeconds) {
    targetSeconds = nightStartSeconds;
  } else {
    targetSeconds = dayStartSeconds + 24 * 3600;
  }

  return Math.max((targetSeconds - totalSeconds) * 1000, 1000);
}

function scheduleAutoThemeSwitch() {
  if (autoThemeTimerId) {
    clearTimeout(autoThemeTimerId);
  }

  const delay = getMillisecondsUntilNextSwitch() + 300;
  autoThemeTimerId = setTimeout(() => {
    applyCurrentTheme();
    scheduleAutoThemeSwitch();
  }, delay);
}

function getManualThemeOverride() {
  const manualTheme = localStorage.getItem(MANUAL_THEME_KEY);
  const expiresAt = Number(localStorage.getItem(MANUAL_THEME_EXPIRES_KEY));

  if (!manualTheme || Number.isNaN(expiresAt)) return null;
  if (Date.now() >= expiresAt) {
    localStorage.removeItem(MANUAL_THEME_KEY);
    localStorage.removeItem(MANUAL_THEME_EXPIRES_KEY);
    return null;
  }
  return manualTheme;
}

function setManualThemeOverride(theme) {
  const expiresAt = Date.now() + getMillisecondsUntilNextSwitch();
  localStorage.setItem(MANUAL_THEME_KEY, theme);
  localStorage.setItem(MANUAL_THEME_EXPIRES_KEY, String(expiresAt));
}

function applyCurrentTheme() {
  const manualTheme = getManualThemeOverride();
  if (manualTheme) {
    applyTheme(manualTheme);
    return;
  }
  applyTheme(getAutoThemeByBeijingTime());
}

function initTheme() {
  applyCurrentTheme();

  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isNightMode = document.body.classList.contains("theme-night");
      const nextTheme = isNightMode ? "day" : "night";
      applyTheme(nextTheme);
      setManualThemeOverride(nextTheme);
      scheduleAutoThemeSwitch();
    });
  }

  scheduleAutoThemeSwitch();

  setInterval(applyCurrentTheme, 60 * 1000);

  const syncThemeWhenActive = () => {
    applyCurrentTheme();
    scheduleAutoThemeSwitch();
  };

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      syncThemeWhenActive();
    }
  });
  window.addEventListener("focus", syncThemeWhenActive);
}

updateTogetherTime();
updateCountdowns();
initCarousel();
initMusic();
initTheme();
setInterval(updateTogetherTime, 1000);
setInterval(updateCountdowns, 60 * 1000);
