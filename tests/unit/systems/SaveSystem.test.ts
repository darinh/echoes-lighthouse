import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SaveSystem } from '@/systems/SaveSystem.js'
import { EventBus } from '@/engine/EventBus.js'
import { createInitialState } from '@/engine/initialState.js'
import type { IGameState } from '@/interfaces/index.js'

// Mock localStorage.
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: () => { store = {} },
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true })

describe('[Phase 3] SaveSystem', () => {
  let state: IGameState

  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
    state = createInitialState()
  })

  describe('saveState / loadState round-trip', () => {
    it('serialises and deserialises basic fields', () => {
      SaveSystem.saveState(state)
      const loaded = SaveSystem.loadState()
      expect(loaded).not.toBeNull()
      // phase always resets to 'morning' on load (non-persistent)
      expect(loaded!.phase).toBe('morning')
      expect(loaded!.saveVersion).toBe(1)
      // insight resets to 0 on load (non-persistent)
      expect(loaded!.player.insight).toBe(0)
      expect(loaded!.player.insightBanked).toBe(state.player.insightBanked)
      expect(loaded!.player.loopCount).toBe(state.player.loopCount)
    })

    it('resets non-persistent fields on load', () => {
      const modified: IGameState = {
        ...state,
        phase: 'night_dark',
        isPaused: true,
        deathCause: 'death.night_danger',
        player: { ...state.player, stamina: 20, lightReserves: 30, hearts: 1, insight: 99 },
      }
      SaveSystem.saveState(modified)
      const loaded = SaveSystem.loadState()
      expect(loaded!.phase).toBe('morning')
      expect(loaded!.isPaused).toBe(false)
      expect(loaded!.deathCause).toBeNull()
      expect(loaded!.player.stamina).toBe(10)
      expect(loaded!.player.lightReserves).toBe(100)
      expect(loaded!.player.hearts).toBe(3)
      expect(loaded!.player.insight).toBe(0)
    })

    it('round-trips worldFlags', () => {
      const withFlags: IGameState = {
        ...state,
        worldFlags: new Set(['lighthouse.examined', 'cottage.chest.opened']),
      }
      SaveSystem.saveState(withFlags)
      const loaded = SaveSystem.loadState()
      expect(loaded!.worldFlags.has('lighthouse.examined')).toBe(true)
      expect(loaded!.worldFlags.has('cottage.chest.opened')).toBe(true)
    })

    it('round-trips Sets correctly', () => {
      const withLocation: IGameState = {
        ...state,
        player: {
          ...state.player,
          discoveredLocations: new Set(['keepers_cottage', 'harbor']),
          sealedInsights: new Set(['card_01']),
        },
      }
      SaveSystem.saveState(withLocation)
      const loaded = SaveSystem.loadState()
      expect(loaded!.player.discoveredLocations.has('harbor')).toBe(true)
      expect(loaded!.player.sealedInsights.has('card_01')).toBe(true)
    })

    it('round-trips activeQuests and completedQuests', () => {
      const withQuests: IGameState = {
        ...state,
        activeQuests: new Set(['harbor_silence']),
        completedQuests: new Set(['light_source_truth']),
      }
      SaveSystem.saveState(withQuests)
      const loaded = SaveSystem.loadState()
      expect(loaded!.activeQuests.has('harbor_silence')).toBe(true)
      expect(loaded!.completedQuests.has('light_source_truth')).toBe(true)
    })

    it('returns null for a missing save', () => {
      expect(SaveSystem.loadState()).toBeNull()
    })

    it('returns null for save version 0 (corrupt)', () => {
      localStorageMock.setItem('echoes-lighthouse-save', JSON.stringify({ saveVersion: 0 }))
      expect(SaveSystem.loadState()).toBeNull()
    })

    it('attempts migration for mismatched save version', () => {
      // version 99 should attempt migration rather than silently drop
      const snapshot = JSON.parse(JSON.stringify({
        saveVersion: 99,
        phase: 'day',
        dayTimeRemaining: 1,
        locale: 'en',
        isPaused: false,
        deathCause: null,
        worldFlags: [],
        activeQuests: [],
        completedQuests: [],
        questStepProgress: {},
        player: {
          stamina: 100, lightReserves: 100, hearts: 3, insight: 0, insightBanked: 0,
          resonance: {}, trust: {}, archiveMastery: {}, loopCount: 0, moralWeight: 0,
          discoveredLocations: [], sealedInsights: [], activeJournalThreads: [],
          journalEntries: [], currentLocation: 'keepers_cottage',
        },
        npcStates: {},
      }))
      localStorageMock.setItem('echoes-lighthouse-save', JSON.stringify(snapshot))
      const loaded = SaveSystem.loadState()
      expect(loaded).not.toBeNull()
    })

    it('activeDialogue is null after load (ephemeral)', () => {
      SaveSystem.saveState(state)
      const loaded = SaveSystem.loadState()
      expect(loaded!.activeDialogue).toBeNull()
    })
  })

  describe('clearSave', () => {
    it('removes saved data', () => {
      SaveSystem.saveState(state)
      SaveSystem.clearSave()
      expect(SaveSystem.loadState()).toBeNull()
    })
  })

  describe('endingsSeen', () => {
    it('round-trips an empty endingsSeen set', () => {
      SaveSystem.saveState(state)
      const loaded = SaveSystem.loadState()
      expect(loaded!.endingsSeen.size).toBe(0)
    })

    it('round-trips populated endingsSeen across save/load', () => {
      const modified: IGameState = {
        ...state,
        endingsSeen: new Set(['liberation', 'transcendence']),
      }
      SaveSystem.saveState(modified)
      const loaded = SaveSystem.loadState()
      expect(loaded!.endingsSeen.has('liberation')).toBe(true)
      expect(loaded!.endingsSeen.has('transcendence')).toBe(true)
      expect(loaded!.endingsSeen.size).toBe(2)
    })

    it('loadEndingsSeen returns empty set when no save exists', () => {
      const seen = SaveSystem.loadEndingsSeen()
      expect(seen.size).toBe(0)
    })

    it('loadEndingsSeen returns persisted endings without full deserialise', () => {
      const modified: IGameState = {
        ...state,
        endingsSeen: new Set(['sacrifice', 'corruption']),
      }
      SaveSystem.saveState(modified)
      const seen = SaveSystem.loadEndingsSeen()
      expect(seen.has('sacrifice')).toBe(true)
      expect(seen.has('corruption')).toBe(true)
      expect(seen.size).toBe(2)
    })

    it('deserialises gracefully when endingsSeen is absent from old save format', () => {
      const snapshot = JSON.stringify({
        saveVersion: 1,
        worldFlags: [], activeQuests: [], completedQuests: [],
        questStepProgress: {}, inventory: [],
        player: {
          stamina: 10, lightReserves: 100, hearts: 3, insight: 0,
          insightBanked: 0, resonance: {}, trust: {}, archiveMastery: {},
          loopCount: 0, moralWeight: 0,
          discoveredLocations: [], sealedInsights: [], activeJournalThreads: [],
          journalEntries: [], currentLocation: 'keepers_cottage',
        },
        npcStates: {},
      })
      localStorageMock.setItem('echoes-lighthouse-save', snapshot)
      const loaded = SaveSystem.loadState()
      expect(loaded).not.toBeNull()
      expect(loaded!.endingsSeen.size).toBe(0)
    })
  })

  describe('system event triggers', () => {
    it('saves on location.entered', () => {
      const system = new SaveSystem(new EventBus())
      system.onEvent({ type: 'location.entered', payload: { locationId: 'harbor' }, timestamp: Date.now() }, state)
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })
  })
})
