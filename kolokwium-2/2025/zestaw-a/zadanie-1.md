---
tytul: "Gęstość cx pod parabolą"
punkty: 30
rozdzialy: [rv/vector/distributions, rv/vector/independence-cond, rv/vector/moments]
---

Niech dwuwymiarowa zmienna losowa $(X, Y)$ ma rozkład ciągły o gęstości:
$$f(x,y) = 
\begin{cases} 
cx & \text{dla } 0 \le x \le 1, \,\, x^2 \le y \le 1, \\
0 & \text{w przeciwnym przypadku,}
\end{cases}$$
gdzie $c \in \mathbb{R_+}$ jest pewną stałą.

a)  **Wyznacz wartość stałej $c$** (5 pkt).

b)  **Wyznacz gęstości brzegowe** (5 pkt).

c)  **Wyznacz gęstości warunkowe** (5 pkt).

d)  **Wyznacz $\mathbb P\!\left(Y>\tfrac12\mid X=\tfrac12\right)$** (5 pkt).

e)  **Oblicz kowariancję $\text{Cov}(X, Y)$** (5 pkt).

f)  **Opisz sposób wyznaczenia współczynnika korelacji $\rho_{X,Y}$**,\
    rozpisując wzory i całki niezbędne do jego obliczenia (5 pkt).

## Rozwiązanie

Dany jest rozkład ciągły $(X,Y)$ o gęstości
$$f(x,y)=
\begin{cases}
cx & \text{dla } 0\le x\le 1,\;\; x^2\le y\le 1,\\
0 & \text{w p.p.}
\end{cases}$$
Obszar, gdzie $f>0$ ma postać
$$D=\{(x,y): 0\le x\le 1,\; x^2\le y\le 1\}.$$

a)  **Wyznaczenie stałej $c$.**

    Warunek normalizacji:
    $$\iint_{\mathbb{R}^2} f(x,y)\,dx\,dy=1
    \quad\Longleftrightarrow\quad
    \int_{0}^{1}\int_{x^2}^{1} cx\,dy\,dx=1.$$
    Liczymy całki:
    $$\int_{0}^{1}\int_{x^2}^{1} cx\,dy\,dx
    =\int_{0}^{1} cx\,(1-x^2)\,dx
    =c\int_{0}^{1}(x-x^3)\,dx
    =c\left(\frac12-\frac14\right)=\frac{c}{4}.$$
    Zatem $\frac{c}{4}=1$, czyli
    $$\boxed{c=4.}$$

b)  **Gęstości brzegowe.**

    **Uwaga (częsty błąd!)** Przy wyznaczaniu gęstości brzegowych trzeba **koniecznie podać poprawne przedziały**, tzn. dla jakich $x$ (lub $y$) dana gęstość jest dodatnia. Za brak przedziałów odejmowałem 1 punkt.

    **Gęstość brzegowa $X$.**
    Dla ustalonego $x$ gęstość jest niezerowa wtedy i tylko wtedy, gdy $0\le x\le 1$ oraz $y\in[x^2,1]$. Zatem
    $$f_X(x)=\int_{-\infty}^{\infty} f(x,y)\,dy=\int_{x^2}^{1} 4x\,dy
    =4x(1-x^2),$$
    czyli
    $$\boxed{
    f_X(x)=
    \begin{cases}
    4x(1-x^2), & 0\le x\le 1,\\
    0, & \text{w p.p.}
    \end{cases}}$$

    **Gęstość brzegowa $Y$.**
    Dla ustalonego $y$ warunki $0\le x\le 1$ i $x^2\le y\le 1$ oznaczają:
    $$0\le y\le 1
    \quad\text{oraz}\quad
    0\le x\le \sqrt{y}.$$
    Stąd
    $$f_Y(y)=\int_{-\infty}^{\infty} f(x,y)\,dx=\int_{0}^{\sqrt{y}} 4x\,dx
    =4\cdot \frac{x^2}{2}\Big|_{0}^{\sqrt{y}}=2y,$$
    czyli
    $$\boxed{
    f_Y(y)=
    \begin{cases}
    2y, & 0\le y\le 1,\\
    0, & \text{w p.p.}
    \end{cases}}$$

c)  **Gęstości warunkowe.**

    **Uwaga (częsty błąd!)** Tak jak w punkcie (b), **trzeba podać warunki/przedziały dla obu zmiennych**.

    **Gęstość $Y|X=x$.**
    Dla $0<x<1$ mamy $f_X(x)=4x(1-x^2)>0$ oraz
    $$f_{Y|X=x}(y)=\frac{f(x,y)}{f_X(x)}
    =\frac{4x}{4x(1-x^2)}=\frac{1}{1-x^2} \quad\text{dla } y\in[x^2,1].$$

    **Gęstość $X|Y=y$.**
    Dla $0<y\le 1$ mamy $f_Y(y)=2y>0$. Ponadto nośnik w $x$ to $0\le x\le \sqrt{y}$. Zatem
    $$f_{X|Y=y}(x)=\frac{f(x,y)}{f_Y(y)}=\frac{4x}{2y}=\frac{2x}{y}
    \quad\text{dla } 0\le x\le \sqrt{y}.$$

d)  **Obliczenie $\mathbb{P}\!\left(Y>\frac12\mid X=\frac12\right)$.**

    Najpierw ustalamy **nośnik warunkowy** $Y|X=\tfrac12$.
    Jeśli $X=\tfrac12$, to z warunku nośnika $x^2\le y\le 1$ dostajemy
    $$\left(\frac12\right)^2\le y\le 1 \quad\Longleftrightarrow\quad \frac14\le y\le 1.$$
    **Uwaga (częsty błąd!)** Trzeba uwzględnić dla jakiego przedziału gęstość warunkowa jest niezerowa i w ten sposób uzasadnić dobrane granie w całce. Za brak uzasadnienia odejmowałem 1 punkt.

    Korzystamy z gęstości warunkowej z (c):
    $$f_{Y|X=1/2}(y)=\frac{1}{1-(1/2)^2}=\frac{1}{1-\frac14}=\frac{4}{3},
    \quad y\in\left[\frac14,1\right].$$
    Zatem
    $$\mathbb{P}\!\left(Y>\frac12\mid X=\frac12\right)
    =\int_{1/2}^{1} \frac{4}{3}\,dy
    =\frac{4}{3}\left(1-\frac12\right)=\frac{2}{3}.$$
    Ostatecznie
    $$\boxed{\mathbb{P}\!\left(Y>\frac12\mid X=\frac12\right)=\frac{2}{3}.}$$

e)  **Kowariancja $\mathrm{Cov}(X,Y)$.**

    $$\mathrm{Cov}(X,Y)=\mathbb{E}[XY]-\mathbb{E}[X]\mathbb{E}[Y].$$

    **1) Liczymy $\mathbb{E}[X]$.**
    $$\mathbb{E}[X]=\int_0^1\int_{x^2}^{1} x\cdot 4x\,dy\,dx
    =\int_0^1 4x^2(1-x^2)\,dx
    =4\int_0^1 (x^2-x^4)\,dx
    =4\left(\frac13-\frac15\right)=\frac{8}{15}.$$

    **2) Liczymy $\mathbb{E}[Y]$.** Wygodnie z gęstości brzegowej:
    $$\mathbb{E}[Y]=\int_0^1 y\,f_Y(y)\,dy=\int_0^1 y\cdot 2y\,dy
    =2\int_0^1 y^2\,dy=\frac{2}{3}.$$

    **3) Liczymy $\mathbb{E}[XY]$.**
    $$\mathbb{E}[XY]=\int_0^1\int_{x^2}^{1} xy\cdot 4x\,dy\,dx
    =\int_0^1 4x^2\left(\int_{x^2}^{1} y\,dy\right)\,dx.$$
    $$\int_{x^2}^{1} y\,dy=\frac{y^2}{2}\Big|_{x^2}^{1}=\frac{1-x^4}{2},$$
    więc
    $$\mathbb{E}[XY]=\int_0^1 4x^2\cdot \frac{1-x^4}{2}\,dx
    =2\int_0^1 (x^2-x^6)\,dx
    =2\left(\frac13-\frac17\right)=\frac{8}{21}.$$

    Zatem
    $$\mathrm{Cov}(X,Y)=\frac{8}{21}-\frac{8}{15}\cdot\frac{2}{3}
    =\frac{8}{21}-\frac{16}{45}
    =\frac{120}{315}-\frac{112}{315}
    =\frac{8}{315}.$$
    $$\boxed{\mathrm{Cov}(X,Y)=\frac{8}{315}.}$$

f)  **Opis sposobu wyznaczenia współczynnika korelacji $\rho_{X,Y}$.**

    Współczynnik korelacji:
    $$\rho_{X,Y}=\frac{\mathrm{Cov}(X,Y)}{\sqrt{\mathrm{Var}(X)\,\mathrm{Var}(Y)}}.$$
    A więc potrzebujemy:
    $$\mathrm{Cov}(X,Y)=\mathbb{E}[XY]-\mathbb{E}[X]\mathbb{E}[Y],
    \quad
    \mathrm{Var}(X)=\mathbb{E}[X^2]-(\mathbb{E}[X])^2,
    \quad
    \mathrm{Var}(Y)=\mathbb{E}[Y^2]-(\mathbb{E}[Y])^2.$$

    **Krok 1: policzyć wartości oczekiwane** (podpunkt e):
    $$\mathbb{E}[X]=\int_{0}^{1}\int_{x^2}^{1} x\,f(x,y)\,dy\,dx,
    \qquad
    \mathbb{E}[Y]=\int_{0}^{1}\int_{x^2}^{1} y\,f(x,y)\,dy\,dx,$$
    $$\mathbb{E}[XY]=\int_{0}^{1}\int_{x^2}^{1} xy\,f(x,y)\,dy\,dx.$$

    **Krok 2: policzyć drugie momenty**:
    $$\mathbb{E}[X^2]=\int_{0}^{1}\int_{x^2}^{1} x^2\,f(x,y)\,dy\,dx
    \quad\text{(również można: } \mathbb{E}[X^2]=\int_0^1 x^2 f_X(x)\,dx\text{)},$$
    $$\mathbb{E}[Y^2]=\int_{0}^{1}\int_{x^2}^{1} y^2\,f(x,y)\,dy\,dx
    \quad\text{(również można: } \mathbb{E}[Y^2]=\int_0^1 y^2 f_Y(y)\,dy\text{)}.$$

    **Krok 3: złożyć wszystko we wzór na korelację**:
    $$\rho_{X,Y}
    =\frac{\mathbb{E}[XY]-\mathbb{E}[X]\mathbb{E}[Y]}
    {\sqrt{\big(\mathbb{E}[X^2]-(\mathbb{E}[X])^2\big)\big(\mathbb{E}[Y^2]-(\mathbb{E}[Y])^2\big)}}.$$
