const HOME_SECTIONS = {
  photos: {
    type: "records",
    jsonPath: "data/record.json",
    title: "恋爱事记",
    subtitle: "把那些普通但难忘的瞬间，认真地一条条记下来。",
    countTemplate: "已记录 {count} 条恋爱事记",
    emptyMain: "还没有恋爱事记",
    emptySub: "下一次约会后来补一条吧~",
    errorMain: "恋爱事记数据加载失败",
    errorSub: "请检查 data/record.json 是否可访问",
    footerTemplate: "📷 共 {count} 条记录 | 日常就是最珍贵的回忆",
    showThumb: true,
    primaryMeta: "",
    secondaryMeta: "note",
    pageSize: 5
  },
  movies: {
    type: "media",
    jsonPath: "data/movies.json",
    title: "观影墙",
    subtitle: "每一部都记录着同一排座位的笑点、泪点和片尾彩蛋。",
    countTemplate: "我们一起看了 {count} 部影视作品！🎬",
    emptyMain: "还没有添加影视作品",
    emptySub: "把下一部想看的片子放进来吧~",
    errorMain: "影视作品数据加载失败",
    errorSub: "请检查 data/movies.json 是否可访问",
    footerTemplate: "🎬 已记录 {count} 部影视作品 | 银幕里的共同回忆",
    previewTitleTemplate: "{title}",
    fallbackIcon: "🎬",
    hideMeta: true,
    pageRows: 3,
    pageSize: 10,
    stabilizePageHeight: true
  },
  books: {
    type: "media",
    jsonPath: "data/books.json",
    title: "书籍墙",
    subtitle: "每一本都被翻阅过，也都记得一起讨论过的句子。",
    countTemplate: "我们一起读完了 {count} 本书！📚",
    emptyMain: "还没有添加书籍",
    emptySub: "去记录下一本想读或读完的书吧~",
    errorMain: "书籍数据加载失败",
    errorSub: "请检查 data/books.json 是否可访问",
    footerTemplate: "📚 已记录 {count} 本书 | 纸页里的共同回忆",
    previewTitleTemplate: "{title}",
    fallbackIcon: "📘",
    hideMeta: true,
    pageRows: 3,
    pageSize: 10,
    stabilizePageHeight: true
  },
  games: {
    type: "media",
    jsonPath: "data/games.json",
    title: "游戏墙",
    subtitle: "有并肩作战，也有互相吐槽，每一局都是共同存档。",
    countTemplate: "我们一起玩过 {count} 款游戏！🎮",
    emptyMain: "还没有添加游戏",
    emptySub: "快把最有记忆点的一作放进来吧~",
    errorMain: "游戏数据加载失败",
    errorSub: "请检查 data/games.json 是否可访问",
    footerTemplate: "🎮 已记录 {count} 款游戏 | 存档里的并肩时光",
    previewTitleTemplate: "{title}",
    fallbackIcon: "🎮",
    hideMeta: true,
    pageRows: 3,
    pageSize: 10,
    stabilizePageHeight: true
  },
  foods: {
    type: "media",
    jsonPath: "data/foods.json",
    title: "美食墙",
    subtitle: "每一口都在发光，味道和地点都值得被好好记住。",
    countTemplate: "我们一起打卡了 {count} 家美食！🍜",
    emptyMain: "还没有添加美食",
    emptySub: "下一顿想吃的先记进来吧~",
    errorMain: "美食数据加载失败",
    errorSub: "请检查 data/foods.json 是否可访问",
    footerTemplate: "🍜 已记录 {count} 道美食 | 把好吃和好地方都收集起来",
    previewTitleTemplate: "{title}",
    fallbackIcon: "🍜",
    hideNoteInDetail: true,
    hideMeta: true,
    pageRows: 3,
    pageSize: 10,
    stabilizePageHeight: true
  },
  todos: {
    type: "records",
    jsonPath: "data/todos.json",
    title: "TODO 清单",
    subtitle: "把想一起完成的计划写成清单，一项项勾掉。",
    countTemplate: "当前共有 {count} 项计划",
    emptyMain: "还没有待办事项",
    emptySub: "先写下第一件想一起做的事吧~",
    errorMain: "TODO 数据加载失败",
    errorSub: "请检查 data/todos.json 是否可访问",
    footerTemplate: "📝 共 {count} 项计划 | 说好就去做",
    showThumb: false,
    primaryMeta: "status",
    secondaryMeta: "summary",
    detailKey: "detail",
    timeAtEnd: true,
    pageSize: 5,
    pinnedTitles: ["⭐影视待看列表", "⭐游戏待玩列表"]
  }
};

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function fillTemplate(template, count) {
  return template.replace("{count}", String(count));
}

function formatPreview(template, item) {
  return template
    .replace("{title}", item.title || "未命名")
    .replace("{time}", item.time || "未知");
}

function compareByTimeDesc(a, b) {
  const ta = Date.parse(a.time || "");
  const tb = Date.parse(b.time || "");
  if (Number.isNaN(ta) && Number.isNaN(tb)) return 0;
  if (Number.isNaN(ta)) return 1;
  if (Number.isNaN(tb)) return -1;
  return tb - ta;
}

function compareRecords(a, b, config) {
  const pinnedTitles = Array.isArray(config.pinnedTitles) ? config.pinnedTitles : [];
  if (pinnedTitles.length) {
    const ai = pinnedTitles.indexOf(a.title || "");
    const bi = pinnedTitles.indexOf(b.title || "");
    const aPinned = ai !== -1;
    const bPinned = bi !== -1;

    if (aPinned && bPinned) return ai - bi;
    if (aPinned) return -1;
    if (bPinned) return 1;
  }

  const aDone = Number(a.status) === 3;
  const bDone = Number(b.status) === 3;
  if (aDone !== bDone) {
    return aDone ? 1 : -1;
  }

  return compareByTimeDesc(a, b);
}

function getStatusBadge(status) {
  const statusCode = Number(status);
  if (statusCode === 1) {
    return '<span class="home-status-badge status-pending">待完成</span>';
  }
  if (statusCode === 2) {
    return '<span class="home-status-badge status-progress">进行中</span>';
  }
  if (statusCode === 3) {
    return '<span class="home-status-badge status-done">已完成</span>';
  }
  return "";
}

function buildMetaLine(item) {
  const parts = [];
  if (item.author) parts.push(`作者：${item.author}`);
  if (item.recommender) parts.push(`推荐人：${item.recommender}`);
  if (item.location) parts.push(`地点：${item.location}`);
  if (!parts.length && item.time) parts.push(`记录时间：${item.time}`);
  return parts.join(" | ");
}

function clampPage(page, totalPages) {
  return Math.min(Math.max(Number(page) || 1, 1), Math.max(totalPages, 1));
}

function createPager(currentPage, totalPages, onPageChange) {
  if (totalPages <= 1) return null;
  const pager = document.createElement("div");
  pager.className = "home-pagination";
  pager.dataset.totalPages = String(totalPages);
  pager.innerHTML = `
    <button type="button" class="home-page-btn prev"${currentPage === 1 ? " disabled" : ""}>上一页</button>
    <span class="home-page-info">第 ${currentPage} / ${totalPages} 页</span>
    <button type="button" class="home-page-btn next"${currentPage === totalPages ? " disabled" : ""}>下一页</button>
  `;

  const prevBtn = pager.querySelector(".home-page-btn.prev");
  const nextBtn = pager.querySelector(".home-page-btn.next");

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (currentPage > 1 && typeof onPageChange === "function") {
        onPageChange(currentPage - 1, { fromPager: true });
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (currentPage < totalPages && typeof onPageChange === "function") {
        onPageChange(currentPage + 1, { fromPager: true });
      }
    });
  }

  return pager;
}

function scrollToFirstRenderedItem(contentEl) {
  const isMobileViewport = window.matchMedia("(max-width: 720px)").matches;
  const isTouchDevice = window.matchMedia("(pointer: coarse)").matches || (navigator.maxTouchPoints || 0) > 0;
  if (!isMobileViewport || !isTouchDevice) return;
  requestAnimationFrame(() => {
    const sectionViewer = contentEl.closest(".home-section-viewer");
    const target = sectionViewer instanceof HTMLElement ? sectionViewer : contentEl;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function stabilizeDesktopPageHeight(contentEl, sectionKey, heightState) {
  const isMobileViewport = window.matchMedia("(max-width: 720px)").matches;
  const isTouchDevice = window.matchMedia("(pointer: coarse)").matches || (navigator.maxTouchPoints || 0) > 0;
  if (isMobileViewport && isTouchDevice) {
    contentEl.style.minHeight = "";
    return;
  }
  const previousMinHeight = contentEl.style.minHeight;
  contentEl.style.minHeight = "";
  const currentHeight = contentEl.scrollHeight || 0;
  contentEl.style.minHeight = previousMinHeight;
  const knownHeight = Number(heightState.get(sectionKey) || 0);
  const nextHeight = Math.max(knownHeight, currentHeight);
  heightState.set(sectionKey, nextHeight);
  contentEl.style.minHeight = nextHeight > 0 ? `${nextHeight}px` : "";
}

function getMediaPageSize(contentEl, config) {
  const fixedPageSize = Number(config.pageSize) > 0 ? Number(config.pageSize) : 0;
  if (fixedPageSize) return fixedPageSize;

  const rows = Number(config.pageRows) > 0 ? Number(config.pageRows) : 0;
  if (!rows) return 0;

  const width = contentEl.clientWidth || 0;
  const isMobile = window.matchMedia("(max-width: 720px)").matches;
  const minCardWidth = isMobile ? 140 : 180;
  const gap = isMobile ? 10 : 14;
  const columns = Math.max(1, Math.floor((width + gap) / (minCardWidth + gap)));
  return columns * rows;
}

function openOverlay(html) {
  const overlay = document.createElement("div");
  overlay.className = "home-overlay";
  overlay.innerHTML = html;

  overlay.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target === overlay || target.classList.contains("home-overlay-close")) {
      if (overlay.parentNode) {
        document.body.removeChild(overlay);
      }
    }
  });

  document.body.appendChild(overlay);
}

function openMediaPreview(item, config) {
  const detail = formatPreview(config.previewTitleTemplate || "{title}", item);
  const extra = [];
  if (item.author) extra.push(`<p>作者：${escapeHtml(item.author)}</p>`);
  if (item.recommender) extra.push(`<p>推荐人：${escapeHtml(item.recommender)}</p>`);
  if (item.location) extra.push(`<p>地点：${escapeHtml(item.location)}</p>`);
  if (item.note && !config.hideNoteInDetail) extra.push(`<p>备注：${escapeHtml(item.note)}</p>`);
  extra.push(`<p>${escapeHtml(item.time || "未知")}</p>`);

  const cover = item.imageUrl
    ? `<img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.alt || item.title || "预览")}">`
    : `<div class="home-overlay-placeholder">${escapeHtml(config.fallbackIcon || "📝")}</div>`;

  openOverlay(`
    <div class="home-overlay-box">
      <button class="home-overlay-close" type="button" aria-label="关闭">&times;</button>
      ${cover}
      <p>${escapeHtml(detail)}</p>
      ${extra.join("")}
    </div>
  `);
}

function openTodoDetail(item) {
  if (!item.detail) return;
  openOverlay(`
    <div class="home-detail-modal">
      <div class="home-detail-head">
        <h4>${escapeHtml(item.title || "Untitled")}</h4>
        ${getStatusBadge(item.status)}
      </div>
      <p class="home-detail-content">${escapeHtml(item.detail)}</p>
      <p class="home-detail-time">${escapeHtml(item.time || "未知时间")}</p>
    </div>
  `);
}

function renderEmpty(contentEl, config, isError) {
  const main = isError ? config.errorMain : config.emptyMain;
  const sub = isError ? config.errorSub : config.emptySub;
  contentEl.innerHTML = `
    <div class="home-empty">
      <p>${escapeHtml(main)}</p>
      <p>${escapeHtml(sub)}</p>
    </div>
  `;
}

function renderMedia(contentEl, items, config, options = {}) {
  if (!items.length) {
    renderEmpty(contentEl, config, false);
    return;
  }

  const pageSize = getMediaPageSize(contentEl, config);
  const totalPages = pageSize ? Math.ceil(items.length / pageSize) : 1;
  const currentPage = clampPage(options.page, totalPages);
  const visibleItems = pageSize
    ? items.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : items;

  const grid = document.createElement("div");
  grid.className = "home-media-grid";

  visibleItems.forEach((item) => {
    const card = document.createElement("article");
    card.className = "home-media-card";
    const meta = buildMetaLine(item);
    const cover = item.imageUrl
      ? `<img class="home-media-cover" src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.alt || item.title || "media")}" loading="lazy">`
      : `<div class="home-media-cover home-media-cover-placeholder">${escapeHtml(config.fallbackIcon || "📝")}</div>`;

    card.innerHTML = `
      ${cover}
      <div class="home-media-info">
        <h4>${escapeHtml(item.title || "Untitled")}</h4>
        ${!config.hideMeta && meta ? `<p>${escapeHtml(meta)}</p>` : ""}
      </div>
    `;

    card.addEventListener("click", () => openMediaPreview(item, config));
    grid.appendChild(card);
  });

  contentEl.innerHTML = "";
  contentEl.appendChild(grid);

  const pager = createPager(currentPage, totalPages, options.onPageChange);
  if (pager) {
    contentEl.appendChild(pager);
  }
}

function formatRecordMeta(item, key) {
  if (!key) return "";
  if (key === "location") return item.location ? `地点：${item.location}` : "";
  if (key === "status") return "";
  return item[key] || "";
}

function renderRecords(contentEl, items, config, options = {}) {
  if (!items.length) {
    renderEmpty(contentEl, config, false);
    return;
  }

  const sorted = [...items].sort((a, b) => compareRecords(a, b, config));
  const pageSize = Number(config.pageSize) > 0 ? Number(config.pageSize) : 0;
  const totalPages = pageSize ? Math.ceil(sorted.length / pageSize) : 1;
  const currentPage = clampPage(options.page, totalPages);
  const visibleItems = pageSize
    ? sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sorted;

  const list = document.createElement("ul");
  list.className = "home-record-list";

  visibleItems.forEach((item) => {
    const row = document.createElement("li");
    const hasThumb = Boolean(config.showThumb && item.imageUrl);
    row.className = `home-record-item${hasThumb ? " has-thumb" : ""}${item.detail ? " is-clickable" : ""}`;

    const thumb = hasThumb
      ? `<img class="home-record-thumb" src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.alt || item.title || "记录图片")}" loading="lazy">`
      : "";

    const primary = formatRecordMeta(item, config.primaryMeta);
    const secondary = formatRecordMeta(item, config.secondaryMeta);
    const statusBadge = config.primaryMeta === "status" ? getStatusBadge(item.status) : "";
    const timeLine = `<p class="home-record-time">${escapeHtml(item.time || "未知时间")}</p>`;

    row.innerHTML = `
      <div class="home-record-main">
        ${thumb}
        <div class="home-record-body">
          <div class="home-record-head">
            <h4>${escapeHtml(item.title || "Untitled")}</h4>
            ${statusBadge}
          </div>
          ${config.timeAtEnd ? "" : timeLine}
          ${primary ? `<p class="home-record-meta">${escapeHtml(primary)}</p>` : ""}
          ${secondary ? `<p class="home-record-note">${escapeHtml(secondary)}</p>` : ""}
          ${config.timeAtEnd ? timeLine : ""}
        </div>
      </div>
    `;

    if (item.detail) {
      row.addEventListener("click", () => openTodoDetail(item));
    }

    list.appendChild(row);
  });

  contentEl.innerHTML = "";
  contentEl.appendChild(list);

  const pager = createPager(currentPage, totalPages, options.onPageChange);
  if (pager) {
    contentEl.appendChild(pager);
  }
}

async function loadJson(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) throw new Error(`failed to load ${path}`);
  const payload = await response.json();
  if (!Array.isArray(payload)) throw new Error(`${path} must be an array`);
  return payload;
}

document.addEventListener("DOMContentLoaded", () => {
  const tabs = Array.from(document.querySelectorAll(".section-tab"));
  const viewerEl = document.querySelector(".home-section-viewer");
  const titleEl = document.getElementById("homeSectionTitle");
  const subtitleEl = document.getElementById("homeSectionSubtitle");
  const countEl = document.getElementById("homeSectionCount");
  const contentEl = document.getElementById("homeSectionContent");
  const footerEl = document.getElementById("homeSectionFooter");
  const tabsWrapEl = document.getElementById("homeSectionTabs");
  const collapseBtn = document.getElementById("homeSectionCollapseBtn");

  if (!tabs.length || !viewerEl || !titleEl || !subtitleEl || !countEl || !contentEl || !footerEl) return;
  footerEl.hidden = true;

  const cache = new Map();
  const pageState = new Map();
  const sectionHeightState = new Map();
  let activeToken = 0;
  let activeSection = "";
  let activeMediaLayoutSize = 0;
  let resizeFrameId = 0;

  function scrollToTabsTop() {
    if (!(tabsWrapEl instanceof HTMLElement)) return;
    requestAnimationFrame(() => {
      tabsWrapEl.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function hideSectionViewer(options = {}) {
    const { scrollToTabs = false } = options;
    activeToken += 1;
    activeSection = "";
    activeMediaLayoutSize = 0;
    pageState.clear();
    viewerEl.hidden = true;
    viewerEl.setAttribute("aria-hidden", "true");
    viewerEl.removeAttribute("data-section");
    contentEl.classList.remove("is-switching");
    contentEl.removeAttribute("aria-busy");
    tabs.forEach((tab) => tab.classList.remove("is-active"));
    if (scrollToTabs) {
      scrollToTabsTop();
    }
  }

  function syncCollapseButtonPlacement(config) {
    if (!collapseBtn) return;
    const pager = contentEl.querySelector(".home-pagination");
    let actionRow = contentEl.querySelector(".home-pagination.home-pagination-only-collapse");
    const mobileCollapseRow = contentEl.querySelector(".home-pagination.home-pagination-mobile-collapse-row");

    if (pager) {
      if (mobileCollapseRow && mobileCollapseRow.parentElement) {
        mobileCollapseRow.parentElement.removeChild(mobileCollapseRow);
      }
      if (actionRow && actionRow.parentElement) {
        actionRow.parentElement.removeChild(actionRow);
      }
      pager.appendChild(collapseBtn);
      return;
    }

    if (mobileCollapseRow && mobileCollapseRow.parentElement) {
      mobileCollapseRow.parentElement.removeChild(mobileCollapseRow);
    }
    if (!actionRow) {
      actionRow = document.createElement("div");
      actionRow.className = "home-pagination home-pagination-only-collapse";
      contentEl.appendChild(actionRow);
    }
    actionRow.appendChild(collapseBtn);
  }

  function applyMediaHeightMode(config, sectionKey) {
    if (config.stabilizePageHeight) {
      stabilizeDesktopPageHeight(contentEl, sectionKey, sectionHeightState);
      return;
    }
    sectionHeightState.delete(sectionKey);
    contentEl.style.minHeight = "";
  }

  async function switchSection(key, force = false) {
    const config = HOME_SECTIONS[key];
    if (!config) return;
    if (activeSection && activeSection !== key) {
      pageState.delete(activeSection);
    }
    if (!force && activeSection === key && cache.has(key)) return;
    activeSection = key;

    activeToken += 1;
    const token = activeToken;
    viewerEl.dataset.section = key;
    viewerEl.classList.add("is-switching");
    contentEl.classList.add("is-switching");
    contentEl.setAttribute("aria-busy", "true");
    contentEl.style.minHeight = "";

    tabs.forEach((tab) => {
      tab.classList.toggle("is-active", tab.dataset.section === key);
    });

    titleEl.innerText = config.title;
    subtitleEl.innerText = config.subtitle;
    countEl.innerText = fillTemplate(config.countTemplate, 0);
    footerEl.innerText = "";
    contentEl.innerHTML = '<div class="home-empty"><p>加载中...</p></div>';

    try {
      let items = cache.get(key);
      if (!items) {
        items = await loadJson(config.jsonPath);
        cache.set(key, items);
      }
      if (token !== activeToken) return;

      countEl.innerText = fillTemplate(config.countTemplate, items.length);
      footerEl.innerText = "";

      if (config.type === "media") {
        const renderMediaPage = (page, meta = {}) => {
          pageState.set(key, page);
          renderMedia(contentEl, items, config, {
            page,
            onPageChange: renderMediaPage
          });
          syncCollapseButtonPlacement(config);
          applyMediaHeightMode(config, key);
          activeMediaLayoutSize = getMediaPageSize(contentEl, config);
          if (meta.fromPager) {
            scrollToFirstRenderedItem(contentEl);
          }
        };
        renderMediaPage(pageState.get(key) || 1);
      } else {
        activeMediaLayoutSize = 0;
        const renderRecordsPage = (page, meta = {}) => {
          pageState.set(key, page);
          renderRecords(contentEl, items, config, {
            page,
            onPageChange: renderRecordsPage
          });
          syncCollapseButtonPlacement(config);
          stabilizeDesktopPageHeight(contentEl, key, sectionHeightState);
          if (meta.fromPager) {
            scrollToFirstRenderedItem(contentEl);
          }
        };
        renderRecordsPage(pageState.get(key) || 1);
      }

      requestAnimationFrame(() => {
        viewerEl.classList.remove("is-switching");
        contentEl.classList.remove("is-switching");
        contentEl.removeAttribute("aria-busy");
      });
    } catch (error) {
      if (token !== activeToken) return;
      console.error(error);
      countEl.innerText = fillTemplate(config.countTemplate, 0);
      footerEl.innerText = "";
      renderEmpty(contentEl, config, true);
      syncCollapseButtonPlacement(config);
      requestAnimationFrame(() => {
        viewerEl.classList.remove("is-switching");
        contentEl.classList.remove("is-switching");
        contentEl.removeAttribute("aria-busy");
      });
    }
  }

  hideSectionViewer();

  if (collapseBtn) {
    collapseBtn.addEventListener("click", () => {
      hideSectionViewer({ scrollToTabs: true });
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const key = tab.dataset.section;
      if (!key) return;
      if (activeSection === key && !viewerEl.hidden) {
        hideSectionViewer({ scrollToTabs: true });
        return;
      }
      if (!viewerEl.hidden) {
        hideSectionViewer();
      }
      viewerEl.hidden = false;
      viewerEl.setAttribute("aria-hidden", "false");
      switchSection(key);
    });
  });

  window.addEventListener("resize", () => {
    if (resizeFrameId) {
      cancelAnimationFrame(resizeFrameId);
    }
    resizeFrameId = requestAnimationFrame(() => {
      resizeFrameId = 0;
      const current = HOME_SECTIONS[activeSection];
      if (!current || current.type !== "media" || !cache.has(activeSection)) return;

      const nextLayoutSize = getMediaPageSize(contentEl, current);
      if (nextLayoutSize === activeMediaLayoutSize) return;

      const items = cache.get(activeSection) || [];
      const renderMediaPage = (page) => {
        pageState.set(activeSection, page);
        renderMedia(contentEl, items, current, {
          page,
          onPageChange: renderMediaPage
        });
        syncCollapseButtonPlacement(current);
        applyMediaHeightMode(current, activeSection);
        activeMediaLayoutSize = getMediaPageSize(contentEl, current);
      };
      renderMediaPage(pageState.get(activeSection) || 1);
    });
  });

  window.addEventListener("orientationchange", () => {
    const current = HOME_SECTIONS[activeSection];
    if (!current || current.type !== "media" || !cache.has(activeSection)) return;
    switchSection(activeSection, true);
  });
});
