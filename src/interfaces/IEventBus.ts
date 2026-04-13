// ─────────────────────────────────────────────────────────────────────────────
// IEventBus — Stable contract for the game event bus.
//
// All cross-module communication goes through events.
// Modules must not import each other's implementation files.
// ─────────────────────────────────────────────────────────────────────────────

export type GameEventType =
  // Knowledge
  | 'insight.gained'
  | 'insight.banked'
  | 'insight.card.formed'
  | 'insight.card.sealed'
  | 'archive.page.found'
  // Quests
  | 'quest.started'
  | 'quest.updated'
  | 'quest.completed'
  | 'quest.failed'
  // NPCs
  | 'npc.dialogue.opened'
  | 'npc.dialogue.choice.made'
  | 'npc.dialogue.closed'
  | 'npc.resonance.changed'
  | 'npc.attitude.changed'
  // World
  | 'location.entered'
  | 'location.discovered'
  | 'player.moved'
  // Loop
  | 'loop.started'
  | 'loop.ended'
  | 'phase.changed'
  | 'player.died'
  | 'day.timer.warning'  // 20% time remaining
  // Moral
  | 'moral.choice.made'
  // System
  | 'game.saved'
  | 'game.loaded'
  | 'audio.unlock'
  | 'locale.changed'
  | 'renderer.resized'

export interface IGameEvent<T extends Record<string, unknown> = Record<string, unknown>> {
  readonly type: GameEventType
  readonly payload: T
  readonly timestamp: number
}

export type EventHandler<T extends Record<string, unknown> = Record<string, unknown>> =
  (event: IGameEvent<T>) => void

export interface IEventBus {
  emit<T extends Record<string, unknown>>(type: GameEventType, payload: T): void

  /**
   * Subscribe to an event type.
   * @returns Unsubscribe function — call it to remove the handler.
   */
  on<T extends Record<string, unknown>>(
    type: GameEventType,
    handler: EventHandler<T>
  ): () => void

  off<T extends Record<string, unknown>>(
    type: GameEventType,
    handler: EventHandler<T>
  ): void

  /** Subscribe for a single emission only. Auto-unsubscribes after firing. */
  once<T extends Record<string, unknown>>(
    type: GameEventType,
    handler: EventHandler<T>
  ): void
}
