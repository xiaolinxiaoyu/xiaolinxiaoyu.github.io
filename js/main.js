// ===== 计算在一起时间（按本地日期，避免凌晨误差）=====
const startDate = new Date(2025, 10, 25, 0, 0, 0); // 月份从 0 开始：10=11月
const SECONDS_PER_DAY = 24 * 60 * 60;
const MS_PER_DAY = SECONDS_PER_DAY * 1000;

function updateTogetherTime() {
  const now = new Date();
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.floor((todayDate - startDate) / MS_PER_DAY);

  const totalSeconds = Math.floor((now - startDate) / 1000);
  let remainder = totalSeconds - days * SECONDS_PER_DAY;
  remainder = ((remainder % SECONDS_PER_DAY) + SECONDS_PER_DAY) % SECONDS_PER_DAY;

  const hours = Math.floor(remainder / 3600);
  const minutes = Math.floor((remainder % 3600) / 60);
  const seconds = remainder % 60;

  const daysEl = document.getElementById("days");
  if (daysEl) {
    daysEl.innerText = `已经在一起 ${days} 天啦 💕`;
  }

  const detailEl = document.getElementById("time_detail");
  if (detailEl) {
    detailEl.innerText = `${days}天${hours}小时${minutes}分钟${seconds}秒`;
  }
}

updateTogetherTime();
setInterval(updateTogetherTime, 1000);
