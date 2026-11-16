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

    a) $A,B$ są niezależne wtedy i tylko wtedy, gdy $P(A,B)=P(A)P(B)$.
       Dla $P(B)>0$ równoważnie: $P(A\mid B)=P(A)$.
    b) $A_1,\ldots,A_n$ są niezależne wtedy i tylko wtedy, gdy dla każdego
       $I\subset\{1,\ldots,n\}$, $|I|\ge2$:
       $$P\left(\bigcap_{i\in I}A_i\right)=\prod_{i\in I}P(A_i).$$
    c) Niezależne zdarzenia są parami niezależne, ale nie odwrotnie — niezależność parami
       nie wystarcza. [Skrypt: przykł. 3.2](skrypt:calculus/conditional-independence#exm-independence-4)
    d) Niezależność $A,B$ pociąga niezależność par $A',B$; $A,B'$ oraz $A',B'$.
       [Skrypt: zad. 3.7](skrypt:calculus/conditional-independence#exr-conditional-independence-independent-complements)
    e) Rozłączne zdarzenia o dodatnich prawdopodobieństwach są zależne.

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

    a) Skończony lub nieskończony ciąg $A_1,A_2,\ldots$ tworzy układ zupełny, gdy
       $$A_i\cap A_j=\emptyset\ (i\ne j),\qquad \bigcup_i A_i=\Omega.$$
    b) Dla układu zupełnego z $P(A_i)>0$ dla każdego $i$:
       $$P(B)=\sum_i P(B\mid A_i)P(A_i).$$

8. **Twierdzenie Bayesa**

    [Skrypt: tw. 4.2](skrypt:calculus/bayes#thm-bayes-simple),
    [tw. 4.3](skrypt:calculus/bayes#thm-bayes-full)

    a) Dla $P(A)>0$ i $P(B)>0$:
       $$P(A\mid B)=\frac{P(B\mid A)P(A)}{P(B)}.$$
    b) Dla układu zupełnego jak w 7b) i $P(B)>0$:
       $$P(A_k\mid B)=\frac{P(B\mid A_k)P(A_k)}{\sum_i P(B\mid A_i)P(A_i)}.$$
