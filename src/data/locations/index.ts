// Lazy-loaded location data chunk.
import type { LocationData } from '@/world/index.js'
import { getLocation, getAdjacentLocations, LOCATIONS } from './phase1Locations.js'

export async function loadLocationData(): Promise<Record<string, LocationData>> {
  return LOCATIONS
}

export { getLocation, getAdjacentLocations, LOCATIONS }
