export interface DialogueChoice {
  id: string
  textKey: string
  nextNodeId?: string
  insightGain?: number
  trustGain?: number
  trustLoss?: number
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
  /** Hidden truth about this NPC, used by narrator/journal systems. Never shown directly in dialogue. */
  /** One-sentence hidden truth used by the narrator/journal system. Not shown in dialogue. */
  secret?: string
}
