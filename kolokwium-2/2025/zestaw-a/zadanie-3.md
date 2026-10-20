---
tytul: "Awarie drukarek przemysłowych"
punkty: 25
rozdzialy: [inference/estimators, rv/real/well-known]
---

Firma serwisująca drukarki przemysłowe analizuje dane dotyczące awarii. Dla 5 drukarek tego samego modelu zarejestrowano czas (w miesiącach) od instalacji do pierwszej poważnej awarii: 8.2, 14.7, 3.1, 22.5, 11.3.
Zakładając, że zmienne są niezależne i czas do awarii ma rozkład wykładniczy:

a)  Oszacuj parametr rozkładu przy pomocy metody największej wiarygodności (10 pkt).

b)  Niech $S=X_1+\cdots+X_5$ oznacza sumę czasów do pierwszej awarii pięciu niezależnych drukarek. Wyznacz $\mathrm{Var}(S)$ w funkcji parametru $\lambda$, a następnie oszacuj tę wariancję, podstawiając $\hat{\lambda}$ z punktu a). (5 pkt).

c)  Oszacuj parametr rozkładu przy pomocy metody momentów (5 pkt).

d)  Firma rozważa oferowanie 12-miesięcznej gwarancji.\
    Oszacuj, jaki procent drukarek ulegnie awarii w okresie gwarancyjnym (5 pkt).

## Rozwiązanie

Dane: czasy (w miesiącach) do pierwszej poważnej awarii dla 5 drukarek:
$$x_1=8.2,\; x_2=14.7,\; x_3=3.1,\; x_4=22.5,\; x_5=11.3,
\qquad \sum_{i=1}^5 x_i = 59.8,\qquad \bar x=\frac{59.8}{5}=11.96.$$
Zakładamy, że $X_1,\dots,X_5$ są niezależne oraz
$$X_i \sim \mathrm{Exp}(\lambda), \qquad f(x\mid \lambda)=\lambda e^{-\lambda x}\ \ (x\ge 0),\ \ \lambda>0.$$

a)  **Metoda największej wiarygodności (MLE) dla $\lambda$ – krok po kroku.**

    **Krok 1: funkcja wiarygodności.**
    Ponieważ obserwacje są **niezależne**, to łączna gęstość (a więc i wiarygodność) jest iloczynem:
    $$L(\lambda)=\prod_{i=1}^{5} f(x_i\mid \lambda)
    =\prod_{i=1}^{5}\lambda e^{-\lambda x_i}
    =\lambda^5 \exp\!\left(-\lambda\sum_{i=1}^5 x_i\right).$$

    **Krok 2: log-wiarygodność.**
    Maksymalizacja $L(\lambda)$ jest równoważna maksymalizacji $\ell(\lambda)=\ln L(\lambda)$, co upraszcza rachunki:
    $$\ell(\lambda)=\ln\!\left(\lambda^5\right)-\lambda\sum_{i=1}^5 x_i
    =5\ln\lambda-\lambda\sum_{i=1}^5 x_i.$$

    **Krok 3: warunek konieczny maksimum (pochodna równa zero).**
    $$\ell'(\lambda)=\frac{5}{\lambda}-\sum_{i=1}^5 x_i.$$
    Równanie $\ell'(\lambda)=0$ daje:
    $$\frac{5}{\lambda}=\sum_{i=1}^5 x_i
    \quad\Longrightarrow\quad
    \hat\lambda=\frac{5}{\sum_{i=1}^5 x_i}.$$

    **Krok 4: sprawdzenie, że to maksimum.**
    $$\ell''(\lambda)=-\frac{5}{\lambda^2}<0 \quad (\lambda>0),$$
    czyli $\ell$ znaleziony punkt jest maksimum.

    **Krok 5: podstawienie danych.**
    $$\hat\lambda=\frac{5}{59.8}\approx 0.083612\ \text{[1/miesiąc]}.$$
    $$\boxed{\hat\lambda \approx 0.0836\ \text{[1/miesiąc]}.}$$

b)  **Wariancja sumy $S=X_1+\cdots+X_5$ oraz estymacja.**

    Najpierw ogólnie:
    $$\mathrm{Var}\!\left(\sum_{i=1}^5 X_i\right)
    =\sum_{i=1}^5 \mathrm{Var}(X_i)\;+\;2\sum_{i<j}\mathrm{Cov}(X_i,X_j).$$
    Ponieważ $X_1,\dots,X_5$ są **niezależne**, mamy $\mathrm{Cov}(X_i,X_j)=0$ dla $i\neq j$, więc:
    $$\mathrm{Var}(S)=\sum_{i=1}^5 \mathrm{Var}(X_i).$$
    Dla $X\sim\mathrm{Exp}(\lambda)$ zachodzi
    $$\mathrm{Var}(X)=\frac{1}{\lambda^2}.$$
    Stąd
    $$\mathrm{Var}(S)=5\cdot \frac{1}{\lambda^2}=\frac{5}{\lambda^2}.$$

    Estymacja przez podstawienie $\hat\lambda$ z (a):
    $$\widehat{\mathrm{Var}}(S)=\frac{5}{\hat\lambda^2}
    =\frac{5}{\left(\frac{5}{59.8}\right)^2}
    =\frac{59.8^2}{5}
    \approx 715.208\ \text{(miesiące)}^2.$$
    $$\boxed{\widehat{\mathrm{Var}}(S)\approx 715.21\ \text{(miesiące)}^2.}$$

c)  **Metoda momentów (MoM) dla $\lambda$.**

    Dla rozkładu wykładniczego:
    $$\mathbb{E}[X]=\frac{1}{\lambda}.$$
    Metoda momentów polega na przyrównaniu średniej teoretycznej do średniej z próby:
    $$\bar X=\frac{1}{\lambda}
    \quad\Longrightarrow\quad
    \tilde\lambda=\frac{1}{\bar X}.$$
    Dla $\bar x=11.96$:
    $$\tilde\lambda=\frac{1}{11.96}\approx 0.083612\ \text{[1/miesiąc]}.$$
    $$\boxed{\tilde\lambda \approx 0.0836\ \text{[1/miesiąc]}.}$$

d)  **Szacowany odsetek awarii w 12-miesięcznej gwarancji.**

    Szukamy $\mathbb{P}(X\le 12)$. Dla rozkładu wykładniczego dystrybuanta ma postać
    $$F_X(t)=\mathbb{P}(X\le t)=
    \begin{cases}
    0, & t<0,\\
    1-e^{-\lambda t}, & t\ge 0.
    \end{cases}$$
    Zatem dla $t=12$:
    $$\widehat{\mathbb{P}}(X\le 12)=1-e^{-12\hat\lambda}
    =1-\exp\!\left(-12\cdot \frac{5}{59.8}\right)
    \approx 1-e^{-1.00334}\approx 0.63335.$$
    $$\boxed{\widehat{\mathbb{P}}(X\le 12)\approx 0.633 \;\;\Rightarrow\;\; 63.3\%.}$$
