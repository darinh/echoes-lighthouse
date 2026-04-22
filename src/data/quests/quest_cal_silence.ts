import type { QuestDefinition } from './types.js'

export const QUEST_CAL_SILENCE: QuestDefinition = {
  id: 'cal_silence',
  titleKey: 'quest.cal_silence.title',
  descriptionKey: 'quest.cal_silence.description',
  triggerType: 'world_flag',
  triggerValue: 'keeper_betrayal',
  steps: [
    {
      id: 'talk_to_cal_1',
      descriptionKey: 'quest.cal_silence.step.talk_to_cal_1',
      completedBy: { type: 'dialogue', value: 'cal' },
    },
    {
      id: 'talk_to_cal_2',
      descriptionKey: 'quest.cal_silence.step.talk_to_cal_2',
      completedBy: { type: 'world_flag', value: 'cal_truth_revealed' },
    },
  ],
  rewardInsight: 20,
  rewardFact: 'cal_truth_revealed',
}
