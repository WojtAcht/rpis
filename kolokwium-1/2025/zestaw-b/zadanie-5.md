---
tytul: "Kwadrat przesuniętej zmiennej jednostajnej"
punkty: 20
rozdzialy: [rv/real/functions]
---

Zmienna losowa $X$ ma rozkład jednostajny $U(-2, 3)$.
Wyznacz rozkład zmiennej losowej $Y = (X-1)^2$.

## Rozwiązanie

### 1. Rozkład zmiennej losowej $X$

Zmienna losowa $X$ ma rozkład jednostajny na przedziale $(-2, 3)$. Jej gęstość prawdopodobieństwa wyraża się wzorem:
$$f_X(x) = \begin{cases} 
        \frac{1}{3 - (-2)} = \frac{1}{5} & \text{dla } x \in (-2, 3) \\
        0 & \text{dla } x \notin (-2, 3)
    \end{cases}$$

### 2. Wyznaczenie zbioru wartości zmiennej $Y$

Funkcja transformująca to $g(x) = (x-1)^2$.

-   Wierzchołek paraboli znajduje się w punkcie $x=1$, który należy do przedziału $(-2, 3)$, zatem minimalna wartość to $Y_{\min} = 0$.

-   Sprawdzamy krańce przedziału:

    -   dla $x = 3$: $y = (3-1)^2 = 4$

    -   dla $x = -2$: $y = (-2-1)^2 = 9$

Zatem zmienna $Y$ przyjmuje wartości z przedziału $[0, 9)$.

### 3. Wyznaczenie gęstości $f_Y(y)$ metodą dystrybuanty

Z definicji dystrybuanty:
$$F_Y(y) = P((X-1)^2 \le y) = P(1-\sqrt{y} \le X \le 1+\sqrt{y})$$
$$F_Y(y) = F_X(1+\sqrt{y}) - F_X(1-\sqrt{y})$$
Różniczkujemy powyższe równanie obustronnie względem $y$, aby otrzymać gęstość $f_Y(y)$. Korzystamy z pochodnej funkcji złożonej oraz faktu, że $F_X'(x) = f_X(x)$:

$$\begin{aligned}
    f_Y(y) = \frac{d}{dy} F_Y(y) &= \frac{d}{dy} \left( F_X(1+\sqrt{y}) - F_X(1-\sqrt{y}) \right) \\[1em]
    &= f_X(1+\sqrt{y}) \cdot (1+\sqrt{y})' - f_X(1-\sqrt{y}) \cdot (1-\sqrt{y})' \\[1em]
    &= f_X(1+\sqrt{y}) \cdot \frac{1}{2\sqrt{y}} - f_X(1-\sqrt{y}) \cdot \left( -\frac{1}{2\sqrt{y}} \right) \\[1em]
    &= \frac{1}{2\sqrt{y}} \left[ f_X(1+\sqrt{y}) + f_X(1-\sqrt{y}) \right]
\end{aligned}$$

### 4. Analiza przedziałów dla $Y$

Musimy sprawdzić, kiedy argumenty $f_X$ należą do przedziału $(-2, 3)$. Do rozważenia mamy 2 argumenty: $(1+\sqrt{y})$ i $(1-\sqrt{y})$:. Pierwszy przypadek $(1+\sqrt{y})$:

$$-2 < 1 + \sqrt{y} < 3$$
$$-3 < \sqrt{y} < 2$$
$$0 < y < 4$$
Drugi przypadek $(1-\sqrt{y})$:
$$-2 < 1 - \sqrt{y} < 3$$
$$-3 < - \sqrt{y} < 2$$
$$-2 < \sqrt{y} < 3$$
$$0 < y < 9$$
Z ogólnego wzoru
$$f_Y(y) = \frac{1}{2\sqrt{y}} \left[ f_X(1+\sqrt{y}) + f_X(1-\sqrt{y}) \right]$$
korzystamy teraz z faktu, że
$$f_X(x) = \begin{cases}
        \frac{1}{5}, & x \in (-2,3),\\
        0, & x \notin (-2,3).
    \end{cases}$$
Z analizy przedziałów mamy:

-   dla $0 < y < 4$ zachodzi jednocześnie
    $$1+\sqrt{y} \in (-2,3) \quad \text{oraz} \quad 1-\sqrt{y} \in (-2,3),$$
    więc
    $$f_X(1+\sqrt{y}) = \frac{1}{5}, \qquad f_X(1-\sqrt{y}) = \frac{1}{5},$$
    a zatem
    $$f_Y(y) = \frac{1}{2\sqrt{y}}\left( \frac{1}{5} + \frac{1}{5} \right)
            = \frac{1}{2\sqrt{y}} \cdot \frac{2}{5}
            = \frac{1}{5\sqrt{y}}.$$

-   dla $4 \le y < 9$ mamy
    $$1+\sqrt{y} \notin (-2,3) \quad (\text{bo } 1+\sqrt{y} \ge 3),$$
    więc
    $$f_X(1+\sqrt{y}) = 0,$$
    natomiast wciąż
    $$1-\sqrt{y} \in (-2,3),$$
    czyli
    $$f_X(1-\sqrt{y}) = \frac{1}{5}.$$
    Wtedy
    $$f_Y(y) = \frac{1}{2\sqrt{y}}\left( 0 + \frac{1}{5} \right)
            = \frac{1}{10\sqrt{y}}.$$

-   ponadto z części 2 wiemy, że zmienna $Y$ przyjmuje wartości w przedziale $[0,9]$, więc na zewnątrz tego przedziału gęstość również jest równa zero.

### Odpowiedź

Gęstość rozkładu zmiennej losowej $Y$:
$$f_Y(y) = \begin{cases} 
        \frac{1}{5\sqrt{y}} & \text{dla } y \in (0, 4) \\[1em]
        \frac{1}{10\sqrt{y}} & \text{dla } y \in [4, 9) \\[1em]
        0 & \text{w p.p.}
    \end{cases}$$
