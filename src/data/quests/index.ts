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
// NPC side quests
import { QUEST_MAREN_LIGHT } from './quest_maren_light.js'
import { QUEST_SILAS_LEDGER } from './quest_silas_ledger.js'
import { QUEST_PETRA_BURDEN } from './quest_petra_burden.js'
import { QUEST_DOV_CONFESSION } from './quest_dov_confession.js'
import { QUEST_THALIA_DEBT } from './quest_thalia_debt.js'
import { QUEST_RUDD_SMUGGLER } from './quest_rudd_smuggler.js'
import { QUEST_SERA_LOST } from './quest_sera_lost.js'
import { QUEST_OREN_PENANCE } from './quest_oren_penance.js'
import { QUEST_CAL_SILENCE } from './quest_cal_silence.js'
import { QUEST_INA_INVENTORY } from './quest_ina_inventory.js'
import { QUEST_BRAM_COMMISSION } from './quest_bram_commission.js'
import { QUEST_MECHANISM_PURPOSE } from './quest_mechanism_purpose.js'

/** Synchronous registry for use in renderers and other non-async contexts. */
export const QUEST_REGISTRY: Record<string, QuestDefinition> = {
  // Main quest chain
  light_source_truth: QUEST_LIGHT_SOURCE_TRUTH,
  archivist_bargain:  QUEST_ARCHIVIST_BARGAIN,
  harbor_silence:     QUEST_HARBOR_SILENCE,
  vael_origin:        QUEST_VAEL_ORIGIN,
  keeper_betrayal:    QUEST_KEEPER_BETRAYAL,
  spirit_binding:     QUEST_SPIRIT_BINDING,
  island_history:     QUEST_ISLAND_HISTORY,
  final_signal:       QUEST_FINAL_SIGNAL,
  // NPC side quests
  maren_light:        QUEST_MAREN_LIGHT,
  silas_ledger:       QUEST_SILAS_LEDGER,
  petra_burden:       QUEST_PETRA_BURDEN,
  dov_confession:     QUEST_DOV_CONFESSION,
  thalia_debt:        QUEST_THALIA_DEBT,
  rudd_smuggler:      QUEST_RUDD_SMUGGLER,
  sera_lost:          QUEST_SERA_LOST,
  oren_penance:       QUEST_OREN_PENANCE,
  cal_silence:        QUEST_CAL_SILENCE,
  ina_inventory:      QUEST_INA_INVENTORY,
  bram_commission:    QUEST_BRAM_COMMISSION,
  // Key insight quests
  mechanism_purpose:  QUEST_MECHANISM_PURPOSE,
}

export async function loadQuestData(): Promise<Record<string, QuestDefinition>> {
  return QUEST_REGISTRY
}

export type { QuestDefinition, QuestStep } from './types.js'
