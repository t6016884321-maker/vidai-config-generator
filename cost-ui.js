(function () {
  function value(id) { return document.getElementById(id).value; }
  function selectedModel() {
    const picked = document.querySelector("[data-model][aria-checked='true']");
    return picked ? picked.dataset.model : "";
  }

  function render(result) {
    const box = document.getElementById("costResult");
    const recharge = document.getElementById("recharge");
    box.replaceChildren();
    if (!result.ok) {
      recharge.hidden = true;
      box.className = "judge bad";
      box.textContent = result.errors.join("");
      return;
    }
    box.className = "metrics";
    const lines = [
      ["模型", result.model],
      ["输入 Token", String(result.inputTokens)],
      ["输出 Token", String(result.outputTokens)],
      ["缓存输入 Token", String(result.cachedTokens)],
      ["输入 / 输出 / 缓存单价", result.unitPrice],
      ["汇率", result.exchangeRate],
      ["估算花费", result.cost]
    ];
    if (result.billedAttempts != null) lines.push(["计费尝试总次数", String(Math.round(result.billedAttempts * 100) / 100)]);
    if (result.successTasks != null) lines.push(["预计成功任务", String(Math.round(result.successTasks * 100) / 100)]);
    lines.forEach(([name, text]) => {
      const row = document.createElement("div");
      row.className = "metric";
      const label = document.createElement("span");
      label.textContent = name;
      const strong = document.createElement("b");
      if (text === "待定") {
        const mark = document.createElement("span");
        mark.className = "pending";
        mark.textContent = "待定";
        strong.appendChild(mark);
      } else {
        strong.textContent = text;
      }
      row.append(label, strong);
      box.appendChild(row);
    });
    const note = document.createElement("p");
    note.className = "fine";
    note.textContent = "花费、单价和汇率都是待定。这里没有使用任何编造的价格，不能当成报价。计费尝试和成功任务只是把你填的次数做乘法。";
    box.appendChild(note);
    recharge.hidden = false;
  }

  function boot() {
    document.querySelectorAll("[data-model]").forEach((button) => {
      button.addEventListener("click", () => {
        document.querySelectorAll("[data-model]").forEach((item) => {
          item.setAttribute("aria-checked", item === button ? "true" : "false");
        });
      });
    });
    document.getElementById("calc").addEventListener("click", () => {
      render(VidaiCost.summarize({
        model: selectedModel(),
        inputTokens: value("inputTokens"),
        outputTokens: value("outputTokens"),
        cachedTokens: value("cachedTokens"),
        tasks: value("tasks"),
        attempts: value("attempts"),
        success: value("success")
      }));
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
