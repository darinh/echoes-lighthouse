export interface RelationshipUnlock {
  npcId: string
  flag: string
  trustThreshold?: number
  resonanceThreshold?: number
  prerequisiteFlag?: string
  dialogueKey: string
}

export const RELATIONSHIP_UNLOCKS: RelationshipUnlock[] = [
  { npcId: 'keeper', flag: 'keeper_trusted', trustThreshold: 50, dialogueKey: 'npc.keeper.confide' },
  { npcId: 'keeper', flag: 'keeper_secret', trustThreshold: 75, prerequisiteFlag: 'keeper_trusted', dialogueKey: 'npc.keeper.secret' },
  { npcId: 'elder', flag: 'elder_confided', trustThreshold: 40, dialogueKey: 'npc.elder.memory' },
  { npcId: 'elder', flag: 'elder_revealed', trustThreshold: 70, prerequisiteFlag: 'elder_confided', dialogueKey: 'npc.elder.revelation' },
  { npcId: 'wanderer', flag: 'wanderer_opened', trustThreshold: 35, dialogueKey: 'npc.wanderer.past' },
  { npcId: 'archivist', flag: 'archivist_unlocked', resonanceThreshold: 30, dialogueKey: 'npc.archivist.hidden_lore' },
]
