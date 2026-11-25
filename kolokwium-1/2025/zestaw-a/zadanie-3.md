---
tytul: "Rozkład zmiennej losowej jest miarą probabilistyczną"
punkty: 10
rozdzialy: [rv/general]
---

Podaj definicję rozkładu prawdopodobieństwa zmiennej losowej. Sformułuj i udowodnij twierdzenie mówiące, że ten rozkład jest miarą probabilistyczną.

## Rozwiązanie

Niech $(\Omega, \Sigma, P)$ będzie przestrzenią probabilistyczną, $\mathcal{X}$ niepustym zbiorem, $\Sigma_{\mathcal{X}}$ $\sigma$-algebrą podzbiorów $\mathcal{X}$, a $X : \Omega \longrightarrow \mathcal{X}$ zmienną losową (tzn. dla każdego $A \in \Sigma_{\mathcal{X}}$ zachodzi $X^{-1}(A) \in \Sigma$).

### Definicja rozkładu prawdopodobieństwa zmiennej losowej

Funkcję
$$P_X : \Sigma_{\mathcal{X}} \longrightarrow [0, 1]$$
określoną wzorem
$$P_X(A) = P\big(X^{-1}(A)\big)$$
nazywamy **rozkładem prawdopodobieństwa zmiennej losowej $X$**.

### Twierdzenie

Rozkład prawdopodobieństwa $P_X$ zmiennej losowej $X : \Omega \longrightarrow \mathcal{X}$ jest miarą probabilistyczną na $\mathcal{X}$.

### Dowód

Sprawdzimy oba aksjomaty miary probabilistycznej.

1. **Aksjomat 1 (unormowanie):**
   $$P_X(\mathcal{X}) = P\big(X^{-1}(\mathcal{X})\big) = P(\Omega) = 1.$$

2. **Aksjomat 2 ($\sigma$-addytywność):**
   Weźmy ciąg zdarzeń $A_1, A_2, \dots \in \Sigma_{\mathcal{X}}$ parami rozłącznych, tzn.
   $$A_i \cap A_j = \emptyset \quad \text{dla } i \neq j.$$
   Określmy ciąg podzbiorów $\Omega$:
   $$B_i = X^{-1}(A_i), \quad i = 1, 2, \dots$$
   Z definicji zmiennej losowej wynika, że $B_i \in \Sigma$ dla każdego $i = 1, 2, \dots$. Z własności przeciwobrazu zbiory $B_i$ są również parami rozłączne:
   $$B_i \cap B_j = X^{-1}(A_i) \cap X^{-1}(A_j) = X^{-1}(A_i \cap A_j) = \emptyset \quad \text{dla } i \neq j.$$
   Ponieważ $P$ jest miarą probabilistyczną na $\Omega$, zachodzi:
   $$P\left(\bigcup_{i=1}^\infty B_i\right) = \sum_{i=1}^\infty P(B_i).$$
   Ostatecznie, korzystając z definicji $P_X$, własności przeciwobrazu oraz powyższej równości, otrzymujemy:
   $$\begin{aligned}
       P_X\left(\bigcup_{i=1}^\infty A_i\right)
       &= P\left(X^{-1}\left(\bigcup_{i=1}^\infty A_i\right)\right)
       = P\left(\bigcup_{i=1}^\infty X^{-1}(A_i)\right)
       = P\left(\bigcup_{i=1}^\infty B_i\right) \\
       &= \sum_{i=1}^\infty P(B_i)
       = \sum_{i=1}^\infty P\big(X^{-1}(A_i)\big)
       = \sum_{i=1}^\infty P_X(A_i).
   \end{aligned}$$

Co kończy dowód.
$\square$

Źródło: skrypt do wykładu, rozdział [5.2 Rozkład prawdopodobieństwa zmiennej losowej](https://home.agh.edu.pl/~smolka/rpis-skrypt/rv/general.html#rozk%C5%82ad-prawdopodobie%C5%84stwa-zmiennej-losowej) ([Def. 5.3](https://home.agh.edu.pl/~smolka/rpis-skrypt/rv/general.html#def-rvar-distribution), [Tw. 5.1](https://home.agh.edu.pl/~smolka/rpis-skrypt/rv/general.html#thm-rvar-distribution-measure)).
