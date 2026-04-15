import type { LocationId } from '@/interfaces/index.js'

export interface LocationSecret {
  locationId: LocationId
  requiredExamines: number
  secretKey: string
  worldFlagSet?: string
}

export const LOCATION_SECRETS: LocationSecret[] = [
  { locationId: 'lighthouse_base', requiredExamines: 3, secretKey: 'secret.lighthouse_base', worldFlagSet: 'secret.foundation_inscription' },
  { locationId: 'lighthouse_top', requiredExamines: 3, secretKey: 'secret.lighthouse_lantern', worldFlagSet: 'secret.lens_frequency' },
  { locationId: 'keepers_cottage', requiredExamines: 3, secretKey: 'secret.keepers_cottage' },
  { locationId: 'archive_basement', requiredExamines: 5, secretKey: 'secret.archive', worldFlagSet: 'secret.archive_cipher' },
  { locationId: 'tidal_caves', requiredExamines: 3, secretKey: 'secret.sea_cave', worldFlagSet: 'secret.cave_echo' },
  { locationId: 'cliffside', requiredExamines: 3, secretKey: 'secret.cliff_path' },
  { locationId: 'village_square', requiredExamines: 5, secretKey: 'secret.village_square', worldFlagSet: 'secret.old_signal' },
]

export const LOCATION_SECRET_BY_ID = new Map(
  LOCATION_SECRETS.map(secret => [secret.locationId, secret])
)

export function secretSeenFlag(secretKey: string): string {
  return `${secretKey}_seen`
}
