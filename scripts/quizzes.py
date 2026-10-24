"""Quizy (quizy/<nazwa>.yml): pytania zamknięte i prawda/fałsz z wyjaśnieniami.

    tytul: Kahoot 1
    opis: Jedno zdanie o quizie.                 (opcjonalnie)
    pytania:
      - tresc: Które stwierdzenie jest fałszywe?
        rozdzialy: [calculus/probability]
        odpowiedzi: [$P(\\Omega) = 1$, ...]      (pytanie wyboru: poprawna to litera a, b, ...)
        poprawna: c
        wyjasnienie: Dlaczego.                   (opcjonalnie)
      - tresc: Gęstość jest zawsze ciągła.       (bez `odpowiedzi`: prawda/fałsz)
        rozdzialy: [rv/real/distributions]
        poprawna: fałsz

Teksty to Markdown ze wzorami w LaTeX-u, jak w zadaniach.
"""

from dataclasses import dataclass, field
from pathlib import Path

import yaml

from tasks import Chapter, ContentError

QUIZ_KEYS = {"tytul", "opis", "pytania"}
QUESTION_KEYS = {"tresc", "rozdzialy", "odpowiedzi", "poprawna", "wyjasnienie"}
TRUE_FALSE = ["Prawda", "Fałsz"]
LETTERS = "abcdefgh"


@dataclass
class Question:
    num: int
    text: str
    chapters: list[Chapter]
    options: list[str]
    correct: int
    explanation: str = ""
    true_false: bool = False
    html: dict = field(default_factory=dict)


@dataclass
class Quiz:
    slug: str
    title: str
    description: str
    questions: list[Question]

    @property
    def path(self) -> str:
        return f"quizy/{self.slug}"


def parse_quiz(path: Path, chapters: dict[str, Chapter], root: Path) -> Quiz:
    """Wczytuje i sprawdza jeden quiz; wszystkie błędy zgłasza naraz."""
    name = path.relative_to(root).as_posix()
    data = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    errors = []
    if extra := set(data) - QUIZ_KEYS:
        errors.append(f"{name}: nieznane pola {sorted(extra)}")
    if not data.get("tytul"):
        errors.append(f"{name}: brak pola tytul")
    if not data.get("pytania"):
        errors.append(f"{name}: brak pytań")

    questions = []
    for i, q in enumerate(data.get("pytania") or [], 1):
        where = f"{name}: pytanie {i}"
        if extra := set(q) - QUESTION_KEYS:
            errors.append(f"{where}: nieznane pola {sorted(extra)}")
        missing = [k for k in ("tresc", "rozdzialy", "poprawna") if not q.get(k)]
        if missing:
            errors.append(f"{where}: brak pól {', '.join(missing)}")
            continue
        unknown = [c for c in q["rozdzialy"] if c not in chapters]
        if unknown:
            errors.append(f"{where}: nieznane rozdziały {unknown} — dostępne są w rozdzialy.yml")
            continue
        answer = str(q["poprawna"]).strip().lower()
        if "odpowiedzi" in q:
            options = [str(o) for o in q["odpowiedzi"] or []]
            letters = LETTERS[:len(options)]
            if not 2 <= len(options) <= len(LETTERS):
                errors.append(f"{where}: pytanie wyboru potrzebuje od 2 do {len(LETTERS)} odpowiedzi")
                continue
            if len(answer) != 1 or answer not in letters:
                errors.append(f"{where}: poprawna musi być jedną z liter {', '.join(letters)}")
                continue
            correct, true_false = letters.index(answer), False
        else:
            if answer not in ("prawda", "fałsz"):
                errors.append(f"{where}: bez `odpowiedzi` poprawna to `prawda` albo `fałsz`")
                continue
            options, correct, true_false = TRUE_FALSE, int(answer == "fałsz"), True
        questions.append(Question(i, str(q["tresc"]), [chapters[c] for c in q["rozdzialy"]], options, correct,
                                  str(q.get("wyjasnienie", "")), true_false))

    if errors:
        raise ContentError("\n".join(errors))
    return Quiz(path.stem, str(data["tytul"]), str(data.get("opis", "")), questions)


def collect_quizzes(root: Path, chapters: dict[str, Chapter]) -> list[Quiz]:
    quizzes, errors = [], []
    for f in sorted((root / "quizy").glob("*.yml")):
        try:
            quizzes.append(parse_quiz(f, chapters, root))
        except ContentError as err:
            errors.append(str(err))
    if errors:
        raise ContentError("\n".join(errors))
    return quizzes
