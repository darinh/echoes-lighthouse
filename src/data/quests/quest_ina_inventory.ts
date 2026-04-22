import type { QuestDefinition } from './types.js'

export const QUEST_INA_INVENTORY: QuestDefinition = {
  id: 'ina_inventory',
  titleKey: 'quest.ina_inventory.title',
  descriptionKey: 'quest.ina_inventory.description',
  triggerType: 'dialogue_tier',
  triggerValue: 'ina:2',
  steps: [
    {
      id: 'examine_ina_storage',
      descriptionKey: 'quest.ina_inventory.step.examine_ina_storage',
      completedBy: { type: 'world_flag', value: 'examined_ina_storage' },
    },
  ],
  rewardInsight: 10,
}
