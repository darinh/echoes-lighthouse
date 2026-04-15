import { describe, it, expect } from 'vitest'
import { NIGHT_ENCOUNTERS, pickRandomEncounter } from '@/data/encounters/index.js'

describe('NightEncounters data', () => {
  it('exports 6 encounters', () => {
    expect(NIGHT_ENCOUNTERS).toHaveLength(6)
  })

  it('all encounters have required fields', () => {
    for (const enc of NIGHT_ENCOUNTERS) {
      expect(enc.id).toBeTruthy()
      expect(enc.descKey).toBeTruthy()
      expect(enc.investigateKey).toBeTruthy()
      expect(enc.ignoreKey).toBeTruthy()
      expect(enc.staminaCost).toBeGreaterThan(0)
    }
  })

  it('lantern_flicker sets signal_pattern_noted flag', () => {
    const enc = NIGHT_ENCOUNTERS.find(e => e.id === 'lantern_flicker')
    expect(enc?.rewardFlag).toBe('flag.signal_pattern_noted')
  })

  it('pickRandomEncounter returns an encounter when no exclusions', () => {
    const enc = pickRandomEncounter()
    expect(enc).not.toBeNull()
    expect(NIGHT_ENCOUNTERS).toContain(enc)
  })

  it('pickRandomEncounter excludes specified ids', () => {
    const all = new Set(NIGHT_ENCOUNTERS.map(e => e.id))
    const keep = 'voice_in_wind'
    const exclude = new Set([...all].filter(id => id !== keep))
    const enc = pickRandomEncounter(exclude)
    expect(enc?.id).toBe(keep)
  })

  it('pickRandomEncounter returns null when all excluded', () => {
    const all = new Set(NIGHT_ENCOUNTERS.map(e => e.id))
    const result = pickRandomEncounter(all)
    expect(result).toBeNull()
  })

  it('all rewardInsight encounters have positive values', () => {
    for (const enc of NIGHT_ENCOUNTERS) {
      if (enc.rewardInsight !== undefined) {
        expect(enc.rewardInsight).toBeGreaterThan(0)
      }
    }
  })

  it('all encounter ids are unique', () => {
    const ids = NIGHT_ENCOUNTERS.map(e => e.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it('all encounters have ignore key pointing to encounter.ignore', () => {
    for (const enc of NIGHT_ENCOUNTERS) {
      expect(enc.ignoreKey).toBe('encounter.ignore')
    }
  })
})
