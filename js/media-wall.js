function buildConfig() {
  const body = document.body;
  return {
    jsonPath: body.dataset.jsonPath || "",
    kindName: body.dataset.kindName || "作品",
    subtitle: body.dataset.subtitle || "",
    countTemplate: body.dataset.countTemplate || "已记录 {count} 个作品",
    emptyMain: body.dataset.emptyMain || "暂无数据",
    emptySub: body.dataset.emptySub || "",
    errorMain: body.dataset.errorMain || "数据加载失败",
    errorSub: body.dataset.errorSub || "",
    footerTemplate: body.dataset.footerTemplate || "已记录 {count} 个作品",
    previewTemplate: body.dataset.previewTemplate || "《{title}》 记录时间：{time}",
    previewTip: body.dataset.previewTip || "点击卡片查看大图与记录信息"
  };
}

function applyText(config) {
  const subtitle = document.getElementById("page_subtitle");
  if (subtitle) subtitle.innerText = config.subtitle;
}

async function loadItems(jsonPath) {
  if (!jsonPath) throw new Error("json path is missing");
  const response = await fetch(jsonPath, { cache: "no-store" });
  if (!response.ok) throw new Error(`failed to load ${jsonPath}`);
  const payload = await response.json();
  if (!Array.isArray(payload)) throw new Error(`${jsonPath} must be an array`);
  return payload;
}

function setCount(config, count) {
  const countEl = document.getElementById("media_count");
  if (!countEl) return;
  countEl.innerText = config.countTemplate.replace("{count}", String(count));
}

function renderEmpty(gallery, config) {
  gallery.innerHTML = `
    <div class="empty-state">
      <p>${config.emptyMain}</p>
      <p>${config.emptySub}</p>
    </div>
  `;
}

function renderError(gallery, config) {
  gallery.innerHTML = `
    <div class="empty-state">
      <p>${config.errorMain}</p>
      <p>${config.errorSub}</p>
    </div>
  `;
}

function buildCover(item, fallbackIcon) {
  if (item.imageUrl) {
    return `<img class="media-cover" src="${item.imageUrl}" alt="${item.alt || item.title || "media"}" loading="lazy">`;
  }
  return `<div class="media-cover media-cover-placeholder">${item.icon || fallbackIcon}</div>`;
}

function openPreview(item, config) {
  const overlay = document.createElement("div");
  overlay.className = "preview-overlay";

  const timeText = item.time || "未知";
  const detail = config.previewTemplate
    .replace("{title}", item.title || "未命名")
    .replace("{time}", timeText);

  const detailLines = [];
  if (item.recommender) detailLines.push(`推荐人：${item.recommender}`);
  if (item.author) detailLines.push(`作者：${item.author}`);
  if (item.location) detailLines.push(`地点：${item.location}`);
  if (item.status) detailLines.push(`状态：${item.status}`);
  if (item.note) detailLines.push(`备注：${item.note}`);
  const extraDetail = detailLines.map((line) => `<p>${line}</p>`).join("");

  overlay.innerHTML = `
    <div class="preview-box">
      ${buildCover(item, "📝")}
      <p>${detail}</p>
      ${extraDetail}
      <span class="close-btn">&times;</span>
    </div>
  `;

  overlay.addEventListener("click", () => {
    document.body.removeChild(overlay);
  });

  document.body.appendChild(overlay);
}

function resolveMeta(item) {
  const parts = [];
  if (item.status) parts.push(`状态：${item.status}`);
  if (item.author) parts.push(`作者：${item.author}`);
  if (item.location) parts.push(`地点：${item.location}`);
  if (!parts.length && item.time) parts.push(`记录时间：${item.time}`);
  return parts.join(" | ");
}

function renderItems(gallery, items, config) {
  gallery.innerHTML = "";
  const showMeta = config.kindName !== "游戏";

  if (!items.length) {
    renderEmpty(gallery, config);
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "media-card";
    const metaText = resolveMeta(item);
    card.innerHTML = `
      ${buildCover(item, "📝")}
      <div class="media-info">
        <h3 class="media-title">${item.title || "Untitled"}</h3>
        ${showMeta && metaText ? `<p class="media-meta">${metaText}</p>` : ""}
      </div>
    `;

    card.addEventListener("click", () => openPreview(item, config));
    gallery.appendChild(card);
  });
}

function renderFooter(config, count) {
  const footer = document.createElement("div");
  footer.className = "footer";
  footer.innerHTML = `
    <p>${config.footerTemplate.replace("{count}", String(count))}</p>
    <p>${config.previewTip}</p>
  `;

  const backLink = document.querySelector(".back-link");
  if (backLink && backLink.parentNode) {
    backLink.parentNode.insertBefore(footer, backLink.nextSibling);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const gallery = document.getElementById("mediaGallery");
  if (!gallery) return;

  const config = buildConfig();
  applyText(config);

  try {
    const items = await loadItems(config.jsonPath);
    setCount(config, items.length);
    renderItems(gallery, items, config);
    renderFooter(config, items.length);
  } catch (error) {
    console.error(error);
    setCount(config, 0);
    renderError(gallery, config);
  }
});
