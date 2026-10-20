---
tytul: "Gęstość cx²y na trójkącie"
punkty: 30
rozdzialy: [rv/vector/distributions, rv/vector/independence-cond]
---

Niech zmienna losowa dwuwymiarowa $(X, Y)$ ma rozkład ciągły o gęstości
$$f(x, y) =
\begin{cases}
    c x^2 y & \text{jeśli } x < 0, \, y < 1, \, x + y > 0, \\
    0 & \text{w przeciwnym wypadku},
\end{cases}$$
dla pewnej stałej $c \in \mathbb{R}$. Wyznacz wartość $c$. Wyznacz obie gęstości brzegowe i obie gęstości warunkowe. Oblicz prawdopodobieństwo
$$P\left(X > -\frac{1}{4} \, \middle| \, Y = \frac{1}{3} \right),$$
zbadaj czy zmienne $X$ i $Y$ są niezależne.

## Rozwiązanie

### 1. Wyznaczenie stałej $c$

Warunki na $(x,y)$ to:
$$x < 0,\quad y < 1,\quad x + y > 0 \;\;\Longleftrightarrow\;\; y > -x.$$
Ponadto, jeśli $x \le -1$, to $-x \ge 1$, co koliduje z warunkiem $y < 1$.
Dlatego faktycznie dziedzina $(x,y)$ zawęża się do
$$-1 < x < 0, 
\quad -x \le y < 1.$$
Funkcja gęstości musi się całkować do 1 po całej dziedzinie:
$$\iint_{\mathcal{D}} f(x,y)\,dx\,dy 
=\iint_{\mathcal{D}} c\,x^2\,y \,dx\,dy = 1.$$
Wygodniej całkować w kolejności $dy\,dx$. Dla ustalonego $x\in(-1,0)$ zmienna $y$ przebiega $[\,-x,\,1]$. Zatem
$$\int_{x=-1}^{0} \int_{y=-x}^{1} c \, x^2\,y \,dy\,dx = 1.$$
Liczymy wartość tej podwójnej całki:
$$\int_{-x}^{1} y \,dy 
= \left[ \frac{y^2}{2} \right]_{-x}^{1}
= \frac{1^2}{2} \;-\; \frac{(-x)^2}{2}
= \frac12 - \frac{x^2}{2}
= \frac12\bigl(1 - x^2\bigr).$$
Zatem
$$\int_{-1}^{0} c\,x^2 \left[\frac12\bigl(1 - x^2\bigr)\right] dx 
= c \cdot \frac12 \int_{-1}^{0} x^2 \bigl(1 - x^2\bigr)\,dx 
= c \cdot \frac12 \int_{-1}^{0} \bigl(x^2 - x^4\bigr)\,dx.$$
Obliczamy kolejne całki:
$$\int_{-1}^{0} x^2 \,dx = \left[\frac{x^3}{3}\right]_{-1}^{0} = 0 - \left(-\frac{1}{3}\right) = \frac{1}{3},$$
$$\int_{-1}^{0} x^4 \,dx = \left[\frac{x^5}{5}\right]_{-1}^{0} = 0 - \left(-\frac{1}{5}\right) = \frac{1}{5}.$$
Wobec tego
$$\int_{-1}^{0} \bigl(x^2 - x^4\bigr)\,dx 
= \frac{1}{3} - \frac{1}{5}
= \frac{5}{15} - \frac{3}{15}
= \frac{2}{15}.$$
Zatem
$$c \cdot \frac12 \cdot \frac{2}{15} = c \cdot \frac{1}{15} = 1
\quad\Longrightarrow\quad
c = 15.$$
$$\boxed{ c = 15. }$$

### 2. Gęstości brzegowe $f_X(x)$ oraz $f_Y(y)$

#### Gęstość brzegowa $f_X(x)$

Definicja:
$$f_X(x) = \int_{-\infty}^{\infty} f(x,y)\,dy.$$
Z uwagi na wsparcie gęstości, dla ustalonego $x\in(-1,0)$ mamy $y \in [-x,1]$. Wtedy:
$$f_X(x) 
= \int_{y=-x}^{1} 15\,x^2\,y \,dy
= 15\,x^2 \int_{-x}^{1} y\,dy$$
Jak wyżej wyliczyliśmy:
$$\int_{-x}^{1} y\,dy 
= \frac12 \bigl(1 - x^2\bigr).$$
Zatem
$$f_X(x) = 15\,x^2 \cdot \frac12 \bigl(1 - x^2\bigr)
= \frac{15}{2}\,\bigl(x^2 - x^4\bigr),
\quad x\in(-1,0),$$
a dla $x\notin(-1,0)$ mamy $f_X(x)=0$.
Zapiszmy w formie zwarta:
$$\boxed{
f_X(x) 
= \begin{cases}
\dfrac{15}{2}\,\bigl(x^2 - x^4\bigr), & -1 < x < 0,\\
0, & \text{w.p.w.}
\end{cases}
}$$

#### Gęstość brzegowa $f_Y(y)$

Definicja:
$$f_Y(y) = \int_{-\infty}^{\infty} f(x,y)\,dx.$$
Z warunków na dziedzinę:
$$-1 < x < 0, \quad x + y > 0 \;\Longleftrightarrow\; x > -y,
\quad \text{oraz} \; y < 1.$$
Aby móc znaleźć granice całkowania względem $x$ dla ustalonego $y$, zauważmy, że:
$$x \text{ musi być w przedziale }(-1,0)\cap(-y,\infty).$$
*Kiedy* to nie jest pusty zbiór?

-   Jeśli $y < 0$, to $-y > 0$. Wymaganie $x > -y$ oznacza $x> \text{(liczba dodatnia)}$, a to nie przecina się z warunkiem $x<0$. Zatem dla $y<0$ dziedzina jest pusta.

-   Jeśli $0 \le y<1$, wówczas $-y\le 0$. Przedział $(-y, \infty)$ przecięty z $(-1,0)$ daje $\max(-1,-y)$, ale tu $-y \le 0$.
    W rzeczywistości, przy $0\le y<1$, warunek $-1<x<0$ i $x>-y$ sprowadza się do $-y < x < 0$.

Dodatkowo, w warunkach zadania jest $y<1$. Dla $y\ge 1$ nic nie wnosi (gęstość jest zerowa).
Zatem faktycznie:
$$0 < y < 1
\quad \Longrightarrow\quad
x \in (-y,\,0).$$
Wtedy
$$f_Y(y) 
= \int_{x=-y}^{0} 15\,x^2\,y \,dx 
= 15\,y \int_{-y}^{0} x^2\,dx.$$
Obliczamy:
$$\int_{-y}^{0} x^2\,dx 
= \left[\frac{x^3}{3}\right]_{-y}^{0}
= 0 - \left(-\frac{y^3}{3}\right)
= \frac{y^3}{3}.$$
Zatem
$$f_Y(y) = 15\,y \cdot \frac{y^3}{3}
= 5\,y^4,
\quad 0<y<1.$$
Poza tym zakresem $f_Y(y)=0$.
Ostatecznie:
$$\boxed{
f_Y(y) 
= \begin{cases}
5\,y^4, & 0<y<1, \\
0, & \text{w.p.w.}
\end{cases}
}$$

### 3. Gęstości warunkowe

#### Gęstość $f_{X\mid Y}(x \mid y)$

Z definicji:
$$f_{X\mid Y}(x \mid y) 
= \frac{f(x,y)}{f_Y(y)}.$$
Dla $y\in(0,1)$ oraz $-y<x<0$ mamy $f(x,y) = 15\,x^2\,y$, a $f_Y(y)=5\,y^4$. Stąd
$$f_{X\mid Y}(x\mid y)
= \frac{15\,x^2\,y}{5\,y^4}
= 3 \,\frac{x^2}{y^3},
\quad \text{dla } -y < x < 0.$$
Poza tym przedziałem (w $x$ lub $y$) mamy $f_{X\mid Y}(x\mid y)=0$.
Kontrola, czy się dobrze normalizuje (skrótowo):
$$\int_{x=-y}^0 3\,\frac{x^2}{y^3}\,dx 
= \frac{3}{y^3} \int_{-y}^0 x^2\,dx 
= \frac{3}{y^3}\cdot \frac{y^3}{3} = 1.$$

#### Gęstość $f_{Y\mid X}(y \mid x)$

Z definicji:
$$f_{Y\mid X}(y \mid x) 
= \frac{f(x,y)}{f_X(x)}.$$
Dla $x\in(-1,0)$ oraz $-x<y<1$ mamy $f(x,y) = 15\,x^2\,y$, a
$$f_X(x) 
= \frac{15}{2}\,\bigl(x^2 - x^4\bigr).$$
Zatem
$$f_{Y\mid X}(y\mid x) 
= \frac{15\,x^2\,y}{\tfrac{15}{2}(x^2 - x^4)}
= \frac{2\,x^2\,y}{x^2 - x^4}
= 2\,y \,\frac{x^2}{x^2 (1 - x^2)}
= \frac{2\,y}{1 - x^2},
\quad \text{dla } -x<y<1.$$
Poza tym zakresem jest 0.
Można sprawdzić normalizację:
$$\int_{y=-x}^{1} \frac{2\,y}{1 - x^2}\,dy = \frac{2}{1 - x^2}\int_{-x}^{1} y\,dy = \ldots = 1.$$

### 4. Obliczenie prawdopodobieństwa $\displaystyle P\bigl(X>-\tfrac{1}{4}\mid Y=\tfrac{1}{3}\bigr)$

Korzystamy z gęstości warunkowej $f_{X\mid Y}(x\mid y)$. Dla $y=\tfrac13$ mamy:
$$f_{X\mid Y}\!\Bigl(x \;\Big\vert\; y=\tfrac{1}{3}\Bigr) 
= 3\,\frac{x^2}{\bigl(\tfrac13\bigr)^3} 
= 3\,x^2 \cdot 27 
= 81\,x^2,
\quad \text{dla } -\tfrac13 < x < 0.$$
(Sygnalizujemy, że dla $Y=\tfrac13$, dziedzina $X$ to przedział $\bigl(-\tfrac13,0\bigr)$.)

Chcemy
$$P\!\Bigl(X>-\tfrac{1}{4} \;\Big\vert\; Y=\tfrac{1}{3}\Bigr) 
= \int_{x=-\tfrac14}^{\,0} 81\,x^2 \,dx.$$
Obliczamy:
$$\int_{-1/4}^0 81\,x^2\,dx
= 81 \int_{-1/4}^0 x^2\,dx
= 81 \left[\frac{x^3}{3}\right]_{-1/4}^{0}
= 81 \Bigl(0 - \bigl(-\tfrac{1}{4}\bigr)^3/3\Bigr).$$
Zauważmy, że $\bigl(-\tfrac{1}{4}\bigr)^3 = -\tfrac{1}{64}$. Wobec tego:
$$-\bigl(-\tfrac{1}{4}\bigr)^3 = \frac{1}{64}, 
\quad \text{więc} \quad 
-\bigl(-\tfrac{1}{4}\bigr)^3/3 = \frac{1}{64}\cdot \frac{1}{3} = \frac{1}{192}.$$
Zatem
$$81 \cdot \frac{1}{192} 
= \frac{81}{192}
= \frac{81}{192} = \frac{27}{64}$$
(po skróceniu przez 3).

Otrzymujemy więc:
$$\boxed{
P\!\Bigl(X > -\tfrac14 \;\Big\vert\; Y=\tfrac13\Bigr) 
= \frac{27}{64}.
}$$

### 5. Niezależność zmiennych $X$ i $Y$

Zmienna losowa $X$ i $Y$ byłyby niezależne, gdyby zachodziło:
$$f(x,y) \;=\; f_X(x)\,f_Y(y) 
\quad \text{dla każdej pary }(x,y).$$
Tymczasem:
$$f(x,y) = 15\,x^2\,y 
\quad\text{(w obszarze)},$$
natomiast
$$f_X(x)\,f_Y(y) 
= \Bigl[\tfrac{15}{2}\,(x^2 - x^4)\Bigr]
  \,\bigl[5\,y^4\bigr]
= \tfrac{75}{2}\,(x^2 - x^4)\,y^4.$$
Te wyrażenia (w obszarze gdzie gęstość jest dodatnia) nie są sobie równe,
co widać już po samym kształcie: jedno zależy od $y$ w sposób liniowy ($y$) a drugie od $y$ w sposób $\,y^4$.
Również sama dziedzina $\{\,x+y>0,\dots\}$ to nie jest prostokąt (czyli nie dzieli się na niezależne przedziały $\{x\in A\}$ i $\{y\in B\}$).
$$\boxed{
\text{Zmienne }X\text{ i }Y\text{ nie są niezależne.}
}$$

### Podsumowanie

-   Wyznaczona stała normalizacyjna: $\displaystyle c = 15$.

-   Gęstości brzegowe:
    $$f_X(x) 
    = 
    \begin{cases}
    \dfrac{15}{2}\,\bigl(x^2 - x^4\bigr), & -1<x<0,\\[6pt]
    0, & \text{inaczej},
    \end{cases}
    \qquad
    f_Y(y) 
    = 
    \begin{cases}
    5\,y^4, & 0<y<1,\\
    0, & \text{inaczej}.
    \end{cases}$$

-   Gęstości warunkowe:
    $$f_{X \mid Y}(x\mid y) = 
    \begin{cases}
    3\,\frac{x^2}{y^3}, & -y<x<0,\ 0<y<1,\\
    0, & \text{inaczej},
    \end{cases}
    \quad
    f_{Y \mid X}(y\mid x) = 
    \begin{cases}
    \dfrac{2\,y}{1 - x^2}, & -x<y<1,\ -1<x<0,\\
    0, & \text{inaczej}.
    \end{cases}$$

-   Obliczone prawdopodobieństwo warunkowe:
    $$P\!\Bigl(X > -\tfrac14 \;\Big\vert\; Y=\tfrac13\Bigr) 
    = \frac{27}{64}.$$

-   Zmienna $X$ i $Y$ nie są niezależne.
