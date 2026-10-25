import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import llms
from tasks import Chapter, collect

CHAPTERS = {"calculus/bayes": Chapter("calculus/bayes", 4, "Bayes", "RP", "https://skrypt/calculus/bayes.html")}
TASK = "---\ntytul: {title}\npunkty: 5\nrozdzialy: [calculus/bayes]\n---\n{body}\n## Rozwiązanie\n### Krok 1\nWynik\n"


class HelpersTest(unittest.TestCase):
    def test_shift_headings_skips_code_and_stops_at_six(self):
        md = "### Krok\n```\n### kod\n```\n##### Głęboko"
        self.assertEqual(llms.shift_headings(md, 2), "##### Krok\n```\n### kod\n```\n###### Głęboko")

    def test_refs_span_becomes_plain_links(self):
        md = "1.  Bayes.\\\n    [[Tw. 4.2](https://s/b.html#t) prostsza ·\n    [Tw. 4.3](https://s/b.html#u) pełna]{.refs}"
        self.assertEqual(llms.plain_refs(md),
                         "1.  Bayes.\\\n    [Tw. 4.2](https://s/b.html#t) prostsza ·\n    [Tw. 4.3](https://s/b.html#u) pełna")

    def test_relative_images_get_site_url(self):
        md = "![Rysunek $A$](tree.png) i ![x](https://inny/obraz.png)"
        self.assertEqual(llms.absolute_images(md, "kolokwium-1/2024/kolokwium"),
                         f"![Rysunek $A$]({llms.SITE_URL}kolokwium-1/2024/kolokwium/tree.png) i ![x](https://inny/obraz.png)")


class DocumentTest(unittest.TestCase):
    def setUp(self):
        directory = tempfile.TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        root = Path(directory.name)
        for variant, title in (("zestaw-a", "Monety"), ("zestaw-b", "Monety"),
                               ("wejsciowka-rozdzial-2-grupa-a", "Kwadrat")):
            path = root / f"kolokwium-1/2025/{variant}/zadanie-1.md"
            path.parent.mkdir(parents=True)
            path.write_text(TASK.format(title=title, body=f"Treść: {title}. ![r](r.png)"), encoding="utf-8")
        self.exams = collect(root, CHAPTERS)

    def test_full_document_lists_twins_once_and_keeps_heading_levels(self):
        doc = llms.full_document(self.exams, [], CHAPTERS, "https://skrypt/")
        self.assertEqual(doc.count("Treść: Monety"), 1)
        self.assertIn("To samo zadanie co Kolokwium I · 2025 · Zestaw A, zadanie 1.", doc)
        self.assertIn("### Wejściówka (rozdz. 2) – grupa A · 2025", doc)
        self.assertIn("##### Rozwiązanie\n\n###### Krok 1", doc)
        self.assertIn(f"{llms.SITE_URL}kolokwium-1/2025/zestaw-a/r.png", doc)

    def test_task_file_and_index(self):
        task = self.exams[0].years[0][1][0].tasks[0]
        md = llms.task_file(task)
        self.assertTrue(md.startswith("# "))
        self.assertIn("## Rozwiązanie\n\n### Krok 1", md)
        self.assertIn("[4. Bayes](https://skrypt/calculus/bayes.html)", md)
        index = llms.index(self.exams, [], "https://skrypt/")
        self.assertIn(f"({llms.SITE_URL}rpis.md)", index)
        self.assertEqual(index.count("index.html.md"), 2)  # bliźniak z zestawu B tylko raz


if __name__ == "__main__":
    unittest.main()
