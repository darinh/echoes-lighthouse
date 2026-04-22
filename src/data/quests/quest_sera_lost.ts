import type { QuestDefinition } from './types.js'

export const QUEST_SERA_LOST: QuestDefinition = {
  id: 'sera_lost',
  titleKey: 'quest.sera_lost.title',
  descriptionKey: 'quest.sera_lost.description',
  triggerType: 'location_visit',
  triggerValue: 'forest_path',
  steps: [
    {
      id: 'guide_sera_home',
      descriptionKey: 'quest.sera_lost.step.guide_sera_home',
      completedBy: { type: 'world_flag', value: 'sera_guided_home' },
    },
  ],
  rewardInsight: 10,
  rewardFact: 'sera_guided_home',
}
