# Agent Instructions

> [README.md](README.md) contains: monorepo structure, stack, install/run/test commands, and ports.

**Avoid duplication**: Don't repeat commands/setup that's already in README. Link to README instead.

## 🚫 Constraints

- **Tests are mandatory**: Write tests alongside implementation, not after
- **Run tests before finishing**: Tests must pass
- **Never use `rootDir`** in workspace package tsconfig files (breaks shared package imports)
- **Use Polish for UI text**, English for code/comments

## 📐 Conventions

### Testing

- **Framework**: Vitest with `@testing-library/react` and `@testing-library/user-event`
- **Test commands**: See [README.md](README.md#testy) for run commands
- **Always use `userEvent`**, never `fireEvent`:
  ```typescript
  const user = userEvent.setup();
  await user.click(button);
  await user.type(input, "text");
  ```
- **Global test API**: `describe`, `it`, `expect`, `vi` available without imports (configured via `vitest/globals` in root tsconfig)
- **Dependency injection**: Use optional props for deterministic tests:
  ```typescript
  // Component accepts optional test data
  function Lesson({ exercises }: { exercises?: Exercise[] }) {
    const generated = exercises || generateRandomExercises();
  }
  ```
- **Tests alongside implementation**: When planning work, combine test writing and implementation in a single step:
  ```
  ❌ WRONG:
  Step 2: Create Component.tsx
  Step 3: Create Component.test.tsx
  
  ✅ CORRECT:
  Step 2: Create Component.tsx + tests (TDD)
    a) Write Component.test.tsx (define expected behavior)
    b) Implement Component.tsx
    c) Run tests to verify
  ```

### React Patterns

- **Force component remount** with `key` prop when same component type renders consecutively:
  ```tsx
  <Writing key={currentExercise.id} exercise={currentExercise} />
  ```
  Without this, React reuses the component instance and old state persists.

### Monorepo

- **Import shared types**: `import { Exercise } from "@easy-lingo/shared";`
- **Declare dependencies**: All packages must declare `@easy-lingo/shared` in `dependencies` if they import from it

### Build System

- **Dev mode**: Uses `tsx watch` for API (fast, full ESM support)
- **Production**: Uses `esbuild` to bundle API into single file
- **Unified build**: `pnpm build` builds all packages in dependency order
- **Collocated output**: `services/api/dist/` contains everything:
  - `index.js` — bundled server
  - `public/` — frontend (copied from `apps/web/dist`)
  - `data/` — CSV files
- **Self-contained deployment**: Just deploy `services/api/dist/` folder

## ⚠️ Gotchas

### Terminal context in monorepo

**Problem**: Commands fail with "path does not exist" or execute in wrong directory.

**Why**: PowerShell preserves `cwd` between commands. Relative `cd` compounds paths.

**Solution**: Always reset to root before workspace commands:

```bash
cd c:\Users\novic\Projects\easy-lingo; pnpm test:web run
```

### TypeScript in workspace packages

**Problem**: `File is not under 'rootDir'` when importing from `@easy-lingo/shared`

**Solution**: Don't set `rootDir` in workspace tsconfig. TypeScript auto-detects common root.

### React state not resetting

**Problem**: When rendering `Writing → Writing` exercises, old state (`answer`, `showResult`) persists.

**Why**: React keeps same component instance when type doesn't change.

**Solution**: Add `key` prop with unique ID to force new instance.

### Vitest globals in VS Code

**Problem**: TypeScript doesn't recognize `describe`, `it`, `expect` without imports.

**Solution**: Already configured:

- `apps/web/tsconfig.json` has `types: ["vitest/globals", "node", "vite/client"]`
- `@types/jest` in root devDependencies (IDE workaround)
- Backend overrides with `types: ["node"]` only (no vitest globals)

### ES Modules `__dirname`

**Problem**: `__dirname` undefined in ES modules.

**Solution**:

```typescript
import { fileURLToPath } from "url";
import { dirname } from "path";
const __dirname = dirname(fileURLToPath(import.meta.url));
```

### Dev Server Issues

**Problem**: `ts-node-dev` fails with "Must use import to load ES Module"

**Why**: `ts-node-dev` has poor ESM support, doesn't work with `"type": "module"`

**Solution**: Use `tsx` instead:
```json
"scripts": {
  "dev": "tsx watch src/index.ts"
}
```

**Benefits**: Faster startup, full ESM support, better TypeScript handling
