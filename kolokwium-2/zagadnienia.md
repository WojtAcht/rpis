1.  Funkcje tworzące momenty.\
    [[Def. 7.11](skrypt:rv/real/moments#def-mgf) funkcja tworząca momenty ·
    [Tw. 7.8](skrypt:rv/real/moments#thm-mgf-properties) własności ·
    [Def. 12.9](skrypt:rv/vector/moments#def-nd-mgf) przypadek wielowymiarowy ·
    [Tw. 12.7](skrypt:rv/vector/moments#thm-nd-mgf-properties) własności]{.refs}

2.  Rozkłady omawiane na wykładzie, m.in. dwumianowy, geometryczny, Poissona, jednostajny, wykładniczy, normalny, gamma, $\chi^2$, $t$ Studenta, $F$ i ich własności.\
    [[§8.1](skrypt:rv/real/well-known#rozkłady-dyskretne) rozkłady dyskretne ·
    [§8.2](skrypt:rv/real/well-known#rozkłady-ciągłe) rozkłady ciągłe, w tym [§8.2.3](skrypt:rv/real/well-known#sec-gamma) gamma i [§8.2.4](skrypt:rv/real/well-known#sec-chi-square) $\chi^2$ ·
    [§18.2](skrypt:inference/confint#rozkład-t-studenta) rozkład $t$ ·
    [§18.5](skrypt:inference/confint#rozkład-f) rozkład $F$ ·
    [Tw. 14.3](skrypt:rv/vector/functions#thm-known-distributions-sums) sumy niezależnych zmiennych o znanych rozkładach]{.refs}

3.  Próba losowa, statystyki, średnia i wariancja w prostej próbie losowej, rozkład średniej, estymatory.\
    [[Def. 16.4](skrypt:inference/intro#def-inference-random-sample) prosta próba losowa ·
    [Def. 16.7](skrypt:inference/intro#def-inference-statistic) statystyka ·
    [Def. 16.8](skrypt:inference/intro#def-inference-sample-average) średnia ·
    [Def. 16.9](skrypt:inference/intro#def-inference-sample-variance) wariancja w próbie ·
    [§17.1](skrypt:inference/estimators#obciążenie-estymatora) obciążenie estymatora ·
    [§17.2](skrypt:inference/estimators#własności-estymatora-overlinex) własności $\overline{X}$ ·
    [§17.3](skrypt:inference/estimators#estymatory-wariancji) estymatory wariancji ·
    [Tw. 17.1](skrypt:inference/estimators#thm-estimators-mse-bias-variance) błąd średniokwadratowy]{.refs}

4.  Naiwny klasyfikator bayesowski.\
    [[Def. 11.7](skrypt:rv/vector/independence-cond#def-rvar-conditional-independence) warunkowa niezależność zmiennych ·
    [Tw. 11.9](skrypt:rv/vector/independence-cond#thm-rvar-conditional-independence-property) i wnioski 11.2–11.3 ·
    [§11.5.1](skrypt:rv/vector/independence-cond#naiwny-klasyfikator-bayesowski) naiwny klasyfikator bayesowski]{.refs}

5.  Zmienne losowe wielowymiarowe (rozkład łączny, rozkłady brzegowe, rozkłady warunkowe, niezależność, kowariancja, współczynnik korelacji, macierz kowariancji, momenty i ich własności).\
    [[Def. 10.1](skrypt:rv/vector/distributions#def-joint-distribution) rozkład łączny ·
    [Def. 10.5](skrypt:rv/vector/distributions#def-marginal-distribution) rozkład brzegowy ·
    [Tw. 10.3](skrypt:rv/vector/distributions#thm-nd-discrete-marginal), [Tw. 10.4](skrypt:rv/vector/distributions#thm-nd-continuous-marginal) obliczanie rozkładów brzegowych ·
    [Def. 11.1](skrypt:rv/vector/independence-cond#def-rvar-independence) niezależność ·
    [Tw. 11.1](skrypt:rv/vector/independence-cond#thm-rvar-independence-characterization) charakteryzacja niezależności ·
    [Def. 11.4](skrypt:rv/vector/independence-cond#def-conditional-distribution) rozkład warunkowy ·
    [Def. 11.5](skrypt:rv/vector/independence-cond#def-conditional-pdf) gęstość warunkowa ·
    [Def. 11.6](skrypt:rv/vector/independence-cond#def-conditional-pmf) warunkowa funkcja prawdopodobieństwa ·
    [Def. 12.1](skrypt:rv/vector/moments#def-expval-nd) wartość oczekiwana ·
    [Tw. 12.1](skrypt:rv/vector/moments#thm-nd-expval-properties) własności ·
    [Def. 12.3](skrypt:rv/vector/moments#def-nd-moment) momenty ·
    [Def. 12.4](skrypt:rv/vector/moments#def-covariance) kowariancja ·
    [Def. 12.5](skrypt:rv/vector/moments#def-correlation) współczynnik korelacji ·
    [Tw. 12.2](skrypt:rv/vector/moments#thm-covariance-variance-properties) własności kowariancji i wariancji ·
    [Tw. 12.3](skrypt:rv/vector/moments#thm-correlation-properties) własności korelacji ·
    [Def. 12.6](skrypt:rv/vector/moments#def-covariance-matrix) macierz kowariancji ·
    [Tw. 12.4](skrypt:rv/vector/moments#thm-covariance-matrix-properties) jej własności]{.refs}

6.  Prawa wielkich liczb, Centralne Twierdzenie Graniczne.\
    [[Def. 15.1–15.3](skrypt:rv/convergence#rodzaje-zbieżności) rodzaje zbieżności ·
    [Tw. 15.2–15.5](skrypt:rv/convergence#prawa-wielkich-liczb) prawa wielkich liczb ·
    [Wn. 15.1](skrypt:rv/convergence#cor-big-numbers-average-weak) słabe i [Wn. 15.2](skrypt:rv/convergence#cor-big-numbers-average-strong) mocne PWL ·
    [Tw. 15.6](skrypt:rv/convergence#thm-clt-clt) twierdzenie Lindeberga-Lévy'ego ·
    [Wn. 15.3](skrypt:rv/convergence#cor-clt-clt) przybliżenie rozkładem normalnym]{.refs}

7.  Metoda największej wiarygodności, metoda momentów.\
    [[Def. 17.3](skrypt:inference/estimators#def-estimators-likelihood) funkcja wiarygodności ·
    [Def. 17.4](skrypt:inference/estimators#metoda-konstrukcji-estymatora) estymator największej wiarygodności ·
    [Prop. 17.1](skrypt:inference/estimators#prp-estimators-mle-properties) własności MLE ·
    [§17.8](skrypt:inference/estimators#metoda-momentów) metoda momentów]{.refs}

8.  Konstrukcja przedziałów ufności.\
    [[Def. 18.1](skrypt:inference/confint#def-confint-continuous) przedział ufności ·
    [§18.1.1](skrypt:inference/confint#schemat-konstrukcji) schemat konstrukcji ·
    [§18.3](skrypt:inference/confint#przedział-ufności-dla-wartości-oczekiwanej) dla wartości oczekiwanej ·
    [§18.4](skrypt:inference/confint#przedział-ufności-dla-różnicy-wartości-oczekiwanych) dla różnicy wartości oczekiwanych ·
    [§18.6](skrypt:inference/confint#sec-confint-variance) dla wariancji ·
    [§18.7](skrypt:inference/confint#sec-confint-variance-comparison) dla ilorazu wariancji ·
    [§18.8.1](skrypt:inference/confint#sec-confint-proportion) dla proporcji]{.refs}

9.  Testy statystyczne. W przypadku testów warto spojrzeć na funkcje języka R: `t.test`, `chisq.test`, `var.test`.\
    [[Def. 19.1](skrypt:inference/tests#def-tests-hypothesis) hipoteza statystyczna ·
    [Def. 19.2](skrypt:inference/tests#def-tests-statistic-critical-set) test i zbiór krytyczny ·
    [Def. 19.3](skrypt:inference/tests#def-tests-error-1-kind), [Def. 19.4](skrypt:inference/tests#def-tests-error-2-kind) błędy I i II rodzaju ·
    [Def. 19.5](skrypt:inference/tests#def-tests-p-value) $p$-wartość ·
    [§19.2](skrypt:inference/tests#sec-tests-t) test $t$ ·
    [§19.3](skrypt:inference/tests#test-f) test $F$]{.refs}

10. Regresja liniowa.\
    [[Def. 20.3](skrypt:inference/regression#def-regression-linear-model) model zależności liniowej ·
    [Def. 20.4](skrypt:inference/regression#def-regression-simple-linear-regression) prosta regresja liniowa ·
    [Def. 20.5](skrypt:inference/regression#def-regression-least-squares) metoda najmniejszych kwadratów ·
    [Prop. 20.1](skrypt:inference/regression#prp-regression-basic-properties) podstawowe własności ·
    [§20.3](skrypt:inference/regression#wnioskowanie-w-modelu-prostej-regresji-liniowej) wnioskowanie w modelu regresji]{.refs}
