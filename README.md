# Crypto Pulse AI — starter

Polski PWA starter: GitHub Pages + Cloudflare Worker + RSS. Interfejs jest gotowy do uruchomienia, a Worker pobiera nagłówki z czterech źródeł. Wersja startowa klasyfikuje ważność i sentyment prostymi regułami — **to jeszcze nie jest generatywne AI**. Nie udaje analizy LLM.

## 1. Opublikuj frontend na GitHub Pages
1. Utwórz publiczne repozytorium `crypto-pulse-ai` na GitHub.
2. Wgraj zawartość tego folderu do głównego katalogu repozytorium.
3. Wejdź w **Settings → Pages**.
4. W sekcji Build and deployment wybierz **Deploy from a branch**, branch `main`, folder `/ (root)`.
5. Po publikacji otwórz adres `https://TWOJ_LOGIN.github.io/crypto-pulse-ai/`.

## 2. Wdróż darmowe API na Cloudflare
1. Utwórz konto Cloudflare i otwórz **Workers & Pages**.
2. Utwórz Worker o nazwie `crypto-pulse-api`.
3. Wklej zawartość `worker/index.js` do edytora Workera i kliknij Deploy.
4. W ustawieniach Workera → Triggers dodaj Cron: `*/15 * * * *`.
5. Sprawdź `https://NAZWA.twoj-login.workers.dev/api/news`.

## 3. Podłącz API do strony
W `app.js` ustaw:
`const API_URL = "https://NAZWA.twoj-login.workers.dev";`
Zapisz zmiany i wypchnij je do repozytorium.

## 4. Dodaj do iPhone'a
Otwórz opublikowaną stronę w Safari → Udostępnij → **Do ekranu początkowego** → Dodaj.

## Powiadomienia Web Push
iOS wspiera Web Push dla aplikacji dodanych do ekranu początkowego (iOS/iPadOS 16.4+). Sam przycisk zgody w tej wersji jest tylko przygotowanym elementem UI. Prawdziwe wysyłanie wymaga:
- pary kluczy VAPID,
- zapisania subskrypcji Push API po stronie serwera,
- szyfrowania i wysyłania wiadomości Web Push,
- trwałego magazynu subskrypcji (np. Cloudflare KV/D1),
- reguł deduplikacji, żeby nie spamować powtarzającymi się alertami.

## AI po polsku — następny etap
Obecny MVP nie wysyła treści do modelu AI i nie wymaga klucza API. Następny etap to podłączenie dostawcy z darmowym limitem (limity i warunki mogą się zmieniać), streszczenie artykułów po polsku, wykrywanie duplikatów i uzasadnienie wpływu. Klucz API musi być sekretem Workera, nigdy w `app.js`.

## Ważne
- RSS może zmieniać format lub ograniczać automatyczne pobieranie; źródła i warunki korzystania trzeba okresowo weryfikować.
- Ocena sentymentu w tym starterze jest heurystyczna, nie stanowi porady inwestycyjnej.
- GitHub Pages jest hostingiem statycznym, nie serwerem backendowym.
