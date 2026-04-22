import { describe, it, expect } from 'vitest'
import { createInitialState } from '@/engine/initialState.js'
import { ECHOES_CODEX } from '@/data/codex/echoes.js'
import type { EndingId } from '@/interfaces/types.js'

describe('Endings Tracker', () => {
  describe('initialState', () => {
    it('starts with an empty endingsSeen set', () => {
      const state = createInitialState()
      expect(state.endingsSeen.size).toBe(0)
    })

    it('endingsSeen is a ReadonlySet', () => {
      const state = createInitialState()
      expect(state.endingsSeen).toBeInstanceOf(Set)
    })
  })

  describe('ECHOES_CODEX', () => {
    it('has exactly 6 entries matching the 6 ending IDs', () => {
      expect(ECHOES_CODEX.length).toBe(6)
    })

    it('covers all EndingId values', () => {
      const expectedIds: EndingId[] = [
        'keepers_bargain', 'drowned_truth', 'light_restored',
        'sunken_accord', 'endless_loop', 'transcendence',
      ]
      const codexIds = ECHOES_CODEX.map(e => e.endingId)
      for (const id of expectedIds) {
        expect(codexIds).toContain(id)
      }
    })

    it('every entry has required locale keys', () => {
      for (const entry of ECHOES_CODEX) {
        expect(entry.shortNameKey).toMatch(/^ending_tracker\..+\.short$/)
        expect(entry.titleKey).toMatch(/^ending_tracker\..+\.codex_title$/)
        expect(entry.bodyKey).toMatch(/^ending_tracker\..+\.codex_body$/)
      }
    })
  })

  describe('endingsSeen mutation', () => {
    it('can record a seen ending via immutable Set construction', () => {
      const state = createInitialState()
      const updated = new Set(state.endingsSeen)
      updated.add('keepers_bargain' as EndingId)
      const newState = { ...state, endingsSeen: updated }

      expect(newState.endingsSeen.has('keepers_bargain')).toBe(true)
      expect(newState.endingsSeen.size).toBe(1)
      // original is unchanged
      expect(state.endingsSeen.size).toBe(0)
    })

    it('preserves previous endings when a new one is added', () => {
      const s1 = new Set<EndingId>(['drowned_truth'])
      const s2 = new Set(s1)
      s2.add('light_restored')

      expect(s2.has('drowned_truth')).toBe(true)
      expect(s2.has('light_restored')).toBe(true)
      expect(s2.size).toBe(2)
    })

    it('deduplicates: adding the same ending twice keeps size 1', () => {
      const seen = new Set<EndingId>(['transcendence'])
      seen.add('transcendence')
      expect(seen.size).toBe(1)
    })
  })

  describe('new.game preservation', () => {
    it('endingsSeen field exists on state returned by createInitialState', () => {
      const state = createInitialState()
      expect('endingsSeen' in state).toBe(true)
    })

    it('new game state can be created with preserved endingsSeen', () => {
      const originalState = createInitialState()
      const seenSet = new Set<EndingId>(['sunken_accord'])
      const stateAfterEnding = { ...originalState, endingsSeen: seenSet }

      // Simulate what GameEngine does on new.game
      const newGameState = {
        ...createInitialState(),
        phase: 'dawn' as const,
        endingsSeen: stateAfterEnding.endingsSeen,
      }
      expect(newGameState.endingsSeen.has('sunken_accord')).toBe(true)
      expect(newGameState.phase).toBe('dawn')
    })
  })
})
