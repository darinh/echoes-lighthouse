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
      expect(loaded!.phase).toBe(state.phase)
      expect(loaded!.saveVersion).toBe(1)
      expect(loaded!.player.insight).toBe(state.player.insight)
      expect(loaded!.player.insightBanked).toBe(state.player.insightBanked)
      expect(loaded!.player.loopCount).toBe(state.player.loopCount)
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

    it('returns null for wrong save version', () => {
      localStorageMock.setItem('echoes-lighthouse-save', JSON.stringify({ saveVersion: 99 }))
      expect(SaveSystem.loadState()).toBeNull()
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

  describe('system event triggers', () => {
    it('saves on location.entered', () => {
      const system = new SaveSystem(new EventBus())
      system.onEvent({ type: 'location.entered', payload: { locationId: 'harbor' }, timestamp: Date.now() }, state)
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })
  })
})
