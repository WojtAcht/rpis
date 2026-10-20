"""Wczytywanie zadań, rozdziałów skryptu i struktury kolokwiów.

Zadanie to plik Markdown (pandoc) z nagłówkiem YAML:

    ---
    tytul: "Dwie monety w kapeluszu"
    punkty: 25
    rozdzialy: [calculus/bayes, calculus/conditional-independence]
    ---

    Treść zadania...

    ## Wskazówka        (opcjonalnie)
    ## Rozwiązanie      (opcjonalnie)
"""

import re
import unicodedata
from dataclasses import dataclass, field
from pathlib import Path

import yaml

ROMAN = {1: "I", 2: "II", 3: "III"}
SECTIONS = {"Wskazówka": "hint", "Rozwiązanie": "solution"}
TASK_FILE = re.compile(r"zadanie-(\d+)\.md")
SCRIPT_LINK = re.compile(r"\]\(skrypt:([^)#\s]+)(#[^)\s]*)?\)")


class ContentError(Exception):
    pass


@dataclass
class Chapter:
    id: str
    num: int
    title: str
    part: str
    url: str


@dataclass
class Task:
    source: Path
    exam_num: int
    year: str
    variant: str
    num: int
    title: str
    points: int
    chapters: list[Chapter]
    statement: str
    hint: str = ""
    solution: str = ""
    html: dict[str, str] = field(default_factory=dict)
    latex: dict[str, str] = field(default_factory=dict)
    twins: list["Task"] = field(default_factory=list)

    @property
    def exam_id(self) -> str:
        return f"kolokwium-{self.exam_num}"

    @property
    def variant_path(self) -> str:
        return f"{self.exam_id}/{self.year}/{self.variant}"

    @property
    def path(self) -> str:
        return f"{self.variant_path}/{self.num}"

    @property
    def key(self) -> str:
        """Identyczna treść = to samo zadanie (np. w zestawach A i B)."""
        return " ".join(self.statement.split())

    @property
    def where(self) -> str:
        """Np. „Kolokwium I · 2025 · Zestaw A”."""
        parts = [exam_title(self.exam_num), self.year]
        if self.variant != "kolokwium":
            parts.append(variant_label(self.variant))
        return " · ".join(parts)


@dataclass
class Variant:
    exam_num: int
    year: str
    slug: str
    dir: Path
    tasks: list[Task]

    @property
    def exam_id(self) -> str:
        return f"kolokwium-{self.exam_num}"

    @property
    def path(self) -> str:
        return f"{self.exam_id}/{self.year}/{self.slug}"

    @property
    def label(self) -> str:
        return variant_label(self.slug)

    @property
    def title(self) -> str:
        exam = exam_title(self.exam_num)
        return exam if self.slug == "kolokwium" else f"{exam} – {self.label}"

    @property
    def points(self) -> int:
        return sum(t.points for t in self.tasks)

    @property
    def has_solutions(self) -> bool:
        return any(t.solution for t in self.tasks)

    @property
    def assets(self) -> list[Path]:
        return sorted(p for p in self.dir.iterdir() if p.is_file() and p.suffix != ".md")


@dataclass
class Exam:
    num: int
    topics: str
    years: list[tuple[str, list[Variant]]]
    topics_html: str = ""

    @property
    def id(self) -> str:
        return f"kolokwium-{self.num}"

    @property
    def title(self) -> str:
        return exam_title(self.num)


def exam_title(num: int) -> str:
    return f"Kolokwium {ROMAN.get(num, num)}"


def variant_label(name: str) -> str:
    if name == "kolokwium":
        return "Kolokwium"
    if m := re.fullmatch(r"grupa-(\w+)", name):
        return f"Grupa {m.group(1).upper()}"
    if m := re.fullmatch(r"zestaw-(\w+)", name):
        return f"Zestaw {m.group(1).upper()}"
    if m := re.fullmatch(r"termin-(\d+)", name):
        return f"{m.group(1)}. termin"
    return name.replace("-", " ").capitalize()


def plural(n: int, one: str, few: str, many: str) -> str:
    if n == 1:
        return f"{n} {one}"
    if 2 <= n % 10 <= 4 and not 12 <= n % 100 <= 14:
        return f"{n} {few}"
    return f"{n} {many}"


def fold(text: str) -> str:
    """Małe litery bez polskich znaków — do wyszukiwania."""
    text = unicodedata.normalize("NFKD", text.lower().replace("ł", "l"))
    return "".join(c for c in text if not unicodedata.combining(c))


def load_chapters(path: Path) -> tuple[str, dict[str, Chapter]]:
    """-> (adres skryptu, {id: rozdział}) w kolejności skryptu."""
    data = yaml.safe_load(path.read_text(encoding="utf-8"))
    base = data["skrypt"].rstrip("/") + "/"
    chapters = {}
    for part in data["czesci"]:
        for c in part["rozdzialy"]:
            chapters[c["id"]] = Chapter(c["id"], c["nr"], c["tytul"], part["tytul"], f"{base}{c['id']}.html")
    return base, chapters


def parse_task(path: Path, chapters: dict[str, Chapter], root: Path) -> Task:
    rel = path.relative_to(root)
    text = path.read_text(encoding="utf-8")
    m = re.match(r"---\n(.*?)\n---\n(.*)", text, re.S)
    if not m:
        raise ContentError(f"{rel}: brak nagłówka YAML (--- ... ---)")
    meta, body = yaml.safe_load(m.group(1)) or {}, m.group(2)

    missing = [k for k in ("tytul", "punkty", "rozdzialy") if k not in meta]
    if missing:
        raise ContentError(f"{rel}: brak pól {', '.join(missing)} w nagłówku")
    if not isinstance(meta["punkty"], int):
        raise ContentError(f"{rel}: `punkty` musi być liczbą całkowitą")
    ids = meta["rozdzialy"] or []
    if not ids:
        raise ContentError(f"{rel}: przypisz zadanie do co najmniej jednego rozdziału (`rozdzialy`)")
    unknown = [c for c in ids if c not in chapters]
    if unknown:
        raise ContentError(f"{rel}: nieznane rozdziały {unknown} — dostępne są w rozdzialy.yml")

    sections, current, fence = {"statement": []}, "statement", False
    for line in body.splitlines():
        if line.startswith(("```", "~~~")):
            fence = not fence
        m = None if fence else re.fullmatch(r"## +(.+?) *", line)
        if m:
            if m.group(1) not in SECTIONS:
                raise ContentError(f"{rel}: nieznana sekcja „## {m.group(1)}” (dozwolone: {', '.join(SECTIONS)})")
            current = SECTIONS[m.group(1)]
            if current in sections:
                raise ContentError(f"{rel}: powtórzona sekcja „## {m.group(1)}”")
            sections[current] = []
        else:
            sections[current].append(line)
    sections = {k: "\n".join(v).strip() for k, v in sections.items()}
    if not sections["statement"]:
        raise ContentError(f"{rel}: pusta treść zadania")

    exam_dir, year_dir, variant_dir = rel.parts[:3]
    return Task(
        source=path,
        exam_num=int(exam_dir.split("-")[1]),
        year=year_dir,
        variant=variant_dir,
        num=int(TASK_FILE.fullmatch(path.name).group(1)),
        title=str(meta["tytul"]),
        points=meta["punkty"],
        chapters=[chapters[c] for c in ids],
        **sections,
    )


def load_topics(path: Path, chapters: dict[str, Chapter], root: Path) -> str:
    """Zagadnienia (Markdown). Odnośniki `[Def. 2.3](skrypt:<rozdział>#<kotwica>)`
    zamieniamy na adresy stron skryptu."""
    rel = path.relative_to(root)
    text = path.read_text(encoding="utf-8")
    unknown = sorted({m.group(1) for m in SCRIPT_LINK.finditer(text) if m.group(1) not in chapters})
    if unknown:
        raise ContentError(f"{rel}: nieznane rozdziały {unknown} — dostępne są w rozdzialy.yml")
    return SCRIPT_LINK.sub(lambda m: f"]({chapters[m.group(1)].url}{m.group(2) or ''})", text)


def collect(root: Path, chapters: dict[str, Chapter]) -> list[Exam]:
    """kolokwium-N/RRRR/<wariant>/zadanie-K.md -> lista kolokwiów."""
    exams, errors = [], []
    for kdir in sorted(root.glob("kolokwium-*")):
        if not kdir.is_dir():
            continue
        years = []
        for ydir in sorted((d for d in kdir.iterdir() if d.is_dir() and d.name.isdigit()), reverse=True):
            variants = []
            vdirs = sorted((d for d in ydir.iterdir() if d.is_dir()),
                           key=lambda d: (d.name.startswith("termin-"), d.name))
            for vdir in vdirs:
                files = sorted((f for f in vdir.glob("*.md") if TASK_FILE.fullmatch(f.name)),
                               key=lambda f: int(TASK_FILE.fullmatch(f.name).group(1)))
                tasks, broken = [], False
                for f in files:
                    try:
                        tasks.append(parse_task(f, chapters, root))
                    except ContentError as e:
                        errors.append(str(e))
                        broken = True
                nums = [t.num for t in tasks]
                if not broken and nums != list(range(1, len(nums) + 1)):
                    errors.append(f"{vdir.relative_to(root)}: zadania muszą być numerowane kolejno od 1 (jest {nums})")
                if tasks:
                    variants.append(Variant(int(kdir.name.split("-")[1]), ydir.name, vdir.name, vdir, tasks))
            if variants:
                years.append((ydir.name, variants))
        topics = ""
        if (kdir / "zagadnienia.md").exists():
            try:
                topics = load_topics(kdir / "zagadnienia.md", chapters, root)
            except ContentError as e:
                errors.append(str(e))
        exams.append(Exam(int(kdir.name.split("-")[1]), topics, years))
    if errors:
        raise ContentError("\n".join(errors))

    by_key: dict[str, list[Task]] = {}
    for t in all_tasks(exams):
        by_key.setdefault(t.key, []).append(t)
    for group in by_key.values():
        for t in group:
            t.twins = [o for o in group if o is not t]
    return exams


def all_variants(exams: list[Exam]) -> list[Variant]:
    return [v for x in exams for _, vs in x.years for v in vs]


def all_tasks(exams: list[Exam]) -> list[Task]:
    return [t for v in all_variants(exams) for t in v.tasks]


def unique_tasks(exams: list[Exam]) -> list[Task]:
    """Każde zadanie raz — powtórki z innych zestawów są w `twins`."""
    seen, out = set(), []
    for t in all_tasks(exams):
        if t.key not in seen:
            seen.add(t.key)
            out.append(t)
    return out
