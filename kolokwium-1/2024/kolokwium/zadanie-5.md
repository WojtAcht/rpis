---
tytul: "Logarytm zmiennej jednostajnej"
punkty: 15
rozdzialy: [rv/real/functions, rv/real/distributions]
---

Niech $X \sim U(a, b)$ dla $0 < a < b$. Wyznacz rozkład zmiennej losowej $Y = \ln X$. Dla jakich wartości $c, d \in \mathbb{R}$ spełniona jest poniższa równość?
$$P(c < Y \leq d) = f_Y(d) - f_Y(c)$$

## Rozwiązanie

### Krok 1: Rozkład zmiennej $X$

Zmienna $X$ ma rozkład jednostajny na przedziale $[a, b]$, gdzie $0 < a < b$. Funkcja gęstości prawdopodobieństwa $f_X(x)$ wynosi:
$$f_X(x) =
\begin{cases}
\frac{1}{b-a}, & \text{dla } x \in [a, b], \\
0, & \text{w przeciwnym przypadku}.
\end{cases}$$
Dystrybuanta $F_X(x)$ jest zdefiniowana jako:
$$F_X(x) =
\begin{cases}
0, & \text{dla } x < a, \\
\frac{x-a}{b-a}, & \text{dla } x \in [a, b], \\
1, & \text{dla } x > b.
\end{cases}$$

### Krok 2: Wyznaczenie rozkładu zmiennej $Y = \ln(X)$

Zmienna $Y$ jest zdefiniowana jako $Y = \ln(X)$, więc $X = e^Y$. Korzystamy z metody dystrybuanty:
$$F_Y(y) = P(Y \leq y) = P(lnX \leq y) = P(X \leq e^y) = F_X(e^y)$$
Różniczkujemy obustronnie i otrzymujemy:
$$f_Y(y) = F_Y'(y) = f_X(e^y) \cdot (e^y)' = f_X(e^y) \cdot e^y.$$
Ostatecznie, funkcja gęstości $f_Y(y)$ wynosi:
$$f_Y(y) =
\begin{cases}
\frac{e^y}{b-a}, & \text{dla } y \in [\ln(a), \ln(b)], \\
0, & \text{w przeciwnym razie}.
\end{cases}$$
Warto zwrócić uwagę na przedział $[\ln(a), \ln(b)]$. W przypadku $X$: $f_X(x) \neq 0$ dla $x \in [a, b]$. Wiemy, że $f_Y(y) = f_X(e^y) \neq 0$ dla $e^y \in [a, b]$, co daje $y \in [ln(a), ln(b)]$.\
Wyznaczamy dystrybuantę $F_Y(y)$:
$$F_Y(y) =
\begin{cases}
0, & \text{dla } y < \ln(a), \\
\frac{e^y - a}{b-a}, & \text{dla } y \in [\ln(a), \ln(b)], \\
1, & \text{dla } y > \ln(b).
\end{cases}$$

### Krok 3: Wyrażenie $P(c < Y \leq d)$

Prawdopodobieństwo $P(c < Y \leq d)$ obliczamy przy pomocy dystrybuanty:
$$P(c < Y \leq d) = F_Y(d) - F_Y(c).$$
Szukamy $c, d$ takich że:
$$P(c < Y \leq d) = F_Y(d) - F_Y(c) = f_Y(d) - f_Y(c)$$
Rozważamy wszystkie przypadki:

#### Przypadek I: $c,d < \ln(a)$

$$F_Y(d) - F_Y(c) = 0 - 0 = 0 - 0 = f_Y(d) - f_Y(c)$$
Równość zachodzi.

#### Przypadek II: $c < \ln(a), d \in [\ln(a), \ln(b)]$

$$F_Y(d) - F_Y(c) = \frac{e^d - a}{b-a} - 0 \neq \frac{e^d}{b-a} - 0 = f_Y(d) - f_Y(c)$$
Równość nie zachodzi o ile $a \neq 0$.

#### Przypadek III: $c < \ln(a), d > \ln(b)$

$$F_Y(d) - F_Y(c) = 1 - 0 \neq 0 - 0 = f_Y(d) - f_Y(c)$$
Równość nie zachodzi.

#### Przypadek IV: $c,d \in [\ln(a), \ln(b)]$

$$F_Y(d) - F_Y(c) = \frac{e^d - a}{b-a} - \frac{e^c - a}{b-a} = \frac{e^d}{b-a} - \frac{e^c}{b-a} = f_Y(d) - f_Y(c)$$
Równość zachodzi.

#### Przypadek V: $c \in [\ln(a), \ln(b)], d > \ln(b)$

$$F_Y(d) - F_Y(c) = 1 - \frac{e^c - a}{b-a} \neq 0 - \frac{e^c}{b-a} = f_Y(d) - f_Y(c)$$
Równość nie zachodzi, ponieważ prawa strona jest ujemna.

#### Przypadek VI: $c, d > \ln(b)$

$$F_Y(d) - F_Y(c) = 1 - 1 = 0 - 0 = f_Y(d) - f_Y(c)$$
Równość zachodzi.
