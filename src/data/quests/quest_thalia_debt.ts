import type { QuestDefinition } from './types.js'

export const QUEST_THALIA_DEBT: QuestDefinition = {
  id: 'thalia_debt',
  titleKey: 'quest.thalia_debt.title',
  descriptionKey: 'quest.thalia_debt.description',
  triggerType: 'dialogue',
  triggerValue: 'thalia',
  steps: [
    {
      id: 'deliver_shadow_root',
      descriptionKey: 'quest.thalia_debt.step.deliver_shadow_root',
      completedBy: { type: 'world_flag', value: 'shadow_root_delivered' },
    },
  ],
  rewardInsight: 15,
  rewardFact: 'thalia_debt_paid',
}
