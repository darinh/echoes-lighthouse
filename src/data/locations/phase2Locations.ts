import type { LocationData } from '@/world/Location.js'

export const PHASE2_LOCATIONS: Record<string, LocationData> = {
  mechanism_room: {
    id: 'mechanism_room',
    nameKey: 'location.mechanism_room.name',
    descKey: 'location.mechanism_room.desc',
    adjacentLocations: ['lighthouse_top'],
    dangerousAtNight: false,
  },
  chapel: {
    id: 'chapel',
    nameKey: 'location.chapel.name',
    descKey: 'location.chapel.desc',
    adjacentLocations: ['village_square'],
    dangerousAtNight: false,
  },
  mill: {
    id: 'mill',
    nameKey: 'location.mill.name',
    descKey: 'location.mill.desc',
    adjacentLocations: ['village_square', 'forest_path'],
    dangerousAtNight: false,
  },
  forest_path: {
    id: 'forest_path',
    nameKey: 'location.forest_path.name',
    descKey: 'location.forest_path.desc',
    adjacentLocations: ['mill'],
    dangerousAtNight: true,
  },
  ruins: {
    id: 'ruins',
    nameKey: 'location.ruins.name',
    descKey: 'location.ruins.desc',
    adjacentLocations: ['village_square', 'archive_basement'],
    archiveHint: { domain: 'occult', minLevel: 1 },
    dangerousAtNight: false,
  },
  cliffside: {
    id: 'cliffside',
    nameKey: 'location.cliffside.name',
    descKey: 'location.cliffside.desc',
    adjacentLocations: ['lighthouse_base', 'tidal_caves'],
    archiveHint: { domain: 'occult', minLevel: 1 },
    dangerousAtNight: true,
  },
  archive_basement: {
    id: 'archive_basement',
    nameKey: 'location.archive_basement.name',
    descKey: 'location.archive_basement.desc',
    adjacentLocations: ['ruins'],
    archiveHint: { domain: 'history', minLevel: 1 },
    dangerousAtNight: false,
  },
  tidal_caves: {
    id: 'tidal_caves',
    nameKey: 'location.tidal_caves.name',
    descKey: 'location.tidal_caves.desc',
    adjacentLocations: ['cliffside'],
    archiveHint: { domain: 'maritime', minLevel: 2 },
    dangerousAtNight: true,
  },
}
