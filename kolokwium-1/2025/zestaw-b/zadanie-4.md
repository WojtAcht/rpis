---
tytul: "Gęstość 2x/θ² z parametrem"
punkty: 30
rozdzialy: [rv/real/distributions, rv/real/moments]
---

Niech $X$ będzie zmienną losową o nieznanym parametrze $\theta > 0$, której funkcja
gęstości prawdopodobieństwa ma postać
$$f_\theta(x) =
\begin{cases}
\dfrac{2x}{\theta^2}, & \text{dla } 0 \leq x \leq \theta,\\[4pt]
0, & \text{w przeciwnym przypadku.}
\end{cases}$$

a)  Dla jakich wartości parametru $\theta$ funkcja $f_\theta$ jest
    funkcją gęstości prawdopodobieństwa zmiennej losowej $X$?

b)  Wyznacz dystrybuantę $F_X(x)$ zmiennej losowej $X$.

c)  Oblicz wartość oczekiwaną $E[X]$, $Var(2X + 120)$ oraz medianę
    zmiennej losowej $X$ w zależności od parametru $\theta$.

d)  Oblicz prawdopodobieństwo $P\bigl(X^2 > 1\bigr)$ w zależności od parametru $\theta$.

## Rozwiązanie

### a) Wyznaczenie wartości parametru $\theta$

Aby funkcja $f_\theta(x)$ była funkcją gęstości, musi spełniać dwa warunki:

1.  $f_\theta(x) \geq 0$ dla każdego $x \in \mathbb{R}$.

2.  $\int_{-\infty}^{\infty} f_\theta(x) \, dx = 1$.

**Warunek 1:** Dla $\theta > 0$ oraz $x \in [0, \theta]$, wyrażenie $\frac{2x}{\theta^2}$ jest nieujemne.\
**Warunek 2:** Obliczamy całkę:
$$\int_{-\infty}^{\infty} f_\theta(x) \, dx = \int_0^\theta \frac{2x}{\theta^2} \, dx = \frac{2}{\theta^2} \int_0^\theta x \, dx$$
$$= \frac{2}{\theta^2} \cdot \left[ \frac{x^2}{2} \right]_0^\theta = \frac{2}{\theta^2} \cdot \left( \frac{\theta^2}{2} - 0 \right) = 1$$
Całka wynosi 1 dla każdego $\theta \neq 0$. Z treści zadania wiemy, że $\theta \in \mathbb{R}_+$.

**Odpowiedź:** Funkcja jest gęstością dla każdego $\theta > 0$.

### b) Wyznaczenie dystrybuanty $F_X(x)$

Dystrybuantę wyznaczamy ze wzoru $F_X(x) = \int_{-\infty}^x f_\theta(t) \, dt$.

-   Dla $x < 0$: $F_X(x) = 0$.

-   Dla $0 \leq x \leq \theta$:
    $$F_X(x) = \int_0^x \frac{2t}{\theta^2} \, dt = \frac{2}{\theta^2} \cdot \frac{x^2}{2} = \frac{x^2}{\theta^2}$$

-   Dla $x > \theta$: $F_X(x) = 1$.

**Odpowiedź:**
$$F_X(x) =
\begin{cases}
0, & \text{dla } x < 0, \\[6pt]
\dfrac{x^2}{\theta^2}, & \text{dla } 0 \leq x \leq \theta, \\[6pt]
1, & \text{dla } x > \theta.
\end{cases}$$

### c) Wartość oczekiwana $E[X]$, wariancja $Var(2X+120)$ i mediana

**1. Wartość oczekiwana $E[X]$:**
$$E[X] = \int_0^\theta x \cdot \frac{2x}{\theta^2} \, dx = \frac{2}{\theta^2} \int_0^\theta x^2 \, dx = \frac{2}{\theta^2} \left[ \frac{x^3}{3} \right]_0^\theta = \frac{2}{\theta^2} \cdot \frac{\theta^3}{3} = \frac{2}{3}\theta$$
**2. Wariancja $Var(2X + 120)$:**
Korzystamy z własności wariancji: $Var(aX + b) = a^2 Var(X)$. W tym przypadku:
$$Var(2X + 120) = 2^2 \cdot Var(X) = 4 \cdot Var(X)$$
Aby to obliczyć, potrzebujemy $Var(X)$. Najpierw obliczamy drugi moment $E[X^2]$:
$$E[X^2] = \int_0^\theta x^2 \cdot \frac{2x}{\theta^2} \, dx = \frac{2}{\theta^2} \int_0^\theta x^3 \, dx = \frac{2}{\theta^2} \left[ \frac{x^4}{4} \right]_0^\theta = \frac{\theta^2}{2}$$
Obliczamy $Var(X) = E[X^2] - (E[X])^2$:
$$Var(X) = \frac{\theta^2}{2} - \left(\frac{2}{3}\theta\right)^2 = \frac{\theta^2}{2} - \frac{4\theta^2}{9} = \frac{9\theta^2 - 8\theta^2}{18} = \frac{\theta^2}{18}$$
Wracamy do szukanej wielkości:
$$Var(2X + 120) = 4 \cdot \frac{\theta^2}{18} = \frac{2\theta^2}{9}$$
**3. Mediana $Me$:**
Szukamy takiej wartości $Me$, dla której $F_X(Me) = 0.5$:
$$\frac{Me^2}{\theta^2} = \frac{1}{2} \implies Me^2 = \frac{\theta^2}{2} \implies Me = \frac{\theta}{\sqrt{2}} = \frac{\sqrt{2}}{2}\theta$$

### d) Prawdopodobieństwo $P(X^2 > 1)$

Nierówność $X^2 > 1$ jest równoważna $X > 1$ (ponieważ $X \ge 0$).
$$P(X > 1) = 1 - P(X \leq 1) = 1 - F_X(1)$$
Rozwiązanie zależy od wartości parametru $\theta$:

-   Jeśli $\theta \leq 1$, to $X$ przyjmuje wartości tylko z przedziału $[0, \theta]$, więc $P(X > 1) = 0$.

-   Jeśli $\theta > 1$, to $1$ należy do nośnika funkcji, więc:
    $$P(X > 1) = 1 - \frac{1^2}{\theta^2} = 1 - \frac{1}{\theta^2}$$

**Odpowiedź:**
$$P(X^2 > 1) =
\begin{cases}
0, & \text{gdy } \theta \leq 1, \\[6pt]
1 - \dfrac{1}{\theta^2}, & \text{gdy } \theta > 1.
\end{cases}$$
