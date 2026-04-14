import { describe, it, expect, beforeEach } from 'vitest'
import { StaminaSystem } from '@/systems/StaminaSystem.js'
import { EventBus } from '@/engine/EventBus.js'
import { createInitialState } from '@/engine/initialState.js'
import type { IGameState, IGameEvent, GameEventType } from '@/interfaces/index.js'

function makeEvent(type: GameEventType, payload: Record<string, unknown> = {}): IGameEvent {
  return { type, payload, timestamp: Date.now() }
}

function withStamina(state: IGameState, stamina: number, light = 100): IGameState {
  return { ...state, player: { ...state.player, stamina, lightReserves: light } }
}

describe('[GDD §4] StaminaSystem', () => {
  let system: StaminaSystem
  let bus: EventBus
  let state: IGameState

  beforeEach(() => {
    bus = new EventBus()
    system = new StaminaSystem(bus)
    state = system.init(createInitialState())
  })

  describe('location.moved', () => {
    it('drains stamina by 10 per move', () => {
      const next = system.onEvent(makeEvent('location.moved', { from: 'keepers_cottage', to: 'harbor' }), state)
      expect(next.player.stamina).toBe(90)
    })

    it('floors stamina at 0', () => {
      const s = withStamina(state, 5)
      const next = system.onEvent(makeEvent('location.moved', { from: 'keepers_cottage', to: 'harbor' }), s)
      expect(next.player.stamina).toBe(0)
    })

    it('emits player.exhausted when stamina hits 0', () => {
      const events: unknown[] = []
      bus.on('player.exhausted', e => events.push(e))
      const s = withStamina(state, 10)
      system.onEvent(makeEvent('location.moved', { from: 'keepers_cottage', to: 'harbor' }), s)
      expect(events).toHaveLength(1)
    })

    it('emits player.stamina.low when stamina drops below 20', () => {
      const events: unknown[] = []
      bus.on('player.stamina.low', e => events.push(e))
      const s = withStamina(state, 25)
      system.onEvent(makeEvent('location.moved', { from: 'keepers_cottage', to: 'harbor' }), s)
      expect(events).toHaveLength(1)
    })

    it('does not emit player.stamina.low when stamina remains >= 20', () => {
      const events: unknown[] = []
      bus.on('player.stamina.low', e => events.push(e))
      system.onEvent(makeEvent('location.moved', { from: 'keepers_cottage', to: 'harbor' }), state)
      expect(events).toHaveLength(0)
    })
  })

  describe('time.tick', () => {
    it('drains lightReserves by 2 per tick', () => {
      const next = system.onEvent(makeEvent('time.tick', { deltaMs: 1000 }), state)
      expect(next.player.lightReserves).toBe(98)
    })

    it('floors lightReserves at 0', () => {
      const s = withStamina(state, 100, 1)
      const next = system.onEvent(makeEvent('time.tick', { deltaMs: 1000 }), s)
      expect(next.player.lightReserves).toBe(0)
    })

    it('emits player.light.out when lightReserves hits 0', () => {
      const events: unknown[] = []
      bus.on('player.light.out', e => events.push(e))
      const s = withStamina(state, 100, 2)
      system.onEvent(makeEvent('time.tick', { deltaMs: 1000 }), s)
      expect(events).toHaveLength(1)
    })
  })

  describe('player.rested', () => {
    it('restores stamina to 100', () => {
      const s = withStamina(state, 30)
      const next = system.onEvent(makeEvent('player.rested'), s)
      expect(next.player.stamina).toBe(100)
    })
  })

  describe('lantern.refilled', () => {
    it('restores lightReserves to 100', () => {
      const s = withStamina(state, 100, 20)
      const next = system.onEvent(makeEvent('lantern.refilled'), s)
      expect(next.player.lightReserves).toBe(100)
    })
  })
})
