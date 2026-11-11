(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.VidaiLinks = api;
  if (typeof document !== "undefined") {
    const boot = () => api.apply(document);
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
    else boot();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const ORIGIN = "https://api.david-ai.net";
  const PATHS = {
    register: "/register",
    recharge: "/purchase",
    // TODO: 上线前换成服务条款退款章节的地址。在那之前不要改成编造的链接。
    refundTerms: "#"
  };
  const TOOLS = {
    configGen: "config-gen",
    costCalc: "cost-calc",
    selfTest: "self-test",
    ccSwitch: "cc-switch",
    buyingGuide: "buying-guide",
    providerCompare: "provider-compare",
    troubleshoot: "troubleshoot",
    evidence: "evidence",
    partner: "partner",
    partnerKit: "partner-kit",
    recruit: "recruit",
    landing: "landing",
    apiTrial: "api-trial",
    reviewKit: "review-kit"
  };
  const COPY = {
    slogan: "9.9 元入坑，我们不免费，但我们真的帮你解决问题",
    button: "¥9.9 先跑一次真实仓库",
    refund: "不满意随时可退：联系客服申请，未使用部分原路退回",
    support: "官方 QQ 群 1026331764",
    refundLink: "查看完整规则",
    models: "Claude、GPT、Grok、Gemini",
    pending: "待定"
  };

  function fillSlogan(el) {
    el.replaceChildren();
    el.append("9.9 元入坑，");
    const em = document.createElement("em");
    em.textContent = "我们不免费，但我们真的帮你解决问题";
    el.append(em);
  }

  function gatewayUrl(kind, tool) {
    const path = PATHS[kind];
    if (!path) throw new Error("未知链接类型：" + kind);
    if (!Object.values(TOOLS).includes(tool)) throw new Error("未知工具来源：" + tool);
    const url = new URL(path, ORIGIN);
    url.searchParams.set("from", tool);
    return url.toString();
  }

  function apply(doc) {
    doc.querySelectorAll("[data-vidai-kind]").forEach((el) => {
      try {
        el.href = gatewayUrl(el.getAttribute("data-vidai-kind"), el.getAttribute("data-vidai-tool"));
        el.target = "_blank";
        el.rel = "noopener";
      } catch (err) {
        console.error(err);
      }
    });
    doc.querySelectorAll("[data-vidai-slogan]").forEach(fillSlogan);
    doc.querySelectorAll("[data-vidai-button]").forEach((el) => {
      el.textContent = COPY.button;
    });
    doc.querySelectorAll("[data-vidai-refund]").forEach((el) => {
      el.textContent = COPY.refund;
    });
    doc.querySelectorAll("[data-vidai-support]").forEach((el) => {
      el.textContent = COPY.support;
    });
    doc.querySelectorAll("[data-vidai-refund-link]").forEach((el) => {
      el.textContent = COPY.refundLink;
      el.setAttribute("href", PATHS.refundTerms);
      el.removeAttribute("target");
      el.removeAttribute("rel");
    });
  }

  return { ORIGIN, PATHS, TOOLS, COPY, gatewayUrl, apply };
});
