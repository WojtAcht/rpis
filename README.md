# Rachunek Prawdopodobieństwa i Statystyka — kolokwia

Prezentacje z zajęć, zadania z kolokwiów z poprzednich lat z rozwiązaniami i listy zagadnień.
Każde zadanie jest przypisane do rozdziałów [skryptu do wykładu](https://home.agh.edu.pl/~smolka/rpis-skrypt/).

**👉 Strona: https://wojtacht.github.io/rpis/** · [wszystkie zadania według rozdziałów](https://wojtacht.github.io/rpis/zadania/)

Najpierw spróbuj rozwiązać zadania samodzielnie, a dopiero potem zajrzyj do rozwiązań.

## Struktura

```
rozdzialy.yml                       # rozdziały skryptu, do których przypisujemy zadania
prezentacje/
└── NN-nazwa.html                   # samodzielne slajdy HTML
kolokwium-N/
├── zagadnienia.tex
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

Build sprawdza nagłówki, sekcje, numerację i identyfikatory rozdziałów, a błędy wypisuje z nazwą pliku.

## Budowanie lokalnie

Potrzebne: TeX Live (`latexmk`), [pandoc](https://pandoc.org) 3.x i Python 3.10+ z PyYAML.

```sh
make          # kompiluje PDF-y i generuje stronę w _site/
make serve    # to samo, plus podgląd na http://localhost:8000
```

Po pushu na `main` GitHub Actions buduje i publikuje stronę na GitHub Pages.

## Błędy

Jeśli znajdziesz błąd w zadaniu lub rozwiązaniu, zgłoś go w Issues (link jest na stronie każdego zadania)
albo popraw plik i otwórz pull request.
