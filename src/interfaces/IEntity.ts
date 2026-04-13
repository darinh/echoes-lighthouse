// ─────────────────────────────────────────────────────────────────────────────
// IEntity — Base contracts for all entities (player, NPCs, interactables).
// ─────────────────────────────────────────────────────────────────────────────

import type { LocationId } from './types.js'

export type EntityType = 'player' | 'npc' | 'interactive' | 'hazard'

export interface IEntity {
  readonly id: string
  readonly type: EntityType
  readonly location: LocationId
}

// ─────────────────────────────────────────────────────────────────────────────
// IInteractable — Anything the player can examine or use in the world.
// ─────────────────────────────────────────────────────────────────────────────

export interface IInteractable extends IEntity {
  readonly type: 'interactive'
  /** i18n key for the examine description. */
  readonly descriptionKey: string
  /** i18n key for the interaction prompt shown to the player. */
  readonly promptKey: string
  readonly isAvailable: boolean
  /** Required Archive domain + level to understand this object's full meaning. */
  readonly archiveRequirement?: { domain: import('./types.js').ArchiveDomain; minLevel: number }
}
