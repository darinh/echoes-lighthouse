import { describe, it, expect, beforeEach } from 'vitest'
import { NightSystem } from '@/systems/NightSystem.js'
import { EventBus } from '@/engine/EventBus.js'
import { createInitialState } from '@/engine/initialState.js'
import type { IGameEvent, GameEventType } from '@/interfaces/index.js'

function makeEvent(type: GameEventType, payload: Record<string, unknown> = {}): IGameEvent {
  return { type, payload, timestamp: Date.now() }
}

describe('NightSystem', () => {
  let system: NightSystem
  let bus: EventBus
  let diedEmitted: boolean

  beforeEach(() => {
    bus = new EventBus()
    diedEmitted = false
    bus.on('player.died', () => { diedEmitted = true })
    system = new NightSystem(bus)
  })

  it('starts with danger level 0', () => {
    const state = createInitialState()
    expect(state.nightDangerLevel).toBe(0)
  })

  it('escalates danger by 10 per escalate event', () => {
    const state = createInitialState()
    const next = system.onEvent(makeEvent('night.danger.escalate'), state)
    expect(next.nightDangerLevel).toBe(10)
  })

  it('escalates danger up to 100', () => {
    let state = createInitialState()
    for (let i = 0; i < 10; i++) {
      state = system.onEvent(makeEvent('night.danger.escalate'), state)
    }
    expect(state.nightDangerLevel).toBe(100)
  })

  it('does not exceed 100', () => {
    let state = createInitialState()
    for (let i = 0; i < 15; i++) {
      state = system.onEvent(makeEvent('night.danger.escalate'), state)
    }
    expect(state.nightDangerLevel).toBe(100)
  })

  it('emits player.died when danger reaches 100', () => {
    const state = { ...createInitialState(), nightDangerLevel: 90 }
    system.onEvent(makeEvent('night.danger.escalate'), state)
    expect(diedEmitted).toBe(true)
  })

  it('does not emit player.died below 100', () => {
    const state = createInitialState()
    system.onEvent(makeEvent('night.danger.escalate'), state)
    expect(diedEmitted).toBe(false)
  })

  it('resets danger on player.died event', () => {
    let state = { ...createInitialState(), nightDangerLevel: 70 }
    state = system.onEvent(makeEvent('player.died'), state)
    expect(state.nightDangerLevel).toBe(0)
  })

  it('resets danger on loop.started event', () => {
    let state = { ...createInitialState(), nightDangerLevel: 50 }
    state = system.onEvent(makeEvent('loop.started'), state)
    expect(state.nightDangerLevel).toBe(0)
  })
})
