import { describe, it, expect, beforeEach } from 'vitest'
import { MoralWeightSystem } from '@/systems/MoralWeightSystem.js'
import { EventBus } from '@/engine/EventBus.js'
import { createInitialState } from '@/engine/initialState.js'
import type { IGameEvent, GameEventType } from '@/interfaces/index.js'

function makeEvent(type: GameEventType, payload: Record<string, unknown> = {}): IGameEvent {
  return { type, payload, timestamp: Date.now() }
}

describe('[GDD §4] MoralWeightSystem', () => {
  let system: MoralWeightSystem
  let bus: EventBus

  beforeEach(() => {
    bus = new EventBus()
    system = new MoralWeightSystem(bus)
  })

  it('accumulates moral weight from moral.choice.made events', () => {
    const state = createInitialState()
    const next = system.onEvent(makeEvent('moral.choice.made', { weight: 10 }), state)
    expect(next.player.moralWeight).toBe(10)
  })

  it('accumulates across multiple choices', () => {
    const state = createInitialState()
    let s = system.onEvent(makeEvent('moral.choice.made', { weight: 10 }), state)
    s = system.onEvent(makeEvent('moral.choice.made', { weight: -5 }), s)
    expect(s.player.moralWeight).toBe(5)
  })

  it('supports negative weight (self-serving choices)', () => {
    const state = createInitialState()
    const next = system.onEvent(makeEvent('moral.choice.made', { weight: -20 }), state)
    expect(next.player.moralWeight).toBe(-20)
  })

  it('ignores unrelated events', () => {
    const state = createInitialState()
    const next = system.onEvent(makeEvent('insight.gained', { amount: 10 }), state)
    expect(next.player.moralWeight).toBe(0)
  })
})
