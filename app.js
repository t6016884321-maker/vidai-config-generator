const state = { tool: "codex", os: "mac" };
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function cleanSingleLine(value, fallback) {
  const cleaned = value.replace(/[\u0000-\u001f\u007f]/g, "").trim();
  return cleaned || fallback;
}

function tomlString(value) {
  return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

function posixQuote(value) {
  return `'${value.replaceAll("'", `'"'"'`)}'`;
}

function powershellQuote(value) {
  return `'${value.replaceAll("'", "''")}'`;
}

function normalizedBaseUrl(value) {
  const fallback = "https://api.david-ai.net";
  const raw = cleanSingleLine(value, fallback);
  try {
    const parsed = new URL(raw);
    const localHttp = parsed.protocol === "http:" && ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname);
    if (parsed.username || parsed.password || parsed.search || parsed.hash || (parsed.protocol !== "https:" && !localHttp)) {
      throw new Error("unsafe URL");
    }
    return { value: parsed.href.replace(/\/$/, ""), valid: true };
  } catch {
    return { value: fallback, valid: false };
  }
}

function shellExport(name, value) {
  if (state.os === "windows") {
    return `$env:${name}=${powershellQuote(value)}`;
  }
  return `export ${name}=${posixQuote(value)}`;
}

function persistLines(name, value) {
  if (!$("#persist").checked) return "";
  if (state.os === "windows") {
    return `\n\n# 长期保存（新终端生效）\n[Environment]::SetEnvironmentVariable(${powershellQuote(name)}, ${powershellQuote(value)}, 'User')`;
  }
  const profile = state.os === "mac" ? "~/.zshrc" : "~/.bashrc";
  return `\n\n# 长期保存\nprintf '%s\\n' ${posixQuote(shellExport(name, value))} >> ${profile}\nsource ${profile}`;
}

function codexOutput() {
  const model = cleanSingleLine($("#model").value, "从胃袋AI控制台复制的模型名");
  return `# 1. 编辑用户级配置文件 ~/.codex/config.toml\n\nmodel = "${tomlString(model)}"\nmodel_provider = "vidai"\n\n[model_providers.vidai]\nname = "胃袋AI"\nbase_url = "https://api.david-ai.net/v1"\nenv_key = "OPENAI_API_KEY"\nwire_api = "responses"\n\n# 2. 在终端设置密钥（请替换占位符）\n${shellExport("OPENAI_API_KEY", "你的胃袋AI_API_KEY")}${persistLines("OPENAI_API_KEY", "你的胃袋AI_API_KEY")}\n\n# 3. 启动\ncd 你的项目目录\ncodex`;
}

function claudeOutput() {
  const baseResult = normalizedBaseUrl($("#claudeBase").value);
  const base = baseResult.value;
  $("#claudeBase").setCustomValidity(baseResult.valid ? "" : "请输入不含账号、查询参数或锚点的 HTTPS 地址");
  $("#claudeHint").textContent = baseResult.valid
    ? "如控制台提供单独的 Claude Code 地址，请用控制台地址替换。"
    : "地址格式无效，生成结果已安全回退到胃袋AI公开地址。";
  $("#claudeHint").classList.toggle("error", !baseResult.valid);
  return `# 1. 在终端设置胃袋AI Claude Code 地址与密钥\n${shellExport("ANTHROPIC_BASE_URL", base)}\n${shellExport("ANTHROPIC_AUTH_TOKEN", "你的胃袋AI_API_KEY")}${persistLines("ANTHROPIC_BASE_URL", base)}${persistLines("ANTHROPIC_AUTH_TOKEN", "你的胃袋AI_API_KEY")}\n\n# 2. 启动\ncd 你的项目目录\nclaude\n\n# 如果胃袋AI控制台给出专用地址或变量，请以控制台为准。`;
}

function render() {
  const codex = state.tool === "codex";
  $("#codexFields").hidden = !codex;
  $("#claudeFields").hidden = codex;
  $("#outputTitle").textContent = codex ? "Codex 配置" : "Claude Code 配置";
  $("#output").textContent = codex ? codexOutput() : claudeOutput();
  $("#nextSteps").innerHTML = codex
    ? "<li>把 TOML 部分保存到用户级 <code>~/.codex/config.toml</code>，不要放入项目仓库。</li><li>在同一个终端设置密钥后运行 <code>codex</code>。</li><li>遇到 401 检查环境变量；遇到模型错误，核对控制台模型名。</li>"
    : "<li>先在胃袋AI控制台确认 Claude Code 专用地址和可用模型。</li><li>在同一个终端设置变量后运行 <code>claude</code>。</li><li>请勿将含真实密钥的命令截图、分享或提交到 Git。</li>";
}

function activate(group, button, key) {
  group.forEach((item) => { item.classList.remove("active"); item.setAttribute("aria-checked", "false"); });
  button.classList.add("active"); button.setAttribute("aria-checked", "true");
  state[key] = button.dataset[key];
  render();
}

const toolButtons = $$("#toolTabs button");
const osButtons = $$("#osTabs button");
toolButtons.forEach((button) => button.addEventListener("click", () => activate(toolButtons, button, "tool")));
osButtons.forEach((button) => button.addEventListener("click", () => activate(osButtons, button, "os")));
[$("#model"), $("#claudeBase"), $("#persist")].forEach((item) => item.addEventListener("input", render));

$("#copyBtn").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText($("#output").textContent);
    $("#copyState").textContent = "✓ 已复制，可以粘贴到终端或配置文件";
    $("#copyBtn").textContent = "已复制";
    setTimeout(() => { $("#copyState").textContent = ""; $("#copyBtn").textContent = "复制全部"; }, 2200);
  } catch {
    $("#copyState").textContent = "浏览器未授予剪贴板权限，请手动选择复制。";
  }
});

render();
