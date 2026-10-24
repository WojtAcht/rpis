import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from quizzes import parse_quiz
from tasks import Chapter, ContentError

CHAPTERS = {"calculus/bayes": Chapter("calculus/bayes", 4, "Bayes", "RP", "")}


class QuizTest(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        self.path = self.root / "quizy/test.yml"
        self.path.parent.mkdir()

    def load(self, text):
        self.path.write_text(text, encoding="utf-8")
        return parse_quiz(self.path, CHAPTERS, self.root)

    def test_choice_and_true_false_questions(self):
        quiz = self.load(
            "tytul: Test\npytania:\n"
            "  - { tresc: A, rozdzialy: [calculus/bayes], odpowiedzi: [x, y, z], poprawna: C }\n"
            "  - { tresc: B, rozdzialy: [calculus/bayes], poprawna: fałsz, wyjasnienie: Bo tak. }\n"
        )
        choice, tf = quiz.questions
        self.assertEqual((quiz.path, choice.correct, choice.true_false), ("quizy/test", 2, False))
        self.assertEqual((tf.options, tf.correct, tf.true_false, tf.explanation),
                         (["Prawda", "Fałsz"], 1, True, "Bo tak."))

    def test_all_errors_are_reported_together(self):
        with self.assertRaises(ContentError) as caught:
            self.load(
                "pytania:\n"
                "  - { tresc: A, rozdzialy: [nie/ma], poprawna: prawda }\n"
                "  - { tresc: B, rozdzialy: [calculus/bayes], odpowiedzi: [x, y], poprawna: c }\n"
                "  - { tresc: C, rozdzialy: [calculus/bayes], poprawna: tak }\n"
                "  - { tresc: D, rozdzialy: [calculus/bayes], odpowiedzi: [x], poprawna: a }\n"
                "  - { tresc: E, poprawna: a, punkty: 3 }\n"
            )
        msg = str(caught.exception)
        for part in ("quizy/test.yml: brak pola tytul", "pytanie 1: nieznane rozdziały ['nie/ma']",
                     "pytanie 2: poprawna musi być jedną z liter a, b", "pytanie 3: bez `odpowiedzi`",
                     "pytanie 4: pytanie wyboru potrzebuje", "pytanie 5: nieznane pola ['punkty']",
                     "pytanie 5: brak pól rozdzialy"):
            self.assertIn(part, msg)

    def test_exam_number(self):
        quiz = self.load("tytul: T\nkolokwium: 2\npytania:\n  - { tresc: A, rozdzialy: [calculus/bayes], poprawna: prawda }\n")
        self.assertEqual(quiz.exam, 2)
        with self.assertRaises(ContentError) as caught:
            self.load("tytul: T\nkolokwium: drugie\npytania:\n  - { tresc: A, rozdzialy: [calculus/bayes], poprawna: prawda }\n")
        self.assertIn("kolokwium to numer kolokwium", str(caught.exception))
