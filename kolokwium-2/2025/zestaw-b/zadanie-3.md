---
tytul: "Moduły bateryjne w serwerowni"
punkty: 30
rozdzialy: [rv/convergence, rv/vector/functions, inference/estimators]
---

System zasilania awaryjnego w serwerowni składa się z $n$ niezależnych modułów bateryjnych. Moduły te włączają się sekwencyjnie – gdy pierwszy się wyczerpie, natychmiast startuje drugi, itd. Czas pracy każdego $i$-tego modułu (w godzinach) jest zmienną losową $X_i$ o rozkładzie wykładniczym z parametrem $\lambda = 2$: $X_i \sim \text{Exp}(2)$. Niech $T$ oznacza całkowity czas pracy systemu do momentu wyczerpania wszystkich baterii:
$$T = X_1 + X_2 + \dots + X_n$$

a)  Oblicz wartość oczekiwaną $\mathbb{E}[T]$ i wariancję $\text{Var}(T)$ (5 pkt).

b)  Korzystając z własności sumy niezależnych zmiennych losowych, podaj dokładny rozkład zmiennej $T$ (5 pkt).

c)  Załóżmy, że system składa się z $n=100$ modułów. Oszacuj prawdopodobieństwo, że system będzie działał dłużej niż 55 godzin. Powołaj się na odpowiednie twierdzenie (10 pkt).

d)  Traktując parametr $\lambda$ jako nieznany, a czasy pracy modułów $x_1,\dots,x_n$ jako zaobserwowane realizacje niezależnych zmiennych $X_1,\dots,X_n \sim \mathrm{Exp}(\lambda)$, wyznacz estymator największej wiarygodności $\hat\lambda_{\text{MLE}}$. (10 pkt)

## Rozwiązanie

Mamy $n$ niezależnych modułów, a czas pracy $i$-tego modułu:
$$X_i\sim \mathrm{Exp}(2),\qquad f_{X}(x)=2e^{-2x}\ (x\ge 0).$$
Całkowity czas pracy systemu:
$$T=X_1+\cdots+X_n.$$

a)  **Wartość oczekiwana i wariancja $T$.**

    Dla rozkładu wykładniczego $X\sim \mathrm{Exp}(\lambda)$ zachodzi:
    $$\mathbb{E}[X]=\frac{1}{\lambda},\qquad \mathrm{Var}(X)=\frac{1}{\lambda^2}.$$
    Stąd dla $\lambda=2$:
    $$\mathbb{E}[X_i]=\frac{1}{2},\qquad \mathrm{Var}(X_i)=\frac{1}{4}.$$
    Ponieważ $X_1,\dots,X_n$ są **niezależne**:
    $$\mathbb{E}[T]=\sum_{i=1}^n \mathbb{E}[X_i]=n\cdot \frac{1}{2}=\frac{n}{2},$$
    $$\mathrm{Var}(T)=\sum_{i=1}^n \mathrm{Var}(X_i)=n\cdot \frac{1}{4}=\frac{n}{4}.$$
    $$\boxed{\mathbb{E}[T]=\frac{n}{2},\qquad \mathrm{Var}(T)=\frac{n}{4}.}$$

b)  **Dokładny rozkład zmiennej $T$.**

    Najpierw zauważmy, że rozkład wykładniczy jest szczególnym przypadkiem rozkładu gamma:
    $$X\sim \mathrm{Exp}(\lambda)\quad \Longleftrightarrow \quad X\sim Gamma(1,\ \lambda),$$
    Zatem dla każdego $i$:
    $$X_i\sim Gamma(1,2).$$

    **Własność (suma niezależnych zmiennych gamma o tym samym parametrze rate).**
    Jeżeli $Y_1,\dots,Y_n$ są niezależne oraz
    $$Y_i\sim Gamma(s_i,\lambda)\quad \text{dla tego samego }\lambda,$$
    to
    $$\sum_{i=1}^n Y_i \sim Gamma\!\left(\sum_{i=1}^n s_i,\ \lambda\right).$$

    Stosując to do $T=\sum_{i=1}^n X_i$ z $s_i=1$ i $\lambda=2$:
    $$T\sim \Gamma\!\left(\sum_{i=1}^n 1,\ 2\right)=\Gamma(n,2).$$

    Gęstość $T$:
    $$f_T(t)=\frac{2^n}{\Gamma(n)}t^{n-1}e^{-2t},\qquad t> 0.$$
    $$\boxed{T\sim Gamma(n,2)}$$

c)  **Dla $n=100$: oszacowanie $\mathbb{P}(T>55)$.**

    Z punktu (a):
    $$\mu=\mathbb{E}[T]=\frac{100}{2}=50,\qquad \sigma^2=\mathrm{Var}(T)=\frac{100}{4}=25,\qquad \sigma=5.$$

    **Twierdzenie (Centralne Twierdzenie Graniczne).**
    Dla dużego $n$ zmienna
    $$\frac{T-\mu}{\sigma}\approx \mathcal{N}(0,1).$$
    Zatem:
    $$\mathbb{P}(T>55)=\mathbb{P}\!\left(\frac{T-50}{5}>\frac{55-50}{5}\right)
    \approx \mathbb{P}(Z>1),$$
    gdzie $Z\sim \mathcal{N}(0,1)$.
    $$\boxed{\mathbb{P}(Z>1)=1-\Phi(1)}$$

d)  **Estymator największej wiarygodności $\hat\lambda_{\mathrm{MLE}}$ dla $\lambda$ przy $X_i\sim \mathrm{Exp}(\lambda)$.**

    Załóżmy obserwacje $x_1,\dots,x_n$ niezależne oraz
    $$f(x\mid \lambda)=\lambda e^{-\lambda x}\ (x\ge 0),\qquad \lambda>0.$$

    **Krok 1: funkcja wiarygodności.**
    $$L(\lambda)=\prod_{i=1}^n \lambda e^{-\lambda x_i}
    =\lambda^n \exp\!\left(-\lambda\sum_{i=1}^n x_i\right).$$

    **Krok 2: log-wiarygodność.**
    $$\ell(\lambda)=\ln L(\lambda)=n\ln\lambda-\lambda\sum_{i=1}^n x_i.$$

    **Krok 3: pochodna i warunek konieczny.**
    $$\ell'(\lambda)=\frac{n}{\lambda}-\sum_{i=1}^n x_i.$$
    Równanie $\ell'(\lambda)=0$ daje:
    $$\frac{n}{\lambda}=\sum_{i=1}^n x_i
    \quad\Longrightarrow\quad
    \hat\lambda_{\mathrm{MLE}}=\frac{n}{\sum_{i=1}^n x_i}.$$

    **Krok 4: sprawdzenie maksimum.**
    $$\ell''(\lambda)=-\frac{n}{\lambda^2}<0\quad (\lambda>0),$$
    więc otrzymany punkt jest maksimum.

    $$\boxed{\hat\lambda_{\mathrm{MLE}}=\dfrac{n}{\sum_{i=1}^n x_i}=\dfrac{1}{\bar x}.}$$
