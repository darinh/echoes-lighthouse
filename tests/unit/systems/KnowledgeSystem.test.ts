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

  describe('daily insight cap', () => {
    it('gains up to 150 at full rate in one loop', () => {
      const next = system.onEvent(makeEvent('insight.gained', { amount: 150 }), state)
      expect(next.player.insight).toBe(150)
    })

    it('applies 40% multiplier to insight beyond the 150 cap', () => {
      // Gain 150 (at cap), then gain 100 more (should yield 40 effective)
      let s = system.onEvent(makeEvent('insight.gained', { amount: 150 }), state)
      s = system.onEvent(makeEvent('insight.gained', { amount: 100 }), s)
      // 150 + round(100 * 0.4) = 150 + 40 = 190
      expect(s.player.insight).toBe(190)
    })

    it('resets the daily cap on loop.started', () => {
      let s = system.onEvent(makeEvent('insight.gained', { amount: 150 }), state)
      s = system.onEvent(makeEvent('loop.started', { loopCount: 2 }), s)
      // After reset, full rate resumes
      s = system.onEvent(makeEvent('insight.gained', { amount: 50 }), s)
      expect(s.player.insight).toBe(200)
    })
  })

  describe('archive.page.found', () => {
    it('increments archiveMastery page count for the domain', () => {
      const next = system.onEvent(makeEvent('archive.page.found', { domain: 'history', pageId: 'p1' }), state)
      expect(next.player.archiveMastery['history']).toBe(1)
    })

    it('emits archive.domain.unlocked at novice threshold (3 pages)', () => {
      const events: unknown[] = []
      bus.on('archive.domain.unlocked', e => events.push(e))
      let s = state
      for (let i = 0; i < 3; i++) {
        s = system.onEvent(makeEvent('archive.page.found', { domain: 'occult', pageId: `p${i}` }), s)
      }
      expect(events).toHaveLength(1)
    })

    it('emits archive.domain.unlocked at adept threshold (6 pages)', () => {
      const events: unknown[] = []
      bus.on('archive.domain.unlocked', e => events.push(e))
      let s = state
      for (let i = 0; i < 6; i++) {
        s = system.onEvent(makeEvent('archive.page.found', { domain: 'maritime', pageId: `p${i}` }), s)
      }
      // Should have fired for novice (3) and adept (6)
      expect(events).toHaveLength(2)
    })

    it('emits archive.domain.unlocked at master threshold (10 pages)', () => {
      const events: unknown[] = []
      bus.on('archive.domain.unlocked', e => events.push(e))
      let s = state
      for (let i = 0; i < 10; i++) {
        s = system.onEvent(makeEvent('archive.page.found', { domain: 'alchemy', pageId: `p${i}` }), s)
      }
      expect(events).toHaveLength(3)
    })
  })

  describe('location.entered — discovery insight', () => {
    it('awards insight when a new location is discovered', () => {
      const next = system.onEvent(makeEvent('location.entered', { locationId: 'harbor' }), state)
      expect(next.player.discoveredLocations.has('harbor')).toBe(true)
      expect(next.player.insight).toBeGreaterThan(0)
    })

    it('does not award insight for already-discovered locations', () => {
      let s = system.onEvent(makeEvent('location.entered', { locationId: 'harbor' }), state)
      const insightAfterFirst = s.player.insight
      s = system.onEvent(makeEvent('location.entered', { locationId: 'harbor' }), s)
      expect(s.player.insight).toBe(insightAfterFirst)
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
