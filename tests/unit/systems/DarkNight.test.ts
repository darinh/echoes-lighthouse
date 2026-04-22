import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NightSystem } from '@/systems/NightSystem.js'
import { EventBus } from '@/engine/EventBus.js'
import { createInitialState } from '@/engine/initialState.js'
import type { IGameState, IGameEvent, GameEventType } from '@/interfaces/index.js'
import { DANGER_NIGHT_ENCOUNTERS, pickDangerEncounter } from '@/data/encounters/nightEncounters.js'

function makeEvent(type: GameEventType, payload: Record<string, unknown> = {}): IGameEvent {
  return { type, payload, timestamp: Date.now() }
}

function phaseEvent(from: string, to: string): IGameEvent {
  return makeEvent('phase.changed', { from, to })
}

// Helper: enter a dark night
function enterDarkNight(system: NightSystem, state: IGameState): IGameState {
  return system.onEvent(phaseEvent('dusk', 'night_dark'), state)
}

// Helper: survive a dark night (transition to dawn from night_dark)
function surviveDarkNight(system: NightSystem, state: IGameState): IGameState {
  return system.onEvent(phaseEvent('night_dark', 'dawn'), state)
}

describe('DarkNight — consecutive counter', () => {
  let system: NightSystem
  let bus: EventBus

  beforeEach(() => {
    bus = new EventBus()
    system = new NightSystem(bus)
  })

  it('increments consecutiveDarkNights when entering night_dark', () => {
    const state = createInitialState()
    const next = enterDarkNight(system, state)
    expect(next.consecutiveDarkNights).toBe(1)
  })

  it('resets consecutiveDarkNights when player survives (transitions to dawn)', () => {
    let state = createInitialState()
    state = enterDarkNight(system, state) // consecutive = 1
    state = surviveDarkNight(system, state)
    expect(state.consecutiveDarkNights).toBe(0)
  })

  it('resets consecutiveDarkNights on loop.started', () => {
    let state = { ...createInitialState(), consecutiveDarkNights: 4 }
    state = system.onEvent(makeEvent('loop.started'), state)
    expect(state.consecutiveDarkNights).toBe(0)
  })

  it('resets consecutiveDarkNights on player.died', () => {
    let state = { ...createInitialState(), consecutiveDarkNights: 3 }
    state = system.onEvent(makeEvent('player.died'), state)
    expect(state.consecutiveDarkNights).toBe(0)
  })

  it('counter resets to 0 after surviving, then increments again on next dark night', () => {
    let state = createInitialState()
    state = enterDarkNight(system, state)   // consecutive = 1
    state = surviveDarkNight(system, state) // consecutive = 0
    state = enterDarkNight(system, state)   // consecutive = 1
    expect(state.consecutiveDarkNights).toBe(1)
  })

  it('tracks consecutive counter correctly across multiple dark nights without dawn', () => {
    let state = createInitialState()
    state = enterDarkNight(system, state)
    expect(state.consecutiveDarkNights).toBe(1)
    state = enterDarkNight(system, state)
    expect(state.consecutiveDarkNights).toBe(2)
    state = enterDarkNight(system, state)
    expect(state.consecutiveDarkNights).toBe(3)
  })
})

describe('DarkNight — darkNightsSurvived counter', () => {
  let system: NightSystem
  let bus: EventBus

  beforeEach(() => {
    bus = new EventBus()
    system = new NightSystem(bus)
  })

  it('starts at 0 in initial state', () => {
    const state = createInitialState()
    expect(state.player.darkNightsSurvived).toBe(0)
  })

  it('increments darkNightsSurvived when player survives a dark night', () => {
    let state = createInitialState()
    state = enterDarkNight(system, state)
    state = surviveDarkNight(system, state)
    expect(state.player.darkNightsSurvived).toBe(1)
  })

  it('accumulates darkNightsSurvived across multiple survived nights', () => {
    let state = createInitialState()
    for (let i = 0; i < 3; i++) {
      state = enterDarkNight(system, state)
      state = surviveDarkNight(system, state)
    }
    expect(state.player.darkNightsSurvived).toBe(3)
  })

  it('does NOT increment darkNightsSurvived on daytime-to-daytime transitions', () => {
    let state = createInitialState()
    state = system.onEvent(phaseEvent('dawn', 'morning'), state)
    expect(state.player.darkNightsSurvived).toBe(0)
  })

  it('does NOT set dark_nights_survived_2plus flag after only 1 survived dark night', () => {
    let state = createInitialState()
    state = enterDarkNight(system, state)
    state = surviveDarkNight(system, state)
    expect(state.worldFlags.has('dark_nights_survived_2plus')).toBe(false)
  })

  it('sets dark_nights_survived_2plus flag after 2nd survived dark night', () => {
    let state = createInitialState()
    state = enterDarkNight(system, state)
    state = surviveDarkNight(system, state)
    state = enterDarkNight(system, state)
    state = surviveDarkNight(system, state)
    expect(state.worldFlags.has('dark_nights_survived_2plus')).toBe(true)
  })
})

// All encounter IDs — used to pre-seed worldFlags and prevent encounter effects from
// interfering with insight-loss tests (insight loss is a survival mechanic, not encounter effect).
const ALL_ENCOUNTER_IDS = [
  'fog_wraith', 'beckoning_light', 'drowned_shade', 'whispering_rocks',
  'spectral_tide', 'lighthouse_echo', 'kelp_tangle', 'broken_compass',
  'harbor_patrol', 'shadow_of_old_keeper', 'hollow_voice', 'storm_surge', 'creature_sighting',
]
const NO_ENCOUNTER_FLAGS = new Set(ALL_ENCOUNTER_IDS.map(id => `night_enc_seen.${id}`))

describe('DarkNight — insight loss on survival', () => {
  let system: NightSystem
  let bus: EventBus

  beforeEach(() => {
    bus = new EventBus()
    system = new NightSystem(bus)
  })

  it('loses 30–50% of insight when surviving a dark night (inclusive of both bounds)', () => {
    // Exclude all encounters so we test pure insight loss without encounter interference.
    // Using insight=200 and enough trials to ensure both 30% and 50% appear.
    const initialInsight = 200
    const losses: number[] = []

    for (let trial = 0; trial < 500; trial++) {
      const base = createInitialState()
      let state: IGameState = {
        ...base,
        player: { ...base.player, insight: initialInsight },
        worldFlags: new Set([...base.worldFlags, ...NO_ENCOUNTER_FLAGS]) as ReadonlySet<string>,
      }
      state = enterDarkNight(system, state)
      state = surviveDarkNight(system, state)
      const lost = initialInsight - state.player.insight
      losses.push(lost)
    }

    const min = Math.min(...losses)
    const max = Math.max(...losses)
    // For insight=200: floor(200 * 30/100)=60, floor(200 * 50/100)=100
    expect(min).toBeGreaterThanOrEqual(60)   // ≥ 30%
    expect(max).toBeLessThanOrEqual(100)     // ≤ 50%
    // With 500 trials, 50% (loss=100) should appear
    expect(losses).toContain(100)
  })

  it('does not reduce insight below 0', () => {
    const base = createInitialState()
    let state: IGameState = {
      ...base,
      player: { ...base.player, insight: 0 },
      worldFlags: new Set([...base.worldFlags, ...NO_ENCOUNTER_FLAGS]) as ReadonlySet<string>,
    }
    state = enterDarkNight(system, state)
    state = surviveDarkNight(system, state)
    expect(state.player.insight).toBe(0)
  })

  it('floors fractional insight loss (integer math)', () => {
    // insight = 7, lossPercent in [30,50]:
    // floor(7 * 30/100) = floor(2.1) = 2 → insight = 5
    // floor(7 * 50/100) = floor(3.5) = 3 → insight = 4
    // So resulting insight should be 4 or 5.
    let minInsight = Infinity
    let maxInsight = -Infinity
    for (let t = 0; t < 500; t++) {
      const base = createInitialState()
      let state: IGameState = {
        ...base,
        player: { ...base.player, insight: 7 },
        worldFlags: new Set([...base.worldFlags, ...NO_ENCOUNTER_FLAGS]) as ReadonlySet<string>,
      }
      state = enterDarkNight(system, state)
      state = surviveDarkNight(system, state)
      minInsight = Math.min(minInsight, state.player.insight)
      maxInsight = Math.max(maxInsight, state.player.insight)
    }
    expect(minInsight).toBe(4)
    expect(maxInsight).toBe(5)
  })
})

describe('DarkNight — escalation events', () => {
  let system: NightSystem
  let bus: EventBus
  const emitted: Array<{ type: string; payload: Record<string, unknown> }> = []

  beforeEach(() => {
    bus = new EventBus()
    emitted.length = 0
    bus.on('night.consecDark', (evt) => {
      emitted.push({ type: 'night.consecDark', payload: (evt as IGameEvent).payload })
    })
    bus.on('night.breaking_point', (evt) => {
      emitted.push({ type: 'night.breaking_point', payload: (evt as IGameEvent).payload })
    })
    bus.on('game.over', (evt) => {
      emitted.push({ type: 'game.over', payload: (evt as IGameEvent).payload })
    })
    system = new NightSystem(bus)
  })

  it('does NOT emit night.consecDark for the first 2 consecutive nights', () => {
    let state = createInitialState()
    state = enterDarkNight(system, state)
    state = enterDarkNight(system, state)
    expect(emitted.filter(e => e.type === 'night.consecDark')).toHaveLength(0)
  })

  it('emits night.consecDark with { count: 3 } on the 3rd consecutive dark night', () => {
    let state = createInitialState()
    state = enterDarkNight(system, state)
    state = enterDarkNight(system, state)
    state = enterDarkNight(system, state)
    const consecEvents = emitted.filter(e => e.type === 'night.consecDark')
    expect(consecEvents).toHaveLength(1)
    expect(consecEvents[0]!.payload['count']).toBe(3)
  })

  it('also emits legacy night.breaking_point on 3+ consecutive', () => {
    let state = createInitialState()
    state = enterDarkNight(system, state)
    state = enterDarkNight(system, state)
    state = enterDarkNight(system, state)
    expect(emitted.filter(e => e.type === 'night.breaking_point')).toHaveLength(1)
  })

  it('sets corruption_path_unlocked flag at 5th consecutive dark night', () => {
    let state = createInitialState()
    for (let i = 0; i < 5; i++) {
      state = enterDarkNight(system, state)
    }
    expect(state.worldFlags.has('corruption_path_unlocked')).toBe(true)
  })

  it('does NOT set corruption_path_unlocked before 5 consecutive', () => {
    let state = createInitialState()
    for (let i = 0; i < 4; i++) {
      state = enterDarkNight(system, state)
    }
    expect(state.worldFlags.has('corruption_path_unlocked')).toBe(false)
  })
})

describe('DarkNight — game-over at 7 consecutive', () => {
  let system: NightSystem
  let bus: EventBus
  const emitted: Array<{ type: string; payload: Record<string, unknown> }> = []

  beforeEach(() => {
    bus = new EventBus()
    emitted.length = 0
    bus.on('game.over', (evt) => {
      emitted.push({ type: 'game.over', payload: (evt as IGameEvent).payload })
    })
    system = new NightSystem(bus)
  })

  it('transitions to death phase on 7th consecutive dark night', () => {
    let state = createInitialState()
    for (let i = 0; i < 7; i++) {
      state = enterDarkNight(system, state)
    }
    expect(state.phase).toBe('death')
    expect(state.deathCause).toBe('dark_nights')
  })

  it('emits game.over with reason dark_nights at 7 consecutive', () => {
    let state = createInitialState()
    for (let i = 0; i < 7; i++) {
      state = enterDarkNight(system, state)
    }
    expect(emitted).toHaveLength(1)
    expect(emitted[0]!.payload['reason']).toBe('dark_nights')
  })

  it('does NOT trigger game-over before 7 consecutive', () => {
    let state = createInitialState()
    for (let i = 0; i < 6; i++) {
      state = enterDarkNight(system, state)
    }
    expect(state.phase).not.toBe('death')
    expect(emitted).toHaveLength(0)
  })
})

describe('DarkNight — encounter pool', () => {
  it('pool contains all 5 GDD-specified encounters', () => {
    const ids = DANGER_NIGHT_ENCOUNTERS.map(e => e.id)
    expect(ids).toContain('harbor_patrol')
    expect(ids).toContain('shadow_of_old_keeper')
    expect(ids).toContain('hollow_voice')
    expect(ids).toContain('storm_surge')
    expect(ids).toContain('creature_sighting')
  })

  it('pickDangerEncounter returns a valid encounter', () => {
    const state = createInitialState()
    const enc = pickDangerEncounter(0, state)
    expect(enc).not.toBeNull()
    expect(enc!.id).toBeTruthy()
  })

  it('pickDangerEncounter respects minDangerLevel filter (creature_sighting needs 30)', () => {
    const state = createInitialState()
    for (let t = 0; t < 100; t++) {
      const enc = pickDangerEncounter(0, state)
      expect(enc?.id).not.toBe('creature_sighting')
    }
  })

  it('pickDangerEncounter respects exclude set', () => {
    const state = createInitialState()
    const allIds = DANGER_NIGHT_ENCOUNTERS.filter(e => e.minDangerLevel <= 100).map(e => e.id)
    const exclude = new Set(allIds.filter(id => id !== 'harbor_patrol'))
    const enc = pickDangerEncounter(100, state, exclude)
    expect(enc?.id).toBe('harbor_patrol')
  })

  it('pickDangerEncounter returns null when all encounters are excluded', () => {
    const state = createInitialState()
    const allIds = new Set(DANGER_NIGHT_ENCOUNTERS.map(e => e.id))
    const enc = pickDangerEncounter(100, state, allIds)
    expect(enc).toBeNull()
  })

  it('shadow_of_old_keeper weight increases with loop count', () => {
    const shadowEnc = DANGER_NIGHT_ENCOUNTERS.find(e => e.id === 'shadow_of_old_keeper')!
    const base = createInitialState()
    const lowLoopState = { ...base, player: { ...base.player, loopCount: 0 } }
    const highLoopState = { ...base, player: { ...base.player, loopCount: 9 } }
    const lowWeight = shadowEnc.weightFn!(lowLoopState)
    const highWeight = shadowEnc.weightFn!(highLoopState)
    expect(highWeight).toBeGreaterThan(lowWeight)
  })

  it('storm_surge has zero weight in clear weather', () => {
    const surgeEnc = DANGER_NIGHT_ENCOUNTERS.find(e => e.id === 'storm_surge')!
    const clearState = { ...createInitialState(), weather: 'clear' as const }
    expect(surgeEnc.weightFn!(clearState)).toBe(0)
  })

  it('storm_surge has higher weight in storm than rain', () => {
    const surgeEnc = DANGER_NIGHT_ENCOUNTERS.find(e => e.id === 'storm_surge')!
    const base = createInitialState()
    const stormState = { ...base, weather: 'storm' as const }
    const rainState = { ...base, weather: 'rain' as const }
    expect(surgeEnc.weightFn!(stormState)).toBeGreaterThan(surgeEnc.weightFn!(rainState))
  })

  it('NightSystem applies stamina effect from harbor_patrol encounter', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const bus = new EventBus()
    const system = new NightSystem(bus)
    const base = createInitialState()
    // Exclude everything except harbor_patrol
    const state = {
      ...base,
      player: { ...base.player, currentLocation: 'harbor' as const, stamina: 5 },
      worldFlags: new Set([
        ...base.worldFlags,
        'night_enc_seen.fog_wraith',
        'night_enc_seen.whispering_rocks',
        'night_enc_seen.lighthouse_echo',
        'night_enc_seen.shadow_of_old_keeper',
        'night_enc_seen.hollow_voice',
        'night_enc_seen.storm_surge',
        'night_enc_seen.creature_sighting',
        'night_enc_seen.beckoning_light',
        'night_enc_seen.drowned_shade',
        'night_enc_seen.spectral_tide',
        'night_enc_seen.kelp_tangle',
        'night_enc_seen.broken_compass',
      ]),
    }
    const next = system.onEvent(phaseEvent('dusk', 'night_dark'), state)
    // harbor_patrol applies staminaDelta: -1
    expect(next.player.stamina).toBe(4)
    vi.restoreAllMocks()
  })

  it('NightSystem queues vision from shadow_of_old_keeper encounter', () => {
    const bus = new EventBus()
    const system = new NightSystem(bus)
    const base = createInitialState()
    // Exclude everything except shadow_of_old_keeper
    const state = {
      ...base,
      worldFlags: new Set([
        ...base.worldFlags,
        'night_enc_seen.fog_wraith',
        'night_enc_seen.whispering_rocks',
        'night_enc_seen.lighthouse_echo',
        'night_enc_seen.harbor_patrol',
        'night_enc_seen.hollow_voice',
        'night_enc_seen.storm_surge',
        'night_enc_seen.creature_sighting',
        'night_enc_seen.beckoning_light',
        'night_enc_seen.drowned_shade',
        'night_enc_seen.spectral_tide',
        'night_enc_seen.kelp_tangle',
        'night_enc_seen.broken_compass',
      ]),
    }
    const next = system.onEvent(phaseEvent('dusk', 'night_dark'), state)
    expect(next.pendingVisions).toContain('keeper_shadow')
  })
})
