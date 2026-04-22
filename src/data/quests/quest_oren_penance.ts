import type { QuestDefinition } from './types.js'

export const QUEST_OREN_PENANCE: QuestDefinition = {
  id: 'oren_penance',
  titleKey: 'quest.oren_penance.title',
  descriptionKey: 'quest.oren_penance.description',
  triggerType: 'dialogue_tier',
  triggerValue: 'oren:4',
  steps: [
    {
      id: 'examine_chapel_altar',
      descriptionKey: 'quest.oren_penance.step.examine_chapel_altar',
      completedBy: { type: 'world_flag', value: 'oren_penance_complete' },
    },
  ],
  rewardInsight: 15,
  rewardFact: 'oren_penance_complete',
}
