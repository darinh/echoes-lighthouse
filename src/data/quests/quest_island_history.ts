import type { QuestDefinition } from './types.js'

export const QUEST_ISLAND_HISTORY: QuestDefinition = {
  id: 'island_history',
  titleKey: 'quest.island_history.title',
  descriptionKey: 'quest.island_history.description',
  triggerType: 'location_visit',
  triggerValue: 'archive_basement',
  steps: [
    { id: 'examine_portrait', descriptionKey: 'quest.island_history.step.examine_portrait', completedBy: { type: 'examine', value: 'ruins.burned_portrait' } },
    { id: 'examine_hidden_names', descriptionKey: 'quest.island_history.step.examine_hidden_names', completedBy: { type: 'examine', value: 'chapel.hidden_names' } },
    { id: 'talk_maren', descriptionKey: 'quest.island_history.step.talk_maren', completedBy: { type: 'dialogue', value: 'maren' } },
  ],
  rewardInsight: 25,
  rewardFact: 'island_history',
}
