// Lazy-loaded quest data chunk.
import type { QuestDefinition } from './types.js'
import { QUEST_LIGHT_SOURCE_TRUTH } from './quest_light_source_truth.js'
import { QUEST_ARCHIVIST_BARGAIN } from './quest_archivist_bargain.js'
import { QUEST_HARBOR_SILENCE } from './quest_harbor_silence.js'

export async function loadQuestData(): Promise<Record<string, QuestDefinition>> {
  return {
    light_source_truth: QUEST_LIGHT_SOURCE_TRUTH,
    archivist_bargain:  QUEST_ARCHIVIST_BARGAIN,
    harbor_silence:     QUEST_HARBOR_SILENCE,
  }
}

export type { QuestDefinition, QuestStep } from './types.js'
