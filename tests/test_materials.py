import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from materials import load_materials
from tasks import Chapter, ContentError

CHAPTERS = {
    "calculus/probability": Chapter("calculus/probability", 2, "Prawdopodobieństwo", "RP", ""),
    "calculus/bayes": Chapter("calculus/bayes", 4, "Bayes", "RP", ""),
}


class MaterialsTest(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.path = Path(self.directory.name) / "materialy.yml"

    def load(self, text):
        self.path.write_text(text, encoding="utf-8")
        return load_materials(self.path, CHAPTERS)

    def test_book_references_and_chapter_order(self):
        mats = self.load(
            "zrodla:\n  ross: { skrot: Ross, tytul: A First Course, autor: Ross }\n"
            "rozdzialy:\n"
            "  calculus/bayes:\n    - { zrodlo: ross, gdzie: '3.3' }\n"
            "  calculus/probability:\n"
            "    - { typ: wideo, tytul: Aksjomaty, autor: MIT, link: 'https://x', podrozdzial: 2.4 }\n"
        )
        self.assertEqual(list(mats.by_chapter), ["calculus/probability", "calculus/bayes"])
        ref = mats.by_chapter["calculus/bayes"][0]
        self.assertEqual((ref.kind, ref.title, ref.where, ref.source.id), ("ksiazka", "A First Course", "3.3", "ross"))
        self.assertEqual(mats.by_chapter["calculus/probability"][0].section, "2.4")

    def test_all_errors_are_reported_together(self):
        with self.assertRaises(ContentError) as caught:
            self.load(
                "zrodla: {}\n"
                "rozdzialy:\n"
                "  nie/ma: []\n"
                "  calculus/bayes:\n"
                "    - { zrodlo: brak }\n"
                "    - { typ: podcast, tytul: T, autor: A, link: 'https://x' }\n"
                "    - { typ: wideo, tytul: T }\n"
                "    - { typ: wideo, tytul: T, autor: A, link: 'https://x', strona: 5 }\n"
            )
        msg = str(caught.exception)
        for part in ("nieznany rozdział `nie/ma`", "nieznane źródło `brak`", "nieznany typ `podcast`",
                     "brak pól autor, link", "nieznane pola ['strona']"):
            self.assertIn(part, msg)
