import type { QuestDefinition } from './types.js'

export const QUEST_SILAS_LEDGER: QuestDefinition = {
  id: 'silas_ledger',
  titleKey: 'quest.silas_ledger.title',
  descriptionKey: 'quest.silas_ledger.description',
  triggerType: 'dialogue_tier',
  triggerValue: 'silas:2',
  steps: [
    {
      id: 'examine_harbormaster_records',
      descriptionKey: 'quest.silas_ledger.step.examine_harbormaster_records',
      completedBy: { type: 'world_flag', value: 'examined_harbormaster_records' },
    },
  ],
  rewardInsight: 10,
  rewardFact: 'silas_deeper_dialogue',
}
