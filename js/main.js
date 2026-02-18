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
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function setTextById(id, text) {
  const element = document.getElementById(id);
  if (element) {
    element.innerText = text;
  }
}


function formatCountdownDays(remainingDays) {
  return remainingDays === 0 ? "就在今天！" : `还有 ${remainingDays} 天`;
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
  const mayTwentyTarget = getNextBirthdayTarget(todayDate, 5, 20);
  const mayTwentyRemaining = Math.max(
    0,
    Math.round((mayTwentyTarget - todayDate) / MS_PER_DAY)
  );

  setTextById("countdown_valentine_days", formatCountdownDays(valentineRemaining));
  setTextById("countdown_valentine_target", `目标日期：${formatDate(valentineTarget)}`);
  setTextById("countdown_520_days", formatCountdownDays(mayTwentyRemaining));
  setTextById("countdown_520_target", `目标日期：${formatDate(mayTwentyTarget)}`);
  setTextById("countdown_anniversary_days", formatCountdownDays(anniversaryRemaining));
  setTextById("countdown_anniversary_target", `目标日期：${formatDate(anniversaryTarget)}`);
  setTextById("countdown_milestone_days", formatCountdownDays(milestoneRemaining));
  setTextById("countdown_milestone_target", `目标日期：${formatDate(milestoneTarget)}`);
  setTextById("countdown_lin_days", formatCountdownDays(linBirthdayRemaining));
  setTextById("countdown_lin_target", `目标日期：${formatDate(linBirthdayTarget)}`);
  setTextById("countdown_yu_days", formatCountdownDays(yuBirthdayRemaining));
  setTextById("countdown_yu_target", `目标日期：${formatDate(yuBirthdayTarget)}`);
}

function openImagePreview(src, alt) {
  const overlay = document.createElement("div");
  overlay.className = "preview-overlay";
  overlay.innerHTML = `
    <div class="preview-box">
      <img src="${src}" alt="${alt}">
      <span class="close-btn" aria-label="鍏抽棴棰勮">&times;</span>
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

  dotsContainer.innerHTML = "";

  const originals = Array.from(track.querySelectorAll("img"));
  if (!originals.length) return;

  const cloneBatch = originals.map((img) => {
    const copy = img.cloneNode(true);
    copy.setAttribute("data-carousel-clone", "true");
    return copy;
  });
  cloneBatch.forEach((node) => track.appendChild(node));

  let oneBatchWidth = 0;
  let posX = 0;
  let rafId = 0;
  let lastTs = 0;
  let paused = false;
  let lastViewportWidth = window.innerWidth || 0;
  let lastCarouselWidth = carousel.getBoundingClientRect().width || 0;
  let suppressClickUntil = 0;
  let touchActive = false;
  let touchId = -1;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchLastX = 0;
  let touchLastY = 0;
  let touchDragging = false;
  let touchHorizontal = false;

  const speedPxPerSec = 12;
  const gestureLockThresholdPx = 6;
  const swipeTriggerPx = 10;

  function normalizePosX() {
    if (oneBatchWidth <= 0) return;
    const wrapped = ((posX % oneBatchWidth) + oneBatchWidth) % oneBatchWidth;
    posX = wrapped === 0 ? -oneBatchWidth : wrapped - oneBatchWidth;
  }

  function findTouchById(touchList, id) {
    for (let i = 0; i < touchList.length; i += 1) {
      if (touchList[i].identifier === id) {
        return touchList[i];
      }
    }
    return null;
  }

  function syncCardWidthWithNavCards() {
    const firstNavCard = document.querySelector(".nav-cards .card");
    if (!(firstNavCard instanceof HTMLElement)) return;
    const navCardWidth = firstNavCard.getBoundingClientRect().width;
    if (navCardWidth > 0) {
      carousel.style.setProperty("--carousel-card-width", `${Math.round(navCardWidth)}px`);
    }
  }

  function measure(options = {}) {
    const { preserveProgress = false } = options;
    const previousBatchWidth = oneBatchWidth;
    const previousPosX = posX;

    syncCardWidthWithNavCards();
    oneBatchWidth = originals.reduce((sum, img) => sum + img.getBoundingClientRect().width, 0);
    const style = window.getComputedStyle(track);
    const gap = Number.parseFloat(style.columnGap || style.gap || "0") || 0;
    if (originals.length > 0) {
      oneBatchWidth += gap * originals.length;
    }
    if (preserveProgress && previousBatchWidth > 0 && oneBatchWidth > 0) {
      const passed = ((-previousPosX % previousBatchWidth) + previousBatchWidth) % previousBatchWidth;
      const progress = passed / previousBatchWidth;
      posX = -progress * oneBatchWidth;
      if (posX >= 0) {
        posX -= oneBatchWidth;
      }
    } else {
      posX = -oneBatchWidth;
    }
    track.style.transform = `translate3d(${posX}px, 0, 0)`;
    lastViewportWidth = window.innerWidth || 0;
    lastCarouselWidth = carousel.getBoundingClientRect().width || 0;
  }

  originals.forEach((img) => {
    if (!img.complete) {
      img.addEventListener("load", measure, { once: true });
    }
  });

  function tick(ts) {
    if (!lastTs) lastTs = ts;
    const delta = (ts - lastTs) / 1000;
    lastTs = ts;

    if (!paused && oneBatchWidth > 0) {
      posX += speedPxPerSec * delta;
      normalizePosX();
      track.style.transform = `translate3d(${posX}px, 0, 0)`;
    }
    rafId = requestAnimationFrame(tick);
  }

  track.addEventListener("click", (event) => {
    if (Date.now() < suppressClickUntil) {
      event.preventDefault();
      return;
    }
    const target = event.target;
    if (!(target instanceof HTMLImageElement)) return;
    const originalSrc = target.getAttribute("src");
    if (!originalSrc) return;
    openImagePreview(originalSrc, target.getAttribute("alt") || "Preview");
  });

  carousel.addEventListener("mouseenter", () => {
    paused = true;
  });
  carousel.addEventListener("mouseleave", () => {
    paused = false;
  });
  carousel.addEventListener("touchstart", (event) => {
    if (!event.changedTouches.length || touchActive) return;
    const touch = event.changedTouches[0];
    touchActive = true;
    touchId = touch.identifier;
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchLastX = touch.clientX;
    touchLastY = touch.clientY;
    touchDragging = false;
    touchHorizontal = false;
    paused = true;
  }, { passive: true });

  carousel.addEventListener("touchmove", (event) => {
    if (!touchActive) return;
    const touch = findTouchById(event.changedTouches, touchId) || findTouchById(event.touches, touchId);
    if (!touch) return;

    const nextX = touch.clientX;
    const nextY = touch.clientY;
    const totalX = nextX - touchStartX;
    const totalY = nextY - touchStartY;

    if (!touchDragging) {
      if (Math.abs(totalX) < gestureLockThresholdPx && Math.abs(totalY) < gestureLockThresholdPx) return;
      touchDragging = true;
      touchHorizontal = Math.abs(totalX) > Math.abs(totalY);
    }

    const deltaX = nextX - touchLastX;
    touchLastX = nextX;
    touchLastY = nextY;

    if (!touchHorizontal) return;
    if (oneBatchWidth > 0 && deltaX !== 0) {
      posX += deltaX;
      normalizePosX();
      track.style.transform = `translate3d(${posX}px, 0, 0)`;
    }
    event.preventDefault();
  }, { passive: false });

  const finishTouchDrag = (event) => {
    if (!touchActive) return;
    const touch = findTouchById(event.changedTouches, touchId);
    if (!touch) return;

    const movedX = Math.abs(touch.clientX - touchStartX);
    if (touchDragging && touchHorizontal && movedX >= swipeTriggerPx) {
      suppressClickUntil = Date.now() + 260;
    }

    touchActive = false;
    touchId = -1;
    touchDragging = false;
    touchHorizontal = false;
    paused = false;
  };

  carousel.addEventListener("touchend", finishTouchDrag, { passive: true });
  carousel.addEventListener("touchcancel", finishTouchDrag, { passive: true });

  let resizeTimer = 0;
  const onResize = () => {
    if (resizeTimer) {
      clearTimeout(resizeTimer);
    }
    resizeTimer = window.setTimeout(() => {
      const nextViewportWidth = window.innerWidth || 0;
      const nextCarouselWidth = carousel.getBoundingClientRect().width || 0;
      const viewportWidthChanged = Math.abs(nextViewportWidth - lastViewportWidth) > 1;
      const carouselWidthChanged = Math.abs(nextCarouselWidth - lastCarouselWidth) > 1;
      if (!viewportWidthChanged && !carouselWidthChanged) return;
      measure({ preserveProgress: true });
    }, 120);
  };

  window.addEventListener("resize", onResize);

  measure();
  rafId = requestAnimationFrame(tick);
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
      const response = await fetch("data/music.json", { cache: "no-store" });
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
    const playIconSvg = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 6l10 6-10 6z"></path></svg>';
    const pauseIconSvg = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 6h3v12H8zM13 6h3v12h-3z"></path></svg>';
    playPauseBtn.innerHTML = music.paused ? playIconSvg : pauseIconSvg;
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
  themeToggle.textContent = isNightMode ? "🌙" : "☀️";
}

function forceThemeLayerRepaint() {
  const isMobileViewport = window.matchMedia("(max-width: 720px)").matches;
  const isTouchDevice = window.matchMedia("(pointer: coarse)").matches || (navigator.maxTouchPoints || 0) > 0;
  if (!isMobileViewport && !isTouchDevice) return;

  const layers = document.querySelectorAll(".stars, .moon, .day-decor");
  layers.forEach((layer) => {
    if (!(layer instanceof HTMLElement)) return;
    layer.style.willChange = "opacity, transform";
    void layer.offsetHeight;
  });

  requestAnimationFrame(() => {
    layers.forEach((layer) => {
      if (layer instanceof HTMLElement) {
        layer.style.willChange = "";
      }
    });
  });
}

function applyTheme(theme) {
  const isNightMode = theme === "night";
  document.body.classList.toggle("theme-night", isNightMode);
  updateThemeButtonLabel(isNightMode);
  forceThemeLayerRepaint();
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


