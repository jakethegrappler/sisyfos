# Sisyfos

## Cíl projektu
Cílem tohoto projektu je vytvořit jednoduchou hru nazvanou "Sisyphos", inspirovanou řeckou mytologií. Hráč ovládá postavu (Sisyfa), která před sebou tlačí balvan do kopce. Hra má několik klíčových funkcí, včetně pohybu postavy, přehrávání originálního soundtracku od českého producenta „petrstxvx“, dynamického generování schodů, animovaného pozadí a podpory offline režimu pomocí Service Workeru.

## Postup
1. **Plánování a návrh**: Definování herní mechaniky a základní struktury aplikace.
2. **Nastavení HTML a CSS**: Vytvoření základního layoutu a stylování hry.
3. **Implementace herní logiky**: Vytvoření herní logiky pomocí JavaScriptu, včetně pohybu postavy, generování schodů a animací. Vše až na pozadí je zrealizováno v Canvasu.
4. **Přidání pozadí**: Vytvoření dynamického pozadí pomocí SVG.
5. **Přidání LocalStorage**: Implementace LocalStorage pro ukládání stavu zvuku (mute/unmute) mezi jednotlivými relacemi hry. Přidána funkčnost pro načtení a uložení stavu zvuku při spuštění hry a při jeho změně pomocí klávesy "m".
6. **Podpora offline režimu**: Implementace Service Workeru pro cachování zdrojů a umožnění offline přístupu ke hře.
7. **Testování a ladění**: Testování hry a opravování chyb.
8. **Dokončení a dokumentace**: Přidání komentářů do kódu a sepsání dokumentace.

## Popis funkčnosti
Hráč ovládá postavu pomocí klávesy mezerník pro tlačení balvanu a klávesy Enter pro spuštění hry. Hra generuje schody, které představují cestu do kopce. Pokud hráč nezvládne mačkat mezerník dost rychle, spadne z kopce a hra se resetuje. Hra také obsahuje animované pozadí, které se pohybuje spolu s postavou.

Aplikace podporuje offline režim (Service Worker), takže hráči mohou hrát hru i bez připojení k internetu. Aktuální status lze pozorovat v levém horním rohu hry. Díky LocalStorage si prohlížeč zapamatuje, jestli si hráč posledně vypnul zvuk. Po spuštění hry se „šipkou zpět“ může hráč vrátit na úvodní obrazovku.
