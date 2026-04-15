import type { QuestDefinition } from './types.js'

export const QUEST_SPIRIT_BINDING: QuestDefinition = {
  id: 'spirit_binding',
  titleKey: 'quest.spirit_binding.title',
  descriptionKey: 'quest.spirit_binding.description',
  triggerType: 'examine',
  triggerValue: 'mechanism_room.mechanism_symbols',
  steps: [
    { id: 'examine_binding_rune', descriptionKey: 'quest.spirit_binding.step.examine_binding_rune', completedBy: { type: 'examine', value: 'mechanism_room.binding_rune' } },
    { id: 'examine_hidden_names', descriptionKey: 'quest.spirit_binding.step.examine_hidden_names', completedBy: { type: 'examine', value: 'chapel.hidden_names' } },
    { id: 'talk_elara', descriptionKey: 'quest.spirit_binding.step.talk_elara', completedBy: { type: 'dialogue', value: 'elara' } },
  ],
  rewardInsight: 40,
  rewardFact: 'spirit_binding',
}
