import type { ISystem, IGameState, IGameEvent, IEventBus } from '@/interfaces/index.js'

const VISION_TRIGGERS: Record<string, string> = {
  keeper_betrayal: 'vision_the_first_keeper',
  spirit_binding:  'vision_the_binding',
  vael_origin:     'vision_vaels_hunger',
}

const ALL_KEY_INSIGHTS = [
  'vael_origin', 'mechanism_purpose', 'light_source_truth',
  'keeper_betrayal', 'spirit_binding', 'island_history', 'final_signal',
]

export class VisionSystem implements ISystem {
  readonly name = 'VisionSystem'

  constructor(private readonly _eventBus: IEventBus) { void this._eventBus }

  init(state: IGameState): IGameState { return state }
  update(state: IGameState, _deltaMs: number): IGameState { return state }

  onEvent(event: IGameEvent, state: IGameState): IGameState {
    if (event.type !== 'insight.card.sealed') return state

    const { cardId } = event.payload as { cardId: string }
    const visionId = VISION_TRIGGERS[cardId]

    const newSealed = new Set([...state.player.sealedInsights, cardId])
    const hasAllKeyInsights = ALL_KEY_INSIGHTS.every(id => newSealed.has(id))

    const toAdd: string[] = []
    if (visionId) toAdd.push(visionId)
    if (hasAllKeyInsights && !state.player.sealedInsights.has('final_signal')) {
      toAdd.push('vision_the_truth')
    }

    if (toAdd.length === 0) return state

    const pending = [...state.pendingVisions, ...toAdd]
    const shouldEnter = state.phase !== 'vision' && pending.length > 0
    return {
      ...state,
      pendingVisions: pending,
      priorPhase: shouldEnter ? state.phase : state.priorPhase,
      phase: shouldEnter ? 'vision' : state.phase,
    }
  }
}
