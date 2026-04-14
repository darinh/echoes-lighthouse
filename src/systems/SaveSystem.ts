import type { ISystem, IGameState, IGameEvent, IEventBus } from '@/interfaces/index.js'

const STORAGE_KEY = 'echoes-lighthouse-save'
const MAX_SAVE_SIZE = 100 * 1024 // 100 KB
const CURRENT_SAVE_VERSION = 1

/** Serialisable snapshot — Sets converted to arrays, activeDialogue stripped. */
interface SaveSnapshot {
  saveVersion: number
  phase: IGameState['phase']
  dayTimeRemaining: number
  locale: string
  isPaused: boolean
  activeQuests: string[]
  completedQuests: string[]
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
    discoveredLocations: string[]
    sealedInsights: string[]
    activeJournalThreads: string[]
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
      if (!snapshot || snapshot.saveVersion !== CURRENT_SAVE_VERSION) return null
      return SaveSystem.deserialise(snapshot)
    } catch {
      return null
    }
  }

  static clearSave(): void {
    localStorage.removeItem(STORAGE_KEY)
  }

  // ─── Serialisation ────────────────────────────────────────────────────────

  private static serialise(state: IGameState): SaveSnapshot {
    return {
      saveVersion: state.saveVersion,
      phase: state.phase,
      dayTimeRemaining: state.dayTimeRemaining,
      locale: state.locale,
      isPaused: state.isPaused,
      activeQuests: [...state.activeQuests],
      completedQuests: [...state.completedQuests],
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
        discoveredLocations: [...state.player.discoveredLocations],
        sealedInsights: [...state.player.sealedInsights],
        activeJournalThreads: [...state.player.activeJournalThreads],
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
      phase: snapshot.phase,
      dayTimeRemaining: snapshot.dayTimeRemaining,
      locale: snapshot.locale,
      isPaused: snapshot.isPaused,
      activeDialogue: null,
      activeQuests: new Set(snapshot.activeQuests),
      completedQuests: new Set(snapshot.completedQuests),
      player: {
        stamina: snapshot.player.stamina,
        lightReserves: snapshot.player.lightReserves,
        hearts: snapshot.player.hearts,
        insight: snapshot.player.insight,
        insightBanked: snapshot.player.insightBanked,
        resonance: snapshot.player.resonance as IGameState['player']['resonance'],
        trust: snapshot.player.trust as IGameState['player']['trust'],
        archiveMastery: snapshot.player.archiveMastery as IGameState['player']['archiveMastery'],
        loopCount: snapshot.player.loopCount,
        moralWeight: snapshot.player.moralWeight,
        discoveredLocations: new Set(snapshot.player.discoveredLocations) as IGameState['player']['discoveredLocations'],
        sealedInsights: new Set(snapshot.player.sealedInsights) as IGameState['player']['sealedInsights'],
        activeJournalThreads: new Set(snapshot.player.activeJournalThreads) as IGameState['player']['activeJournalThreads'],
        currentLocation: snapshot.player.currentLocation as IGameState['player']['currentLocation'],
      },
      npcStates: npcStates as unknown as IGameState['npcStates'],
    }
  }
}
