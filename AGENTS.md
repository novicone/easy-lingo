# Instrukcje dla agentów AI

## 📋 Zasady ogólne

1. **ZAWSZE czytaj [README.md](README.md) na początku sesji** — zawiera aktualny opis projektu, stacku technicznego, struktury katalogów i instrukcji uruchomieniowych.

2. **Aktualizuj oba pliki**: gdy dokonujesz istotnych zmian w projekcie (nowy stack, zmiana struktury, dodanie funkcji):
   - Zaktualizuj [README.md](README.md) — dokumentacja dla ludzi i agentów
   - Zaktualizuj [AGENTS.md](AGENTS.md) (ten plik) — jeśli pojawiają się nowe wzorce/decyzje architektoniczne

3. **Przestrzegaj ustalonych konwencji** opisanych poniżej.

## 🏗️ Architektura i struktura

### Monorepo pnpm

- Projekt używa **pnpm workspaces** (`pnpm-workspace.yaml`)
- Workspace packages: `apps/*`, `services/*`, `packages/*`
- Root `package.json` zawiera tylko devDependencies wspólne dla całego monorepo i skrypty orkiestracyjne

### Packages

- **`apps/web`**: frontend React + Vite + TypeScript
- **`services/api`**: backend Fastify + TypeScript
- **`packages/shared`**: wspólne typy TypeScript używane przez frontend i backend

### TypeScript config

- Root `tsconfig.json`:
  - `types: ["vitest/globals", "node"]` — globalne API testowe
  - `typeRoots` wskazuje na `node_modules` w workspace packages
  - `paths`: alias `@easy-lingo/shared` → `packages/shared/src`
- `apps/web/tsconfig.json`:
  - Extends root
  - Dodaje `"vite/client"` do `types`
- `services/api/tsconfig.json`:
  - Extends root
  - Nadpisuje `types: ["node"]` (backend nie potrzebuje vitest globals)
  - **Nie ustawiaj `rootDir`** — pozwala to importować `@easy-lingo/shared` bez błędów

### Testy

- Framework: **Vitest** z `@testing-library/react`
- Globalne API testowe (`describe/it/expect`) dostępne dzięki `vitest/globals` w root tsconfig
- Setup: `apps/web/src/setupTests.ts` importuje `@testing-library/jest-dom`
- Workaround: `@types/jest` w root devDependencies (dla lepszej integracji IDE)

## 🔧 Konwencje developerskie

### Skrypty

- `pnpm dev` — uruchamia frontend i backend równolegle
- `pnpm dev:web` — uruchamia tylko frontend
- `pnpm dev:api` — uruchamia tylko backend
- `pnpm --filter @easy-lingo/web test` — uruchamia testy webowe

### Dodawanie zależności

- **Dla workspace packages**: `pnpm add <package> --filter @easy-lingo/web`
- **Dla root (devDependencies)**: `pnpm add -D -w <package>`

### Importy wspólnych typów

```typescript
import { LessonSummary } from "@easy-lingo/shared";
```

### Proxy API

- Frontend ma proxy `/api` → `http://localhost:4000` w `vite.config.ts`
- Backend używa portu `4000`

## 🐛 Znane problemy i rozwiązania

### Problem: TypeScript w VS Code nie widzi `describe/it/expect`

**Rozwiązanie zastosowane**:

- `vitest/globals` w root `tsconfig.json` `types`
- `@types/jest` jako workaround w root `devDependencies`
- `typeRoots` wskazuje na `node_modules` w workspace packages
- Backend (`services/api`) nadpisuje `types: ["node"]`

### Problem: "Cannot find type definition file for 'vite/client'"

**Rozwiązanie**:

- Zainstaluj `vite` jako devDependency w `apps/web`
- Dodaj `"vite/client"` do `types` w `apps/web/tsconfig.json`

### Problem: pnpm nie rozpoznaje workspace

**Rozwiązanie**:

- Użyj `pnpm-workspace.yaml` zamiast `workspaces` w `package.json`
- Format: `packages: ['apps/*', 'services/*', 'packages/*']`

### Problem: File is not under 'rootDir' przy imporcie z `@easy-lingo/shared`

**Rozwiązanie**:

- Usuń `rootDir` z `services/api/tsconfig.json` (lub innych workspace packages)
- TypeScript automatycznie określi wspólny root dla wszystkich importowanych plików
- Pozwala to importować typy z `packages/shared` bez błędów kompilacji

## ✅ Checklist przy dodawaniu nowych funkcji

- [ ] Dodaj testy (jeśli dotyczy komponentów/logiki)
- [ ] Zaktualizuj typy w `packages/shared` (jeśli dotyczy API/modeli)
- [ ] Zaktualizuj README.md z nowymi komendami/instrukcjami
- [ ] Przetestuj `pnpm dev` i `pnpm test`
- [ ] Sprawdź czy VS Code nie pokazuje błędów TypeScript

## 📝 Historia zmian architektonicznych

### 2026-01-31: Inicjalizacja projektu

- Setup monorepo pnpm workspaces
- Scaffold Vite + React + TypeScript (frontend)
- Scaffold Fastify + TypeScript (backend)
- Vitest + @testing-library/react (testy)
- VS Code settings (workspace TypeScript, rekomendowane rozszerzenia)
- Rozwiązanie problemów z TypeScript globals w IDE (vitest/globals + @types/jest workaround)

## 🎯 Najbliższe kroki (TODO)

- ESLint + Prettier (konfiguracja root)
- Tailwind CSS
- React Router
- State management (Context/Zustand)
- Baza danych (SQLite + Prisma)

---

**Pamiętaj**: Ten plik i [README.md](README.md) są źródłem prawdy o projekcie. Aktualizuj je przy istotnych zmianach!
