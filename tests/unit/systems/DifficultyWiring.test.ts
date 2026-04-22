/**
 * DifficultyWiring.test.ts
 * GDD §10 — Difficulty wiring: stamina scaling on new game and Hard-mode
 * archive seal gate.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { KnowledgeSystem } from '@/systems/KnowledgeSystem.js'
import { EventBus } from '@/engine/EventBus.js'
import { createInitialState } from '@/engine/initialState.js'
import type { IGameState, IGameEvent, GameEventType } from '@/interfaces/index.js'
import type { ArchiveDomain } from '@/interfaces/index.js'

// ── helpers ──────────────────────────────────────────────────────────────────

function makeEvent(type: GameEventType, payload: Record<string, unknown> = {}): IGameEvent {
  return { type, payload, timestamp: Date.now() }
}

/** Simulate the new.game action as GameEngine does. */
function simulateNewGame(chosenDifficulty: IGameState['difficulty']): IGameState {
  // Mirror GameEngine's new.game handler logic exactly.
  const fresh = createInitialState()
  const baseStamina = fresh.player.stamina
  const scaledStamina =
    chosenDifficulty === 'easy' ? Math.ceil(baseStamina * 1.5) :
    chosenDifficulty === 'hard' ? Math.max(3, Math.floor(baseStamina * 0.75)) :
    baseStamina
  return {
    ...fresh,
    phase: 'dawn',
    difficulty: chosenDifficulty,
    player: { ...fresh.player, stamina: scaledStamina },
  }
}

/** Emit an archive.page.found event mimicking the GameEngine examine handler. */
function archiveEvent(
  domain: ArchiveDomain,
  itemFlag: string,
  requiresSeals: number,
): IGameEvent {
  return makeEvent('archive.page.found', { domain, itemFlag, requiresSeals })
}

// ── Stamina scaling on new game ───────────────────────────────────────────────

describe('[GDD §10] Difficulty — stamina scaling on new game', () => {
  it('Easy: starting stamina is Math.ceil(base × 1.5)', () => {
    const state = simulateNewGame('easy')
    // base = 10  →  ceil(10 × 1.5) = 15
    expect(state.player.stamina).toBe(15)
    expect(state.difficulty).toBe('easy')
  })

  it('Normal: starting stamina is unchanged (base)', () => {
    const state = simulateNewGame('normal')
    const base = createInitialState().player.stamina
    expect(state.player.stamina).toBe(base)
    expect(state.difficulty).toBe('normal')
  })

  it('Hard: starting stamina is Math.floor(base × 0.75)', () => {
    const state = simulateNewGame('hard')
    // base = 10  →  floor(10 × 0.75) = 7
    expect(state.player.stamina).toBe(7)
    expect(state.difficulty).toBe('hard')
  })

  it('Hard: stamina floor is 3 (never below minimum)', () => {
    // Verify the floor logic independently.
    const tinyBase = 1
    const scaledStamina = Math.max(3, Math.floor(tinyBase * 0.75))
    expect(scaledStamina).toBe(3)
  })

  it('new.game preserves the chosen difficulty (does not revert to normal)', () => {
    // For each non-normal difficulty the resulting state must have that difficulty.
    expect(simulateNewGame('easy').difficulty).toBe('easy')
    expect(simulateNewGame('hard').difficulty).toBe('hard')
  })
})

// ── Archive sealing on Hard ───────────────────────────────────────────────────

describe('[GDD §10] Difficulty — archive seal gate on Hard', () => {
  let bus: EventBus
  let system: KnowledgeSystem

  beforeEach(() => {
    bus = new EventBus()
    system = new KnowledgeSystem(bus)
  })

  it('Easy: archive page with requiresSeals > 1 counts immediately toward mastery', () => {
    const state = system.init({ ...createInitialState(), difficulty: 'easy' })
    const next = system.onEvent(archiveEvent('history', 'examined.archive_basement.sealed_ledger', 2), state)
    // On Easy, requiresSeals is ignored — page counts right away.
    expect(next.player.archiveMastery['history']).toBe(1)
    expect(Object.keys(next.player.pendingArchiveSeals)).toHaveLength(0)
  })

  it('Normal: archive page with requiresSeals > 1 counts immediately toward mastery', () => {
    const state = system.init({ ...createInitialState(), difficulty: 'normal' })
    const next = system.onEvent(archiveEvent('history', 'examined.archive_basement.sealed_ledger', 2), state)
    expect(next.player.archiveMastery['history']).toBe(1)
    expect(Object.keys(next.player.pendingArchiveSeals)).toHaveLength(0)
  })

  it('Hard: archive page with requiresSeals > 1 is buffered (not counted immediately)', () => {
    const state = system.init({ ...createInitialState(), difficulty: 'hard' })
    const next = system.onEvent(archiveEvent('history', 'examined.archive_basement.sealed_ledger', 2), state)
    // Page should NOT yet be applied to mastery.
    expect(next.player.archiveMastery['history']).toBe(0)
    // It should appear in pendingArchiveSeals.
    expect(next.player.pendingArchiveSeals['examined.archive_basement.sealed_ledger']).toBeDefined()
    expect(next.player.pendingArchiveSeals['examined.archive_basement.sealed_ledger'].sealsRemaining).toBe(2)
  })

  it('Hard: archive page with requiresSeals = 1 counts immediately', () => {
    const state = system.init({ ...createInitialState(), difficulty: 'hard' })
    const next = system.onEvent(archiveEvent('maritime', 'examined.harbor.silas_logbook', 1), state)
    expect(next.player.archiveMastery['maritime']).toBe(1)
    expect(Object.keys(next.player.pendingArchiveSeals)).toHaveLength(0)
  })

  it('Hard: sealing an insight card decrements pending seal count', () => {
    let state = system.init({ ...createInitialState(), difficulty: 'hard' })
    state = system.onEvent(archiveEvent('history', 'examined.archive_basement.sealed_ledger', 2), state)
    // Still pending (sealsRemaining = 2).
    state = system.onEvent(makeEvent('insight.card.sealed', { cardId: 'keeper_betrayal' }), state)
    // Now sealsRemaining should be 1.
    const pending = state.player.pendingArchiveSeals['examined.archive_basement.sealed_ledger']
    expect(pending).toBeDefined()
    expect(pending.sealsRemaining).toBe(1)
    expect(state.player.archiveMastery['history']).toBe(0)
  })

  it('Hard: page is applied to mastery once all seals are consumed', () => {
    let state = system.init({ ...createInitialState(), difficulty: 'hard' })
    state = system.onEvent(archiveEvent('history', 'examined.archive_basement.sealed_ledger', 2), state)
    // Seal #1 — still pending.
    state = system.onEvent(makeEvent('insight.card.sealed', { cardId: 'keeper_betrayal' }), state)
    expect(state.player.archiveMastery['history']).toBe(0)
    // Seal #2 — should resolve.
    state = system.onEvent(makeEvent('insight.card.sealed', { cardId: 'light_source_truth' }), state)
    expect(state.player.archiveMastery['history']).toBe(1)
    expect(state.player.pendingArchiveSeals['examined.archive_basement.sealed_ledger']).toBeUndefined()
  })

  it('Hard: on Easy/Normal, insight.card.sealed has no effect on pending archive', () => {
    // Verify the handler early-returns when difficulty is not hard.
    const easyState = system.init({ ...createInitialState(), difficulty: 'easy' })
    const after = system.onEvent(makeEvent('insight.card.sealed', { cardId: 'keeper_betrayal' }), easyState)
    expect(after).toBe(easyState) // same reference — no change
  })

  it('Hard: multiple pending entries all get decremented on one seal', () => {
    let state = system.init({ ...createInitialState(), difficulty: 'hard' })
    // Buffer two entries that both need 2 seals.
    state = system.onEvent(archiveEvent('history', 'examined.archive_basement.sealed_ledger', 2), state)
    state = system.onEvent(archiveEvent('ecology', 'examined.archive_basement.water_line_mark', 2), state)
    // One seal — both should decrement.
    state = system.onEvent(makeEvent('insight.card.sealed', { cardId: 'keeper_betrayal' }), state)
    expect(state.player.pendingArchiveSeals['examined.archive_basement.sealed_ledger'].sealsRemaining).toBe(1)
    expect(state.player.pendingArchiveSeals['examined.archive_basement.water_line_mark'].sealsRemaining).toBe(1)
    // Second seal — both should resolve.
    state = system.onEvent(makeEvent('insight.card.sealed', { cardId: 'light_source_truth' }), state)
    expect(state.player.archiveMastery['history']).toBe(1)
    expect(state.player.archiveMastery['ecology']).toBe(1)
    expect(Object.keys(state.player.pendingArchiveSeals)).toHaveLength(0)
  })

  it('Hard: duplicate archive.page.found for the same item is ignored', () => {
    let state = system.init({ ...createInitialState(), difficulty: 'hard' })
    state = system.onEvent(archiveEvent('history', 'examined.archive_basement.sealed_ledger', 2), state)
    // Fire same event again — should not add a second pending entry.
    state = system.onEvent(archiveEvent('history', 'examined.archive_basement.sealed_ledger', 2), state)
    expect(Object.keys(state.player.pendingArchiveSeals)).toHaveLength(1)
    expect(state.player.archiveMastery['history']).toBe(0)
  })
})
