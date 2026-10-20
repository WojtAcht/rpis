import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from tasks import Chapter, ContentError, load_topics, parse_task


class TaskSectionsTest(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        self.path = self.root / "kolokwium-1/2025/zestaw-a/zadanie-1.md"
        self.path.parent.mkdir(parents=True)
        self.chapters = {"calculus/bayes": Chapter("calculus/bayes", 4, "Bayes", "RP", "")}

    def parse(self, body):
        self.path.write_text(
            "---\ntytul: Test\npunkty: 5\nrozdzialy: [calculus/bayes]\n---\n"
            + body, encoding="utf-8",
        )
        return parse_task(self.path, self.chapters, self.root)

    def test_duplicate_sections_are_rejected_with_source_path(self):
        for section in ("Rozwiązanie", "Wskazówka"):
            for first in ("Pierwsza część", ""):
                with self.subTest(section=section, first=first):
                    with self.assertRaises(ContentError) as caught:
                        self.parse(f"Treść\n## {section}\n{first}\n## {section}\nDruga część")
                    self.assertIn(self.path.relative_to(self.root).as_posix(), str(caught.exception))
                    self.assertIn(f"powtórzona sekcja „## {section}”", str(caught.exception))

    def test_sections_preserve_content_and_ignore_headings_in_code(self):
        task = self.parse(
            "Treść\n## Wskazówka\nPodpowiedź\n## Rozwiązanie\n"
            "Pierwsza część\n```text\n## Rozwiązanie\n```\n"
            "### Podpunkt b)\nDruga część"
        )
        self.assertEqual(task.statement, "Treść")
        self.assertEqual(task.hint, "Podpowiedź")
        self.assertEqual(
            task.solution,
            "Pierwsza część\n```text\n## Rozwiązanie\n```\n### Podpunkt b)\nDruga część",
        )


class TopicsTest(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        self.path = self.root / "kolokwium-1/zagadnienia.md"
        self.path.parent.mkdir(parents=True)
        self.chapters = {"calculus/bayes": Chapter("calculus/bayes", 4, "Bayes", "RP", "https://s/calculus/bayes.html")}

    def test_script_links_are_resolved(self):
        self.path.write_text("1. Bayes [[Tw. 4.2](skrypt:calculus/bayes#thm-bayes-simple)]{.refs}", encoding="utf-8")
        self.assertEqual(load_topics(self.path, self.chapters, self.root),
                         "1. Bayes [[Tw. 4.2](https://s/calculus/bayes.html#thm-bayes-simple)]{.refs}")

    def test_unknown_chapter_is_rejected(self):
        self.path.write_text("[Def. 1.1](skrypt:nie/ma#def)", encoding="utf-8")
        with self.assertRaises(ContentError) as caught:
            load_topics(self.path, self.chapters, self.root)
        self.assertIn("kolokwium-1/zagadnienia.md", str(caught.exception))
        self.assertIn("nie/ma", str(caught.exception))
