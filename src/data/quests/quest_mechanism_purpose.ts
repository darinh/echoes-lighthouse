import type { QuestDefinition } from './types.js'

export const QUEST_MECHANISM_PURPOSE: QuestDefinition = {
  id: 'mechanism_purpose',
  titleKey: 'quest.mechanism_purpose.title',
  descriptionKey: 'quest.mechanism_purpose.description',
  triggerType: 'world_flag',
  triggerValue: 'examined_mechanism_symbols',
  steps: [
    {
      id: 'examine_symbols',
      descriptionKey: 'quest.mechanism_purpose.step.examine_symbols',
      completedBy: { type: 'world_flag', value: 'examined_mechanism_symbols' },
    },
    {
      id: 'examine_signal_panel',
      descriptionKey: 'quest.mechanism_purpose.step.examine_signal_panel',
      completedBy: { type: 'examine', value: 'mechanism_room.signal_alignment_panel' },
    },
    {
      id: 'read_alignment_notes',
      descriptionKey: 'quest.mechanism_purpose.step.read_alignment_notes',
      completedBy: { type: 'examine', value: 'mechanism_room.old_journal' },
    },
    {
      id: 'seal_mechanism_insight',
      descriptionKey: 'quest.mechanism_purpose.step.seal_mechanism_insight',
      completedBy: { type: 'fact', value: 'mechanism_purpose' },
    },
  ],
  rewardInsight: 40,
  rewardFact: 'mechanism_purpose',
}
