# Testing Guide

## Strategy

Three layers, each with a clear purpose:

```
tests/
├── unit/           ← Pure logic: state in → state out. Fast, no DOM, no canvas.
├── integration/    ← Multi-system flows. Full engine init, event-driven scenarios.
└── e2e/            ← Browser smoke tests via Playwright. Does it load? Does it run?
```

**Framework:** [Vitest](https://vitest.dev/) for unit + integration. [Playwright](https://playwright.dev/) for E2E.

---

## Spec Compliance Naming Convention

All tests that verify GDD behaviour must cite the spec section in their `describe` label:

```typescript
describe('[GDD §1.2] Daily insight cap', () => {
  it('reduces gains by 60% after 150 insight in one loop', ...)
  it('hard cap is 999 total', ...)
})

describe('[GDD §1.1] Death resets physical stats, preserves persistent stats', () => {
  it('resets stamina to 100', ...)
  it('retains only banked insight — unbanked is lost', ...)
  it('preserves resonance per NPC', ...)
})
```

This creates a living test suite. If a test fails, the name tells you exactly which spec invariant broke.

---

## Unit Tests

### What to test

Every `ISystem` is a pure function — ideal for unit tests:

```typescript
// tests/unit/systems/KnowledgeSystem.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { KnowledgeSystem } from '@/systems/KnowledgeSystem.js'
import { EventBus } from '@/engine/EventBus.js'
import { createInitialState } from '@/engine/initialState.js'

describe('[GDD §1.2] KnowledgeSystem — Insight gain', () => {
  let system: KnowledgeSystem
  let eventBus: EventBus

  beforeEach(() => {
    eventBus = new EventBus()
    system = new KnowledgeSystem(eventBus)
  })

  it('increases insight when insight.gained event fires', () => {
    const state = createInitialState()
    const event = { type: 'insight.gained', payload: { amount: 15 }, timestamp: 0 }
    const next = system.onEvent(event, state)
    expect(next.player.insight).toBe(15)
  })

  it('never exceeds hard cap of 999', () => {
    const state = { ...createInitialState(), player: { ...createInitialState().player, insight: 995 } }
    const event = { type: 'insight.gained', payload: { amount: 100 }, timestamp: 0 }
    const next = system.onEvent(event, state)
    expect(next.player.insight).toBe(999)
  })
})
```

### What to mock

- **Canvas:** Mock `CanvasRenderingContext2D` for renderer tests — test logic, not pixels
- **AudioContext:** Mock Web Audio nodes — test routing logic, not sound output
- **fetch:** Mock for `I18nService` locale loading tests
- **localStorage:** Use `vitest`'s `vi.stubGlobal` for save/load tests

---

## Integration Tests

Test multi-system event flows through a real `GameEngine`:

```typescript
// tests/integration/game-loop.test.ts
describe('Dawn → Day → Death → Loop reset', () => {
  it('increments loopCount on death', async () => {
    const { engine, eventBus } = buildTestEngine()
    // advance to day phase
    eventBus.emit('phase.changed', { from: 'dawn', to: 'day' })
    // gain insight
    eventBus.emit('insight.gained', { amount: 50 })
    // player dies
    eventBus.emit('player.died', {})
    expect(engine.getState().player.loopCount).toBe(2)
    expect(engine.getState().player.stamina).toBe(100)
    expect(engine.getState().player.insight).toBe(0) // unbanked lost
  })
})
```

---

## E2E Tests (Playwright)

Smoke tests only — verify the game loads and the title screen renders:

```typescript
// tests/e2e/smoke.spec.ts
import { test, expect } from '@playwright/test'

test('game loads and shows title screen', async ({ page }) => {
  await page.goto('/')
  await page.waitForSelector('#game-canvas')
  await expect(page.locator('#loading')).toHaveClass(/hidden/, { timeout: 5000 })
  // Canvas is present and has non-zero dimensions
  const canvas = page.locator('#game-canvas')
  await expect(canvas).toBeVisible()
})

test('clicking canvas unlocks audio and starts game', async ({ page }) => {
  await page.goto('/')
  await page.waitForSelector('#game-canvas')
  await page.locator('#game-canvas').click()
  // After click, loading screen should be gone
  await expect(page.locator('#loading')).toHaveClass(/hidden/)
})
```

---

## Running Tests

```bash
npm run test           # run all unit + integration tests (Vitest)
npm run test:watch     # watch mode
npm run test:coverage  # with coverage report
npm run test:e2e       # run Playwright E2E tests (requires built app)
```

---

## Coverage Expectations

| Module | Target |
|---|---|
| `src/systems/` | 90%+ (pure logic, easy to test) |
| `src/engine/EventBus.ts` | 100% |
| `src/i18n/` | 85%+ |
| `src/providers/` | 70%+ (mocked externals) |
| `src/ui/` | 50%+ (logic only; skip draw calls) |

Canvas pixel output and audio waveforms are **explicitly excluded** from coverage targets.
