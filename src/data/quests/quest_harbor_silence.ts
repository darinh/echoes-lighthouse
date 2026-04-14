import type { QuestDefinition } from './types.js'

export const QUEST_HARBOR_SILENCE: QuestDefinition = {
  id: 'harbor_silence',
  titleKey: 'quest.harbor_silence.title',
  descriptionKey: 'quest.harbor_silence.description',
  triggerType: 'dialogue_tier',
  triggerValue: 'silas:1',
  steps: [
    {
      id: 'examine_harbor',
      descriptionKey: 'quest.harbor_silence.step.examine_harbor',
      completedBy: { type: 'examine', value: 'harbor_boats' },
    },
    {
      id: 'talk_to_elara',
      descriptionKey: 'quest.harbor_silence.step.talk_to_elara',
      completedBy: { type: 'dialogue', value: 'elara' },
    },
    {
      id: 'confront_silas',
      descriptionKey: 'quest.harbor_silence.step.confront_silas',
      completedBy: { type: 'dialogue', value: 'silas' },
    },
  ],
  rewardInsight: 30,
  rewardFact: 'silas_harbor_secret',
}
