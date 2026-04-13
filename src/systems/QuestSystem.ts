import type { ISystem, IGameState, IGameEvent, IEventBus } from '@/interfaces/index.js'

/**
 * QuestSystem — Tracks quest state, triggers, and completions.
 * See docs/gdd/06-quest-dialogue.md for the full quest catalogue.
 */
export class QuestSystem implements ISystem {
  readonly name = 'QuestSystem'

  constructor(private readonly _eventBus: IEventBus) {}

  init(state: IGameState): IGameState { return state }
  update(state: IGameState, _deltaMs: number): IGameState { return state }
  onEvent(_event: IGameEvent, state: IGameState): IGameState { return state }
}
