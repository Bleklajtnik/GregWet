# GregWET – strona lecznicy weterynaryjnej

Nowa strona [weterynarz.krakow.pl](https://weterynarz.krakow.pl/). Wszystkie adresy podstron są takie same jak na starej stronie WordPress, więc pozycje w Google zostają.

## Jak uruchomić na komputerze

Potrzebny jest [Node.js](https://nodejs.org/) w wersji 18 lub nowszej (wersja LTS ze strony).

**Windows:** kliknij dwukrotnie `podglad.bat`. Otworzy się przeglądarka z adresem http://localhost:4321. Nie zamykaj czarnego okienka, dopóki oglądasz stronę.

**Mac / Linux:** w terminalu, w folderze projektu:

```
node src/build.mjs
node src/serve.mjs
```

i otwórz http://localhost:4321.

Strony nie da się oglądać, otwierając `site/index.html` dwuklikiem, bo linki do podstron (`/oferta/`, `/kontakt/`…) działają tylko przez serwer.

## Gdzie co jest

| Co | Gdzie |
| --- | --- |
| Gotowa strona do wgrania na serwer | `site/` (cały folder) |
| Treść strony głównej | `src/pages/home.html` |
| Opinie w karuzeli | `src/content/opinie.json` |
| Treść podstron (przeniesiona ze starej strony) | `src/content/*.json` |
| Nagłówek, stopka, menu, lista usług i zespołu | `src/build.mjs` |
| Wygląd | `site/styles.css` |
| Film w hero, karuzela, status „otwarte teraz” | `site/main.js` |

Po każdej zmianie w `src/` trzeba przebudować stronę: `node src/build.mjs` (albo po prostu uruchomić `podglad.bat`).

`src/extract.mjs` służył jednorazowo do przeniesienia treści ze starej strony i nie jest już potrzebny.

## Publikacja

Na serwer wgrywa się zawartość folderu `site/` w miejsce obecnego WordPressa.
