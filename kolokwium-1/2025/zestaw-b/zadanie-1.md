---
tytul: "Dwie partie szachów z nieznanym rywalem"
punkty: 25
rozdzialy: [calculus/bayes, calculus/conditional-independence]
---

Planujesz rozegrać dwie partie szachów z nieznanym wcześniej przeciwnikiem. Zakładamy, że Twój rywal reprezentuje jeden z trzech poziomów: początkujący, średniozaawansowany lub mistrzowski, przy czym każdy z tych poziomów jest jednakowo prawdopodobny.
Twoje szanse na wygraną w pojedynczej partii wynoszą odpowiednio: $90\%$ (przeciwko początkującemu), $50\%$ (przeciwko średniozaawansowanemu) oraz $30\%$ (przeciwko mistrzowi).

1.  Oblicz prawdopodobieństwo wygrania pierwszej partii.

2.  Załóżmy, że pierwsza partia zakończyła się Twoją wygraną. Oblicz, jakie jest teraz prawdopodobieństwo, że Twój przeciwnik jest mistrzem. Jakie jest prawdopodobieństwo wygrania również drugiej partii, wiedząc że pierwsza zakończyła się wygraną? (Przyjmij założenie, że przy ustalonym poziomie umiejętności przeciwnika wyniki poszczególnych partii są od siebie niezależne).

3.  Wyjaśnij różnicę między założeniem, że wyniki partii są *niezależne*, a założeniem, że są one *niezależne warunkowo* względem poziomu umiejętności przeciwnika. Które z tych założeń jest w tym kontekście bardziej uzasadnione i dlaczego?

## Rozwiązanie

### Oznaczenia

Niech $H_i$ oznacza zdarzenie, że przeciwnik reprezentuje $i$-ty poziom umiejętności:

-   $H_1$: Początkujący, $P(W|H_1) = 0,9$

-   $H_2$: Średniozaawansowany, $P(W|H_2) = 0,5$

-   $H_3$: Mistrz, $P(W|H_3) = 0,3$

Z treści zadania wiemy, że prawdopodobieństwa a priori są równe:
$$P(H_1) = P(H_2) = P(H_3) = \frac{1}{3}$$
Niech $W_k$ oznacza zdarzenie polegające na wygraniu $k$-tej partii ($k=1, 2$).

### Ad 1. Prawdopodobieństwo wygrania pierwszej partii

Korzystamy ze wzoru na prawdopodobieństwo całkowite:
$$P(W_1) = \sum_{i=1}^{3} P(W_1 | H_i) P(H_i)$$
$$P(W_1) = 0,9 \cdot \frac{1}{3} + 0,5 \cdot \frac{1}{3} + 0,3 \cdot \frac{1}{3} = \frac{1}{3}(1,7) = \frac{17}{30} \approx 0,5667$$

### Ad 2. Prawdopodobieństwo po wygranej pierwszej partii

**a) Prawdopodobieństwo, że przeciwnik jest mistrzem:**\
Stosujemy wzór Bayesa dla zdarzenia $H_3$ pod warunkiem $W_1$:
$$P(H_3 | W_1) = \frac{P(W_1 | H_3) P(H_3)}{P(W_1)}$$
$$P(H_3 | W_1) = \frac{0,3 \cdot \frac{1}{3}}{\frac{1,7}{3}} = \frac{0,1}{1,7/3} = \frac{0,3}{1,7} = \frac{3}{17} \approx 0,1765$$
**b) Prawdopodobieństwo wygrania drugiej partii (metoda z definicji):**\
Alternatywnie korzystamy z definicji prawdopodobieństwa warunkowego:
$$P(W_2 | W_1) = \frac{P(W_1 \cap W_2)}{P(W_1)}$$
Mianownik $P(W_1) = \frac{17}{30}$ obliczyliśmy w punkcie 1.\
Obliczamy licznik (prawdopodobieństwo wygrania obu partii), korzystając z założenia, że przy ustalonym przeciwniku wyniki są niezależne:
$$P(W_1 \cap W_2) = \sum_{i=1}^{3} P(W_1 | H_i) P(W_2 | H_i) P(H_i)$$
$$P(W_1 \cap W_2) = (0,9)^2 \cdot \frac{1}{3} + (0,5)^2 \cdot \frac{1}{3} + (0,3)^2 \cdot \frac{1}{3}$$
$$P(W_1 \cap W_2) = \frac{1}{3} (0,81 + 0,25 + 0,09) = \frac{1,15}{3} = \frac{115}{300} = \frac{23}{60}$$
Podstawiamy do wzoru głównego:
$$P(W_2 | W_1) = \frac{\frac{23}{60}}{\frac{17}{30}} = \frac{23}{60} \cdot \frac{30}{17} = \frac{23}{2 \cdot 17} = \frac{23}{34} \approx 0,6765$$

### Ad 3. Niezależność a niezależność warunkowa

-   **Niezależność warunkowa** (względem poziomu $H$) oznacza, że $P(W_2 | W_1, H) = P(W_2 | H)$. Wiedza o wyniku pierwszej partii nie zmienia prawdopodobieństwa wygranej w drugiej, *jeśli wiemy z kim gramy*. Jest to założenie o stałości umiejętności.

-   **Niezależność (bezwarunkowa)** oznaczałaby, że $P(W_2 | W_1) = P(W_2)$. Jak pokazaliśmy w obliczeniach ($0,6765 \neq 0,5667$), zdarzenia te **nie są niezależne**. Wygrana w pierwszej partii dostarcza informacji o przeciwniku (zwiększa prawdopodobieństwo, że jest słaby), co zmienia naszą ocenę szans w kolejnej grze.

W tym kontekście uzasadnione jest jedynie założenie o **niezależności warunkowej**. Wyniki partii są skorelowane poprzez poziom gracza.
