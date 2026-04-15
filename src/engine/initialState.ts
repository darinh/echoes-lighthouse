import type { IGameState, IPlayerState, INPCState, NPCId, LocationId, EndingId, AchievementId } from '@/interfaces/index.js'

const NPC_IDS: NPCId[] = [
  'maren','vael','silas','petra','tobias','elara','corvin',
  'aldric','isolde','brynn','fenn','keeper_petra','keeper_tobias',
  'the_warden','mirror_keeper',
]

const DEFAULT_RESONANCE = Object.fromEntries(
  NPC_IDS.map(id => [id, 0])
) as Record<NPCId, number>

const DEFAULT_TRUST = Object.fromEntries(
  NPC_IDS.map(id => [id, 0])
) as Record<NPCId, number>

const DEFAULT_ARCHIVE_MASTERY = {
  history: 0, occult: 0, maritime: 0,
  ecology: 0, alchemy: 0, cartography: 0, linguistics: 0,
}

const NPC_START_LOCATIONS: Partial<Record<NPCId, LocationId>> = {
  maren:  'archive_basement',
  vael:   'cliffside',
  silas:  'harbor',
  petra:  'village_square',
  tobias: 'mill',
  elara:  'harbor',
}

const DEFAULT_NPC_STATES: Record<NPCId, INPCState> = Object.fromEntries(
  NPC_IDS.map(id => [id, {
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
  stamina: 10,
  lightReserves: 100,
  hearts: 3,
  insight: 0,
  insightBanked: 0,
  resonance: DEFAULT_RESONANCE,
  trust: DEFAULT_TRUST,
  archiveMastery: DEFAULT_ARCHIVE_MASTERY,
  loopCount: 0,
  moralWeight: 0,
  discoveredLocations: new Set(['keepers_cottage']),
  sealedInsights: new Set(),
  activeJournalThreads: new Set(),
  journalEntries: [],
  currentLocation: 'keepers_cottage',
}

export function createInitialState(): IGameState {
  return {
    phase: 'title',
    dayTimeRemaining: 1,
    player: DEFAULT_PLAYER,
    npcStates: DEFAULT_NPC_STATES,
    activeDialogue: null,
    activeQuests: new Set(),
    completedQuests: new Set(),
    questStepProgress: {},
    locale: 'en',
    isPaused: false,
    activePanel: 'none',
    worldFlags: new Set<string>(),
    saveVersion: 1,
    endingId: null,
    lastExaminedKey: null,
    nightDangerLevel: 0,
    pendingVisions: [],
    priorPhase: null,
    lighthouseLitThisLoop: false,
    deathCause: null,
    inventory: new Set<import('../interfaces/types.js').ItemId>(),
    endingsSeen: new Set<EndingId>(),
    audioMuted: false,
    achievements: new Set<AchievementId>(),
    pendingAchievement: null,
    pendingMilestoneMessage: null,
    weather: 'clear',
    settings: {
      masterVolume: 0.8,
      ambientVolume: 0.8,
      uiVolume: 0.8,
      narrativeVolume: 0.8,
      locale: 'en',
    },
  }
}
