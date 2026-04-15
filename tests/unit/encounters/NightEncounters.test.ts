import { describe, it, expect } from 'vitest'
import { NIGHT_ENCOUNTERS, pickRandomEncounter } from '@/data/encounters/index.js'

describe('NIGHT_ENCOUNTERS data', () => {
  it('has exactly 6 encounters', () => {
    expect(NIGHT_ENCOUNTERS).toHaveLength(6)
  })

  it('all encounters have required fields', () => {
    for (const enc of NIGHT_ENCOUNTERS) {
      expect(enc.id).toBeTruthy()
      expect(enc.descKey).toMatch(/^encounter\./)
      expect(enc.investigateKey).toMatch(/^encounter\./)
      expect(enc.ignoreKey).toBe('encounter.ignore')
      expect(enc.staminaCost).toBe(1)
    }
  })

  it('lantern_flicker sets flag.signal_pattern_noted', () => {
    const enc = NIGHT_ENCOUNTERS.find(e => e.id === 'lantern_flicker')
    expect(enc?.rewardFlag).toBe('flag.signal_pattern_noted')
  })

  it('distant_light rewards 1 insight', () => {
    const enc = NIGHT_ENCOUNTERS.find(e => e.id === 'distant_light')
    expect(enc?.rewardInsight).toBe(1)
  })
})

describe('pickRandomEncounter', () => {
  it('returns an encounter when none excluded', () => {
    const enc = pickRandomEncounter(new Set())
    expect(enc).not.toBeNull()
  })

  it('returns null when all excluded', () => {
    const allIds = new Set(NIGHT_ENCOUNTERS.map(e => e.id))
    const result = pickRandomEncounter(allIds)
    expect(result).toBeNull()
  })

  it('never returns an excluded encounter', () => {
    const exclude = new Set(['distant_light', 'strange_sound', 'shadow_movement', 'tide_signal', 'lantern_flicker'])
    for (let i = 0; i < 20; i++) {
      const enc = pickRandomEncounter(exclude)
      if (enc) expect(enc.id).toBe('voice_in_wind')
    }
  })

  it('uses randomness — multiple picks can differ', () => {
    const results = new Set<string>()
    for (let i = 0; i < 50; i++) {
      const enc = pickRandomEncounter(new Set())
      if (enc) results.add(enc.id)
    }
    // With 6 encounters and 50 tries, expect at least 2 different results
    expect(results.size).toBeGreaterThan(1)
  })

  it('works with empty exclude set', () => {
    const enc = pickRandomEncounter()
    expect(enc).not.toBeNull()
  })
})
