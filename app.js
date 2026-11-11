(function () {
  const state = { client: "claude", os: "mac", model: "", persist: false };

  function $(id) { return document.getElementById(id); }

  function setPressed(group, value, attr) {
    document.querySelectorAll(group).forEach((button) => {
      const on = button.dataset[attr] === value;
      button.setAttribute("aria-checked", on ? "true" : "false");
    });
  }

  async function copyText(text, status) {
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = "已复制。请在本机替换占位符，不要公开真实密钥。";
    } catch (err) {
      status.textContent = "浏览器没有给剪贴板权限，请手动选择复制。";
    }
  }

  function render() {
    const built = VidaiConfig.build(state);
    $("configTitle").textContent = built.title;
    $("configPath").textContent = built.path;
    $("configOut").textContent = built.config;
    $("curlOut").textContent = built.curl;
    const shellWrap = $("shellWrap");
    shellWrap.hidden = !built.shell;
    $("shellOut").textContent = built.shell;
    const notes = $("notes");
    notes.replaceChildren();
    built.notes.forEach((note) => {
      const item = document.createElement("li");
      item.textContent = note;
      notes.appendChild(item);
    });
    $("modelHint").hidden = Boolean(state.model.trim());
    $("persistLabel").hidden = state.client === "cc-switch";
  }

  function judgePaste() {
    const result = VidaiSelfTest.judge($("paste").value);
    const box = $("judge");
    const recharge = $("recharge");
    const heading = $("rechargeHeading");
    box.className = "judge";
    const messages = {
      empty: "把终端输出贴到这里。不要贴 API Key。",
      secret: "这段内容里像是有真实密钥。请删掉密钥，只保留 HTTP_STATUS 和响应正文。",
      auth: "网关没有接受这把 Key。先确认占位符已经换成控制台里的 Key。还没有 Key 的话，用上面的注册入口。",
      model: "请求到了网关，但模型名对不上。请从控制台复制当前的 Claude、GPT 或 Grok 模型名，改完再跑。",
      quota: "这次没有跑通，响应里提到余额不足。充值后用同一条命令再测一次。",
      "http-error": `返回了 HTTP ${result.code}，还不能算跑通。请看正文里的错误信息，不要根据这一次去充值。`,
      unrecognized: "没有看到 HTTP_STATUS。请把整段输出贴回来，要包含 HTTP_STATUS 那一行。"
    };
    if (result.status === "pass") {
      box.className = "judge good";
      box.textContent = "自测通过：HTTP 200，正文里没有错误码。下面是充值入口。";
      heading.textContent = "第一次调用已经跑通";
      recharge.hidden = false;
      recharge.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (result.status === "quota") {
      box.className = "judge bad";
      box.textContent = messages.quota;
      heading.textContent = "余额不足，先充值再测";
      recharge.hidden = false;
      return;
    }
    recharge.hidden = true;
    if (result.status !== "empty") box.className = "judge bad";
    box.textContent = messages[result.status] || messages.unrecognized;
  }

  function boot() {
    document.querySelectorAll("[data-client]").forEach((button) => {
      button.addEventListener("click", () => {
        state.client = button.dataset.client;
        setPressed("[data-client]", state.client, "client");
        render();
      });
    });
    document.querySelectorAll("[data-os]").forEach((button) => {
      button.addEventListener("click", () => {
        state.os = button.dataset.os;
        setPressed("[data-os]", state.os, "os");
        render();
      });
    });
    $("model").addEventListener("input", () => {
      state.model = $("model").value;
      render();
    });
    $("persist").addEventListener("change", () => {
      state.persist = $("persist").checked;
      render();
    });
    $("copyConfig").addEventListener("click", () => copyText($("configOut").textContent, $("copyState")));
    $("copyCurl").addEventListener("click", () => copyText($("curlOut").textContent, $("copyState")));
    $("copyShell").addEventListener("click", () => copyText($("shellOut").textContent, $("copyState")));
    $("checkPaste").addEventListener("click", judgePaste);
    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
