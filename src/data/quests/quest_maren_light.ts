import type { QuestDefinition } from './types.js'

export const QUEST_MAREN_LIGHT: QuestDefinition = {
  id: 'maren_light',
  titleKey: 'quest.maren_light.title',
  descriptionKey: 'quest.maren_light.description',
  triggerType: 'world_flag',
  triggerValue: 'light_source_truth',
  steps: [
    {
      id: 'examine_old_journal',
      descriptionKey: 'quest.maren_light.step.examine_old_journal',
      completedBy: { type: 'world_flag', value: 'examined_old_journal' },
    },
  ],
  rewardInsight: 15,
  rewardFact: 'maren_light_truth',
}
