"""Strony HTML: główna, bank zadań (filtrowanie po rozdziałach), zestaw i pojedyncze zadanie.

Linki wewnętrzne zaczynają się od {{ROOT}}; przy zapisie strony build.py podmienia
to na względną ścieżkę do katalogu głównego, więc strona działa i lokalnie, i pod /rpis/.
"""

import html
import json
import os
from urllib.parse import quote, urlencode

from pdf import pdf_href
from tasks import Chapter, Exam, Task, Variant, all_variants, fold, plural, unique_tasks

e = html.escape
REPO = os.environ.get("GITHUB_REPOSITORY", "WojtAcht/rpis")
KATEX = "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist"
R = "{{ROOT}}"


def layout(title: str, body: str, *, description: str, current: str = "") -> str:
    def link(href, label, key=""):
        cur = ' aria-current="page"' if key and key == current else ""
        return f'<a href="{R}{href}"{cur}>{label}</a>'

    nav = (link("zadania/", "Zadania", "zadania") + link("#kolokwium-1", "Kolokwium I")
           + link("#kolokwium-2", "Kolokwium II") + link("#prezentacje", "Prezentacje"))
    return f"""<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(title)}</title>
<meta name="description" content="{e(description)}">
<meta name="color-scheme" content="light dark">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Work+Sans:wght@400;500;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{KATEX}/katex.min.css" crossorigin="anonymous">
<script defer src="{KATEX}/katex.min.js" crossorigin="anonymous"></script>
<script>try{{var t=localStorage.getItem("motyw");if(t)document.documentElement.dataset.theme=t}}catch(e){{}}</script>
<link rel="stylesheet" href="{R}assets/style.css">
<script defer src="{R}assets/site.js"></script>
</head>
<body>
<a class="skip" href="#tresc">Przejdź do treści</a>
<header class="topbar"><div class="wrap">
  <a class="brand" href="{R}">RPiS</a>
  <nav aria-label="Główna">{nav}</nav>
  <button class="theme-toggle" type="button" id="theme-toggle" aria-label="Przełącz tryb jasny i ciemny"><span aria-hidden="true"></span></button>
</div></header>
<main id="tresc">
{body}
</main>
<footer>
  <div class="wrap">
    <span>W. Achtelik · AGH Kraków</span>
    <span>Błąd w zadaniu? <a href="https://github.com/{REPO}/issues">Zgłoś w Issues</a></span>
  </div>
</footer>
</body>
</html>
"""


# --- kawałki wspólne -------------------------------------------------------

def chapter_chip(c: Chapter) -> str:
    return (f'<a class="chip" href="{R}zadania/?rozdzial={quote(c.id)}" '
            f'title="Wszystkie zadania z rozdziału {c.num}">'
            f'<span class="chip-nr">{c.num}</span>{e(c.title)}</a>')


def chips(t: Task) -> str:
    return f'<div class="chips">{"".join(chapter_chip(c) for c in t.chapters)}</div>'


def reveal(kind: str, summary: str, inner: str) -> str:
    return (f'<details class="reveal {kind}"><summary>{summary}</summary>'
            f'<div class="reveal-body prose">{inner}</div></details>')


def solution_blocks(t: Task) -> str:
    out = reveal("hint", "Wskazówka", t.html["hint"]) if "hint" in t.html else ""
    if "solution" in t.html:
        out += reveal("solution", "Pokaż rozwiązanie", t.html["solution"])
    else:
        out += '<p class="no-solution">Rozwiązanie tego zadania nie zostało jeszcze opublikowane.</p>'
    return out


def twins_note(t: Task) -> str:
    if not t.twins:
        return ""
    links = ", ".join(f'<a href="{R}{o.path}/">{e(o.where)}, zad. {o.num}</a>' for o in t.twins)
    return f'<p class="twins">To samo zadanie było też w: {links}.</p>'


def crumbs(*items: tuple[str, str | None]) -> str:
    parts = [f'<a href="{R}{href}">{e(label)}</a>' if href is not None else
             f'<span aria-current="page">{e(label)}</span>' for label, href in items]
    return f'<nav class="crumbs" aria-label="Ścieżka">{"<span class=sep>/</span>".join(parts)}</nav>'


# --- strona główna ---------------------------------------------------------

def index_page(exams: list[Exam], decks: list[dict]) -> str:
    tasks = unique_tasks(exams)
    sections = [zadania_teaser(tasks), slides_section(decks)]
    for x in exams:
        parts = [f'<section id="{x.id}"><p class="kicker">Ćwiczenia</p><h2>{e(x.title)}</h2>']
        if x.topics:
            parts.append(
                f'<a class="topics" href="{R}{x.id}/zagadnienia/">'
                '<span class="topics-kicker">Zacznij tutaj</span>'
                '<span class="topics-title">Zagadnienia do kolokwium</span>'
                '<span class="topics-arrow" aria-hidden="true">→</span></a>')
        for year, variants in x.years:
            parts.append(f'<h3><span class="year">{year}</span></h3><ul class="variants">')
            for v in variants:
                titles = "".join(f'<li><a href="{R}{t.path}/">{e(t.title)}</a></li>' for t in v.tasks)
                if v.has_solutions:
                    sol = (f'<a class="btn btn-secondary" href="{R}{pdf_href(v, True)}" target="_blank" '
                           'rel="noopener">PDF z rozwiązaniami</a>')
                else:
                    sol = '<span class="no-solution">Bez rozwiązań</span>'
                parts.append(
                    f'<li class="variant"><div class="variant-head"><a class="name" href="{R}{v.path}/">{e(v.label)}</a>'
                    f'<span class="meta">{plural(len(v.tasks), "zadanie", "zadania", "zadań")} · {v.points} pkt</span></div>'
                    f'<ol class="variant-tasks">{titles}</ol>'
                    f'<div class="actions"><a class="btn" href="{R}{v.path}/">Otwórz zestaw</a>'
                    f'<a class="btn btn-secondary" href="{R}{pdf_href(v)}" target="_blank" rel="noopener">PDF</a>{sol}</div></li>')
            parts.append("</ul>")
        parts.append("</section>")
        sections.append("".join(parts))

    body = f"""<header class="hero wrap">
  <p class="kicker">RPiS · AGH Kraków</p>
  <h1>Rachunek Prawdo&shy;podobieństwa i&nbsp;<mark>Statystyka</mark></h1>
  <p class="lead">Prezentacje z zajęć, zadania z kolokwiów z poprzednich lat z rozwiązaniami, przypisane do rozdziałów skryptu.</p>
  <div class="steps">
    <div class="step"><span class="n">krok 1</span><p>Przejrzyj zagadnienia do kolokwium.</p></div>
    <div class="step"><span class="n">krok 2</span><p>Rozwiąż zadania samodzielnie, najlepiej z limitem czasu.</p></div>
    <div class="step"><span class="n">krok 3</span><p>Dopiero potem odsłoń rozwiązanie i porównaj ze swoim.</p></div>
  </div>
</header>
<div class="wrap">
{"".join(sections)}
</div>"""
    return layout("RPiS — materiały", body,
                  description="Prezentacje z zajęć oraz zadania z kolokwiów z Rachunku Prawdopodobieństwa "
                              "i Statystyki z poprzednich lat, z rozwiązaniami, przypisane do rozdziałów skryptu.")


def zadania_teaser(tasks: list[Task]) -> str:
    return f"""<section id="zadania"><p class="kicker">Bank zadań</p><h2>Zadania</h2>
<a class="btn btn-big" href="{R}zadania/">Wszystkie zadania ({len(tasks)}) →</a>
</section>"""


def slides_section(decks: list[dict]) -> str:
    if not decks:
        return ""
    items = "".join(
        f'<li><a class="deck" href="{R}prezentacje/{e(d["file"].name)}" target="_blank" rel="noopener">'
        f'<span class="tag">{e(d["num"])}</span>'
        f'<span class="deck-title">{e(d["title"])}</span>'
        f'<span class="meta">{d["slides"]} slajdów · otwórz ↗</span></a></li>'
        for d in decks
    )
    return (
        '<section id="prezentacje"><p class="kicker">Zajęcia</p><h2>Prezentacje</h2>'
        '<p class="hint">Strzałki ← → przełączają slajdy.</p>'
        f'<ul class="decks">{items}</ul></section>'
    )


# --- zagadnienia -----------------------------------------------------------

def topics_page(x: Exam, script_url: str) -> str:
    body = f"""<div class="wrap reader">
{crumbs(("RPiS", ""), (x.title, f"#{x.id}"), ("Zagadnienia", None))}
<p class="kicker">{e(x.title)}</p>
<h1 class="task-title">Zagadnienia do kolokwium</h1>
<p class="callout">Przy każdym zagadnieniu są numery definicji, twierdzeń i podrozdziałów
<a href="{script_url}" target="_blank" rel="noopener">skryptu do wykładu ↗</a>, w których je omówiono.</p>
<article class="prose topics-list">{x.topics_html}</article>
</div>"""
    return layout(f"Zagadnienia · {x.title} · RPiS", body,
                  description=f"Zagadnienia do kolokwium z RPiS ({x.title}) z odnośnikami do skryptu.")


# --- strona zadania --------------------------------------------------------

def task_page(t: Task, v: Variant, source: str) -> str:
    i = v.tasks.index(t)
    prev_t = v.tasks[i - 1] if i > 0 else None
    next_t = v.tasks[i + 1] if i + 1 < len(v.tasks) else None
    prev_link = (f'<a class="prev" href="../{prev_t.num}/"><span>← Zadanie {prev_t.num}</span>{e(prev_t.title)}</a>'
                 if prev_t else "<span></span>")
    next_link = (f'<a class="next" href="../{next_t.num}/"><span>Zadanie {next_t.num} →</span>{e(next_t.title)}</a>'
                 if next_t else "<span></span>")

    issue = urlencode({
        "title": f"Błąd: {v.title} ({v.year}), zadanie {t.num}",
        "body": f"Zadanie: {t.title}\nPlik: `{source}`\n\nCo jest nie tak?\n",
    })
    script = "".join(
        f'<li><a href="{c.url}" target="_blank" rel="noopener">{c.num}. {e(c.title)} ↗</a></li>' for c in t.chapters)

    body = f"""<div class="wrap reader">
{crumbs(("RPiS", ""), (f"{v.title} · {v.year}", v.path + "/"), (f"Zadanie {t.num}", None))}
<p class="kicker">{e(t.where)} · Zadanie {t.num} · {t.points} pkt</p>
<h1 class="task-title">{e(t.title)}</h1>
{chips(t)}
<article class="prose statement">{t.html["statement"]}</article>
{solution_blocks(t)}
{twins_note(t)}
<nav class="pager" aria-label="Zadania w zestawie">{prev_link}<a class="up" href="../">Cały zestaw</a>{next_link}</nav>
<aside class="task-meta">
  <div><h2>Rozdziały w skrypcie</h2><ul>{script}</ul></div>
  <div><h2>Znalazłeś błąd?</h2><ul>
    <li><a href="https://github.com/{REPO}/issues/new?{issue}" target="_blank" rel="noopener">Zgłoś go w Issues ↗</a></li>
    <li><a href="https://github.com/{REPO}/edit/main/{source}" target="_blank" rel="noopener">Popraw plik na GitHubie ↗</a></li>
  </ul></div>
</aside>
</div>"""
    return layout(f"{t.title} · {v.title} {v.year} · RPiS", body,
                  description=f"{v.title} ({v.year}), zadanie {t.num}: {t.title}. Treść i rozwiązanie.")


# --- strona zestawu --------------------------------------------------------

def variant_page(v: Variant, siblings: list[Variant]) -> str:
    sections = "".join(f"""<section class="task" id="zadanie-{t.num}">
  <header class="task-head">
    <p class="kicker">Zadanie {t.num} · {t.points} pkt</p>
    <h2><a href="{t.num}/">{e(t.title)}</a></h2>
    {chips(t)}
  </header>
  <div class="prose statement">{t.html["statement"]}</div>
  {solution_blocks(t)}
</section>""" for t in v.tasks)

    pdfs = f'<a class="btn" href="{R}{pdf_href(v)}" target="_blank" rel="noopener">Zadania (PDF)</a>'
    if v.has_solutions:
        pdfs += (f'<a class="btn btn-secondary" href="{R}{pdf_href(v, True)}" target="_blank" '
                 'rel="noopener">Z rozwiązaniami (PDF)</a>')
    others = [s for s in siblings if s is not v]
    other_links = ""
    if others:
        other_links = ('<p class="siblings">Inne zestawy z tego roku: ' + ", ".join(
            f'<a href="{R}{s.path}/">{e(s.label)}</a>' for s in others) + "</p>")
    toc = "".join(f'<li><a href="#zadanie-{t.num}">{e(t.title)}</a><span class="meta">{t.points} pkt</span></li>'
                  for t in v.tasks)

    body = f"""<div class="wrap reader">
{crumbs(("RPiS", ""), (f"{v.title} · {v.year}", None))}
<p class="kicker">{e(v.title.split(" – ")[0])} · {v.year}</p>
<h1 class="task-title">{e(v.label)}</h1>
<p class="meta">{plural(len(v.tasks), "zadanie", "zadania", "zadań")} · {v.points} pkt</p>
<div class="actions">{pdfs}</div>
<p class="callout">Najpierw rozwiąż cały zestaw samodzielnie, najlepiej z limitem czasu jak na kolokwium. Rozwiązania odsłaniaj dopiero, kiedy masz własną odpowiedź.</p>
<ol class="toc">{toc}</ol>
{other_links}
{sections}
</div>"""
    return layout(f"{v.title} ({v.year}) · RPiS", body,
                  description=f"{v.title} z {v.year} r.: treści zadań i rozwiązania.")


# --- bank zadań ------------------------------------------------------------

def browse_card(t: Task) -> str:
    also = ""
    if t.twins:
        also = " · też " + ", ".join(f'<a href="{R}{o.path}/">{e(o.where)}</a>' for o in t.twins)
    if "solution" in t.html:
        sol = reveal("solution", "Pokaż rozwiązanie", t.html["solution"])
    else:
        sol = '<p class="no-solution">Bez opublikowanego rozwiązania</p>'
    return f"""<article class="task-card" data-chapters="{e(" ".join(c.id for c in t.chapters))}" data-exam="{t.exam_id}" data-variant="{t.variant_path}" data-search="{e(fold(t.title + " " + t.statement))}">
  <header>
    <p class="kicker"><a href="{R}{t.variant_path}/">{e(t.where)}</a> · zad. {t.num} · {t.points} pkt{also}</p>
    <h3><a href="{R}{t.path}/">{e(t.title)}</a></h3>
    {chips(t)}
  </header>
  <div class="prose statement">{t.html["statement"]}</div>
  {sol}
</article>"""


def group_html(c: Chapter, inner: str) -> str:
    return (f'<section class="group" data-group="{e(c.id)}"><header class="group-head">'
            f'<h2><span class="group-nr">Rozdział {c.num}</span> {e(c.title)}</h2>'
            f'<a href="{c.url}" target="_blank" rel="noopener">skrypt ↗</a></header>{inner}</section>')


def browse_page(exams: list[Exam], script_url: str, chapters: dict[str, Chapter]) -> str:
    tasks = unique_tasks(exams)
    counts = {cid: sum(any(c.id == cid for c in t.chapters) for t in tasks) for cid in chapters}
    years = sorted({t.year for t in tasks})
    n_tasks = plural(len(tasks), "zadanie", "zadania", "zadań")

    parts: dict[str, list[Chapter]] = {}
    for c in chapters.values():
        parts.setdefault(c.part, []).append(c)
    aside = [f'<button type="button" class="ch-item" data-chapter="" aria-pressed="true">'
             f'<span class="ch-title">Wszystkie rozdziały</span><span class="count" data-count="">{len(tasks)}</span></button>']
    options = [f'<option value="">Wszystkie rozdziały</option>']
    for part, chs in parts.items():
        aside.append(f'<p class="part">{e(part)}</p><ul>')
        options.append(f'<optgroup label="{e(part)}">')
        for c in chs:
            n = counts[c.id]
            off = "" if n else " disabled"
            aside.append(
                f'<li><button type="button" class="ch-item" data-chapter="{e(c.id)}" aria-pressed="false"{off}>'
                f'<span class="ch-nr">{c.num}</span><span class="ch-title">{e(c.title)}</span>'
                f'<span class="count" data-count="{e(c.id)}">{n}</span></button></li>')
            options.append(f'<option value="{e(c.id)}"{off}>{c.num}. {e(c.title)}</option>')
        aside.append("</ul>")
        options.append("</optgroup>")

    # Bez JS widać grupy po rozdziale głównym (pierwszym z listy), w kolejności skryptu.
    groups = "".join(
        group_html(c, "".join(browse_card(t) for t in tasks if t.chapters[0].id == c.id))
        for c in chapters.values() if any(t.chapters[0].id == c.id for t in tasks))

    data = {
        "chapters": {c.id: {"nr": c.num, "title": c.title, "url": c.url} for c in chapters.values()},
        "variants": {v.path: {"title": v.title, "year": v.year} for v in all_variants(exams)},
    }
    exam_buttons = "".join(f'<button type="button" data-exam="{x.id}" aria-pressed="false">{e(x.title)}</button>'
                           for x in exams)

    body = f"""<div class="wrap browse">
<header class="page-head">
  {crumbs(("RPiS", ""), ("Zadania", None))}
  <h1><mark>Zadania</mark> z kolokwiów</h1>
  <p class="lead">{n_tasks} z lat {years[0]}–{years[-1]}, każde przypisane do rozdziałów
  <a href="{script_url}" target="_blank" rel="noopener">skryptu do wykładu ↗</a>.
  Wybierz rozdział, który właśnie przerabiasz, albo przejrzyj wszystkie naraz.</p>
</header>
<div class="browse-grid">
  <aside class="chapters" aria-label="Rozdziały skryptu">
    <p class="aside-head">Rozdziały skryptu</p>
    {"".join(aside)}
  </aside>
  <section class="results" aria-label="Zadania">
    <div class="toolbar">
      <label class="field search"><span class="sr-only">Szukaj w zadaniach</span>
        <input type="search" id="q" placeholder="Szukaj: Bayes, gęstość, estymator…" autocomplete="off"></label>
      <label class="field chapter-select"><span class="sr-only">Rozdział</span>
        <select id="chapter-select">{"".join(options)}</select></label>
      <div class="seg" role="group" aria-label="Kolokwium">
        <button type="button" data-exam="" aria-pressed="true">Wszystkie</button>{exam_buttons}
      </div>
      <div class="seg" role="group" aria-label="Grupowanie">
        <span class="seg-label">Grupuj</span>
        <button type="button" data-group="rozdzial" aria-pressed="true">rozdział</button><button type="button" data-group="kolokwium" aria-pressed="false">kolokwium</button>
      </div>
    </div>
    <div class="chapter-banner" id="chapter-banner" hidden></div>
    <p class="result-count" id="result-count" aria-live="polite">{n_tasks}</p>
    <div id="groups">{groups}</div>
    <div class="empty" id="empty" hidden><p>Żadne zadanie nie pasuje do wybranych filtrów.</p><button type="button" class="btn btn-secondary" id="reset">Wyczyść filtry</button></div>
  </section>
</div>
<script type="application/json" id="browse-data">{json.dumps(data, ensure_ascii=False)}</script>
</div>"""
    return layout("Zadania · RPiS", body, current="zadania",
                  description="Wszystkie zadania z kolokwiów z RPiS z rozwiązaniami, przypisane do rozdziałów skryptu.")
