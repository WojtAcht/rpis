"""Składanie dokumentów LaTeX zestawów (zadania / zadania z rozwiązaniami) z plików zadań."""

from pathlib import Path

from tasks import Variant

ROOT = Path(__file__).resolve().parent.parent
TEMPLATE = ROOT / "site" / "zestaw.tex"


def task_heading(t) -> str:
    return f"\\section*{{Zadanie {t.num} ({t.points} pkt)}}\n"


def variant_tex(v: Variant, with_solutions: bool) -> str:
    body = []
    for t in v.tasks:
        body.append(task_heading(t) + t.latex["statement"])
        if with_solutions:
            if "hint" in t.latex:
                body.append("\\subsection*{Wskazówka}\n" + t.latex["hint"])
            body.append("\\subsection*{Rozwiązanie}\n" + t.latex.get(
                "solution", "\\emph{Rozwiązanie tego zadania nie zostało jeszcze opublikowane.}\n"))
        body.append("\\medskip\n")
    title = v.title + (" — rozwiązania" if with_solutions else "")
    return (TEMPLATE.read_text(encoding="utf-8")
            .replace("<<TITLE>>", title)
            .replace("<<DATE>>", v.year)
            .replace("<<GRAPHICSPATH>>", "{" + v.dir.as_posix() + "/}")
            .replace("<<BODY>>", "\n".join(body)))


def write_variant_sources(v: Variant, build: Path) -> list[tuple[Path, str]]:
    """Zapisuje .tex zestawu do build/ i zwraca [(plik .tex, ścieżka PDF-a na stronie)]."""
    outdir = build / v.exam_id / v.year
    outdir.mkdir(parents=True, exist_ok=True)
    docs = [(v.slug, False)]
    if v.has_solutions:
        docs.append((v.slug + "-rozwiazanie", True))
    out = []
    for name, sol in docs:
        tex = outdir / f"{name}.tex"
        tex.write_text(variant_tex(v, sol), encoding="utf-8")
        out.append((tex, f"pdf/{v.exam_id}/{v.year}/{name}.pdf"))
    return out


def pdf_href(v: Variant, solutions: bool = False) -> str:
    return f"pdf/{v.exam_id}/{v.year}/{v.slug}{'-rozwiazanie' if solutions else ''}.pdf"
