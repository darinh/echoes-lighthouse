import type { NPCId, LocationId, NPCAttitude } from '@/interfaces/index.js'

export interface NPCData {
  readonly id: NPCId
  readonly nameKey: string         // i18n key
  readonly defaultLocation: LocationId
  readonly defaultAttitude: NPCAttitude
  /** NPC schedule: which location they occupy at each game phase */
  readonly schedule: Partial<Record<import('@/interfaces/index.js').GamePhase, LocationId>>
}
