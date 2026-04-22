import type {
  GamePhase,
  NPCId,
  LocationId,
  ArchiveDomain,
  InsightCardId,
  JournalThreadId,
  NPCAttitude,
  ItemId,
  EndingId,
  AchievementId,
} from './types.js'
import type { EncounterId } from '@/data/encounters/index.js'

export type WeatherType = 'clear' | 'fog' | 'rain' | 'storm'
export type Difficulty = 'easy' | 'normal' | 'hard'

export interface IJournalEntry {
  readonly id: string
  readonly timestamp: number   // loop count when added
  readonly locationId: LocationId
  readonly textKey: string     // i18n key
  readonly source: 'explore' | 'examine'
}

// ─────────────────────────────────────────────────────────────────────────────
// DIALOGUE STATE
// ─────────────────────────────────────────────────────────────────────────────

export interface IDialogueChoice {
  readonly id: string
  readonly textKey: string             // i18n key
  readonly requiresInsight?: number
  readonly requiresResonance?: number
  readonly requiresArchive?: { domain: ArchiveDomain; minLevel: number }
  readonly requiresSealedInsight?: InsightCardId
  readonly moralAlignment?: import('./types.js').MoralAlignment
  readonly isAvailable: boolean        // pre-computed by dialogue system
}

export interface IDialogueState {
  readonly npcId: NPCId
  readonly currentNodeId: string
  readonly speakerTextKey: string      // i18n key for current NPC line
  readonly availableChoices: ReadonlyArray<IDialogueChoice>
  readonly isActive: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// NPC STATE
// ─────────────────────────────────────────────────────────────────────────────

export interface INPCState {
  readonly id: NPCId
  readonly resonance: number                          // 0–10, persistent
  readonly isAlive: boolean
  readonly dialogueTier: number                       // 0–10, unlocked by resonance
  readonly revealedFacts: ReadonlySet<string>
  readonly lastInteractionLoop: number
  readonly attitude: NPCAttitude
  readonly currentLocation: LocationId | null
}

// ─────────────────────────────────────────────────────────────────────────────
// PLAYER STATE
// ─────────────────────────────────────────────────────────────────────────────

export interface IPlayerState {
  // Physical — reset on death
  readonly stamina: number                                        // 0–10
  readonly lightReserves: number                                  // 0–100
  readonly hearts: number                                         // 1–3

  // Persistent across loops
  readonly insight: number                                        // 0–999
  readonly insightBanked: number                                  // banked at archive desk
  readonly resonance: Readonly<Record<NPCId, number>>             // 0–10 per NPC (tier)
  readonly trust: Readonly<Record<NPCId, number>>                 // 0–200+ per NPC (raw trust currency)
  readonly archiveMastery: Readonly<Record<ArchiveDomain, number>> // page counts per domain
  readonly loopCount: number
  readonly moralWeight: number
  readonly discoveredLocations: ReadonlySet<LocationId>
  readonly sealedInsights: ReadonlySet<InsightCardId>
  readonly activeJournalThreads: ReadonlySet<JournalThreadId>
  readonly journalEntries: ReadonlyArray<IJournalEntry>
  readonly currentLocation: LocationId
  readonly examineHistory: Readonly<Record<string, number>>
  readonly relationshipFlags: Readonly<Record<string, boolean>>
  readonly shownRelationshipDialogue: ReadonlyArray<string>
  readonly searchedLocations: ReadonlySet<LocationId>
  /** Maps questId → loopCount when the quest was first started, for expiry checks. */
  readonly questExpiry: Readonly<Record<string, number>>
  /** Counts harmful dialogue choices (trustChange < -1) per NPC, for decay scaling. */
  readonly npcHarmCount: Readonly<Record<string, number>>
  /**
   * Archive pages buffered awaiting insight-card seals (Hard mode only).
   * Key = ExamineItem.worldFlag; value = seals still needed before the page
   * is applied to archiveMastery.  Always empty on Easy / Normal.
   */
  readonly pendingArchiveSeals: Readonly<Record<string, { readonly domain: ArchiveDomain; readonly sealsRemaining: number }>>
}

// ─────────────────────────────────────────────────────────────────────────────
// GAME STATE — The central read-only snapshot passed to all systems.
// Systems never mutate this directly; they return a new state.
// ─────────────────────────────────────────────────────────────────────────────

export interface IGameState {
  readonly phase: GamePhase
  readonly dayTimeRemaining: number                               // 0–1 fraction
  readonly player: IPlayerState
  readonly npcStates: Readonly<Record<NPCId, INPCState>>
  readonly activeDialogue: IDialogueState | null
  readonly activeQuests: ReadonlySet<string>
  readonly completedQuests: ReadonlySet<string>
  readonly questStepProgress: Readonly<Record<string, ReadonlySet<string>>>
  readonly locale: string
  readonly difficulty: Difficulty
  readonly isPaused: boolean
  readonly activePanel: 'none' | 'journal' | 'codex' | 'map' | 'settings'
  readonly worldFlags: ReadonlySet<string>
  readonly saveVersion: number
  readonly endingId: string | null
  readonly lastExaminedKey: string | null
  readonly nightDangerLevel: number
  readonly consecutiveDarkNights: number
  readonly pendingVisions: ReadonlyArray<string>
  readonly priorPhase: GamePhase | null
  readonly lighthouseLitThisLoop: boolean
  readonly deathCause: string | null
  readonly inventory: ReadonlySet<ItemId>
  readonly endingsSeen: ReadonlySet<EndingId>
  readonly audioMuted: boolean
  readonly achievements: ReadonlySet<AchievementId>
  readonly pendingAchievement: {
    readonly id: AchievementId
    readonly nameKey: string
    readonly descKey: string
    readonly shownAt: number
  } | null
  readonly pendingMilestoneMessage: {
    readonly messageKey: string
    readonly loopCount: number
    readonly shownAt: number
  } | null
  readonly settings: {
    readonly masterVolume: number
    readonly ambientVolume: number
    readonly uiVolume: number
    readonly narrativeVolume: number
    readonly locale: string
  }
  readonly weather: WeatherType
  readonly activeEncounter: EncounterId | null
  readonly nightEncounterShown: number
  readonly activeDilemma: string | null
  readonly resolvedDilemmas: ReadonlySet<string>
  readonly puzzleState: {
    readonly signalDials: readonly [number, number, number]
    readonly signalSolved: boolean
  }
  // ── Lighthouse repair minigame ────────────────────────────────────────────
  readonly activeMinigame?: 'lighthouse_repair' | null
  readonly lighthouseRepairStep?: number   // 0–2: which of the 3 repair steps
  readonly minigameTimerStart?: number     // Date.now() when current step started
}
