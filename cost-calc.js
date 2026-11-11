(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.VidaiCost = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const MODELS = ["Claude", "GPT", "Grok", "Gemini"];

  function parseTokens(value, blankIsZero) {
    if (value === "" || value == null) return blankIsZero ? 0 : null;
    if (typeof value === "number") {
      if (!Number.isInteger(value) || value < 0) return null;
      return value;
    }
    const text = String(value).trim();
    if (!/^\d+$/.test(text)) return null;
    const number = Number(text);
    if (!Number.isSafeInteger(number)) return null;
    return number;
  }

  function parseOptional(value, min, max) {
    if (value === "" || value == null) return { ok: true, value: null };
    const number = typeof value === "number" ? value : Number(String(value).trim());
    if (!Number.isFinite(number) || number < min || number > max) return { ok: false, value: null };
    return { ok: true, value: number };
  }

  function summarize(input) {
    const errors = [];
    const model = MODELS.includes(input.model) ? input.model : "";
    if (!model) errors.push("请选择 Claude、GPT、Grok 或 Gemini。");
    const inputTokens = parseTokens(input.inputTokens, true);
    const outputTokens = parseTokens(input.outputTokens, true);
    const cachedTokens = parseTokens(input.cachedTokens, true);
    if (inputTokens === null || outputTokens === null || cachedTokens === null) {
      errors.push("Token 用量要填非负整数。");
    } else if (inputTokens + outputTokens + cachedTokens <= 0) {
      errors.push("至少填一项大于 0 的 Token 用量。");
    }
    const tasks = parseOptional(input.tasks, 1, 1e9);
    const attempts = parseOptional(input.attempts, 1, 1e6);
    const success = parseOptional(input.success, 1, 100);
    if (!tasks.ok) errors.push("任务数要是大于等于 1 的数字，或者留空。");
    if (!attempts.ok) errors.push("平均尝试次数要大于等于 1，或者留空。");
    if (!success.ok) errors.push("成功率要在 1 到 100 之间，或者留空。");

    const billedAttempts = tasks.value != null && attempts.value != null ? tasks.value * attempts.value : null;
    const successTasks = tasks.value != null && success.value != null ? tasks.value * (success.value / 100) : null;

    return {
      ok: errors.length === 0,
      errors,
      model,
      inputTokens: inputTokens || 0,
      outputTokens: outputTokens || 0,
      cachedTokens: cachedTokens || 0,
      billedAttempts,
      successTasks,
      unitPrice: "待定",
      exchangeRate: "待定",
      cost: "待定"
    };
  }

  return { MODELS, summarize };
});
