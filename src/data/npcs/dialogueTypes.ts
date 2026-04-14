import type { ArchiveDomain, InsightCardId } from '@/interfaces/types.js'

export interface NPCDialogueChoice {
  readonly id: string
  readonly textKey: string
  readonly nextNodeId?: string
  readonly requiresInsight?: number
  readonly requiresTier?: number
  readonly requiresArchiveDomain?: { domain: ArchiveDomain; level: number }
  readonly requiresSealedInsight?: InsightCardId
  readonly requiresQuestFlag?: string
  readonly insightGain?: number
  readonly trustGain?: number
  readonly trustLoss?: number
  readonly moralWeight?: number
  readonly questTrigger?: string
  readonly worldFlagSet?: string
  readonly emitEvent?: string
}

export interface NPCDialogueNode {
  readonly speakerKey: string
  readonly choices: ReadonlyArray<NPCDialogueChoice>
}

export interface NPCFullData {
  readonly id: string
  readonly nameKey: string
  readonly titleKey: string
  readonly defaultLocation: string
  readonly defaultAttitude: string
  readonly schedule: Record<string, string>
  readonly tierThresholds: ReadonlyArray<number>
  readonly greetingNodes: ReadonlyArray<string>
  readonly nodes: Readonly<Record<string, NPCDialogueNode>>
}
