**Do czego jest ta ściąga.** To nie jest streszczenie wykładu. Są tu tylko wzory i warunki,
których faktycznie używa się w rozwiązaniach zadań z kolokwiów i ze skryptu.
Definicji, pełnych twierdzeń i dowodów (do zadań teoretycznych) szukaj w liście zagadnień i w skrypcie.

## Zdarzenia (rozdziały 2–4)

**Oznaczenia (jak w skrypcie)**\
$\Omega$ — przestrzeń zdarzeń elementarnych\
$A'=\Omega\setminus A$ — dopełnienie zdarzenia $A$\
$P(A,B)=P(A\cap B)$ — prawdopodobieństwo, że zaszły oba zdarzenia

1. **Podstawowe własności prawdopodobieństwa**

    [Skrypt: def. 2.5](skrypt:calculus/probability#def-probability-measure),
    [tw. 2.3](skrypt:calculus/probability#thm-probability-properties)

    a) $P(\Omega)=1,\quad 0\le P(A)\le1$ (def. 2.5), $\quad P(\emptyset)=0$ (tw. 2.3).
    b) $P(A')=1-P(A)$.
    c) $A\subset B\ \Longrightarrow\ P(A)\le P(B)$.
    d) Wniosek: $P(A\setminus B)=P(A)-P(A,B)$.

2. **Suma zdarzeń**

    [Skrypt: tw. 2.3](skrypt:calculus/probability#thm-probability-properties)

    a) $P(A\cup B)=P(A)+P(B)-P(A,B)$.
    b) Dla zdarzeń parami rozłącznych ($A_i\cap A_j=\emptyset$ dla $i\ne j$):
       $$P\left(\bigcup_{i=1}^n A_i\right)=\sum_{i=1}^n P(A_i).$$

3. **Co najmniej jedno zdarzenie**

    Wnioski z [tw. 2.3](skrypt:calculus/probability#thm-probability-properties)
    i [zad. 3.7](skrypt:calculus/conditional-independence#exr-conditional-independence-independent-complements)
    (wraz z uwagą pod nim):

    a) $\displaystyle P\left(\bigcup_{i=1}^n A_i\right)=1-P(A_1',\ldots,A_n')$.
    b) Jeśli $A_1,\ldots,A_n$ są niezależne (def. 3.2), to ich dopełnienia też, więc:
       $$P\left(\bigcup_{i=1}^n A_i\right)=1-\prod_{i=1}^n(1-P(A_i)).$$

4. **Prawdopodobieństwo warunkowe**

    [Skrypt: def. 3.1](skrypt:calculus/conditional-independence#def-conditional-probability),
    [tw. 3.1](skrypt:calculus/conditional-independence#thm-conditional-probability-properties)
    · [Film: prawdopodobieństwo warunkowe](https://www.youtube.com/watch?v=ddeJJGCsHI8)

    Dla $P(B)>0$:

    a) $\displaystyle P(A\mid B)=\frac{P(A,B)}{P(B)}$.
    b) $P(A,B)=P(A\mid B)P(B)$; jeśli także $P(A)>0$, to $P(A,B)=P(B\mid A)P(A)$.
    c) Wniosek: $P(A'\mid B)=1-P(A\mid B)$.
    d) Reguła łańcuchowa, dla $P(A,B)>0$:
       $$P(A,B,C)=P(A)\,P(B\mid A)\,P(C\mid A,B).$$
       W skrypcie ta reguła jest dla $k$ zdarzeń, zapisana od końca.
       [Skrypt: tw. 3.2](skrypt:calculus/conditional-independence#thm-chain-rule)

5. **Niezależność zdarzeń**

    [Skrypt: def. 3.2](skrypt:calculus/conditional-independence#def-event-independence),
    [tw. 3.3](skrypt:calculus/conditional-independence#thm-independence-properties)
    · [Film: niezależność zdarzeń](https://www.youtube.com/watch?v=sRAIC-UVkbE)

    a) $A,B$ są niezależne wtedy i tylko wtedy, gdy $P(A,B)=P(A)P(B)$.
       Dla $P(B)>0$ równoważnie: $P(A\mid B)=P(A)$.
    b) $A_1,\ldots,A_n$ są niezależne wtedy i tylko wtedy, gdy dla każdego
       $I\subset\{1,\ldots,n\}$, $|I|\ge2$:
       $$P\left(\bigcap_{i\in I}A_i\right)=\prod_{i\in I}P(A_i).$$
    c) Niezależne zdarzenia są parami niezależne, ale nie odwrotnie — niezależność parami
       nie wystarcza. [Skrypt: przykł. 3.2](skrypt:calculus/conditional-independence#exm-independence-4)
    d) Niezależność $A,B$ pociąga niezależność par $A',B$; $A,B'$ oraz $A',B'$.
       [Skrypt: zad. 3.7](skrypt:calculus/conditional-independence#exr-conditional-independence-independent-complements)
    e) **Rozłączność to nie niezależność.** Rozłączne zdarzenia ($A\cap B=\emptyset$)
       o dodatnich prawdopodobieństwach są zależne, bo $P(A,B)=0\ne P(A)P(B)$.

6. **Niezależność warunkowa**

    [Skrypt: def. 3.3](skrypt:calculus/conditional-independence#def-event-conditional-independence),
    [tw. 3.4](skrypt:calculus/conditional-independence#thm-conditional-independence-properties)

    a) Dla $P(C)>0$, zdarzenia $A,B$ są warunkowo niezależne względem $C$ wtedy i tylko wtedy, gdy
       $$P(A,B\mid C)=P(A\mid C)P(B\mid C).$$
    b) Jeśli dodatkowo $P(B,C)>0$, to:
       $$P(A\mid B,C)=P(A\mid C).$$
    c) Niezależność nie implikuje warunkowej niezależności ani odwrotnie.
       [Skrypt: przykł. 3.3](skrypt:calculus/conditional-independence#exm-conditional-independence-4),
       [przykł. 3.4](skrypt:calculus/conditional-independence#exm-conditional-independence-5)

7. **Twierdzenie o prawdopodobieństwie całkowitym**

    [Skrypt: def. 4.1](skrypt:calculus/bayes#def-complete-event-system),
    [tw. 4.1](skrypt:calculus/bayes#thm-total-probability-law)
    · [Film: prawdopodobieństwo całkowite](https://www.youtube.com/watch?v=x-EjxOMjP5k)

    a) Skończony lub nieskończony ciąg $A_1,A_2,\ldots$ tworzy układ zupełny, gdy
       $$A_i\cap A_j=\emptyset\ (i\ne j),\qquad \bigcup_i A_i=\Omega.$$
    b) Dla układu zupełnego z $P(A_i)>0$ dla każdego $i$:
       $$P(B)=\sum_i P(B\mid A_i)P(A_i).$$

8. **Twierdzenie Bayesa**

    [Skrypt: tw. 4.2](skrypt:calculus/bayes#thm-bayes-simple),
    [tw. 4.3](skrypt:calculus/bayes#thm-bayes-full)
    · [Film: twierdzenie Bayesa](https://www.youtube.com/watch?v=swimsJrbmdQ)

    a) Dla $P(A)>0$ i $P(B)>0$:
       $$P(A\mid B)=\frac{P(B\mid A)P(A)}{P(B)}.$$
    b) Dla układu zupełnego jak w 7b) i $P(B)>0$:
       $$P(A_k\mid B)=\frac{P(B\mid A_k)P(A_k)}{\sum_i P(B\mid A_i)P(A_i)}.$$

## Zmienne losowe jednowymiarowe (rozdziały 6–7)

**Oznaczenia**\
$F$ lub $F_X$ — dystrybuanta zmiennej $X$\
$p$ — funkcja prawdopodobieństwa (rozkład dyskretny), $\mathcal{S}$ — nośnik: przeliczalny zbiór wartości $X$, na którym $P(X\in\mathcal{S})=1$\
$f$ — gęstość (rozkład ciągły)\
$\mu=E(X)$ — wartość oczekiwana, $\sigma^2=Var(X)$ — wariancja

9. **Dystrybuanta**

    [Skrypt: def. 6.1](skrypt:rv/real/distributions#def-cdf),
    [tw. 6.1](skrypt:rv/real/distributions#thm-cdf-properties)
    · [Film: po co nam dystrybuanta?](https://www.youtube.com/watch?v=p3Qh-teTjr8)

    a) $F_X(x)=P(X\le x)$.
    b) Dla $a<b$: $P(a<X\le b)=F(b)-F(a)$. Wniosek: $P(X>a)=1-F(a)$.
    c) Funkcja $F$ jest dystrybuantą pewnego rozkładu, gdy jest niemalejąca, prawostronnie ciągła oraz
       $$\lim_{x\to-\infty}F(x)=0,\qquad \lim_{x\to+\infty}F(x)=1.$$
       Przydaje się w zadaniach „jakie warunki muszą spełniać stałe, żeby $F$ była dystrybuantą”.
       [Skrypt: zad. 6.1](skrypt:rv/real/distributions#exr-real-valued-cdf)

10. **Rozkład dyskretny**

    [Skrypt: def. 6.3](skrypt:rv/real/distributions#def-pmf),
    [tw. 6.2](skrypt:rv/real/distributions#thm-discrete-distribution-properties)
    · [Film: rozkład dyskretny i ciągły](https://www.youtube.com/watch?v=AindbNXmPHc)

    a) $p(x)=P(X=x)$, przy czym $p(x)\ge0$ i $\displaystyle\sum_{x\in\mathcal{S}}p(x)=1$.
    b) $P(X\in A)=\displaystyle\sum_{x\in A\cap\mathcal{S}}p(x)$.
    c) $F(x)=\displaystyle\sum_{s\in\mathcal{S},\ s\le x}p(s)$ — funkcja schodkowa,
       w punkcie $x\in\mathcal{S}$ skacze o $p(x)$.

11. **Rozkład ciągły i gęstość**

    [Skrypt: def. 6.4](skrypt:rv/real/distributions#def-continuous-distribution),
    [tw. 6.3](skrypt:rv/real/distributions#thm-continuous-distribution-properties)
    · [Film: rozkład dyskretny i ciągły](https://www.youtube.com/watch?v=AindbNXmPHc)

    a) Funkcja $f$ jest gęstością, gdy spełnia **oba** warunki:
       $$f(x)\ge0\ \text{ dla każdego } x\in\mathbb{R},\qquad \int_{-\infty}^{+\infty}f(x)\,dx=1.$$
       Z całki wychodzi równanie na stałą, a nieujemność
       często dodatkowo ogranicza parametr (np. znak stałej).
       [Skrypt: przykł. 6.3](skrypt:rv/real/distributions#exm-triangle-distribution),
       [zad. 6.7](skrypt:rv/real/distributions#exr-real-valued-pdf-double-exp)
       · [Film: gęstość z parametrem, zadanie z kolokwium](https://www.youtube.com/watch?v=RCSw_W6eshU)
    b) $P(X\in A)=\displaystyle\int_A f(x)\,dx$, w szczególności
       $$P(a<X<b)=\int_a^b f(x)\,dx=F(b)-F(a).$$
       $P(X=x)=0$, więc nie ma znaczenia, czy nierówności są ostre: $P(a<X<b)=P(a\le X\le b)$.
    c) $F(x)=\displaystyle\int_{-\infty}^{x}f(s)\,ds$.
    d) $F$ jest funkcją ciągłą.
    e) Tam, gdzie $f$ jest ciągła: $f(x)=F'(x)$.

12. **Wartość oczekiwana**

    [Skrypt: tw. 7.1](skrypt:rv/real/moments#thm-expected-value-discrete-distribution),
    [tw. 7.2](skrypt:rv/real/moments#thm-expected-value-continuous-distribution),
    [tw. 7.3](skrypt:rv/real/moments#thm-expval-properties)

    a) $\displaystyle E(X)=\sum_{s\in\mathcal{S}}s\,p(s)$ (dyskretny), $\qquad\displaystyle E(X)=\int_{-\infty}^{+\infty}x f(x)\,dx$ (ciągły).
    b) Wartość oczekiwana może nie istnieć, gdy całka (szereg) jest rozbieżna.
       [Skrypt: przykł. 7.3](skrypt:rv/real/moments#exm-no-expval)
    c) **Wartość oczekiwana jest liniowa**: stałe wyciągamy przed $E$, a sumę rozbijamy na sumę.
       Dla $a,b\in\mathbb{R}$: $E(aX+bY)=a\,E(X)+b\,E(Y)$, w szczególności $E(aX+b)=a\,E(X)+b$.

13. **Momenty i wariancja**

    [Skrypt: def. 7.2](skrypt:rv/real/moments#def-moment-simple),
    [tw. 7.4](skrypt:rv/real/moments#thm-expval-computation),
    [def. 7.4](skrypt:rv/real/moments#def-variance),
    [tw. 7.6](skrypt:rv/real/moments#thm-variance-properties)

    a) $\displaystyle E(X^k)=\sum_{s\in\mathcal{S}}s^k\,p(s)$ (dyskretny), $\qquad\displaystyle E(X^k)=\int_{-\infty}^{+\infty}x^k f(x)\,dx$ (ciągły).
    b) $Var(X)=E\bigl((X-\mu)^2\bigr)$, ale często łatwiej użyć wzoru
       $$Var(X)=E(X^2)-\bigl(E(X)\bigr)^2.$$
    c) **Wariancja nie jest liniowa.** Dla $a,b\in\mathbb{R}$: $Var(aX+b)=a^2\,Var(X)$ —
       przesunięcie o $b$ nie zmienia rozrzutu, a $a$ wychodzi do kwadratu (np. $Var(-X)=Var(X)$).
    d) Odchylenie standardowe: $\sigma=\sqrt{Var(X)}$.
       [Skrypt: def. 7.5](skrypt:rv/real/moments#def-stddev)
    e) Wskaźnik asymetrii (dla $\sigma>0$): $A=\dfrac{\mu_3}{\sigma^3}$, gdzie $\mu_3=E\bigl((X-\mu)^3\bigr)$.
       [Skrypt: def. 7.9](skrypt:rv/real/moments#def-skewness)

14. **Kwantyle, mediana, moda**

    [Skrypt: def. 7.12](skrypt:rv/real/moments#def-quantile),
    [def. 7.13](skrypt:rv/real/moments#def-mode-discrete),
    [def. 7.14](skrypt:rv/real/moments#def-mode-continuous)

    a) Rozkład ciągły: kwantyl rzędu $p\in(0,1)$ to rozwiązanie równania $F(q_p)=p$.
       Mediana: $p=\frac12$, dolny kwartyl: $p=\frac14$, górny kwartyl: $p=\frac34$.
    b) Dowolny rozkład (w szczególności dyskretny): $q_p$ spełnia
       $$F(q_p-)\le p\le F(q_p),\quad\text{czyli}\quad P(X\le q_p)\ge p,\ \ P(X\ge q_p)\ge1-p.$$
       Kwantyl nie musi być jednoznaczny — może nim być cały przedział.
       [Skrypt: przykł. 7.10](skrypt:rv/real/moments#exm-2dice-quantile)
    c) Moda: punkt, w którym funkcja prawdopodobieństwa (dyskretny) albo gęstość (ciągły, maksimum lokalne) osiąga maksimum.
