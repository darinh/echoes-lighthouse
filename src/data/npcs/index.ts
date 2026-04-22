// Lazy-loaded NPC data chunk. Import dynamically to keep initial bundle small.
// Full NPC definitions (dialogue tiers, schedules, quest hooks) live in individual files.
import type { NPCData } from '@/entities/index.js'
import { MAREN_NPC } from './maren.js'
import { VAEL_NPC } from './vael.js'
import { SILAS_NPC } from './silas.js'
import { PETRA_NPC } from './petra.js'
import { TOBIAS_NPC } from './tobias.js'
import { ELARA_NPC } from './elara.js'
import { DOV_NPC } from './dov.js'
import { THALIA_NPC } from './thalia.js'
import { RUDD_NPC } from './rudd.js'
import { INA_NPC } from './ina.js'
import { BRAM_NPC } from './bram.js'
import { YSEL_NPC } from './ysel.js'
import { OREN_NPC } from './oren.js'
import { CAL_NPC } from './cal.js'
import { SERA_NPC } from './sera.js'
import { ISOLDE_NPC } from './isolde.js'
import { BRYNN_NPC } from './brynn.js'
import { CORVIN_NPC } from './corvin.js'
import { ALDRIC_NPC } from './aldric.js'
import { FENN_NPC } from './fenn.js'
import { KEEPER_PETRA_NPC } from './keeper_petra.js'
import { KEEPER_TOBIAS_NPC } from './keeper_tobias.js'
import { THE_WARDEN_NPC } from './the_warden.js'
import { MIRROR_KEEPER_NPC } from './mirror_keeper.js'
import { THE_KEEPER_NPC } from './the_keeper.js'

export async function loadNPCData(): Promise<Record<string, NPCData>> {
  return {
    maren:  MAREN_NPC  as unknown as NPCData,
    vael:   VAEL_NPC   as unknown as NPCData,
    silas:  SILAS_NPC  as unknown as NPCData,
    petra:  PETRA_NPC  as unknown as NPCData,
    tobias: TOBIAS_NPC as unknown as NPCData,
    elara:  ELARA_NPC  as unknown as NPCData,
dov:    DOV_NPC    as unknown as NPCData,
    thalia: THALIA_NPC as unknown as NPCData,
    rudd:   RUDD_NPC   as unknown as NPCData,
    ina:    INA_NPC    as unknown as NPCData,
    bram:   BRAM_NPC   as unknown as NPCData,
    ysel:   YSEL_NPC   as unknown as NPCData,
oren:   OREN_NPC   as unknown as NPCData,
cal:    CAL_NPC    as unknown as NPCData,
sera:   SERA_NPC   as unknown as NPCData,
    isolde: ISOLDE_NPC as unknown as NPCData,
    brynn:  BRYNN_NPC  as unknown as NPCData,
    corvin:        CORVIN_NPC        as unknown as NPCData,
    aldric:        ALDRIC_NPC        as unknown as NPCData,
    fenn:          FENN_NPC          as unknown as NPCData,
    keeper_petra:  KEEPER_PETRA_NPC  as unknown as NPCData,
    keeper_tobias: KEEPER_TOBIAS_NPC as unknown as NPCData,
    the_warden:    THE_WARDEN_NPC    as unknown as NPCData,
    mirror_keeper: MIRROR_KEEPER_NPC as unknown as NPCData,
    the_keeper:    THE_KEEPER_NPC    as unknown as NPCData,
  }
}
