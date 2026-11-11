(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.VidaiSelfTest = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const KEY_PLACEHOLDER = "你的胃袋AI_API_KEY";

  function looksLikeSecret(text) {
    const stripped = text.split(KEY_PLACEHOLDER).join("");
    if (/sk-[A-Za-z0-9_-]{12,}/.test(stripped)) return true;
    if (/Bearer\s+(?!你的胃袋AI_API_KEY\b)[A-Za-z0-9._-]{16,}/.test(stripped)) return true;
    if (/x-api-key:\s*(?!你的胃袋AI_API_KEY\b)\S{12,}/i.test(stripped)) return true;
    return false;
  }

  function statusCode(text) {
    const marked = text.match(/HTTP_STATUS:\s*(\d{3})/i);
    if (marked) return Number(marked[1]);
    const http = text.match(/HTTP\/\d(?:\.\d)?\s+(\d{3})/);
    return http ? Number(http[1]) : null;
  }

  function judge(raw) {
    const text = String(raw || "").replace(/[\u0000]/g, "").trim();
    if (!text) return { status: "empty", code: null };
    if (looksLikeSecret(text)) return { status: "secret", code: null };
    const code = statusCode(text);
    const authFail = code === 401 || code === 403 || /API_KEY_REQUIRED|INVALID_API_KEY/.test(text);
    const modelFail = /model[_\s-]?not[_\s-]?found|model_not_found|无可用模型|模型不存在/i.test(text);
    const quotaFail = code === 402 || /insufficient[_\s-]?quota|insufficient[_\s-]?balance|payment required|余额不足|额度不足/i.test(text);
    const errorBody = /"type"\s*:\s*"error"|"code"\s*:\s*"[^"]+"/.test(text);
    if (authFail) return { status: "auth", code };
    if (modelFail) return { status: "model", code };
    if (quotaFail && code !== 200) return { status: "quota", code };
    if (code === 200 && !errorBody) return { status: "pass", code };
    if (code != null) return { status: "http-error", code };
    return { status: "unrecognized", code: null };
  }

  return { KEY_PLACEHOLDER, looksLikeSecret, judge };
});
