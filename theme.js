(function () {
  const key = "vidai-theme";
  function current() {
    return document.documentElement.getAttribute("data-theme") || "light";
  }
  function apply(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem(key, theme); } catch (err) { /* 隐私模式不影响使用 */ }
    const button = document.querySelector("[data-theme-toggle]");
    if (!button) return;
    const dark = theme === "dark";
    button.textContent = dark ? "切换亮色" : "切换暗色";
    button.setAttribute("aria-pressed", dark ? "true" : "false");
  }
  function boot() {
    const button = document.querySelector("[data-theme-toggle]");
    if (!button) return;
    apply(current());
    button.addEventListener("click", () => apply(current() === "dark" ? "light" : "dark"));
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
