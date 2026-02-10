const movies = [
  {
    id: 1,
    title: "La La Land",
    imageUrl: "images/us.jpg",
    time: "2023-01-01"
  },
  {
    id: 2,
    title: "Before Sunrise",
    imageUrl: "images/us.jpg",
    time: "2023-02-14"
  }
];

const movieNum = document.getElementById("movie_num");
const gallery = document.getElementById("movieGallery");

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
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

function renderMovies() {
  gallery.innerHTML = "";
  movieNum.innerText = `一起看了 ${movies.length} 部作品！`;

  if (!movies.length) {
    gallery.innerHTML = `
      <div class="empty-state">
        <p>还没有添加电影哦~</p>
      </div>
    `;
    return;
  }

  movies.forEach((movie) => {
    const movieCard = document.createElement("div");
    movieCard.className = "movie-card";
    movieCard.innerHTML = `
      <img src="${movie.imageUrl}" alt="${escapeHtml(movie.title)}" class="movie-poster" loading="lazy">
      <div class="movie-info">
        <h3 class="movie-title">${escapeHtml(movie.title)}</h3>
      </div>
    `;

    movieCard.addEventListener("click", () => {
      openImagePreview(movie.imageUrl, movie.title, movie.time);
    });

    gallery.appendChild(movieCard);
  });
}

document.addEventListener("DOMContentLoaded", renderMovies);
