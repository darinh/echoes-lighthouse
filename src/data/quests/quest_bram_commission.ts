import type { QuestDefinition } from './types.js'

export const QUEST_BRAM_COMMISSION: QuestDefinition = {
  id: 'bram_commission',
  titleKey: 'quest.bram_commission.title',
  descriptionKey: 'quest.bram_commission.description',
  triggerType: 'dialogue_tier',
  triggerValue: 'bram:3',
  steps: [
    {
      id: 'complete_bram_commission',
      descriptionKey: 'quest.bram_commission.step.complete_bram_commission',
      completedBy: { type: 'world_flag', value: 'bram_commission_complete' },
    },
  ],
  rewardInsight: 15,
  rewardFact: 'bram_commission_complete',
}
