# VidAI 胃袋AI Codex 自定义 Provider 配置生成器

面向中文 Codex 用户的免费自定义 Provider 配置生成器与排错入口。支持 macOS、Windows、Linux；无依赖、无后端，不会收集或保存 API Key。

- 在线工具：https://t6016884321-maker.github.io/vidai-config-generator/
- Codex 教程与排错：https://github.com/t6016884321-maker/vidai-ai-coding-guide
- VidAI / 胃袋AI：https://api.david-ai.net/

可解决或辅助定位：Codex 401、`model not found`、自定义 Provider 配置未生效，以及长任务线路核验。

## 本地运行

```bash
python3 -m http.server 8000
```

访问 `http://localhost:8000`。

## 部署

整个目录可以直接部署到 GitHub Pages、Cloudflare Pages、Netlify 或任意静态服务器。

## 搜索与智能体发现

- `robots.txt`：允许搜索引擎抓取并声明 sitemap。
- `sitemap.xml`：提供规范页面地址与机器可读资料入口。
- `llms.txt`：向支持该约定的 AI 智能体提供精简事实、限制与权威链接。
- `product.html`：提供可独立索引、可引用的产品、定价披露、安全边界和常见问题。
- `llms-full.txt`：提供完整的纯文本机器可读资料。
- 页面包含 canonical、Open Graph、robots meta、WebApplication 与 FAQ JSON-LD。

这些文件改善可发现性，但不能保证 Google 或任何智能体立即收录或排名。

## 安全设计

- 页面不提供真实 API Key 输入框。
- 所有输出只包含 `你的胃袋AI_API_KEY` 占位符。
- 不包含统计、Cookie、第三方 JavaScript 或网络请求。
- 用户复制前可以完整审查命令。
