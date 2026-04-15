import { beforeEach, describe, expect, it } from 'vitest'
import { EventBus } from '@/engine/EventBus.js'
import { createInitialState } from '@/engine/initialState.js'
import type { GameEventType, IGameEvent, IGameState } from '@/interfaces/index.js'
import { RelationshipSystem } from '@/systems/RelationshipSystem.js'

function makeEvent(type: GameEventType, payload: Record<string, unknown> = {}): IGameEvent {
  return { type, payload, timestamp: Date.now() }
}

function withNpcStats(state: IGameState, npcId: string, trust: number, resonance: number): IGameState {
  return {
    ...state,
    player: {
      ...state.player,
      trust: { ...(state.player.trust as Record<string, number>), [npcId]: trust } as IGameState['player']['trust'],
      resonance: { ...(state.player.resonance as Record<string, number>), [npcId]: resonance } as IGameState['player']['resonance'],
    },
  }
}

describe('RelationshipSystem', () => {
  let bus: EventBus
  let system: RelationshipSystem
  let state: IGameState
  let emitted: Array<{ type: string; payload: unknown }>

  beforeEach(() => {
    bus = new EventBus()
    system = new RelationshipSystem(bus)
    state = system.init(createInitialState())
    emitted = []
    bus.on('relationship.unlocked', event => emitted.push({ type: event.type, payload: event.payload }))
  })

  it('ignores unrelated events', () => {
    const next = system.onEvent(makeEvent('dialogue.start', { npcId: 'maren' }), state)
    expect(next).toBe(state)
    expect(emitted).toHaveLength(0)
  })

  it('unlocks keeper_trusted when trust threshold is met', () => {
    const seeded = withNpcStats(state, 'keeper', 50, 0)
    const next = system.onEvent(makeEvent('npc.trust.changed', { npcId: 'keeper', value: 50 }), seeded)
    expect(next.player.relationshipFlags['keeper_trusted']).toBe(true)
    expect(emitted).toHaveLength(1)
  })

  it('does not unlock flag below trust threshold', () => {
    const seeded = withNpcStats(state, 'keeper', 49, 0)
    const next = system.onEvent(makeEvent('npc.trust.changed', { npcId: 'keeper', value: 49 }), seeded)
    expect(next.player.relationshipFlags['keeper_trusted']).not.toBe(true)
    expect(emitted).toHaveLength(0)
  })

  it('respects prerequisite flags before unlocking dependent branches', () => {
    const seeded = withNpcStats(state, 'keeper', 80, 0)
    const next = system.onEvent(makeEvent('npc.trust.changed', { npcId: 'keeper', value: 80 }), seeded)
    expect(next.player.relationshipFlags['keeper_trusted']).toBe(true)
    expect(next.player.relationshipFlags['keeper_secret']).toBe(true)
  })

  it('unlocks archivist branch via resonance threshold', () => {
    const seeded = withNpcStats(state, 'archivist', 0, 30)
    const next = system.onEvent(makeEvent('npc.resonance.changed', { npcId: 'archivist', value: 30 }), seeded)
    expect(next.player.relationshipFlags['archivist_unlocked']).toBe(true)
  })

  it('does not re-emit unlock events when flag is already set', () => {
    const seeded = withNpcStats({
      ...state,
      player: {
        ...state.player,
        relationshipFlags: { ...state.player.relationshipFlags, keeper_trusted: true },
      },
    }, 'keeper', 60, 0)
    const next = system.onEvent(makeEvent('npc.trust.changed', { npcId: 'keeper', value: 60 }), seeded)
    expect(next.player.relationshipFlags['keeper_trusted']).toBe(true)
    expect(emitted).toHaveLength(0)
  })

  it('unlocks elder branch progression in order', () => {
    const seeded = withNpcStats(state, 'elder', 70, 0)
    const next = system.onEvent(makeEvent('npc.trust.changed', { npcId: 'elder', value: 70 }), seeded)
    expect(next.player.relationshipFlags['elder_confided']).toBe(true)
    expect(next.player.relationshipFlags['elder_revealed']).toBe(true)
    expect(emitted).toHaveLength(2)
  })
})
