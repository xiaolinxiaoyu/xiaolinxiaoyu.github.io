
const movies = [
   {
    id: 1,
    title: "La La Land",
    imageUrl: "images/us.jpg",
    time: '2023-1-1'
  },
  {
    id: 1,
    title: "La La Land",
    imageUrl: "images/us.jpg",
    time: '2023-1-1'
  },
];

const movie_num = movies.length;
document.getElementById("movie_num").innerText = `林鱼在一起看了 ${movie_num} 部作品！💕`;

// 页面加载完成后初始化电影画廊
document.addEventListener('DOMContentLoaded', function() {
  const gallery = document.getElementById('movieGallery');
  
  // 如果画廊不存在，退出
  if (!gallery) return;
  
  // 清空画廊
  gallery.innerHTML = '';
  
  // 如果没有电影数据，显示空状态
  if (movies.length === 0) {
    gallery.innerHTML = `
      <div class="empty-state">
        <p>还没有添加影片咧~</p>
        <p>快去添加吧！</p>
      </div>
    `;
    return;
  }
  
  // 创建电影卡片
  movies.forEach(movie => {
  const movieCard = document.createElement('div');
  movieCard.className = 'movie-card';
  movieCard.innerHTML = `
    <img src="${movie.imageUrl}" alt="${movie.alt}" class="movie-poster" loading="lazy">
    <div class="movie-info">
      <h3 class="movie-title">${movie.title}</h3>
    </div>
  `;
  
  // 修改点击事件：点击卡片弹出预览
  movieCard.addEventListener('click', function() {
    openImagePreview(movie.imageUrl, movie.title, movie.time);
  });
  
  gallery.appendChild(movieCard);
});

// 新增：打开图片预览的函数
function openImagePreview(url, title, time) {
  // 创建遮罩层
  const overlay = document.createElement('div');
  overlay.className = 'image-preview-overlay';
  
  // 遮罩层内容：图片和标题
  overlay.innerHTML = `
    <div class="preview-content">
      <img src="${url}" alt="${title}">
      <p>影片名为${title}，观看于${time}。</p>
      
      <span class="close-btn">&times;</span>
    </div>
  `;
  
  // 点击遮罩层任何地方关闭
  overlay.onclick = () => document.body.removeChild(overlay);
  
  document.body.appendChild(overlay);
}
  
  // 添加页脚
  const footer = document.createElement('div');
  footer.className = 'footer';
  footer.innerHTML = `
    <p>🎞️ 已记录 ${movies.length} 部影片 | 💕 林鱼的观影回忆</p>
    <p>点击电影卡片可以查看详情哦~</p>
  `;
  
  // 将页脚添加到body中返回链接后面
  const backLink = document.querySelector('.back-link');
  if (backLink) {
    backLink.parentNode.insertBefore(footer, backLink.nextSibling);
  } else {
    document.body.appendChild(footer);
  }
});

// 添加动态效果 - 鼠标跟随效果
document.addEventListener('mousemove', function(e) {
  const cards = document.querySelectorAll('.movie-card');
  cards.forEach(card => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 计算鼠标在卡片上的位置（0到1之间）
    const xPercent = x / rect.width;
    const yPercent = y / rect.height;
    
    // 根据鼠标位置微调阴影
    const shadowX = (xPercent - 0.5) * 10;
    const shadowY = (yPercent - 0.5) * 10;
    
    // 只有当鼠标悬停在卡片上时才应用效果
    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      card.style.setProperty('--mouse-x', `${xPercent * 100}%`);
      card.style.setProperty('--mouse-y', `${yPercent * 100}%`);
    }
  });
});