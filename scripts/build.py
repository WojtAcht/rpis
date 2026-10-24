#!/usr/bin/env python3
"""Buduje stronę (GitHub Pages) i PDF-y w katalogu _site/.

Konwencja katalogów:
    rozdzialy.yml                                  rozdziały skryptu
    materialy.yml                                  materiały dodatkowe do rozdziałów
    kolokwium-N/zagadnienia.md                     zagadnienia z odnośnikami do skryptu
    kolokwium-N/RRRR/<wariant>/zadanie-K.md        treść + rozwiązanie (Markdown)
    kolokwium-N/RRRR/<wariant>/*.png               obrazki używane w zadaniach
    quizy/<nazwa>.yml                              quizy (pytania zamknięte i prawda/fałsz)
    prezentacje/NN-nazwa.html                      samodzielne slajdy

Wariant to np. `kolokwium`, `zestaw-a`, `termin-2`. Format pliku zadania opisuje tasks.py, a quizu quizzes.py.
"""

import re
import shutil
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor
from datetime import date
from pathlib import Path

import convert
import pages
import pdf
from materials import load_materials
from quizzes import collect_quizzes
from tasks import ContentError, all_tasks, all_variants, collect, load_chapters, plural

ROOT = Path(__file__).resolve().parent.parent
BUILD = ROOT / "build"
SITE = ROOT / "_site"


def compile_tex(job: tuple[Path, str]) -> tuple[Path, bool, str]:
    """latexmk -> _site/<dest>. Zwraca (plik, ok, log)."""
    tex, dest = job
    outdir = BUILD / "out" / Path(dest).parent
    outdir.mkdir(parents=True, exist_ok=True)
    proc = subprocess.run(
        ["latexmk", "-pdf", "-interaction=nonstopmode", "-halt-on-error", f"-outdir={outdir}", tex.name],
        cwd=tex.parent, capture_output=True, text=True, errors="replace",
    )
    built = outdir / (tex.stem + ".pdf")
    if proc.returncode != 0 or not built.exists():
        return tex, False, proc.stdout[-3000:]
    (SITE / dest).parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(built, SITE / dest)
    return tex, True, ""


def collect_slides():
    decks = []
    for f in sorted((ROOT / "prezentacje").glob("*.html")):
        src = f.read_text(encoding="utf-8")
        h1 = re.search(r"<h1[^>]*>(.*?)</h1>", src, re.S)
        decks.append({
            "file": f,
            "num": f.name.split("-", 1)[0],
            "title": re.sub(r"<[^>]+>", "", h1.group(1)).strip() if h1 else f.stem,
            "slides": len(re.findall(r'class="slide"', src)),
        })
    return decks


def nearest_exam(today: date) -> int:
    """Kolokwium pokazywane na górze strony głównej: I od września do 19 grudnia, potem II.

    Strona jest statyczna, więc przełącza się przy buildzie; pages.yml przebudowuje ją 20.12 i 1.09.
    """
    return 2 if (today.month, today.day) >= (12, 20) or today.month < 9 else 1


def write_page(rel: str, content: str) -> None:
    """rel to ścieżka katalogu strony względem _site ("" = strona główna)."""
    depth = len([p for p in rel.split("/") if p])
    path = SITE / rel / "index.html"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content.replace("{{ROOT}}", "../" * depth or "./"), encoding="utf-8")


def main() -> int:
    try:
        script_url, chapters = load_chapters(ROOT / "rozdzialy.yml")
        exams = collect(ROOT, chapters)
        mats = load_materials(ROOT / "materialy.yml", chapters)
        quizzes = collect_quizzes(ROOT, chapters)
        if bad := [z.slug for z in quizzes if z.exam and z.exam not in {x.num for x in exams}]:
            raise ContentError(f"quizy: nieznany numer kolokwium w {bad}")
    except ContentError as err:
        print(f"Błędy w plikach zadań, materiałów i quizów:\n{err}", file=sys.stderr)
        return 1

    if SITE.exists():
        shutil.rmtree(SITE)
    SITE.mkdir()
    BUILD.mkdir(exist_ok=True)

    tasks = all_tasks(exams)
    convert.convert_all(tasks)
    convert.convert_quizzes(quizzes)
    for x in exams:
        if x.topics:
            x.topics_html = convert.to_html(x.topics, x.id)

    # PDF-y zestawów składane z plików zadań.
    jobs = []
    for v in all_variants(exams):
        jobs += pdf.write_variant_sources(v, BUILD / "tex")
    failed = []
    with ThreadPoolExecutor() as pool:
        for tex, ok, log in pool.map(compile_tex, jobs):
            name = tex.relative_to(ROOT)
            if ok:
                print(f"  ok    {name}")
            else:
                print(f"  BŁĄD  {name}\n{log}", file=sys.stderr)
                failed.append(name)

    # Strony.
    decks = collect_slides()
    write_page("", pages.index_page(exams, decks, quizzes, nearest_exam(date.today())))
    write_page("zadania", pages.browse_page(exams, script_url, chapters, mats))
    write_page("materialy", pages.materials_page(mats, chapters))
    write_page("quizy", pages.quizzes_page(quizzes, exams))
    for z in quizzes:
        write_page(z.path, pages.quiz_page(z))
    for x in exams:
        if x.topics:
            write_page(f"{x.id}/zagadnienia", pages.topics_page(x, script_url))
        for _, variants in x.years:
            for v in variants:
                write_page(v.path, pages.variant_page(v, variants))
                for t in v.tasks:
                    write_page(t.path, pages.task_page(t, v, t.source.relative_to(ROOT).as_posix()))
                for asset in v.assets:
                    (SITE / v.path).mkdir(parents=True, exist_ok=True)
                    shutil.copy2(asset, SITE / v.path / asset.name)

    shutil.copytree(ROOT / "site" / "assets", SITE / "assets")
    if decks:
        (SITE / "prezentacje").mkdir()
        for d in decks:
            shutil.copy2(d["file"], SITE / "prezentacje" / d["file"].name)
    (SITE / ".nojekyll").touch()

    if failed:
        print(f"\nNie skompilowano {len(failed)} plików.", file=sys.stderr)
        return 1
    print(f"\nGotowe: {plural(len(tasks), 'zadanie', 'zadania', 'zadań')}, {len(jobs)} PDF-ów → {SITE.relative_to(ROOT)}/")
    return 0


if __name__ == "__main__":
    sys.exit(main())
