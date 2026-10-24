"""Markdown zadań -> fragmenty HTML (wzory renderuje KaTeX w przeglądarce) i LaTeX (do PDF-ów)."""

import re
import subprocess
from concurrent.futures import ThreadPoolExecutor

from quizzes import Quiz
from tasks import Task

PANDOC_FROM = "markdown-auto_identifiers"


def pandoc(md: str, to: str, *args: str) -> str:
    proc = subprocess.run(
        ["pandoc", "-f", PANDOC_FROM, "-t", to, "--wrap=none", *args],
        input=md, capture_output=True, text=True,
    )
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr)
    return proc.stdout


def to_html(md: str, asset_prefix: str) -> str:
    out = pandoc(md, "html5", "--katex")
    # Obrazki leżą obok pliku zadania; strony są na różnych poziomach, więc
    # ścieżkę zaczynamy od {{ROOT}} (podmienianego przy zapisie strony).
    out = re.sub(r'(<img src=")(?![a-z]+:|/)', rf"\1{{{{ROOT}}}}{asset_prefix}/", out)
    return out.replace("<table>", '<div class="table-wrap"><table>').replace("</table>", "</table></div>")


def to_latex(md: str) -> str:
    out = pandoc(md, "latex", "--no-highlight")
    return re.sub(r"\\label\{[^}]*\}", "", out)


def to_inline_html(md: str) -> str:
    """Jak to_html, ale bez otaczającego <p> — do odpowiedzi w quizie."""
    out = to_html(md, "").strip()
    if out.startswith("<p>") and out.endswith("</p>") and out.count("<p>") == 1:
        out = out[3:-4]
    return out


def convert_quizzes(quizzes: list[Quiz]) -> None:
    """Wypełnia q.html: "text", "explanation" i numery odpowiedzi (0, 1, ...) dla pytań wyboru."""
    jobs = []
    for quiz in quizzes:
        for q in quiz.questions:
            jobs.append((q, "text", q.text, False))
            if q.explanation:
                jobs.append((q, "explanation", q.explanation, False))
            if not q.true_false:
                jobs += [(q, i, o, True) for i, o in enumerate(q.options)]

    def run(job):
        _, _, md, inline = job
        return to_inline_html(md) if inline else to_html(md, "")

    with ThreadPoolExecutor() as pool:
        for (q, key, _, _), html in zip(jobs, pool.map(run, jobs)):
            q.html[key] = html


def convert_all(tasks: list[Task]) -> None:
    jobs = []
    for t in tasks:
        for part in ("statement", "hint", "solution"):
            md = getattr(t, part)
            if md:
                jobs.append((t, part, md))

    def run(job):
        t, part, md = job
        return to_html(md, t.variant_path), to_latex(md)

    with ThreadPoolExecutor() as pool:
        for (t, part, _), (html, latex) in zip(jobs, pool.map(run, jobs)):
            t.html[part] = html
            t.latex[part] = latex
