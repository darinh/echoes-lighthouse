import type { IGameState, IPlayerState, INPCState, NPCId, LocationId } from '@/interfaces/index.js'

const DEFAULT_RESONANCE = Object.fromEntries([
  'maren','vael','silas','petra','tobias','elara','corvin',
  'aldric','isolde','brynn','fenn','keeper_petra','keeper_tobias',
  'the_warden','mirror_keeper',
].map(id => [id, 0])) as Record<NPCId, number>

const DEFAULT_ARCHIVE_MASTERY = {
  history: 0, occult: 0, maritime: 0,
  ecology: 0, alchemy: 0, cartography: 0, linguistics: 0,
}

const NPC_START_LOCATIONS: Partial<Record<NPCId, LocationId>> = {
  maren:  'keepers_cottage',
  vael:   'cliffside',
  silas:  'harbor',
  petra:  'ruins',
  tobias: 'mill',
  elara:  'harbor',
}

const DEFAULT_NPC_STATES: Record<NPCId, INPCState> = Object.fromEntries(
  (Object.keys(DEFAULT_RESONANCE) as NPCId[]).map(id => [id, {
    id,
    resonance: 0,
    isAlive: true,
    dialogueTier: 0,
    revealedFacts: new Set<string>(),
    lastInteractionLoop: 0,
    attitude: 'neutral' as const,
    currentLocation: NPC_START_LOCATIONS[id] ?? null,
  }])
) as unknown as Record<NPCId, INPCState>

const DEFAULT_PLAYER: IPlayerState = {
  stamina: 100,
  lightReserves: 100,
  hearts: 3,
  insight: 0,
  insightBanked: 0,
  resonance: DEFAULT_RESONANCE,
  archiveMastery: DEFAULT_ARCHIVE_MASTERY,
  loopCount: 0,
  moralWeight: 0,
  discoveredLocations: new Set(['keepers_cottage']),
  sealedInsights: new Set(),
  activeJournalThreads: new Set(),
  currentLocation: 'keepers_cottage',
}

export function createInitialState(): IGameState {
  return {
    phase: 'title',
    dayTimeRemaining: 1,
    player: DEFAULT_PLAYER,
    npcStates: DEFAULT_NPC_STATES,
    activeDialogue: null,
    locale: 'en',
    isPaused: false,
  }
}
