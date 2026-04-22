export interface DialogueChoice {
  id: string
  textKey: string
  nextNodeId?: string
  insightGain?: number
  trustGain?: number
  trustLoss?: number
  moralWeight?: number
  requiresTier?: number
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
  secret?: string
}
