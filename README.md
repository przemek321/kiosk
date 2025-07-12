# Kiosk – Panel zarządzania urządzeniami TV

## Opis projektu

Aplikacja webowa do zarządzania urządzeniami (np. Raspberry Pi podłączonymi do TV) w sieci lokalnej. Pozwala na:
- Dodawanie, edycję i usuwanie urządzeń (nazwa, IP, screenshot)
- Podgląd statusu online/offline oraz ostatniego pingu
- Zdalną zmianę wyświetlanego URL na urządzeniu
- Wysyłanie polecenia restartu urządzenia
- Wykonywanie screenshotów
- Masowe akcje: ewakuacja (zmiana URL na stronę ewakuacyjną dla wszystkich), przywracanie poprzednich URL-i, screenshoty dla wszystkich

## Wymagania
- Node.js (zalecana najnowsza LTS)
- npm

## Instalacja
1. Sklonuj repozytorium:
   ```bash
   git clone https://github.com/przemek321/kiosk.git
   cd kiosk
   ```
2. Zainstaluj zależności:
   ```bash
   npm install
   ```

## Uruchomienie
- Standardowo:
  ```bash
  node app.js
  ```
- Lub jako proces w tle (np. na serwerze):
  ```bash
  pm2 start app.js --name Kiosk
  ```

Aplikacja domyślnie działa na porcie 3001: http://localhost:3001

## Struktura danych
- **devices.json** – lista urządzeń:
  ```json
  [
    {
      "id": "1712345678901",
      "name": "TV Sala 1",
      "ip": "192.168.1.10",
      "screenshot": "http://192.168.1.10:3000/public/scren123.png",
      "status": "Online",
      "lastPing": "2024-06-01 12:00:00",
      "currentUrl": "http://example.com"
    }
  ]
  ```
- **previousUrls.json** – mapa poprzednich URL-i dla funkcji ewakuacji:
  ```json
  {
    "1712345678901": "http://example.com"
  }
  ```

## Funkcjonalności
- **Panel główny**: lista urządzeń, status, screenshot, aktualny URL, akcje (edycja, restart, screenshot)
- **Dodawanie/edycja urządzenia**: nazwa, IP, opcjonalnie URL do screenshotu
- **Zmiana URL**: modal do zmiany wyświetlanej strony na urządzeniu
- **Ewakuacja**: masowa zmiana URL na stronę ewakuacyjną, potem możliwość przywrócenia poprzednich URL-i
- **Screenshoty**: pojedyncze i masowe

## Autor
Repozytorium: https://github.com/przemek321/kiosk

---
Masz pytania? Otwórz issue lub napisz do autora. 