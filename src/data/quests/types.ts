export interface QuestStep {
  id: string
  descriptionKey: string
  completedBy: { type: 'fact' | 'dialogue' | 'location' | 'examine'; value: string }
}

export interface QuestDefinition {
  id: string
  titleKey: string
  descriptionKey: string
  triggerType: 'location_visit' | 'dialogue_tier' | 'automatic'
  triggerValue: string
  steps: QuestStep[]
  rewardInsight: number
  rewardFact?: string
}
