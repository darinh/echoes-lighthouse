export interface DialogueChoice {
  id: string
  textKey: string
  nextNodeId?: string
  insightGain?: number
  trustGain?: number
  trustLoss?: number
  /**
   * Signed trust delta: positive = gain, negative = loss.
   * Takes precedence over trustGain/trustLoss when present.
   * Values < -1 are considered "harmful" and trigger trust decay tracking
   * in RelationshipSystem (via npcHarmCount).
   */
  trustChange?: number
  moralWeight?: number
  /** Minimum NPC dialogue tier (trust level) required to see this choice. Canonical name — do NOT use requiresTier. */
  requiresResonance?: number
  /** @deprecated Use requiresResonance. Kept as `never` so TypeScript surfaces any stale data-file usage. */
  requiresTier?: never
  requiresInsight?: number
  requiresSealedInsight?: string
  requiresArchiveDomain?: string | { domain: string; level: number }
  worldFlagSet?: string
  worldFlagRequired?: string
  questTrigger?: string
  questStart?: string
}

/**
 * Per-NPC quest availability configuration attached to NPCFullData.
 * Expresses loop-based expiry and turn-window gating alongside NPC data
 * without touching the global QuestDefinition registry.
 */
export interface NPCQuestConfig {
  questId: string
  /** Quest expires if not completed within this many loops from when first offered. */
  expiresAfterLoops?: number
  /** Quest branch is visible only when loopCount is in [min, max] inclusive. */
  availableTurns?: { min: number; max: number }
}

export interface DialogueNode {
  speakerKey: string
  choices: DialogueChoice[]
}

export interface NPCSchedule {
  [phase: string]: string
}

export interface NPCFullData {
  id: string
  nameKey: string
  titleKey: string
  defaultLocation: string
  defaultAttitude: string
  schedule: NPCSchedule
  tierThresholds: number[]
  greetingNodes: string[]
  nodes: Record<string, DialogueNode>
  /** One-sentence hidden truth used by the narrator/journal system. Not shown in dialogue. */
  secret?: string
  /**
   * Quest availability overrides for this NPC's quests.
   * Used by RelationshipSystem to enforce loop-based expiry and turn-window gating.
   */
  quests?: NPCQuestConfig[]
  /**
   * Weather-specific opening lines prepended to the NPC's greeting dialogue.
   * Values are i18n keys resolved through the locale system.
   */
  weatherDialogue?: {
    storm?: string
    fog?: string
    clear?: string
  }
}
