---
tytul: "Dwie monety w kapeluszu"
punkty: 25
rozdzialy: [calculus/bayes, calculus/conditional-independence, rv/real/well-known]
---

W kapeluszu znajdują się dwie monety, których nie można odróżnić wzrokiem. Jedna z nich jest uczciwa (prawdopodobieństwo orła $1/2$), a druga obciążona (prawdopodobieństwo orła $1/4$). Losujemy z kapelusza jedną monetę – nazwijmy ją monetą $C$.

1.  Rzucono dwukrotnie monetą $C$ i za każdym razem wypadł orzeł. Jakie jest prawdopodobieństwo, że wylosowana moneta jest uczciwa?

2.  Czy zdarzenia: „w pierwszym rzucie monetą $C$ wypadł orzeł” oraz „w drugim rzucie monetą $C$ wypadł orzeł” są niezależne? Uzasadnij odpowiedź.

3.  Wracamy do momentu wyboru monety (zapominając o wynikach z punktu a). Jakie jest prawdopodobieństwo uzyskania dokładnie $3$ orłów w $5$ rzutach wylosowaną monetą $C$?

## Rozwiązanie

**Oznaczenia:**

-   $M_U$ – wylosowano monetę uczciwą, $P(M_U) = \frac{1}{2}$, $P(O|M_U) = \frac{1}{2}$.

-   $M_O$ – wylosowano monetę obciążoną, $P(M_O) = \frac{1}{2}$, $P(O|M_O) = \frac{1}{4}$.

a)  **Prawdopodobieństwo, że moneta jest uczciwa (Tw. Bayesa)**

    Niech $2O$ oznacza wyrzucenie dwóch orłów. Obliczamy $P(M_U|2O)$.

    Z prawdopodobieństwa całkowitego:
    $$P(2O) = P(2O|M_U)P(M_U) + P(2O|M_O)P(M_O)$$
    $$P(2O) = \left(\frac{1}{2}\right)^2 \cdot \frac{1}{2} + \left(\frac{1}{4}\right)^2 \cdot \frac{1}{2} = \frac{1}{8} + \frac{1}{32} = \frac{5}{32}$$

    Z tw. Bayesa:
    $$P(M_U|2O) = \frac{P(2O|M_U)P(M_U)}{P(2O)} = \frac{\frac{1}{8}}{\frac{5}{32}} = \frac{1}{8} \cdot \frac{32}{5} = \mathbf{\frac{4}{5}}$$

b)  **Niezależność zdarzeń w dwóch rzutach**

    Niech $A$ – orzeł w 1. rzucie, $B$ – orzeł w 2. rzucie.

    -   $P(A \cap B) = P(2O) = \frac{5}{32}$ (z punktu a).

    -   $P(A) = P(O|M_U)P(M_U) + P(O|M_O)P(M_O) = \frac{1}{2}\cdot\frac{1}{2} + \frac{1}{4}\cdot\frac{1}{2} = \frac{3}{8}$.

    -   Z symetrii $P(B) = P(A) = \frac{3}{8}$.

    Sprawdzamy warunek niezależności $P(A \cap B) \stackrel{?}{=} P(A) \cdot P(B)$:
    $$\frac{5}{32} \neq \left(\frac{3}{8}\right)^2 \quad \Rightarrow \quad \frac{10}{64} \neq \frac{9}{64}$$
    **Odpowiedź:** Zdarzenia **nie są niezależne**.

c)  **3 orły w 5 rzutach (Schemat Bernoulliego)**

    Niech $S_5$ oznacza liczbę orłów w 5 rzutach. Szukamy $P(S_5=3)$.
    Korzystamy ze wzoru na prawdopodobieństwo całkowite, gdzie $P_n(k) = \binom{n}{k}p^k(1-p)^{n-k}$:

    $$P(S_5=3) = P(S_5=3|M_U)P(M_U) + P(S_5=3|M_O)P(M_O)$$

    $$P(S_5=3|M_U) = \binom{5}{3}\left(\frac{1}{2}\right)^5 = 10 \cdot \frac{1}{32} = \frac{5}{16}$$

    $$P(S_5=3|M_O) = \binom{5}{3}\left(\frac{1}{4}\right)^3\left(\frac{3}{4}\right)^2 = 10 \cdot \frac{1}{64} \cdot \frac{9}{16} = \frac{45}{512}$$

    Podstawiamy:
    $$P(S_5=3) = \frac{5}{16} \cdot \frac{1}{2} + \frac{45}{512} \cdot \frac{1}{2} = \frac{5}{32} + \frac{45}{1024} = \frac{160 + 45}{1024} = \mathbf{\frac{205}{1024}}$$
