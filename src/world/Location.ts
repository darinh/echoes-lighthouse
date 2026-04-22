import type { LocationId } from '@/interfaces/index.js'

export interface LocationData {
  readonly id: LocationId
  /** i18n key for the location name shown in the HUD */
  readonly nameKey: string
  /** i18n key for the ambient description shown on entry */
  readonly descKey: string
  /** Adjacent location IDs reachable by a single move action */
  readonly adjacentLocations: ReadonlyArray<LocationId>
  /** Archive domain + level needed to notice hidden details here */
  readonly archiveHint?: { domain: import('@/interfaces/index.js').ArchiveDomain; minLevel: number }
  /** If true, this location is dangerous at night (light drain increases) */
  readonly dangerousAtNight: boolean
  /** World flag that must be set before this location can be entered */
  readonly requiredWorldFlag?: string
}
