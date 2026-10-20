"""Markdown zadań -> fragmenty HTML (wzory renderuje KaTeX w przeglądarce) i LaTeX (do PDF-ów)."""

import re
import subprocess
from concurrent.futures import ThreadPoolExecutor

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
