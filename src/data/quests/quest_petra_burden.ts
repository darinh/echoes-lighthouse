import type { QuestDefinition } from './types.js'

export const QUEST_PETRA_BURDEN: QuestDefinition = {
  id: 'petra_burden',
  titleKey: 'quest.petra_burden.title',
  descriptionKey: 'quest.petra_burden.description',
  triggerType: 'dialogue_tier',
  triggerValue: 'keeper_petra:3',
  steps: [
    {
      id: 'altruism_demonstrated_1',
      descriptionKey: 'quest.petra_burden.step.altruism_demonstrated_1',
      completedBy: { type: 'world_flag', value: 'altruism_demonstrated_1' },
    },
    {
      id: 'altruism_demonstrated_2',
      descriptionKey: 'quest.petra_burden.step.altruism_demonstrated_2',
      completedBy: { type: 'world_flag', value: 'altruism_demonstrated_2' },
    },
  ],
  rewardInsight: 20,
}
