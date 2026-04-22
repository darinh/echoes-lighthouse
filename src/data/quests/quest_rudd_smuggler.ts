import type { QuestDefinition } from './types.js'

export const QUEST_RUDD_SMUGGLER: QuestDefinition = {
  id: 'rudd_smuggler',
  titleKey: 'quest.rudd_smuggler.title',
  descriptionKey: 'quest.rudd_smuggler.description',
  triggerType: 'dialogue_tier',
  triggerValue: 'rudd:3',
  steps: [
    {
      id: 'deliver_package',
      descriptionKey: 'quest.rudd_smuggler.step.deliver_package',
      completedBy: { type: 'world_flag', value: 'rudd_package_delivered' },
    },
  ],
  rewardInsight: 20,
  rewardFact: 'rudd_package_delivered',
}
