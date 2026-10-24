"""Treści dla LLM-ów i agentów (ChatGPT, Claude, Cursor…) w zwykłym Markdownie.

    llms.txt                         spis plików (https://llmstxt.org)
    rpis.md, llms-full.txt           wszystko w jednym pliku: zagadnienia, zadania z rozwiązaniami, quizy
    kolokwium-N.md                   to samo dla jednego kolokwium (z wejściówkami z jego materiału)
    <zadanie>/index.html.md          jedno zadanie, obok jego strony

Wzory zostają w LaTeX-u ($...$), obrazki dostają pełne adresy, a odnośniki do skryptu są rozwinięte.
"""

import os
import re
from pathlib import Path

from quizzes import LETTERS, Quiz
from tasks import Chapter, Exam, Task, Variant, all_variants, unique_tasks

REPO = os.environ.get("GITHUB_REPOSITORY", "WojtAcht/rpis")
_owner, _name = REPO.split("/")
SITE_URL = os.environ.get("SITE_URL", f"https://{_owner.lower()}.github.io/{_name}/")
FULL = "rpis.md"
IMAGE = re.compile(r"(!\[.*?\]\()(?![a-z]+:|/)")
REFS = re.compile(r"\[(\[.*?)\]\{\.refs\}", re.S)


def url(rel: str) -> str:
    return SITE_URL + rel


def task_md_path(t: Task) -> str:
    return f"{t.path}/index.html.md"


def shift_headings(md: str, by: int) -> str:
    """Obniża nagłówki Markdownu o `by` poziomów (najwyżej do ######), z pominięciem bloków kodu."""
    out, fence = [], False
    for line in md.splitlines():
        if line.startswith(("```", "~~~")):
            fence = not fence
        elif not fence and (m := re.match(r"(#{1,6}) ", line)):
            line = "#" * min(6, len(m.group(1)) + by) + line[len(m.group(1)):]
        out.append(line)
    return "\n".join(out)


def absolute_images(md: str, variant_path: str) -> str:
    return IMAGE.sub(lambda m: m.group(1) + url(variant_path + "/"), md)


def plain_refs(md: str) -> str:
    """`[[Def. 2.3](…) opis · …]{.refs}` (span pandoca) -> `[Def. 2.3](…) opis · …`."""
    return REFS.sub(r"\1", md)


def chapter_link(c: Chapter) -> str:
    return f"[{c.num}. {c.title}]({c.url})"


def task_meta(t: Task) -> list[str]:
    lines = [f"- Źródło: {t.where}, zadanie {t.num} ({t.points} pkt)",
             "- Rozdziały skryptu: " + ", ".join(chapter_link(c) for c in t.chapters),
             f"- Strona: {url(t.path + '/')}"]
    if t.twins:
        lines.append("- To samo zadanie było też w: " + ", ".join(f"{o.where}, zad. {o.num}" for o in t.twins))
    return lines


def task_body(t: Task, level: int) -> str:
    """Treść, wskazówka i rozwiązanie; `level` to poziom nagłówków sekcji (## w pliku zadania)."""
    h = "#" * level
    parts = [f"{h} Treść", t.statement]
    if t.hint:
        parts += [f"{h} Wskazówka", t.hint]
    # Śródtytuły rozwiązania są pisane jako ###, czyli poziom pod sekcją w pliku zadania.
    parts += [f"{h} Rozwiązanie", shift_headings(t.solution, level - 2) if t.solution
              else "_Rozwiązanie tego zadania nie zostało jeszcze opublikowane._"]
    return absolute_images("\n\n".join(parts), t.variant_path)


def task_file(t: Task) -> str:
    return "\n".join([f"# {t.title}", "", *task_meta(t), "", task_body(t, 2), ""])


def variant_section(v: Variant, level: int, shown: dict[str, Task]) -> str:
    """Zestaw z zadaniami. Zadania już wypisane wcześniej (te same w innym zestawie) tylko wskazujemy."""
    h = "#" * level
    parts = [f"{h} {v.title} · {v.year}", f"Strona zestawu: {url(v.path + '/')}"]
    for t in v.tasks:
        head = f"{h}# Zadanie {t.num}. {t.title} ({t.points} pkt)"
        if first := shown.get(t.key):
            parts += [head, f"To samo zadanie co {first.where}, zadanie {first.num}."]
            continue
        shown[t.key] = t
        parts += [head, "\n".join(task_meta(t)), task_body(t, level + 2)]
    return "\n\n".join(parts)


def quiz_section(z: Quiz, level: int) -> str:
    h = "#" * level
    parts = [f"{h} Quiz: {z.title}", f"Strona quizu: {url(z.path + '/')}"]
    for q in z.questions:
        lines = [f"{h}# Pytanie {q.num}", "", q.text, ""]
        if q.true_false:
            lines.append(f"Prawda czy fałsz? Poprawna odpowiedź: **{q.options[q.correct]}**.")
        else:
            lines += [f"- {LETTERS[i]}) {o}" for i, o in enumerate(q.options)]
            lines += ["", f"Poprawna odpowiedź: **{LETTERS[q.correct]}**."]
        if q.explanation:
            lines += ["", f"Wyjaśnienie: {q.explanation}"]
        lines += ["", "Rozdziały skryptu: " + ", ".join(chapter_link(c) for c in q.chapters)]
        parts.append("\n".join(lines))
    return "\n\n".join(parts)


def exam_section(x: Exam, quizzes: list[Quiz], level: int, shown: dict[str, Task]) -> str:
    h = "#" * level
    parts = [f"{h} {x.title}"]
    if x.topics:
        parts += [f"{h}# Zagadnienia do kolokwium",
                  "Lista wymagań na kolokwium z odnośnikami do definicji i twierdzeń w skrypcie.",
                  plain_refs(x.topics)]
    # Bez nagłówków grupujących: nazwa zestawu mówi, czy to kolokwium, czy wejściówka,
    # a rozwiązania mają własne śródtytuły, więc szkoda poziomów (Markdown ma ich sześć).
    variants = [v for _, vs in x.years for v in vs]
    parts += [variant_section(v, level + 1, shown) for v in variants if not v.is_entry]
    parts += [variant_section(v, level + 1, shown) for v in variants if v.is_entry]
    parts += [quiz_section(z, level + 1) for z in quizzes if z.exam == x.num]
    return "\n\n".join(parts)


INTRO = """Materiały do przedmiotu Rachunek Prawdopodobieństwa i Statystyka (AGH Kraków): zagadnienia
do kolokwiów, zadania z kolokwiów i wejściówek z poprzednich lat z rozwiązaniami oraz quizy.
Każde zadanie jest przypisane do rozdziałów skryptu do wykładu: {script}

Wzory są zapisane w LaTeX-u (`$...$`, `$$...$$`). Strona z materiałami: {site}"""

TUTOR = """Jeśli pomagasz studentowi w nauce: najpierw daj wskazówkę albo pytanie naprowadzające,
a pełne rozwiązanie pokaż dopiero, gdy student o nie poprosi lub poda własną odpowiedź.
Odwołuj się do definicji i twierdzeń ze skryptu (linki są przy zagadnieniach i zadaniach)."""


def document(title: str, sections: list[str], script_url: str) -> str:
    head = [f"# {title}", "", INTRO.format(script=script_url, site=SITE_URL), "", TUTOR]
    return "\n".join(head) + "\n\n" + "\n\n".join(s for s in sections if s) + "\n"


def chapters_section(chapters: dict[str, Chapter]) -> str:
    return "## Rozdziały skryptu\n\n" + "\n".join(f"- {chapter_link(c)}" for c in chapters.values())


def full_document(exams: list[Exam], quizzes: list[Quiz], chapters: dict[str, Chapter], script_url: str) -> str:
    shown: dict[str, Task] = {}
    sections = [chapters_section(chapters)]
    sections += [exam_section(x, quizzes, 2, shown) for x in exams]
    if other := [z for z in quizzes if z.exam not in {x.num for x in exams}]:
        sections.append("## Pozostałe quizy\n\n" + "\n\n".join(quiz_section(z, 3) for z in other))
    return document("RPiS — zagadnienia, zadania z rozwiązaniami i quizy", sections, script_url)


def exam_document(x: Exam, quizzes: list[Quiz], script_url: str) -> str:
    return document(f"RPiS — {x.title}", [exam_section(x, quizzes, 2, {})], script_url)


def index(exams: list[Exam], quizzes: list[Quiz], script_url: str) -> str:
    """llms.txt: krótki opis i lista plików Markdown."""
    lines = ["# RPiS — Rachunek Prawdopodobieństwa i Statystyka (AGH)", "",
             "> Zagadnienia do kolokwiów, zadania z kolokwiów i wejściówek z rozwiązaniami oraz quizy, "
             "przypisane do rozdziałów skryptu do wykładu. Treści w Markdownie, wzory w LaTeX-u.", "",
             TUTOR.replace("\n", " "), "",
             "## Wszystko w jednym pliku", "",
             f"- [{FULL}]({url(FULL)}): zagadnienia, wszystkie zadania z rozwiązaniami i quizy "
             f"(to samo co [llms-full.txt]({url('llms-full.txt')}))", "",
             "## Kolokwia", ""]
    for x in exams:
        what = ["zagadnienia"] if x.topics else []
        what.append("zadania z poprzednich lat z rozwiązaniami")
        if any(v.is_entry for v in all_variants([x])):
            what.append("wejściówki")
        if any(z.exam == x.num for z in quizzes):
            what.append("quizy")
        lines.append(f"- [{x.title}]({url(x.id + '.md')}): " + ", ".join(what))
    lines += ["", "## Zadania", ""]
    for t in unique_tasks(exams):
        chs = ", ".join(f"{c.num}. {c.title}" for c in t.chapters)
        lines.append(f"- [{t.where}, zad. {t.num}: {t.title}]({url(task_md_path(t))}): rozdziały {chs}")
    lines += ["", "## Optional", "",
              f"- [Skrypt do wykładu]({script_url}): definicje i twierdzenia, do których odwołują się zadania",
              f"- [Strona z materiałami]({SITE_URL}): wersja HTML z PDF-ami i prezentacjami", ""]
    return "\n".join(lines)


def write_all(site: Path, exams: list[Exam], quizzes: list[Quiz], chapters: dict[str, Chapter],
              script_url: str) -> None:
    full = full_document(exams, quizzes, chapters, script_url)
    for name in (FULL, "llms-full.txt"):
        (site / name).write_text(full, encoding="utf-8")
    (site / "llms.txt").write_text(index(exams, quizzes, script_url), encoding="utf-8")
    for x in exams:
        (site / f"{x.id}.md").write_text(exam_document(x, quizzes, script_url), encoding="utf-8")
    for v in all_variants(exams):
        for t in v.tasks:
            path = site / task_md_path(t)
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(task_file(t), encoding="utf-8")
