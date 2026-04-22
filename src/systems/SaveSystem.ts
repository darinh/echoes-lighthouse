import type { WeatherType } from '@/interfaces/IGameState.js'
import type { ISystem, IGameState, IGameEvent, IEventBus } from '@/interfaces/index.js'

const STORAGE_KEY = 'echoes-lighthouse-save'
const MAX_SAVE_SIZE = 100 * 1024 // 100 KB
const CURRENT_SAVE_VERSION = 1

/** Serialisable snapshot — Sets converted to arrays, activeDialogue stripped. */
interface SaveSnapshot {
  saveVersion: number
  phase: IGameState['phase']
  difficulty: IGameState['difficulty']
  dayTimeRemaining: number
  locale: string
  isPaused: boolean
  deathCause: string | null
  worldFlags: string[]
  activeQuests: string[]
  completedQuests: string[]
  questStepProgress: Record<string, string[]>
  inventory: string[]
  endingsSeen: string[]
  audioMuted: boolean
  achievements: string[]
  weather: WeatherType
  puzzleState: {
    signalDials: number[]
    signalSolved: boolean
  }
  pendingVisions: string[]
  priorPhase: IGameState['phase'] | null
  consecutiveDarkNights: number
  player: {
    stamina: number
    lightReserves: number
    hearts: number
    insight: number
    insightBanked: number
    resonance: Record<string, number>
    trust: Record<string, number>
    archiveMastery: Record<string, number>
    loopCount: number
    moralWeight: number
    examineHistory: Record<string, number>
    relationshipFlags: Record<string, boolean>
    shownRelationshipDialogue: string[]
    searchedLocations: string[]
    discoveredLocations: string[]
    sealedInsights: string[]
    activeJournalThreads: string[]
    journalEntries: Array<{
      id: string
      timestamp: number
      locationId: string
      textKey: string
      source: 'explore' | 'examine'
    }>
    currentLocation: string
  }
  npcStates: Record<string, {
    id: string
    resonance: number
    isAlive: boolean
    dialogueTier: number
    revealedFacts: string[]
    lastInteractionLoop: number
    attitude: string
    currentLocation: string | null
  }>
}

/**
 * SaveSystem — Auto-saves to localStorage on key events.
 * Sets are serialised as arrays; activeDialogue is ephemeral and excluded.
 */
export class SaveSystem implements ISystem {
  readonly name = 'SaveSystem'

  // Events that trigger an auto-save.
  private static readonly SAVE_TRIGGERS = new Set<IGameEvent['type']>([
    'location.entered',
    'dialogue.completed' as IGameEvent['type'],
    'loop.reset',
    'lighthouse.lit',
    'examine.completed' as IGameEvent['type'],
    'insight.banked' as IGameEvent['type'],
  ])

  constructor(_eventBus: IEventBus) {}

  init(state: IGameState): IGameState { return state }
  update(state: IGameState, _deltaMs: number): IGameState { return state }

  onEvent(event: IGameEvent, state: IGameState): IGameState {
    if (SaveSystem.SAVE_TRIGGERS.has(event.type)) {
      SaveSystem.saveState(state)
    }
    // insight.gained only triggers a save when the insight is sealed.
    if (event.type === 'insight.card.sealed') {
      SaveSystem.saveState(state)
    }
    return state
  }

  // ─── Static helpers (usable without a system instance) ───────────────────

  static saveState(state: IGameState): boolean {
    try {
      const snapshot = SaveSystem.serialise(state)
      const json = JSON.stringify(snapshot)
      if (json.length > MAX_SAVE_SIZE) {
        console.warn('[SaveSystem] Save data exceeds 100 KB limit — not saving.')
        return false
      }
      localStorage.setItem(STORAGE_KEY, json)
      return true
    } catch {
      return false
    }
  }

  static loadState(): IGameState | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      const snapshot = JSON.parse(raw) as SaveSnapshot
      if (!snapshot) return null
      // Completely corrupt or very old save — discard.
      if (!snapshot.saveVersion || snapshot.saveVersion === 0) return null
      // Version mismatch but still parseable — attempt migration with a warning.
      if (snapshot.saveVersion !== CURRENT_SAVE_VERSION) {
        console.warn(`[SaveSystem] Save version ${snapshot.saveVersion} differs from current ${CURRENT_SAVE_VERSION} — attempting migration.`)
      }
      return SaveSystem.deserialise(snapshot)
    } catch {
      return null
    }
  }

  static hasSave(): boolean {
    try { return localStorage.getItem(STORAGE_KEY) !== null } catch { return false }
  }

  static clearSave(): void {
    localStorage.removeItem(STORAGE_KEY)
  }

  /** Load only the endingsSeen set from the save (used on title screen). */
  static loadEndingsSeen(): ReadonlySet<string> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return new Set()
      const snapshot = JSON.parse(raw) as Partial<SaveSnapshot>
      return new Set(snapshot.endingsSeen ?? [])
    } catch {
      return new Set()
    }
  }

  // ─── Serialisation ────────────────────────────────────────────────────────

  private static serialise(state: IGameState): SaveSnapshot {
    return {
      saveVersion: state.saveVersion,
      phase: state.phase,
      difficulty: state.difficulty,
      dayTimeRemaining: state.dayTimeRemaining,
      locale: state.locale,
      isPaused: state.isPaused,
      deathCause: state.deathCause,
      worldFlags: [...state.worldFlags],
      activeQuests: [...state.activeQuests],
      completedQuests: [...state.completedQuests],
      questStepProgress: Object.fromEntries(
        Object.entries(state.questStepProgress).map(([k, v]) => [k, [...v]])
      ),
      inventory: [...state.inventory],
      endingsSeen: [...state.endingsSeen],
      audioMuted: state.audioMuted,
      achievements: [...state.achievements],
      weather: state.weather,
      puzzleState: {
        signalDials: [...state.puzzleState.signalDials],
        signalSolved: state.puzzleState.signalSolved,
      },
      pendingVisions: [...state.pendingVisions],
      priorPhase: state.priorPhase,
      consecutiveDarkNights: state.consecutiveDarkNights,
      player: {
        stamina: state.player.stamina,
        lightReserves: state.player.lightReserves,
        hearts: state.player.hearts,
        insight: state.player.insight,
        insightBanked: state.player.insightBanked,
        resonance: { ...state.player.resonance },
        trust: { ...state.player.trust },
        archiveMastery: { ...state.player.archiveMastery },
        loopCount: state.player.loopCount,
        moralWeight: state.player.moralWeight,
        examineHistory: { ...state.player.examineHistory },
        relationshipFlags: { ...state.player.relationshipFlags },
        shownRelationshipDialogue: [...state.player.shownRelationshipDialogue],
        searchedLocations: [...state.player.searchedLocations],
        discoveredLocations: [...state.player.discoveredLocations],
        sealedInsights: [...state.player.sealedInsights],
        activeJournalThreads: [...state.player.activeJournalThreads],
        journalEntries: [...state.player.journalEntries],
        currentLocation: state.player.currentLocation,
      },
      npcStates: Object.fromEntries(
        Object.entries(state.npcStates).map(([id, npc]) => [id, {
          id: npc.id,
          resonance: npc.resonance,
          isAlive: npc.isAlive,
          dialogueTier: npc.dialogueTier,
          revealedFacts: [...npc.revealedFacts],
          lastInteractionLoop: npc.lastInteractionLoop,
          attitude: npc.attitude,
          currentLocation: npc.currentLocation,
        }])
      ),
    }
  }

  private static deserialise(snapshot: SaveSnapshot): IGameState {
    // Reconstruct Sets from serialised arrays.
    const npcStates = Object.fromEntries(
      Object.entries(snapshot.npcStates).map(([id, npc]) => [id, {
        ...npc,
        revealedFacts: new Set(npc.revealedFacts),
      }])
    )

    return {
      saveVersion: snapshot.saveVersion,
      phase: 'morning',
      difficulty: (snapshot.difficulty ?? 'normal') as IGameState['difficulty'],
      dayTimeRemaining: 1,
      locale: snapshot.locale,
      isPaused: false,
      activeDialogue: null,
      activeQuests: new Set(snapshot.activeQuests),
      completedQuests: new Set(snapshot.completedQuests),
      questStepProgress: Object.fromEntries(
        Object.entries(snapshot.questStepProgress ?? {}).map(([k, v]) => [k, new Set(v)])
      ),
      player: {
        stamina: 10,
        lightReserves: 100,
        hearts: 3,
        insight: 0,
        insightBanked: snapshot.player.insightBanked,
        resonance: snapshot.player.resonance as IGameState['player']['resonance'],
        trust: snapshot.player.trust as IGameState['player']['trust'],
        archiveMastery: snapshot.player.archiveMastery as IGameState['player']['archiveMastery'],
        loopCount: snapshot.player.loopCount,
        moralWeight: snapshot.player.moralWeight,
        examineHistory: (snapshot.player.examineHistory ?? {}) as IGameState['player']['examineHistory'],
        relationshipFlags: (snapshot.player.relationshipFlags ?? {}) as IGameState['player']['relationshipFlags'],
        shownRelationshipDialogue: (snapshot.player.shownRelationshipDialogue ?? []) as IGameState['player']['shownRelationshipDialogue'],
        searchedLocations: new Set(snapshot.player.searchedLocations ?? []) as IGameState['player']['searchedLocations'],
        discoveredLocations: new Set(snapshot.player.discoveredLocations) as IGameState['player']['discoveredLocations'],
        sealedInsights: new Set(snapshot.player.sealedInsights) as IGameState['player']['sealedInsights'],
        activeJournalThreads: new Set(snapshot.player.activeJournalThreads) as IGameState['player']['activeJournalThreads'],
        journalEntries: (snapshot.player.journalEntries ?? []) as IGameState['player']['journalEntries'],
        currentLocation: snapshot.player.currentLocation as IGameState['player']['currentLocation'],
      },
      npcStates: npcStates as unknown as IGameState['npcStates'],
      activePanel: 'none',
      worldFlags: new Set(snapshot.worldFlags ?? []),
      endingId: null,
      lastExaminedKey: null,
      nightDangerLevel: 0,
      consecutiveDarkNights: snapshot.consecutiveDarkNights ?? 0,
      pendingVisions: (snapshot.pendingVisions ?? []) as IGameState['pendingVisions'],
      priorPhase: (snapshot.priorPhase ?? null) as IGameState['priorPhase'],
      lighthouseLitThisLoop: false,
      deathCause: null,
      inventory: new Set(snapshot.inventory ?? []) as IGameState['inventory'],
      endingsSeen: new Set(snapshot.endingsSeen ?? []) as IGameState['endingsSeen'],
      audioMuted: snapshot.audioMuted ?? false,
      achievements: new Set(snapshot.achievements ?? []) as IGameState['achievements'],
      pendingAchievement: null,
      pendingMilestoneMessage: null,
      activeEncounter: null,
      nightEncounterShown: 0,
      weather: (snapshot.weather ?? 'clear') as WeatherType,
      puzzleState: {
        signalDials: (snapshot.puzzleState?.signalDials ?? [0, 0, 0]) as [number, number, number],
        signalSolved: snapshot.puzzleState?.signalSolved ?? false,
      },
      settings: {
        masterVolume: 0.8,
        ambientVolume: 0.8,
        uiVolume: 0.8,
        narrativeVolume: 0.8,
        locale: snapshot.locale,
      },
    }
  }
}
