// Lazy-loaded quest data chunk.
import type { QuestDefinition } from './types.js'
import { QUEST_LIGHT_SOURCE_TRUTH } from './quest_light_source_truth.js'
import { QUEST_ARCHIVIST_BARGAIN } from './quest_archivist_bargain.js'
import { QUEST_HARBOR_SILENCE } from './quest_harbor_silence.js'
import { QUEST_VAEL_ORIGIN } from './quest_vael_origin.js'
import { QUEST_KEEPER_BETRAYAL } from './quest_keeper_betrayal.js'
import { QUEST_SPIRIT_BINDING } from './quest_spirit_binding.js'
import { QUEST_ISLAND_HISTORY } from './quest_island_history.js'
import { QUEST_FINAL_SIGNAL } from './quest_final_signal.js'

/** Synchronous registry for use in renderers and other non-async contexts. */
export const QUEST_REGISTRY: Record<string, QuestDefinition> = {
  light_source_truth: QUEST_LIGHT_SOURCE_TRUTH,
  archivist_bargain:  QUEST_ARCHIVIST_BARGAIN,
  harbor_silence:     QUEST_HARBOR_SILENCE,
  vael_origin:        QUEST_VAEL_ORIGIN,
  keeper_betrayal:    QUEST_KEEPER_BETRAYAL,
  spirit_binding:     QUEST_SPIRIT_BINDING,
  island_history:     QUEST_ISLAND_HISTORY,
  final_signal:       QUEST_FINAL_SIGNAL,
}

export async function loadQuestData(): Promise<Record<string, QuestDefinition>> {
  return QUEST_REGISTRY
}

export type { QuestDefinition, QuestStep } from './types.js'
