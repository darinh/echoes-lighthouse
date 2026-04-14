# Agent Instructions — Echoes of the Lighthouse

This file is read by AI coding agents (Copilot, Claude, etc.) working in this repository.

## What this project is

A narrative mystery roguelite game. TypeScript + Vite + Canvas 2D.
Spec lives in `docs/gdd/`. Architecture docs in `docs/ARCHITECTURE.md`.

## Rules you must follow

### 1. Never push to `main` or `develop` directly

Branch protection is enforced. Direct pushes will be rejected.

Always:
```bash
git checkout develop && git pull origin develop
git checkout -b feature/your-feature   # or fix/, content/, test/, etc.
# ... make changes ...
git push origin feature/your-feature
# Then open a PR to develop via GitHub API
```

### 2. Use conventional commit messages

```
feat(systems): implement insight banking
fix(loop): day timer not resetting correctly
content(dialogue): add Maren tier 3 dialogue
test(systems): KnowledgeSystem spec compliance tests
```

This is not just style — `feat:` triggers a minor version bump on release, `fix:` triggers patch. Wrong commit types produce wrong version numbers.

### 3. Read the spec before implementing

Every system, NPC, mechanic, and UI element is specified in `docs/gdd/`.
Find the relevant section. Implement what it says. Write a test that proves it.

### 4. Write spec-compliance tests

Name your tests with GDD section references:
```typescript
describe('[GDD §1.2] Insight daily cap', () => { ... })
```

CI runs `vitest` on every PR. Tests must pass.

### 5. Never touch `src/interfaces/` without being told to

These are the stable contracts between modules. Changing them breaks everything downstream. Raise the need with the Operator instead.

### 6. All strings through `t()`

```typescript
// ✓ correct
ctx.fillText(i18n.t('location.harbor'), x, y)

// ✗ wrong — hardcoded English breaks i18n
ctx.fillText('The Harbour', x, y)
```

### 7. Cross-module communication via events only

```typescript
// ✓ correct
eventBus.emit('insight.gained', { amount: 15 })

// ✗ wrong — direct coupling breaks modularity
import { JournalPanel } from '../ui/JournalPanel.js'
journalPanel.flash()
```

## How to open a PR (GitHub API)

```bash
TOKEN="$MATRIX__AGENTS__SYSTEMTOKEN"
curl -s -X POST \
  -H "Authorization: token $TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.github.com/repos/darinh/echoes-lighthouse/pulls" \
  -d '{
    "title": "feat(systems): implement knowledge banking",
    "body": "Implements insight banking per GDD §2.1",
    "head": "feature/knowledge-banking",
    "base": "develop"
  }'
```
