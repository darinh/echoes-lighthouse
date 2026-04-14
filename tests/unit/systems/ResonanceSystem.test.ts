import { describe, it, expect, beforeEach } from 'vitest'
import { ResonanceSystem } from '@/systems/ResonanceSystem.js'
import { EventBus } from '@/engine/EventBus.js'
import { createInitialState } from '@/engine/initialState.js'
import type { IGameState, IGameEvent, GameEventType } from '@/interfaces/index.js'

function makeEvent(type: GameEventType, payload: Record<string, unknown> = {}): IGameEvent {
  return { type, payload, timestamp: Date.now() }
}

describe('[GDD §4] ResonanceSystem — NPC trust and tier unlocks', () => {
  let system: ResonanceSystem
  let bus: EventBus
  let state: IGameState

  beforeEach(() => {
    bus = new EventBus()
    system = new ResonanceSystem(bus)
    state = system.init(createInitialState())
  })

  describe('trust gains', () => {
    it('increases trust for the target NPC', () => {
      const next = system.onEvent(makeEvent('npc.trust.gained', { npcId: 'maren', amount: 15 }), state)
      expect(next.player.trust['maren']).toBe(15)
    })

    it('accumulates trust across multiple events', () => {
      let s = system.onEvent(makeEvent('npc.trust.gained', { npcId: 'silas', amount: 5 }), state)
      s = system.onEvent(makeEvent('npc.trust.gained', { npcId: 'silas', amount: 8 }), s)
      expect(s.player.trust['silas']).toBe(13)
    })

    it('does not exceed the trust cap of 200', () => {
      let s = system.onEvent(makeEvent('npc.trust.gained', { npcId: 'maren', amount: 190 }), state)
      s = system.onEvent(makeEvent('npc.trust.gained', { npcId: 'maren', amount: 50 }), s)
      expect(s.player.trust['maren']).toBe(200)
    })

    it('does not affect other NPCs', () => {
      const next = system.onEvent(makeEvent('npc.trust.gained', { npcId: 'maren', amount: 20 }), state)
      expect(next.player.trust['silas']).toBe(0)
    })
  })

  describe('trust loss', () => {
    it('reduces trust and floors at 0', () => {
      let s = system.onEvent(makeEvent('npc.trust.gained', { npcId: 'maren', amount: 10 }), state)
      s = system.onEvent(makeEvent('npc.trust.lost', { npcId: 'maren', amount: 15 }), s)
      expect(s.player.trust['maren']).toBe(0)
    })

    it('betrayal reduces the trust cap by 20', () => {
      // Gain 200 trust, then betray — cap drops to 180.
      let s = system.onEvent(makeEvent('npc.trust.gained', { npcId: 'maren', amount: 200 }), state)
      s = system.onEvent(makeEvent('npc.trust.lost', { npcId: 'maren', amount: 0, betrayal: true }), s)
      // After betrayal, gaining more trust should be capped at 180.
      s = system.onEvent(makeEvent('npc.trust.gained', { npcId: 'maren', amount: 200 }), s)
      expect(s.player.trust['maren']).toBe(180)
    })
  })

  describe('tier unlocks', () => {
    it('tier remains 0 below threshold of 10', () => {
      const next = system.onEvent(makeEvent('npc.trust.gained', { npcId: 'maren', amount: 9 }), state)
      expect(next.player.resonance['maren']).toBe(0)
    })

    it('unlocks tier 1 at trust 10', () => {
      const next = system.onEvent(makeEvent('npc.trust.gained', { npcId: 'maren', amount: 10 }), state)
      expect(next.player.resonance['maren']).toBe(1)
    })

    it('unlocks tier 2 at trust 20', () => {
      const next = system.onEvent(makeEvent('npc.trust.gained', { npcId: 'maren', amount: 20 }), state)
      expect(next.player.resonance['maren']).toBe(2)
    })

    it('updates npc dialogueTier on tier unlock', () => {
      const next = system.onEvent(makeEvent('npc.trust.gained', { npcId: 'maren', amount: 35 }), state)
      expect(next.npcStates['maren'].dialogueTier).toBe(3)
    })

    it('emits npc.tier.unlocked event', () => {
      const events: unknown[] = []
      bus.on('npc.tier.unlocked', e => events.push(e))
      system.onEvent(makeEvent('npc.trust.gained', { npcId: 'maren', amount: 10 }), state)
      expect(events).toHaveLength(1)
    })
  })
})
