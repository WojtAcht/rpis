# Rachunek Prawdopodobieństwa i Statystyka — kolokwia

Prezentacje z zajęć, zadania z kolokwiów z poprzednich lat z rozwiązaniami i listy zagadnień.
Każde zadanie jest przypisane do rozdziałów [skryptu do wykładu](https://home.agh.edu.pl/~smolka/rpis-skrypt/).

**👉 Strona: https://wojtacht.github.io/rpis/** · [wszystkie zadania](https://wojtacht.github.io/rpis/zadania/)

Najpierw spróbuj rozwiązać zadania samodzielnie, a dopiero potem zajrzyj do rozwiązań.

## Struktura

```
rozdzialy.yml                       # rozdziały skryptu, do których przypisujemy zadania
materialy.yml                       # materiały dodatkowe (książki, filmy, artykuły) do rozdziałów
quizy/
└── <nazwa>.yml                     # quiz: pytania zamknięte i prawda/fałsz
prezentacje/
└── NN-nazwa.html                   # samodzielne slajdy HTML
kolokwium-N/
├── zagadnienia.md                  # lista zagadnień z odnośnikami do skryptu
└── RRRR/
    └── <wariant>/                  # np. kolokwium, zestaw-a, termin-2
        ├── zadanie-1.md            # treść + rozwiązanie jednego zadania
        ├── zadanie-2.md
        └── rysunek.png             # obrazki używane w zadaniach (opcjonalnie)
```

Strona generuje się automatycznie z tej struktury. Z plików zadań powstają:

- strona każdego zadania (treść, rozwiązanie do rozwinięcia, rozdziały skryptu),
- strona zestawu (wszystkie zadania po kolei, jak na kolokwium),
- [bank zadań](https://wojtacht.github.io/rpis/zadania/) z filtrowaniem po rozdziale i kolokwium, wyszukiwarką i grupowaniem,
- PDF-y zestawu: same zadania oraz zadania z rozwiązaniami.

## Format zadania

Plik `zadanie-K.md` to Markdown (pandoc) ze wzorami w LaTeX-u (`$...$`, `$$...$$`):

```markdown
---
tytul: "Dwie monety w kapeluszu"
punkty: 25
rozdzialy: [calculus/bayes, calculus/conditional-independence]
---

W kapeluszu znajdują się dwie monety... Niech $C$ oznacza...

a)  Jakie jest prawdopodobieństwo, że wylosowana moneta jest uczciwa?
b)  Czy zdarzenia ... są niezależne?

## Wskazówka

(opcjonalnie) Skorzystaj z twierdzenia Bayesa.

## Rozwiązanie

$$P(M_U \mid 2O) = \frac{P(2O \mid M_U)\,P(M_U)}{P(2O)} = \frac{4}{5}$$

### Podpunkt b)
...
```

- `rozdzialy` to identyfikatory z `rozdzialy.yml` (ścieżka strony rozdziału w skrypcie).
  Pierwszy rozdział jest główny — pod nim zadanie pojawia się przy grupowaniu po rozdziałach.
- Dozwolone sekcje to `## Wskazówka` i `## Rozwiązanie`; śródtytuły w rozwiązaniu zaczynaj od `###`.
- Zadania w zestawie numerujemy kolejno od 1. Identyczne zadania w różnych zestawach
  (np. A i B) są wykrywane automatycznie i w banku zadań pokazywane raz.
- Obrazek wstawiasz jako `![Podpis](rysunek.png)`, plik kładziesz obok zadania.
- Wejściówki trzymamy w katalogu kolokwium z tym samym materiałem, w wariancie
  `wejsciowka-rozdzial-N-grupa-X` (np. `kolokwium-1/2026/wejsciowka-rozdzial-2-grupa-a/`).
  Wyświetlają się jako „Wejściówka (rozdz. N) · RRRR · grupa X”, mają własną sekcję na stronie głównej
  i osobny filtr „Wejściówki” w banku zadań.

Build sprawdza nagłówki, sekcje, numerację i identyfikatory rozdziałów, a błędy wypisuje z nazwą pliku.

## Zagadnienia do kolokwium

`kolokwium-N/zagadnienia.md` to numerowana lista w Markdownie, z której powstaje strona
`kolokwium-N/zagadnienia/`. Pod każdym zagadnieniem podajemy definicje, twierdzenia i podrozdziały skryptu:

```markdown
1.  Twierdzenie Bayesa (z dowodem).\
    [[Tw. 4.2](skrypt:calculus/bayes#thm-bayes-simple) wersja prostsza ·
    [Tw. 4.3](skrypt:calculus/bayes#thm-bayes-full) wersja rozwinięta]{.refs}
```

Odnośnik `skrypt:<rozdział>#<kotwica>` zamienia się na adres strony skryptu; `<rozdział>` to identyfikator
z `rozdzialy.yml`, a kotwica to `id` definicji/twierdzenia (np. `def-cdf`) lub podrozdziału na stronie skryptu.

## Materiały dodatkowe

`materialy.yml` opisuje stronę [materiałów dodatkowych](https://wojtacht.github.io/rpis/materialy/).
Książki opisujemy raz w `zrodla`, a w rozdziale podajemy konkretne podrozdziały książki:

```yaml
zrodla:
  ross: { skrot: Ross, tytul: A First Course in Probability (wyd. 10), autor: Sheldon M. Ross }

rozdzialy:
  calculus/bayes:
    - { zrodlo: ross, gdzie: "3.3" }
    - typ: wideo                       # ksiazka, wideo, artykul, notatki
      tytul: The Bayesian Trap
      autor: Veritasium
      link: https://www.youtube.com/watch?v=R13BD8qKeTg
      podrozdzial: "4.2"               # opcjonalnie: miejsce w skrypcie
      opis: Jedno zdanie, dlaczego warto.  # opcjonalnie
```

Przy rozdziale książka wyświetla się jako `skrot` z podrozdziałami, pełny tytuł jest w podpowiedzi.
Linkujemy tylko do legalnie udostępnionych wersji.
Build sprawdza identyfikatory rozdziałów i źródeł, typy i wymagane pola. W banku zadań baner
wybranego rozdziału prowadzi do jego materiałów.

## Quizy

Każdy plik `quizy/<nazwa>.yml` to osobna strona `quizy/<nazwa>/` z pytaniami zamkniętymi.
Pytania pokazują się po jednym; po odpowiedzi widać wyjaśnienie, a na końcu wynik:

```yaml
tytul: Kahoot 1
kolokwium: 1                             # opcjonalnie: przed którym kolokwium
pytania:
  - tresc: Które stwierdzenie jest **fałszywe**?
    rozdzialy: [calculus/probability]
    odpowiedzi: [$P(\Omega) = 1$, "$P(A \cap B) \le P(A)$"]
    poprawna: b                          # litera poprawnej odpowiedzi
    wyjasnienie: Dlaczego.               # opcjonalnie
  - tresc: Gęstość rozkładu ciągłego zawsze jest funkcją ciągłą.
    rozdzialy: [rv/real/distributions]
    poprawna: fałsz                      # bez `odpowiedzi`: pytanie prawda/fałsz
```

Teksty to Markdown ze wzorami, jak w zadaniach. Build sprawdza pola, litery odpowiedzi i identyfikatory rozdziałów.
Wszystkie quizy są na stronie `quizy/`, a quizy z polem `kolokwium` także w sekcji najbliższego kolokwium.

## Strona główna

Pod tytułem są kafle z głównymi wejściami (zagadnienia, bank zadań, quizy, PDF-y), a pod nimi
sekcja najbliższego kolokwium: od września do 19 grudnia Kolokwium I, od 20 grudnia Kolokwium II.
Strona przebudowuje się sama w te dni (harmonogram w GitHub Actions).

## Budowanie lokalnie

Potrzebne: TeX Live (`latexmk`), [pandoc](https://pandoc.org) 3.x i Python 3.10+ z PyYAML.

```sh
make          # kompiluje PDF-y i generuje stronę w _site/
make serve    # to samo, plus podgląd na http://localhost:8000
```

Po pushu na `main` GitHub Actions buduje i publikuje stronę na GitHub Pages.

## Testy

Testy filtrów korzystają z wygenerowanej strony i wymagają Node.js 24:

```sh
make
python3 -m unittest discover -s tests
npm ci
npm test
```

CI uruchamia te testy przed publikacją. Parser odrzuca powtórzone sekcje
`## Wskazówka` i `## Rozwiązanie`, aby nie nadpisywać ich treści.

## Błędy

Jeśli znajdziesz błąd w zadaniu lub rozwiązaniu, zgłoś go w Issues (link jest na stronie każdego zadania)
albo popraw plik i otwórz pull request.
