import type { ISystem } from '@/interfaces/index.js'
import type { IGameState } from '@/interfaces/index.js'
import type { IGameEvent } from '@/interfaces/index.js'
import type { IEventBus } from '@/interfaces/index.js'
import type { ArchiveDomain, LocationId, InsightCardId } from '@/interfaces/index.js'

/** Daily insight cap per loop. */
const DAILY_INSIGHT_CAP = 150
/** Multiplier applied to insight gains once the cap is exceeded. */
const POST_CAP_MULTIPLIER = 0.4

/** Page counts needed for each Archive mastery level. */
const ARCHIVE_THRESHOLDS = { novice: 3, adept: 6, master: 10 } as const

/** Insight awarded for discovering a new location (flat amount). */
const LOCATION_DISCOVERY_INSIGHT = 10

/**
 * KnowledgeSystem — Manages Insight, Archive Mastery, and Insight Cards.
 * See docs/gdd/04-systems-design.md §1–2 for full balance numbers.
 */
export class KnowledgeSystem implements ISystem {
  readonly name = 'KnowledgeSystem'

  /** Running total of insight gained this loop (resets on loop.started). */
  private currentLoopInsightGained = 0

  constructor(private readonly eventBus: IEventBus) {}

  init(state: IGameState): IGameState { return state }

  update(state: IGameState, _deltaMs: number): IGameState {
    return state
  }

  onEvent(event: IGameEvent, state: IGameState): IGameState {
    switch (event.type) {
      case 'insight.gained':
        return this.handleInsightGained(event, state)
      case 'archive.page.found':
        return this.handleArchivePage(event, state)
      case 'insight.card.sealed':
        return this.handleInsightCardSealed(state)
      case 'insight.card.requirements.met':
        return this.handleInsightCardMet(event, state)
      case 'location.entered':
        return this.handleLocationEntered(event, state)
      case 'loop.started':
        this.currentLoopInsightGained = 0
        return state
      default:
        return state
    }
  }

  private handleInsightGained(event: IGameEvent, state: IGameState): IGameState {
    const { amount } = event.payload as { amount: number }
    if (amount <= 0) return state

    // Apply daily cap with diminishing returns past 150/loop.
    const remaining = Math.max(0, DAILY_INSIGHT_CAP - this.currentLoopInsightGained)
    const inCap = Math.min(amount, remaining)
    const overCap = amount - inCap
    const effective = Math.round(inCap + overCap * POST_CAP_MULTIPLIER)

    this.currentLoopInsightGained += amount
    const newInsight = Math.min(999, state.player.insight + effective)
    return {
      ...state,
      player: { ...state.player, insight: newInsight },
    }
  }

  private handleArchivePage(event: IGameEvent, state: IGameState): IGameState {
    const { domain, itemFlag, requiresSeals } = event.payload as {
      domain: ArchiveDomain
      itemFlag?: string
      requiresSeals?: number
    }

    // GDD §10 — Hard mode: entries with requiresSeals > 1 are buffered until
    // the player seals that many insight cards.
    const neededSeals = requiresSeals ?? 1
    if (state.difficulty === 'hard' && neededSeals > 1 && itemFlag) {
      const pending = { ...state.player.pendingArchiveSeals }
      // Guard against duplicate events for the same item.
      if (!pending[itemFlag]) {
        pending[itemFlag] = { domain, sealsRemaining: neededSeals }
      }
      return {
        ...state,
        player: { ...state.player, pendingArchiveSeals: pending },
      }
    }

    return this.applyArchivePage(domain, state)
  }

  /**
   * On Hard difficulty, each insight-card seal decrements all pending archive
   * page counters by 1.  Entries that reach 0 are applied to mastery.
   * GDD §10 — Hard mode archive gate.
   */
  private handleInsightCardSealed(state: IGameState): IGameState {
    if (state.difficulty !== 'hard') return state
    const pending = { ...state.player.pendingArchiveSeals }
    let newState = state
    let changed = false

    for (const key of Object.keys(pending)) {
      const entry = pending[key]
      const newRemaining = entry.sealsRemaining - 1
      if (newRemaining <= 0) {
        // All seals consumed — apply the page to mastery.
        delete pending[key]
        newState = this.applyArchivePage(entry.domain, newState)
      } else {
        pending[key] = { ...entry, sealsRemaining: newRemaining }
      }
      changed = true
    }

    if (!changed) return state
    return {
      ...newState,
      player: { ...newState.player, pendingArchiveSeals: pending },
    }
  }

  /** Apply one archive page to mastery (shared by immediate and deferred paths). */
  private applyArchivePage(domain: ArchiveDomain, state: IGameState): IGameState {
    const currentCount = state.player.archiveMastery[domain] ?? 0
    const newCount = currentCount + 1

    const newState: IGameState = {
      ...state,
      player: {
        ...state.player,
        archiveMastery: { ...state.player.archiveMastery, [domain]: newCount },
      },
    }

    // Check if a mastery level threshold was just crossed.
    const prevLevel = this.masteryLevelFromCount(currentCount)
    const nextLevel = this.masteryLevelFromCount(newCount)
    if (nextLevel !== prevLevel) {
      this.eventBus.emit('archive.domain.unlocked', { domain, level: nextLevel })
    }

    return newState
  }

  private handleInsightCardMet(event: IGameEvent, state: IGameState): IGameState {
    const { cardId } = event.payload as { cardId: InsightCardId }
    if (state.player.sealedInsights.has(cardId)) return state
    const newSealed = new Set(state.player.sealedInsights)
    newSealed.add(cardId)
    return {
      ...state,
      player: { ...state.player, sealedInsights: newSealed },
    }
  }

  private handleLocationEntered(event: IGameEvent, state: IGameState): IGameState {
    const { locationId } = event.payload as { locationId: LocationId }
    if (state.player.discoveredLocations.has(locationId)) return state

    const newDiscovered = new Set(state.player.discoveredLocations)
    newDiscovered.add(locationId)
    const newState: IGameState = {
      ...state,
      player: { ...state.player, discoveredLocations: newDiscovered },
    }

    // Award insight for discovering a new location.
    this.eventBus.emit('insight.gained', { amount: LOCATION_DISCOVERY_INSIGHT })
    return this.handleInsightGained(
      { type: 'insight.gained', payload: { amount: LOCATION_DISCOVERY_INSIGHT }, timestamp: Date.now() },
      newState,
    )
  }

  /** Returns the mastery level label for a given page count. */
  masteryLevelFromCount(count: number): 'none' | 'novice' | 'adept' | 'master' {
    if (count >= ARCHIVE_THRESHOLDS.master) return 'master'
    if (count >= ARCHIVE_THRESHOLDS.adept)  return 'adept'
    if (count >= ARCHIVE_THRESHOLDS.novice) return 'novice'
    return 'none'
  }
}

