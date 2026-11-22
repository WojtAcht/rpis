// ZOO rozkładów: numeryka w zoo.js (sumy i całki, E, Var, dystrybuanty) i montowanie wszystkich kart strony.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const { JSDOM } = require("jsdom");

const root = path.resolve(__dirname, "..");
const { M, D } = require(path.join(root, "site/assets/zoo.js"));

const close = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${msg}: ${a} ≠ ${b}`);

// Simpson na [a, b]; gęstości z osobliwością w 0 całkujemy od małego ε.
function integrate(f, a, b, n = 20000) {
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(a + i * h);
  return (s * h) / 3;
}

const CASES = {
  jednopunktowy: [{ x0: 1.5 }, { x0: -3 }],
  dwupunktowy: [{ x1: 3, x2: -1, theta: 0.3 }, { x1: -2, x2: 4, theta: 0.85 }, { x1: 2, x2: 2, theta: 0.4 }],
  bernoulli: [{ theta: 0.3 }, { theta: 0.97 }],
  "jednostajny-dyskretny": [{ n: 6 }, { n: 2 }, { n: 20 }],
  dwumianowy: [{ n: 20, theta: 0.3 }, { n: 1, theta: 0.6 }, { n: 60, theta: 0.97 }],
  geometryczny: [{ theta: 0.25 }, { theta: 0.05 }, { theta: 0.95 }],
  poisson: [{ lambda: 4 }, { lambda: 0.2 }, { lambda: 20 }],
  jednostajny: [{ a: 0, b: 3 }, { a: -4.5, b: -4 }],
  wykladniczy: [{ lambda: 1 }, { lambda: 0.2 }, { lambda: 4 }],
  gamma: [{ s: 3, r: 1 }, { s: 1, r: 2 }, { s: 0.5, r: 0.5 }, { s: 20, r: 4 }],
  "chi-kwadrat": [{ n: 1 }, { n: 2 }, { n: 4 }, { n: 30 }],
  normalny: [{ mu: 0, sigma: 1 }, { mu: -2, sigma: 0.3 }, { mu: 4, sigma: 3 }],
};

test("każdy rozkład z zoo.yml ma numerykę i przypadki testowe", () => {
  const yml = fs.readFileSync(path.join(root, "zoo.yml"), "utf8");
  const ids = [...yml.matchAll(/^ {2}- id: (\S+)$/gm)].map(m => m[1]);
  const dists = ids.filter(id => D[id]);
  assert.equal(dists.length, 12);
  for (const id of dists) assert.ok(CASES[id], `brak przypadków dla ${id}`);
});

for (const [id, cases] of Object.entries(CASES)) {
  test(`${id}: rozkład sumuje się do 1, E i Var zgodne ze wzorami`, () => {
    const d = D[id];
    for (const p of cases) {
      const mean = d.mean(p), variance = d.variance(p);
      if (d.kind === "d") {
        const atoms = d.atoms(p);
        const total = atoms.reduce((s, a) => s + a[1], 0);
        close(total, 1, 1e-6, `${id} ${JSON.stringify(p)} suma`);
        const m1 = atoms.reduce((s, a) => s + a[0] * a[1], 0);
        const m2 = atoms.reduce((s, a) => s + (a[0] - m1) ** 2 * a[1], 0);
        close(m1, mean, 1e-5, `${id} E`);
        close(m2, variance, 1e-4, `${id} Var`);
        assert.ok(atoms.every(a => a[1] >= 0), "p(k) ≥ 0");
      } else {
        // Jednostajny całkujemy po nośniku (Simpson nie lubi skoków gęstości).
        const [lo, hi] = id === "jednostajny" ? [p.a, p.b]
          : [mean - 40 * Math.sqrt(variance) - 1, mean + 40 * Math.sqrt(variance) + 1];
        const half = id === "gamma" || id === "chi-kwadrat" || id === "wykladniczy";
        const a = half ? 0 : lo;
        // Osobliwość gęstości w 0 (gamma z s < 1): całka od 0 przez podstawienie x = u², dx = 2u du.
        const f = x => d.pdf(x, p);
        const sub = g => u => 2 * u * g(u * u);
        const I = (g) => half ? integrate(sub(g), 1e-12, Math.sqrt(hi), 40000) : integrate(g, lo, hi, 40000);
        close(I(f), 1, 1e-6, `${id} ${JSON.stringify(p)} całka`);
        close(I(x => x * f(x)), mean, 1e-5, `${id} E`);
        close(I(x => (x - mean) ** 2 * f(x)), variance, 1e-4, `${id} Var`);
        // Dystrybuanta = całka z gęstości.
        for (const q of [mean - Math.sqrt(variance), mean, mean + 2 * Math.sqrt(variance)]) {
          const Fq = q <= a ? 0 : (half ? integrate(sub(f), 1e-12, Math.sqrt(q), 40000) : integrate(f, lo, Math.min(q, hi), 40000));
          close(d.cdf(q, p), Fq, 1e-6, `${id} F(${q})`);
        }
      }
    }
  });
}

test("funkcje specjalne: Φ, Γ, niekompletna gamma", () => {
  close(M.Phi(1.96), 0.9750021048517795, 1e-12, "Φ(1,96)");
  close(M.Phi(-1), 0.15865525393145707, 1e-12, "Φ(-1)");
  close(Math.exp(M.lgamma(5)), 24, 1e-12, "Γ(5) = 4!");
  close(Math.exp(M.lgamma(0.5)), Math.sqrt(Math.PI), 1e-12, "Γ(1/2) = √π");
  close(M.gammaCdf(1, 1, 1), 1 - Math.exp(-1), 1e-12, "Gamma(1,1) = Exp(1)");
  // Reguły z komentarza 8.1 w skrypcie.
  close(2 * (1 - M.Phi(2)), 0.0455003, 1e-6, "reguła 5%");
  close(2 * (1 - M.Phi(3)), 0.0026998, 1e-5, "reguła 3σ");
});

test("związki: χ²(n) = Gamma(n/2, 1/2), Gamma(1, r) = Exp(r), Binom → Pois", () => {
  for (const x of [0.3, 1, 4, 9]) {
    close(D["chi-kwadrat"].pdf(x, { n: 5 }), D.gamma.pdf(x, { s: 2.5, r: 0.5 }), 1e-12, "χ² = gamma");
    close(D.gamma.pdf(x, { s: 1, r: 2 }), D.wykladniczy.pdf(x, { lambda: 2 }), 1e-12, "gamma = exp");
    close(D["chi-kwadrat"].cdf(x, { n: 1 }), 2 * M.Phi(Math.sqrt(x)) - 1, 1e-10, "Z² ~ χ²(1)");
  }
  // Zadanie 8.1: n = 500, θ = 0,002 — P(X ≥ 3) dokładnie i z Poissona.
  const binom = 1 - [0, 1, 2].reduce((s, k) => s + M.binomPmf(k, 500, 0.002), 0);
  const pois = 1 - [0, 1, 2].reduce((s, k) => s + M.poisPmf(k, 1), 0);
  close(binom, 0.0801, 1e-3, "zad. 8.1 dokładnie");
  close(pois, 0.0803, 1e-3, "zad. 8.1 Poisson");
});

test("strona zoo/: każda karta i każdy związek montują się bez błędów", () => {
  const html = fs.readFileSync(path.join(root, "_site/zoo/index.html"), "utf8");
  const script = fs.readFileSync(path.join(root, "site/assets/zoo.js"), "utf8");
  const dom = new JSDOM(html, { url: "https://wojtacht.github.io/rpis/zoo/", runScripts: "outside-only", pretendToBeVisual: true });
  const { window } = dom;
  const { document } = window;
  window.katex = { render(src, el) { el.textContent = src; }, renderToString: src => src };
  window.HTMLElement.prototype.scrollIntoView = () => {};
  const errors = [];
  window.addEventListener("error", e => errors.push(e.error || e.message));
  window.eval(script);
  document.dispatchEvent(new window.Event("DOMContentLoaded"));
  const cards = [...document.querySelectorAll(".zc")];
  assert.equal(cards.filter(c => c.hasAttribute("data-dist")).length, 12);
  assert.equal(cards.filter(c => c.hasAttribute("data-rel")).length, 12);
  assert.equal(document.querySelectorAll(".zc.is-active").length, 1, "na start widać jedną kartę");
  const select = document.querySelector('[data-slot="select"]');
  for (const c of cards) {
    select.value = c.id;
    select.dispatchEvent(new window.Event("change"));
    assert.ok(c.classList.contains("is-active"), `${c.id} aktywna`);
    assert.equal(document.querySelectorAll(".zc.is-active").length, 1);
    const svg = c.querySelector("svg.zplot");
    assert.ok(svg, `${c.id}: brak wykresu`);
    assert.ok(svg.querySelector(".zp-series").innerHTML.length > 0, `${c.id}: pusty wykres`);
    assert.ok(!/NaN/.test(c.innerHTML), `${c.id}: NaN w wykresie`);
  }
  assert.deepEqual(errors, []);
  // Każdy rozkład na mapie ma swoją kartę, każda strzałka prowadzi do związku.
  for (const a of document.querySelectorAll(".zm-node, .zm-edge")) {
    assert.ok(document.getElementById(a.getAttribute("href").slice(1)), a.getAttribute("href"));
  }
  // Nawigacja strzałkami: następna karta po ostatniej rozkładzie to pierwszy związek.
  select.value = "normalny";
  select.dispatchEvent(new window.Event("change"));
  document.querySelector(".zs-next").click();
  assert.ok(document.querySelector(".zc.is-active").hasAttribute("data-rel"));
});
