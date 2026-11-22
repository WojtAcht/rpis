"""ZOO rozkładów (strona zoo/): mapa rozkładów i związków między nimi, a pod nią scena z jednym
rozkładem albo związkiem naraz. Treść jest w zoo.yml, a wykresy i wizualizacje rysuje
site/assets/zoo.js (ten sam `id` w obu miejscach).

Bez JavaScriptu strona pokazuje wszystkie karty po kolei, z wzorami i opisami.
"""

import html
import json
import math
import re
from dataclasses import dataclass, field
from pathlib import Path

import yaml

e = html.escape
SCRIPT = "https://home.agh.edu.pl/~smolka/rpis-skrypt/"
MAP_W, MAP_H = 1200, 560
NODE_H = 64
ZONE_X = 712  # granica między dyskretnymi a ciągłymi na mapie


@dataclass
class Dist:
    id: str
    name: str
    short: str
    symbol: str
    notation: str
    kind: str
    section: str
    anchor: str
    pos: tuple[float, float]
    story: str
    recognize: list[str]
    formulas: list[tuple[str, str]]
    notes: list[str]
    params: list[dict]

    @property
    def width(self) -> int:
        """Szerokość węzła na mapie: miejsce na miniaturkę + nazwę (pogrubioną) albo zapis."""
        return round(max(170, 72 + 16 + max(10.4 * len(self.short), 8.2 * len(self.symbol))))

    @property
    def discrete(self) -> bool:
        return self.kind == "dyskretny"


@dataclass
class Relation:
    id: str
    title: str
    edges: list[tuple[str, str, str]]
    lead: str
    points: list[str]
    refs: list[tuple[str, str]]
    bend: dict = field(default_factory=dict)
    label_at: dict = field(default_factory=dict)


@dataclass
class Zoo:
    chapter: str
    dists: list[Dist]
    relations: list[Relation]

    def dist(self, id: str) -> Dist:
        return next(d for d in self.dists if d.id == id)


class ZooError(Exception):
    pass


def load_zoo(path: Path) -> Zoo:
    data = yaml.safe_load(path.read_text(encoding="utf-8"))
    dists = [Dist(id=d["id"], name=d["nazwa"], short=d["krotko"], symbol=d["symbol"], notation=d["zapis"],
                  kind=d["typ"], section=str(d["sekcja"]), anchor=d["kotwica"], pos=tuple(d["mapa"]),
                  story=d["historia"], recognize=d.get("rozpoznasz", []),
                  formulas=[tuple(f) for f in d["wzory"]], notes=d.get("uwagi", []), params=d["parametry"])
             for d in data["rozklady"]]
    ids = {d.id for d in dists}
    relations = []
    for r in data["zwiazki"]:
        rel = Relation(id=r["id"], title=r["tytul"], edges=[tuple(k) for k in r["krawedzie"]], lead=r["wstep"],
                       points=r.get("tresc", []), refs=[tuple(s) for s in r.get("skrypt", [])],
                       bend=r.get("luk", {}), label_at=r.get("etykieta", {}))
        for a, b, _ in rel.edges:
            if a not in ids or b not in ids:
                raise ZooError(f"zoo.yml: związek {rel.id} łączy nieznane rozkłady {a} → {b}")
        relations.append(rel)
    all_ids = [d.id for d in dists] + [r.id for r in relations]
    if len(set(all_ids)) != len(all_ids):
        raise ZooError("zoo.yml: identyfikatory rozkładów i związków muszą być różne")
    return Zoo(chapter=data["rozdzial"], dists=dists, relations=relations)


# --- tekst z $wzorami$ ------------------------------------------------------

MATH = re.compile(r"\$(.+?)\$", re.S)


def inline(text: str) -> str:
    """$TeX$ -> <span class="math inline"> (renderuje site.js), **x** -> <strong>; reszta jest escapowana."""
    out, last = [], 0
    for m in MATH.finditer(text):
        out.append(_plain(text[last:m.start()]))
        out.append(f'<span class="math inline">{e(m.group(1))}</span>')
        last = m.end()
    out.append(_plain(text[last:]))
    return "".join(out)


def _plain(s: str) -> str:
    return re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", e(s))


def tex_span(tex: str, display: bool = False) -> str:
    return f'<span class="math {"display" if display else "inline"}">{e(tex)}</span>'


def script_href(chapter: str, ref: str) -> str:
    """Kotwica w rozdziale 8 albo pełne 'rozdział#kotwica'."""
    if "/" in ref:
        page, _, anchor = ref.partition("#")
        return f"{SCRIPT}{page}.html" + (f"#{anchor}" if anchor else "")
    return f"{SCRIPT}{chapter}.html#{ref}"


# --- mapa -------------------------------------------------------------------

def _edge_geometry(a: tuple[float, float], b: tuple[float, float], wa: float, wb: float, bend: float,
                   at: float = 0.5):
    """Krawędź od brzegu węzła do brzegu węzła; łuk kwadratowy, gdy bend ≠ 0."""
    (x1, y1), (x2, y2) = a, b
    dx, dy = x2 - x1, y2 - y1
    length = math.hypot(dx, dy)
    nx, ny = -dy / length, dx / length
    cx, cy = (x1 + x2) / 2 + nx * bend, (y1 + y2) / 2 + ny * bend

    def trim(px, py, tx, ty, w, pad):
        ux, uy = tx - px, ty - py
        t = min((w / 2 + pad) / abs(ux) if ux else math.inf, (NODE_H / 2 + pad) / abs(uy) if uy else math.inf)
        return px + ux * t, py + uy * t

    sx, sy = trim(x1, y1, cx, cy, wa, 6)
    ex, ey = trim(x2, y2, cx, cy, wb, 12)
    # Punkt na łuku dla etykiety (domyślnie środek).
    u = 1 - at
    mx, my = u * u * sx + 2 * u * at * cx + at * at * ex, u * u * sy + 2 * u * at * cy + at * at * ey
    return f"M{sx:.1f},{sy:.1f} Q{cx:.1f},{cy:.1f} {ex:.1f},{ey:.1f}", (mx, my)


def map_svg(zoo: Zoo) -> str:
    parts = [f'<svg class="zm" viewBox="0 0 {MAP_W} {MAP_H}" role="img" '
             'aria-labelledby="zm-title" preserveAspectRatio="xMidYMid meet">',
             '<title id="zm-title">Mapa rozkładów i związków między nimi</title>',
             '<defs><marker id="zm-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" '
             'orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="zm-arrowhead"/></marker>'
             '<pattern id="zm-dots" width="24" height="24" patternUnits="userSpaceOnUse">'
             '<circle cx="2" cy="2" r="1.2" class="zm-dot"/></pattern></defs>',
             f'<rect class="zm-bg" x="0" y="0" width="{MAP_W}" height="{MAP_H}" fill="url(#zm-dots)"/>',
             f'<line class="zm-fence" x1="{ZONE_X}" y1="16" x2="{ZONE_X}" y2="{MAP_H - 16}"/>',
             '<text class="zm-zone" x="24" y="34">ROZKŁADY DYSKRETNE</text>',
             f'<text class="zm-zone" x="{ZONE_X + 24}" y="34">ROZKŁADY CIĄGŁE</text>']
    pos = {d.id: d.pos for d in zoo.dists}
    width = {d.id: d.width for d in zoo.dists}
    edges, labels = [], []
    for r in zoo.relations:
        for a, b, label in r.edges:
            d, (mx, my) = _edge_geometry(pos[a], pos[b], width[a], width[b], r.bend.get(f"{a}>{b}", 0),
                                         r.label_at.get(f"{a}>{b}", 0.5))
            edges.append(f'<a class="zm-edge" href="#{r.id}" data-rel="{r.id}" data-from="{a}" data-to="{b}">'
                         f'<title>{e(r.title)}</title><path class="zm-hit" d="{d}"/>'
                         f'<path class="zm-line" d="{d}" marker-end="url(#zm-arrow)"/></a>')
            w = 8.2 * len(label) + 18
            labels.append(f'<a class="zm-label" href="#{r.id}" data-rel="{r.id}" data-from="{a}" data-to="{b}" '
                          f'tabindex="-1" aria-hidden="true">'
                          f'<g transform="translate({mx:.1f},{my:.1f})"><rect x="{-w / 2:.1f}" y="-12" width="{w:.1f}" '
                          f'height="24" rx="12"/><text y="4.5" text-anchor="middle">{e(label)}</text></g></a>')
    parts += edges + labels
    for d in zoo.dists:
        x, y = d.pos
        w = d.width
        parts.append(
            f'<a class="zm-node" href="#{d.id}" data-dist="{d.id}" style="--accent: var(--z-{d.id})">'
            f'<title>{e(d.name)}</title>'
            f'<g transform="translate({x - w / 2:.0f},{y - NODE_H / 2:.0f})">'
            f'<rect class="zm-shadow" x="5" y="5" width="{w}" height="{NODE_H}" rx="10"/>'
            f'<rect class="zm-box" width="{w}" height="{NODE_H}" rx="10"/>'
            f'<rect class="zm-chip" x="8" y="8" width="56" height="48" rx="6"/>'
            f'<g class="zm-spark" data-spark="{d.id}" transform="translate(12,14)"></g>'
            f'<text class="zm-name" x="74" y="29">{e(d.short)}</text>'
            f'<text class="zm-symbol" x="74" y="48">{e(d.symbol)}</text></g></a>')
    parts.append("</svg>")
    return "".join(parts)


# --- karty ------------------------------------------------------------------

def _refs_links(zoo: Zoo, refs: list[tuple[str, str]]) -> str:
    return " · ".join(f'<a href="{script_href(zoo.chapter, ref)}">{e(label)}</a>' for label, ref in refs)


def _dist_chip(d: Dist) -> str:
    return (f'<a class="zchip" href="#{d.id}" style="--accent: var(--z-{d.id})">'
            f'<i aria-hidden="true"></i>{e(d.short)}</a>')


def dist_card(zoo: Zoo, d: Dist) -> str:
    kind = "dyskretny" if d.discrete else "ciągły"
    rels = [r for r in zoo.relations if any(d.id in (a, b) for a, b, _ in r.edges)]
    rel_links = "".join(f'<li><a href="#{r.id}"><span aria-hidden="true">↗</span> {e(r.title)}</a></li>' for r in rels)
    formulas = "".join(f'<div class="zf"><dt>{e(label)}</dt><dd>{inline(tex)}</dd></div>' for label, tex in d.formulas)
    notes = "".join(f"<p>{inline(n)}</p>" for n in d.notes)
    recognize = "".join(f"<li>{inline(r)}</li>" for r in d.recognize)
    params = json.dumps([{"key": p["klucz"], "tex": p["tex"], "min": p["min"], "max": p["max"],
                          "step": p["krok"], "value": p["start"]} for p in d.params], ensure_ascii=False)
    pdf = "p(k)" if d.discrete else "f(x)"
    return f'''<article class="zc" id="{d.id}" data-dist="{d.id}" data-kind="{"d" if d.discrete else "c"}" style="--accent: var(--z-{d.id})" data-params="{e(params)}" aria-labelledby="{d.id}-h">
<header class="zc-head">
  <p class="zc-kicker"><span>{e(d.section)}</span><span>rozkład {kind}</span></p>
  <h2 id="{d.id}-h">{e(d.name)}</h2>
  <p class="zc-notation">{tex_span("X\\sim " + d.notation if not d.notation.startswith("X") else d.notation)}</p>
</header>
<div class="zc-body">
  <div class="zc-side">
    <p class="zc-story">{inline(d.story)}</p>
    <div class="zc-controls" data-slot="controls"></div>
    <dl class="zc-live" data-slot="live"></dl>
  </div>
  <figure class="zc-figure">
    <div class="zc-tabs" data-slot="tabs" role="group" aria-label="Wykres"></div>
    <div class="zc-plot" data-slot="plot" aria-label="Wykres: {e(pdf)} i dystrybuanta"></div>
    <figcaption class="zc-readout" data-slot="readout">Przeciągnij po wykresie, żeby policzyć prawdopodobieństwo przedziału.</figcaption>
  </figure>
</div>
<div class="zc-more">
  <section class="zc-recognize"><h3>Rozpoznasz go po</h3><ul>{recognize}</ul></section>
  <section class="zc-formulas"><h3>Wzory</h3><dl>{formulas}</dl></section>
  {f'<section class="zc-notes"><h3>Warto wiedzieć</h3>{notes}</section>' if notes else ""}
  <section class="zc-relations"><h3>Związki w zoo</h3><ul>{rel_links}</ul>
    <p class="zc-src">Skrypt: <a href="{SCRIPT}{zoo.chapter}.html#{d.anchor}">{e(d.section)} {e(d.name)}</a></p></section>
</div>
</article>'''


def relation_card(zoo: Zoo, r: Relation) -> str:
    ends = []
    for a, b, _ in r.edges:
        ends += [x for x in (a, b) if x not in ends]
    chips = "".join(_dist_chip(zoo.dist(x)) for x in ends)
    a0 = r.edges[0][0]
    b0 = r.edges[0][1]
    points = "".join(f"<li>{inline(p)}</li>" for p in r.points)
    return f'''<article class="zc zr" id="{r.id}" data-rel="{r.id}" style="--accent: var(--z-{b0}); --accent-2: var(--z-{a0})" aria-labelledby="{r.id}-h">
<header class="zc-head">
  <p class="zc-kicker"><span>Związek</span><span class="zr-ends">{chips}</span></p>
  <h2 id="{r.id}-h">{e(r.title)}</h2>
  <p class="zr-lead">{inline(r.lead)}</p>
</header>
<div class="zr-viz" data-slot="viz"></div>
<div class="zr-text">
  <ul class="zr-points">{points}</ul>
  {f'<p class="zc-src">Skrypt: {_refs_links(zoo, r.refs)}</p>' if r.refs else ""}
</div>
</article>'''


def summary_table(zoo: Zoo) -> str:
    def pick(d: Dist, *labels: str) -> str:
        for label, tex in d.formulas:
            if label in labels:
                return inline(tex)
        return "—"

    rows = "".join(
        f'<tr><th scope="row"><a href="#{d.id}" style="--accent: var(--z-{d.id})"><i aria-hidden="true"></i>{e(d.name)}</a></th>'
        f'<td>{tex_span(d.notation)}</td><td>{pick(d, "Funkcja prawdopodobieństwa", "Gęstość")}</td>'
        f'<td>{pick(d, "Wartość oczekiwana")}</td><td>{pick(d, "Wariancja")}</td>'
        f'<td>{pick(d, "Funkcja tworząca momenty")}</td></tr>'
        for d in zoo.dists)
    return ('<div class="zt-scroll"><table class="zt"><thead><tr><th scope="col">Rozkład</th><th scope="col">Zapis</th>'
            '<th scope="col">p(k) / f(x)</th><th scope="col">E(X)</th><th scope="col">Var(X)</th>'
            f'<th scope="col">MGF</th></tr></thead><tbody>{rows}</tbody></table></div>')


def stage_options(zoo: Zoo) -> str:
    groups = [("Rozkłady dyskretne", [d for d in zoo.dists if d.discrete]),
              ("Rozkłady ciągłe", [d for d in zoo.dists if not d.discrete])]
    out = "".join(f'<optgroup label="{label}">' + "".join(f'<option value="{d.id}">{e(d.name)}</option>' for d in ds)
                  + "</optgroup>" for label, ds in groups)
    out += ('<optgroup label="Związki">' + "".join(f'<option value="{r.id}">{e(r.title)}</option>'
                                                   for r in zoo.relations) + "</optgroup>")
    return out


def body(zoo: Zoo) -> str:
    n_d, n_r = len(zoo.dists), len(zoo.relations)
    cards = "".join(dist_card(zoo, d) for d in zoo.dists) + "".join(relation_card(zoo, r) for r in zoo.relations)
    return f'''<div class="zoo" id="zoo">
<header class="zoo-hero wrap">
  <p class="kicker">RPiS · Rozdział 8 skryptu · interaktywnie</p>
  <h1>ZOO <mark>rozkładów</mark></h1>
  <p class="lead">{n_d} rozkładów, które spotkasz na kolokwiach i w statystyce. Każdy ma swoją historyjkę, wykres, którym możesz pokręcić, i związki z resztą zoo — bo te rozkłady to jedna rodzina, a nie dwanaście osobnych wzorów.</p>
  <ol class="zoo-how">
    <li><b>Wybierz</b> rozkład albo strzałkę na mapie.</li>
    <li><b>Kręć</b> parametrami i patrz, jak zmienia się kształt, {tex_span("E(X)")} i {tex_span("Var(X)")}.</li>
    <li><b>Przeciągnij</b> po wykresie — policzymy {tex_span("P(a<X\\le b)")}.</li>
  </ol>
</header>
<section class="zoo-map-wrap wrap" aria-label="Mapa zoo">
  <div class="zoo-map">{map_svg(zoo)}</div>
  <p class="zoo-map-hint">{n_d} rozkładów · {n_r} związków · strzałka prowadzi od rozkładu, z którego powstaje następny</p>
</section>
<section class="zoo-stage wrap" id="scena" aria-label="Wybrany rozkład">
  <nav class="zs-bar" aria-label="Kolejny rozkład" hidden>
    <button type="button" class="zs-prev" data-step="-1" aria-label="Poprzedni"><span aria-hidden="true">←</span></button>
    <label class="zs-pick"><span class="zs-count" data-slot="count"></span><select data-slot="select" aria-label="Wybierz rozkład lub związek">{stage_options(zoo)}</select></label>
    <button type="button" class="zs-next" data-step="1" aria-label="Następny"><span aria-hidden="true">→</span></button>
  </nav>
  <div class="zs-cards">{cards}</div>
</section>
<section class="zoo-table wrap" id="tabela" aria-labelledby="tabela-h">
  <h2 id="tabela-h">Całe zoo w jednej tabeli</h2>
  <p class="zoo-table-lead">Do powtórki przed kolokwium. Kliknij nazwę, żeby wrócić do wykresu.</p>
  {summary_table(zoo)}
  <p class="zoo-credits">Źródła: <a href="{SCRIPT}{zoo.chapter}.html">rozdział 8 skryptu</a> (parametryzacje i oznaczenia),
  sposób opowiadania o rozkładach przez historyjki — <a href="https://www.alextsun.com/files/Prob_Stat_for_CS_Book.pdf">Alex Tsun, <i>Probability &amp; Statistics with Applications to Computing</i></a>, rozdz. 3.4–3.6 i 4.2–4.3.</p>
</section>
</div>'''
