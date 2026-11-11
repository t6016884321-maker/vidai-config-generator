(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.VidaiConfig = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const KEY = "你的胃袋AI_API_KEY";
  const MODEL_FALLBACK = "从控制台复制的模型名";
  const CLIENTS = ["claude", "codex", "cc-switch"];
  const SYSTEMS = ["mac", "linux", "windows"];

  function clean(value) {
    return String(value || "").replace(/[\u0000-\u001f\u007f]/g, "").trim();
  }

  function looksLikeKey(value) {
    return /sk-[A-Za-z0-9_-]{8,}/.test(value) || /Bearer\s+\S{8,}/.test(value);
  }

  function bashSingle(value) {
    return `'${String(value).replaceAll("'", `'\\''`)}'`;
  }

  function psSingle(value) {
    return `'${String(value).replaceAll("'", "''")}'`;
  }

  function tomlString(value) {
    return String(value).replaceAll("\\", "\\\\").replaceAll('"', '\\"');
  }

  function shellExport(os, name, value) {
    if (os === "windows") return `$env:${name}=${psSingle(value)}`;
    return `export ${name}=${bashSingle(value)}`;
  }

  function persistence(os, name, value) {
    const line = shellExport(os, name, value);
    if (os === "windows") return `[Environment]::SetEnvironmentVariable(${psSingle(name)}, ${psSingle(value)}, 'User')`;
    const profile = os === "mac" ? "~/.zshrc" : "~/.bashrc";
    return `printf '%s\\n' ${bashSingle(line)} >> ${profile}\nsource ${profile}`;
  }

  function payload(client, model) {
    if (client === "claude") {
      return {
        url: "https://api.david-ai.net/v1/messages",
        body: { model, max_tokens: 16, messages: [{ role: "user", content: "ping" }] },
        headers: ["Content-Type: application/json", `Authorization: Bearer ${KEY}`, "anthropic-version: 2023-06-01"]
      };
    }
    return {
      url: "https://api.david-ai.net/v1/responses",
      body: { model, input: "ping" },
      headers: ["Content-Type: application/json", `Authorization: Bearer ${KEY}`]
    };
  }

  function curl(os, request) {
    const json = JSON.stringify(request.body);
    if (os === "windows") {
      const headers = request.headers.map((header) => `-H ${psSingle(header)}`).join(" ");
      return `curl.exe -sS -w "\`nHTTP_STATUS:%{http_code}\`n" ${headers} -d ${psSingle(json)} ${psSingle(request.url)}`;
    }
    const headers = request.headers.map((header) => `-H ${bashSingle(header)}`).join(" \\\n  ");
    return `curl -sS -w '\\nHTTP_STATUS:%{http_code}\\n' \\\n  ${headers} \\\n  -d ${bashSingle(json)} \\\n  ${bashSingle(request.url)}`;
  }

  function claudeConfig(model) {
    return JSON.stringify({
      env: {
        ANTHROPIC_BASE_URL: "https://api.david-ai.net",
        ANTHROPIC_AUTH_TOKEN: KEY,
        ANTHROPIC_MODEL: model
      }
    }, null, 2);
  }

  function codexConfig(model) {
    return [
      "# 用户级配置：~/.codex/config.toml",
      "# Windows：%USERPROFILE%\\.codex\\config.toml",
      `model = "${tomlString(model)}"`,
      'model_provider = "vidai"',
      "",
      "[model_providers.vidai]",
      'name = "胃袋AI"',
      'base_url = "https://api.david-ai.net/v1"',
      'env_key = "OPENAI_API_KEY"',
      'wire_api = "responses"'
    ].join("\n");
  }

  function ccSwitchConfig(model) {
    return [
      "在 CC Switch 的 Codex 页添加自定义供应商，填这些字段：",
      "显示名称：VidAI 胃袋AI",
      "Base URL：https://api.david-ai.net/v1",
      "上游格式：OpenAI Responses API",
      `API Key：${KEY}`,
      `模型 ID：${model}`,
      "",
      "切换后完全退出并重启 Codex。手动核对本地结构时，关键字段类似：",
      'model_provider = "custom"',
      `model = "${tomlString(model)}"`,
      "model_reasoning_effort = \"high\"",
      "disable_response_storage = true",
      "",
      "[model_providers.custom]",
      'name = "VidAI 胃袋AI"',
      'base_url = "https://api.david-ai.net/v1"',
      'wire_api = "responses"',
      "requires_openai_auth = true"
    ].join("\n");
  }

  function build(input) {
    const client = CLIENTS.includes(input.client) ? input.client : "claude";
    const os = SYSTEMS.includes(input.os) ? input.os : "mac";
    const rawModel = clean(input.model);
    const rejectedKey = looksLikeKey(rawModel);
    const model = rejectedKey ? MODEL_FALLBACK : (rawModel || MODEL_FALLBACK);
    const request = payload(client, model);
    const titles = {
      claude: "Claude Code 配置（settings.json）",
      codex: "Codex 配置（config.toml）",
      "cc-switch": "CC Switch 里的胃袋字段"
    };
    const paths = {
      claude: os === "windows" ? "%USERPROFILE%\\.claude\\settings.json" : "~/.claude/settings.json",
      codex: os === "windows" ? "%USERPROFILE%\\.codex\\config.toml" : "~/.codex/config.toml",
      "cc-switch": "CC Switch → Codex → 添加供应商"
    };
    let config = claudeConfig(model);
    if (client === "codex") config = codexConfig(model);
    if (client === "cc-switch") config = ccSwitchConfig(model);

    let shell = "";
    if (input.persist && client === "claude") {
      const names = [
        ["ANTHROPIC_BASE_URL", "https://api.david-ai.net"],
        ["ANTHROPIC_AUTH_TOKEN", KEY],
        ["ANTHROPIC_MODEL", model]
      ];
      shell = names.map(([name, value]) => `${shellExport(os, name, value)}\n${persistence(os, name, value)}`).join("\n\n");
    }
    if (input.persist && client === "codex") {
      shell = `${shellExport(os, "OPENAI_API_KEY", KEY)}\n${persistence(os, "OPENAI_API_KEY", KEY)}`;
    }

    const notes = [
      "把占位符换成你自己的 Key。不要把 Key 贴进网页、截图、仓库或群聊。",
      "模型只写 Claude、GPT、Grok，名称从控制台复制，不要照搬旧截图。",
      "Grok 的独立客户端模板还没有确认，这里不编造字段。控制台如果给出 Grok 模型名，把它填进模型那一项即可。"
    ];
    if (os === "windows") notes.push("Windows 命令在 PowerShell 里运行，请用 curl.exe。命令里的 `n 是换行，要保留。");
    if (client === "cc-switch") notes.push("CC Switch 开了本地路由时，Codex 地址可能是 127.0.0.1，那是本地转发，不等于没有走到胃袋。");
    if (rejectedKey) notes.unshift("模型名里像是密钥，已丢弃。Key 只替换配置里的占位符。");
    else if (!rawModel) notes.push("模型名还是占位符。不换成控制台里的名字，调用会失败，这不算线路故障。");

    return {
      client,
      os,
      model,
      title: titles[client],
      path: paths[client],
      config,
      shell,
      curl: curl(os, request),
      notes
    };
  }

  return { KEY, MODEL_FALLBACK, build };
});
