import type { QuestDefinition } from './types.js'

export const QUEST_DOV_CONFESSION: QuestDefinition = {
  id: 'dov_confession',
  titleKey: 'quest.dov_confession.title',
  descriptionKey: 'quest.dov_confession.description',
  triggerType: 'world_flag',
  triggerValue: 'light_source_truth',
  steps: [
    {
      id: 'talk_to_dov',
      descriptionKey: 'quest.dov_confession.step.talk_to_dov',
      completedBy: { type: 'world_flag', value: 'dov_confession_heard' },
    },
  ],
  rewardInsight: 10,
  rewardFact: 'dov_confession_heard',
}
