# love-space

纯静态网站，可直接部署到 GitHub Pages。

## 本地预览

直接双击 `index.html`，或用任意静态服务器打开项目目录。

## 观影墙数据

电影卡片数据在 `js/movies.js` 的 `movies` 数组里，按下面格式手动添加：

```js
{
  id: 3,
  title: "电影名",
  imageUrl: "images/xxx.jpg",
  time: "2026-02-10"
}
```

保存后刷新 `movies.html` 即可看到新卡片。
