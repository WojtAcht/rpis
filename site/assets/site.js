// RPiS: renderowanie wzorów (KaTeX) i filtrowanie banku zadań.
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

    var params = new URLSearchParams(location.search);
    var state = {
      chapter: data.chapters[params.get("rozdzial")] ? params.get("rozdzial") : "",
      exam: params.get("kolokwium") ? "kolokwium-" + params.get("kolokwium") : "",
      group: params.get("grupuj") === "kolokwium" ? "kolokwium" : "rozdzial",
      q: params.get("q") || "",
    };

    cards.forEach(function (c) {
      c._chapters = c.dataset.chapters.split(" ");
    });

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
      if (state.exam) p.set("kolokwium", state.exam.replace("kolokwium-", ""));
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

  function init() {
    initBrowse();
    renderMath(document);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
