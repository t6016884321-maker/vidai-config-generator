const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const { gatewayUrl, TOOLS, COPY, ORIGIN } = require("../links.js");
const { judge, KEY_PLACEHOLDER } = require("../self-test.js");
const { build, KEY } = require("../config-gen.js");
const { summarize } = require("../cost-calc.js");

test("注册和充值链接只在一处拼出来源参数", () => {
  assert.equal(gatewayUrl("register", TOOLS.configGen), `${ORIGIN}/register?from=config-gen`);
  assert.equal(gatewayUrl("recharge", TOOLS.costCalc), `${ORIGIN}/purchase?from=cost-calc`);
  assert.equal(COPY.button, "¥9.9 入坑");
  assert.equal(COPY.slogan, "9.9 元入坑，我们不免费，但我们真的帮你解决问题");
  assert.throws(() => gatewayUrl("register", "not-a-tool"));
  assert.throws(() => gatewayUrl("home", TOOLS.configGen));
});

test("自测判定：200 通过，密钥和认证失败不通过", () => {
  assert.equal(judge("").status, "empty");
  assert.equal(judge("HTTP_STATUS:200\n{\"id\":\"msg_1\",\"type\":\"message\"}").status, "pass");
  assert.equal(judge(`HTTP_STATUS:200\n用的是 ${KEY_PLACEHOLDER}`).status, "pass");
  assert.equal(judge("HTTP_STATUS:401\n{\"code\":\"INVALID_API_KEY\"}").status, "auth");
  assert.equal(judge("HTTP_STATUS:200\n{\"type\":\"error\",\"error\":{}}").status, "http-error");
  assert.equal(judge("HTTP_STATUS:404\nmodel_not_found").status, "model");
  assert.equal(judge("HTTP_STATUS:402\ninsufficient_quota").status, "quota");
  assert.equal(judge("HTTP_STATUS:200\nsk-realkey1234567890").status, "secret");
});

test("配置里只有占位符，并按客户端选择接口", () => {
  const claude = build({ client: "claude", os: "mac", model: "控制台里的 Claude", persist: false });
  assert.match(claude.config, /ANTHROPIC_BASE_URL/);
  assert.match(claude.config, new RegExp(KEY));
  assert.match(claude.curl, /\/v1\/messages/);
  assert.doesNotMatch(claude.curl, /sk-[A-Za-z0-9]{8,}/);
  assert.match(claude.curl, /你的胃袋AI_API_KEY/);

  const windows = build({ client: "codex", os: "windows", model: "o'reilly", persist: true });
  assert.match(windows.curl, /^curl\.exe /);
  assert.match(windows.curl, /\/v1\/responses/);
  assert.match(windows.config, /wire_api = "responses"/);
  assert.match(windows.shell, /OPENAI_API_KEY/);

  const dropped = build({ client: "cc-switch", os: "linux", model: "sk-shouldnotappear12345", persist: true });
  assert.equal(dropped.model, "从控制台复制的模型名");
  assert.doesNotMatch(dropped.config, /sk-shouldnotappear12345/);
  assert.match(dropped.config, /OpenAI Responses API/);
  assert.equal(dropped.shell, "");
});

test("成本计算器不产出金额", () => {
  const result = summarize({
    model: "GPT",
    inputTokens: "30000",
    outputTokens: "",
    cachedTokens: "0",
    tasks: "10",
    attempts: "1.2",
    success: "80"
  });
  assert.equal(result.ok, true);
  assert.equal(result.cost, "待定");
  assert.equal(result.unitPrice, "待定");
  assert.equal(result.exchangeRate, "待定");
  assert.equal(result.quota, "待定");
  assert.equal(result.inputTokens, 30000);
  assert.equal(result.billedAttempts, 12);
  const empty = summarize({ model: "Claude", inputTokens: "", outputTokens: "", cachedTokens: "", tasks: "", attempts: "", success: "" });
  assert.equal(empty.ok, false);
});

test("页面和资料不再写赠送、首单或编造额度", () => {
  const files = [];
  for (const entry of fs.readdirSync(root)) {
    if (!/\.(html|js|json|txt|md)$/.test(entry)) continue;
    files.push(path.join(root, entry));
  }
  const banned = ["5SM2BCS7ML2H", "$50", "50 美元", "首充", "首单", "邀请奖励", "邀请入口", "免费试用", "5% 奖励", "试用"];
  const hits = [];
  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    for (const word of banned) {
      if (text.includes(word)) hits.push(`${path.basename(file)}: ${word}`);
    }
  }
  assert.deepEqual(hits, []);
});

test("指向注册或充值的页面链接都交给 links.js", () => {
  const htmlFiles = fs.readdirSync(root).filter((name) => name.endsWith(".html"));
  for (const name of htmlFiles) {
    const text = fs.readFileSync(path.join(root, name), "utf8");
    assert.equal(text.includes("api.david-ai.net/register"), false, name);
    assert.equal(text.includes("api.david-ai.net/purchase"), false, name);
    if (text.includes("data-vidai-kind")) assert.match(text, /src="links\.js"/, name);
  }
  assert.match(fs.readFileSync(path.join(root, "index.html"), "utf8"), /data-vidai-tool="config-gen"/);
  assert.match(fs.readFileSync(path.join(root, "codex-api-real-cost.html"), "utf8"), /data-vidai-tool="cost-calc"/);
  assert.match(fs.readFileSync(path.join(root, "index.html"), "utf8"), /id="recharge" hidden/);
  assert.match(fs.readFileSync(path.join(root, "codex-api-real-cost.html"), "utf8"), /id="recharge" hidden/);
});
