import type { ISystem, IGameState, IGameEvent, IEventBus } from '@/interfaces/index.js'

/**
 * MoralWeightSystem — Accumulates moral choices and determines ending eligibility.
 * See docs/gdd/04-systems-design.md §4 for alignment tracking.
 */
export class MoralWeightSystem implements ISystem {
  readonly name = 'MoralWeightSystem'

  constructor(_eventBus: IEventBus) {}

  init(state: IGameState): IGameState { return state }
  update(state: IGameState, _deltaMs: number): IGameState { return state }

  onEvent(event: IGameEvent, state: IGameState): IGameState {
    if (event.type !== 'moral.choice.made') return state
    const { weight } = event.payload as { weight: number }
    return {
      ...state,
      player: { ...state.player, moralWeight: state.player.moralWeight + weight },
    }
  }
}
