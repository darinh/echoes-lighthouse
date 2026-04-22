import { describe, it, expect, vi } from 'vitest'
import { GameEngine } from '@/engine/GameEngine.js'
import { EventBus } from '@/engine/EventBus.js'
import { createInitialState } from '@/engine/initialState.js'
import type { IGameState } from '@/interfaces/index.js'
import type { ItemId, LocationId } from '@/interfaces/types.js'

// ── Minimal stubs for GameEngine dependencies ─────────────────────────────────

function makeStubRenderer() {
  return { render: vi.fn(), resize: vi.fn(), init: vi.fn(), dispose: vi.fn(), setI18n: vi.fn() }
}
function makeStubAudio() {
  return { play: vi.fn(), stop: vi.fn(), setVolume: vi.fn(), unlock: vi.fn(), init: vi.fn(), dispose: vi.fn() }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function withLocation(state: IGameState, loc: LocationId): IGameState {
  return { ...state, player: { ...state.player, currentLocation: loc } }
}

function withInventory(state: IGameState, items: ItemId[]): IGameState {
  return { ...state, inventory: new Set(items) as ReadonlySet<ItemId> }
}

function withPhase(state: IGameState, phase: IGameState['phase']): IGameState {
  return { ...state, phase }
}

// ── Build an engine pre-loaded with the given state ───────────────────────────

function makeEngine(initialOverride?: Partial<IGameState>) {
  const bus = new EventBus()
  const renderer = makeStubRenderer()
  const audio = makeStubAudio()
  const engine = new GameEngine(
    bus,
    renderer as never,
    audio as never,
  )
  const base = createInitialState()
  const state: IGameState = { ...base, phase: 'morning', ...initialOverride }
  engine.loadState(state)
  return { engine, bus }
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('LighthouseMinigame — lighthouse.repair.start', () => {
  it('does nothing if player is not at lighthouse_top', () => {
    const { engine } = makeEngine()
    engine.loadState(
      withInventory(
        withLocation(engine.getState(), 'village_square'),
        ['oil_flask', 'wick', 'lens_component'],
      ),
    )
    engine.handleAction({ type: 'lighthouse.repair.start' })
    expect(engine.getState().phase).toBe('morning')
    expect(engine.getState().activeMinigame).toBeNull()
  })

  it('does nothing if player is missing required items', () => {
    const { engine } = makeEngine()
    engine.loadState(
      withInventory(
        withLocation(engine.getState(), 'lighthouse_top'),
        ['oil_flask'],              // missing wick + lens_component
      ),
    )
    engine.handleAction({ type: 'lighthouse.repair.start' })
    expect(engine.getState().phase).toBe('morning')
    expect(engine.getState().activeMinigame).toBeNull()
  })

  it('does nothing if lighthouse_repaired flag is already set', () => {
    const { engine } = makeEngine()
    const flagged = {
      ...withInventory(withLocation(engine.getState(), 'lighthouse_top'), ['oil_flask', 'wick', 'lens_component']),
      worldFlags: new Set(['lighthouse_repaired']),
    }
    engine.loadState(flagged)
    engine.handleAction({ type: 'lighthouse.repair.start' })
    expect(engine.getState().phase).toBe('morning')
  })

  it('starts the minigame when preconditions are met', () => {
    const { engine, bus } = makeEngine()
    const emitted: string[] = []
    bus.on('lighthouse.repair.started', () => emitted.push('started'))

    engine.loadState(
      withInventory(
        withLocation(engine.getState(), 'lighthouse_top'),
        ['oil_flask', 'wick', 'lens_component'],
      ),
    )
    engine.handleAction({ type: 'lighthouse.repair.start' })

    const s = engine.getState()
    expect(s.phase).toBe('minigame')
    expect(s.activeMinigame).toBe('lighthouse_repair')
    expect(s.lighthouseRepairStep).toBe(0)
    expect(s.minigameTimerStart).toBeGreaterThan(0)
    expect(emitted).toContain('started')
  })

  it('stores prior phase so it can be restored', () => {
    const { engine } = makeEngine()
    engine.loadState(
      withInventory(
        withPhase(withLocation(engine.getState(), 'lighthouse_top'), 'afternoon'),
        ['oil_flask', 'wick', 'lens_component'],
      ),
    )
    engine.handleAction({ type: 'lighthouse.repair.start' })
    expect(engine.getState().priorPhase).toBe('afternoon')
  })
})

describe('LighthouseMinigame — step advancement via minigame.confirm', () => {
  function startedState(): IGameState {
    const base = createInitialState()
    return {
      ...base,
      phase: 'minigame',
      priorPhase: 'morning',
      activeMinigame: 'lighthouse_repair',
      lighthouseRepairStep: 0,
      minigameTimerStart: Date.now(),
      player: {
        ...base.player,
        currentLocation: 'lighthouse_top' as LocationId,
      },
      inventory: new Set(['oil_flask', 'wick', 'lens_component']) as ReadonlySet<ItemId>,
    }
  }

  it('advances from step 0 to step 1 on confirm', () => {
    const { engine, bus } = makeEngine()
    const stepEvents: number[] = []
    bus.on('lighthouse.repair.step', (e) => stepEvents.push((e.payload as { step: number }).step))

    engine.loadState(startedState())
    engine.handleAction({ type: 'minigame.confirm' })

    const s = engine.getState()
    expect(s.lighthouseRepairStep).toBe(1)
    expect(s.phase).toBe('minigame')
    expect(stepEvents).toContain(1)
  })

  it('advances from step 1 to step 2 on confirm', () => {
    const { engine } = makeEngine()
    engine.loadState({ ...startedState(), lighthouseRepairStep: 1 })
    engine.handleAction({ type: 'minigame.confirm' })

    expect(engine.getState().lighthouseRepairStep).toBe(2)
    expect(engine.getState().phase).toBe('minigame')
  })

  it('completes repair on step 2 confirm and sets lighthouse_repaired flag', () => {
    const { engine, bus } = makeEngine()
    const repairedEvents: string[] = []
    bus.on('lighthouse.repaired', () => repairedEvents.push('repaired'))

    engine.loadState({ ...startedState(), lighthouseRepairStep: 2 })
    engine.handleAction({ type: 'minigame.confirm' })

    const s = engine.getState()
    expect(s.worldFlags.has('lighthouse_repaired')).toBe(true)
    expect(s.activeMinigame).toBeNull()
    expect(s.phase).toBe('morning')           // restored from priorPhase
    expect(repairedEvents).toContain('repaired')
  })

  it('resets minigame timer on each step advance', () => {
    const { engine } = makeEngine()
    const oldTimerStart = Date.now() - 5000   // 5s ago
    engine.loadState({ ...startedState(), minigameTimerStart: oldTimerStart })
    engine.handleAction({ type: 'minigame.confirm' })

    const newTimerStart = engine.getState().minigameTimerStart ?? 0
    expect(newTimerStart).toBeGreaterThanOrEqual(oldTimerStart)
  })
})

describe('LighthouseMinigame — timer expiry failure', () => {
  function expiredState(): IGameState {
    const base = createInitialState()
    return {
      ...base,
      phase: 'minigame',
      priorPhase: 'morning',
      activeMinigame: 'lighthouse_repair',
      lighthouseRepairStep: 0,
      minigameTimerStart: Date.now() - 31000,   // 31s ago — definitely expired
      player: {
        ...base.player,
        currentLocation: 'lighthouse_top' as LocationId,
        stamina: 5,
      },
      inventory: new Set(['oil_flask', 'wick', 'lens_component']) as ReadonlySet<ItemId>,
    }
  }

  it('fails the minigame when timer has expired before confirm', () => {
    const { engine, bus } = makeEngine()
    const failedEvents: string[] = []
    bus.on('lighthouse.repair.failed', () => failedEvents.push('failed'))

    engine.loadState(expiredState())
    engine.handleAction({ type: 'minigame.confirm' })

    const s = engine.getState()
    expect(s.activeMinigame).toBeNull()
    expect(s.phase).toBe('morning')
    expect(s.worldFlags.has('lighthouse_repaired')).toBe(false)
    expect(failedEvents).toContain('failed')
  })

  it('deducts 1 stamina on failure', () => {
    const { engine } = makeEngine()
    engine.loadState(expiredState())
    engine.handleAction({ type: 'minigame.confirm' })

    expect(engine.getState().player.stamina).toBe(4)   // 5 - 1
  })

  it('does not deduct stamina below 0', () => {
    const { engine } = makeEngine()
    const zeroStamina = { ...expiredState(), player: { ...expiredState().player, stamina: 0 } }
    engine.loadState(zeroStamina)
    engine.handleAction({ type: 'minigame.confirm' })

    expect(engine.getState().player.stamina).toBe(0)
  })

  it('allows retry after failure (can start minigame again)', () => {
    const { engine } = makeEngine()
    engine.loadState(expiredState())
    engine.handleAction({ type: 'minigame.confirm' })  // fail

    // Re-enter minigame (state is back at lighthouse_top with items still in inventory)
    engine.handleAction({ type: 'lighthouse.repair.start' })
    expect(engine.getState().phase).toBe('minigame')
    expect(engine.getState().activeMinigame).toBe('lighthouse_repair')
    expect(engine.getState().lighthouseRepairStep).toBe(0)
  })
})

describe('LighthouseMinigame — minigame.confirm is a no-op when no minigame active', () => {
  it('does nothing when activeMinigame is null', () => {
    const { engine } = makeEngine()
    const before = engine.getState()
    engine.handleAction({ type: 'minigame.confirm' })
    const after = engine.getState()
    expect(after.phase).toBe(before.phase)
  })
})
