import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AchievementSystem } from '@/systems/AchievementSystem.js'
import { EventBus } from '@/engine/EventBus.js'
import { createInitialState } from '@/engine/initialState.js'
import type { IGameState, IGameEvent, GameEventType } from '@/interfaces/index.js'
import type { AchievementId, ItemId, EndingId } from '@/interfaces/types.js'
import { QUEST_REGISTRY } from '@/data/quests/index.js'
import { ENDING_NARRATIVES } from '@/data/endings/index.js'
import { ITEMS } from '@/data/items/index.js'

function makeEvent(type: GameEventType, payload: Record<string, unknown> = {}): IGameEvent {
  return { type, payload, timestamp: Date.now() }
}

function withAchievements(state: IGameState, ids: AchievementId[]): IGameState {
  return { ...state, achievements: new Set(ids) }
}

function withInventory(state: IGameState, ids: ItemId[]): IGameState {
  return { ...state, inventory: new Set(ids) }
}

function withCompletedQuests(state: IGameState, ids: string[]): IGameState {
  return { ...state, completedQuests: new Set(ids) }
}

function withEndingsSeen(state: IGameState, ids: EndingId[]): IGameState {
  return { ...state, endingsSeen: new Set(ids) }
}

function withLoopCount(state: IGameState, count: number): IGameState {
  return { ...state, player: { ...state.player, loopCount: count } }
}

describe('AchievementSystem', () => {
  let system: AchievementSystem
  let bus: EventBus
  let unlocked: string[]

  beforeEach(() => {
    bus = new EventBus()
    unlocked = []
    bus.on('achievement.unlocked', (e) => {
      const p = e.payload as { achievementId: string }
      unlocked.push(p.achievementId)
    })
    system = new AchievementSystem(bus)
  })

  // ── first_steps ────────────────────────────────────────────────────────────

  describe('first_steps', () => {
    it('unlocks on location.moved', () => {
      const state = createInitialState()
      const next = system.onEvent(makeEvent('location.moved'), state)
      expect(next.achievements.has('first_steps')).toBe(true)
      expect(unlocked).toContain('first_steps')
    })

    it('does not unlock twice', () => {
      const state = withAchievements(createInitialState(), ['first_steps'])
      system.onEvent(makeEvent('location.moved'), state)
      expect(unlocked).not.toContain('first_steps')
    })

    it('sets pendingAchievement with correct keys', () => {
      const state = createInitialState()
      const next = system.onEvent(makeEvent('location.moved'), state)
      expect(next.pendingAchievement).not.toBeNull()
      expect(next.pendingAchievement?.id).toBe('first_steps')
      expect(next.pendingAchievement?.nameKey).toBe('achievement.first_steps.name')
      expect(next.pendingAchievement?.descKey).toBe('achievement.first_steps.desc')
    })
  })

  // ── curious_mind ───────────────────────────────────────────────────────────

  describe('curious_mind', () => {
    it('unlocks on examine.completed', () => {
      const state = createInitialState()
      const next = system.onEvent(makeEvent('examine.completed'), state)
      expect(next.achievements.has('curious_mind')).toBe(true)
    })

    it('does not unlock twice', () => {
      const state = withAchievements(createInitialState(), ['curious_mind'])
      system.onEvent(makeEvent('examine.completed'), state)
      expect(unlocked).not.toContain('curious_mind')
    })
  })

  // ── voices_of_the_island ───────────────────────────────────────────────────

  describe('voices_of_the_island', () => {
    it('unlocks on dialogue.start', () => {
      const state = createInitialState()
      const next = system.onEvent(makeEvent('dialogue.start'), state)
      expect(next.achievements.has('voices_of_the_island')).toBe(true)
    })
  })

  // ── finder_of_things ───────────────────────────────────────────────────────

  describe('finder_of_things', () => {
    it('unlocks on item.taken', () => {
      const state = createInitialState()
      const next = system.onEvent(makeEvent('item.taken'), state)
      expect(next.achievements.has('finder_of_things')).toBe(true)
    })
  })

  // ── full_pockets ───────────────────────────────────────────────────────────

  describe('full_pockets', () => {
    it('unlocks when inventory size matches all items', () => {
      const allItems = ITEMS.map(i => i.id)
      const state = withInventory(createInitialState(), allItems)
      const next = system.onEvent(makeEvent('item.taken'), state)
      expect(next.achievements.has('full_pockets')).toBe(true)
    })

    it('does not unlock with partial inventory', () => {
      const state = withInventory(createInitialState(), ['keeper_logbook'])
      const next = system.onEvent(makeEvent('item.taken'), state)
      expect(next.achievements.has('full_pockets')).toBe(false)
    })

    it('unlocks finder_of_things and full_pockets in one event', () => {
      const allItems = ITEMS.map(i => i.id)
      const state = withInventory(createInitialState(), allItems)
      const next = system.onEvent(makeEvent('item.taken'), state)
      expect(next.achievements.has('finder_of_things')).toBe(true)
      expect(next.achievements.has('full_pockets')).toBe(true)
    })
  })

  // ── truth_seeker ───────────────────────────────────────────────────────────

  describe('truth_seeker', () => {
    it('unlocks on quest.completed', () => {
      const state = createInitialState()
      const next = system.onEvent(makeEvent('quest.completed'), state)
      expect(next.achievements.has('truth_seeker')).toBe(true)
    })
  })

  // ── lore_keeper ────────────────────────────────────────────────────────────

  describe('lore_keeper', () => {
    it('unlocks when all quests are completed', () => {
      const allQuestIds = Object.keys(QUEST_REGISTRY)
      const state = withCompletedQuests(createInitialState(), allQuestIds)
      const next = system.onEvent(makeEvent('quest.completed'), state)
      expect(next.achievements.has('lore_keeper')).toBe(true)
    })

    it('does not unlock with only some quests completed', () => {
      const state = withCompletedQuests(createInitialState(), ['island_history'])
      const next = system.onEvent(makeEvent('quest.completed'), state)
      expect(next.achievements.has('lore_keeper')).toBe(false)
    })
  })

  // ── echo ───────────────────────────────────────────────────────────────────

  describe('echo', () => {
    it('unlocks on ending.triggered', () => {
      const state = createInitialState()
      const next = system.onEvent(makeEvent('ending.triggered'), state)
      expect(next.achievements.has('echo')).toBe(true)
    })
  })

  // ── all_echoes ─────────────────────────────────────────────────────────────

  describe('all_echoes', () => {
    it('unlocks when all endings have been seen', () => {
      const allEndings = Object.keys(ENDING_NARRATIVES) as EndingId[]
      const state = withEndingsSeen(createInitialState(), allEndings)
      const next = system.onEvent(makeEvent('ending.triggered'), state)
      expect(next.achievements.has('all_echoes')).toBe(true)
    })

    it('does not unlock with only some endings seen', () => {
      const state = withEndingsSeen(createInitialState(), ['keepers_bargain' as EndingId])
      const next = system.onEvent(makeEvent('ending.triggered'), state)
      expect(next.achievements.has('all_echoes')).toBe(false)
    })
  })

  // ── survivor ───────────────────────────────────────────────────────────────

  describe('survivor', () => {
    it('unlocks when loopCount reaches threshold', () => {
      // loop.dawn fires before increment, so loopCount + 1 >= 5
      const state = withLoopCount(createInitialState(), 4)
      const next = system.onEvent(makeEvent('loop.dawn'), state)
      expect(next.achievements.has('survivor')).toBe(true)
    })

    it('does not unlock before threshold', () => {
      const state = withLoopCount(createInitialState(), 2)
      const next = system.onEvent(makeEvent('loop.dawn'), state)
      expect(next.achievements.has('survivor')).toBe(false)
    })
  })

  // ── update / toast expiry ─────────────────────────────────────────────────

  describe('update', () => {
    it('clears pendingAchievement after 3 seconds', () => {
      const state: IGameState = {
        ...createInitialState(),
        pendingAchievement: {
          id: 'first_steps',
          nameKey: 'achievement.first_steps.name',
          descKey: 'achievement.first_steps.desc',
          shownAt: Date.now() - 3001,
        },
      }
      const next = system.update(state, 16)
      expect(next.pendingAchievement).toBeNull()
    })

    it('keeps pendingAchievement while still within 3 seconds', () => {
      const state: IGameState = {
        ...createInitialState(),
        pendingAchievement: {
          id: 'first_steps',
          nameKey: 'achievement.first_steps.name',
          descKey: 'achievement.first_steps.desc',
          shownAt: Date.now() - 500,
        },
      }
      const next = system.update(state, 16)
      expect(next.pendingAchievement).not.toBeNull()
    })
  })

  // ── race condition / concurrent grants ────────────────────────────────────

  describe('concurrent grant deduplication', () => {
    it('grants the same achievement only once when two events fire before state propagates', () => {
      // Simulate two events arriving in the same tick: both receive the
      // same unmodified state snapshot (state never flows back between calls).
      const state = createInitialState()
      system.onEvent(makeEvent('location.moved'), state)
      system.onEvent(makeEvent('location.moved'), state)

      // achievement.unlocked must have been emitted exactly once
      const firstStepsEmits = unlocked.filter(id => id === 'first_steps')
      expect(firstStepsEmits.length).toBe(1)
    })

    it('can grant two different achievements in the same tick without interference', () => {
      // Both events share the same baseline state (no achievements yet).
      const state = createInitialState()
      const s1 = system.onEvent(makeEvent('location.moved'), state)
      const s2 = system.onEvent(makeEvent('examine.completed'), state)

      // Each returned snapshot has its own new achievement
      expect(s1.achievements.has('first_steps')).toBe(true)
      expect(s2.achievements.has('curious_mind')).toBe(true)

      // Both were emitted exactly once
      expect(unlocked.filter(id => id === 'first_steps').length).toBe(1)
      expect(unlocked.filter(id => id === 'curious_mind').length).toBe(1)
    })
  })

  // ── SaveSystem round-trip ─────────────────────────────────────────────────

  describe('persistence (SaveSystem integration)', () => {
    it('achievements survive a save/load cycle', async () => {
      const { SaveSystem } = await import('@/systems/SaveSystem.js')
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

      const state: IGameState = {
        ...createInitialState(),
        achievements: new Set(['first_steps', 'curious_mind'] as AchievementId[]),
      }
      SaveSystem.saveState(state)
      const loaded = SaveSystem.loadState()
      expect(loaded).not.toBeNull()
      expect(loaded!.achievements.has('first_steps')).toBe(true)
      expect(loaded!.achievements.has('curious_mind')).toBe(true)
      expect(loaded!.pendingAchievement).toBeNull()
    })
  })
})
