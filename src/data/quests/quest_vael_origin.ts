import type { QuestDefinition } from './types.js'

export const QUEST_VAEL_ORIGIN: QuestDefinition = {
  id: 'vael_origin',
  titleKey: 'quest.vael_origin.title',
  descriptionKey: 'quest.vael_origin.description',
  // Legacy fields kept for type compatibility — triggerConditions takes precedence.
  triggerType: 'dialogue',
  triggerValue: 'vael',
  // Vael's origin quest opens only once the player has encountered the
  // bioluminescent symbols in the tidal caves (evidence of his binding)
  // AND has built resonance with him (≥ 1) — he won't speak of it to a stranger.
  triggerConditions: [
    { type: 'world_flag',    value: 'examined.tidal_caves.bioluminescent_symbols' },
    { type: 'npc_resonance', value: 'vael', min: 1 },
  ],
  steps: [
    { id: 'examine_symbols', descriptionKey: 'quest.vael_origin.step.examine_symbols', completedBy: { type: 'examine', value: 'tidal_caves.bioluminescent_symbols' } },
    { id: 'examine_binding', descriptionKey: 'quest.vael_origin.step.examine_binding', completedBy: { type: 'examine', value: 'mechanism_room.binding_rune' } },
    { id: 'talk_vael_again', descriptionKey: 'quest.vael_origin.step.talk_vael_again', completedBy: { type: 'dialogue', value: 'vael' } },
  ],
  rewardInsight: 30,
  rewardFact: 'vael_origin',
}
