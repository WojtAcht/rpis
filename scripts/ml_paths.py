"""Od czego zacząć ML (ml.yml): strona ml/.

    aktualizacja: listopad 2026
    sciezki:
      - { id, nazwa, opis?, materialy: [{ tytul, autor, link, opis }, ...] }
    na_agh:
      - { nazwa, opis, link, link_tekst?, punkty?: [..] }

Na stronie: koła naukowe, potem ścieżki jedna pod drugą (ML, AI, książki, źródła). Materiały w kolejności z pliku.
`na_agh` to koła naukowe na AGH, w których można uczyć się z innymi.
"""

import re
from dataclasses import dataclass, field
from pathlib import Path

import yaml

from tasks import ContentError

PATH_REQUIRED = ("id", "nazwa", "materialy")
PATH_KEYS = (*PATH_REQUIRED, "opis")
ITEM_KEYS = ("tytul", "autor", "link", "opis")
GROUP_REQUIRED = ("nazwa", "opis", "link")
GROUP_KEYS = set(GROUP_REQUIRED) | {"link_tekst", "punkty"}


@dataclass
class Item:
    title: str
    author: str
    link: str
    text: str


@dataclass
class MlPath:
    id: str
    name: str
    text: str
    items: list[Item]


@dataclass
class Group:
    name: str
    text: str
    link: str
    link_text: str = ""
    points: list[str] = field(default_factory=list)


@dataclass
class MlPaths:
    updated: str
    paths: list[MlPath]
    groups: list[Group] = field(default_factory=list)


def _path(p, where: str, errors: list[str]) -> MlPath | None:
    if not isinstance(p, dict):
        errors.append(f"{where}: oczekiwano pól {', '.join(PATH_KEYS)}")
        return None
    if extra := set(p) - set(PATH_KEYS):
        errors.append(f"{where}: nieznane pola {sorted(extra)}")
    if missing := [k for k in PATH_REQUIRED if not p.get(k)]:
        errors.append(f"{where}: brak pól {', '.join(missing)}")
        return None
    if not re.fullmatch(r"[a-z0-9-]+", str(p["id"])):
        errors.append(f"{where}: `id` musi być unikalne i składać się z małych liter, cyfr i myślników")
    items = []
    for j, m in enumerate(p["materialy"], 1):
        if not isinstance(m, dict) or set(m) != set(ITEM_KEYS) or not all(m.values()):
            errors.append(f"{where}, materiał {j}: potrzebne są dokładnie pola {', '.join(ITEM_KEYS)}")
            continue
        items.append(Item(str(m["tytul"]), str(m["autor"]), m["link"], m["opis"]))
    return MlPath(str(p["id"]), str(p["nazwa"]), p.get("opis", ""), items)


def load_ml_paths(path: Path) -> MlPaths | None:
    """Wczytuje i sprawdza ml.yml; brak pliku = brak strony. Wszystkie błędy zgłasza naraz."""
    if not path.exists():
        return None
    name = path.name
    data = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    errors, paths, seen = [], [], set()

    for i, p in enumerate(data.get("sciezki") or [], 1):
        where = f"{name}: ścieżka {p.get('id') if isinstance(p, dict) and p.get('id') else i}"
        if path_ := _path(p, where, errors):
            if path_.id in seen:
                errors.append(f"{where}: `id` musi być unikalne i składać się z małych liter, cyfr i myślników")
            seen.add(path_.id)
            paths.append(path_)

    groups = []
    for i, g in enumerate(data.get("na_agh") or [], 1):
        where = f"{name}: na_agh, pozycja {g.get('nazwa') or i}"
        if extra := set(g) - GROUP_KEYS:
            errors.append(f"{where}: nieznane pola {sorted(extra)}")
        if missing := [k for k in GROUP_REQUIRED if not g.get(k)]:
            errors.append(f"{where}: brak pól {', '.join(missing)}")
            continue
        if not isinstance(g.get("punkty", []), list):
            errors.append(f"{where}: `punkty` musi być listą")
            continue
        groups.append(Group(g["nazwa"], g["opis"], g["link"], g.get("link_tekst", ""),
                            [str(x) for x in g.get("punkty", [])]))

    if not paths and not errors:
        errors.append(f"{name}: brak ścieżek w `sciezki`")
    if errors:
        raise ContentError("\n".join(errors))
    return MlPaths(str(data.get("aktualizacja", "")), paths, groups)
