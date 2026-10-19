---
tytul: "Miara probabilistyczna i nierówność dla P(A ∩ B)"
punkty: 15
rozdzialy: [calculus/probability]
---

-   Podaj definicję miary probabilistycznej oraz przynajmniej 4 z (podanych na wykładzie) jej podstawowych własności.

-   Udowodnij, że dla dowolnych dwóch zdarzeń $A, B \in \Sigma$ spełniona jest nierówność:
    $$P(A, B) \geq P(A) + P(B) - 1$$

## Rozwiązanie

Nasza teza:
$$P(A, B) \geq P(A) + P(B) - 1,$$
jest równoważna:
$$1 \geq P(A) + P(B) - P(A, B).$$

### Krok 1: Przekształcenie nierówności

Korzystamy z własności:
$$P(A) + P(B) - P(A, B) = P(A \cup B).$$
Z powyższego wynika, że teza jest równoważna nierówności:
$$1 \geq P(A \cup B).$$

### Krok 2: Własność prawdopodobieństwa

Wiemy, że dla dowolnego zdarzenia $C \in \Sigma$ zachodzi:
$$1 \geq P(C),$$
co implikuje, że:
$$1 \geq P(A \cup B),$$
i tym samym kończy dowód.
