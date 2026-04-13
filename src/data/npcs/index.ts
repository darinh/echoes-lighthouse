// Lazy-loaded NPC data chunk. Import dynamically to keep initial bundle small.
// Full NPC definitions (dialogue tiers, schedules, quest hooks) live in individual files.
import type { NPCData } from '@/entities/index.js'

export async function loadNPCData(): Promise<Record<string, NPCData>> {
  // TODO: import each NPC definition file as data grows
  return {}
}
