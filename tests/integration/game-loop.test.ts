import { describe, it, expect, beforeEach } from 'vitest'
import { EventBus } from '@/engine/EventBus.js'
import { createInitialState } from '@/engine/initialState.js'
import { KnowledgeSystem } from '@/systems/KnowledgeSystem.js'
import { LoopSystem } from '@/systems/LoopSystem.js'
import { MoralWeightSystem } from '@/systems/MoralWeightSystem.js'
import type { IGameState, IGameEvent, GameEventType } from '@/interfaces/index.js'

function makeEvent(type: GameEventType, payload: Record<string, unknown> = {}): IGameEvent {
  return { type, payload, timestamp: Date.now() }
}

/**
 * Integration test: verify that all systems work together correctly
 * through a realistic game scenario — insight gain → bank → death → reset.
 */
describe('[Integration] Dawn → Day → Insight → Death → Reset', () => {
  let bus: EventBus
  let knowledge: KnowledgeSystem
  let loop: LoopSystem
  let moral: MoralWeightSystem

  function applyAllSystems(state: IGameState, event: IGameEvent): IGameState {
    let s = knowledge.onEvent(event, state)
    s = loop.onEvent(event, s)
    s = moral.onEvent(event, s)
    return s
  }

  beforeEach(() => {
    bus = new EventBus()
    knowledge = new KnowledgeSystem(bus)
    loop = new LoopSystem(bus)
    moral = new MoralWeightSystem(bus)
  })

  it('full loop: gain insight, make moral choice, die, verify persistent state', () => {
    let state = loop.init(createInitialState())
    state = knowledge.init(state)

    // Player explores and gains insight
    state = applyAllSystems(state, makeEvent('insight.gained', { amount: 50 }))
    expect(state.player.insight).toBe(50)

    // Player makes a moral choice
    state = applyAllSystems(state, makeEvent('moral.choice.made', { weight: 8 }))
    expect(state.player.moralWeight).toBe(8)

    // Player banks 30 insight (manually set insightBanked — banking mechanic TBD)
    state = { ...state, player: { ...state.player, insightBanked: 30 } }

    // Player dies
    state = applyAllSystems(state, makeEvent('player.died'))

    // Physical stats reset
    expect(state.player.stamina).toBe(100)
    expect(state.player.hearts).toBe(3)
    expect(state.phase).toBe('dawn')

    // Persistent: only banked insight survives
    expect(state.player.insight).toBe(30)

    // Persistent: moral weight persists
    expect(state.player.moralWeight).toBe(8)

    // Loop incremented
    expect(state.player.loopCount).toBe(2)
  })

  it('second loop: insight accumulates on top of banked amount from previous loop', () => {
    let state = loop.init(createInitialState())

    // Loop 1: bank 30, then die
    state = { ...state, player: { ...state.player, insightBanked: 30 } }
    state = applyAllSystems(state, makeEvent('player.died'))
    expect(state.player.insight).toBe(30) // starts loop 2 with banked amount

    // Loop 2: gain more
    state = applyAllSystems(state, makeEvent('insight.gained', { amount: 20 }))
    expect(state.player.insight).toBe(50)
  })
})
