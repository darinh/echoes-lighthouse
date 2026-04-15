import type { ISystem, IGameState, IGameEvent, IEventBus } from '@/interfaces/index.js'
import { LOOP_MILESTONES } from '@/data/milestones/index.js'

export class MilestoneSystem implements ISystem {
  readonly name = 'MilestoneSystem'
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_eventBus: IEventBus) {}

  init(state: IGameState): IGameState { return state }

  update(state: IGameState, _deltaMs: number): IGameState {
    if (state.pendingMilestoneMessage && Date.now() - state.pendingMilestoneMessage.shownAt >= 4000) {
      return { ...state, pendingMilestoneMessage: null }
    }
    return state
  }

  onEvent(event: IGameEvent, state: IGameState): IGameState {
    if (event.type !== 'loop.dawn') return state
    // dawn fires before increment, so use loopCount + 1
    const effectiveCount = state.player.loopCount + 1
    const milestone = LOOP_MILESTONES.find(m => m.loopCount === effectiveCount)
    if (!milestone) return state
    const flagKey = `milestone.shown.${effectiveCount}`
    if (state.worldFlags.has(flagKey)) return state
    const newFlags = new Set(state.worldFlags)
    newFlags.add(flagKey)
    return {
      ...state,
      worldFlags: newFlags,
      pendingMilestoneMessage: {
        messageKey: milestone.messageKey,
        loopCount: effectiveCount,
        shownAt: Date.now(),
      },
    }
  }
}
