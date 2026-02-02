// ===== 计算在一起天数 =====
const startDate = new Date("2025-11-25");
const today = new Date();
const diffTime = today - startDate;
const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
document.getElementById("days").innerText = `已经在一起 ${days} 天啦 💕`;

