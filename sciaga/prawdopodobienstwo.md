$\Omega$ — przestrzeń zdarzeń elementarnych, $A'=\Omega\setminus A$ — dopełnienie.

1. **Podstawowe własności prawdopodobieństwa**

    [Skrypt: tw. 2.3](https://home.agh.edu.pl/~smolka/rpis-skrypt/calculus/probability.html#thm-probability-properties)

    a) $P(\Omega)=1,\quad P(\emptyset)=0,\quad 0\le P(A)\le1$.
    b) $P(A')=1-P(A)$.
    c) $A\subseteq B\ \Longrightarrow\ P(A)\le P(B)$.
    d) $P(A\setminus B)=P(A)-P(A\cap B)$.

2. **Suma zdarzeń**

    [Skrypt: tw. 2.3](https://home.agh.edu.pl/~smolka/rpis-skrypt/calculus/probability.html#thm-probability-properties)

    a) $P(A\cup B)=P(A)+P(B)-P(A\cap B)$.
    b) Dla zdarzeń parami rozłącznych ($A_i\cap A_j=\emptyset$ dla $i\ne j$):
       $$P\left(\bigcup_{i=1}^n A_i\right)=\sum_{i=1}^n P(A_i).$$

3. **Co najmniej jedno zdarzenie**

    [Skrypt: tw. 2.3](https://home.agh.edu.pl/~smolka/rpis-skrypt/calculus/probability.html#thm-probability-properties),
    [tw. 3.3](https://home.agh.edu.pl/~smolka/rpis-skrypt/calculus/conditional-independence.html#thm-independence-properties) — wnioski:

    a) $\displaystyle P\left(\bigcup_{i=1}^n A_i\right)=1-P\left(\bigcap_{i=1}^n A_i'\right)$.
    b) Jeśli $A_1,\ldots,A_n$ są łącznie niezależne:
       $$P\left(\bigcup_{i=1}^n A_i\right)=1-\prod_{i=1}^n(1-P(A_i)).$$
    c) Dla $n$ niezależnych prób z prawdopodobieństwem sukcesu $p$ w każdej:
       $$P(\text{co najmniej jeden sukces})=1-(1-p)^n.$$

4. **Prawdopodobieństwo warunkowe**

    [Skrypt: def. 3.1](https://home.agh.edu.pl/~smolka/rpis-skrypt/calculus/conditional-independence.html#def-conditional-probability),
    [tw. 3.1](https://home.agh.edu.pl/~smolka/rpis-skrypt/calculus/conditional-independence.html#thm-conditional-probability-properties)

    Dla $P(B)>0$:

    a) $\displaystyle P(A\mid B)=\frac{P(A\cap B)}{P(B)}$.
    b) $P(A'\mid B)=1-P(A\mid B)$.
    c) Reguła łańcuchowa, dla $P(A)>0$ i $P(A\cap B)>0$:
       $$P(A\cap B\cap C)=P(A)P(B\mid A)P(C\mid A\cap B).$$
       [Skrypt: tw. 3.2](https://home.agh.edu.pl/~smolka/rpis-skrypt/calculus/conditional-independence.html#thm-chain-rule)

5. **Niezależność zdarzeń**

    [Skrypt: def. 3.2](https://home.agh.edu.pl/~smolka/rpis-skrypt/calculus/conditional-independence.html#def-event-independence),
    [tw. 3.3](https://home.agh.edu.pl/~smolka/rpis-skrypt/calculus/conditional-independence.html#thm-independence-properties)

    a) $A,B$ są niezależne wtedy i tylko wtedy, gdy $P(A\cap B)=P(A)P(B)$.
       Dla $P(B)>0$ równoważnie: $P(A\mid B)=P(A)$.
    b) Niezależność $A,B$ pociąga niezależność par $A',B$; $A,B'$ oraz $A',B'$.
    c) $A_1,\ldots,A_n$ są łącznie niezależne wtedy i tylko wtedy, gdy dla każdego
       $I\subseteq\{1,\ldots,n\}$, $|I|\ge2$:
       $$P\left(\bigcap_{i\in I}A_i\right)=\prod_{i\in I}P(A_i).$$
    d) Niezależność parami nie wystarcza do niezależności łącznej.
    e) Rozłączne zdarzenia o dodatnich prawdopodobieństwach są zależne.

6. **Niezależność warunkowa**

    [Skrypt: def. 3.3](https://home.agh.edu.pl/~smolka/rpis-skrypt/calculus/conditional-independence.html#def-event-conditional-independence),
    [tw. 3.4](https://home.agh.edu.pl/~smolka/rpis-skrypt/calculus/conditional-independence.html#thm-conditional-independence-properties)

    a) Dla $P(C)>0$, zdarzenia $A,B$ są niezależne pod warunkiem $C$ wtedy i tylko wtedy, gdy
       $$P(A\cap B\mid C)=P(A\mid C)P(B\mid C).$$
    b) Jeśli dodatkowo $P(B\cap C)>0$, równoważnie:
       $$P(A\mid B\cap C)=P(A\mid C).$$
    c) Niezależność zwykła nie implikuje warunkowej ani odwrotnie.
       Niezależność pod warunkiem $C$ nie zapewnia jej pod warunkiem $C'$.

7. **Twierdzenie o prawdopodobieństwie całkowitym**

    [Skrypt: def. 4.1](https://home.agh.edu.pl/~smolka/rpis-skrypt/calculus/bayes.html#def-complete-event-system),
    [tw. 4.1](https://home.agh.edu.pl/~smolka/rpis-skrypt/calculus/bayes.html#thm-total-probability-law)

    a) Skończona lub przeliczalna rodzina $A_1,A_2,\ldots$ tworzy układ zupełny, gdy
       $$A_i\cap A_j=\emptyset\ (i\ne j),\qquad \bigcup_i A_i=\Omega.$$
    b) Dla układu zupełnego z $P(A_i)>0$ dla każdego $i$:
       $$P(B)=\sum_i P(B\mid A_i)P(A_i).$$

8. **Twierdzenie Bayesa**

    [Skrypt: tw. 4.2](https://home.agh.edu.pl/~smolka/rpis-skrypt/calculus/bayes.html#thm-bayes-simple),
    [tw. 4.3](https://home.agh.edu.pl/~smolka/rpis-skrypt/calculus/bayes.html#thm-bayes-full)

    a) Dla $P(A)>0$ i $P(B)>0$:
       $$P(A\mid B)=\frac{P(B\mid A)P(A)}{P(B)}.$$
    b) Dla układu zupełnego jak w 7b) i $P(B)>0$:
       $$P(A_k\mid B)=\frac{P(B\mid A_k)P(A_k)}{\sum_i P(B\mid A_i)P(A_i)}.$$
