const movieNum = document.getElementById("movie_num");
const gallery = document.getElementById("movieGallery");
const movieForm = document.getElementById("movieForm");
const formMessage = document.getElementById("formMessage");
const submitBtn = document.getElementById("submitBtn");
const apiBaseMeta = document.querySelector("meta[name='api-base-url']");
const API_BASE_URL = apiBaseMeta ? apiBaseMeta.content.trim().replace(/\/$/, "") : "";

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildApiUrl(path) {
  if (!API_BASE_URL) {
    return path;
  }
  return `${API_BASE_URL}${path}`;
}

function buildImageUrl(url) {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  if (!url.startsWith("/")) {
    return url;
  }
  return API_BASE_URL ? `${API_BASE_URL}${url}` : url;
}

function openImagePreview(url, title, time) {
  const overlay = document.createElement("div");
  overlay.className = "image-preview-overlay";

  overlay.innerHTML = `
    <div class="preview-content">
      <img src="${url}" alt="${escapeHtml(title)}">
      <p>影片《${escapeHtml(title)}》，观看于 ${escapeHtml(time)}</p>
      <span class="close-btn">&times;</span>
    </div>
  `;

  overlay.addEventListener("click", () => {
    document.body.removeChild(overlay);
  });

  document.body.appendChild(overlay);
}

function renderMovies(movies) {
  gallery.innerHTML = "";

  movieNum.innerText = `一起看了 ${movies.length} 部作品！`;

  if (!movies.length) {
    gallery.innerHTML = `
      <div class="empty-state">
        <p>还没有添加电影哦~</p>
        <p>先上传第一张卡片吧！</p>
      </div>
    `;
    return;
  }

  movies.forEach((movie) => {
    const imageUrl = buildImageUrl(movie.imageUrl);
    const movieCard = document.createElement("div");
    movieCard.className = "movie-card";
    movieCard.innerHTML = `
      <img src="${imageUrl}" alt="${escapeHtml(movie.title)}" class="movie-poster" loading="lazy">
      <div class="movie-info">
        <h3 class="movie-title">${escapeHtml(movie.title)}</h3>
      </div>
    `;

    movieCard.addEventListener("click", () => {
      openImagePreview(imageUrl, movie.title, movie.time);
    });

    gallery.appendChild(movieCard);
  });
}

async function loadMovies() {
  const response = await fetch(buildApiUrl("/api/movies"));
  if (!response.ok) {
    throw new Error("加载电影列表失败");
  }

  const movies = await response.json();
  renderMovies(movies);
}

async function handleSubmit(event) {
  event.preventDefault();

  const formData = new FormData(movieForm);
  formMessage.textContent = "上传中...";
  submitBtn.disabled = true;

  try {
    const response = await fetch(buildApiUrl("/api/movies"), {
      method: "POST",
      body: formData
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "上传失败");
    }

    formMessage.textContent = "上传成功，电影卡片已创建。";
    movieForm.reset();
    await loadMovies();
  } catch (error) {
    formMessage.textContent = `上传失败：${error.message}`;
  } finally {
    submitBtn.disabled = false;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  movieForm.addEventListener("submit", handleSubmit);

  try {
    await loadMovies();
  } catch (error) {
    formMessage.textContent = error.message;
  }
});
