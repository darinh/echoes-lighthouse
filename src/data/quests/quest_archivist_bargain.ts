import type { QuestDefinition } from './types.js'

export const QUEST_ARCHIVIST_BARGAIN: QuestDefinition = {
  id: 'archivist_bargain',
  titleKey: 'quest.archivist_bargain.title',
  descriptionKey: 'quest.archivist_bargain.description',
  triggerType: 'dialogue_tier',
  triggerValue: 'maren:2',
  steps: [
    {
      id: 'find_archive_page',
      descriptionKey: 'quest.archivist_bargain.step.find_archive_page',
      completedBy: { type: 'location', value: 'archive_basement' },
    },
    {
      id: 'return_to_maren',
      descriptionKey: 'quest.archivist_bargain.step.return_to_maren',
      completedBy: { type: 'dialogue', value: 'maren' },
    },
  ],
  rewardInsight: 20,
  rewardFact: 'maren_loop_count',
}
