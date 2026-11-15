import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from ml_paths import load_ml_paths
from tasks import ContentError

ITEM = "      - { tytul: T, autor: A, link: 'https://x', opis: O }\n"
PATH = "  - id: {id}\n    nazwa: ML\n    opis: O\n    materialy:\n"


class MlPathsTest(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.path = Path(self.directory.name) / "ml.yml"

    def load(self, text):
        self.path.write_text(text, encoding="utf-8")
        return load_ml_paths(self.path)

    def test_missing_file_means_no_page(self):
        self.assertIsNone(load_ml_paths(self.path))

    def test_items_keep_order(self):
        ml = self.load("aktualizacja: 2026\nsciezki:\n" + PATH.format(id="ml") + ITEM * 4)
        self.assertEqual(len(ml.paths[0].items), 4)
        self.assertEqual(ml.paths[0].items[0].link, "https://x")

    def test_groups(self):
        base = "sciezki:\n" + PATH.format(id="ml") + ITEM
        ml = self.load(base + "na_agh:\n  - { nazwa: BIT, opis: O, link: 'https://d', punkty: [a, b] }\n")
        self.assertEqual(ml.groups[0].points, ["a", "b"])
        with self.assertRaises(ContentError) as caught:
            self.load(base + "na_agh:\n  - { nazwa: BIT, opis: O, sala: 1 }\n")
        self.assertIn("brak pól link", str(caught.exception))
        self.assertIn("nieznane pola ['sala']", str(caught.exception))

    def test_errors_are_reported_together(self):
        with self.assertRaises(ContentError) as caught:
            self.load("sciezki:\n" + PATH.format(id="Zle Id") + ITEM
                      + PATH.format(id="ok").replace("    opis: O\n", "    opis: O\n    kolor: red\n")
                      + "      - { tytul: T, czas: 3 h }\n")
        msg = str(caught.exception)
        for part in ("małych liter", "nieznane pola ['kolor']", "materiał 1: potrzebne są dokładnie pola"):
            self.assertIn(part, msg)


if __name__ == "__main__":
    unittest.main()
