import type { QuestDefinition } from './types.js'

export const QUEST_MAREN_LIGHT: QuestDefinition = {
  id: 'maren_light',
  titleKey: 'quest.maren_light.title',
  descriptionKey: 'quest.maren_light.description',
  // Legacy fields kept for type compatibility — triggerConditions takes precedence.
  triggerType: 'world_flag',
  triggerValue: 'light_source_truth',
  // Maren will only confide the truth about the light once the player has
  // uncovered the light_source_truth AND has earned her trust (≥ 3).
  triggerConditions: [
    { type: 'world_flag', value: 'light_source_truth' },
    { type: 'npc_trust',  value: 'maren', min: 3 },
  ],
  steps: [
    {
      id: 'examine_old_journal',
      descriptionKey: 'quest.maren_light.step.examine_old_journal',
      completedBy: { type: 'world_flag', value: 'examined_old_journal' },
    },
  ],
  rewardInsight: 15,
  rewardFact: 'maren_light_truth',
}
