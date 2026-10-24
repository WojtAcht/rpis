const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const { JSDOM } = require("jsdom");

const root = path.resolve(__dirname, "..");
// Testujemy HTML wygenerowany przez właściwy build, razem z kodem filtrowania.
const html = fs.readFileSync(path.join(root, "_site/zadania/index.html"), "utf8");
const script = fs.readFileSync(path.join(root, "site/assets/site.js"), "utf8");

for (const query of ["rozdzial=calculus/bayes", "kolokwium=1", "q=monety"]) {
  test(`wzory po wyczyszczeniu filtra URL: ${query}`, () => {
    const dom = new JSDOM(html, {
      url: `https://wojtacht.github.io/rpis/zadania/?${query}`,
      runScripts: "outside-only",
    });
    const { window } = dom;
    const { document } = window;
    let calls = 0;
    // Sprawdzamy wywołania renderera, bez pobierania KaTeX z CDN.
    window.katex = { render() { calls++; } };
    window.scrollTo = () => {};
    try {
      const total = document.querySelectorAll(".statement .math").length;
      window.eval(script);
      document.dispatchEvent(new window.Event("DOMContentLoaded"));
      const initial = document.querySelectorAll(".statement .math").length;
      assert.ok(initial > 0 && initial < total, "filtr musi ukryć część wzorów");
      assert.equal(document.querySelectorAll(".statement .math:not([data-done])").length, 0);
      assert.equal(document.querySelectorAll("details .math[data-done]").length, 0);

      document.getElementById("reset").click();
      assert.equal(document.querySelectorAll(".statement .math").length, total);
      assert.equal(document.querySelectorAll(".statement .math:not([data-done])").length, 0);
      assert.equal(document.querySelectorAll("details .math[data-done]").length, 0);

      const afterReset = calls;
      document.querySelector('button[data-group="kolokwium"]').click();
      assert.equal(calls, afterReset, "grupowanie nie renderuje gotowych wzorów ponownie");

      const solution = [...document.querySelectorAll("details")]
        .find(node => node.querySelector(".math"));
      solution.open = true;
      solution.dispatchEvent(new window.Event("toggle"));
      assert.equal(solution.querySelectorAll(".math:not([data-done])").length, 0);
      assert.ok(calls > afterReset, "rozwiązanie renderuje się po rozwinięciu");
    } finally {
      window.close();
    }
  });
}

test("quiz: odpowiedź blokuje pytanie, rozwija wyjaśnienie i liczy wynik", () => {
  const quizHtml = fs.readFileSync(path.join(root, "_site/quizy/kahoot-1/index.html"), "utf8");
  const dom = new JSDOM(quizHtml, { url: "https://wojtacht.github.io/rpis/quizy/kahoot-1/", runScripts: "outside-only" });
  const { window } = dom;
  const { document } = window;
  window.katex = { render() {} };
  window.HTMLElement.prototype.scrollIntoView = () => {};
  try {
    window.eval(script);
    document.dispatchEvent(new window.Event("DOMContentLoaded"));
    const [first, second] = document.querySelectorAll(".question");
    const score = document.getElementById("quiz-score");
    assert.equal(score.hidden, true);

    first.querySelector(".option[data-correct]").click();
    assert.ok(first.classList.contains("is-good"));
    assert.ok(first.querySelector("details").open);
    assert.equal(first.querySelectorAll("details .math:not([data-done])").length, 0);
    assert.ok([...first.querySelectorAll(".option")].every(b => b.disabled));

    second.querySelector(".option:not([data-correct])").click();
    assert.ok(second.classList.contains("is-bad"));
    assert.ok(second.querySelector(".option[data-correct]").classList.contains("is-correct"));
    assert.match(score.textContent, /1 \/ 2/);

    document.getElementById("quiz-reset").click();
    assert.equal(document.querySelectorAll(".question.is-answered").length, 0);
    assert.equal(score.hidden, true);
    assert.ok(!first.querySelector("details").open);
  } finally {
    window.close();
  }
});
