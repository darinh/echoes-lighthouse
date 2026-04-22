import type { ISystem } from '@/interfaces/index.js'
import type { IGameState } from '@/interfaces/index.js'
import type { IGameEvent } from '@/interfaces/index.js'
import type { IEventBus } from '@/interfaces/index.js'
import type { ArchiveDomain } from '@/interfaces/index.js'

// ─────────────────────────────────────────────────────────────────────────────
// MASTERY TIER THRESHOLDS  (pages collected per domain)
// ─────────────────────────────────────────────────────────────────────────────

export const MASTERY_TIERS = {
  novice: 3,
  adept:  6,
  master: 10,
} as const

export type MasteryTier = 'novice' | 'adept' | 'master'

/** All seven domains that must reach master for full-archive completion. */
export const ALL_DOMAINS: ReadonlyArray<ArchiveDomain> = [
  'history', 'occult', 'maritime', 'ecology', 'alchemy', 'cartography', 'linguistics',
]

// ─────────────────────────────────────────────────────────────────────────────
// UNLOCK DESCRIPTIONS  (shown in the Codex unlock-tree panel)
// Each domain has 3 tiers; each tier unlocks something in the game world.
// ─────────────────────────────────────────────────────────────────────────────

export interface MasteryUnlock {
  readonly tier: MasteryTier
  /** Short display text for the Codex unlock-tree. */
  readonly label: string
}

export const MASTERY_UNLOCKS: Readonly<Record<ArchiveDomain, ReadonlyArray<MasteryUnlock>>> = {
  history: [
    { tier: 'novice', label: 'Dialogue: Maren shares keeper lineage details' },
    { tier: 'adept',  label: 'Location path: Ruins lower chamber unlocked' },
    { tier: 'master', label: 'Ending variant: Keeper\'s Peace — historical context option' },
  ],
  occult: [
    { tier: 'novice', label: 'Dialogue: Vael hints at the Warden\'s origin' },
    { tier: 'adept',  label: 'Location path: Tidal Caves spirit passage visible' },
    { tier: 'master', label: 'Ending variant: Drowned Truth — occult resolution path' },
  ],
  maritime: [
    { tier: 'novice', label: 'Dialogue: Silas reveals hidden harbour routes' },
    { tier: 'adept',  label: 'Location path: Cliffside signal station accessible' },
    { tier: 'master', label: 'Ending variant: Sunken Accord — maritime negotiation' },
  ],
  ecology: [
    { tier: 'novice', label: 'Dialogue: Thalia offers rare herbalist recipes' },
    { tier: 'adept',  label: 'Location path: Forest Path hidden grove discoverable' },
    { tier: 'master', label: 'Ending variant: Light Restored — ecological balance path' },
  ],
  alchemy: [
    { tier: 'novice', label: 'Dialogue: Petra reveals potion formula knowledge' },
    { tier: 'adept',  label: 'Location path: Archive Basement sealed vault opens' },
    { tier: 'master', label: 'Ending variant: Transcendence — alchemical ascension path' },
  ],
  cartography: [
    { tier: 'novice', label: 'Dialogue: Corvin shares unmapped island passages' },
    { tier: 'adept',  label: 'Location path: Mechanism Room secondary access' },
    { tier: 'master', label: 'Ending variant: Endless Loop — cartographic recursion path' },
  ],
  linguistics: [
    { tier: 'novice', label: 'Dialogue: Maren translates keeper cipher inscriptions' },
    { tier: 'adept',  label: 'Location path: Chapel hidden inscription chamber' },
    { tier: 'master', label: 'Ending variant: Liberation — linguistic decoding path' },
  ],
}

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ArchiveMasterySystem — GDD §8.4
 *
 * Reacts to archive.domain.unlocked events emitted by KnowledgeSystem when a
 * domain crosses a mastery level.  This system:
 *   • Re-emits as mastery.unlocked with { category, tier } for other systems
 *     (EndingSystem, DialogueSystem, etc.) to consume.
 *   • Adds the world flag archive_mastery_complete when all seven domains
 *     reach master level.
 *
 * State tracking lives in state.player.archiveMastery (owned by
 * KnowledgeSystem). This system is purely reactive — it never mutates
 * archiveMastery directly.
 */
export class ArchiveMasterySystem implements ISystem {
  readonly name = 'ArchiveMasterySystem'

  constructor(private readonly eventBus: IEventBus) {}

  init(state: IGameState): IGameState { return state }

  update(state: IGameState, _deltaMs: number): IGameState { return state }

  onEvent(event: IGameEvent, state: IGameState): IGameState {
    switch (event.type) {
      case 'archive.domain.unlocked':
        return this.handleDomainUnlocked(event, state)
      default:
        return state
    }
  }

  // ─── Private ─────────────────────────────────────────────────────────────

  private handleDomainUnlocked(event: IGameEvent, state: IGameState): IGameState {
    const { domain, level } = event.payload as { domain: ArchiveDomain; level: string }

    // Only forward recognised tiers.
    if (level !== 'novice' && level !== 'adept' && level !== 'master') return state
    const tier = level as MasteryTier

    // Re-emit as the canonical mastery.unlocked event (used by UI and other systems).
    this.eventBus.emit('mastery.unlocked', { category: domain, tier })

    // Check full-archive completion only on 'master' transitions.
    if (tier !== 'master') return state

    // Build the updated mastery snapshot — this event's payload gives us the
    // newly reached level, but state already reflects the incremented count
    // (KnowledgeSystem processed this event before us).
    const allMastered = ALL_DOMAINS.every(d => {
      const count = state.player.archiveMastery[d] ?? 0
      return count >= MASTERY_TIERS.master
    })

    if (allMastered && !state.worldFlags.has('archive_mastery_complete')) {
      const newFlags = new Set(state.worldFlags)
      newFlags.add('archive_mastery_complete')
      this.eventBus.emit('mastery.unlocked', { category: 'all', tier: 'master' })
      return { ...state, worldFlags: newFlags }
    }

    return state
  }

  // ─── Static helpers (used by UIManager for unlock tree) ──────────────────

  /**
   * Returns the mastery tier label for a given page count, or null if below
   * the first threshold.
   */
  static tierFromCount(count: number): MasteryTier | null {
    if (count >= MASTERY_TIERS.master) return 'master'
    if (count >= MASTERY_TIERS.adept)  return 'adept'
    if (count >= MASTERY_TIERS.novice) return 'novice'
    return null
  }

  /**
   * Returns the next tier threshold for a count, or null when already at master.
   */
  static nextThreshold(count: number): number | null {
    if (count < MASTERY_TIERS.novice) return MASTERY_TIERS.novice
    if (count < MASTERY_TIERS.adept)  return MASTERY_TIERS.adept
    if (count < MASTERY_TIERS.master) return MASTERY_TIERS.master
    return null
  }
}
