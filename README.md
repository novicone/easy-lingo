# easy-lingo

Aplikacja webowa do nauki angielskiego z interaktywnymi ćwiczeniami.

## ✨ Funkcjonalność

- System lekcji z losowymi ćwiczeniami (pisanie tłumaczeń, wybór tłumaczenia, łączenie par)
- System retry - poprawianie błędnych odpowiedzi
- Tracking postępów i statystyki (wynik, czas, accuracy)

## 🏗️ Struktura i Stack

Monorepo z trzema pakietami:

- **apps/web** — Frontend React
- **services/api** — Backend Fastify
- **packages/shared** — Wspólne typy TypeScript

**Stack**: React • TypeScript • Vite • Fastify • Vitest • Tailwind CSS

## 🚀 Quick Start

### Wymagania

- Node.js >= 20
- pnpm >= 8

### Instalacja i uruchomienie

```bash
pnpm install
pnpm dev              # Frontend (5173) + Backend (4000)
pnpm dev:web          # Tylko frontend
pnpm dev:api          # Tylko backend
```

### Build i production

```bash
pnpm build            # Buduje wszystkie pakiety
pnpm --filter @easy-lingo/api start   # Uruchamia production server
```

Production build tworzy self-contained artifact w `services/api/dist/`:

- `index.js` — bundled server
- `public/` — frontend assets
- `data/` — vocabulary files

### Testy

```bash
pnpm test:web run              # Wszystkie testy
pnpm test:web run -- Lesson   # Konkretny plik
pnpm test:web                  # Tryb watch
```

### Sprawdzanie typów

```bash
pnpm typecheck                 # Sprawdza typy TypeScript bez budowania
```

## 🚀 Deployment

### Render.com

**Setup:** Single Web Service  
**Build Command:** `pnpm install && pnpm build`  
**Start Command:** `pnpm --filter @easy-lingo/api start`  
**Port:** Ustawia się automatycznie z `process.env.PORT`  
**Node Version:** Automatycznie wykrywana z `.node-version` (Node 20)

Serwer serwuje zarówno API (`/api/*`) jak i frontend (`/`).

## 🤖 Dla developerów

Zobacz [AGENTS.md](AGENTS.md) dla konwencji, gotchas i wzorców architektonicznych.
