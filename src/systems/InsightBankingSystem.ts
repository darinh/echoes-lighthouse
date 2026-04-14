import type { ISystem, IGameState, IGameEvent, IEventBus } from '@/interfaces/index.js'
import { INSIGHT_CARDS } from '@/data/insights/cards.js'

/**
 * InsightBankingSystem — Manages the "bank insight at the Archive Desk" mechanic.
 *
 * - `insight.banked`:    move player.insight → player.insightBanked
 * - `insight.card.sealed`: deduct cost from insightBanked, add card to sealedInsights
 * - `player.died`:       reset player.insight to 0 (banked survives)
 * - `loop.started`:      restore banked insight to player.insight
 */
export class InsightBankingSystem implements ISystem {
  readonly name = 'InsightBankingSystem'

  constructor(_eventBus: IEventBus) {}

  init(state: IGameState): IGameState { return state }
  update(state: IGameState, _deltaMs: number): IGameState { return state }

  onEvent(event: IGameEvent, state: IGameState): IGameState {
    switch (event.type) {
      case 'insight.banked':    return this.handleBanked(event, state)
      case 'insight.card.sealed': return this.handleCardSealed(event, state)
      case 'player.died':       return this.handleDeath(state)
      case 'loop.started':      return this.handleLoopStarted(state)
      default:                  return state
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

  private handleCardSealed(event: IGameEvent, state: IGameState): IGameState {
    const { cardId } = event.payload as { cardId: string }
    const card = INSIGHT_CARDS.find(c => c.id === cardId)
    if (!card) return state
    const newBanked = Math.max(0, state.player.insightBanked - card.cost)
    const newSealed = new Set(state.player.sealedInsights)
    newSealed.add(cardId)
    return {
      ...state,
      player: { ...state.player, insightBanked: newBanked, sealedInsights: newSealed },
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
