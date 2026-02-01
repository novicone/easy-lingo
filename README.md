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
- **React Router DOM 7** — routing między stronami
- **Tailwind CSS** — utility-first styling
- **Vite 5** — build tool i dev server
- **Vitest** + **@testing-library/react** — testy jednostkowe
- Proxy `/api` → `http://localhost:4000` (backend) skonfigurowany w `vite.config.ts`

### Backend (`services/api`)

- **Fastify** + **TypeScript** — HTTP server
- **ts-node-dev** — hot reload w dev
- Porty: `4000` (API)
- Statyczne dane słownictwa w `src/data/vocabulary.json`

### Shared (`packages/shared`)

- Wspólne interfejsy TypeScript:
  - `LessonSummary`, `Lesson` — metadane lekcji
  - `VocabularyPair` — pary słów (polski/angielski)
  - `Exercise`, `ExerciseType` — definicje ćwiczeń
  - `LessonProgress`, `ExerciseResult` — tracking postępu
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
│   ├── Home.tsx           # Ekran główny (przycisk startu, licznik lekcji)
│   └── Lesson.tsx         # Logika lekcji (generowanie ćwiczeń, timer, nawigacja)
├── components/
│   ├── exercises/
│   │   ├── MatchingPairs.tsx  # Ćwiczenie: łączenie par słów
│   │   └── Writing.tsx        # Ćwiczenie: pisanie tłumaczeń
│   ├── ExerciseSuccess.tsx    # Ekran pochwały po poprawnej odpowiedzi
│   └── LessonSummary.tsx      # Podsumowanie lekcji (wynik, czas, statystyki)
├── styles/
│   └── index.css          # Tailwind CSS + custom styles
├── __tests__/             # Testy
├── main.tsx               # Entry point
└── App.tsx                # React Router setup (/, /lesson)
```

### Backend (`services/api/src`)

```
src/
├── index.ts               # Fastify server z endpointami:
│                          # GET /health, GET /api/lessons, GET /api/vocabulary, GET /api/lessons/:id
└── data/
    └── vocabulary.json    # Statyczny plik z 30 parami słów (poziom 1)
```

## ✨ Funkcjonalność

### Ekran główny (`/`)

- Przycisk "Rozpocznij lekcję"
- Licznik ukończonych lekcji (localStorage)
- Informacje o zasadach działania

### Lekcja (`/lesson`)

- **Losowa liczba ćwiczeń**: 5-10 ćwiczeń na lekcję
- **Losowy typ ćwiczenia**: łączenie par lub pisanie tłumaczeń
- **Pasek postępu**: liczba ćwiczeń, licznik poprawnych odpowiedzi
- **Timer**: mierzenie czasu od rozpoczęcia do zakończenia
- **Podsumowanie**: wynik procentowy, czas, statystyki

### Ćwiczenie: Łączenie par

- Dwie kolumny: polska i angielska (angielska losowo przetasowana)
- Zaznaczanie par przez kliknięcie
- Walidacja: poprawne pary się wyszarzają, błędne podświetlają na czerwono
- Ekran pochwały po zakończeniu

### Ćwiczenie: Pisanie

- Wyświetlenie polskiego słowa
- Pole tekstowe do wpisania angielskiego tłumaczenia
- Przycisk "Sprawdź"
- Walidacja: poprawne → ekran pochwały, błędne → ekran z poprawną odpowiedzią

## 🔮 Planowane funkcje

- [ ] ~~ESLint + Prettier (konfiguracja root)~~
- [x] ~~Tailwind CSS (stylowanie)~~ ✅
- [x] ~~React Router (routing)~~ ✅
- [x] ~~State management~~ ✅ (localStorage)
- [ ] Baza danych (SQLite + Prisma) — persystencja postępu
- [ ] System poziomów trudności — wybór poziomu na ekranie głównym
- [ ] Więcej typów ćwiczeń (wybór wielokrotny, słuchanie)
- [ ] Statystyki użytkownika (wykres postępów, seria dni)
- [ ] Responsywność mobilna
- [ ] Autentykacja użytkowników

## 📚 Dodatkowe informacje

- **Monorepo**: wykorzystuje pnpm workspaces (`pnpm-workspace.yaml`)
- **Dev dependencies**: TypeScript, Vitest, @types/jest (workaround dla IDE) w root `package.json`
- **Stylowanie**: Tailwind CSS z gradientowym tłem, responsywnymi kartami i animacjami
- **Persystencja**: localStorage dla licznika lekcji (przyszłość: backend + baza danych)
- **Wspólne typy**: pakiet `@easy-lingo/shared` importowany jako `@easy-lingo/shared`
- **Proxy**: frontend proxy `/api` → backend `http://localhost:4000`

## 🤖 Dla agentów AI

Zobacz [AGENTS.md](AGENTS.md) dla szczegółowych instrukcji dotyczących pracy z tym projektem.
