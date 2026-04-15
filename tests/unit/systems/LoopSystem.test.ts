import { describe, it, expect, beforeEach } from 'vitest'
import { LoopSystem } from '@/systems/LoopSystem.js'
import { EventBus } from '@/engine/EventBus.js'
import { createInitialState } from '@/engine/initialState.js'
import type { IGameState, IGameEvent, GameEventType, LocationId, InsightCardId } from '@/interfaces/index.js'

function makeEvent(type: GameEventType, payload: Record<string, unknown> = {}): IGameEvent {
  return { type, payload, timestamp: Date.now() }
}

describe('[GDD §1.1] LoopSystem — Death and loop reset', () => {
  let system: LoopSystem
  let bus: EventBus

  beforeEach(() => {
    bus = new EventBus()
    system = new LoopSystem(bus)
  })

  describe('init', () => {
    it('sets phase to dawn on init', () => {
      const result = system.init(createInitialState())
      expect(result.phase).toBe('dawn')
    })

    it('sets loopCount to 1 on first init', () => {
      const result = system.init(createInitialState())
      expect(result.player.loopCount).toBe(1)
    })
  })

  describe('player.died — physical stats reset [GDD §1.1]', () => {
    it('resets stamina to 100', () => {
      const state = withPhysical(system.init(createInitialState()), { stamina: 20 })
      const next = system.onEvent(makeEvent('player.died'), state)
      expect(next.player.stamina).toBe(100)
    })

    it('resets lightReserves to 100', () => {
      const state = withPhysical(system.init(createInitialState()), { lightReserves: 5 })
      const next = system.onEvent(makeEvent('player.died'), state)
      expect(next.player.lightReserves).toBe(100)
    })

    it('resets hearts to 3', () => {
      const state = withPhysical(system.init(createInitialState()), { hearts: 1 })
      const next = system.onEvent(makeEvent('player.died'), state)
      expect(next.player.hearts).toBe(3)
    })

    it('resets location to keepers_cottage', () => {
      const state = withLocation(system.init(createInitialState()), 'harbor')
      const next = system.onEvent(makeEvent('player.died'), state)
      expect(next.player.currentLocation).toBe('keepers_cottage')
    })

    it('resets phase to dawn', () => {
      const state = { ...system.init(createInitialState()), phase: 'night_dark' as const }
      const next = system.onEvent(makeEvent('player.died'), state)
      expect(next.phase).toBe('dawn')
    })

    it('resets dayTimeRemaining to 1', () => {
      const state = { ...system.init(createInitialState()), dayTimeRemaining: 0 }
      const next = system.onEvent(makeEvent('player.died'), state)
      expect(next.dayTimeRemaining).toBe(1)
    })
  })

  describe('player.died — persistent stats survive [GDD §1.1]', () => {
    it('only banked insight survives — unbanked insight is lost', () => {
      const state = withInsight(system.init(createInitialState()), { insight: 80, insightBanked: 30 })
      const next = system.onEvent(makeEvent('player.died'), state)
      expect(next.player.insight).toBe(30)
    })

    it('increments loopCount', () => {
      const state = system.init(createInitialState())
      const next = system.onEvent(makeEvent('player.died'), state)
      expect(next.player.loopCount).toBe(2)
    })

    it('preserves resonance per NPC', () => {
      const state = withResonance(system.init(createInitialState()), 'maren', 3)
      const next = system.onEvent(makeEvent('player.died'), state)
      expect(next.player.resonance.maren).toBe(3)
    })

    it('preserves archiveMastery', () => {
      const state = withArchive(system.init(createInitialState()), 'history', 4)
      const next = system.onEvent(makeEvent('player.died'), state)
      expect(next.player.archiveMastery.history).toBe(4)
    })

    it('preserves sealedInsights', () => {
      const state = withSealedInsight(system.init(createInitialState()), 'blacksmith_lying')
      const next = system.onEvent(makeEvent('player.died'), state)
      expect(next.player.sealedInsights.has('blacksmith_lying')).toBe(true)
    })

    it('preserves discoveredLocations', () => {
      const state = withDiscovered(system.init(createInitialState()), 'harbor')
      const next = system.onEvent(makeEvent('player.died'), state)
      expect(next.player.discoveredLocations.has('harbor')).toBe(true)
    })

    it('preserves moralWeight', () => {
      const state = withMoralWeight(system.init(createInitialState()), 15)
      const next = system.onEvent(makeEvent('player.died'), state)
      expect(next.player.moralWeight).toBe(15)
    })
  })

  describe('day timer', () => {
    it('does not drain in title phase', () => {
      const state = { ...createInitialState(), phase: 'title' as const, dayTimeRemaining: 1 }
      const next = system.update(state, 1000)
      expect(next.dayTimeRemaining).toBe(1)
    })

    it('drains during day phase', () => {
      const state = { ...system.init(createInitialState()), phase: 'morning' as const, dayTimeRemaining: 1 }
      const next = system.update(state, 1000)
      expect(next.dayTimeRemaining).toBeLessThan(1)
    })

    it('transitions to night_dark when timer hits zero', () => {
      const state = { ...system.init(createInitialState()), phase: 'morning' as const, dayTimeRemaining: 0.000001 }
      const next = system.update(state, 60_000)
      expect(next.phase).toBe('night_dark')
      expect(next.dayTimeRemaining).toBe(0)
    })
  })
})

// ── State helpers ─────────────────────────────────────────────────────────────

function withPhysical(s: IGameState, p: Partial<IGameState['player']>): IGameState {
  return { ...s, player: { ...s.player, ...p } }
}
function withLocation(s: IGameState, loc: IGameState['player']['currentLocation']): IGameState {
  return { ...s, player: { ...s.player, currentLocation: loc } }
}
function withInsight(s: IGameState, p: { insight: number; insightBanked: number }): IGameState {
  return { ...s, player: { ...s.player, ...p } }
}
function withResonance(s: IGameState, npc: string, level: number): IGameState {
  return { ...s, player: { ...s.player, resonance: { ...s.player.resonance, [npc]: level } } }
}
function withArchive(s: IGameState, domain: string, level: number): IGameState {
  return { ...s, player: { ...s.player, archiveMastery: { ...s.player.archiveMastery, [domain]: level } } }
}
function withSealedInsight(s: IGameState, id: InsightCardId): IGameState {
  return { ...s, player: { ...s.player, sealedInsights: new Set([...s.player.sealedInsights, id]) as ReadonlySet<InsightCardId> } }
}
function withDiscovered(s: IGameState, loc: LocationId): IGameState {
  return { ...s, player: { ...s.player, discoveredLocations: new Set([...s.player.discoveredLocations, loc]) as ReadonlySet<LocationId> } }
}
function withMoralWeight(s: IGameState, weight: number): IGameState {
  return { ...s, player: { ...s.player, moralWeight: weight } }
}
