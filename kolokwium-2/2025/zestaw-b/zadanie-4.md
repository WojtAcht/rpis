---
tytul: "Przedział ufności dla czasu operacji"
punkty: 25
rozdzialy: [inference/confint]
---

W pewnym zakładzie produkcyjnym kontroluje się czas (w minutach) potrzebny na wykonanie standardowej operacji. Przyjmuje się, że czasy wykonywania tej operacji w populacji mają rozkład normalny. Wylosowano próbę **$n = 14$** pomiarów, dla których uzyskano $\bar{x} = 12{,}8$ min przy $s = 3{,}2$ min.

1.  **Opisz sposób konstrukcji $95\%$ przedziału ufności dla $\mu$**, tj.:

    -   jaka statystyka jest wykorzystywana do budowy przedziału i jaki jest jej rozkład, (5 pkt),

    -   dlaczego wybieramy akurat tę statystykę w tej sytuacji, (5 pkt),

    -   opisz sposób konstrukcji (jeśli wprowadzasz zmienne, wyjaśnij co oznaczają) (10 pkt).

2.  Ktoś interpretuje wynik następująco:

    > “Z prawdopodobieństwem $95\%$ prawdziwa wartość średniej $\mu$ leży w wyznaczonym przedziale.”

    Czy ta interpretacja jest **prawdziwa**? Uzasadnij. (5 pkt).

## Rozwiązanie

1.  **Opis sposobu konstrukcji $95\%$ przedziału ufności dla $\mu$.**

    a)  **Jaka statystyka jest wykorzystywana do budowy przedziału, jaki jest jej rozkład.**

        Ponieważ $\sigma$ jest nieznane, wykorzystujemy statystykę t-Studenta:
        $$T=\frac{\bar{X}-\mu}{S/\sqrt{n}},$$
        gdzie $\bar{X}$ jest średnią z próby, a $S$ jest odchyleniem standardowym z próby.
        Przy założeniu normalności populacji mamy
        $$T\sim t_{n-1}.$$

    b)  **Dlaczego wybieramy akurat tę statystykę w tej sytuacji?**

        Ponieważ zakładamy, że populacja ma rozkład normalny, to średnia z próby $\bar X$ jest naturalnym estymatorem $\mu$.
        Kluczowe jest jednak to, że nie znamy odchylenia standardowego populacji $\sigma$, więc w standaryzacji musimy je zastąpić
        odchyleniem z próby $S$. Wtedy statystyka
        $$T=\frac{\bar{X}-\mu}{S/\sqrt{n}}$$
        ma *dokładnie* rozkład t-Studenta z $n-1$ stopniami swobody (przy założeniu normalności populacji). Dlatego
        przedział ufności dla $\mu$ konstruujemy w oparciu o kwantyle rozkładu $t_{n-1}$.

        Gdyby $\sigma$ było znane, to moglibyśmy użyć statystyki
        $$Z=\frac{\bar{X}-\mu}{\sigma/\sqrt{n}}\sim\mathcal{N}(0,1),$$
        ale w tym zadaniu $\sigma$ jest nieznane, więc poprawnym wyborem jest $t$-statystyka.

    c)  **Krok 1: “wycięcie” środkowych $95\%$ rozkładu statystyki.**

        Ponieważ
        $$T\sim t_{n-1},$$
        to dla $\alpha=0{,}05$ zachodzi
        $$\mathbb{P}\!\left(t_{\alpha/2,\;n-1}\le T\le t_{1-\alpha/2,\;n-1}\right)=1-\alpha=0{,}95,$$
        czyli wprost
        $$\mathbb{P}\!\left(t_{0.025,\;n-1}\le T\le t_{0.975,\;n-1}\right)=0{,}95.$$

        Przypomnijmy, że $t_{p,\;n-1}$ oznacza **kwantyl rzędu $p$** rozkładu $t_{n-1}$, tzn.
        $$\mathbb{P}\!\left(T\le t_{0.025,\;n-1}\right)=0{,}025,
        \qquad
        \mathbb{P}\!\left(T\le t_{0.975,\;n-1}\right)=0{,}975.$$
        Stąd
        $$\mathbb{P}\!\left(T\ge t_{0.975,\;n-1}\right)=1-0{,}975=0{,}025.$$
        Zatem prawdopodobieństwo znalezienia się $T$ pomiędzy tymi kwantylami wynosi
        $$\mathbb{P}\!\left(t_{0.025,\;n-1}\le T\le t_{0.975,\;n-1}\right)
        =1-0{,}025-0{,}025=0{,}95.$$

        Ponieważ rozkład $t_{n-1}$ jest symetryczny względem zera, kwantyle spełniają zależność
        $$t_{0.025,\;n-1}=-t_{0.975,\;n-1}.$$
        W konsekwencji równoważnie możemy zapisać
        $$\mathbb{P}\!\left(-t_{0.975,\;n-1}\le T\le t_{0.975,\;n-1}\right)=0{,}95.$$

        **Krok 2: podstawienie definicji $T$ i rozwiązanie nierówności względem $\mu$.**
        Z kroku 2 mamy:
        $$\mathbb{P}\!\left(
        -t_{0.975,\;n-1}
        \le
        \frac{\bar{X}-\mu}{S/\sqrt{n}}
        \le
        t_{0.975,\;n-1}
        \right)=0{,}95.$$
        Mnożymy nierówność przez dodatnią liczbę $S/\sqrt{n}$ (nie zmienia znaku nierówności):
        $$\mathbb{P}\!\left(
        -t_{0.975,\;n-1}\frac{S}{\sqrt{n}}
        \le
        \bar{X}-\mu
        \le
        t_{0.975,\;n-1}\frac{S}{\sqrt{n}}
        \right)=0{,}95.$$
        Teraz przekształcamy tak, aby w środku był parametr $\mu$.
        $$\mathbb{P}\!\left(
        \bar{X}- t_{0.975,\;n-1}\frac{S}{\sqrt{n}}
        \le
        \mu
        \le
        \bar{X}+ t_{0.975,\;n-1}\frac{S}{\sqrt{n}}
        \right)=0{,}95.$$
        Z definicji oznacza to, że
        $$\boxed{
        CI_{0.95}(\mu)=
        \left(
        \bar{X}- t_{0.975,\;n-1}\frac{S}{\sqrt{n}},
        \;
        \bar{X}+ t_{0.975,\;n-1}\frac{S}{\sqrt{n}}
        \right)
        }$$
        jest $95\%$ przedziałem ufności dla $\mu$.

2.  **Ocena interpretacji:**

    > “Z prawdopodobieństwem $95\%$ prawdziwa wartość średniej $\mu$ leży w wyznaczonym przedziale.”

    Ta interpretacja **nie jest poprawna** w sensie częstotliwościowym. Parametr $\mu$ jest stałą (nie jest zmienną losową), więc nie ma sensu mówić, że “z prawdopodobieństwem $95\%$ $\mu$ leży w przedziale” *po* wyznaczeniu konkretnego przedziału na podstawie danych.

    Poprawna interpretacja jest następująca:
    gdybyśmy wielokrotnie losowali próby tej samej liczebności $n=14$ i za każdym razem konstruowali przedział ufności tą samą metodą, to **w $95\%$ takich prób** otrzymany przedział zawierałby prawdziwą wartość $\mu$, gdzie losowość dotyczy **przedziału** (bo zależy od losowej próby), a nie parametru $\mu$.
