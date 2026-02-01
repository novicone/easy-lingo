# Instrukcje dla agentów AI

## 📋 Zasady ogólne

1. **ZAWSZE czytaj [README.md](README.md) na początku sesji** — zawiera aktualny opis projektu, stacku technicznego, struktury katalogów i instrukcji uruchomieniowych.

2. **Testy są OBOWIĄZKOWE**:
   - Pisz testy PODCZAS implementacji komponentów/funkcji, nie po
   - Każdy nowy komponent React wymaga testów (@testing-library/react)
   - Każda nowa funkcja logiki biznesowej wymaga testów jednostkowych
   - Uruchom `pnpm --filter @easy-lingo/web test` PRZED zakończeniem pracy

3. **Aktualizuj oba pliki**: gdy dokonujesz istotnych zmian w projekcie (nowy stack, zmiana struktury, dodanie funkcji):
   - Zaktualizuj [README.md](README.md) — dokumentacja dla ludzi i agentów
   - Zaktualizuj [AGENTS.md](AGENTS.md) (ten plik) — jeśli pojawiają się nowe wzorce/decyzje architektoniczne

4. **Przestrzegaj ustalonych konwencji** opisanych poniżej.

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
- **Pokrycie testów**: Comprehensive test coverage dla wszystkich komponentów (Home, Lesson, MatchingPairs, Writing, ExerciseSuccess, LessonSummary)
- **Wzorce testowania**: Dependency injection (opcjonalny `exercises` prop) pozwala na deterministyczne testy bez mockowania randomizacji

## 🔧 Konwencje developerskie

### Skrypty

- `pnpm dev` — uruchamia frontend i backend równolegle
- `pnpm dev:web` — uruchamia tylko frontend
- `pnpm dev:api` — uruchamia tylko backend
- `pnpm --filter @easy-lingo/web test` — uruchamia testy webowe
- `pnpm --filter @easy-lingo/web test run` — uruchamia testy jednokrotnie (CI mode)

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

### Problem: Stan React komponentu persystuje między kolejnymi renderami tego samego typu

**Symptom**: Przy kolejnych ćwiczeniach tego samego typu (np. Writing → Writing), stary stan (`answer`, `showResult`) nie był resetowany. React aktualizował istniejący komponent nowymi props zamiast tworzyć nową instancję.

**Rozwiązanie**:

- Dodaj `key={currentExercise.id}` prop do komponentów ćwiczeń w Lesson.tsx
- React traktuje komponenty z różnymi `key` jako całkowicie nowe instancje
- Wymusza unmount starej instancji i mount nowej, resetując cały lokalny stan
- **Pattern**: `<Writing key={currentExercise.id} exercise={...} />`

**Testing pattern**: Dependency injection - Lesson przyjmuje opcjonalny `exercises?: Exercise[]` prop, co pozwala testom przekazać deterministyczną listę ćwiczeń zamiast losowej generacji.

## ✅ Checklist przy commitowaniu

Przed zakończeniem pracy upewnij się, że:

- [ ] Wszystkie nowe komponenty/funkcje mają testy
- [ ] `pnpm --filter @easy-lingo/web test run` przechodzi bez błędów
- [ ] Typy w `packages/shared` są zaktualizowane (jeśli dotyczy API/modeli)
- [ ] README.md jest zaktualizowany (jeśli dodano nowe komendy/funkcje)
- [ ] AGENTS.md jest zaktualizowany (jeśli dodano nowe wzorce architektoniczne)
- [ ] VS Code nie pokazuje błędów TypeScript
- [ ] Kod kompiluje się bez ostrzeżeń

## 📝 Historia zmian architektonicznych

### 2026-01-31: Inicjalizacja projektu

- Setup monorepo pnpm workspaces
- Scaffold Vite + React + TypeScript (frontend)
- Scaffold Fastify + TypeScript (backend)
- Vitest + @testing-library/react (testy)
- VS Code settings (workspace TypeScript, rekomendowane rozszerzenia)
- Rozwiązanie problemów z TypeScript globals w IDE (vitest/globals + @types/jest workaround)

### 2026-01-31: Implementacja systemu lekcji i ćwiczeń

- **Zainstalowano zależności**:
  - React Router DOM 7.13.0 (routing między stronami)
  - Tailwind CSS + PostCSS + Autoprefixer (stylowanie)
- **Rozszerzono typy w `packages/shared`**:
  - `VocabularyPair` — para słów polskie/angielskie z poziomem trudności
  - `ExerciseType` (enum) — `MATCHING_PAIRS` | `WRITING`
  - `MatchingPairsExercise`, `WritingExercise` — typy ćwiczeń
  - `ExerciseResult`, `LessonProgress`, `LessonSummaryData` — tracking postępu
- **Dodano statyczny plik słownictwa**:
  - `services/api/src/data/vocabulary.json` — 30 par słów poziomu 1
- **Komponenty frontend** (`apps/web/src/components/`):
  - `exercises/MatchingPairs.tsx` — łączenie par (dwie kolumny, walidacja, zaznaczanie)
  - `exercises/Writing.tsx` — pisanie tłumaczeń (input, sprawdzanie, ekran błędu)
  - `ExerciseSuccess.tsx` — ekran pochwały po poprawnym ćwiczeniu
  - `LessonSummary.tsx` — podsumowanie lekcji (wynik, czas, statystyki)
- **Strony**:
  - `pages/Home.tsx` — ekran główny z przyciskiem startu i licznikiem lekcji (localStorage)
  - `pages/Lesson.tsx` — logika lekcji (generowanie 5-10 losowych ćwiczeń, timer, przejścia między ćwiczeniami)
- **Routing**:
  - `App.tsx` — `BrowserRouter` z trasami `/` (Home) i `/lesson` (Lesson)
- **Backend API** (`services/api/src/index.ts`):
  - `GET /api/vocabulary` — zwraca wszystkie pary słów z JSON
  - `GET /api/lessons/:id` — zwraca szczegóły lekcji (placeholder)
  - Wczytywanie `vocabulary.json` przy starcie z użyciem `__dirname` workaround dla ES modules
- **Stylowanie**:
  - Tailwind CSS z gradientowym tłem
  - Responsywne karty, przyciski, animacje
  - `apps/web/src/styles/index.css` — Tailwind directives

### Problem: `__dirname is not defined` w ES Modules (Node.js)

**Rozwiązanie**:

```typescript
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

### 2026-01-31: Bugfixy i refaktoryzacja testów

- **Bug #1 - Writing component nie wywołuje onComplete**: Komponent Writing nie wywołował `onComplete(true)` dla poprawnych odpowiedzi, przez co rodzic (Lesson) nie mógł pokazać ekranu sukcesu. **Fix**: Dodano `onComplete(true)` w `handleCheck()` gdy `correct === true`.

- **Bug #2 - State persistence między ćwiczeniami**: Stan komponentu Writing (`answer`, `showResult`, `isCorrect`) persystował między kolejnymi ćwiczeniami tego samego typu. React aktualizował istniejący komponent zamiast tworzyć nowy. **Fix**: Dodano `key={currentExercise.id}` do komponentów MatchingPairs i Writing w Lesson.tsx.

- **Refaktoryzacja testowania**: Dodano dependency injection do Lesson - opcjonalny prop `exercises?: Exercise[]` pozwala testom przekazać deterministyczną listę ćwiczeń. Unika potrzeby mockowania `Math.random()` i jest bardziej maintainable.

- **Test regresyjny**: Dodano test "resets Writing component state between consecutive Writing exercises" który:
  - ❌ Zawodzi bez `key` prop (komponent pokazuje stary stan)
  - ✅ Przechodzi z `key` prop (komponent jest prawidłowo zresetowany)
  - Potwierdza że bug został naprawiony i nie wróci

- **Konwencja kodu**: Wszystkie komentarze w kodzie przetłumaczone na angielski dla spójności międzynarodowej.

## 🎯 Najbliższe kroki (TODO)

- ~~ESLint + Prettier (konfiguracja root)~~
- ~~Tailwind CSS~~ ✅
- ~~React Router~~ ✅
- ~~State management (Context/Zustand)~~ ✅ (localStorage dla licznika)
- Baza danych (SQLite + Prisma) — persystencja postępu użytkownika
- System poziomów trudności — wybór poziomu na ekranie głównym
- Więcej typów ćwiczeń (wybór wielokrotny, słuchanie, itp.)
- Statystyki użytkownika (wykres postępów, seria dni)
- Responsywność mobilna (dopracowanie layoutu)

---

**Pamiętaj**: Ten plik i [README.md](README.md) są źródłem prawdy o projekcie. Aktualizuj je przy istotnych zmianach!
