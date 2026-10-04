#!/usr/bin/env python3
"""Kompiluje wszystkie pliki .tex i generuje stronę (GitHub Pages) w katalogu _site/.

Konwencja katalogów:
    kolokwium-N/zagadnienia.tex
    kolokwium-N/RRRR/<wariant>.tex
    kolokwium-N/RRRR/<wariant>-rozwiazanie.tex   (opcjonalnie)

Wariant to np. `kolokwium`, `zestaw-a`, `termin-2`.

Prezentacje (samodzielne pliki HTML) leżą w prezentacje/NN-nazwa.html.
"""

import html
import re
import shutil
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BUILD = ROOT / "build"
SITE = ROOT / "_site"

ROMAN = {1: "I", 2: "II", 3: "III"}
SOLUTION_SUFFIX = "-rozwiazanie"


def variant_label(name: str) -> str:
    if name == "kolokwium":
        return "Kolokwium"
    if m := re.fullmatch(r"grupa-(\w+)", name):
        return f"Grupa {m.group(1)}"
    if m := re.fullmatch(r"zestaw-(\w+)", name):
        return f"Zestaw {m.group(1).upper()}"
    if m := re.fullmatch(r"termin-(\d+)", name):
        return f"{m.group(1)}. termin"
    return name.replace("-", " ").capitalize()


def task_summary(tex: Path) -> str:
    """Np. '5 zadań · 100 pkt' na podstawie nagłówków \\section*{Zadanie N (P pkt)}."""
    points = []
    for line in tex.read_text(encoding="utf-8").splitlines():
        line = line.split("%", 1)[0] if not line.lstrip().startswith("%") else ""
        if m := re.search(r"\\section\*?\{Zadanie\s+\d+\s*\((\d+)\s*pkt", line):
            points.append(int(m.group(1)))
    if not points:
        return ""
    n = len(points)
    word = "zadanie" if n == 1 else "zadania" if 2 <= n % 10 <= 4 and not 12 <= n % 100 <= 14 else "zadań"
    return f"{n} {word} · {sum(points)} pkt"


def compile_tex(tex: Path) -> tuple[Path, Path | None, str]:
    rel = tex.relative_to(ROOT)
    outdir = BUILD / rel.parent
    outdir.mkdir(parents=True, exist_ok=True)
    proc = subprocess.run(
        ["latexmk", "-pdf", "-interaction=nonstopmode", "-halt-on-error",
         f"-outdir={outdir}", tex.name],
        cwd=tex.parent, capture_output=True, text=True,
    )
    pdf = outdir / (tex.stem + ".pdf")
    if proc.returncode != 0 or not pdf.exists():
        return tex, None, proc.stdout[-3000:]
    dest = SITE / "pdf" / rel.with_suffix(".pdf")
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(pdf, dest)
    return tex, dest, ""


def collect():
    exams = []
    for kdir in sorted(ROOT.glob("kolokwium-*")):
        if not kdir.is_dir():
            continue
        num = int(kdir.name.split("-")[1])
        topics = kdir / "zagadnienia.tex"
        years = []
        for ydir in sorted((d for d in kdir.iterdir() if d.is_dir() and d.name.isdigit()), reverse=True):
            variants = []
            for tex in sorted(ydir.glob("*.tex"), key=lambda t: (t.stem.startswith("termin-"), t.stem)):
                if tex.stem.endswith(SOLUTION_SUFFIX):
                    continue
                sol = tex.with_name(tex.stem + SOLUTION_SUFFIX + ".tex")
                variants.append({
                    "label": variant_label(tex.stem),
                    "tex": tex,
                    "solution": sol if sol.exists() else None,
                    "summary": task_summary(tex),
                })
            years.append({"year": ydir.name, "variants": variants})
        exams.append({
            "num": num,
            "id": kdir.name,
            "title": f"Kolokwium {ROMAN.get(num, num)}",
            "topics": topics if topics.exists() else None,
            "years": years,
        })
    return exams


def collect_slides():
    decks = []
    for f in sorted((ROOT / "prezentacje").glob("*.html")):
        src = f.read_text(encoding="utf-8")
        title = re.search(r"<title>(.*?)</title>", src, re.S)
        h1 = re.search(r"<h1[^>]*>(.*?)</h1>", src, re.S)
        decks.append({
            "file": f,
            "num": f.name.split("-", 1)[0],
            "title": re.sub(r"<[^>]+>", "", h1.group(1)).strip() if h1 else f.stem,
            "doc_title": title.group(1).strip() if title else f.stem,
            "slides": len(re.findall(r'class="slide"', src)),
        })
    return decks


def pdf_href(tex: Path) -> str:
    return "pdf/" + tex.relative_to(ROOT).with_suffix(".pdf").as_posix()


def render_slides(decks) -> str:
    e = html.escape
    if not decks:
        return ""
    items = "".join(
        f'<li><a class="deck" href="prezentacje/{e(d["file"].name)}" target="_blank" rel="noopener">'
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


def render(exams, decks) -> str:
    e = html.escape
    nav = ('<a href="#prezentacje">Prezentacje</a>' if decks else "") + "".join(
        f'<a href="#{x["id"]}">{e(x["title"])}</a>' for x in exams)
    sections = [render_slides(decks)]
    for x in exams:
        parts = [f'<section id="{x["id"]}"><p class="kicker">Ćwiczenia</p><h2>{e(x["title"])}</h2>']
        if x["topics"]:
            parts.append(
                f'<a class="topics" href="{pdf_href(x["topics"])}" target="_blank" rel="noopener">'
                f'<span class="topics-kicker">Zacznij tutaj</span>'
                f'<span class="topics-title">Zagadnienia do kolokwium</span>'
                f'<span class="topics-arrow" aria-hidden="true">PDF ↗</span></a>'
            )
        for y in x["years"]:
            parts.append(f'<h3><span class="year">{e(y["year"])}</span></h3><ul class="variants">')
            for v in y["variants"]:
                summary = f'<span class="meta">{e(v["summary"])}</span>' if v["summary"] else ""
                if v["solution"]:
                    sol = (
                        '<details class="solution"><summary>Pokaż rozwiązanie</summary>'
                        '<div class="solution-body"><p>Najpierw spróbuj rozwiązać zadania samodzielnie. '
                        'Rozwiązanie najwięcej daje, kiedy porównujesz je z własną próbą.</p>'
                        f'<a class="btn btn-secondary" href="{pdf_href(v["solution"])}" target="_blank" rel="noopener">'
                        'Otwórz rozwiązanie (PDF)</a></div></details>'
                    )
                else:
                    sol = '<span class="no-solution">Brak opublikowanego rozwiązania</span>'
                parts.append(
                    f'<li class="variant"><div class="variant-head"><span class="name">{e(v["label"])}</span>{summary}</div>'
                    f'<a class="btn" href="{pdf_href(v["tex"])}" target="_blank" rel="noopener">Zadania (PDF)</a>'
                    f'{sol}</li>'
                )
            parts.append("</ul>")
        parts.append("</section>")
        sections.append("".join(parts))

    template = (ROOT / "scripts" / "template.html").read_text(encoding="utf-8")
    return template.replace("{{NAV}}", nav).replace("{{SECTIONS}}", "\n".join(sections))


def main() -> int:
    if SITE.exists():
        shutil.rmtree(SITE)
    SITE.mkdir()
    exams = collect()
    decks = collect_slides()
    if decks:
        (SITE / "prezentacje").mkdir()
        for d in decks:
            shutil.copy2(d["file"], SITE / "prezentacje" / d["file"].name)

    texs = [x["topics"] for x in exams if x["topics"]]
    for x in exams:
        for y in x["years"]:
            for v in y["variants"]:
                texs.append(v["tex"])
                if v["solution"]:
                    texs.append(v["solution"])

    failed = []
    with ThreadPoolExecutor() as pool:
        for tex, pdf, log in pool.map(compile_tex, texs):
            rel = tex.relative_to(ROOT)
            if pdf:
                print(f"  ok    {rel}")
            else:
                print(f"  BŁĄD  {rel}\n{log}", file=sys.stderr)
                failed.append(rel)

    (SITE / "index.html").write_text(render(exams, decks), encoding="utf-8")
    (SITE / ".nojekyll").touch()

    if failed:
        print(f"\nNie skompilowano {len(failed)} plików.", file=sys.stderr)
        return 1
    print(f"\nGotowe: {len(texs)} PDF-ów, {len(decks)} prezentacje, strona w {SITE.relative_to(ROOT)}/index.html")
    return 0


if __name__ == "__main__":
    sys.exit(main())
