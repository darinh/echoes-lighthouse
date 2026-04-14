import { describe, it, expect, beforeEach } from 'vitest'
import { EndingSystem } from '@/systems/EndingSystem.js'
import { EventBus } from '@/engine/EventBus.js'
import { createInitialState } from '@/engine/initialState.js'
import type { IGameState, IGameEvent, GameEventType, InsightCardId } from '@/interfaces/index.js'

function makeEvent(type: GameEventType, payload: Record<string, unknown> = {}): IGameEvent {
  return { type, payload, timestamp: Date.now() }
}

function withSealedInsights(state: IGameState, ids: string[]): IGameState {
  return {
    ...state,
    player: {
      ...state.player,
      sealedInsights: new Set(ids) as ReadonlySet<InsightCardId>,
    }
  }
}

function withMoralWeight(state: IGameState, weight: number): IGameState {
  return { ...state, player: { ...state.player, moralWeight: weight } }
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

  describe('liberation ending', () => {
    it('triggers when vael_origin + mechanism_purpose sealed and moralWeight <= 20', () => {
      let state = createInitialState()
      state = withSealedInsights(state, ['vael_origin', 'mechanism_purpose'])
      state = withMoralWeight(state, 10)
      system.onEvent(makeEvent('loop.dawn'), state)
      expect(emitted.length).toBe(1)
      expect(emitted[0].payload.endingId).toBe('liberation')
    })

    it('does NOT trigger when moralWeight > 20', () => {
      let state = createInitialState()
      state = withSealedInsights(state, ['vael_origin', 'mechanism_purpose'])
      state = withMoralWeight(state, 30)
      system.onEvent(makeEvent('loop.dawn'), state)
      expect(emitted.length).toBe(0)
    })

    it('does NOT trigger with missing insights', () => {
      let state = createInitialState()
      state = withSealedInsights(state, ['vael_origin'])
      state = withMoralWeight(state, 5)
      system.onEvent(makeEvent('loop.dawn'), state)
      expect(emitted.length).toBe(0)
    })
  })

  describe('keepers_peace ending', () => {
    const ALL_7 = ['light_source_truth', 'vael_origin', 'keeper_betrayal', 'spirit_binding', 'mechanism_purpose', 'island_history', 'final_signal']

    it('triggers when all 7 insights sealed and lighthouse lit', () => {
      let state = createInitialState()
      state = withSealedInsights(state, ALL_7)
      state = { ...state, lighthouseLitThisLoop: true }
      state = withMoralWeight(state, 25)  // above liberation threshold (max 20)
      system.onEvent(makeEvent('loop.dawn'), state)
      expect(emitted.some(e => e.payload.endingId === 'keepers_peace')).toBe(true)
    })

    it('does NOT trigger without all 7 insights', () => {
      let state = createInitialState()
      state = withSealedInsights(state, ALL_7.slice(0, 6))
      state = { ...state, lighthouseLitThisLoop: true }
      system.onEvent(makeEvent('loop.dawn'), state)
      expect(emitted.filter(e => e.payload.endingId === 'keepers_peace').length).toBe(0)
    })

    it('does NOT trigger when lighthouse not lit', () => {
      let state = createInitialState()
      state = withSealedInsights(state, ALL_7)
      state = { ...state, lighthouseLitThisLoop: false }
      system.onEvent(makeEvent('loop.dawn'), state)
      expect(emitted.filter(e => e.payload.endingId === 'keepers_peace').length).toBe(0)
    })
  })

  describe('sacrifice ending', () => {
    it('triggers when keeper_betrayal + spirit_binding sealed and moralWeight >= 40', () => {
      let state = createInitialState()
      state = withSealedInsights(state, ['keeper_betrayal', 'spirit_binding'])
      state = withMoralWeight(state, 50)
      system.onEvent(makeEvent('loop.dawn'), state)
      expect(emitted.some(e => e.payload.endingId === 'sacrifice')).toBe(true)
    })
  })

  describe('corruption ending', () => {
    it('triggers when island_history sealed and moralWeight >= 80', () => {
      let state = createInitialState()
      state = withSealedInsights(state, ['island_history'])
      state = withMoralWeight(state, 85)
      system.onEvent(makeEvent('loop.dawn'), state)
      expect(emitted.some(e => e.payload.endingId === 'corruption')).toBe(true)
    })
  })

  describe('no ending', () => {
    it('does not trigger when no conditions are met', () => {
      const state = createInitialState()
      system.onEvent(makeEvent('loop.dawn'), state)
      expect(emitted.length).toBe(0)
    })

    it('does not trigger from non-dawn/sealed events', () => {
      let state = createInitialState()
      state = withSealedInsights(state, ['vael_origin', 'mechanism_purpose'])
      state = withMoralWeight(state, 5)
      system.onEvent(makeEvent('loop.started'), state)
      expect(emitted.length).toBe(0)
    })
  })
})
