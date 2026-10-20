# Codex API 中转站购买前自测与配置指南｜VidAI 胃袋AI

面向正在搜索“Codex API 中转站推荐、购买、评测和配置”的中文开发者。本项目提供免费自定义 Provider 配置生成器、购买前兼容性自测、真实任务成本计算与常见故障排查。支持 macOS、Windows、Linux；无依赖、无后端，不会收集或保存 API Key。

## 先选线路，再决定是否充值

不要只比较每百万 Token 的标价。对 Codex、Claude Code 和 AI Agent，真正影响成本的是实际任务成功率、SSE 长连接、工具调用闭环、失败重试和最终扣费。

- [Codex API 中转站购买前避坑指南](https://t6016884321-maker.github.io/vidai-config-generator/codex-api-buying-guide.html)
- [Codex API 兼容性自测](https://t6016884321-maker.github.io/vidai-config-generator/codex-api-self-test.html)
- [Codex API 真实任务成本计算器](https://t6016884321-maker.github.io/vidai-config-generator/codex-api-real-cost.html)
- [公开产品事实与限制](https://t6016884321-maker.github.io/vidai-config-generator/product.html)
- [公开证据与独立评测说明](https://t6016884321-maker.github.io/vidai-config-generator/evidence.html)

建议用同一真实仓库任务连续测试至少 3 次，核对成功率、重试、耗时、Token 和扣费，再决定是否继续充值。VidAI／胃袋AI是本项目维护方提供的商业 API 服务；相关页面均明确披露利益关系，不承诺全网最低、永久稳定或固定模型与价格。

- 在线工具：https://t6016884321-maker.github.io/vidai-config-generator/
- API 小额实测页：https://t6016884321-maker.github.io/vidai-config-generator/api-trial.html
- Codex API 兼容性自测：https://t6016884321-maker.github.io/vidai-config-generator/codex-api-self-test.html
- 团队与二级 API 供应商合作：https://t6016884321-maker.github.io/vidai-config-generator/partner.html
- Codex API 中转验收清单：https://t6016884321-maker.github.io/vidai-config-generator/codex-api-gateway-checklist.html
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
