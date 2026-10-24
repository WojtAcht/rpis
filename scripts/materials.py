"""Materiały dodatkowe (materialy.yml): książki opisane raz i pozycje przypisane do rozdziałów skryptu.

    zrodla:
      tsun: { tytul, autor, link?, opis? }
    rozdzialy:
      calculus/bayes:
        - { zrodlo: tsun, gdzie: "2.2.2–2.2.4", link?, podrozdzial?, opis? }
        - { typ: wideo, tytul, autor, link, podrozdzial?, opis? }
"""

from dataclasses import dataclass
from pathlib import Path

import yaml

from tasks import Chapter, ContentError

TYPES = {"ksiazka": "Książka", "wideo": "Wideo", "artykul": "Artykuł", "notatki": "Notatki"}
SOURCE_KEYS = {"tytul", "autor", "link", "opis"}
ITEM_KEYS = {"zrodlo", "gdzie", "typ", "tytul", "autor", "link", "podrozdzial", "opis"}


@dataclass
class Source:
    id: str
    title: str
    author: str
    link: str = ""
    note: str = ""


@dataclass
class Material:
    kind: str
    title: str
    author: str
    link: str = ""
    where: str = ""
    section: str = ""
    note: str = ""
    source: Source | None = None

    @property
    def label(self) -> str:
        return TYPES[self.kind]


@dataclass
class Materials:
    sources: dict[str, Source]
    by_chapter: dict[str, list[Material]]

    def chapters_using(self, source_id: str, chapters: dict[str, Chapter]) -> list[Chapter]:
        return [chapters[cid] for cid, items in self.by_chapter.items()
                if any(m.source and m.source.id == source_id for m in items)]


def anchor(chapter_id: str) -> str:
    return "rozdzial-" + chapter_id.replace("/", "-")


def load_materials(path: Path, chapters: dict[str, Chapter]) -> Materials:
    """Wczytuje i sprawdza materialy.yml; wszystkie błędy zgłasza naraz."""
    name = path.name
    data = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    errors = []

    sources = {}
    for sid, s in (data.get("zrodla") or {}).items():
        where = f"{name}: źródło `{sid}`"
        if extra := set(s) - SOURCE_KEYS:
            errors.append(f"{where}: nieznane pola {sorted(extra)}")
        if not s.get("tytul") or not s.get("autor"):
            errors.append(f"{where}: brak pola `tytul` lub `autor`")
            continue
        sources[sid] = Source(sid, s["tytul"], s["autor"], s.get("link", ""), s.get("opis", ""))

    by_chapter = {}
    for cid, items in (data.get("rozdzialy") or {}).items():
        if cid not in chapters:
            errors.append(f"{name}: nieznany rozdział `{cid}` — dostępne są w rozdzialy.yml")
            continue
        out = []
        for i, m in enumerate(items or [], 1):
            where = f"{name}: {cid}, pozycja {i}"
            if extra := set(m) - ITEM_KEYS:
                errors.append(f"{where}: nieznane pola {sorted(extra)}")
            if "zrodlo" in m:
                src = sources.get(m["zrodlo"])
                if not src:
                    errors.append(f"{where}: nieznane źródło `{m['zrodlo']}` (brak w `zrodla`)")
                    continue
                out.append(Material("ksiazka", src.title, src.author, m.get("link", ""),
                                    str(m.get("gdzie", "")), str(m.get("podrozdzial", "")), m.get("opis", ""), src))
                continue
            missing = [k for k in ("typ", "tytul", "autor", "link") if not m.get(k)]
            if missing:
                errors.append(f"{where}: brak pól {', '.join(missing)}")
                continue
            if m["typ"] not in TYPES:
                errors.append(f"{where}: nieznany typ `{m['typ']}` (dozwolone: {', '.join(TYPES)})")
                continue
            out.append(Material(m["typ"], str(m["tytul"]), m["autor"], m["link"], "",
                                str(m.get("podrozdzial", "")), m.get("opis", "")))
        if out:
            by_chapter[cid] = out

    if errors:
        raise ContentError("\n".join(errors))
    # Kolejność rozdziałów jak w skrypcie, niezależnie od kolejności w pliku.
    return Materials(sources, {cid: by_chapter[cid] for cid in chapters if cid in by_chapter})
