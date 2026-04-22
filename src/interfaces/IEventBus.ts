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
  | 'insight.card.requirements.met'
  | 'archive.page.found'
  | 'archive.domain.unlocked'
  | 'mastery.unlocked'
  // Quests
  | 'quest.started'
  | 'quest.updated'
  | 'quest.completed'
  | 'quest.failed'
  | 'quest.step.completed'
  | 'quest.expired'
  | 'quest.expired'
  | 'journal.thread.failed'
  // NPCs
  | 'npc.dialogue.opened'
  | 'npc.dialogue.choice.made'
  | 'npc.dialogue.closed'
  | 'npc.resonance.changed'
  | 'npc.attitude.changed'
  | 'npc.trust.changed'
  | 'npc.trust.gained'
  | 'npc.trust.up'
  | 'npc.trust.lost'
  | 'relationship.unlocked'
  // Dialogue lifecycle
  | 'dialogue.start'
  | 'dialogue.choice.selected'
  | 'dialogue.close'
  | 'npc.tier.unlocked'
  // World
  | 'location.entered'
  | 'location.discovered'
  | 'location.moved'
  | 'location.searched'
  | 'location.access.blocked'
  | 'player.moved'
  // Loop
  | 'loop.started'
  | 'loop.ended'
  | 'turn.end'
  | 'loop.reset'
  | 'turn.end'
  | 'phase.changed'
  | 'player.died'
  | 'player.rested'
  | 'player.exhausted'
  | 'player.stamina.low'
  | 'player.light.out'
  | 'day.timer.warning'  // 20% time remaining
  // Lantern
  | 'lantern.refilled'
  | 'lighthouse.lit'
  | 'ending.triggered'
  // Time
  | 'time.tick'
  | 'time.passed'
  // Moral
  | 'moral.choice.made'
  // Dilemma
  | 'dilemma.choice.made'
  // System
  | 'game.saved'
  | 'game.loaded'
  | 'audio.unlock'
  | 'locale.changed'
  | 'audio.volume.changed'
  | 'save.requested'
  | 'save.cleared'
  | 'item.taken'
  | 'panel.opened'
  | 'panel.closed'
  | 'renderer.resized'
  | 'loop.dawn'
  | 'night.danger.escalate'
  | 'night.breaking_point'
  | 'night.encounter.started'
  | 'night.consecDark'
  | 'game.over'
  | 'vision.started'
  | 'vision.completed'
  | 'examine.completed'
  | 'secret.revealed'
  | 'audio.toggle'
  | 'loop.night'
  | 'achievement.unlocked'
  | 'weather.changed'
  | 'encounter.resolved'
  | 'puzzle.solved'
  | 'puzzle.failed'
  | 'lighthouse.repair.started'
  | 'lighthouse.repair.step'
  | 'lighthouse.repaired'
  | 'lighthouse.repair.failed'

| 'lighthouse.lit'
  | 'loop.dawn'
  | 'ending.triggered'
  | 'save.requested'
  | 'save.cleared'

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
