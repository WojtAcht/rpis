# Rachunek Prawdopodobieństwa i Statystyka — kolokwia

Prezentacje z zajęć, zadania z kolokwiów z poprzednich lat, rozwiązania i listy zagadnień.

**👉 Strona z PDF-ami: https://wojtacht.github.io/rpis/**

Najpierw spróbuj rozwiązać zadania samodzielnie, a dopiero potem zajrzyj do rozwiązań.

## Struktura

```
prezentacje/
└── NN-nazwa.html                   # samodzielne slajdy HTML
kolokwium-N/
├── zagadnienia.tex
└── RRRR/
    ├── <wariant>.tex               # zadania
    └── <wariant>-rozwiazanie.tex   # rozwiązanie (opcjonalnie)
```

Wariant to np. `kolokwium`, `zestaw-a` albo `termin-2`. Strona generuje się automatycznie
z tej struktury, więc nowe materiały wystarczy dodać do odpowiedniego katalogu.

## Budowanie lokalnie

Potrzebne: TeX Live (`latexmk`) i Python 3.

```sh
make          # kompiluje PDF-y i generuje stronę w _site/
make serve    # to samo, plus podgląd na http://localhost:8000
```

Po pushu na `main` GitHub Actions buduje i publikuje stronę na GitHub Pages.

## Błędy

Jeśli znajdziesz błąd w zadaniu lub rozwiązaniu, zgłoś go w Issues albo otwórz pull request.
