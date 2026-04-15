import type { QuestDefinition } from './types.js'

export const QUEST_KEEPER_BETRAYAL: QuestDefinition = {
  id: 'keeper_betrayal',
  titleKey: 'quest.keeper_betrayal.title',
  descriptionKey: 'quest.keeper_betrayal.description',
  triggerType: 'examine',
  triggerValue: 'lighthouse_top.keepers_last_log',
  steps: [
    { id: 'talk_maren', descriptionKey: 'quest.keeper_betrayal.step.talk_maren', completedBy: { type: 'dialogue', value: 'maren' } },
    { id: 'examine_ledger', descriptionKey: 'quest.keeper_betrayal.step.examine_ledger', completedBy: { type: 'examine', value: 'archive_basement.sealed_ledger' } },
    { id: 'visit_mechanism', descriptionKey: 'quest.keeper_betrayal.step.visit_mechanism', completedBy: { type: 'location', value: 'mechanism_room' } },
  ],
  rewardInsight: 35,
  rewardFact: 'keeper_betrayal',
}
