// Lazy-loaded quest data chunk.
import type { QuestDefinition } from './types.js'
import { QUEST_LIGHT_SOURCE_TRUTH } from './quest_light_source_truth.js'
import { QUEST_ARCHIVIST_BARGAIN } from './quest_archivist_bargain.js'
import { QUEST_HARBOR_SILENCE } from './quest_harbor_silence.js'

/** Synchronous registry for use in renderers and other non-async contexts. */
export const QUEST_REGISTRY: Record<string, QuestDefinition> = {
  light_source_truth: QUEST_LIGHT_SOURCE_TRUTH,
  archivist_bargain:  QUEST_ARCHIVIST_BARGAIN,
  harbor_silence:     QUEST_HARBOR_SILENCE,
}

export async function loadQuestData(): Promise<Record<string, QuestDefinition>> {
  return QUEST_REGISTRY
}

export type { QuestDefinition, QuestStep } from './types.js'
