import type { QuestDefinition } from './types.js'

export const QUEST_FINAL_SIGNAL: QuestDefinition = {
  id: 'final_signal',
  titleKey: 'quest.final_signal.title',
  descriptionKey: 'quest.final_signal.description',
  triggerType: 'world_flag',
  triggerValue: 'all_six_insights_sealed',
  steps: [
    { id: 'light_lighthouse', descriptionKey: 'quest.final_signal.step.light_lighthouse', completedBy: { type: 'world_flag', value: 'lighthouse_lit_this_loop' } },
    { id: 'visit_top_night', descriptionKey: 'quest.final_signal.step.visit_top_night', completedBy: { type: 'location', value: 'lighthouse_top' } },
    { id: 'talk_vael_tier3', descriptionKey: 'quest.final_signal.step.talk_vael_tier3', completedBy: { type: 'dialogue', value: 'vael' } },
  ],
  rewardInsight: 50,
  rewardFact: 'final_signal',
}
