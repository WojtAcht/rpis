// RPiS: renderowanie wzorów (KaTeX), filtrowanie banku zadań, quizy i przełącznik motywu.
(function () {
  "use strict";

  // --- Wzory -------------------------------------------------------------
  // pandoc --katex zostawia surowy TeX w <span class="math inline|display">.
  // Wzory w zwiniętych rozwiązaniach renderujemy dopiero po rozwinięciu.
  function renderMath(root) {
    if (!window.katex) return;
    root.querySelectorAll(".math:not([data-done])").forEach(function (el) {
      var closed = el.closest("details:not([open])");
      if (closed) return;
      try {
        katex.render(el.textContent, el, {
          displayMode: el.classList.contains("display"),
          throwOnError: false,
          strict: "ignore",
        });
      } catch (err) {
        console.warn("KaTeX:", err, el.textContent);
      }
      el.setAttribute("data-done", "");
    });
  }

  document.addEventListener("toggle", function (ev) {
    if (ev.target.open) renderMath(ev.target);
  }, true);

  // --- Bank zadań --------------------------------------------------------
  function polish(n, one, few, many) {
    if (n === 1) return n + " " + one;
    var d = n % 10, h = n % 100;
    return n + " " + (d >= 2 && d <= 4 && !(h >= 12 && h <= 14) ? few : many);
  }

  function fold(s) {
    return s.toLowerCase().replace(/ł/g, "l").normalize("NFKD").replace(/[̀-ͯ]/g, "");
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") node.textContent = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) node.appendChild(c); });
    return node;
  }

  // ?kolokwium=1 -> "kolokwium-1", ?kolokwium=wejsciowki -> "wejsciowki"
  function examFromParam(value) {
    if (!value) return "";
    return /^\d+$/.test(value) ? "kolokwium-" + value : value;
  }

  function initBrowse() {
    var dataNode = document.getElementById("browse-data");
    if (!dataNode) return;
    var data = JSON.parse(dataNode.textContent);
    var chapterOrder = Object.keys(data.chapters);
    var variantOrder = Object.keys(data.variants);
    var groupsBox = document.getElementById("groups");
    var cards = Array.prototype.slice.call(groupsBox.querySelectorAll(".task-card"));
    var q = document.getElementById("q");
    var select = document.getElementById("chapter-select");
    var banner = document.getElementById("chapter-banner");
    var countLine = document.getElementById("result-count");
    var empty = document.getElementById("empty");
    var toolbar = document.getElementById("toolbar");
    var filtersToggle = document.getElementById("filters-toggle");
    var filtersBadge = document.getElementById("filters-badge");

    var params = new URLSearchParams(location.search);
    var state = {
      chapter: data.chapters[params.get("rozdzial")] ? params.get("rozdzial") : "",
      exam: examFromParam(params.get("kolokwium")),
      group: params.get("grupuj") === "kolokwium" ? "kolokwium" : "rozdzial",
      q: params.get("q") || "",
      // Na telefonie domyślnie lista: tytuł, rozdziały i punkty, treść po rozwinięciu.
      view: window.matchMedia && window.matchMedia("(max-width: 600px)").matches ? "lista" : "pelny",
    };

    cards.forEach(function (c) {
      c._chapters = c.dataset.chapters.split(" ");
      var toggle = el("button", { type: "button", class: "card-toggle", "aria-expanded": "false", text: "Pokaż treść" });
      c.querySelector("header").appendChild(toggle);
    });

    // Kolokwium, grupowanie i widok chowamy na wąskim ekranie pod „Filtry”.
    toolbar.classList.add("is-collapsible");
    filtersToggle.hidden = false;
    document.getElementById("view-seg").hidden = false;

    function matches(c, withChapter) {
      if (withChapter && state.chapter && c._chapters.indexOf(state.chapter) < 0) return false;
      if (state.exam && c.dataset.exam !== state.exam) return false;
      if (state.q) {
        var terms = fold(state.q).split(/\s+/).filter(Boolean);
        for (var i = 0; i < terms.length; i++) {
          if (c.dataset.search.indexOf(terms[i]) < 0) return false;
        }
      }
      return true;
    }

    function chapterGroup(id) {
      var ch = data.chapters[id];
      return el("section", { class: "group" }, [
        el("header", { class: "group-head" }, [
          el("h2", {}, [el("span", { class: "group-nr", text: "Rozdział " + ch.nr }), document.createTextNode(" " + ch.title)]),
          el("a", { href: ch.url, target: "_blank", rel: "noopener", text: "skrypt ↗" }),
        ]),
      ]);
    }

    function variantGroup(path) {
      var v = data.variants[path];
      return el("section", { class: "group" }, [
        el("header", { class: "group-head" }, [
          el("h2", {}, [el("span", { class: "group-nr", text: v.year }), document.createTextNode(" " + v.title)]),
          el("a", { href: "../" + path + "/", text: "cały zestaw →" }),
        ]),
      ]);
    }

    function render() {
      var shown = cards.filter(function (c) { return matches(c, true); });

      // Grupy
      var buckets = {};
      shown.forEach(function (c) {
        var key = state.group === "kolokwium" ? c.dataset.variant : (state.chapter || c._chapters[0]);
        (buckets[key] = buckets[key] || []).push(c);
      });
      var order = state.group === "kolokwium" ? variantOrder : chapterOrder;
      var sections = order.filter(function (k) { return buckets[k]; }).map(function (k) {
        // Przy wybranym rozdziale jego nazwa jest już w banerze nad listą.
        var s = state.group === "kolokwium" ? variantGroup(k)
          : state.chapter ? el("section", { class: "group" }) : chapterGroup(k);
        buckets[k].forEach(function (c) { s.appendChild(c); });
        return s;
      });
      groupsBox.replaceChildren.apply(groupsBox, sections);
      renderMath(groupsBox);

      // Liczniki rozdziałów przy bieżących pozostałych filtrach
      var counts = {};
      var total = 0;
      cards.forEach(function (c) {
        if (!matches(c, false)) return;
        total++;
        c._chapters.forEach(function (id) { counts[id] = (counts[id] || 0) + 1; });
      });
      document.querySelectorAll("[data-count]").forEach(function (node) {
        var id = node.getAttribute("data-count");
        var n = id ? counts[id] || 0 : total;
        node.textContent = n;
        node.classList.toggle("is-zero", n === 0);
      });

      // Kontrolki
      document.querySelectorAll(".ch-item").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.dataset.chapter === state.chapter));
      });
      document.querySelectorAll("[data-exam]").forEach(function (b) {
        if (b.tagName === "BUTTON") b.setAttribute("aria-pressed", String(b.dataset.exam === state.exam));
      });
      document.querySelectorAll("[data-group]").forEach(function (b) {
        if (b.tagName === "BUTTON") b.setAttribute("aria-pressed", String(b.dataset.group === state.group));
      });
      document.querySelectorAll("[data-view]").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.dataset.view === state.view));
      });
      groupsBox.classList.toggle("is-compact", state.view === "lista");
      var active = (state.exam ? 1 : 0) + (state.group !== "rozdzial" ? 1 : 0);
      filtersBadge.textContent = active;
      filtersBadge.hidden = !active;
      select.value = state.chapter;
      if (q.value !== state.q) q.value = state.q;

      // Baner wybranego rozdziału
      if (state.chapter) {
        var ch = data.chapters[state.chapter];
        banner.replaceChildren(
          el("div", { class: "grow" }, [
            el("span", { class: "group-nr", text: "Rozdział " + ch.nr }),
            el("strong", { text: ch.title }),
          ]),
          el("a", { href: ch.url, target: "_blank", rel: "noopener", text: "Czytaj w skrypcie ↗" }),
          ch.materials ? el("a", { href: "../materialy/#" + ch.materials, text: "Materiały dodatkowe →" }) : "",
          el("button", { type: "button", "data-clear": "", text: "Pokaż wszystkie rozdziały" })
        );
        banner.hidden = false;
      } else {
        banner.hidden = true;
      }

      countLine.textContent = polish(shown.length, "zadanie", "zadania", "zadań");
      empty.hidden = shown.length > 0;

      var p = new URLSearchParams();
      if (state.chapter) p.set("rozdzial", state.chapter);
      if (state.exam) p.set("kolokwium", state.exam.replace("kolokwium-", ""));  // 1, 2 albo wejsciowki
      if (state.group !== "rozdzial") p.set("grupuj", state.group);
      if (state.q) p.set("q", state.q);
      var qs = p.toString();
      history.replaceState(null, "", location.pathname + (qs ? "?" + qs.replace(/%2F/g, "/") : ""));
    }

    function set(patch, scroll) {
      Object.keys(patch).forEach(function (k) { state[k] = patch[k]; });
      render();
      if (scroll) {
        var top = document.querySelector(".results").getBoundingClientRect().top + window.scrollY - 70;
        if (window.scrollY > top) window.scrollTo({ top: top });
      }
    }

    document.addEventListener("click", function (ev) {
      var t = ev.target.closest("button, a.chip");
      if (!t) return;
      if (t.classList.contains("ch-item")) set({ chapter: t.dataset.chapter }, true);
      else if (t.tagName === "BUTTON" && t.hasAttribute("data-exam")) set({ exam: t.dataset.exam });
      else if (t.tagName === "BUTTON" && t.hasAttribute("data-group")) set({ group: t.dataset.group });
      else if (t.hasAttribute("data-view")) set({ view: t.dataset.view });
      else if (t === filtersToggle) {
        var open = toolbar.classList.toggle("is-open");
        t.setAttribute("aria-expanded", String(open));
      } else if (t.classList.contains("card-toggle")) {
        var card = t.closest(".task-card");
        var shown = card.classList.toggle("is-open");
        t.setAttribute("aria-expanded", String(shown));
        t.textContent = shown ? "Ukryj treść" : "Pokaż treść";
      }
      else if (t.hasAttribute("data-clear")) set({ chapter: "" });
      else if (t.id === "reset") set({ chapter: "", exam: "", q: "" });
      else if (t.classList.contains("chip")) {
        var id = new URL(t.href).searchParams.get("rozdzial");
        if (id && data.chapters[id]) {
          ev.preventDefault();
          set({ chapter: id }, true);
        }
      }
    });
    select.addEventListener("change", function () { set({ chapter: select.value }); });
    var timer;
    q.addEventListener("input", function () {
      clearTimeout(timer);
      timer = setTimeout(function () { set({ q: q.value.trim() }); }, 120);
    });

    render();
  }

  // --- Quiz --------------------------------------------------------------
  // Bez JS quiz to lista pytań z „Pokaż odpowiedź”. Tutaj zamieniamy ją na
  // jedno pytanie naraz: odpowiedź blokuje pytanie i pokazuje wyjaśnienie,
  // „Dalej” przechodzi do następnego, a na końcu jest podsumowanie.
  function initQuiz() {
    var quiz = document.querySelector(".quiz");
    if (!quiz) return;
    var questions = Array.prototype.slice.call(quiz.querySelectorAll(".question"));
    var summary = document.getElementById("quiz-summary");
    var current = 0;

    var segs = questions.map(function () { return el("span", { class: "seg-bar" }); });
    var progress = el("div", { class: "quiz-progress", "aria-hidden": "true" }, segs);
    summary.parentNode.insertBefore(progress, summary);

    questions.forEach(function (q, i) {
      var last = i === questions.length - 1;
      var next = el("button", { type: "button", class: "btn quiz-next", text: last ? "Zobacz wynik →" : "Dalej →" });
      q.querySelector(".feedback .reveal-body").appendChild(next);
    });

    function show(i) {
      current = i;
      questions.forEach(function (q, j) { q.hidden = j !== i; });
      segs.forEach(function (s, j) { s.classList.toggle("is-current", j === i); });
      summary.hidden = true;
      progress.hidden = false;
      var top = progress.getBoundingClientRect().top + window.scrollY - 80;
      if (window.scrollY > top) window.scrollTo({ top: top });
    }

    function answer(option) {
      var q = option.closest(".question");
      if (q.classList.contains("is-answered")) return;
      var good = option.hasAttribute("data-correct");
      q.classList.add("is-answered", good ? "is-good" : "is-bad");
      option.classList.add("is-chosen");
      q.querySelectorAll(".option").forEach(function (b) {
        b.disabled = true;
        if (b.hasAttribute("data-correct")) b.classList.add("is-correct");
      });
      var verdict = q.querySelector(".verdict");
      verdict.textContent = good ? "Dobrze!" : "Niestety nie.";
      verdict.hidden = false;
      var details = q.querySelector(".feedback");
      details.open = true;
      renderMath(details);
      revealFeedback(details);
      segs[questions.indexOf(q)].classList.add(good ? "is-good" : "is-bad");
      if (quiz.classList.contains("is-stepper")) q.querySelector(".quiz-next").focus({ preventScroll: true });
    }

    // Na telefonie wyjaśnienie z przyciskiem „Dalej” wypada pod odpowiedziami, poza ekranem.
    // Przewijamy, żeby było widać całe, a gdy jest wyższe od ekranu, jego początek tuż pod paskiem.
    function revealFeedback(details) {
      var box = details.getBoundingClientRect();
      var by = Math.min(box.bottom - window.innerHeight + 16, box.top - 70);
      if (by > 0) window.scrollBy({ top: by });
    }

    function finish() {
      var good = quiz.querySelectorAll(".question.is-good").length;
      var ratio = good / questions.length;
      questions.forEach(function (q) { q.hidden = true; });
      segs.forEach(function (s) { s.classList.remove("is-current"); });
      document.getElementById("summary-good").textContent = good;
      document.getElementById("summary-text").textContent = ratio === 1
        ? "Wszystko dobrze. Tak trzymaj!"
        : ratio >= 0.7 ? "Dobry wynik. Przejrzyj pytania, w których był błąd."
        : "Warto wrócić do rozdziałów skryptu przy pytaniach z błędem.";
      document.getElementById("quiz-review").hidden = false;
      summary.hidden = false;
      summary.focus();
    }

    function review() {
      quiz.classList.remove("is-stepper");
      questions.forEach(function (q) { q.hidden = false; });
      document.getElementById("quiz-review").hidden = true;
      progress.hidden = true;
    }

    function restart() {
      questions.forEach(function (q) {
        q.classList.remove("is-answered", "is-good", "is-bad");
        q.querySelectorAll(".option").forEach(function (b) {
          b.disabled = false;
          b.classList.remove("is-chosen", "is-correct");
        });
        q.querySelector(".verdict").hidden = true;
        q.querySelector(".feedback").open = false;
      });
      segs.forEach(function (s) { s.classList.remove("is-good", "is-bad"); });
      quiz.classList.add("is-stepper");
      show(0);
    }

    function next() {
      if (current + 1 < questions.length) show(current + 1);
      else finish();
    }

    quiz.addEventListener("click", function (ev) {
      var option = ev.target.closest(".option");
      if (option) answer(option);
      else if (ev.target.closest(".quiz-next")) next();
    });
    document.getElementById("quiz-restart").addEventListener("click", restart);
    document.getElementById("quiz-review").addEventListener("click", review);

    // Klawisze: 1–4 albo a–d wybiera odpowiedź, Enter/→ przechodzi dalej.
    document.addEventListener("keydown", function (ev) {
      if (!quiz.classList.contains("is-stepper") || ev.altKey || ev.ctrlKey || ev.metaKey) return;
      var q = questions[current];
      if (!q || q.hidden) return;
      if (q.classList.contains("is-answered")) {
        if (ev.key === "ArrowRight" || (ev.key === "Enter" && !(ev.target.closest && ev.target.closest("button")))) {
          ev.preventDefault();
          next();
        }
        return;
      }
      var i = "1234".indexOf(ev.key) >= 0 ? "1234".indexOf(ev.key) : "abcd".indexOf(ev.key.toLowerCase());
      var options = q.querySelectorAll(".option");
      if (ev.key.length === 1 && i >= 0 && i < options.length) answer(options[i]);
    });

    quiz.classList.add("is-stepper");
    show(0);
  }

  // --- Motyw -------------------------------------------------------------
  // Bez zapisanego wyboru strona idzie za ustawieniem systemu. Wybór równy
  // systemowemu kasujemy, żeby znów podążać za systemem.
  function initTheme() {
    var buttons = document.querySelectorAll(".theme-toggle");
    if (!buttons.length) return;
    var root = document.documentElement;
    var system = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
    function systemTheme() { return system && system.matches ? "dark" : "light"; }
    function current() { return root.dataset.theme || systemTheme(); }
    function sync() {
      var dark = current() === "dark";
      buttons.forEach(function (btn) {
        btn.firstChild.textContent = dark ? "☀" : "☾";
        btn.title = dark ? "Tryb jasny" : "Tryb ciemny";
        var label = btn.querySelector(".theme-label");
        if (label) label.textContent = btn.title;
      });
    }
    function toggle() {
      var next = current() === "dark" ? "light" : "dark";
      try {
        if (next === systemTheme()) localStorage.removeItem("motyw");
        else localStorage.setItem("motyw", next);
      } catch (err) {}
      if (next === systemTheme()) delete root.dataset.theme;
      else root.dataset.theme = next;
      sync();
    }
    buttons.forEach(function (btn) { btn.addEventListener("click", toggle); });
    if (system && system.addEventListener) system.addEventListener("change", sync);
    sync();
  }

  // --- Menu „Więcej” w pasku -----------------------------------------------
  // <details> działa bez JS; tu tylko zamykamy je kliknięciem obok, w link i klawiszem Escape.
  function initMenu() {
    var menu = document.querySelector(".nav-more");
    if (!menu) return;
    document.addEventListener("click", function (ev) {
      if (menu.open && (!menu.contains(ev.target) || ev.target.closest(".nav-menu a"))) menu.open = false;
    });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && menu.open) {
        menu.open = false;
        menu.querySelector("summary").focus();
      }
    });
  }

  function init() {
    initTheme();
    initMenu();
    initBrowse();
    initQuiz();
    renderMath(document);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
