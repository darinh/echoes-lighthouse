import { describe, it, expect, beforeEach } from 'vitest'
import { EndingSystem } from '@/systems/EndingSystem.js'
import { EventBus } from '@/engine/EventBus.js'
import { createInitialState } from '@/engine/initialState.js'
import type { IGameState, IGameEvent, GameEventType, InsightCardId, NPCId } from '@/interfaces/index.js'

function makeEvent(type: GameEventType, payload: Record<string, unknown> = {}): IGameEvent {
  return { type, payload, timestamp: Date.now() }
}

const ALL_SEVEN: InsightCardId[] = [
  'light_source_truth', 'vael_origin', 'keeper_betrayal',
  'spirit_binding', 'mechanism_purpose', 'island_history', 'final_signal',
]

function withSealedInsights(state: IGameState, ids: string[]): IGameState {
  return {
    ...state,
    player: {
      ...state.player,
      sealedInsights: new Set(ids) as ReadonlySet<InsightCardId>,
    },
  }
}

function withMoralWeight(state: IGameState, weight: number): IGameState {
  return { ...state, player: { ...state.player, moralWeight: weight } }
}

function withLoopCount(state: IGameState, count: number): IGameState {
  return { ...state, player: { ...state.player, loopCount: count } }
}

function withWorldFlag(state: IGameState, flag: string): IGameState {
  return { ...state, worldFlags: new Set([...state.worldFlags, flag]) }
}

function withNPCTrust(state: IGameState, npcId: NPCId, trust: number): IGameState {
  return {
    ...state,
    player: {
      ...state.player,
      trust: { ...state.player.trust, [npcId]: trust },
    },
  }
}

describe('EndingSystem', () => {
  let system: EndingSystem
  let bus: EventBus
  let emitted: Array<{ type: string; payload: Record<string, unknown> }>

  beforeEach(() => {
    bus = new EventBus()
    emitted = []
    bus.on('ending.triggered', (e) => emitted.push({ type: e.type, payload: e.payload as Record<string, unknown> }))
    system = new EndingSystem(bus)
  })

  // ── transcendence (secret) ────────────────────────────────────────────────

  describe('transcendence ending (secret)', () => {
    it('triggers when all 7 insights are sealed', () => {
      let state = createInitialState()
      state = withSealedInsights(state, ALL_SEVEN)
      system.onEvent(makeEvent('insight.card.sealed'), state)
      expect(emitted.length).toBe(1)
      expect(emitted[0].payload.endingId).toBe('transcendence')
    })

    it('does NOT trigger transcendence with only 6 of 7 insights', () => {
      let state = createInitialState()
      state = withSealedInsights(state, ALL_SEVEN.slice(0, 6))
      system.onEvent(makeEvent('insight.card.sealed'), state)
      expect(emitted.filter(e => e.payload.endingId === 'transcendence').length).toBe(0)
    })

    it('takes priority over light_restored even when that would also match', () => {
      let state = createInitialState()
      state = withSealedInsights(state, ALL_SEVEN)
      state = withWorldFlag(state, 'lighthouse_repaired')
      state = withMoralWeight(state, 10)
      system.onEvent(makeEvent('loop.dawn'), state)
      expect(emitted[0].payload.endingId).toBe('transcendence')
    })
  })

  // ── light_restored ────────────────────────────────────────────────────────

  describe('light_restored ending', () => {
    it('triggers with ≥5 insights + lighthouse_repaired + moralWeight ≤ 30', () => {
      let state = createInitialState()
      state = withSealedInsights(state, ALL_SEVEN.slice(0, 5))
      state = withWorldFlag(state, 'lighthouse_repaired')
      state = withMoralWeight(state, 20)
      system.onEvent(makeEvent('loop.dawn'), state)
      expect(emitted.some(e => e.payload.endingId === 'light_restored')).toBe(true)
    })

    it('does NOT trigger without lighthouse_repaired flag', () => {
      let state = createInitialState()
      state = withSealedInsights(state, ALL_SEVEN.slice(0, 5))
      state = withMoralWeight(state, 20)
      system.onEvent(makeEvent('loop.dawn'), state)
      expect(emitted.filter(e => e.payload.endingId === 'light_restored').length).toBe(0)
    })

    it('does NOT trigger when moralWeight > 30', () => {
      let state = createInitialState()
      state = withSealedInsights(state, ALL_SEVEN.slice(0, 5))
      state = withWorldFlag(state, 'lighthouse_repaired')
      state = withMoralWeight(state, 31)
      system.onEvent(makeEvent('loop.dawn'), state)
      expect(emitted.filter(e => e.payload.endingId === 'light_restored').length).toBe(0)
    })

    it('does NOT trigger with fewer than 5 insights', () => {
      let state = createInitialState()
      state = withSealedInsights(state, ALL_SEVEN.slice(0, 4))
      state = withWorldFlag(state, 'lighthouse_repaired')
      state = withMoralWeight(state, 20)
      system.onEvent(makeEvent('loop.dawn'), state)
      expect(emitted.filter(e => e.payload.endingId === 'light_restored').length).toBe(0)
    })
  })

  // ── sunken_accord ─────────────────────────────────────────────────────────

  describe('sunken_accord ending', () => {
    it('triggers with vael_request_granted + maren trust ≥ 5 + balanced moralWeight', () => {
      let state = createInitialState()
      state = withWorldFlag(state, 'vael_request_granted')
      state = withNPCTrust(state, 'maren', 10)
      state = withMoralWeight(state, 0)
      system.onEvent(makeEvent('npc.trust.changed'), state)
      expect(emitted.some(e => e.payload.endingId === 'sunken_accord')).toBe(true)
    })

    it('does NOT trigger without vael_request_granted flag', () => {
      let state = createInitialState()
      state = withNPCTrust(state, 'maren', 10)
      state = withMoralWeight(state, 0)
      system.onEvent(makeEvent('npc.trust.changed'), state)
      expect(emitted.filter(e => e.payload.endingId === 'sunken_accord').length).toBe(0)
    })

    it('does NOT trigger when maren trust < 5', () => {
      let state = createInitialState()
      state = withWorldFlag(state, 'vael_request_granted')
      state = withNPCTrust(state, 'maren', 4)
      state = withMoralWeight(state, 0)
      system.onEvent(makeEvent('loop.dawn'), state)
      expect(emitted.filter(e => e.payload.endingId === 'sunken_accord').length).toBe(0)
    })

    it('does NOT trigger when moralWeight > 20', () => {
      let state = createInitialState()
      state = withWorldFlag(state, 'vael_request_granted')
      state = withNPCTrust(state, 'maren', 10)
      state = withMoralWeight(state, 21)
      system.onEvent(makeEvent('loop.dawn'), state)
      expect(emitted.filter(e => e.payload.endingId === 'sunken_accord').length).toBe(0)
    })

    it('does NOT trigger when moralWeight < -20', () => {
      let state = createInitialState()
      state = withWorldFlag(state, 'vael_request_granted')
      state = withNPCTrust(state, 'maren', 10)
      state = withMoralWeight(state, -21)
      system.onEvent(makeEvent('loop.dawn'), state)
      expect(emitted.filter(e => e.payload.endingId === 'sunken_accord').length).toBe(0)
    })
  })

  // ── keepers_bargain ───────────────────────────────────────────────────────

  describe('keepers_bargain ending', () => {
    it('triggers after ≥7 loops with 0 insights sealed and moralWeight ≤ 20', () => {
      let state = createInitialState()
      state = withLoopCount(state, 7)
      state = withMoralWeight(state, 10)
      // sealedInsights is empty by default
      system.onEvent(makeEvent('loop.dawn'), state)
      expect(emitted.some(e => e.payload.endingId === 'keepers_bargain')).toBe(true)
    })

    it('does NOT trigger when any insight is sealed', () => {
      let state = createInitialState()
      state = withLoopCount(state, 7)
      state = withSealedInsights(state, ['vael_origin'])
      state = withMoralWeight(state, 10)
      system.onEvent(makeEvent('loop.dawn'), state)
      expect(emitted.filter(e => e.payload.endingId === 'keepers_bargain').length).toBe(0)
    })

    it('does NOT trigger when loopCount < 7', () => {
      let state = createInitialState()
      state = withLoopCount(state, 6)
      state = withMoralWeight(state, 10)
      system.onEvent(makeEvent('loop.dawn'), state)
      expect(emitted.filter(e => e.payload.endingId === 'keepers_bargain').length).toBe(0)
    })

    it('does NOT trigger when moralWeight > 20', () => {
      let state = createInitialState()
      state = withLoopCount(state, 7)
      state = withMoralWeight(state, 25)
      system.onEvent(makeEvent('loop.dawn'), state)
      expect(emitted.filter(e => e.payload.endingId === 'keepers_bargain').length).toBe(0)
    })
  })

  // ── drowned_truth ─────────────────────────────────────────────────────────

  describe('drowned_truth ending', () => {
    it('triggers with ≥3 insights sealed and total NPC trust ≤ 10', () => {
      let state = createInitialState()
      state = withSealedInsights(state, ['vael_origin', 'keeper_betrayal', 'island_history'])
      // default trust is all zeros → totalTrust = 0
      system.onEvent(makeEvent('insight.card.sealed'), state)
      expect(emitted.some(e => e.payload.endingId === 'drowned_truth')).toBe(true)
    })

    it('does NOT trigger with only 2 insights sealed', () => {
      let state = createInitialState()
      state = withSealedInsights(state, ['vael_origin', 'keeper_betrayal'])
      system.onEvent(makeEvent('insight.card.sealed'), state)
      expect(emitted.filter(e => e.payload.endingId === 'drowned_truth').length).toBe(0)
    })

    it('does NOT trigger when total trust > 10', () => {
      let state = createInitialState()
      state = withSealedInsights(state, ['vael_origin', 'keeper_betrayal', 'island_history'])
      state = withNPCTrust(state, 'maren', 11)
      system.onEvent(makeEvent('loop.dawn'), state)
      expect(emitted.filter(e => e.payload.endingId === 'drowned_truth').length).toBe(0)
    })
  })

  // ── endless_loop ──────────────────────────────────────────────────────────

  describe('endless_loop ending', () => {
    it('triggers when loopCount ≥ 10', () => {
      let state = createInitialState()
      state = withLoopCount(state, 10)
      // seal 1 insight to prevent keepers_bargain from matching
      state = withSealedInsights(state, ['vael_origin'])
      system.onEvent(makeEvent('loop.dawn'), state)
      expect(emitted.some(e => e.payload.endingId === 'endless_loop')).toBe(true)
    })

    it('does NOT trigger when loopCount < 10', () => {
      let state = createInitialState()
      state = withLoopCount(state, 9)
      state = withSealedInsights(state, ['vael_origin'])
      system.onEvent(makeEvent('loop.dawn'), state)
      expect(emitted.filter(e => e.payload.endingId === 'endless_loop').length).toBe(0)
    })
  })

  // ── event filtering ───────────────────────────────────────────────────────

  describe('event filtering', () => {
    it('fires on loop.started', () => {
      let state = createInitialState()
      state = withLoopCount(state, 10)
      state = withSealedInsights(state, ['vael_origin'])
      system.onEvent(makeEvent('loop.started'), state)
      expect(emitted.length).toBe(1)
    })

    it('fires on npc.trust.changed', () => {
      let state = createInitialState()
      state = withLoopCount(state, 10)
      state = withSealedInsights(state, ['vael_origin'])
      system.onEvent(makeEvent('npc.trust.changed'), state)
      expect(emitted.length).toBe(1)
    })

    it('does NOT fire on unrelated events', () => {
      let state = createInitialState()
      state = withLoopCount(state, 10)
      state = withSealedInsights(state, ['vael_origin'])
      system.onEvent(makeEvent('location.entered'), state)
      expect(emitted.length).toBe(0)
    })

    it('does not trigger when phase is already "ending"', () => {
      let state = createInitialState()
      state = withLoopCount(state, 10)
      state = { ...state, phase: 'ending' }
      system.onEvent(makeEvent('loop.dawn'), state)
      expect(emitted.length).toBe(0)
    })
  })

  // ── no ending ────────────────────────────────────────────────────────────

  describe('no ending', () => {
    it('does not trigger when no conditions are met', () => {
      const state = createInitialState()
      system.onEvent(makeEvent('loop.dawn'), state)
      expect(emitted.length).toBe(0)
    })
  })
})
