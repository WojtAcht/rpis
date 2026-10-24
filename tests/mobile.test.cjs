const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { after, before, test } = require("node:test");
const { chromium } = require("playwright");

// Wygenerowana strona w przeglądarce na ekranie telefonu (375×812).
const site = path.resolve(__dirname, "../_site");
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".png": "image/png" };
let server, browser, base;

before(async () => {
  server = http.createServer((req, res) => {
    let file = path.join(site, decodeURIComponent(new URL(req.url, "http://x").pathname));
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    if (!file.startsWith(site) || !fs.existsSync(file)) return res.writeHead(404).end();
    res.writeHead(200, { "content-type": TYPES[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  await new Promise(resolve => server.listen(0, resolve));
  base = `http://localhost:${server.address().port}/`;
  browser = await chromium.launch();
});

after(async () => {
  await browser?.close();
  server?.close();
});

async function phone(options = {}) {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, ...options });
  return { context, page: await context.newPage() };
}

function pages(dir = site, rel = "") {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(d => {
    if (d.isDirectory()) return pages(path.join(dir, d.name), `${rel}${d.name}/`);
    return d.name === "index.html" ? [rel] : [];
  });
}

test("żadna strona nie przewija się w poziomie na telefonie", async () => {
  const { context, page } = await phone();
  const wide = [];
  for (const rel of pages()) {
    await page.goto(base + rel, { waitUntil: "load" });
    const width = await page.evaluate(() => document.documentElement.scrollWidth);
    if (width > 375) wide.push(`${rel || "/"}: ${width}px`);
  }
  await context.close();
  assert.deepEqual(wide, []);
});

test("nawigacja: główne pozycje widoczne, reszta w menu", async () => {
  const { context, page } = await phone();
  await page.goto(base + "zadania/", { waitUntil: "load" });
  for (const name of ["Zadania", "Quizy", "Materiały"]) {
    const box = await page.locator(".topbar nav > a", { hasText: name }).boundingBox();
    assert.ok(box && box.x >= 0 && box.x + box.width <= 375, `${name} mieści się w pasku`);
  }
  await page.tap(".nav-more summary");
  for (const href of ["../kolokwium-1/zagadnienia/", "../kolokwium-2/zagadnienia/", "../#prezentacje"]) {
    assert.ok(await page.locator(`.nav-menu a[href="${href}"]`).isVisible(), href);
  }
  await page.keyboard.press("Escape");
  assert.equal(await page.locator(".nav-menu").isVisible(), false);
  await context.close();
});

test("strona główna: trzy główne wejścia bez przewijania, także bez JS", async () => {
  const { context, page } = await phone({ javaScriptEnabled: false });
  await page.goto(base, { waitUntil: "load" });
  const tiles = await page.locator(".tile").evaluateAll(nodes => nodes.map(n => ({
    href: n.querySelector(".tile-link").getAttribute("href"), bottom: n.getBoundingClientRect().bottom,
  })));
  for (const href of ["/zagadnienia/", "./zadania/", "./quizy/"]) {
    const tile = tiles.find(t => t.href.endsWith(href));
    assert.ok(tile && tile.bottom <= 812, `${href} widoczne na pierwszym ekranie`);
  }
  await context.close();
});

test("bank zadań: pierwsze zadanie na pierwszym ekranie, filtry i treść do rozwinięcia", async () => {
  const { context, page } = await phone();
  await page.goto(base + "zadania/", { waitUntil: "load" });
  const card = page.locator(".task-card").first();
  assert.ok((await card.boundingBox()).y < 812);
  assert.equal(await page.locator("#filters-extra").isVisible(), false);
  await page.tap("#filters-toggle");
  await page.tap('#filters-extra button[data-exam="kolokwium-2"]');
  assert.equal(await page.textContent("#filters-badge"), "1");
  assert.equal(await card.locator(".statement").isVisible(), false);
  await card.locator(".card-toggle").tap();
  assert.ok(await card.locator(".statement").isVisible());
  await context.close();
});

test("quiz: wyjaśnienie i „Dalej” widoczne po odpowiedzi", async () => {
  const { context, page } = await phone();
  await page.goto(base + "quizy/kahoot-1/", { waitUntil: "load" });
  const count = await page.locator(".question").count();
  for (let i = 0; i < count; i++) {
    const q = page.locator(".question:not([hidden])");
    await q.locator(".option").first().tap();
    const next = q.locator(".quiz-next");
    await page.waitForFunction(el => {
      const r = el.getBoundingClientRect();
      return r.top >= 0 && r.bottom <= innerHeight;
    }, await next.elementHandle(), { timeout: 2000 });
    await next.tap();
  }
  assert.ok(await page.locator("#quiz-summary").isVisible());
  await context.close();
});
