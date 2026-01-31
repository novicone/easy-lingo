# easy-lingo

Aplikacja przeglądarkowa do nauki języka angielskiego, luźno inspirowana Duolingo. Projekt wykorzystuje monorepo z pnpm workspaces.

## 📁 Struktura projektu

```
easy-lingo/
├── apps/
│   └── web/              # Frontend (Vite + React + TypeScript)
├── services/
│   └── api/              # Backend (Fastify + TypeScript)
├── packages/
│   └── shared/           # Wspólne typy i modele
├── .vscode/              # Ustawienia VS Code
├── pnpm-workspace.yaml   # Konfiguracja workspace pnpm
└── package.json          # Root package.json z devDependencies i skryptami
```

## 🛠️ Stack technologiczny

### Frontend (`apps/web`)

- **React 18** + **TypeScript** — UI framework
- **Vite 5** — build tool i dev server
- **Vitest** + **@testing-library/react** — testy jednostkowe
- Proxy `/api` → `http://localhost:4000` (backend) skonfigurowany w `vite.config.ts`

### Backend (`services/api`)

- **Fastify** + **TypeScript** — HTTP server
- **ts-node-dev** — hot reload w dev
- Porty: `4000` (API)

### Shared (`packages/shared`)

- Wspólne interfejsy TypeScript (np. `LessonSummary`, `Lesson`)
- Używane zarówno przez frontend jak i backend

### DevTools

- **pnpm workspaces** — zarządzanie monorepo
- **TypeScript 5.9** — typowanie (workspace-level)
- **Vitest** — framework testowy (workspace-level)
- **VS Code settings** — workspace TypeScript, formatowanie, ESLint

## 🚀 Szybki start

### Wymagania

- Node.js >= 18
- pnpm >= 8 (zainstaluj: `npm install -g pnpm`)

### Instalacja

```bash
pnpm install
```

### Uruchomienie dev

```bash
# Uruchom frontend i backend jednocześnie
pnpm dev

# Lub osobno:
pnpm dev:web    # Frontend na http://localhost:5173
pnpm dev:api    # Backend na http://localhost:4000
```

### Testy

```bash
# Uruchom testy webowe (jednokrotnie)
pnpm --filter @easy-lingo/web test run

# Testy w trybie watch
pnpm --filter @easy-lingo/web test
```

### Build (produkcja)

```bash
# Frontend
pnpm --filter @easy-lingo/web build

# Backend
cd services/api && pnpm start
```

## 📝 Konfiguracja TypeScript

Projekt używa hierarchicznych `tsconfig.json`:

- **Root `tsconfig.json`**: baseConfig z `types: ["vitest/globals", "node"]` i `typeRoots` wskazującymi na workspace packages
- **`apps/web/tsconfig.json`**: extends root, dodaje `"vite/client"` do types
- **`services/api/tsconfig.json`**: extends root, nadpisuje `types: ["node"]` (bez vitest)

Dzięki `vitest/globals` w root config, testy mają dostęp do `describe/it/expect` bez importów.

## 🧪 Testy

Przykładowy test: `apps/web/src/__tests__/Home.test.tsx`

```typescript
import React from 'react'
import { render, screen } from '@testing-library/react'
import Home from '../pages/Home'

describe('Home', () => {
  it('renders greeting', () => {
    render(<Home />)
    expect(screen.getByText(/easy-lingo/i)).toBeInTheDocument()
  })
})
```

## 🔧 VS Code

Projekt zawiera konfigurację w `.vscode/`:

- **settings.json**: workspace TypeScript, formatowanie, ESLint
- **extensions.json**: rekomendowane rozszerzenia (ESLint, Prettier, GitLens)

Po otwarciu projektu, zainstaluj rekomendowane rozszerzenia i wykonaj "TypeScript: Restart TS Server" jeśli widzisz błędy.

## 🗂️ Komponenty i strony

### Frontend (`apps/web/src`)

```
src/
├── pages/
│   ├── Home.tsx           # Strona główna
│   └── Lesson.tsx         # Strona lekcji
├── components/            # (placeholder)
├── styles/
│   └── index.css          # Minimalne globalne style
├── __tests__/             # Testy
├── main.tsx               # Entry point
└── App.tsx                # Root component
```

### Backend (`services/api/src`)

```
src/
└── index.ts               # Fastify server z /health i /api/lessons
```

## 🔮 Planowane funkcje

- [ ] ESLint + Prettier (konfiguracja root)
- [ ] Tailwind CSS (stylowanie)
- [ ] React Router (routing)
- [ ] Zustand lub Context (state management)
- [ ] Baza danych (SQLite + Prisma)
- [ ] Autentykacja
- [ ] Ćwiczenia językowe (słownictwo, gramatyka)
- [ ] System postępów użytkownika

## 📚 Dodatkowe informacje

- **Monorepo**: wykorzystuje pnpm workspaces (`pnpm-workspace.yaml`)
- **Dev dependencies**: TypeScript, Vitest, @types/jest (workaround dla IDE) w root `package.json`
- **Wspólne typy**: pakiet `@easy-lingo/shared` importowany jako `@easy-lingo/shared`
- **Proxy**: frontend proxy `/api` → backend `http://localhost:4000`

## 🤖 Dla agentów AI

Zobacz [AGENTS.md](AGENTS.md) dla szczegółowych instrukcji dotyczących pracy z tym projektem.
