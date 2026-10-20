---
tytul: "Funkcja tworząca momenty rozkładu Poissona"
punkty: 15
rozdzialy: [rv/real/moments, rv/real/well-known]
---

Dla zmiennej losowej $X\sim \mathrm{Pois}(\lambda)$:

a)  Wyznacz funkcję tworzącą momenty (MGF) (10 pkt).

b)  Korzystając z MGF oblicz wariancję $\mathrm{Var}(X)$ (5 pkt).

## Rozwiązanie

Dla zmiennej losowej $X\sim \mathrm{Pois}(\lambda)$ mamy
$$\mathbb{P}(X=k)=e^{-\lambda}\frac{\lambda^k}{k!},\quad k=0,1,2,\dots$$

a)  **Wyznaczenie funkcji tworzącej momenty (MGF).**

    Z definicji:
    $$M_X(t)=\mathbb{E}\!\left(e^{tX}\right)=\sum_{k=0}^{\infty} e^{tk}\,\mathbb{P}(X=k).$$
    Podstawiamy postać $\mathbb{P}(X=k)$:
    $$\begin{aligned}
    M_X(t)
    &=\sum_{k=0}^{\infty} e^{tk}\,e^{-\lambda}\frac{\lambda^k}{k!}
    = e^{-\lambda}\sum_{k=0}^{\infty}\frac{(\lambda e^t)^k}{k!}
    = e^{-\lambda}\exp(\lambda e^t)\\
    &=\exp\!\big(\lambda(e^t-1)\big).
    \end{aligned}$$
    Wyżej korzystamy z rozwinięcia wykładniczej w szereg potęgowy:
    $$e^u=\sum_{k=0}^{\infty}\frac{u^k}{k!}\quad \text{dla każdego } u\in\mathbb{R}.$$
    Zatem
    $$\boxed{M_X(t)=\exp\!\big(\lambda(e^t-1)\big).}$$

b)  **Obliczenie wariancji $\mathrm{Var}(X)$ z MGF.**

    Najpierw liczymy wartość oczekiwaną:
    $$\mathbb{E}(X)=M_X'(0).$$
    Liczymy pochodną:
    $$M_X(t)=\exp\!\big(\lambda(e^t-1)\big)
    \quad\Longrightarrow\quad
    M_X'(t)=\exp\!\big(\lambda(e^t-1)\big)\cdot \lambda e^t
    =\lambda e^t\,M_X(t).$$
    Podstawiamy $t=0$:
    $$M_X'(0)=\lambda e^0\,M_X(0)=\lambda\cdot 1\cdot \exp(\lambda(1-1))=\lambda.$$
    Stąd:
    $$\mathbb{E}(X)=\lambda.$$

    Do wyznaczenia wariancji korzystamy ze wzoru:

    $$\boxed{\mathrm{Var}(X)=\mathbb{E}(X^2)-(\mathbb{E}(X))^2}$$

    Z własności MGF:
    $$\mathbb{E}(X^2)=M_X''(0).$$
    Mamy już
    $$M_X'(t)=\lambda e^t\,M_X(t).$$
    Różniczkujemy drugi raz:
    $$\begin{aligned}
    M_X''(t)
    &=\frac{d}{dt}\big(\lambda e^t M_X(t)\big)
    =\lambda e^t M_X(t)+\lambda e^t M_X'(t).
    \end{aligned}$$
    Podstawiamy ponownie $M_X'(t)=\lambda e^t M_X(t)$:
    $$M_X''(t)=\lambda e^t M_X(t)+\lambda e^t\big(\lambda e^t M_X(t)\big)
    =\big(\lambda e^t+\lambda^2 e^{2t}\big)M_X(t).$$
    Podstawiamy $t=0$:
    $$M_X''(0)=\big(\lambda+\lambda^2\big)M_X(0)=\lambda+\lambda^2.$$
    Zatem
    $$\mathbb{E}(X^2)=\lambda+\lambda^2,\qquad \mathbb{E}(X)=\lambda,$$
    a więc
    $$\mathrm{Var}(X)=\mathbb{E}(X^2)-(\mathbb{E}(X))^2
    =(\lambda+\lambda^2)-\lambda^2=\lambda.$$
    Ostatecznie
    $$\boxed{\mathrm{Var}(X)=\lambda.}$$
