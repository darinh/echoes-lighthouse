import type { IGameState } from '@/interfaces/index.js'

// ─────────────────────────────────────────────────────────────────────────────
// Night encounter pool — danger-gated encounters with weighted random selection.
// Used by NightSystem to pick encounters during dark night phases.
// ─────────────────────────────────────────────────────────────────────────────

export interface NightEncounter {
  id: string
  descKey: string                                          // i18n key
  minDangerLevel: number                                   // 0–100: minimum danger to appear
  weightFn?: (state: IGameState) => number                 // dynamic weight; default 1
  effect: {
    staminaDelta?: number
    dangerDelta?: number
    worldFlagSet?: string
    insightDelta?: number
    moralWeightDelta?: number                              // moral weight change (positive = heavier)
    visionTrigger?: string                                 // vision ID to queue
    locationClosed?: boolean                              // temporarily close current location
  }
}

export const DANGER_NIGHT_ENCOUNTERS: readonly NightEncounter[] = [
  {
    id: 'fog_wraith',
    descKey: 'encounter.fog_wraith.desc',
    minDangerLevel: 0,
    effect: { staminaDelta: -1, dangerDelta: +5 },
  },
  {
    id: 'beckoning_light',
    descKey: 'encounter.beckoning_light.desc',
    minDangerLevel: 20,
    effect: { dangerDelta: +15 },
  },
  {
    id: 'drowned_shade',
    descKey: 'encounter.drowned_shade.desc',
    minDangerLevel: 30,
    effect: { staminaDelta: -2 },
  },
  {
    id: 'whispering_rocks',
    descKey: 'encounter.whispering_rocks.desc',
    minDangerLevel: 0,
    effect: { insightDelta: +1 },
  },
  {
    id: 'spectral_tide',
    descKey: 'encounter.spectral_tide.desc',
    minDangerLevel: 50,
    effect: { staminaDelta: -3, dangerDelta: +10 },
  },
  {
    id: 'lighthouse_echo',
    descKey: 'encounter.lighthouse_echo.desc',
    minDangerLevel: 0,
    effect: { staminaDelta: +1 },
  },
  {
    id: 'kelp_tangle',
    descKey: 'encounter.kelp_tangle.desc',
    minDangerLevel: 40,
    effect: { staminaDelta: -2, worldFlagSet: 'encountered_kelp_tangle' },
  },
  {
    id: 'broken_compass',
    descKey: 'encounter.broken_compass.desc',
    minDangerLevel: 60,
    effect: { dangerDelta: +20 },
  },
  // ── GDD §6.9 Dark Night encounter pool (Issue #121) ──────────────────────
  {
    id: 'harbor_patrol',
    descKey: 'encounter.harbor_patrol.desc',
    minDangerLevel: 0,
    /** Weight up when player is at the harbor or has high trust with the harbormaster. */
    weightFn: (state) => {
      let w = 1
      if (state.player.currentLocation === 'harbor') w += 2
      const silasTrust = (state.player.trust as Record<string, number>)['silas'] ?? 0
      if (silasTrust >= 3) w += 1
      return w
    },
    effect: { staminaDelta: -1 },
  },
  {
    id: 'shadow_of_old_keeper',
    descKey: 'encounter.shadow_of_old_keeper.desc',
    minDangerLevel: 0,
    /** Weight up at high loop counts — the old keeper's shadow grows stronger. */
    weightFn: (state) => {
      const loopBonus = Math.min(3, Math.floor(state.player.loopCount / 3))
      return 1 + loopBonus
    },
    effect: { visionTrigger: 'keeper_shadow' },
  },
  {
    id: 'hollow_voice',
    descKey: 'encounter.hollow_voice.desc',
    minDangerLevel: 0,
    /** Higher weight when player has low insight — the voice offers revelation. */
    weightFn: (state) => {
      return state.player.insight < 10 ? 3 : 1
    },
    effect: { insightDelta: +2 },
  },
  {
    id: 'storm_surge',
    descKey: 'encounter.storm_surge.desc',
    minDangerLevel: 20,
    /** Heavier in storm weather, lighter in clear conditions. */
    weightFn: (state) => {
      if (state.weather === 'storm') return 4
      if (state.weather === 'rain') return 2
      if (state.weather === 'clear') return 0
      return 1
    },
    effect: { locationClosed: true },
  },
  {
    id: 'creature_sighting',
    descKey: 'encounter.creature_sighting.desc',
    minDangerLevel: 30,
    /** Weight increases with negative moral weight — dark acts attract dark things. */
    weightFn: (state) => {
      return state.player.moralWeight > 20 ? 3 : 1
    },
    effect: { moralWeightDelta: +5 },
  },
]

/**
 * Pick a random encounter from those eligible at the given danger level.
 * Respects per-encounter weightFn (defaulting to weight 1).
 * Returns null if no eligible encounters remain.
 */
export function pickDangerEncounter(
  dangerLevel: number,
  state: IGameState,
  exclude: ReadonlySet<string> = new Set(),
): NightEncounter | null {
  const eligible = DANGER_NIGHT_ENCOUNTERS.filter(
    e => e.minDangerLevel <= dangerLevel && !exclude.has(e.id),
  )
  if (eligible.length === 0) return null

  // Weighted random selection
  const weights = eligible.map(e => (e.weightFn ? e.weightFn(state) : 1))
  const total = weights.reduce((sum, w) => sum + w, 0)
  if (total <= 0) return eligible[0] ?? null

  let rand = Math.random() * total
  for (let i = 0; i < eligible.length; i++) {
    rand -= weights[i]!
    if (rand <= 0) return eligible[i]!
  }
  return eligible[eligible.length - 1] ?? null
}
