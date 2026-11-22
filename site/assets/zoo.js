// ZOO rozkładów (strona zoo/): numeryka rozkładów, wykresy SVG z płynnymi przejściami,
// karty rozkładów i wizualizacje związków. Treść kart generuje scripts/zoo.py z zoo.yml;
// tutaj są tylko liczby i rysowanie (klucze `id` są wspólne).
// W Node (testy) eksportuje samą numerykę: module.exports = { M, D }.
(function () {
  "use strict";

  // =====================================================================
  // Numeryka
  // =====================================================================
  var LANCZOS = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];

  function lgamma(x) {
    if (x < 0.5) return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * x))) - lgamma(1 - x);
    x -= 1;
    var a = LANCZOS[0], t = x + 7.5;
    for (var i = 1; i < 9; i++) a += LANCZOS[i] / (x + i);
    return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
  }

  // Regularyzowana dolna niekompletna funkcja gamma P(s, x) = γ(s, x) / Γ(s).
  function gammaP(s, x) {
    if (x <= 0) return 0;
    var lead = -x + s * Math.log(x) - lgamma(s);
    if (x < s + 1) {
      var term = 1 / s, sum = term, n = s;
      for (var i = 0; i < 1000; i++) {
        n += 1; term *= x / n; sum += term;
        if (Math.abs(term) < Math.abs(sum) * 1e-16) break;
      }
      return Math.min(1, sum * Math.exp(lead));
    }
    var tiny = 1e-300, b = x + 1 - s, c = 1 / tiny, d = 1 / b, h = d;
    for (var j = 1; j < 1000; j++) {
      var an = -j * (j - s);
      b += 2;
      d = an * d + b; if (Math.abs(d) < tiny) d = tiny;
      c = b + an / c; if (Math.abs(c) < tiny) c = tiny;
      d = 1 / d;
      var del = d * c;
      h *= del;
      if (Math.abs(del - 1) < 1e-16) break;
    }
    return Math.max(0, 1 - Math.exp(lead) * h);
  }

  function erf(x) { var p = gammaP(0.5, x * x); return x < 0 ? -p : p; }
  function Phi(z) { return 0.5 * (1 + erf(z / Math.SQRT2)); }
  function phi(z) { return Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI); }
  function logChoose(n, k) { return lgamma(n + 1) - lgamma(k + 1) - lgamma(n - k + 1); }

  function binomPmf(k, n, t) {
    if (k < 0 || k > n || k !== Math.floor(k)) return 0;
    if (t <= 0) return k === 0 ? 1 : 0;
    if (t >= 1) return k === n ? 1 : 0;
    return Math.exp(logChoose(n, k) + k * Math.log(t) + (n - k) * Math.log1p(-t));
  }
  function poisPmf(k, l) {
    if (k < 0 || k !== Math.floor(k)) return 0;
    return Math.exp(-l + k * Math.log(l) - lgamma(k + 1));
  }
  function gammaPdf(x, s, r) {
    if (x <= 0) return 0;
    return Math.exp(s * Math.log(r) - lgamma(s) + (s - 1) * Math.log(x) - r * x);
  }
  function gammaCdf(x, s, r) { return x <= 0 ? 0 : gammaP(s, r * x); }

  // Zakres osi: zaokrąglenie w górę do „ładnej” liczby, żeby oś nie skakała przy każdym ruchu suwaka.
  var NICE = [1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50, 60, 80, 100, 120, 150, 200, 250, 300, 400, 500];
  function niceUp(x) {
    for (var i = 0; i < NICE.length; i++) if (NICE[i] >= x) return NICE[i];
    return Math.ceil(x / 100) * 100;
  }

  function range(a, b) { var out = []; for (var k = a; k <= b; k++) out.push(k); return out; }

  // =====================================================================
  // Rozkłady (parametryzacja jak w skrypcie)
  // =====================================================================
  // Dyskretne: atoms(p) -> [[x, P(X=x)], ...]; ciągłe: pdf, cdf. Do tego mean, variance, zakres osi x.
  var D = {
    jednopunktowy: {
      kind: "d",
      atoms: function (p) { return [[p.x0, 1]]; },
      mean: function (p) { return p.x0; },
      variance: function () { return 0; },
      xr: function () { return [-6, 6]; },
      Etex: "x_0", Vtex: "0",
    },
    dwupunktowy: {
      kind: "d",
      atoms: function (p) {
        return p.x1 === p.x2 ? [[p.x1, 1]] : [[p.x1, p.theta], [p.x2, 1 - p.theta]];
      },
      mean: function (p) { return p.theta * p.x1 + (1 - p.theta) * p.x2; },
      variance: function (p) { return p.theta * (1 - p.theta) * Math.pow(p.x1 - p.x2, 2); },
      xr: function () { return [-6, 6]; },
      Etex: "\\theta x_1+(1-\\theta)x_2", Vtex: "\\theta(1-\\theta)(x_1-x_2)^2",
    },
    bernoulli: {
      kind: "d", integer: true,
      atoms: function (p) { return [[0, 1 - p.theta], [1, p.theta]]; },
      mean: function (p) { return p.theta; },
      variance: function (p) { return p.theta * (1 - p.theta); },
      xr: function () { return [-1, 2]; },
      Etex: "\\theta", Vtex: "\\theta(1-\\theta)",
    },
    "jednostajny-dyskretny": {
      kind: "d", integer: true,
      atoms: function (p) { return range(1, p.n).map(function (k) { return [k, 1 / p.n]; }); },
      mean: function (p) { return (p.n + 1) / 2; },
      variance: function (p) { return (p.n * p.n - 1) / 12; },
      xr: function (p) { return [0, p.n + 1]; },
      Etex: "\\tfrac{n+1}{2}", Vtex: "\\tfrac{n^2-1}{12}",
    },
    dwumianowy: {
      kind: "d", integer: true,
      atoms: function (p) { return range(0, p.n).map(function (k) { return [k, binomPmf(k, p.n, p.theta)]; }); },
      mean: function (p) { return p.n * p.theta; },
      variance: function (p) { return p.n * p.theta * (1 - p.theta); },
      xr: function (p) { return [-1, p.n + 1]; },
      Etex: "n\\theta", Vtex: "n\\theta(1-\\theta)",
    },
    geometryczny: {
      kind: "d", integer: true,
      atoms: function (p) {
        var K = Math.min(600, Math.ceil(Math.log(1e-10) / Math.log(1 - p.theta)));
        return range(1, Math.max(K, 2)).map(function (k) { return [k, Math.pow(1 - p.theta, k - 1) * p.theta]; });
      },
      mean: function (p) { return 1 / p.theta; },
      variance: function (p) { return (1 - p.theta) / (p.theta * p.theta); },
      xr: function (p) { return [0, niceUp(Math.log(0.004) / Math.log(1 - p.theta)) + 1]; },
      Etex: "\\tfrac{1}{\\theta}", Vtex: "\\tfrac{1-\\theta}{\\theta^2}",
    },
    poisson: {
      kind: "d", integer: true,
      atoms: function (p) {
        return range(0, Math.ceil(p.lambda + 10 * Math.sqrt(p.lambda) + 10)).map(function (k) { return [k, poisPmf(k, p.lambda)]; });
      },
      mean: function (p) { return p.lambda; },
      variance: function (p) { return p.lambda; },
      xr: function (p) { return [-1, niceUp(p.lambda + 4 * Math.sqrt(p.lambda) + 3)]; },
      Etex: "\\lambda", Vtex: "\\lambda",
    },
    jednostajny: {
      kind: "c",
      pdf: function (x, p) { var a = Math.min(p.a, p.b), b = Math.max(p.a, p.b); return x >= a && x <= b && b > a ? 1 / (b - a) : 0; },
      cdf: function (x, p) { var a = Math.min(p.a, p.b), b = Math.max(p.a, p.b); return x < a ? 0 : x >= b ? 1 : (x - a) / (b - a); },
      mean: function (p) { return (p.a + p.b) / 2; },
      variance: function (p) { return Math.pow(p.b - p.a, 2) / 12; },
      xr: function () { return [-6, 6]; },
      valid: function (p) { return p.b > p.a; },
      Etex: "\\tfrac{a+b}{2}", Vtex: "\\tfrac{(b-a)^2}{12}",
    },
    wykladniczy: {
      kind: "c",
      pdf: function (x, p) { return x > 0 ? p.lambda * Math.exp(-p.lambda * x) : 0; },
      cdf: function (x, p) { return x > 0 ? 1 - Math.exp(-p.lambda * x) : 0; },
      mean: function (p) { return 1 / p.lambda; },
      variance: function (p) { return 1 / (p.lambda * p.lambda); },
      xr: function (p) { return [0, niceUp(-Math.log(0.004) / p.lambda)]; },
      Etex: "\\tfrac{1}{\\lambda}", Vtex: "\\tfrac{1}{\\lambda^2}",
    },
    gamma: {
      kind: "c",
      pdf: function (x, p) { return gammaPdf(x, p.s, p.r); },
      cdf: function (x, p) { return gammaCdf(x, p.s, p.r); },
      mean: function (p) { return p.s / p.r; },
      variance: function (p) { return p.s / (p.r * p.r); },
      xr: function (p) { return [0, niceUp((p.s + 4.5 * Math.sqrt(p.s) + 2) / p.r)]; },
      Etex: "\\tfrac{s}{r}", Vtex: "\\tfrac{s}{r^2}",
    },
    "chi-kwadrat": {
      kind: "c",
      pdf: function (x, p) { return gammaPdf(x, p.n / 2, 0.5); },
      cdf: function (x, p) { return gammaCdf(x, p.n / 2, 0.5); },
      mean: function (p) { return p.n; },
      variance: function (p) { return 2 * p.n; },
      xr: function (p) { return [0, niceUp(p.n + 4.5 * Math.sqrt(2 * p.n) + 3)]; },
      Etex: "n", Vtex: "2n",
    },
    normalny: {
      kind: "c",
      pdf: function (x, p) { return phi((x - p.mu) / p.sigma) / p.sigma; },
      cdf: function (x, p) { return Phi((x - p.mu) / p.sigma); },
      mean: function (p) { return p.mu; },
      variance: function (p) { return p.sigma * p.sigma; },
      xr: function () { return [-10, 10]; },
      Etex: "\\mu", Vtex: "\\sigma^2",
    },
  };

  function cdfDiscrete(atoms, x) {
    var s = 0;
    for (var i = 0; i < atoms.length; i++) if (atoms[i][0] <= x) s += atoms[i][1];
    return Math.min(1, s);
  }

  var M = { lgamma: lgamma, gammaP: gammaP, erf: erf, Phi: Phi, phi: phi, binomPmf: binomPmf,
    poisPmf: poisPmf, gammaPdf: gammaPdf, gammaCdf: gammaCdf, cdfDiscrete: cdfDiscrete, niceUp: niceUp };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { M: M, D: D };
  }
  if (typeof document === "undefined") return;

  // =====================================================================
  // Pomocnicze: liczby, TeX, kontrolki
  // =====================================================================
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SVGNS = "http://www.w3.org/2000/svg";

  function fmt(x, digits) {
    if (!isFinite(x)) return "∞";
    if (digits === undefined) {
      var ax = Math.abs(x);
      digits = ax === 0 ? 0 : ax >= 100 ? 1 : ax >= 10 ? 2 : ax >= 0.01 ? 3 : 4;
    }
    var s = x.toFixed(digits);
    if (s.indexOf(".") >= 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
    if (s === "-0") s = "0";
    return s.replace(".", ",").replace("-", "−");
  }
  function tnum(x, digits) { return fmt(x, digits).replace(",", "{,}").replace("−", "-"); }

  function tex(el, src, display) {
    if (window.katex) {
      try { window.katex.render(src, el, { displayMode: !!display, throwOnError: false, strict: "ignore" }); return; }
      catch (err) { /* zapasowo zwykły tekst */ }
    }
    el.textContent = src;
  }
  function texHTML(src) {
    if (window.katex) {
      try { return window.katex.renderToString(src, { throwOnError: false, strict: "ignore" }); } catch (err) { /* nic */ }
    }
    return src.replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; });
  }

  function h(tag, attrs, children) {
    var el = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "class") el.className = attrs[k];
      else if (k === "html") el.innerHTML = attrs[k];
      else if (k === "text") el.textContent = attrs[k];
      else if (k.slice(0, 2) === "on") el.addEventListener(k.slice(2), attrs[k]);
      else el.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) el.appendChild(c); });
    return el;
  }

  // Suwak z etykietą w TeX-u i wartością. o: {tex, min, max, step, value, onInput, format, map}
  // `map` pozwala na skalę nieliniową: suwak chodzi po 0..1000, a wartość = map(t).
  function slider(o) {
    var input = h("input", { type: "range", min: o.min, max: o.max, step: o.step, value: o.value });
    var out = h("output", { class: "zs-val" });
    var label = h("span", { class: "zs-tex" });
    tex(label, o.tex);
    var wrap = h("label", { class: "zslider" }, [label, input, out]);
    function val() { return o.map ? o.map(+input.value) : +input.value; }
    function paint() {
      var v = val();
      out.textContent = o.format ? o.format(v) : fmt(v);
      var t = (input.value - o.min) / (o.max - o.min);
      input.style.setProperty("--t", (t * 100).toFixed(2) + "%");
    }
    input.addEventListener("input", function () { paint(); o.onInput(val()); });
    paint();
    return {
      el: wrap, input: input,
      get: val,
      set: function (raw) { input.value = raw; paint(); },
    };
  }

  function seg(options, current, onPick) {
    var box = h("div", { class: "zseg", role: "group" });
    var buttons = options.map(function (op) {
      var b = h("button", { type: "button", "aria-pressed": String(op.value === current) });
      if (op.tex) tex(b, op.tex); else b.textContent = op.label;
      b.addEventListener("click", function () {
        buttons.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        onPick(op.value);
      });
      box.appendChild(b);
      return b;
    });
    return box;
  }

  function button(label, onClick, cls) {
    return h("button", { type: "button", class: "zbtn" + (cls ? " " + cls : ""), html: label, onclick: onClick });
  }

  function niceTicks(a, b, count, integer) {
    var span = b - a;
    if (!(span > 0)) return [a];
    var raw = span / count, mag = Math.pow(10, Math.floor(Math.log10(raw))), norm = raw / mag;
    var step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
    if (integer) step = Math.max(1, Math.round(step));
    var out = [];
    for (var v = Math.ceil(a / step) * step; v <= b + step * 1e-9; v += step) out.push(+v.toFixed(10));
    return out;
  }

  // =====================================================================
  // Wykres: scena (osie, serie, znaczniki) z płynnym przejściem między stanami
  // =====================================================================
  var plotCount = 0;

  function Plot(host, o) {
    o = o || {};
    this.o = o;
    this.W = o.width || 720;
    this.H = o.height || 360;
    // Na telefonie mniejszy układ współrzędnych, żeby napisy na osiach nie były mikroskopijne.
    var hw = host.clientWidth;
    if (hw && hw < 560 && this.W > 440) { this.H = Math.round(this.H * 440 / this.W * 1.25); this.W = 440; }
    this.m = { l: 54, r: 18, t: 34, b: 36 };
    this.uid = "zp" + (++plotCount);
    this.sel = null;
    var svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("viewBox", "0 0 " + this.W + " " + this.H);
    svg.setAttribute("class", "zplot");
    svg.innerHTML = '<defs><clipPath id="' + this.uid + '-clip"><rect x="' + this.m.l + '" y="' + (this.m.t - 2) +
      '" width="' + (this.W - this.m.l - this.m.r) + '" height="' + (this.H - this.m.t - this.m.b + 2) + '"/></clipPath>' +
      '<linearGradient id="' + this.uid + '-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="zg-top"/><stop offset="1" class="zg-bottom"/></linearGradient></defs>' +
      '<g class="zp-grid"></g><g class="zp-under" clip-path="url(#' + this.uid + '-clip)"></g>' +
      '<g class="zp-series" clip-path="url(#' + this.uid + '-clip)"></g><g class="zp-marks"></g><g class="zp-hover"></g>';
    host.appendChild(svg);
    this.svg = svg;
    this.gGrid = svg.querySelector(".zp-grid");
    this.gUnder = svg.querySelector(".zp-under");
    this.gSeries = svg.querySelector(".zp-series");
    this.gMarks = svg.querySelector(".zp-marks");
    this.gHover = svg.querySelector(".zp-hover");
    this.tip = h("div", { class: "ztip", hidden: "" });
    host.appendChild(this.tip);
    host.classList.add("zplot-host");
    this.cur = null;
    this.target = null;
    this.raf = 0;
    this._bindPointer();
  }

  Plot.prototype.sx = function (x) {
    var s = this.cur;
    return this.m.l + (x - s.x[0]) / (s.x[1] - s.x[0]) * (this.W - this.m.l - this.m.r);
  };
  Plot.prototype.sy = function (y) {
    var s = this.cur;
    return this.H - this.m.b - (y - s.y[0]) / (s.y[1] - s.y[0]) * (this.H - this.m.t - this.m.b);
  };
  Plot.prototype.ix = function (px) {
    var s = this.cur;
    return s.x[0] + (px - this.m.l) / (this.W - this.m.l - this.m.r) * (s.x[1] - s.x[0]);
  };

  Plot.prototype.set = function (scene, instant) {
    this.target = scene;
    if (!this.cur || instant || REDUCED) {
      this.cur = cloneScene(scene);
      this.paint();
      return;
    }
    if (!this.raf) {
      var self = this;
      var step = function () {
        var done = tweenScene(self.cur, self.target, 0.2);
        self.paint();
        self.raf = done ? 0 : requestAnimationFrame(step);
      };
      this.raf = requestAnimationFrame(step);
    }
  };

  function cloneScene(s) { return JSON.parse(JSON.stringify(s)); }

  function lerp(a, b, t) { return a + (b - a) * t; }

  // Jeden krok przejścia cur → target. Serie łączymy po `id`, słupki po położeniu x.
  function tweenScene(cur, tgt, t) {
    var err = 0;
    function step(a, b) { var v = lerp(a, b, t); err = Math.max(err, Math.abs(b - v)); return v; }
    var spanX = Math.abs(tgt.x[1] - tgt.x[0]) || 1, spanY = Math.abs(tgt.y[1] - tgt.y[0]) || 1;
    cur.x = [step(cur.x[0], tgt.x[0]) , step(cur.x[1], tgt.x[1])];
    var ex = err / spanX; err = 0;
    cur.y = [step(cur.y[0], tgt.y[0]), step(cur.y[1], tgt.y[1])];
    var ey = err / spanY; err = 0;
    var curById = {};
    (cur.series || []).forEach(function (s) { curById[s.id] = s; });
    var rel = 0;
    cur.series = tgt.series.map(function (ts) {
      var cs = curById[ts.id];
      if (!cs || cs.type !== ts.type) return JSON.parse(JSON.stringify(ts));
      var out = JSON.parse(JSON.stringify(ts));
      if (ts.pts && cs.pts && cs.pts.length === ts.pts.length) {
        err = 0;
        out.pts = ts.pts.map(function (p, i) { return [step(cs.pts[i][0], p[0]), step(cs.pts[i][1], p[1])]; });
        rel = Math.max(rel, err / spanY);
      }
      if (ts.bars) {
        var prev = {};
        cs.bars && cs.bars.forEach(function (b) { prev[b[0].toFixed(6)] = b; });
        err = 0;
        var seen = {};
        out.bars = ts.bars.map(function (b) {
          var key = b[0].toFixed(6), pb = prev[key];
          seen[key] = 1;
          var nb = b.slice();
          for (var i = 1; i < b.length; i++) if (typeof b[i] === "number") nb[i] = step(pb ? pb[i] : 0, b[i]);
          return nb;
        });
        // Słupki, które znikają, gasną do zera.
        (cs.bars || []).forEach(function (b) {
          var key = b[0].toFixed(6);
          if (seen[key]) return;
          var nb = b.slice(), alive = false;
          for (var i = 1; i < b.length; i++) if (typeof b[i] === "number") { nb[i] = step(b[i], 0); if (Math.abs(nb[i]) > 1e-4 * spanY) alive = true; }
          if (alive) out.bars.push(nb);
        });
        rel = Math.max(rel, err / spanY);
      }
      return out;
    });
    var curMarks = {};
    (cur.marks || []).forEach(function (m) { curMarks[m.id] = m; });
    err = 0;
    cur.marks = (tgt.marks || []).map(function (tm) {
      var cm = curMarks[tm.id], out = {};
      Object.keys(tm).forEach(function (k) {
        out[k] = cm && typeof tm[k] === "number" && typeof cm[k] === "number" ? step(cm[k], tm[k]) : tm[k];
      });
      return out;
    });
    var em = err / Math.max(spanX, spanY);
    Object.keys(tgt).forEach(function (k) { if (["x", "y", "series", "marks"].indexOf(k) < 0) cur[k] = tgt[k]; });
    return Math.max(ex, ey, rel, em) < 1e-3;
  }

  Plot.prototype.paint = function () {
    var s = this.cur, self = this, W = this.W, H = this.H, m = this.m;
    if (!s) return;
    var x0 = m.l, x1 = W - m.r, y0 = H - m.b, y1 = m.t;
    // Siatka i osie.
    var g = [];
    var yt = niceTicks(s.y[0], s.y[1], s.yTicks || 4, false);
    yt.forEach(function (v) {
      var y = self.sy(v);
      g.push('<line class="zp-gl" x1="' + x0 + '" x2="' + x1 + '" y1="' + y + '" y2="' + y + '"/>');
      g.push('<text class="zp-tick" x="' + (x0 - 8) + '" y="' + (y + 4) + '" text-anchor="end">' + fmt(v, s.yDigits) + "</text>");
    });
    var xt = s.xTicksAt || niceTicks(s.x[0], s.x[1], s.xTicks || 8, s.integer);
    xt.forEach(function (v) {
      var x = self.sx(v);
      if (x < x0 - 1 || x > x1 + 1) return;
      g.push('<line class="zp-xt" x1="' + x + '" x2="' + x + '" y1="' + y0 + '" y2="' + (y0 + 5) + '"/>');
      g.push('<text class="zp-tick" x="' + x + '" y="' + (y0 + 21) + '" text-anchor="middle">' + fmt(v, s.xDigits) + "</text>");
    });
    g.push('<line class="zp-axis" x1="' + x0 + '" x2="' + x1 + '" y1="' + y0 + '" y2="' + y0 + '"/>');
    if (s.xLabel) g.push('<text class="zp-axl" x="' + x1 + '" y="' + (y0 - 8) + '" text-anchor="end">' + s.xLabel + "</text>");
    if (s.yLabel) g.push('<text class="zp-axl" x="' + (x0 - 46) + '" y="16">' + s.yLabel + "</text>");
    this.gGrid.innerHTML = g.join("");

    // Pasma i zaznaczenie pod seriami.
    var u = [];
    (s.marks || []).forEach(function (mk) {
      if (mk.type === "band") {
        var a = self.sx(mk.x0), b = self.sx(mk.x1);
        u.push('<rect class="zp-band ' + (mk.cls || "") + '" x="' + Math.min(a, b) + '" y="' + y1 + '" width="' + Math.abs(b - a) + '" height="' + (y0 - y1) + '"/>');
      }
    });
    var sel = this.sel;
    if (sel && !s.discrete) {
      var main = (s.series || []).filter(function (x) { return x.id === (s.selSeries || "main"); })[0];
      if (main && main.pts) u.push('<path class="zp-sel" d="' + this.areaPath(main.pts, sel[0], sel[1]) + '"/>');
    }
    this.gUnder.innerHTML = u.join("");

    // Serie.
    var out = [];
    (s.series || []).forEach(function (se) {
      var cls = "zs-" + se.type + " " + (se.cls || "");
      if (se.type === "area" || se.type === "line") {
        if (se.type === "area") out.push('<path class="zp-area ' + (se.cls || "") + '" fill="url(#' + self.uid + '-fill)" d="' + self.areaPath(se.pts) + '"/>');
        out.push('<path class="zp-line ' + (se.cls || "") + '" d="' + self.linePath(se.pts) + '"/>');
      } else if (se.type === "bars" || se.type === "stems" || se.type === "dots" || se.type === "stack") {
        var w = se.w || 0.7;
        se.bars.forEach(function (b) {
          var xc = self.sx(b[0]);
          if (xc < x0 - 40 || xc > x1 + 40) return;
          var inSel = sel && s.discrete && b[0] >= sel[0] - 1e-9 && b[0] <= sel[1] + 1e-9;
          var extra = (b[se.type === "stack" ? 3 : 2] || "") + (inSel ? " is-sel" : "");
          if (se.type === "bars") {
            var pw = Math.max(2, Math.abs(self.sx(b[0] + w / 2) - self.sx(b[0] - w / 2)));
            var top = self.sy(Math.max(0, b[1]));
            out.push('<rect class="zp-bar ' + (se.cls || "") + " " + extra + '" x="' + (xc - pw / 2) + '" y="' + top + '" width="' + pw + '" height="' + Math.max(0, y0 - top) + '" rx="' + Math.min(4, pw / 4) + '"/>');
          } else if (se.type === "stack") {
            var pw2 = Math.max(2, Math.abs(self.sx(b[0] + w / 2) - self.sx(b[0] - w / 2)));
            var ya = self.sy(Math.max(0, b[1])), yb = self.sy(Math.max(0, b[1] + b[2]));
            out.push('<rect class="zp-bar zp-stack-a ' + extra + '" x="' + (xc - pw2 / 2) + '" y="' + ya + '" width="' + pw2 + '" height="' + Math.max(0, y0 - ya) + '"/>');
            out.push('<rect class="zp-bar zp-stack-b ' + extra + '" x="' + (xc - pw2 / 2) + '" y="' + yb + '" width="' + pw2 + '" height="' + Math.max(0, ya - yb) + '"/>');
          } else {
            var ty = self.sy(b[1]);
            if (se.type === "stems") out.push('<line class="zp-stem ' + (se.cls || "") + '" x1="' + xc + '" x2="' + xc + '" y1="' + y0 + '" y2="' + ty + '"/>');
            out.push('<circle class="zp-dotp ' + (se.cls || "") + " " + extra + '" cx="' + xc + '" cy="' + ty + '" r="' + (se.r || 5) + '"/>');
          }
        });
      } else if (se.type === "steps") {
        out.push(self.stepsSVG(se));
      }
      void cls;
    });
    this.gSeries.innerHTML = out.join("");

    // Znaczniki nad seriami.
    var mk = [];
    (s.marks || []).forEach(function (q) {
      if (q.type === "v") {
        var x = self.sx(q.x);
        if (x < x0 - 1 || x > x1 + 1) return;
        mk.push('<line class="zp-v ' + (q.cls || "") + '" x1="' + x + '" x2="' + x + '" y1="' + y0 + '" y2="' + (y1 + 14) + '"/>');
        if (q.label) mk.push('<text class="zp-vl ' + (q.cls || "") + '" x="' + x + '" y="' + (y1 + 8) + '" text-anchor="' + (q.anchor || "middle") + '">' + q.label + "</text>");
      } else if (q.type === "h") {
        var y = self.sy(q.y);
        mk.push('<line class="zp-h ' + (q.cls || "") + '" x1="' + self.sx(q.x0 !== undefined ? q.x0 : s.x[0]) + '" x2="' + self.sx(q.x1 !== undefined ? q.x1 : s.x[1]) + '" y1="' + y + '" y2="' + y + '"/>');
        if (q.label) mk.push('<text class="zp-hl ' + (q.cls || "") + '" x="' + (self.sx(q.x1 !== undefined ? q.x1 : s.x[1]) - 6) + '" y="' + (y - 7) + '" text-anchor="end">' + q.label + "</text>");
      } else if (q.type === "seg") {
        mk.push('<line class="zp-seg ' + (q.cls || "") + '" x1="' + self.sx(q.x1) + '" x2="' + self.sx(q.x2) + '" y1="' + self.sy(q.y1) + '" y2="' + self.sy(q.y2) + '"/>');
      } else if (q.type === "dot") {
        mk.push('<circle class="zp-mdot ' + (q.cls || "") + '" cx="' + self.sx(q.x) + '" cy="' + self.sy(q.y) + '" r="' + (q.r || 6) + '"/>');
      } else if (q.type === "text") {
        mk.push('<text class="zp-mt ' + (q.cls || "") + '" x="' + self.sx(q.x) + '" y="' + (self.sy(q.y) + (q.dy || 0)) + '" text-anchor="' + (q.anchor || "middle") + '">' + q.text + "</text>");
      } else if (q.type === "brace") {
        var a = self.sx(q.x0), b = self.sx(q.x1), yb = self.sy(q.y);
        mk.push('<path class="zp-brace ' + (q.cls || "") + '" d="M' + a + "," + (yb + 6) + " V" + yb + " H" + b + " V" + (yb + 6) + '"/>');
        if (q.label) mk.push('<text class="zp-mt ' + (q.cls || "") + '" x="' + (a + b) / 2 + '" y="' + (yb - 7) + '" text-anchor="middle">' + q.label + "</text>");
      }
    });
    this.gMarks.innerHTML = mk.join("");
    if (this.hoverX !== undefined && this.hoverX !== null) this.showHover(this.hoverX);
  };

  Plot.prototype.linePath = function (pts) {
    var self = this;
    return pts.map(function (p, i) { return (i ? "L" : "M") + self.sx(p[0]).toFixed(2) + "," + self.sy(p[1]).toFixed(2); }).join("");
  };
  Plot.prototype.areaPath = function (pts, a, b) {
    var self = this;
    var lo = a === undefined ? -Infinity : Math.min(a, b), hi = b === undefined ? Infinity : Math.max(a, b);
    var inside = [];
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      if (p[0] < lo || p[0] > hi) {
        // Dokładne krańce zaznaczenia: interpolacja liniowa między próbkami.
        var q = pts[i + 1];
        if (q && p[0] < lo && q[0] > lo) inside.push([lo, p[1] + (q[1] - p[1]) * (lo - p[0]) / (q[0] - p[0])]);
        if (q && p[0] <= hi && q[0] > hi && inside.length) inside.push([hi, p[1] + (q[1] - p[1]) * (hi - p[0]) / (q[0] - p[0])]);
        continue;
      }
      inside.push(p);
      var nx = pts[i + 1];
      if (nx && nx[0] > hi) inside.push([hi, p[1] + (nx[1] - p[1]) * (hi - p[0]) / (nx[0] - p[0])]);
    }
    if (!inside.length) return "";
    var base = self.sy(Math.max(0, this.cur.y[0]));
    return "M" + self.sx(inside[0][0]) + "," + base + inside.map(function (p) {
      return "L" + self.sx(p[0]).toFixed(2) + "," + self.sy(p[1]).toFixed(2);
    }).join("") + "L" + self.sx(inside[inside.length - 1][0]) + "," + base + "Z";
  };

  // Dystrybuanta dyskretna: poziome odcinki, kropka pełna na lewym końcu (wartość w punkcie skoku),
  // pusta na prawym — prawostronna ciągłość widać na rysunku.
  Plot.prototype.stepsSVG = function (se) {
    var self = this, s = this.cur, out = [];
    var jumps = se.bars.slice().sort(function (a, b) { return a[0] - b[0]; });
    var xs = s.x[0], xe = s.x[1], prev = 0, xprev = xs, cls = se.cls || "";
    var d = "";
    jumps.forEach(function (j) {
      if (j[0] < xs) { prev = j[1]; return; }
      if (j[0] > xe) return;
      d += "M" + self.sx(xprev) + "," + self.sy(prev) + "H" + self.sx(j[0]);
      out.push('<circle class="zp-open ' + cls + '" cx="' + self.sx(j[0]) + '" cy="' + self.sy(prev) + '" r="4"/>');
      prev = j[1];
      xprev = j[0];
    });
    d += "M" + self.sx(xprev) + "," + self.sy(prev) + "H" + self.sx(xe);
    var dots = [];
    jumps.forEach(function (j) {
      if (j[0] < xs || j[0] > xe) return;
      dots.push('<circle class="zp-closed ' + cls + '" cx="' + self.sx(j[0]) + '" cy="' + self.sy(j[1]) + '" r="4"/>');
    });
    return '<path class="zp-stepline ' + cls + '" d="' + d + '"/>' + out.join("") + (se.noDots ? "" : dots.join(""));
  };

  Plot.prototype._bindPointer = function () {
    var self = this, svg = this.svg, drag = null;
    function dataX(ev) {
      var pt = svg.createSVGPoint();
      pt.x = ev.clientX; pt.y = ev.clientY;
      var ctm = svg.getScreenCTM();
      if (!ctm) return null;
      var p = pt.matrixTransform(ctm.inverse());
      if (p.x < self.m.l - 10 || p.x > self.W - self.m.r + 10) return null;
      return self.ix(Math.max(self.m.l, Math.min(self.W - self.m.r, p.x)));
    }
    svg.addEventListener("pointermove", function (ev) {
      if (!self.cur) return;
      var x = dataX(ev);
      if (drag !== null && x !== null) {
        if (Math.abs(x - drag) > (self.cur.x[1] - self.cur.x[0]) * 0.005) {
          self.sel = [Math.min(drag, x), Math.max(drag, x)];
          if (self.o.snap) self.sel = self.o.snap(self.sel);
          self.paint();
          self.o.onSelect && self.o.onSelect(self.sel);
        }
      }
      if (self.o.onHover && ev.pointerType !== "touch") { self.hoverX = x; self.showHover(x); }
    });
    svg.addEventListener("pointerleave", function () { self.hoverX = null; self.showHover(null); });
    if (this.o.onSelect) {
      svg.classList.add("is-selectable");
      svg.addEventListener("pointerdown", function (ev) {
        if (!self.cur || ev.button) return;
        var x = dataX(ev);
        if (x === null) return;
        drag = x;
        svg.setPointerCapture && svg.setPointerCapture(ev.pointerId);
        ev.preventDefault();
      });
      var end = function () {
        if (drag === null) return;
        drag = null;
      };
      svg.addEventListener("pointerup", end);
      svg.addEventListener("pointercancel", end);
      svg.addEventListener("dblclick", function () { self.clearSel(); });
    }
  };
  Plot.prototype.clearSel = function () {
    this.sel = null;
    this.paint();
    this.o.onSelect && this.o.onSelect(null);
  };
  Plot.prototype.setSel = function (sel) { this.sel = sel; this.paint(); };

  Plot.prototype.showHover = function (x) {
    var info = x === null || x === undefined || !this.o.onHover ? null : this.o.onHover(x);
    if (!info) { this.gHover.innerHTML = ""; this.tip.hidden = true; return; }
    var self = this, px = this.sx(info.x);
    var g = ['<line class="zp-guide" x1="' + px + '" x2="' + px + '" y1="' + this.m.t + '" y2="' + (this.H - this.m.b) + '"/>'];
    (info.points || []).forEach(function (p) {
      g.push('<circle class="zp-hdot ' + (p[2] || "") + '" cx="' + px + '" cy="' + self.sy(p[1]) + '" r="5.5"/>');
    });
    this.gHover.innerHTML = g.join("");
    this.tip.innerHTML = info.html;
    this.tip.hidden = false;
    var rect = this.svg.getBoundingClientRect(), host = this.svg.parentNode.getBoundingClientRect();
    var left = (px / this.W) * rect.width + (rect.left - host.left);
    var flip = px > this.W * 0.62;
    this.tip.style.left = left + "px";
    this.tip.style.top = (rect.top - host.top + 10) + "px";
    this.tip.classList.toggle("is-flip", flip);
  };

  function sample(f, a, b, n) {
    var out = [];
    for (var i = 0; i <= n; i++) { var x = a + (b - a) * i / n; out.push([x, f(x)]); }
    return out;
  }
  // Górna granica osi y dla gęstości: pomija pierwsze próbki, gdy gęstość ucieka do nieskończoności przy 0.
  function densityTop(pts) {
    var all = 0, rest = 0;
    pts.forEach(function (p, i) { if (isFinite(p[1])) { all = Math.max(all, p[1]); if (i > pts.length * 0.03) rest = Math.max(rest, p[1]); } });
    var top = all > rest * 2.2 && rest > 0 ? rest * 1.6 : all;
    return niceY(top * 1.12);
  }
  function niceY(v) {
    if (!(v > 0)) return 1;
    var mag = Math.pow(10, Math.floor(Math.log10(v))), n = v / mag;
    var steps = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
    for (var i = 0; i < steps.length; i++) if (steps[i] >= n - 1e-9) return steps[i] * mag;
    return 10 * mag;
  }

  // =====================================================================
  // Karta rozkładu
  // =====================================================================
  function mountDist(card) {
    var id = card.getAttribute("data-dist"), dist = D[id];
    if (!dist) return;
    var spec = JSON.parse(card.getAttribute("data-params"));
    var p = {}, p0 = {};
    spec.forEach(function (s) { p[s.key] = s.value; p0[s.key] = s.value; });
    var discrete = dist.kind === "d";
    var mode = "pdf", showMoments = true;
    var slot = function (n) { return card.querySelector('[data-slot="' + n + '"]'); };
    var controls = slot("controls"), live = slot("live"), readout = slot("readout");

    var sliders = spec.map(function (s) {
      return slider({ tex: s.tex, min: s.min, max: s.max, step: s.step, value: s.value,
        onInput: function (v) { p[s.key] = v; update(); } });
    });
    sliders.forEach(function (s) { controls.appendChild(s.el); });
    var tools = h("div", { class: "zc-tools" }, [
      button("↺ Wróć do startu", function () {
        spec.forEach(function (s, i) { p[s.key] = s.value; sliders[i].set(s.value); });
        update();
      }, "zbtn-ghost"),
    ]);
    var mom = h("label", { class: "zcheck" }, [h("input", { type: "checkbox", checked: "" }), h("span", { html: texHTML("E(X)") + " i " + texHTML("\\pm\\sigma") })]);
    mom.querySelector("input").addEventListener("change", function (ev) { showMoments = ev.target.checked; update(); });
    tools.appendChild(mom);
    controls.appendChild(tools);

    slot("tabs").appendChild(seg([
      { value: "pdf", tex: discrete ? "p(k)=P(X=k)" : "f(x)" },
      { value: "cdf", tex: "F(x)=P(X\\le x)" },
    ], "pdf", function (v) { mode = v; plot.clearSel(); update(true); }));

    var plot = new Plot(slot("plot"), {
      onHover: function (x) { return hover(x); },
      onSelect: function (sel) { selReadout(sel); },
      snap: discrete && dist.integer ? function (sel) { return [Math.ceil(sel[0] - 0.5), Math.floor(sel[1] + 0.5)]; } : null,
    });

    function valid() { return !dist.valid || dist.valid(p); }

    function scene() {
      var xr = dist.xr(p), sc = { x: xr, y: [0, 1], series: [], marks: [], discrete: discrete, integer: !!dist.integer };
      var ok = valid();
      var mu = ok ? dist.mean(p) : NaN, sd = ok ? Math.sqrt(dist.variance(p)) : NaN;
      var same = spec.every(function (s) { return p[s.key] === p0[s.key]; });
      if (discrete) {
        var atoms = dist.atoms(p), ghost = dist.atoms(p0);
        var w = id === "jednopunktowy" || id === "dwupunktowy" ? 0.55 : Math.min(0.72, 0.72 * Math.max(1, (xr[1] - xr[0]) / 40));
        if (mode === "pdf") {
          sc.series.push({ id: "main", type: "bars", w: w, bars: atoms.map(function (a) { return [a[0], a[1]]; }) });
          if (!same) sc.series.push({ id: "ghost", type: "dots", cls: "is-ghost", r: 3.5, bars: ghost.map(function (a) { return [a[0], a[1]]; }) });
          var top = 0;
          atoms.forEach(function (a) { if (a[0] >= xr[0] && a[0] <= xr[1]) top = Math.max(top, a[1]); });
          sc.y = [0, niceY(Math.max(top, 0.02) * 1.15)];
          sc.yLabel = "P(X = k)";
        } else {
          var acc = 0;
          sc.series.push({ id: "main", type: "steps", bars: atoms.slice().sort(function (a, b) { return a[0] - b[0]; }).map(function (a) { acc += a[1]; return [a[0], Math.min(1, acc)]; }) });
          sc.y = [0, 1.08];
          sc.yLabel = "F(x)";
        }
      } else {
        var N = 320;
        var f = mode === "pdf" ? dist.pdf : dist.cdf;
        var pts = ok ? sample(function (x) { return f(x, p); }, xr[0], xr[1], N) : sample(function () { return 0; }, xr[0], xr[1], N);
        sc.series.push({ id: "main", type: mode === "pdf" ? "area" : "line", pts: pts });
        if (!same) sc.series.push({ id: "ghost", type: "line", cls: "is-ghost", pts: sample(function (x) { return f(x, p0); }, xr[0], xr[1], N) });
        sc.y = mode === "pdf" ? [0, densityTop(pts)] : [0, 1.08];
        sc.yLabel = mode === "pdf" ? "f(x)" : "F(x)";
      }
      if (showMoments && ok && mode === "pdf") {
        if (sd > 0) sc.marks.push({ id: "band", type: "band", x0: mu - sd, x1: mu + sd, cls: "is-sigma" });
        sc.marks.push({ id: "mu", type: "v", x: mu, label: "E(X)", cls: "is-mean" });
        if (sd > 0) sc.marks.push({ id: "sdl", type: "text", x: mu + sd, y: sc.y[1], dy: 34, text: "+σ", cls: "is-sigma-t", anchor: "start" });
      }
      if (mode === "cdf") sc.marks.push({ id: "one", type: "h", y: 1, cls: "is-one" });
      return sc;
    }

    function hover(x) {
      if (!valid()) return null;
      if (discrete) {
        var atoms = dist.atoms(p), best = null;
        atoms.forEach(function (a) { if (!best || Math.abs(a[0] - x) < Math.abs(best[0] - x)) best = a; });
        if (mode === "cdf") {
          var F = cdfDiscrete(atoms, x);
          return { x: x, points: [[x, F]], html: texHTML("F(" + tnum(x, 2) + ")=" + tnum(F, 4)) };
        }
        if (!best || Math.abs(best[0] - x) > Math.max(0.6, (plot.cur.x[1] - plot.cur.x[0]) / 60)) return null;
        return { x: best[0], points: [[best[0], best[1]]],
          html: texHTML("P(X=" + tnum(best[0]) + ")=" + tnum(best[1], 4)) + "<br>" + texHTML("F(" + tnum(best[0]) + ")=" + tnum(cdfDiscrete(atoms, best[0]), 4)) };
      }
      var fx = dist.pdf(x, p), Fx = dist.cdf(x, p);
      return { x: x, points: mode === "pdf" ? [[x, fx]] : [[x, Fx]],
        html: texHTML("x=" + tnum(x, 2)) + "<br>" + texHTML("f(x)=" + tnum(fx, 4)) + "<br>" + texHTML("F(x)=" + tnum(Fx, 4)) };
    }

    function selReadout(sel) {
      if (!sel || !valid()) {
        readout.innerHTML = "Przeciągnij po wykresie, żeby policzyć prawdopodobieństwo przedziału.";
        readout.classList.remove("is-on");
        return;
      }
      var s;
      if (discrete) {
        var atoms = dist.atoms(p), inside = atoms.filter(function (a) { return a[0] >= sel[0] - 1e-9 && a[0] <= sel[1] + 1e-9; });
        var prob = inside.reduce(function (acc, a) { return acc + a[1]; }, 0);
        if (!inside.length) {
          s = "P(" + tnum(sel[0], 2) + "\\le X\\le " + tnum(sel[1], 2) + ")=0";
        } else {
          var lo = inside[0][0], hi = inside[inside.length - 1][0];
          s = (lo === hi ? "P(X=" + tnum(lo) + ")" : "P(" + tnum(lo) + "\\le X\\le " + tnum(hi) + ")");
          if (dist.integer && lo !== hi) s += "=F(" + tnum(hi) + ")-F(" + tnum(lo - 1) + ")";
          s += "=" + tnum(prob, 4);
        }
      } else {
        var a = sel[0], b = sel[1], Fa = dist.cdf(a, p), Fb = dist.cdf(b, p);
        s = "P(" + tnum(a, 2) + "<X\\le " + tnum(b, 2) + ")=F(" + tnum(b, 2) + ")-F(" + tnum(a, 2) + ")=" + tnum(Fb - Fa, 4);
        if (id === "normalny") {
          var za = (a - p.mu) / p.sigma, zb = (b - p.mu) / p.sigma;
          s += "\\\\[2pt] =\\Phi(" + tnum(zb, 2) + ")-\\Phi(" + tnum(za, 2) + ")\\quad\\text{bo } z=\\tfrac{x-\\mu}{\\sigma}";
        }
      }
      readout.innerHTML = '<span class="zr-sel">' + texHTML(s.indexOf("\\\\") >= 0 ? "\\begin{aligned}" + s.replace("\\\\[2pt] =", "\\\\[2pt] &=").replace(/^P/, "&P") + "\\end{aligned}" : s) + '</span> <button type="button" class="zbtn zbtn-ghost zbtn-x">wyczyść</button>';
      readout.querySelector(".zbtn-x").addEventListener("click", function () { plot.clearSel(); });
      readout.classList.add("is-on");
    }

    function renderLive() {
      if (!valid()) {
        live.innerHTML = '<div class="zl-warn">Musi być ' + texHTML("a<b") + ".</div>";
        return;
      }
      var mu = dist.mean(p), v = dist.variance(p);
      live.innerHTML =
        '<div><dt>' + texHTML("E(X)") + "</dt><dd>" + texHTML("=" + dist.Etex + "=" + tnum(mu)) + "</dd></div>" +
        '<div><dt>' + texHTML("Var(X)") + "</dt><dd>" + texHTML("=" + dist.Vtex + "=" + tnum(v)) + "</dd></div>" +
        '<div><dt>' + texHTML("\\sigma") + "</dt><dd>" + texHTML("=\\sqrt{Var(X)}=" + tnum(Math.sqrt(v))) + "</dd></div>";
    }

    function update(instant) {
      plot.set(scene(), instant);
      renderLive();
      if (plot.sel) selReadout(plot.sel);
    }
    update(true);
  }

  // =====================================================================
  // Związki
  // =====================================================================
  function panel(cls, children) { return h("div", { class: "zr-panel " + (cls || "") }, children); }
  function readoutBox() { return h("div", { class: "zr-out" }); }
  function setTex(el, src) { el.innerHTML = texHTML(src); }
  function legend(items) {
    return h("div", { class: "zlegend" }, items.map(function (it) {
      return h("span", { class: "zlegend-item " + it[0], html: "<i></i>" + it[1] });
    }));
  }

  // Ziarno losowania (proces Poissona): ta sama realizacja przy zmianie λ, nowa po kliknięciu.
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  var R = {};

  R["dwupunktowy-szczegolne"] = function (root) {
    var p = { x1: 3, x2: -1, theta: 0.3 };
    var plot, out = readoutBox(), badges = h("div", { class: "zbadges" });
    var s1 = slider({ tex: "x_1", min: -5, max: 5, step: 0.5, value: p.x1, onInput: function (v) { p.x1 = v; upd(); } });
    var s2 = slider({ tex: "x_2", min: -5, max: 5, step: 0.5, value: p.x2, onInput: function (v) { p.x2 = v; upd(); } });
    var s3 = slider({ tex: "\\theta", min: 0.01, max: 0.99, step: 0.01, value: p.theta, onInput: function (v) { p.theta = v; upd(); } });
    function preset(o) { Object.keys(o).forEach(function (k) { p[k] = o[k]; }); s1.set(p.x1); s2.set(p.x2); s3.set(p.theta); upd(); }
    var presets = h("div", { class: "zpresets" }, [
      button("→ Bernoulli", function () { preset({ x1: 1, x2: 0 }); }, "is-z-bernoulli"),
      button("→ jednostajny (θ = ½)", function () { preset({ theta: 0.5 }); }, "is-z-jednostajny-dyskretny"),
      button("→ jednopunktowy (θ → 1)", function () { preset({ theta: 0.99 }); }, "is-z-jednopunktowy"),
    ]);
    var host = h("div", { class: "zr-plot" });
    root.appendChild(h("div", { class: "zr-grid" }, [panel("zr-controls", [presets, s1.el, s2.el, s3.el, badges, out]), host]));
    plot = new Plot(host, { height: 340 });
    function upd() {
      var atoms = D.dwupunktowy.atoms(p), mu = D.dwupunktowy.mean(p), v = D.dwupunktowy.variance(p);
      plot.set({ x: [-6, 6], y: [0, 1.1], series: [{ id: "m", type: "bars", w: 0.55, bars: atoms }],
        marks: [{ id: "mu", type: "v", x: mu, label: "E(X)", cls: "is-mean" }], discrete: true, yLabel: "P(X = x)" });
      var isB = p.x1 === 1 && p.x2 === 0, isU = Math.abs(p.theta - 0.5) < 1e-9, isD = p.theta >= 0.97 || p.x1 === p.x2;
      badges.innerHTML = [
        [isB, "z-bernoulli", "= " + texHTML("Bern(" + tnum(p.theta) + ")")],
        [isU && p.x1 !== p.x2, "z-jednostajny-dyskretny", "= jednostajny na " + texHTML("\\{" + tnum(Math.min(p.x1, p.x2)) + "," + tnum(Math.max(p.x1, p.x2)) + "\\}")],
        [isD, "z-jednopunktowy", "≈ " + texHTML("\\delta_{" + tnum(p.x1) + "}")],
      ].map(function (b) { return '<span class="zbadge is-' + b[1] + (b[0] ? " is-on" : "") + '">' + b[2] + "</span>"; }).join("");
      setTex(out, "\\begin{aligned}E(X)&=x_2+(x_1-x_2)\\theta=" + tnum(mu) + "\\\\ Var(X)&=(x_1-x_2)^2\\theta(1-\\theta)=" + tnum(v) + "\\end{aligned}");
    }
    upd();
  };

  R["bernoulli-dwumianowy"] = function (root) {
    var theta = 0.3, n = 1, playing = 0;
    var host = h("div", { class: "zr-plot" }), out = readoutBox(), counter = h("div", { class: "zbig" });
    var s = slider({ tex: "\\theta", min: 0.05, max: 0.95, step: 0.01, value: theta, onInput: function (v) { theta = v; upd(); } });
    var add = button("+ 1 próba", function () { stop(); if (n < 40) { n++; upd(); } }, "zbtn-main");
    var sub = button("− 1", function () { stop(); if (n > 1) { n--; upd(); } });
    var play = button("▶ Odtwórz", function () {
      if (playing) { stop(); return; }
      if (n >= 30) n = 1;
      play.innerHTML = "❚❚ Pauza";
      playing = setInterval(function () { if (n >= 30) { stop(); return; } n++; upd(); }, 420);
      upd();
    });
    function stop() { if (playing) clearInterval(playing); playing = 0; play.innerHTML = "▶ Odtwórz"; }
    root.appendChild(h("div", { class: "zr-grid" }, [
      panel("zr-controls", [counter, h("div", { class: "zpresets" }, [add, sub, play]), s.el,
        legend([["is-stack-a", "<span>ostatnia próba: porażka<br>" + texHTML("(1-\\theta)\\,P(S_{n-1}=k)") + "</span>"],
          ["is-stack-b", "<span>ostatnia próba: sukces<br>" + texHTML("\\theta\\,P(S_{n-1}=k-1)") + "</span>"]]), out]),
      host]));
    var plot = new Plot(host, { height: 360 });
    function pmf(m, k) { return binomPmf(k, m, theta); }
    function upd() {
      var bars = range(0, n).map(function (k) {
        var a = n === 1 ? (k === 0 ? 1 - theta : 0) : (1 - theta) * pmf(n - 1, k);
        var b = n === 1 ? (k === 1 ? theta : 0) : theta * pmf(n - 1, k - 1);
        return [k, a, b];
      });
      var top = 0;
      bars.forEach(function (b) { top = Math.max(top, b[1] + b[2]); });
      plot.set({ x: [-1, Math.max(10, n + 1)], y: [0, niceY(top * 1.15)], integer: true, discrete: true,
        series: [{ id: "m", type: "stack", w: 0.72, bars: bars }],
        marks: [{ id: "mu", type: "v", x: n * theta, label: "E(Sₙ) = nθ", cls: "is-mean" }], yLabel: "P(Sₙ = k)" });
      counter.innerHTML = texHTML("S_{" + n + "}=X_1+\\dots+X_{" + n + "}\\sim Binom(" + n + "," + tnum(theta) + ")");
      setTex(out, "E(S_{" + n + "})=" + n + "\\cdot" + tnum(theta) + "=" + tnum(n * theta) + ",\\quad Var(S_{" + n + "})=" + tnum(n * theta * (1 - theta)));
    }
    upd();
  };

  R["bernoulli-geometryczny"] = function (root) {
    var theta = 0.25, k = 3;
    var stick = h("div", { class: "zstick" }), out = readoutBox(), host = h("div", { class: "zr-plot" });
    var s = slider({ tex: "\\theta", min: 0.05, max: 0.9, step: 0.01, value: theta, onInput: function (v) { theta = v; upd(); } });
    var sk = slider({ tex: "k", min: 1, max: 12, step: 1, value: k, onInput: function (v) { k = v; upd(); } });
    root.appendChild(h("div", { class: "zr-stack" }, [
      h("div", { class: "zr-stick-wrap" }, [h("p", { class: "zr-cap", text: "Patyk długości 1 = całe prawdopodobieństwo. Próba k odcina ułamek θ z tego, co zostało." }), stick]),
      h("div", { class: "zr-grid" }, [panel("zr-controls", [s.el, sk.el, out]), host])]));
    var plot = new Plot(host, { height: 300, onHover: null });
    function upd() {
      var parts = [], left = 1, html = "";
      for (var i = 1; i <= 40 && left > 0.002; i++) { parts.push([i, left * theta]); left *= 1 - theta; }
      var rest = 1 - parts.reduce(function (a, q) { return a + q[1]; }, 0);
      parts.forEach(function (q) {
        var cls = q[0] === k ? " is-k" : q[0] < k ? " is-before" : "";
        html += '<span class="zstick-seg' + cls + (q[0] % 2 ? "" : " is-alt") + '" style="flex:' + q[1] + '" title="k = ' + q[0] + '">' +
          (q[1] > 0.045 ? "<b>" + q[0] + "</b>" : "") + "</span>";
      });
      html += '<span class="zstick-seg is-rest" style="flex:' + Math.max(rest, 0) + '"></span>';
      stick.innerHTML = html + '<span class="zstick-tail" style="width:' + (Math.pow(1 - theta, k) * 100) + '%"><em>' + texHTML("P(X>" + k + ")") + "</em></span>";
      var atoms = D.geometryczny.atoms({ theta: theta });
      plot.set({ x: [0, 13], y: [0, niceY(theta * 1.15)], integer: true, discrete: true,
        series: [{ id: "m", type: "bars", w: 0.7, bars: atoms.filter(function (a) { return a[0] <= 14; }).map(function (a) { return [a[0], a[1], a[0] === k ? "is-hl" : a[0] > k ? "is-dim" : ""]; }) }],
        marks: [], yLabel: "P(X = k)" });
      setTex(out, "\\begin{aligned}P(X=" + k + ")&=(1-\\theta)^{" + (k - 1) + "}\\theta=" + tnum(Math.pow(1 - theta, k - 1) * theta, 4) +
        "\\\\ P(X>" + k + ")&=(1-\\theta)^{" + k + "}=" + tnum(Math.pow(1 - theta, k), 4) + "\\end{aligned}");
    }
    upd();
  };

  R["dwumianowy-poisson"] = function (root) {
    var lambda = 3, n = 10;
    var host = h("div", { class: "zr-plot" }), out = readoutBox();
    var sl = slider({ tex: "\\lambda=n\\theta", min: 0.5, max: 10, step: 0.1, value: lambda, onInput: function (v) { lambda = v; clampN(); upd(); } });
    // n w skali logarytmicznej: 0..1000 → n_min..1000
    function nMin() { return Math.max(2, Math.ceil(lambda + 0.5)); }
    function toN(t) { return Math.round(Math.exp(Math.log(nMin()) + (Math.log(1000) - Math.log(nMin())) * t / 1000)); }
    function fromN(v) { return 1000 * (Math.log(v) - Math.log(nMin())) / (Math.log(1000) - Math.log(nMin())); }
    var sn = slider({ tex: "n", min: 0, max: 1000, step: 1, value: fromN(n), map: toN, format: function (v) { return String(v); },
      onInput: function (v) { n = v; upd(); } });
    function clampN() { n = Math.max(n, nMin()); sn.set(fromN(n)); }
    var ex = button("Zadanie 8.1: n = 500, θ = 0,002", function () { lambda = 1; sl.set(1); n = 500; sn.set(fromN(500)); upd(); });
    root.appendChild(h("div", { class: "zr-grid" }, [
      panel("zr-controls", [sl.el, sn.el, h("div", { class: "zpresets" }, [ex]),
        legend([["is-z-dwumianowy", texHTML("Binom(n,\\lambda/n)")], ["is-z-poisson", texHTML("Pois(\\lambda)")]]), out]),
      host]));
    var plot = new Plot(host, { height: 360, onHover: function (x) {
      var k = Math.round(x); if (k < 0) return null;
      var b = binomPmf(k, n, lambda / n), q = poisPmf(k, lambda);
      return { x: k, points: [[k, b, "is-z-dwumianowy"], [k, q, "is-z-poisson"]], html: "k = " + k + "<br>Binom: " + fmt(b, 4) + "<br>Pois: " + fmt(q, 4) };
    } });
    function upd() {
      var theta = lambda / n, K = Math.ceil(lambda + 5 * Math.sqrt(lambda) + 5);
      var bin = range(0, Math.min(n, K)).map(function (k) { return [k, binomPmf(k, n, theta)]; });
      var poi = range(0, K).map(function (k) { return [k, poisPmf(k, lambda)]; });
      var tv = 0;
      for (var k = 0; k <= Math.max(K, 0); k++) tv += Math.abs(binomPmf(k, n, theta) - poisPmf(k, lambda));
      var top = 0; bin.concat(poi).forEach(function (a) { top = Math.max(top, a[1]); });
      plot.set({ x: [-1, niceUp(lambda + 4 * Math.sqrt(lambda) + 3)], y: [0, niceY(top * 1.15)], integer: true, discrete: true,
        series: [{ id: "b", type: "bars", w: 0.62, cls: "is-z-dwumianowy", bars: bin },
          { id: "p", type: "stems", cls: "is-z-poisson", r: 5.5, bars: poi }], marks: [], yLabel: "P(X = k)" });
      setTex(out, "\\begin{aligned}\\theta&=\\tfrac{\\lambda}{n}=" + tnum(theta, 4) +
        "\\\\ P(X=0)&:\\ \\left(1-\\tfrac{\\lambda}{n}\\right)^{n}=" + tnum(Math.pow(1 - theta, n), 4) + "\\ \\ \\text{vs}\\ \\ e^{-\\lambda}=" + tnum(Math.exp(-lambda), 4) +
        "\\\\ \\textstyle\\sum_k|p_k-q_k|&=" + tnum(tv, 4) + "\\end{aligned}");
    }
    clampN();
    upd();
  };

  R["poisson-wykladniczy"] = function (root) {
    var lambda = 1, t = 2.5, seed = 7, unit = [];
    var T = 10;
    var timeline = h("div", { class: "ztimeline" }), out = readoutBox();
    var hostA = h("div", { class: "zr-plot" }), hostB = h("div", { class: "zr-plot" });
    function regen() {
      // Pierwsza realizacja: ziarno z czytelnym pierwszym odstępem (T nie przy samym zerze).
      for (;;) {
        var r = rng(seed), s = 0; unit = [];
        while (s < 40) { s += -Math.log(1 - r()); unit.push(s); }
        if (unit[0] > 0.35 && unit[0] < 2.5) break;
        seed = (seed * 7919 + 17) % 100003;
      }
    }
    var sl = slider({ tex: "\\lambda", min: 0.3, max: 3, step: 0.05, value: lambda, onInput: function (v) { lambda = v; upd(); } });
    var st = slider({ tex: "t", min: 0.05, max: 8, step: 0.05, value: t, onInput: function (v) { t = v; upd(); } });
    var again = button("↻ Nowa realizacja", function () { seed = (seed * 7919 + 17) % 100003; regen(); upd(); });
    root.appendChild(h("div", { class: "zr-stack" }, [
      h("div", { class: "zr-tl-wrap" }, [timeline]),
      h("div", { class: "zr-grid zr-grid-3" }, [
        panel("zr-controls", [sl.el, st.el, h("div", { class: "zpresets" }, [again]), out]),
        h("div", { class: "zr-sub" }, [h("p", { class: "zr-cap", html: "Liczba zdarzeń w [0, t]: " + texHTML("N_t\\sim Pois(\\lambda t)") }), hostA]),
        h("div", { class: "zr-sub" }, [h("p", { class: "zr-cap", html: "Czas do 1. zdarzenia: " + texHTML("P(T>t)=e^{-\\lambda t}") }), hostB])])]));
    var pa = new Plot(hostA, { width: 480, height: 340 }), pb = new Plot(hostB, { width: 480, height: 340 });
    function upd() {
      var times = unit.map(function (u) { return u / lambda; }).filter(function (x) { return x <= T; });
      var count = times.filter(function (x) { return x <= t; }).length;
      var W = 1000, px = function (x) { return 30 + x / T * (W - 60); };
      var svg = '<svg viewBox="0 0 ' + W + ' 120" class="ztl">' +
        '<rect class="ztl-win" x="' + px(0) + '" y="20" width="' + (px(t) - px(0)) + '" height="64" rx="6"/>' +
        '<line class="ztl-axis" x1="' + px(0) + '" x2="' + px(T) + '" y1="70" y2="70"/>';
      for (var i = 0; i <= T; i++) svg += '<line class="ztl-tick" x1="' + px(i) + '" x2="' + px(i) + '" y1="70" y2="76"/><text class="ztl-num" x="' + px(i) + '" y="96" text-anchor="middle">' + i + "</text>";
      if (times.length) {
        svg += '<path class="ztl-first" d="M' + px(0) + ',44 H' + px(times[0]) + '"/><text class="ztl-T" x="' + Math.max((px(0) + px(times[0])) / 2, px(0) + 44) + '" y="38" text-anchor="middle">T = ' + fmt(times[0], 2) + "</text>";
      }
      times.forEach(function (x, j) {
        svg += '<circle class="ztl-ev' + (x <= t ? " is-in" : "") + '" cx="' + px(x) + '" cy="70" r="' + (j === 0 ? 8 : 6.5) + '"/>';
      });
      svg += '<line class="ztl-t" x1="' + px(t) + '" x2="' + px(t) + '" y1="14" y2="88"/><text class="ztl-tl" x="' + px(t) + '" y="12" text-anchor="middle">t</text>';
      svg += '<text class="ztl-count" x="' + (px(t) + 10) + '" y="112">Nₜ = ' + count + "</text>";
      timeline.innerHTML = svg + "</svg>";
      var m = lambda * t, K = Math.max(8, Math.ceil(m + 4 * Math.sqrt(m) + 4));
      pa.set({ x: [-1, niceUp(K)], y: [0, niceY(Math.max(poisPmf(0, m), poisPmf(Math.floor(m), m)) * 1.15)], integer: true, discrete: true,
        series: [{ id: "m", type: "bars", w: 0.7, cls: "is-z-poisson", bars: range(0, K).map(function (k) { return [k, poisPmf(k, m), k === 0 ? "is-hl" : k === count ? "is-mark" : ""]; }) }],
        marks: [], yLabel: "P(Nₜ = k)" });
      pb.set({ x: [0, 8], y: [0, 1.08], series: [{ id: "m", type: "line", cls: "is-z-wykladniczy", pts: sample(function (x) { return Math.exp(-lambda * x); }, 0, 8, 240) }],
        marks: [{ id: "g", type: "seg", x1: t, y1: 0, x2: t, y2: Math.exp(-lambda * t), cls: "is-guide" },
          { id: "d", type: "dot", x: t, y: Math.exp(-lambda * t), cls: "is-hl" }], yLabel: "P(T > t)" });
      setTex(out, "P(N_t=0)=e^{-\\lambda t}=e^{-" + tnum(m, 2) + "}=" + tnum(Math.exp(-m), 4) + "=P(T>t)");
    }
    regen();
    upd();
  };

  R["geometryczny-wykladniczy"] = function (root) {
    var lambda = 1, di = 1, s = 1;
    var DELTAS = [0.5, 0.25, 0.1, 0.05, 0.02, 0.01];
    var hostA = h("div", { class: "zr-plot" }), hostB = h("div", { class: "zr-plot" }), out = readoutBox(), outB = readoutBox();
    var sl = slider({ tex: "\\lambda", min: 0.2, max: 1.8, step: 0.05, value: lambda, onInput: function (v) { lambda = v; upd(); } });
    var sd = slider({ tex: "\\Delta", min: 0, max: DELTAS.length - 1, step: 1, value: di, map: function (i) { return DELTAS[i]; },
      format: function (v) { return fmt(v); }, onInput: function () { di = +sd.input.value; upd(); } });
    var ss = slider({ tex: "s", min: 0, max: 4, step: 0.05, value: s, onInput: function (v) { s = v; upd(); } });
    root.appendChild(h("div", { class: "zr-stack" }, [
      h("div", { class: "zr-grid" }, [panel("zr-controls", [sl.el, sd.el,
        legend([["is-z-geometryczny", "schodki: " + texHTML("\\Delta\\cdot Geom(\\lambda\\Delta)")], ["is-z-wykladniczy", texHTML("1-e^{-\\lambda x}")]]), out]),
        h("div", { class: "zr-sub" }, [h("p", { class: "zr-cap", text: "Dystrybuanty" }), hostA])]),
      h("div", { class: "zr-grid" }, [panel("zr-controls", [h("p", { class: "zr-cap", html: "<b>Brak pamięci.</b> Wiemy, że czekamy już " + texHTML("s") + ". Ile jeszcze?" }), ss.el, outB]),
        h("div", { class: "zr-sub" }, [h("p", { class: "zr-cap", html: "Ogon za " + texHTML("s") + " po przeskalowaniu (przerywana) to ta sama gęstość, przesunięta o " + texHTML("s") }), hostB])])]));
    var pa = new Plot(hostA, { height: 320 }), pb = new Plot(hostB, { height: 300 });
    function upd() {
      var delta = DELTAS[di], th = Math.min(0.99, lambda * delta), X = 6;
      var jumps = [], acc = 0, maxd = 0;
      for (var k = 1; k * delta <= X + 1e-9; k++) {
        acc = 1 - Math.pow(1 - th, k);
        jumps.push([k * delta, acc]);
        maxd = Math.max(maxd, Math.abs(acc - (1 - Math.exp(-lambda * k * delta))), Math.abs(1 - Math.pow(1 - th, k - 1) - (1 - Math.exp(-lambda * k * delta))));
      }
      pa.set({ x: [0, X], y: [0, 1.08], series: [
        { id: "e", type: "line", cls: "is-z-wykladniczy", pts: sample(function (x) { return 1 - Math.exp(-lambda * x); }, 0, X, 240) },
        { id: "g" + di, type: "steps", cls: "is-z-geometryczny", noDots: delta < 0.05, bars: jumps }], marks: [{ id: "one", type: "h", y: 1, cls: "is-one" }], yLabel: "F(x)" });
      setTex(out, "\\begin{aligned}\\theta&=\\lambda\\Delta=" + tnum(th, 3) + "\\\\ \\max|F_\\Delta-F|&\\approx" + tnum(maxd, 3) + "\\end{aligned}");
      var Xb = 6;
      pb.set({ x: [0, Xb], y: [0, niceY(lambda * 1.1)], selSeries: "f", series: [
        { id: "f", type: "area", cls: "is-z-wykladniczy", pts: sample(function (x) { return lambda * Math.exp(-lambda * x); }, 0, Xb, 240) },
        { id: "c", type: "line", cls: "is-cond", pts: sample(function (x) { return x < s ? NaN : lambda * Math.exp(-lambda * (x - s)); }, 0, Xb, 240).filter(function (q) { return !isNaN(q[1]); }) }],
        marks: [{ id: "s", type: "v", x: s, label: "s", cls: "is-guide" }], yLabel: "f(x)" });
      pb.setSel([s, Xb]);
      setTex(outB, "\\begin{aligned}P(T>s+t\\mid T>s)&=\\frac{e^{-\\lambda(s+t)}}{e^{-\\lambda s}}\\\\&=e^{-\\lambda t}=P(T>t)\\end{aligned}");
    }
    upd();
  };

  R["wykladniczy-gamma"] = function (root) {
    var r = 1, s = 1, playing = 0;
    var host = h("div", { class: "zr-plot" }), out = readoutBox(), counter = h("div", { class: "zbig" });
    var sr = slider({ tex: "r", min: 0.5, max: 3, step: 0.05, value: r, onInput: function (v) { r = v; upd(); } });
    var add = button("+ 1 zdarzenie", function () { stop(); if (s < 15) { s++; upd(); } }, "zbtn-main");
    var sub = button("− 1", function () { stop(); if (s > 1) { s--; upd(); } });
    var play = button("▶ Odtwórz", function () {
      if (playing) { stop(); return; }
      if (s >= 12) s = 1;
      play.innerHTML = "❚❚ Pauza";
      playing = setInterval(function () { if (s >= 12) { stop(); return; } s++; upd(); }, 650);
      upd();
    });
    function stop() { if (playing) clearInterval(playing); playing = 0; play.innerHTML = "▶ Odtwórz"; }
    root.appendChild(h("div", { class: "zr-grid" }, [
      panel("zr-controls", [counter, h("div", { class: "zpresets" }, [add, sub, play]), sr.el, out]), host]));
    var plot = new Plot(host, { height: 360 });
    function upd() {
      var X = niceUp((12 + 4.5 * Math.sqrt(12)) / r), series = [];
      for (var k = 1; k < s; k++) {
        series.push({ id: "h" + k, type: "line", cls: "is-history", pts: sample(function (x) { return gammaPdf(x, k, r); }, 0, X, 240) });
      }
      var main = sample(function (x) { return gammaPdf(x, s, r); }, 0, X, 240);
      series.push({ id: "m", type: "area", cls: "is-z-gamma", pts: main });
      plot.set({ x: [0, X], y: [0, niceY(r * 1.1)], series: series,
        marks: [{ id: "mu", type: "v", x: s / r, label: "E = s/r", cls: "is-mean" }], yLabel: "f(x)" });
      counter.innerHTML = texHTML((s === 1 ? "T_1\\sim Exp(" + tnum(r) + ")=Gamma(1," + tnum(r) + ")" : "T_1+\\dots+T_{" + s + "}\\sim Gamma(" + s + "," + tnum(r) + ")"));
      setTex(out, "\\begin{aligned}M(t)&=\\left(\\tfrac{r}{r-t}\\right)^{" + s + "}=\\big(M_{Exp}(t)\\big)^{" + s + "}\\\\ E&=\\tfrac{s}{r}=" + tnum(s / r) + ",\\ \\ Var=\\tfrac{s}{r^2}=" + tnum(s / (r * r)) + "\\end{aligned}");
    }
    upd();
  };

  R["gamma-chi-kwadrat"] = function (root) {
    var n = 3;
    var host = h("div", { class: "zr-plot" }), out = readoutBox(), badge = h("div", { class: "zbadges" });
    var sn = slider({ tex: "n", min: 1, max: 20, step: 1, value: n, onInput: function (v) { n = v; upd(); } });
    root.appendChild(h("div", { class: "zr-grid" }, [
      panel("zr-controls", [sn.el, legend([["is-z-chi-kwadrat", texHTML("\\chi^2(n)")], ["is-z-gamma is-dash", texHTML("Gamma(\\tfrac n2,\\tfrac12)")], ["is-z-wykladniczy is-dot", texHTML("Exp(\\tfrac12)")]]), badge, out]),
      host]));
    var plot = new Plot(host, { height: 360 });
    function upd() {
      var X = niceUp(n + 4.5 * Math.sqrt(2 * n) + 3);
      var chi = sample(function (x) { return gammaPdf(x, n / 2, 0.5); }, 0, X, 300);
      var series = [{ id: "c", type: "area", cls: "is-z-chi-kwadrat", pts: chi },
        { id: "g", type: "line", cls: "is-z-gamma is-dash", pts: sample(function (x) { return gammaPdf(x, n / 2, 0.5); }, 0, X, 300) }];
      series.push({ id: "e", type: "line", cls: "is-z-wykladniczy is-dot" + (n === 2 ? "" : " is-off"), pts: sample(function (x) { return 0.5 * Math.exp(-x / 2); }, 0, X, 300) });
      plot.set({ x: [0, X], y: [0, densityTop(chi)], series: series, marks: [{ id: "mu", type: "v", x: n, label: "E = n", cls: "is-mean" }], yLabel: "f(x)" });
      badge.innerHTML = '<span class="zbadge is-z-wykladniczy' + (n === 2 ? " is-on" : "") + '">' + texHTML("\\chi^2(2)=Exp(\\tfrac12)") + "</span>";
      setTex(out, "\\begin{aligned}\\chi^2(" + n + ")&=Gamma\\left(" + tnum(n / 2) + ",\\tfrac12\\right)\\\\ E&=\\tfrac{" + tnum(n / 2) + "}{1/2}=" + n + ",\\ \\ Var=\\tfrac{" + tnum(n / 2) + "}{1/4}=" + 2 * n + "\\end{aligned}");
    }
    upd();
  };

  R["normalny-chi-kwadrat"] = function (root) {
    var y = 1.5;
    var hostA = h("div", { class: "zr-plot" }), hostB = h("div", { class: "zr-plot" }), out = readoutBox();
    var mode = "cdf";
    var sy = slider({ tex: "y", min: 0.02, max: 6, step: 0.02, value: y, onInput: function (v) { y = v; upd(); } });
    var tabs = seg([{ value: "cdf", tex: "F_Y(y)" }, { value: "pdf", tex: "f_Y(y)" }], "cdf", function (v) { mode = v; upd(); });
    root.appendChild(h("div", { class: "zr-stack" }, [
      h("div", { class: "zr-grid zr-grid-3" }, [
        panel("zr-controls", [sy.el, out]),
        h("div", { class: "zr-sub" }, [h("p", { class: "zr-cap", html: texHTML("Z\\sim\\mathcal{N}(0,1)") + ": pole między " + texHTML("-\\sqrt y") + " i " + texHTML("\\sqrt y") }), hostA]),
        h("div", { class: "zr-sub" }, [h("div", { class: "zr-cap" }, [h("span", { html: texHTML("Y=Z^2\\sim\\chi^2(1)") + " " }), tabs]), hostB])])]));
    var pa = new Plot(hostA, { width: 480, height: 340 }), pb = new Plot(hostB, { width: 480, height: 340 });
    function upd() {
      var r = Math.sqrt(y), F = 2 * Phi(r) - 1;
      pa.set({ x: [-4, 4], y: [0, 0.45], selSeries: "n", series: [{ id: "n", type: "area", cls: "is-z-normalny", pts: sample(phi, -4, 4, 300) }],
        marks: [{ id: "l", type: "v", x: -r, label: "−√y", cls: "is-guide" }, { id: "r", type: "v", x: r, label: "√y", cls: "is-guide" },
          { id: "area", type: "text", x: 0, y: 0.12, text: fmt(F, 3), cls: "is-area" }], yLabel: "φ(z)" });
      pa.setSel([-r, r]);
      if (mode === "cdf") {
        pb.set({ x: [0, 8], y: [0, 1.08], series: [{ id: "m", type: "line", cls: "is-z-chi-kwadrat", pts: sample(function (x) { return gammaCdf(x, 0.5, 0.5); }, 0, 8, 300) }],
          marks: [{ id: "g", type: "seg", x1: y, y1: 0, x2: y, y2: F, cls: "is-guide" }, { id: "g2", type: "seg", x1: 0, y1: F, x2: y, y2: F, cls: "is-guide" }, { id: "d", type: "dot", x: y, y: F, cls: "is-hl" }], yLabel: "F_Y(y)" });
      } else {
        var pts = sample(function (x) { return gammaPdf(x, 0.5, 0.5); }, 0, 8, 300);
        pb.set({ x: [0, 8], y: [0, 1.2], series: [{ id: "m", type: "area", cls: "is-z-chi-kwadrat", pts: pts }],
          marks: [{ id: "g", type: "seg", x1: y, y1: 0, x2: y, y2: gammaPdf(y, 0.5, 0.5), cls: "is-guide" }, { id: "d", type: "dot", x: y, y: gammaPdf(y, 0.5, 0.5), cls: "is-hl" }], yLabel: "f_Y(y)" });
      }
      setTex(out, "\\begin{aligned}F_Y(" + tnum(y, 2) + ")&=P(-\\sqrt y\\le Z\\le\\sqrt y)\\\\&=2\\Phi(" + tnum(r, 3) + ")-1\\\\&=" + tnum(F, 4) + "\\end{aligned}");
    }
    upd();
  };

  R.ctg = function (root) {
    var src = "dwumianowy", size = { dwumianowy: 5, poisson: 2, gamma: 2 };
    var host = h("div", { class: "zr-plot" }), out = readoutBox(), sliderBox = h("div");
    var cfg = {
      dwumianowy: { tex: "n", min: 1, max: 200, step: 1, note: "Binom(n,\\ 0{,}2)" },
      poisson: { tex: "\\lambda", min: 0.5, max: 100, step: 0.5, note: "Pois(\\lambda)" },
      gamma: { tex: "s", min: 0.5, max: 100, step: 0.5, note: "Gamma(s,\\ 1)" },
    };
    var sl;
    function makeSlider() {
      sliderBox.innerHTML = "";
      var c = cfg[src];
      sl = slider({ tex: c.tex, min: c.min, max: c.max, step: c.step, value: size[src], onInput: function (v) { size[src] = v; upd(); } });
      sliderBox.appendChild(h("p", { class: "zr-cap", html: "Rozkład: " + texHTML(c.note) }));
      sliderBox.appendChild(sl.el);
    }
    var tabs = seg([{ value: "dwumianowy", tex: "Binom" }, { value: "poisson", tex: "Pois" }, { value: "gamma", tex: "Gamma" }], src,
      function (v) { src = v; makeSlider(); upd(); });
    root.appendChild(h("div", { class: "zr-grid" }, [
      panel("zr-controls", [tabs, sliderBox, legend([["is-src", "zestandaryzowany rozkład"], ["is-z-normalny", texHTML("\\varphi(z)")]]), out]), host]));
    var plot = new Plot(host, { height: 380 });
    function upd() {
      var series = [], v = size[src], mu, sd, skew;
      root.style.setProperty("--src", "var(--z-" + src + ")");
      if (src === "gamma") {
        mu = v; sd = Math.sqrt(v); skew = 2 / Math.sqrt(v);
        series.push({ id: "g", type: "area", cls: "is-src", pts: sample(function (z) { return sd * gammaPdf(mu + sd * z, v, 1); }, -4, 4, 300) });
      } else {
        var atoms = src === "dwumianowy" ? D.dwumianowy.atoms({ n: v, theta: 0.2 }) : D.poisson.atoms({ lambda: v });
        mu = src === "dwumianowy" ? v * 0.2 : v;
        sd = Math.sqrt(src === "dwumianowy" ? v * 0.2 * 0.8 : v);
        skew = src === "dwumianowy" ? 0.6 / Math.sqrt(v * 0.16) : 1 / Math.sqrt(v);
        series.push({ id: "d" + src, type: "bars", cls: "is-src", w: 1 / sd * 0.92, bars: atoms.map(function (a) { return [(a[0] - mu) / sd, a[1] * sd]; }).filter(function (b) { return b[0] > -5 && b[0] < 5; }) });
      }
      series.push({ id: "phi", type: "line", cls: "is-z-normalny is-thick", pts: sample(phi, -4, 4, 240) });
      var top = 0.45;
      series.forEach(function (se) { (se.bars || se.pts).forEach(function (q) { if (q[0] > -4 && q[0] < 4 && isFinite(q[1])) top = Math.max(top, q[1]); }); });
      plot.set({ x: [-4, 4], y: [0, niceY(Math.min(top, 2.5) * 1.1)], series: series, marks: [], xLabel: "z = (x − E X) / σ", yLabel: "gęstość" });
      setTex(out, "\\begin{aligned}E(X)&=" + tnum(mu) + ",\\ \\ \\sigma=" + tnum(sd) + "\\\\ \\text{asymetria}&=" + tnum(skew, 3) + "\\ \\to 0\\end{aligned}");
    }
    makeSlider();
    upd();
  };

  R["jednostajny-wykladniczy"] = function (root) {
    var lambda = 1, u = 0.6, N = 24;
    var host = h("div", { class: "zr-plot" }), out = readoutBox();
    var sl = slider({ tex: "\\lambda", min: 0.3, max: 3, step: 0.05, value: lambda, onInput: function (v) { lambda = v; upd(); } });
    var su = slider({ tex: "u", min: 0.01, max: 0.99, step: 0.01, value: u, onInput: function (v) { u = v; upd(); } });
    root.appendChild(h("div", { class: "zr-grid" }, [
      panel("zr-controls", [sl.el, su.el, legend([["is-z-jednostajny", texHTML("u_i=\\tfrac{i-1/2}{" + N + "}") + " (równo co " + texHTML("\\tfrac1{" + N + "}") + ")"], ["is-z-wykladniczy", texHTML("x_i=F^{-1}(u_i)")]]), out]), host]));
    var plot = new Plot(host, { height: 380, width: 720 });
    function upd() {
      var X = 6, x = -Math.log(1 - u) / lambda, marks = [];
      for (var i = 1; i <= N; i++) {
        var ui = (i - 0.5) / N, xi = -Math.log(1 - ui) / lambda;
        marks.push({ id: "ru" + i, type: "dot", x: 0, y: ui, r: 3.5, cls: "is-z-jednostajny" });
        if (xi <= X) {
          marks.push({ id: "p" + i, type: "seg", x1: 0, y1: ui, x2: xi, y2: ui, cls: "is-faint" });
          marks.push({ id: "q" + i, type: "seg", x1: xi, y1: ui, x2: xi, y2: 0, cls: "is-faint" });
          marks.push({ id: "rx" + i, type: "dot", x: xi, y: 0, r: 4, cls: "is-z-wykladniczy" });
        }
      }
      marks.push({ id: "h", type: "seg", x1: 0, y1: u, x2: Math.min(x, X), y2: u, cls: "is-guide is-strong" });
      marks.push({ id: "v", type: "seg", x1: Math.min(x, X), y1: u, x2: Math.min(x, X), y2: 0, cls: "is-guide is-strong" });
      marks.push({ id: "d", type: "dot", x: Math.min(x, X), y: u, cls: "is-hl" });
      plot.set({ x: [0, X], y: [0, 1.05], series: [{ id: "F", type: "line", cls: "is-z-wykladniczy is-thick", pts: sample(function (t) { return 1 - Math.exp(-lambda * t); }, 0, X, 240) }],
        marks: marks, yLabel: "u = F(x)", xLabel: "x" });
      setTex(out, "x=-\\frac{\\ln(1-u)}{\\lambda}=-\\frac{\\ln(1-" + tnum(u, 2) + ")}{" + tnum(lambda, 2) + "}=" + tnum(x, 3));
    }
    upd();
  };

  R["jednostajny-dyskretny-ciagly"] = function (root) {
    var n = 5;
    var hostA = h("div", { class: "zr-plot" }), hostB = h("div", { class: "zr-plot" }), out = readoutBox();
    var sn = slider({ tex: "n", min: 2, max: 60, step: 1, value: n, onInput: function (v) { n = v; upd(); } });
    root.appendChild(h("div", { class: "zr-grid zr-grid-3" }, [
      panel("zr-controls", [sn.el, out]),
      h("div", { class: "zr-sub" }, [h("p", { class: "zr-cap", html: "Funkcja prawdopodobieństwa: każdy punkt ma " + texHTML("\\tfrac1n") }), hostA]),
      h("div", { class: "zr-sub" }, [h("p", { class: "zr-cap", html: "Dystrybuanty: schodki i " + texHTML("F(x)=x") }), hostB])]));
    var pa = new Plot(hostA, { width: 480, height: 340 }), pb = new Plot(hostB, { width: 480, height: 340 });
    function upd() {
      var pts = range(1, n).map(function (i) { return [i / n, 1 / n]; });
      pa.set({ x: [0, 1.05], y: [0, 0.55], series: [{ id: "m" + n, type: "stems", cls: "is-z-jednostajny-dyskretny", r: n > 30 ? 3 : 5, bars: pts }], marks: [], yLabel: "P(X = x)", xDigits: 1 });
      var acc = 0;
      pb.set({ x: [0, 1.05], y: [0, 1.08], xDigits: 1, series: [
        { id: "line", type: "line", cls: "is-z-jednostajny is-thick", pts: [[0, 0], [1, 1], [1.05, 1]] },
        { id: "s" + n, type: "steps", cls: "is-z-jednostajny-dyskretny", noDots: n > 25, bars: pts.map(function (q) { acc += q[1]; return [q[0], acc]; }) }], marks: [], yLabel: "F(x)" });
      setTex(out, "\\max_x|F_n(x)-x|=\\tfrac1n=" + tnum(1 / n, 4));
    }
    upd();
  };

  // =====================================================================
  // Mapa, scena i nawigacja
  // =====================================================================
  function sparks() {
    document.querySelectorAll("[data-spark]").forEach(function (g) {
      var id = g.getAttribute("data-spark"), card = document.getElementById(id), dist = D[id];
      if (!card || !dist) return;
      var p = {};
      JSON.parse(card.getAttribute("data-params")).forEach(function (s) { p[s.key] = s.value; });
      var W = 48, H = 34, out = "";
      if (dist.kind === "d") {
        var atoms = dist.atoms(p).filter(function (a) { return a[1] > 1e-3; }).slice(0, 18);
        var xr = id === "jednopunktowy" ? [-2, 3] : id === "dwupunktowy" ? [-2, 4] : [atoms[0][0] - 0.8, atoms[atoms.length - 1][0] + 0.8];
        var top = Math.max.apply(null, atoms.map(function (a) { return a[1]; }));
        var bw = Math.max(2.2, Math.min(7, W / (xr[1] - xr[0]) * 0.7));
        atoms.forEach(function (a) {
          var x = (a[0] - xr[0]) / (xr[1] - xr[0]) * W, hh = a[1] / top * H;
          out += '<rect x="' + (x - bw / 2).toFixed(1) + '" y="' + (H - hh).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + hh.toFixed(1) + '" rx="1"/>';
        });
      } else {
        var r = dist.xr(p);
        if (id === "jednostajny") r = [-1, 4];
        var pts = sample(function (x) { return dist.pdf(x, p); }, r[0], r[1], 60);
        var mx = densityTop(pts);
        var d = pts.map(function (q, i) { return (i ? "L" : "M") + ((q[0] - r[0]) / (r[1] - r[0]) * W).toFixed(1) + "," + (H - Math.min(1, q[1] / mx) * H).toFixed(1); }).join("");
        out = '<path class="zm-spark-area" d="' + d + "L" + W + "," + H + "L0," + H + 'Z"/><path class="zm-spark-line" d="' + d + '"/>';
      }
      g.innerHTML = out;
    });
  }

  function initMap(map, show) {
    var nodes = map.querySelectorAll(".zm-node"), edges = map.querySelectorAll(".zm-edge, .zm-label");
    function focus(id) {
      map.classList.toggle("is-focus", !!id);
      nodes.forEach(function (n) {
        var nid = n.getAttribute("data-dist");
        var near = id && (nid === id || Array.prototype.some.call(edges, function (e) {
          return (e.getAttribute("data-from") === id && e.getAttribute("data-to") === nid) || (e.getAttribute("data-to") === id && e.getAttribute("data-from") === nid);
        }));
        n.classList.toggle("is-near", !!near);
      });
      edges.forEach(function (e) {
        e.classList.toggle("is-near", !!id && (e.getAttribute("data-from") === id || e.getAttribute("data-to") === id || e.getAttribute("data-rel") === id));
      });
    }
    nodes.forEach(function (n) {
      n.addEventListener("pointerenter", function () { focus(n.getAttribute("data-dist")); });
      n.addEventListener("focus", function () { focus(n.getAttribute("data-dist")); });
    });
    edges.forEach(function (e) {
      e.addEventListener("pointerenter", function () { focus(e.getAttribute("data-rel")); });
    });
    map.addEventListener("pointerleave", function () { focus(null); });
    map.addEventListener("focusout", function () { focus(null); });
    void show;
  }

  function init() {
    var zoo = document.getElementById("zoo");
    if (!zoo) return;
    document.documentElement.classList.add("zoo-js");
    var cards = Array.prototype.slice.call(zoo.querySelectorAll(".zc"));
    var order = cards.map(function (c) { return c.id; });
    var bar = zoo.querySelector(".zs-bar"), select = bar.querySelector('[data-slot="select"]'), count = bar.querySelector('[data-slot="count"]');
    var map = zoo.querySelector(".zm"), stage = zoo.querySelector(".zoo-stage");
    var mounted = {}, current = null;
    bar.hidden = false;

    function mount(card) {
      if (mounted[card.id]) return;
      mounted[card.id] = true;
      if (card.hasAttribute("data-dist")) mountDist(card);
      else {
        var fn = R[card.getAttribute("data-rel")];
        if (fn) fn(card.querySelector('[data-slot="viz"]'));
      }
    }

    function show(id, scroll) {
      if (order.indexOf(id) < 0) id = order[0];
      if (id === current) return;
      var swap = function () {
        cards.forEach(function (c) { c.classList.toggle("is-active", c.id === id); });
        var card = document.getElementById(id);
        mount(card);
        current = id;
        select.value = id;
        var i = order.indexOf(id), isRel = card.hasAttribute("data-rel");
        var nd = zoo.querySelectorAll(".zc[data-dist]").length;
        count.textContent = isRel ? "Związek " + (i - nd + 1) + " z " + (order.length - nd) : "Rozkład " + (i + 1) + " z " + nd;
        stage.style.setProperty("--accent", getComputedStyle(card).getPropertyValue("--accent"));
        map.querySelectorAll(".is-current").forEach(function (n) { n.classList.remove("is-current"); });
        map.querySelectorAll('[data-dist="' + id + '"], [data-rel="' + id + '"]').forEach(function (n) { n.classList.add("is-current"); });
      };
      if (document.startViewTransition && !REDUCED && current) document.startViewTransition(swap);
      else swap();
      if (scroll) {
        var top = stage.getBoundingClientRect().top;
        if (top > window.innerHeight * 0.5 || top < -40) stage.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "start" });
      }
    }

    function go(id, scroll) {
      if (location.hash.slice(1) !== id) history.pushState(null, "", "#" + id);
      show(id, scroll);
    }

    zoo.addEventListener("click", function (ev) {
      var a = ev.target.closest('a[href^="#"]');
      if (!a) return;
      var id = decodeURIComponent(a.getAttribute("href").slice(1));
      if (order.indexOf(id) < 0) return;
      ev.preventDefault();
      go(id, true);
    });
    bar.addEventListener("click", function (ev) {
      var b = ev.target.closest("[data-step]");
      if (!b) return;
      var i = order.indexOf(current) + (+b.getAttribute("data-step"));
      go(order[(i + order.length) % order.length], false);
    });
    select.addEventListener("change", function () { go(select.value, false); });
    window.addEventListener("popstate", function () { show(decodeURIComponent(location.hash.slice(1)), true); });
    document.addEventListener("keydown", function (ev) {
      if (ev.altKey || ev.ctrlKey || ev.metaKey) return;
      var t = ev.target;
      if (t && (t.tagName === "INPUT" || t.tagName === "SELECT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (ev.key !== "ArrowLeft" && ev.key !== "ArrowRight") return;
      var i = order.indexOf(current) + (ev.key === "ArrowRight" ? 1 : -1);
      go(order[(i + order.length) % order.length], false);
    });

    sparks();
    initMap(map, show);
    var start = decodeURIComponent(location.hash.slice(1));
    show(order.indexOf(start) >= 0 ? start : order[0], false);
    if (order.indexOf(start) >= 0) requestAnimationFrame(function () { stage.scrollIntoView({ block: "start" }); });
  }

  // KaTeX ładuje się z `defer` przed tym plikiem, więc przy DOMContentLoaded już jest.
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
