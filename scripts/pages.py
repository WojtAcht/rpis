"""Strony HTML: główna, bank zadań (filtrowanie po rozdziałach), zestaw, pojedyncze zadanie, materiały i quizy.

Linki wewnętrzne zaczynają się od {{ROOT}}; przy zapisie strony build.py podmienia
to na względną ścieżkę do katalogu głównego, więc strona działa i lokalnie, i pod /rpis/.
"""

import html
import json
import os
from urllib.parse import quote, urlencode

from materials import TYPES, Material, Materials, anchor
from pdf import pdf_href
from quizzes import LETTERS, Question, Quiz
from tasks import ENTRY_CATEGORY, Chapter, Exam, Task, Variant, all_variants, fold, plural, unique_tasks

e = html.escape
REPO = os.environ.get("GITHUB_REPOSITORY", "WojtAcht/rpis")
KATEX = "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist"
R = "{{ROOT}}"


def layout(title: str, body: str, *, description: str, current: str = "") -> str:
    def link(href, label, key=""):
        cur = ' aria-current="page"' if key and key == current else ""
        return f'<a href="{R}{href}"{cur}>{label}</a>'

    # Główne pozycje są zawsze widoczne, reszta w menu „Więcej” (<details>, działa bez JS).
    # Kotwice strony głównej są opisane wprost, żeby nie przenosiły tam niespodziewanie.
    more = "".join(
        f'<p class="nav-group">{title}</p>' + link(f"kolokwium-{n}/zagadnienia/", "Zagadnienia")
        + link(f"#kolokwium-{n}", "Zestawy z poprzednich lat")
        for n, title in ((1, "Kolokwium I"), (2, "Kolokwium II")))
    more += '<p class="nav-group">Zajęcia</p>' + link("#wejsciowki", "Wejściówki") + link("#prezentacje", "Prezentacje")
    # Na telefonie przełącznik motywu jest w menu, żeby pasek zmieścił się w jednym rzędzie.
    more += ('<button class="theme-toggle theme-item" type="button"><span aria-hidden="true"></span>'
             '<span class="theme-label">Tryb ciemny</span></button>')
    nav = (link("zadania/", "Zadania", "zadania") + link("quizy/", "Quizy", "quizy")
           + link("materialy/", "Materiały", "materialy")
           + f'<details class="nav-more"><summary><span class="more-label">Więcej</span></summary><div class="nav-menu">{more}</div></details>')
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
  <button class="theme-toggle theme-icon" type="button" aria-label="Przełącz tryb jasny i ciemny"><span aria-hidden="true"></span></button>
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
    # Na telefonie widać sam numer; pełna nazwa jest w podpowiedzi i dla czytników ekranu.
    return (f'<a class="chip" href="{R}zadania/?rozdzial={quote(c.id)}" '
            f'title="Rozdział {c.num}: {e(c.title)}. Wszystkie zadania z tego rozdziału">'
            f'<span class="chip-nr">{c.num}</span><span class="chip-title">{e(c.title)}</span></a>')


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

def index_page(exams: list[Exam], decks: list[dict], quizzes: list[Quiz], next_exam: int) -> str:
    tasks = unique_tasks(exams)
    nearest = next((x for x in exams if x.num == next_exam), exams[0])
    sections = [exam_section(nearest, quizzes, nearest=True)]
    sections += [exam_section(x, quizzes) for x in exams if x is not nearest]
    sections.append(entries_section(exams))
    sections += [materials_teaser(), quizzes_section(quizzes), slides_section(decks)]

    body = f"""<header class="hero wrap">
  <h1>Rachunek Prawdo&shy;podobieństwa i&nbsp;<mark>Statystyka</mark></h1>
  <p class="lead">Zadania z kolokwiów z rozwiązaniami, quizy i prezentacje z zajęć na AGH.</p>
</header>
<div class="wrap">
{quick_tiles(nearest, tasks, quizzes)}
{"".join(sections)}
</div>"""
    return layout("RPiS — materiały", body,
                  description="Prezentacje z zajęć oraz zadania z kolokwiów z Rachunku Prawdopodobieństwa "
                              "i Statystyki z poprzednich lat, z rozwiązaniami, przypisane do rozdziałów skryptu.")


def tile(href: str, kicker: str, title: str, meta: str, extra: str = "") -> str:
    return (f'<li class="tile"><a class="tile-link" href="{href}"><span class="tile-kicker">{kicker}</span>'
            f'<span class="tile-title">{title}</span><span class="meta">{meta}</span>'
            f'<span class="tile-arrow" aria-hidden="true">→</span></a>{extra}</li>')


def quick_tiles(nearest: Exam, tasks: list[Task], quizzes: list[Quiz]) -> str:
    """Główne wejścia zaraz pod tytułem: zagadnienia, bank zadań, quizy, PDF-y najbliższego kolokwium."""
    counts: dict[str, int] = {}
    chapters: dict[str, Chapter] = {}
    for t in tasks:
        for c in t.chapters:
            counts[c.id] = counts.get(c.id, 0) + 1
            chapters[c.id] = c
    top = sorted(counts, key=lambda cid: -counts[cid])[:3]  # sorted jest stabilne: remisy w kolejności zadań
    top_links = "".join(
        f'<li><a href="{R}zadania/?rozdzial={quote(cid)}" title="Rozdział {chapters[cid].num}: {e(chapters[cid].title)}">'
        f'<span class="chip-nr">{chapters[cid].num}</span><span class="top-title">{e(chapters[cid].title)}</span>'
        f'<span class="meta">{counts[cid]}</span></a></li>' for cid in top)
    year, variants = exam_years(nearest)[0]  # lata są od najnowszego

    tiles = []
    if nearest.topics:
        tiles.append(tile(f"{R}{nearest.id}/zagadnienia/", e(nearest.title), "Zagadnienia",
                          "z odnośnikami do skryptu"))
    tiles.append(tile(f"{R}zadania/", "Bank zadań", "Zadania",
                      plural(len(tasks), "zadanie", "zadania", "zadań") + " z rozwiązaniami",
                      f'<ul class="tile-extra" aria-label="Rozdziały z największą liczbą zadań">{top_links}</ul>'))
    if quizzes:
        tiles.append(tile(f"{R}quizy/", "Sprawdź się", "Quizy",
                          plural(len(quizzes), "quiz", "quizy", "quizów") + " z wyjaśnieniami"))
    tiles.append(tile(f"#{nearest.id}-{year}", e(nearest.title), "PDF-y zestawów",
                      f"{year} · {plural(len(variants), 'zestaw', 'zestawy', 'zestawów')}"))
    return f'<nav aria-label="Na skróty"><ul class="tiles">{"".join(tiles)}</ul></nav>'


def exam_section(x: Exam, quizzes: list[Quiz], nearest: bool = False) -> str:
    kicker, cls = ("Najbliższe kolokwium", ' class="next-exam"') if nearest else ("Ćwiczenia", "")
    parts = [f'<section id="{x.id}"{cls}><p class="kicker">{kicker}</p><h2>{e(x.title)}</h2>']
    if x.topics:
        parts.append(
            f'<a class="topics" href="{R}{x.id}/zagadnienia/">'
            '<span class="topics-kicker">Zacznij tutaj</span>'
            '<span class="topics-title">Zagadnienia do kolokwium</span>'
            '<span class="topics-arrow" aria-hidden="true">→</span></a>')
    if nearest and (own := [z for z in quizzes if z.exam == x.num]):
        parts.append('<ul class="exam-quizzes">' + "".join(
            f'<li><a class="topics" href="{R}{z.path}/"><span class="topics-kicker">Quiz</span>'
            f'<span class="topics-title">{e(z.title)}</span>'
            f'<span class="meta">{plural(len(z.questions), "pytanie", "pytania", "pytań")}</span>'
            '<span class="topics-arrow" aria-hidden="true">→</span></a></li>' for z in own) + "</ul>")
    for year, variants in exam_years(x):
        parts.append(f'<h3 id="{x.id}-{year}"><span class="year">{year}</span></h3>')
        parts.append(variant_list(variants, lambda v: v.label))
    parts.append("</section>")
    return "".join(parts)


def exam_years(x: Exam) -> list[tuple[str, list[Variant]]]:
    """Lata z zestawami kolokwium — bez wejściówek, które mają własną sekcję."""
    years = [(y, [v for v in vs if not v.is_entry]) for y, vs in x.years]
    return [(y, vs) for y, vs in years if vs]


def variant_list(variants: list[Variant], name) -> str:
    """Lista zestawów; `name(v)` to nazwa zestawu na liście."""
    parts = ['<ul class="variants">']
    for v in variants:
        titles = "".join(f'<li><a href="{R}{t.path}/">{e(t.title)}</a></li>' for t in v.tasks)
        if v.has_solutions:
            sol = (f'<a class="btn btn-secondary" href="{R}{pdf_href(v, True)}" target="_blank" '
                   'rel="noopener">PDF z rozwiązaniami</a>')
        else:
            sol = '<span class="no-solution">Bez rozwiązań</span>'
        parts.append(
            f'<li class="variant"><div class="variant-head"><a class="name" href="{R}{v.path}/">{e(name(v))}</a>'
            f'<span class="meta">{plural(len(v.tasks), "zadanie", "zadania", "zadań")} · {v.points} pkt</span></div>'
            f'<ol class="variant-tasks">{titles}</ol>'
            f'<div class="actions"><a class="btn" href="{R}{v.path}/">Otwórz zestaw</a>'
            f'<a class="btn btn-secondary" href="{R}{pdf_href(v)}" target="_blank" rel="noopener">PDF</a>{sol}</div></li>')
    parts.append("</ul>")
    return "".join(parts)


def entries_section(exams: list[Exam]) -> str:
    years: dict[str, list[Variant]] = {}
    for v in all_variants(exams):
        if v.is_entry:
            years.setdefault(v.year, []).append(v)
    if not years:
        return ""
    parts = ['<section id="wejsciowki"><p class="kicker">Ćwiczenia</p><h2>Wejściówki</h2>']
    for year, variants in sorted(years.items(), reverse=True):
        parts.append(f'<h3 id="wejsciowki-{year}"><span class="year">{year}</span></h3>')
        parts.append(variant_list(variants, lambda v: v.title))
    parts.append("</section>")
    return "".join(parts)


def materials_teaser() -> str:
    return f"""<section id="materialy"><p class="kicker">Do nauki</p><h2>Materiały dodatkowe</h2>
<p class="lead">Podręczniki, filmy i artykuły przypisane do rozdziałów skryptu.</p>
<a class="btn btn-big" href="{R}materialy/">Materiały do rozdziałów →</a>
</section>"""


def quizzes_section(quizzes: list[Quiz]) -> str:
    if not quizzes:
        return ""
    items = "".join(
        f'<li><a class="deck" href="{R}{z.path}/">'
        f'<span class="tag">Quiz</span>'
        f'<span class="deck-title">{e(z.title)}</span>'
        f'<span class="meta">{plural(len(z.questions), "pytanie", "pytania", "pytań")} →</span></a></li>'
        for z in quizzes
    )
    return (
        '<section id="quizy"><p class="kicker">Sprawdź się</p><h2>Quizy</h2>'
        '<p class="hint">Krótkie pytania zamknięte z wyjaśnieniami.</p>'
        f'<ul class="decks">{items}</ul></section>'
    )


def quizzes_page(quizzes: list[Quiz], exams: list[Exam]) -> str:
    titles = {x.num: x.title for x in exams}
    items = "".join(
        f'<li><a class="deck" href="{R}{z.path}/">'
        f'<span class="tag">{e("Przed " + titles[z.exam].replace("Kolokwium", "kolokwium")) if z.exam else "Quiz"}</span>'
        f'<span class="deck-title">{e(z.title)}</span>'
        f'<span class="meta">{plural(len(z.questions), "pytanie", "pytania", "pytań")} →</span></a></li>'
        for z in quizzes)
    body = f"""<div class="wrap">
{crumbs(("RPiS", ""), ("Quizy", None))}
<h1><mark>Quizy</mark></h1>
<p class="lead">Krótkie pytania zamknięte i prawda/fałsz. Po każdej odpowiedzi widać wyjaśnienie, a na końcu wynik.</p>
<ul class="decks">{items}</ul>
</div>"""
    return layout("Quizy · RPiS", body, current="quizy", description="Quizy z RPiS z odpowiedziami i wyjaśnieniami.")


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


# --- materiały dodatkowe ---------------------------------------------------

def ext_link(href: str, inner: str, title: str = "") -> str:
    tip = f' title="{e(title)}"' if title else ""
    if not href:
        return f"<span{tip}>{inner}</span>"
    return f'<a href="{e(href)}" target="_blank" rel="noopener"{tip}>{inner}</a>'


def material_item(m: Material) -> str:
    section = f'<span class="mat-sec">skrypt {e(m.section)}</span>' if m.section else ""
    note = f'<span class="mat-note">{e(m.note)}</span>' if m.note else ""
    if m.source:
        src = m.source
        label = f"<strong>{e(src.short)}</strong>" + (f" {e(m.where)}" if m.where else "")
        return (f'<li class="mat-book">{ext_link(m.link or src.link, label, f"{src.author}, {src.title}")}'
                f'{section}{note}</li>')
    return (f'<li>{ext_link(m.link, e(m.title))}<span class="mat-by">{e(m.author)} {section}</span>{note}</li>')


def materials_page(mats: Materials, chapters: dict[str, Chapter]) -> str:
    parts: dict[str, list[Chapter]] = {}
    for cid in mats.by_chapter:
        parts.setdefault(chapters[cid].part, []).append(chapters[cid])
    sections = []
    for part, chs in parts.items():
        cards = []
        for c in chs:
            rows = "".join(
                f'<div class="mat-row"><p class="mat-kind" data-kind="{kind}">{TYPES[kind]}</p>'
                f'<ul class="mat-items{" mat-books" if kind == "ksiazka" else ""}">'
                f'{"".join(material_item(m) for m in items)}</ul></div>'
                for kind, items in Material.by_kind(mats.by_chapter[c.id]))
            cards.append(
                f'<section class="mat-card" id="{anchor(c.id)}"><header class="mat-head">'
                f'<p class="kicker">Rozdział {c.num}</p><h3>{e(c.title)}</h3>'
                f'<p class="mat-links"><a href="{c.url}" target="_blank" rel="noopener">Skrypt ↗</a>'
                f'<a href="{R}zadania/?rozdzial={quote(c.id)}">Zadania →</a></p></header>'
                f'<div class="mat-content">{rows}</div></section>')
        sections.append(f'<section class="mat-part"><h2>{e(part)}</h2>{"".join(cards)}</section>')

    body = f"""<div class="wrap materials">
{crumbs(("RPiS", ""), ("Materiały", None))}
<h1><mark>Materiały</mark> dodatkowe</h1>
{"".join(sections)}
<p class="callout">Znasz coś, co warto tu dodać? Dopisz to do
<a href="https://github.com/{REPO}/edit/main/materialy.yml" target="_blank" rel="noopener">materialy.yml ↗</a>
albo <a href="https://github.com/{REPO}/issues" target="_blank" rel="noopener">zgłoś w Issues ↗</a>.</p>
</div>"""
    return layout("Materiały dodatkowe · RPiS", body, current="materialy",
                  description="Podręczniki, filmy i artykuły do nauki RPiS, przypisane do rozdziałów skryptu.")


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


# --- quiz ------------------------------------------------------------------
# Bez JS quiz to lista pytań z „Pokaż odpowiedź”. site.js zamienia ją w tryb
# „jedno pytanie naraz” z paskiem postępu i podsumowaniem.

def quiz_option(q: Question, i: int) -> str:
    correct = " data-correct" if i == q.correct else ""
    label = e(q.options[i]) if q.true_false else q.html[i]
    key = "" if q.true_false else f'<span class="opt-key">{LETTERS[i]}</span>'
    return f'<button type="button" class="option"{correct}>{key}<span class="opt-text">{label}</span></button>'


def quiz_question(q: Question, total: int) -> str:
    buttons = "".join(quiz_option(q, i) for i in range(len(q.options)))
    answer = q.options[q.correct] if q.true_false else f"{LETTERS[q.correct]})"
    inner = (f'<p class="verdict" hidden></p><p class="answer">Poprawna odpowiedź: <strong>{e(answer)}</strong></p>'
             + q.html.get("explanation", ""))
    refs = "".join(
        f'<a class="q-ref" href="{R}zadania/?rozdzial={quote(c.id)}" title="Rozdział {c.num}: {e(c.title)}">'
        f'rozdz. {c.num}</a>' for c in q.chapters)
    return f"""<li class="question" id="pytanie-{q.num}">
  <p class="q-meta"><span>Pytanie {q.num} / {total}</span>{refs}</p>
  <div class="prose q-text">{q.html["text"]}</div>
  <div class="options{" options-tf" if q.true_false else ""}" role="group" aria-label="Odpowiedzi">{buttons}</div>
  {reveal("solution feedback", "Pokaż odpowiedź", inner)}
</li>"""


def quiz_page(z: Quiz) -> str:
    n = plural(len(z.questions), "pytanie", "pytania", "pytań")
    total = len(z.questions)
    body = f"""<div class="wrap reader quiz-page">
{crumbs(("RPiS", ""), ("Quizy", "quizy/"), (z.title, None))}
<p class="kicker">Quiz · {n}</p>
<h1 class="task-title">{e(z.title)}</h1>
<section class="quiz-summary" id="quiz-summary" hidden tabindex="-1">
  <p class="kicker">Koniec quizu</p>
  <p class="summary-score"><span id="summary-good">0</span><span class="summary-total">/ {total}</span></p>
  <p class="summary-text" id="summary-text"></p>
  <div class="actions">
    <button type="button" class="btn" id="quiz-restart">Jeszcze raz</button>
    <button type="button" class="btn btn-secondary" id="quiz-review">Przejrzyj odpowiedzi</button>
  </div>
</section>
<ol class="quiz">{"".join(quiz_question(q, total) for q in z.questions)}</ol>
</div>"""
    return layout(f"{z.title} · Quiz · RPiS", body, current="quizy",
                  description=f"Quiz z RPiS: {z.title} ({n}) z odpowiedziami i wyjaśnieniami.")


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
    others = [s for s in siblings if s is not v and s.kind == v.kind]
    other_links = ""
    if others:
        other_links = ('<p class="siblings">Inne zestawy z tego roku: ' + ", ".join(
            f'<a href="{R}{s.path}/">{e(s.label)}</a>' for s in others) + "</p>")
    toc = "".join(f'<li><a href="#zadanie-{t.num}">{e(t.title)}</a><span class="meta">{t.points} pkt</span></li>'
                  for t in v.tasks)

    body = f"""<div class="wrap reader">
{crumbs(("RPiS", ""), (f"{v.title} · {v.year}", None))}
<p class="kicker">{e(v.kind)} · {v.year}</p>
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
    return f"""<article class="task-card" data-chapters="{e(" ".join(c.id for c in t.chapters))}" data-exam="{t.category}" data-variant="{t.variant_path}" data-search="{e(fold(t.title + " " + t.statement))}">
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


def browse_page(exams: list[Exam], script_url: str, chapters: dict[str, Chapter], mats: Materials) -> str:
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
        "chapters": {c.id: {"nr": c.num, "title": c.title, "url": c.url,
                            "materials": anchor(c.id) if c.id in mats.by_chapter else ""}
                     for c in chapters.values()},
        "variants": {v.path: {"title": v.title, "year": v.year} for v in all_variants(exams)},
    }
    filters = [(x.id, x.title) for x in exams]
    if any(t.category == ENTRY_CATEGORY for t in tasks):
        filters.append((ENTRY_CATEGORY, "Wejściówki"))
    exam_buttons = "".join(f'<button type="button" data-exam="{k}" aria-pressed="false">{e(label)}</button>'
                           for k, label in filters)

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
    <div class="toolbar" id="toolbar">
      <label class="field search"><span class="sr-only">Szukaj w zadaniach</span>
        <input type="search" id="q" placeholder="Szukaj: Bayes, gęstość, estymator…" autocomplete="off"></label>
      <label class="field chapter-select"><span class="sr-only">Rozdział</span>
        <select id="chapter-select">{"".join(options)}</select></label>
      <button type="button" class="filters-toggle" id="filters-toggle" aria-expanded="false" aria-controls="filters-extra" hidden>Filtry<span class="filters-badge" id="filters-badge" hidden></span></button>
      <div class="filters-extra" id="filters-extra">
        <div class="seg" role="group" aria-label="Źródło zadań">
          <button type="button" data-exam="" aria-pressed="true">Wszystkie</button>{exam_buttons}
        </div>
        <div class="seg" role="group" aria-label="Grupowanie">
          <span class="seg-label">Grupuj</span>
          <button type="button" data-group="rozdzial" aria-pressed="true">rozdział</button><button type="button" data-group="kolokwium" aria-pressed="false">kolokwium</button>
        </div>
        <div class="seg" role="group" aria-label="Widok" id="view-seg" hidden>
          <span class="seg-label">Widok</span>
          <button type="button" data-view="lista" aria-pressed="false">lista</button><button type="button" data-view="pelny" aria-pressed="true">pełny</button>
        </div>
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
