import type { ISystem } from '@/interfaces/index.js'
import type { IGameState } from '@/interfaces/index.js'
import type { IGameEvent } from '@/interfaces/index.js'
import type { IEventBus } from '@/interfaces/index.js'

/**
 * KnowledgeSystem — Manages Insight, Archive Mastery, and Insight Cards.
 * See docs/gdd/04-systems-design.md §1–2 for full balance numbers.
 */
export class KnowledgeSystem implements ISystem {
  readonly name = 'KnowledgeSystem'

  constructor(_eventBus: IEventBus) {}

  init(state: IGameState): IGameState { return state }

  update(state: IGameState, _deltaMs: number): IGameState {
    // TODO: check daily insight cap (150/loop with diminishing returns after)
    // TODO: check Archive domain unlock thresholds (3/6/10 pages)
    return state
  }

  onEvent(event: IGameEvent, state: IGameState): IGameState {
    switch (event.type) {
      case 'insight.gained': return this.handleInsightGained(event, state)
      case 'archive.page.found': return this.handleArchivePage(event, state)
      default: return state
    }
  }

  private handleInsightGained(event: IGameEvent, state: IGameState): IGameState {
    const { amount } = event.payload as { amount: number }
    const newInsight = Math.min(999, state.player.insight + amount)
    return {
      ...state,
      player: { ...state.player, insight: newInsight },
    }
  }

  private handleArchivePage(_event: IGameEvent, state: IGameState): IGameState {
    // TODO: increment archive mastery for the relevant domain
    return state
  }
}
