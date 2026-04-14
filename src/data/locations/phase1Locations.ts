import type { LocationData } from '@/world/Location.js'
import { PHASE2_LOCATIONS } from './phase2Locations.js'

/**
 * All 13 game locations. Phase 1 locations defined here; Phase 2 locations
 * imported and merged so that getAdjacentLocations always reflects the full map.
 *
 * Adjacency map (all bidirectional):
 *   cottage ↔ village_square ↔ harbor
 *   village_square ↔ lighthouse_base ↔ lighthouse_top ↔ mechanism_room
 *   village_square ↔ chapel | mill ↔ forest_path
 *   village_square ↔ ruins ↔ archive_basement
 *   lighthouse_base ↔ cliffside ↔ tidal_caves
 */
const LOCATIONS: Record<string, LocationData> = {
  keepers_cottage: {
    id: 'keepers_cottage',
    nameKey: 'location.keepers_cottage.name',
    descKey: 'location.keepers_cottage.desc',
    adjacentLocations: ['village_square'],
    dangerousAtNight: false,
  },
  village_square: {
    id: 'village_square',
    nameKey: 'location.village_square.name',
    descKey: 'location.village_square.desc',
    adjacentLocations: ['keepers_cottage', 'harbor', 'lighthouse_base', 'chapel', 'mill', 'ruins'],
    dangerousAtNight: false,
  },
  harbor: {
    id: 'harbor',
    nameKey: 'location.harbor.name',
    descKey: 'location.harbor.desc',
    adjacentLocations: ['village_square'],
    archiveHint: { domain: 'maritime', minLevel: 1 },
    dangerousAtNight: true,
  },
  lighthouse_base: {
    id: 'lighthouse_base',
    nameKey: 'location.lighthouse_base.name',
    descKey: 'location.lighthouse_base.desc',
    adjacentLocations: ['village_square', 'lighthouse_top', 'cliffside'],
    dangerousAtNight: false,
  },
  lighthouse_top: {
    id: 'lighthouse_top',
    nameKey: 'location.lighthouse_top.name',
    descKey: 'location.lighthouse_top.desc',
    adjacentLocations: ['lighthouse_base', 'mechanism_room'],
    archiveHint: { domain: 'occult', minLevel: 1 },
    dangerousAtNight: false,
  },
}

Object.assign(LOCATIONS, PHASE2_LOCATIONS)

export function getLocation(id: string): LocationData | undefined {
  return LOCATIONS[id]
}

export function getAdjacentLocations(id: string): ReadonlyArray<LocationData> {
  const loc = LOCATIONS[id]
  if (!loc) return []
  return loc.adjacentLocations
    .map(adjId => LOCATIONS[adjId])
    .filter((l): l is LocationData => l !== undefined)
}

export { LOCATIONS }
