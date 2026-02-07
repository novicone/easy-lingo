# easy-lingo

Aplikacja webowa do nauki angielskiego z interaktywnymi ćwiczeniami.

## ✨ Funkcjonalność

- System lekcji z losowymi ćwiczeniami (pisanie tłumaczeń, łączenie par)
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

- Node.js >= 18
- pnpm >= 8

### Instalacja i uruchomienie

```bash
pnpm install
pnpm dev              # Frontend (5173) + Backend (4000)
```

### Testy

```bash
pnpm --filter @easy-lingo/web test run    # Jednokrotnie
pnpm --filter @easy-lingo/web test        # Tryb watch
```

## 🤖 Dla developerów

Zobacz [AGENTS.md](AGENTS.md) dla konwencji, gotchas i wzorców architektonicznych.
