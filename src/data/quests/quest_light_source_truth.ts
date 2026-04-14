import type { QuestDefinition } from './types.js'

export const QUEST_LIGHT_SOURCE_TRUTH: QuestDefinition = {
  id: 'light_source_truth',
  titleKey: 'quest.light_source_truth.title',
  descriptionKey: 'quest.light_source_truth.description',
  triggerType: 'location_visit',
  triggerValue: 'lighthouse_top',
  steps: [
    {
      id: 'visit_cliffside',
      descriptionKey: 'quest.light_source_truth.step.visit_cliffside',
      completedBy: { type: 'location', value: 'cliffside' },
    },
    {
      id: 'talk_to_vael',
      descriptionKey: 'quest.light_source_truth.step.talk_to_vael',
      completedBy: { type: 'dialogue', value: 'vael' },
    },
    {
      id: 'examine_tidal_caves',
      descriptionKey: 'quest.light_source_truth.step.examine_tidal_caves',
      completedBy: { type: 'location', value: 'tidal_caves' },
    },
  ],
  rewardInsight: 25,
  rewardFact: 'vael_origin',
}
