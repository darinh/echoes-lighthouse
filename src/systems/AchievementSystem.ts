// ─────────────────────────────────────────────────────────────────────────────
// AchievementSystem — Tracks 10 milestones and emits achievement.unlocked.
//
// Achievements are persisted across saves (stored in IGameState.achievements).
// Each unlock emits `achievement.unlocked` and sets pendingAchievement so the
// renderer can display an amber toast for 3 seconds.
// ─────────────────────────────────────────────────────────────────────────────

import type { ISystem, IGameState, IGameEvent, IEventBus } from '@/interfaces/index.js'
import type { AchievementId } from '@/interfaces/types.js'
import { QUEST_REGISTRY } from '@/data/quests/index.js'
import { ENDING_NARRATIVES } from '@/data/endings/index.js'
import { ITEMS } from '@/data/items/index.js'

interface AchievementDefinition {
  readonly id: AchievementId
  readonly nameKey: string
  readonly descKey: string
}

const ACHIEVEMENTS: readonly AchievementDefinition[] = [
  { id: 'first_steps',           nameKey: 'achievement.first_steps.name',           descKey: 'achievement.first_steps.desc'           },
  { id: 'curious_mind',          nameKey: 'achievement.curious_mind.name',          descKey: 'achievement.curious_mind.desc'          },
  { id: 'voices_of_the_island',  nameKey: 'achievement.voices_of_the_island.name',  descKey: 'achievement.voices_of_the_island.desc'  },
  { id: 'finder_of_things',      nameKey: 'achievement.finder_of_things.name',      descKey: 'achievement.finder_of_things.desc'      },
  { id: 'full_pockets',          nameKey: 'achievement.full_pockets.name',          descKey: 'achievement.full_pockets.desc'          },
  { id: 'truth_seeker',          nameKey: 'achievement.truth_seeker.name',          descKey: 'achievement.truth_seeker.desc'          },
  { id: 'lore_keeper',           nameKey: 'achievement.lore_keeper.name',           descKey: 'achievement.lore_keeper.desc'           },
  { id: 'echo',                  nameKey: 'achievement.echo.name',                  descKey: 'achievement.echo.desc'                  },
  { id: 'all_echoes',            nameKey: 'achievement.all_echoes.name',            descKey: 'achievement.all_echoes.desc'            },
  { id: 'survivor',              nameKey: 'achievement.survivor.name',              descKey: 'achievement.survivor.desc'              },
]

const ALL_QUEST_IDS = new Set(Object.keys(QUEST_REGISTRY))
const ALL_ENDING_IDS = new Set(Object.keys(ENDING_NARRATIVES))
const ALL_ITEM_IDS = new Set(ITEMS.map(i => i.id))

/** Survive 5 dawns total (tracked via loop.dawn events). */
const SURVIVOR_LOOP_THRESHOLD = 5

export class AchievementSystem implements ISystem {
  readonly name = 'AchievementSystem'

  private readonly eventBus: IEventBus

  constructor(eventBus: IEventBus) {
    this.eventBus = eventBus
  }

  init(state: IGameState): IGameState { return state }

  update(state: IGameState, _deltaMs: number): IGameState {
    // Clear the toast once it has been shown for 3 seconds
    if (state.pendingAchievement && Date.now() - state.pendingAchievement.shownAt >= 3000) {
      return { ...state, pendingAchievement: null }
    }
    return state
  }

  onEvent(event: IGameEvent, state: IGameState): IGameState {
    switch (event.type) {
      case 'location.moved':
        return this.tryUnlock('first_steps', state)

      case 'examine.completed':
        return this.tryUnlock('curious_mind', state)

      case 'dialogue.start':
        return this.tryUnlock('voices_of_the_island', state)

      case 'item.taken': {
        let s = this.tryUnlock('finder_of_things', state)
        // Check full set
        if (ALL_ITEM_IDS.size > 0 && s.inventory.size >= ALL_ITEM_IDS.size) {
          s = this.tryUnlock('full_pockets', s)
        }
        return s
      }

      case 'quest.completed': {
        let s = this.tryUnlock('truth_seeker', state)
        // Lore Keeper: all quests from the registry are completed
        const allDone = [...ALL_QUEST_IDS].every(id => s.completedQuests.has(id))
        if (allDone && ALL_QUEST_IDS.size > 0) {
          s = this.tryUnlock('lore_keeper', s)
        }
        return s
      }

      case 'ending.triggered': {
        let s = this.tryUnlock('echo', state)
        // All Echoes: all known endings seen
        if (ALL_ENDING_IDS.size > 0 && s.endingsSeen.size >= ALL_ENDING_IDS.size) {
          s = this.tryUnlock('all_echoes', s)
        }
        return s
      }

      case 'loop.dawn': {
        // Survivor: player survives 5 dawns (loopCount is the running count)
        const loopCount = state.player.loopCount + 1 // +1 because dawn fires before increment
        if (loopCount >= SURVIVOR_LOOP_THRESHOLD) {
          return this.tryUnlock('survivor', state)
        }
        return state
      }

      default:
        return state
    }
  }

  // ─── Private helpers ─────────────────────────────────────────────────────

  private tryUnlock(id: AchievementId, state: IGameState): IGameState {
    if (state.achievements.has(id)) return state

    const def = ACHIEVEMENTS.find(a => a.id === id)
    if (!def) return state

    const newAchievements = new Set(state.achievements)
    newAchievements.add(id)

    this.eventBus.emit('achievement.unlocked', {
      achievementId: id,
      nameKey: def.nameKey,
      descKey: def.descKey,
    })

    return {
      ...state,
      achievements: newAchievements,
      pendingAchievement: {
        id,
        nameKey: def.nameKey,
        descKey: def.descKey,
        shownAt: Date.now(),
      },
    }
  }
}
