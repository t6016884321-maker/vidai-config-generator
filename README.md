# 胃袋AI配置生成器

纯静态 Codex / Claude Code 配置生成器。无依赖、无后端、不会收集 API Key。

## 本地运行

```bash
python3 -m http.server 8000
```

访问 `http://localhost:8000`。

## 部署

整个目录可以直接部署到 GitHub Pages、Cloudflare Pages、Netlify 或任意静态服务器。

## 安全设计

- 页面不提供真实 API Key 输入框。
- 所有输出只包含 `你的胃袋AI_API_KEY` 占位符。
- 不包含统计、Cookie、第三方 JavaScript 或网络请求。
- 用户复制前可以完整审查命令。
