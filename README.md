# love-space

## 本地运行后端

```bash
npm install
npm start
```

打开 `http://localhost:3000/movies.html`。

## 部署到 Render（后端）

1. 把仓库推到 GitHub。
2. Render 新建 `Web Service`，连接这个仓库。
3. Build Command: `npm install`
4. Start Command: `npm start`
5. 环境变量里设置 `PUBLIC_BASE_URL` 为你的 Render 域名（例如 `https://xxx.onrender.com`）。
6. 部署完成后，记住后端地址：`https://xxx.onrender.com`

## 配置 GitHub Pages 前端调用 Render

编辑 `movies.html` 里的这一行：

```html
<meta name="api-base-url" content="https://xxx.onrender.com">
```

把 `https://xxx.onrender.com` 换成你真实的 Render 地址，然后提交并推送到 GitHub Pages。

## 说明

- GitHub Pages 只托管静态页面，不能运行 Node.js。
- 当前方案是：前端在 GitHub Pages，后端在 Render。
- 图片会上传到 Render 实例的本地磁盘。免费实例重启后可能丢失文件；要长期保存建议后续接入云存储（如 Cloudinary/S3）。
