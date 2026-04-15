import type { QuestDefinition } from './types.js'

export const QUEST_VAEL_ORIGIN: QuestDefinition = {
  id: 'vael_origin',
  titleKey: 'quest.vael_origin.title',
  descriptionKey: 'quest.vael_origin.description',
  triggerType: 'dialogue',
  triggerValue: 'vael',
  steps: [
    { id: 'examine_symbols', descriptionKey: 'quest.vael_origin.step.examine_symbols', completedBy: { type: 'examine', value: 'tidal_caves.bioluminescent_symbols' } },
    { id: 'examine_binding', descriptionKey: 'quest.vael_origin.step.examine_binding', completedBy: { type: 'examine', value: 'mechanism_room.binding_rune' } },
    { id: 'talk_vael_again', descriptionKey: 'quest.vael_origin.step.talk_vael_again', completedBy: { type: 'dialogue', value: 'vael' } },
  ],
  rewardInsight: 30,
  rewardFact: 'vael_origin',
}
