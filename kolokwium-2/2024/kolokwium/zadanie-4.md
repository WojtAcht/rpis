---
tytul: "Przedział ufności dla czasu życia żarówek"
punkty: 15
rozdzialy: [inference/confint]
---

Zmierzono czas życia, czyli czas działania, próby losowej 16 żarówek o ustalonej mocy.
Średni czas życia w próbie wyniósł $3000$ godzin, natomiast odchylenie standardowe $20$ godzin.
Przy założeniu, że czas życia żarówki jest zmienną losową o rozkładzie normalnym, podać przedział ufności dla wartości średniej tego rozkładu na poziomie ufności $0.9$. Opisz sposób konstrukcji przedziału ufności w tym przypadku.

## Rozwiązanie

W zadaniu mamy do dyspozycji:
$$n = 16,\quad
\overline{X} = 3000 \text{ (średnia z próby)},\quad
s = 20 \text{ (odchylenie standardowe z próby)},\quad
1 - \alpha = 0{,}90 \quad (\text{poziom ufności}).$$
Z założenia, że rozkład czasu życia żarówek jest normalny, a odchylenie standardowe w populacji nie jest znane, do konstrukcji przedziału ufności dla średniej wykorzystujemy rozkład *t-Studenta*.

### Wyjaśnienie doboru statystyki

Ponieważ nie znamy odchylenia standardowego w populacji, a jedynie jego estymator $s$ wyznaczony z próby, stosujemy statystykę:
$$T = \frac{\overline{X} - \mu}{s / \sqrt{n}},$$
która ma rozkład *t-Studenta* z $n-1$ stopniami swobody (tj. w naszym przypadku $df = 16 - 1 = 15$).
W przypadku, gdybyśmy znali odchylenie standardowe w populacji (oznaczane zwykle $\sigma$), wtedy moglibyśmy wykorzystać rozkład normalny (statystykę $Z$).
Tutaj jednak musimy użyć rozkładu $t$, ponieważ $\sigma$ jest nieznane, a $n$ jest stosunkowo małe.

### Wzór na przedział ufności

Przedział ufności $100(1-\alpha)\%$ dla średniej $\mu$ w przypadku nieznanego $\sigma$ i małej próby ma postać:
$$\left(\,\overline{X} - t_{\alpha/2,\,n-1}\,\frac{s}{\sqrt{n}},\;\;
       \overline{X} + t_{\alpha/2,\,n-1}\,\frac{s}{\sqrt{n}} \right),$$
gdzie $t_{\alpha/2,\,n-1}$ to *kwantyl* (wartość krytyczna) rozkładu t-Studenta o $n-1$ stopniach swobody, wyznaczony tak, aby w obu ogonach łącznie było $\alpha$, czyli w jednym ogonie jest $\alpha/2$.

### Obliczenie wartości krytycznej

Dla poziomu ufności $1-\alpha = 0{,}90$, otrzymujemy $\alpha = 0{,}10$, a więc $\alpha/2 = 0{,}05$.
Szukamy zatem kwantyla $t_{0,05, 15}$, odpowiadającego $15$ stopniom swobody i granicy $0,95$ rozkładu.
Z tablic rozkładu t-Studenta otrzymujemy w przybliżeniu:
$$t_{\alpha/2,\,15} = t_{0,05,\,15} \approx 1{,}753.$$

### Obliczenie szerokości przedziału

$$\text{Błąd standardowy} = \frac{s}{\sqrt{n}} = \frac{20}{\sqrt{16}} = \frac{20}{4} = 5.$$
$$\text{Szerokość półprzedziału ufności} 
= t_{\alpha/2,\,15}\,\frac{s}{\sqrt{n}}
= 1{,}753 \cdot 5
\approx 8{,}765.$$

### Konstrukcja przedziału ufności

$$\left(\,\overline{X} - t_{\alpha/2,\,15}\,\frac{s}{\sqrt{n}},
\quad \overline{X} + t_{\alpha/2,\,15}\,\frac{s}{\sqrt{n}}\right) 
= \left(3000 - 8{,}765,\; 3000 + 8{,}765\right).$$
$$\approx (2991{,}235,\; 3008{,}765).$$

Zatem przedział ufności $90\%$ dla wartości średniej czasu życia żarówki to:
$$\boxed{
(2991{,}24,\; 3008{,}76).
}$$
