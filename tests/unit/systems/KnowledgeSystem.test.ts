import { describe, it, expect, beforeEach } from 'vitest'
import { KnowledgeSystem } from '@/systems/KnowledgeSystem.js'
import { EventBus } from '@/engine/EventBus.js'
import { createInitialState } from '@/engine/initialState.js'
import type { IGameState, IGameEvent, GameEventType } from '@/interfaces/index.js'

function makeEvent(type: GameEventType, payload: Record<string, unknown> = {}): IGameEvent {
  return { type, payload, timestamp: Date.now() }
}

describe('[GDD §1.2] KnowledgeSystem — Insight economy', () => {
  let system: KnowledgeSystem
  let bus: EventBus
  let state: IGameState

  beforeEach(() => {
    bus = new EventBus()
    system = new KnowledgeSystem(bus)
    state = system.init(createInitialState())
  })

  describe('insight.gained event', () => {
    it('increases player insight by the given amount', () => {
      const next = system.onEvent(makeEvent('insight.gained', { amount: 15 }), state)
      expect(next.player.insight).toBe(15)
    })

    it('accumulates across multiple events', () => {
      let s = system.onEvent(makeEvent('insight.gained', { amount: 10 }), state)
      s = system.onEvent(makeEvent('insight.gained', { amount: 25 }), s)
      expect(s.player.insight).toBe(35)
    })

    it('never exceeds hard cap of 999 [GDD §1.2]', () => {
      const nearCap = { ...state, player: { ...state.player, insight: 995 } }
      const next = system.onEvent(makeEvent('insight.gained', { amount: 100 }), nearCap)
      expect(next.player.insight).toBe(999)
    })

    it('does not go negative — ignores zero or negative amounts', () => {
      const next = system.onEvent(makeEvent('insight.gained', { amount: 0 }), state)
      expect(next.player.insight).toBe(0)
    })
  })

  describe('unaffected by unrelated events', () => {
    it('returns state unchanged for non-insight events', () => {
      const next = system.onEvent(makeEvent('quest.started', { questId: 'x' }), state)
      expect(next.player.insight).toBe(state.player.insight)
    })
  })

  describe('init', () => {
    it('returns state unmodified on init', () => {
      const base = createInitialState()
      const result = system.init(base)
      expect(result.player.insight).toBe(0)
    })
  })
})
