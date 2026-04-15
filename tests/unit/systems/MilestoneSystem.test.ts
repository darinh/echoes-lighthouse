import { describe, it, expect, beforeEach } from 'vitest'
import { MilestoneSystem } from '@/systems/MilestoneSystem.js'
import { EventBus } from '@/engine/EventBus.js'
import { createInitialState } from '@/engine/initialState.js'
import type { IGameState, IGameEvent, GameEventType } from '@/interfaces/index.js'

function makeEvent(type: GameEventType, payload: Record<string, unknown> = {}): IGameEvent {
  return { type, payload, timestamp: Date.now() }
}

function withLoopCount(state: IGameState, count: number): IGameState {
  return { ...state, player: { ...state.player, loopCount: count } }
}

function withWorldFlag(state: IGameState, flag: string): IGameState {
  const newFlags = new Set(state.worldFlags)
  newFlags.add(flag)
  return { ...state, worldFlags: newFlags }
}

describe('MilestoneSystem', () => {
  let system: MilestoneSystem
  let bus: EventBus

  beforeEach(() => {
    bus = new EventBus()
    system = new MilestoneSystem(bus)
  })

  describe('init', () => {
    it('returns state unchanged', () => {
      const state = createInitialState()
      const next = system.init(state)
      expect(next).toBe(state)
    })
  })

  describe('update', () => {
    it('clears pendingMilestoneMessage after 4 seconds', () => {
      const state: IGameState = {
        ...createInitialState(),
        pendingMilestoneMessage: {
          messageKey: 'milestone.loop_3',
          loopCount: 3,
          shownAt: Date.now() - 4001,
        },
      }
      const next = system.update(state, 16)
      expect(next.pendingMilestoneMessage).toBeNull()
    })

    it('preserves pendingMilestoneMessage before 4 seconds', () => {
      const state: IGameState = {
        ...createInitialState(),
        pendingMilestoneMessage: {
          messageKey: 'milestone.loop_3',
          loopCount: 3,
          shownAt: Date.now() - 500,
        },
      }
      const next = system.update(state, 16)
      expect(next.pendingMilestoneMessage).not.toBeNull()
    })

    it('returns state unchanged when no pendingMilestoneMessage', () => {
      const state = createInitialState()
      const next = system.update(state, 16)
      expect(next).toBe(state)
    })
  })

  describe('onEvent', () => {
    it('ignores non-loop.dawn events', () => {
      const state = withLoopCount(createInitialState(), 2)
      const next = system.onEvent(makeEvent('location.moved'), state)
      expect(next).toBe(state)
    })

    it('ignores loop.dawn when loopCount+1 does not match any milestone', () => {
      const state = withLoopCount(createInitialState(), 1)
      const next = system.onEvent(makeEvent('loop.dawn'), state)
      expect(next).toBe(state)
    })

    it('sets pendingMilestoneMessage for loop 3 (loopCount=2)', () => {
      const state = withLoopCount(createInitialState(), 2)
      const next = system.onEvent(makeEvent('loop.dawn'), state)
      expect(next.pendingMilestoneMessage).not.toBeNull()
      expect(next.pendingMilestoneMessage?.messageKey).toBe('milestone.loop_3')
      expect(next.pendingMilestoneMessage?.loopCount).toBe(3)
    })

    it('sets pendingMilestoneMessage for loop 5 (loopCount=4)', () => {
      const state = withLoopCount(createInitialState(), 4)
      const next = system.onEvent(makeEvent('loop.dawn'), state)
      expect(next.pendingMilestoneMessage?.messageKey).toBe('milestone.loop_5')
      expect(next.pendingMilestoneMessage?.loopCount).toBe(5)
    })

    it('sets pendingMilestoneMessage for loop 7 (loopCount=6)', () => {
      const state = withLoopCount(createInitialState(), 6)
      const next = system.onEvent(makeEvent('loop.dawn'), state)
      expect(next.pendingMilestoneMessage?.messageKey).toBe('milestone.loop_7')
      expect(next.pendingMilestoneMessage?.loopCount).toBe(7)
    })

    it('sets pendingMilestoneMessage for loop 10 (loopCount=9)', () => {
      const state = withLoopCount(createInitialState(), 9)
      const next = system.onEvent(makeEvent('loop.dawn'), state)
      expect(next.pendingMilestoneMessage?.messageKey).toBe('milestone.loop_10')
      expect(next.pendingMilestoneMessage?.loopCount).toBe(10)
    })

    it('sets the worldFlag to prevent re-trigger', () => {
      const state = withLoopCount(createInitialState(), 2)
      const next = system.onEvent(makeEvent('loop.dawn'), state)
      expect(next.worldFlags.has('milestone.shown.3')).toBe(true)
    })

    it('does NOT trigger again if worldFlag already set (idempotent)', () => {
      const base = withLoopCount(createInitialState(), 2)
      const state = withWorldFlag(base, 'milestone.shown.3')
      const next = system.onEvent(makeEvent('loop.dawn'), state)
      expect(next).toBe(state)
    })

    it('records shownAt as a recent timestamp', () => {
      const before = Date.now()
      const state = withLoopCount(createInitialState(), 2)
      const next = system.onEvent(makeEvent('loop.dawn'), state)
      const after = Date.now()
      expect(next.pendingMilestoneMessage?.shownAt).toBeGreaterThanOrEqual(before)
      expect(next.pendingMilestoneMessage?.shownAt).toBeLessThanOrEqual(after)
    })
  })
})
