---
tytul: "Gęstość ax + bx² ze znaną wartością oczekiwaną"
punkty: 30
rozdzialy: [rv/real/moments, rv/real/distributions]
---

Funkcja $f$ jest funkcją gęstości prawdopodobieństwa zmiennej losowej $X$:
$$f(x) = 
\begin{cases} 
ax + bx^2 & \text{dla } 0 \leq x \leq 1, \\
0 & \text{w przeciwnym przypadku}.
\end{cases}$$
Wiedząc, że wartość oczekiwaną $\mathbb{E}(X) = \frac{7}{12}$, wyznacz współczynniki $a$ i $b$, oblicz wariancję i modę, wyznacz dystrybuantę $F_X(x)$. Oblicz $P(|X| < \frac{1}{2})$.

## Rozwiązanie

Dla funkcji gęstości prawdopodobieństwa:
$$f(x) =
\begin{cases}
ax + bx^2 & \text{dla } 0 \leq x \leq 1, \\
0 & \text{w przeciwnym przypadku.}
\end{cases}$$

### Krok 1: Warunek

Funkcja gęstości prawdopodobieństwa musi spełniać następujący warunek:
$$\int_{-\infty}^\infty f(x) \, dx = 1.$$
W naszym przypadku:
$$\int_{-\infty}^\infty f(x) \, dx = \int_{-\infty}^0 0 \, dx +  \int_0^1 (ax + bx^2) \, dx + \int_{1}^\infty 0 \, dx = 1.$$
Obliczamy całkę:
$$\int_{-\infty}^\infty f(x) \, dx = \int_0^1 (ax + bx^2) \, dx = \int_0^1 ax \, dx + \int_0^1 bx^2 \, dx = \left[\frac{a x^2}{2}\right]_0^1 + \left[\frac{b x^3}{3}\right]_0^1 = \frac{a}{2} + \frac{b}{3}.$$
Ostatecznie dostajemy:
$$\frac{a}{2} + \frac{b}{3} = 1. \tag{1}$$

### Krok 2: Wartość oczekiwana

Wartość oczekiwana zmiennej losowej $X$ wynosi:
$$\mathbb{E}(X) = \int_{-\infty}^\infty x f(x) \, dx.$$
Analogicznie wystarczy, że skupimy się na przedziale $0 \leq x \leq 1$:
$$\mathbb{E}(X) = \int_0^1 x(ax + bx^2) \, dx = \int_0^1 (ax^2 + bx^3) \, dx.$$
Obliczamy całkę:
$$\int_0^1 (ax^2 + bx^3) \, dx = \int_0^1 ax^2 \, dx + \int_0^1 bx^3 \, dx = \left[\frac{a x^3}{3}\right]_0^1 + \left[\frac{b x^4}{4}\right]_0^1 = \frac{a}{3} + \frac{b}{4}.$$
Z warunku:
$$\mathbb{E}(X) = \frac{7}{12},$$
otrzymujemy:
$$\frac{a}{3} + \frac{b}{4} = \frac{7}{12}. \tag{2}$$

### Krok 3: Rozwiązanie układu równań

Rozwiązujemy układ równań:
$$\begin{cases} 
\frac{a}{2} + \frac{b}{3} = 1, \\ 
\frac{a}{3} + \frac{b}{4} = \frac{7}{12}.
\end{cases}$$
Mnożymy pierwsze równanie przez 18, drugie równanie przez 24:
$$\begin{cases} 
9a + 6b = 18, \\ 
8a + 6b = 14.
\end{cases}$$
Odejmujemy równania stronami i otrzymujemy:
$$\begin{cases} 
a = 4, \\ 
b = \frac{18 - 9a}{6} = -3.
\end{cases}$$

### Krok 4: Wariancja

Wariancja $Var(X)$ jest dana wzorem:
$$Var(X) = \mathbb{E}(X^2) - (\mathbb{E}(X))^2.$$
Obliczamy $\mathbb{E}(X^2)$ (znowu ograniczamy się do przedziału $0 \leq x \leq 1$):
$$\mathbb{E}(X^2) = \int_0^1 x^2 f(x) \, dx = \int_0^1 x^2(4x - 3x^2) \, dx = \int_0^1 (4x^3 - 3x^4) \, dx.$$
$$\int_0^1 (4x^3 - 3x^4) \, dx = \left[x^4 - \frac{3x^5}{5}\right]_0^1 = 1 - \frac{3}{5} = \frac{2}{5}.$$
Zatem:
$$Var(X) = \frac{2}{5} - \left(\frac{7}{12}\right)^2 = \frac{2}{5} - \frac{49}{144}.$$
Po sprowadzeniu do wspólnego mianownika:
$$Var(X) = \frac{288}{720} - \frac{245}{720} = \frac{43}{720}.$$

### Krok 5: Moda

Moda to wartość $x$, dla której $f(x)$ osiąga maksimum. Pochodna $f(x)$ wynosi:
$$f'(x) = 4 - 6x.$$
Zatem $f'(x) = 0$ dla $x = \frac{2}{3}$. Sprawdzamy znak pochodnej i potwierdzamy, że maksimum występuje w $x = \frac{2}{3}$. W tym podpunkcie można również zauważyć, że $f(x)$ jest funkcją kwadratową i obliczyć pierwszą współrzędną wierzchołka.

### Krok 6: Wyznaczenie dystrybuanty $F_X(x)$

Dystrybuanta $F_X(x)$ jest dana wzorem:
$$F_X(x) = \int_{-\infty}^x f(t) \, dt.$$
Dla $x \in [0, 1]$:
$$F_X(x) = \int_0^x (4t - 3t^2) \, dt = \left[2t^2 - t^3\right]_0^x = 2x^2 - x^3.$$
Dla $x < 0$, $F_X(x) = 0$, a dla $x > 1$, $F_X(x) = 1$. Ostatecznie:
$$F_X(x) =
\begin{cases}
0 & \text{dla } x < 0, \\
2x^2 - x^3 & \text{dla } 0 \leq x \leq 1, \\
1 & \text{dla } x > 1.
\end{cases}$$

### Krok 7: Obliczenie $P(|X| < \frac{1}{2})$

$$P(|X| < \frac{1}{2}) = P\left(-\frac{1}{2} < X < \frac{1}{2}\right).$$
Ponieważ $P(X < 0) = 0$, mamy:
$$P(|X| < \frac{1}{2}) = P\left(0 < X < \frac{1}{2}\right).$$
Obliczamy:
$$P\left(0 < X < \frac{1}{2}\right) = F_X\left(\frac{1}{2}\right) - F_X(0).$$
Dla $x = \frac{1}{2}$:
$$F_X\left(\frac{1}{2}\right) = 2\left(\frac{1}{2}\right)^2 - \left(\frac{1}{2}\right)^3 = 2 \cdot \frac{1}{4} - \frac{1}{8} = \frac{1}{2} - \frac{1}{8} = \frac{4}{8} - \frac{1}{8} = \frac{3}{8}.$$
Dla $x = 0$, $F_X(0) = 0$. Ostatecznie:
$$P(|X| < \frac{1}{2}) = \frac{3}{8} - 0 = \frac{3}{8}.$$
