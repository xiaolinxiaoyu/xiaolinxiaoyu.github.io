// ===== 计算在一起天数（按本地日期，避免凌晨误差）=====
const startDate = new Date(2025, 10, 25); // 月份从 0 开始：10=11月
const today = new Date();
const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
const diffTime = todayDate - startDate;
const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
document.getElementById("days").innerText = `已经在一起 ${days} 天啦 💕`;

