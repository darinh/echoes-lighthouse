import { describe, it, expect, beforeEach } from 'vitest'
import { InsightBankingSystem } from '@/systems/InsightBankingSystem.js'
import { EventBus } from '@/engine/EventBus.js'
import { createInitialState } from '@/engine/initialState.js'
import type { IGameState, IGameEvent, GameEventType } from '@/interfaces/index.js'

function makeEvent(type: GameEventType, payload: Record<string, unknown> = {}): IGameEvent {
  return { type, payload, timestamp: Date.now() }
}

function withInsight(state: IGameState, insight: number, banked = 0): IGameState {
  return { ...state, player: { ...state.player, insight, insightBanked: banked } }
}

describe('[GDD §2] InsightBankingSystem', () => {
  let system: InsightBankingSystem
  let state: IGameState

  beforeEach(() => {
    system = new InsightBankingSystem(new EventBus())
    state = system.init(createInitialState())
  })

  describe('insight.banked', () => {
    it('moves insight to insightBanked', () => {
      const s = withInsight(state, 50)
      const next = system.onEvent(makeEvent('insight.banked', { amount: 50 }), s)
      expect(next.player.insight).toBe(0)
      expect(next.player.insightBanked).toBe(50)
    })

    it('banking more than available only banks what is available', () => {
      const s = withInsight(state, 30)
      const next = system.onEvent(makeEvent('insight.banked', { amount: 100 }), s)
      expect(next.player.insight).toBe(0)
      expect(next.player.insightBanked).toBe(30)
    })

    it('accumulates banked insight', () => {
      let s = withInsight(state, 50)
      s = system.onEvent(makeEvent('insight.banked', { amount: 20 }), s)
      s = { ...s, player: { ...s.player, insight: s.player.insight + 30 } }
      s = system.onEvent(makeEvent('insight.banked', { amount: 30 }), s)
      expect(s.player.insightBanked).toBe(50)
    })
  })

  describe('player.died', () => {
    it('resets insight to 0', () => {
      const s = withInsight(state, 80, 40)
      const next = system.onEvent(makeEvent('player.died'), s)
      expect(next.player.insight).toBe(0)
    })

    it('preserves insightBanked on death', () => {
      const s = withInsight(state, 80, 40)
      const next = system.onEvent(makeEvent('player.died'), s)
      expect(next.player.insightBanked).toBe(40)
    })
  })

  describe('loop.started', () => {
    it('restores banked insight to player insight', () => {
      const s = withInsight(state, 0, 60)
      const next = system.onEvent(makeEvent('loop.started', { loopCount: 2 }), s)
      expect(next.player.insight).toBe(60)
    })
  })
})
