import type { ISystem, IGameState, IGameEvent, IEventBus } from '@/interfaces/index.js'

/**
 * NightSystem — Tracks danger level during night_dark phase.
 * When danger reaches 100, transitions to death phase with cause.
 */
export class NightSystem implements ISystem {
  readonly name = 'NightSystem'

  constructor(private readonly eventBus: IEventBus) {
    // eventBus reserved for future danger events
    void this.eventBus
  }

  init(state: IGameState): IGameState { return state }
  update(state: IGameState, _deltaMs: number): IGameState { return state }

  onEvent(event: IGameEvent, state: IGameState): IGameState {
    switch (event.type) {
      case 'night.danger.escalate':
        return this.handleDangerEscalate(state)
      case 'loop.started':
      case 'player.died':
        return { ...state, nightDangerLevel: 0 }
      default:
        return state
    }
  }

  private handleDangerEscalate(state: IGameState): IGameState {
    const newLevel = Math.min(100, state.nightDangerLevel + 10)
    if (newLevel >= 100) {
      return { ...state, nightDangerLevel: 100, phase: 'death', deathCause: 'death.night_danger' }
    }
    return { ...state, nightDangerLevel: newLevel }
  }
}
