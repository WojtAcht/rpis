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

test("filtr wejściówek pokazuje tylko zadania z wejściówek", () => {
  const dom = new JSDOM(html, {
    url: "https://wojtacht.github.io/rpis/zadania/?kolokwium=wejsciowki",
    runScripts: "outside-only",
  });
  const { window } = dom;
  const { document } = window;
  window.katex = { render() {} };
  window.scrollTo = () => {};
  try {
    window.eval(script);
    document.dispatchEvent(new window.Event("DOMContentLoaded"));
    const shown = () => [...document.querySelectorAll("#groups .task-card")];
    assert.ok(shown().length > 0);
    assert.ok(shown().every(c => c.dataset.exam === "wejsciowki"));
    assert.equal(document.querySelector('button[data-exam="wejsciowki"]').getAttribute("aria-pressed"), "true");

    document.querySelector('button[data-exam="kolokwium-1"]').click();
    assert.ok(shown().length > 0);
    assert.ok(shown().every(c => c.dataset.exam === "kolokwium-1"));
    assert.equal(new window.URL(window.location.href).searchParams.get("kolokwium"), "1");
  } finally {
    window.close();
  }
});

test("quiz: jedno pytanie naraz, wyjaśnienie po odpowiedzi, podsumowanie i reset", () => {
  const quizHtml = fs.readFileSync(path.join(root, "_site/quizy/kahoot-1/index.html"), "utf8");
  const dom = new JSDOM(quizHtml, { url: "https://wojtacht.github.io/rpis/quizy/kahoot-1/", runScripts: "outside-only" });
  const { window } = dom;
  const { document } = window;
  window.katex = { render() {} };
  window.scrollTo = () => {};
  try {
    window.eval(script);
    document.dispatchEvent(new window.Event("DOMContentLoaded"));
    const questions = [...document.querySelectorAll(".question")];
    const visible = () => questions.filter(q => !q.hidden);
    assert.deepEqual(visible(), [questions[0]]);

    questions[0].querySelector(".option[data-correct]").click();
    assert.ok(questions[0].classList.contains("is-good"));
    assert.ok(questions[0].querySelector(".feedback").open);
    assert.equal(questions[0].querySelectorAll(".feedback .math:not([data-done])").length, 0);
    assert.ok([...questions[0].querySelectorAll(".option")].every(b => b.disabled));

    // Klawiatura: Enter przechodzi dalej, „1” wybiera pierwszą odpowiedź.
    document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Enter" }));
    assert.deepEqual(visible(), [questions[1]]);
    document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "1" }));
    assert.ok(questions[1].classList.contains("is-answered"));

    for (const q of questions.slice(1)) {
      if (!q.classList.contains("is-answered")) q.querySelector(".option:not([data-correct])").click();
      q.querySelector(".quiz-next").click();
    }
    const summary = document.getElementById("quiz-summary");
    assert.equal(summary.hidden, false);
    assert.equal(visible().length, 0);
    const good = document.querySelectorAll(".question.is-good").length;
    assert.equal(document.getElementById("summary-good").textContent, String(good));

    document.getElementById("quiz-review").click();
    assert.equal(visible().length, questions.length);

    document.getElementById("quiz-restart").click();
    assert.deepEqual(visible(), [questions[0]]);
    assert.equal(document.querySelectorAll(".question.is-answered").length, 0);
    assert.equal(summary.hidden, true);
  } finally {
    window.close();
  }
});
