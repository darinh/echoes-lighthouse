import type { ISystem, IGameState, IGameEvent, IEventBus } from '@/interfaces/index.js'

/**
 * InsightBankingSystem — Manages the "bank insight at the Archive Desk" mechanic.
 *
 * - `insight.banked`: move player.insight → player.insightBanked
 * - `player.died`: reset player.insight to 0 (banked survives)
 * - `loop.started`: restore banked insight to player.insight
 */
export class InsightBankingSystem implements ISystem {
  readonly name = 'InsightBankingSystem'

  constructor(_eventBus: IEventBus) {}

  init(state: IGameState): IGameState { return state }
  update(state: IGameState, _deltaMs: number): IGameState { return state }

  onEvent(event: IGameEvent, state: IGameState): IGameState {
    switch (event.type) {
      case 'insight.banked':  return this.handleBanked(event, state)
      case 'player.died':     return this.handleDeath(state)
      case 'loop.started':    return this.handleLoopStarted(state)
      default:                return state
    }
  }

  private handleBanked(event: IGameEvent, state: IGameState): IGameState {
    const { amount } = event.payload as { amount: number }
    const toBank = Math.min(amount, state.player.insight)
    if (toBank <= 0) return state
    return {
      ...state,
      player: {
        ...state.player,
        insight: state.player.insight - toBank,
        insightBanked: state.player.insightBanked + toBank,
      },
    }
  }

  private handleDeath(state: IGameState): IGameState {
    return {
      ...state,
      player: { ...state.player, insight: 0 },
    }
  }

  private handleLoopStarted(state: IGameState): IGameState {
    // Restore banked insight at the start of each new loop.
    return {
      ...state,
      player: {
        ...state.player,
        insight: state.player.insightBanked,
      },
    }
  }
}
