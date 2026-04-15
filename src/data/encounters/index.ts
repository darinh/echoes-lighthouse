// Night Encounter definitions
// Each encounter appears at most once per trigger; 1-2 per night.

export type EncounterId =
  | 'distant_light'
  | 'strange_sound'
  | 'shadow_movement'
  | 'tide_signal'
  | 'lantern_flicker'
  | 'voice_in_wind'

export interface NightEncounter {
  readonly id: EncounterId
  readonly descKey: string
  readonly investigateKey: string
  readonly ignoreKey: string
  readonly rewardFlag?: string
  readonly rewardInsight?: number
  readonly staminaCost: number
  readonly dangerousLocationsOnly?: boolean
}

export const NIGHT_ENCOUNTERS: readonly NightEncounter[] = [
  {
    id: 'distant_light',
    descKey: 'encounter.distant_light.desc',
    investigateKey: 'encounter.distant_light.investigate',
    ignoreKey: 'encounter.ignore',
    rewardFlag: 'flag.distant_light_investigated',
    rewardInsight: 1,
    staminaCost: 1,
  },
  {
    id: 'strange_sound',
    descKey: 'encounter.strange_sound.desc',
    investigateKey: 'encounter.strange_sound.investigate',
    ignoreKey: 'encounter.ignore',
    rewardFlag: 'flag.sound_investigated',
    rewardInsight: 1,
    staminaCost: 1,
  },
  {
    id: 'shadow_movement',
    descKey: 'encounter.shadow_movement.desc',
    investigateKey: 'encounter.shadow_movement.investigate',
    ignoreKey: 'encounter.ignore',
    rewardFlag: 'flag.shadow_seen',
    staminaCost: 1,
  },
  {
    id: 'tide_signal',
    descKey: 'encounter.tide_signal.desc',
    investigateKey: 'encounter.tide_signal.investigate',
    ignoreKey: 'encounter.ignore',
    rewardFlag: 'flag.tide_pattern_noted',
    rewardInsight: 1,
    staminaCost: 1,
  },
  {
    id: 'lantern_flicker',
    descKey: 'encounter.lantern_flicker.desc',
    investigateKey: 'encounter.lantern_flicker.investigate',
    ignoreKey: 'encounter.ignore',
    rewardFlag: 'flag.signal_pattern_noted',
    staminaCost: 1,
  },
  {
    id: 'voice_in_wind',
    descKey: 'encounter.voice_in_wind.desc',
    investigateKey: 'encounter.voice_in_wind.investigate',
    ignoreKey: 'encounter.ignore',
    rewardFlag: 'flag.voice_heard',
    staminaCost: 1,
  },
]

export function pickRandomEncounter(
  exclude: ReadonlySet<string> = new Set(),
): NightEncounter | null {
  const available = NIGHT_ENCOUNTERS.filter(e => !exclude.has(e.id))
  if (available.length === 0) return null
  return available[Math.floor(Math.random() * available.length)] ?? null
}
