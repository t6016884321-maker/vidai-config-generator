const state = { os: "mac" };
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const registrationBase = "https://api.david-ai.net/register";
const campaign = "codex_proof_202609";
const affiliateCode = "5SM2BCS7ML2H";

function setTrackedLinks() {
  $$(".tracked-register").forEach((link) => {
    const url = new URL(registrationBase);
    url.searchParams.set("aff", affiliateCode);
    url.searchParams.set("utm_source", link.dataset.source);
    url.searchParams.set("utm_medium", "organic");
    url.searchParams.set("utm_campaign", campaign);
    link.href = url.toString();
    link.target = "_blank";
    link.rel = "noopener";
  });
}

function cleanSingleLine(value, fallback) {
  const cleaned = value.replace(/[\u0000-\u001f\u007f]/g, "").trim();
  return cleaned || fallback;
}
function tomlString(value) { return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"'); }
function shellQuote(value) { return state.os === "windows" ? `'${value.replaceAll("'", "''")}'` : `'${value.replaceAll("'", `'"'"'`)}'`; }
function exportLine(name, value) { return state.os === "windows" ? `$env:${name}=${shellQuote(value)}` : `export ${name}=${shellQuote(value)}`; }
function persistence(name, value) {
  if (!$("#persist").checked) return "";
  if (state.os === "windows") return `\n[Environment]::SetEnvironmentVariable(${shellQuote(name)}, ${shellQuote(value)}, 'User')`;
  const profile = state.os === "mac" ? "~/.zshrc" : "~/.bashrc";
  return `\nprintf '%s\\n' ${shellQuote(exportLine(name, value))} >> ${profile}\nsource ${profile}`;
}
function render() {
  const model = cleanSingleLine($("#model").value, "从胃袋AI控制台复制的模型名");
  const key = "你的胃袋AI_API_KEY";
  $("#output").textContent = `# 用户级配置：~/.codex/config.toml\nmodel = "${tomlString(model)}"\nmodel_provider = "vidai"\n\n[model_providers.vidai]\nname = "胃袋AI"\nbase_url = "https://api.david-ai.net/v1"\nenv_key = "OPENAI_API_KEY"\nwire_api = "responses"\n\n# 在启动 Codex 的同一终端设置密钥\n${exportLine("OPENAI_API_KEY", key)}${persistence("OPENAI_API_KEY", key)}\n\n# 启动前先进入你的项目目录\ncd 你的项目目录\ncodex`;
}
const osButtons = $$("#osTabs button");
osButtons.forEach((button) => button.addEventListener("click", () => {
  osButtons.forEach((item) => { item.classList.remove("active"); item.setAttribute("aria-checked", "false"); });
  button.classList.add("active"); button.setAttribute("aria-checked", "true"); state.os = button.dataset.os; render();
}));
[$("#model"), $("#persist")].forEach((item) => item.addEventListener("input", render));
$("#copyBtn").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText($("#output").textContent);
    $("#copyState").textContent = "✓ 已复制。请在本机替换占位符，不要公开真实密钥。";
    $("#copyBtn").textContent = "已复制";
    setTimeout(() => { $("#copyState").textContent = ""; $("#copyBtn").textContent = "复制全部"; }, 2600);
  } catch { $("#copyState").textContent = "浏览器未授予剪贴板权限，请手动选择复制。"; }
});
setTrackedLinks(); render();
