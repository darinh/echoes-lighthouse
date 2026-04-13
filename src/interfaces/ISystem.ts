import type { IGameState } from './IGameState.js'
import type { IGameEvent } from './IEventBus.js'

// ─────────────────────────────────────────────────────────────────────────────
// ISystem — Stable contract for all game systems.
//
// Systems are pure: they receive state, return new state. No side effects
// except via eventBus.emit(). Each system owns one domain of game logic.
//
// Registered systems (src/engine/GameEngine.ts):
//   KnowledgeSystem  — Insight, Archive Mastery, Insight Cards
//   QuestSystem      — Quest state, triggers, completion
//   MoralWeightSystem — Moral choice tracking, alignment accumulation
//   LoopSystem       — Day/night cycle, death, loop reset
// ─────────────────────────────────────────────────────────────────────────────

export interface ISystem {
  /** Unique name, used for debug logging and ordering. */
  readonly name: string

  /** Called once when the engine starts. Return initial state adjustments. */
  init(state: IGameState): IGameState

  /**
   * Called every game tick (turn-based: only when a turn advances).
   * @param deltaMs wall-clock ms since last update (for animations only)
   */
  update(state: IGameState, deltaMs: number): IGameState

  /** Called when an event fires that this system has subscribed to. */
  onEvent(event: IGameEvent, state: IGameState): IGameState
}
