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


function isSameCalendarDate(dateA, dateB) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

function formatRemainingTime(remainingMs) {
  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}小时${minutes}分${seconds}秒`;
}

function formatCountdownToTarget(targetDate, now) {
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (isSameCalendarDate(todayDate, targetDate)) {
    return "就在今天！";
  }

  const remainingMs = targetDate - now;
  if (remainingMs > 0 && remainingMs < MS_PER_DAY) {
    return formatRemainingTime(remainingMs);
  }

  const remainingDays = Math.max(0, Math.round((targetDate - todayDate) / MS_PER_DAY));
  return `还有 ${remainingDays} 天`;
}

function getMilestoneInfo(todayDate) {
  const togetherDays = getTogetherDays(todayDate);
  const normalizedDays = Math.max(0, togetherDays);
  const isMilestoneToday = normalizedDays > 0 && normalizedDays % 100 === 0;
  const milestoneDay = isMilestoneToday
    ? normalizedDays
    : (Math.floor(normalizedDays / 100) + 1) * 100;
  const milestoneTarget = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate() + milestoneDay
  );

  return {
    milestoneDay,
    milestoneTarget,
    isMilestoneToday
  };
}

function startMilestoneFireworks(overlay) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return () => {};
  }

  const layer = document.createElement("div");
  layer.className = "milestone-fireworks-layer";
  layer.setAttribute("aria-hidden", "true");
  overlay.appendChild(layer);

  const colors = ["#ffd166", "#ff7eb6", "#7bdff2", "#c9ff7b", "#ff9f68", "#d7a6ff"];
  const timeoutIds = [];
  let burstTimerId = null;
  let burstCount = 0;
  const maxBursts = 7;

  const createBurst = () => {
    const burst = document.createElement("div");
    burst.className = "milestone-firework-burst";
    burst.style.left = `${18 + Math.random() * 64}%`;
    burst.style.top = `${12 + Math.random() * 44}%`;
    layer.appendChild(burst);

    const particleCount = 14;
    for (let i = 0; i < particleCount; i += 1) {
      const particle = document.createElement("span");
      particle.className = "milestone-firework-particle";
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.22;
      const distance = 48 + Math.random() * 62;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;

      particle.style.setProperty("--dx", `${dx}px`);
      particle.style.setProperty("--dy", `${dy}px`);
      particle.style.setProperty("--firework-color", colors[Math.floor(Math.random() * colors.length)]);
      particle.style.setProperty("--particle-delay", `${Math.random() * 0.06}s`);
      burst.appendChild(particle);
    }

    const removeId = window.setTimeout(() => {
      if (burst.parentNode) burst.parentNode.removeChild(burst);
    }, 1050);
    timeoutIds.push(removeId);
  };

  createBurst();
  burstTimerId = window.setInterval(() => {
    burstCount += 1;
    createBurst();
    if (burstCount >= maxBursts) {
      window.clearInterval(burstTimerId);
      burstTimerId = null;
    }
  }, 520);

  return () => {
    if (burstTimerId) {
      window.clearInterval(burstTimerId);
      burstTimerId = null;
    }
    timeoutIds.forEach((id) => window.clearTimeout(id));
    if (layer.parentNode) {
      layer.parentNode.removeChild(layer);
    }
  };
}

function showMilestoneCelebrationIfNeeded() {
  const now = new Date();
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const { milestoneDay, isMilestoneToday } = getMilestoneInfo(todayDate);

  if (!isMilestoneToday) return;

  const overlay = document.createElement("div");
  overlay.className = "milestone-celebration-overlay";
  overlay.innerHTML = `
    <div class="milestone-celebration-card" role="dialog" aria-modal="true" aria-label="整百天庆祝">
      <h3>🎉🎉${milestoneDay}天快乐！</h3>
      <p>今天是小林和小鱼在一起的第${milestoneDay}天！！！<br>下一个百天请继续幸福下去吧~期待我们的第${milestoneDay + 100}天！</p>
      <button type="button" class="milestone-celebration-close">好耶！收下这份喜悦~Happy~</button>
    </div>
  `;

  const onKeyDown = (event) => {
    if (event.key === "Escape") {
      close();
    }
  };

  const stopFireworks = startMilestoneFireworks(overlay);

  const close = () => {
    document.removeEventListener("keydown", onKeyDown);
    stopFireworks();
    if (overlay.parentNode) {
      document.body.removeChild(overlay);
    }
  };

  overlay.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (
      target.classList.contains("milestone-celebration-overlay") ||
      target.classList.contains("milestone-celebration-close")
    ) {
      close();
    }
  });

  document.addEventListener("keydown", onKeyDown);

  document.body.appendChild(overlay);
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
  const now = new Date();
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const { milestoneDay, milestoneTarget } = getMilestoneInfo(todayDate);

  const anniversaryTarget = getNextBirthdayTarget(todayDate, 11, 25);

  const linBirthdayTarget = getNextBirthdayTarget(todayDate, 5, 18);

  const yuBirthdayTarget = getNextBirthdayTarget(todayDate, 1, 4);
  const valentineTarget = getNextBirthdayTarget(todayDate, 2, 14);
  const mayTwentyTarget = getNextBirthdayTarget(todayDate, 5, 20);

  setTextById("countdown_valentine_days", formatCountdownToTarget(valentineTarget, now));
  setTextById("countdown_valentine_target", `目标日期：${formatDate(valentineTarget)}`);
  setTextById("countdown_520_days", formatCountdownToTarget(mayTwentyTarget, now));
  setTextById("countdown_520_target", `目标日期：${formatDate(mayTwentyTarget)}`);
  setTextById("countdown_anniversary_days", formatCountdownToTarget(anniversaryTarget, now));
  setTextById("countdown_anniversary_target", `目标日期：${formatDate(anniversaryTarget)}`);
  const milestoneCountdownText = isSameCalendarDate(todayDate, milestoneTarget)
    ? `${milestoneDay}天就在今天！`
    : formatCountdownToTarget(milestoneTarget, now);
  setTextById("countdown_milestone_days", milestoneCountdownText);
  setTextById("countdown_milestone_target", `目标日期：${formatDate(milestoneTarget)}`);
  setTextById("countdown_lin_days", formatCountdownToTarget(linBirthdayTarget, now));
  setTextById("countdown_lin_target", `目标日期：${formatDate(linBirthdayTarget)}`);
  setTextById("countdown_yu_days", formatCountdownToTarget(yuBirthdayTarget, now));
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
  const isMobileViewport = window.matchMedia("(max-width: 720px)").matches;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const saveDataEnabled = Boolean(connection && connection.saveData);
  const effectiveType = connection && typeof connection.effectiveType === "string" ? connection.effectiveType : "";
  const lowBandwidth = /(^|[^0-9])2g|3g/i.test(effectiveType);
  const autoScrollEnabled = !(isMobileViewport && (prefersReducedMotion || saveDataEnabled || lowBandwidth));

  dotsContainer.innerHTML = "";

  const originals = Array.from(track.querySelectorAll("img"));
  if (!originals.length) return;
  originals.forEach((img, index) => {
    img.loading = index === 0 ? "eager" : "lazy";
    img.decoding = "async";
    img.setAttribute("fetchpriority", index === 0 ? "high" : "low");
  });

  if (isMobileViewport && (saveDataEnabled || lowBandwidth)) {
    originals.forEach((img) => {
      const src = (img.getAttribute("src") || "").toLowerCase();
      if (src.endsWith("/1_png.jpg")) {
        img.setAttribute("src", "images/carousel/1.jpg");
      }
    });
  }

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

    if (autoScrollEnabled && !paused && oneBatchWidth > 0) {
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
  if (autoScrollEnabled) {
    rafId = requestAnimationFrame(tick);
  }
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

  music.volume = 0.1;
  music.loop = false;
  let playlist = [];
  let currentIndex = 0;
  let recentErrorCount = 0;
  let playlistReady = false;

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

  async function ensurePlaylistReady() {
    if (playlistReady) return;
    await loadPlaylistData();
    playlistReady = true;
  }

  async function ensureTrackPrepared() {
    await ensurePlaylistReady();
    if (!playlist.length) return;
    if (!music.src) {
      await loadTrack(0, false);
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

  function bindFirstInteractionAutoplay() {
    const resumeOnGesture = async () => {
      await ensureTrackPrepared();
      if (!music.paused) return;
      try {
        await music.play();
      } catch (_) {
        return;
      }
      document.removeEventListener("pointerdown", resumeOnGesture);
      document.removeEventListener("touchstart", resumeOnGesture);
      document.removeEventListener("keydown", resumeOnGesture);
    };

    document.addEventListener("pointerdown", resumeOnGesture);
    document.addEventListener("touchstart", resumeOnGesture, { passive: true });
    document.addEventListener("keydown", resumeOnGesture);
  }

  async function tryAutoPlayOnInit() {
    await ensureTrackPrepared();
    if (!playlist.length) return;
    try {
      await music.play();
      musicToggle.classList.add("playing");
    } catch (_) {
      bindFirstInteractionAutoplay();
    } finally {
      syncPlayPauseIcon();
    }
  }

  musicToggle.addEventListener("click", async () => {
    const willOpen = panel.hidden;
    panel.hidden = !willOpen;
    musicToggle.setAttribute("aria-expanded", String(willOpen));
    if (willOpen) {
      await ensureTrackPrepared();
      syncPlayPauseIcon();
    }
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
        await ensureTrackPrepared();
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

  prevBtn.addEventListener("click", async () => {
    await ensureTrackPrepared();
    if (!playlist.length) return;
    const autoPlay = !music.paused;
    await loadTrack(currentIndex - 1, autoPlay);
    if (autoPlay) musicToggle.classList.add("playing");
  });

  nextBtn.addEventListener("click", async () => {
    await ensureTrackPrepared();
    if (!playlist.length) return;
    const autoPlay = !music.paused;
    await loadTrack(currentIndex + 1, autoPlay);
    if (autoPlay) musicToggle.classList.add("playing");
  });

  music.addEventListener("ended", () => {
    if (!playlist.length) return;
    void loadTrack(currentIndex + 1, true);
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
    void loadTrack(currentIndex + 1, true);
  });
  syncPlayPauseIcon();
  void tryAutoPlayOnInit();
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
showMilestoneCelebrationIfNeeded();
initMusic();
initTheme();
setInterval(updateTogetherTime, 1000);
setInterval(updateCountdowns, 1000);

if (window.matchMedia("(min-width: 721px)").matches) {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(() => initCarousel(), { timeout: 900 });
  } else {
    setTimeout(() => initCarousel(), 120);
  }
} else {
  initCarousel();
}
