---
tytul: "Różnica symetryczna zdarzeń"
punkty: 15
rozdzialy: [calculus/probability]
---

Niech $A$ i $B$ będą zdarzeniami losowymi.
Różnicą symetryczną $A \triangle B$ nazywamy zdarzenie zachodzące wtedy, gdy zachodzi $A$ lub zachodzi $B$, ale nie oba jednocześnie (w logice odpowiada to alternatywie wykluczającej *XOR*). Korzystając z definicji i własności prawdopodobieństwa, wykaż, że:

1.  $P(A \triangle B) \;=\; P(A) + P(B) - 2P(A \cap B)$

2.  $P(A) - P(B) \leq P(A \triangle B)$

## Rozwiązanie

### Dowód punktu 1.

Z definicji różnicy symetrycznej wiemy, że:
$$A \triangle B = (A \setminus B) \cup (B \setminus A)$$
Zbiory te są rozłączne, tzn. $(A \setminus B) \cap (B \setminus A) = \emptyset$, więc:
$$P(A \triangle B) = P(A \setminus B) + P(B \setminus A) \tag{1}$$
Rozważmy teraz prawdopodobieństwo różnicy zbiorów. Wiemy, że $A = (A \setminus B) \cup (A \cap B)$, gdzie składniki sumy są rozłączne. Stąd:
$$P(A) = P(A \setminus B) + P(A \cap B)$$
Przekształcając powyższe równanie, otrzymujemy wzory na prawdopodobieństwa różnic:
$$\begin{aligned}
    P(A \setminus B) &= P(A) - P(A \cap B) \\
    P(B \setminus A) &= P(B) - P(A \cap B)
\end{aligned}$$
Podstawiając te zależności do równania (1), otrzymujemy tezę:
$$\begin{aligned}
    P(A \triangle B) &= \bigl( P(A) - P(A \cap B) \bigr) + \bigl( P(B) - P(A \cap B) \bigr) \\
    &= P(A) + P(B) - 2P(A \cap B)
\end{aligned}$$
$\square$

### Dowód punktu 2.

Zauważmy, że iloczyn zdarzeń jest podzbiorem każdego z nich, tzn. $(A \cap B) \subseteq B$. Z własności prawdopodobieństwa wynika, że:
$$P(A \cap B) \leq P(B)$$
Mnożąc tę nierówność obustronnie przez $-2$, otrzymujemy:
$$-2P(A \cap B) \geq -2P(B)$$
Dodajmy teraz do obu stron wyrażenie $P(A) + P(B)$:
$$P(A) + P(B) - 2P(A \cap B) \geq P(A) + P(B) - 2P(B)$$
Lewa strona to dokładnie $P(A \triangle B)$ (na podstawie punktu 1.), natomiast prawa może być uproszczona:
$$P(A \triangle B) \geq P(A) - P(B)$$
Co kończy dowód.
$\square$
