// Lazy-loaded NPC data chunk. Import dynamically to keep initial bundle small.
// Full NPC definitions (dialogue tiers, schedules, quest hooks) live in individual files.
import type { NPCData } from '@/entities/index.js'
import { MAREN_NPC } from './maren.js'
import { VAEL_NPC } from './vael.js'
import { SILAS_NPC } from './silas.js'
import { PETRA_NPC } from './petra.js'
import { TOBIAS_NPC } from './tobias.js'
import { ELARA_NPC } from './elara.js'

export async function loadNPCData(): Promise<Record<string, NPCData>> {
  return {
    maren:  MAREN_NPC  as unknown as NPCData,
    vael:   VAEL_NPC   as unknown as NPCData,
    silas:  SILAS_NPC  as unknown as NPCData,
    petra:  PETRA_NPC  as unknown as NPCData,
    tobias: TOBIAS_NPC as unknown as NPCData,
    elara:  ELARA_NPC  as unknown as NPCData,
  }
}
