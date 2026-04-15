import type { ISystem, IGameState, IGameEvent } from '@/interfaces/index.js'
import type { NPCId, LocationId } from '@/interfaces/types.js'
import { loadNPCData } from '@/data/npcs/index.js'

/**
 * NPCScheduleSystem — Moves NPCs between locations based on the game phase.
 *
 * Each NPC data file may declare a `schedule` object mapping GamePhase strings
 * to LocationId strings.  When the game phase changes, this system updates
 * `npcStates[id].currentLocation` for every NPC that has an entry for the new
 * phase.  On loop reset (player.died) every NPC is returned to their
 * `defaultLocation` first, then the dawn schedule (if any) is applied.
 */
export class NPCScheduleSystem implements ISystem {
  readonly name = 'NPCScheduleSystem'

  private schedules: Record<string, Record<string, string>> = {}
  private defaultLocations: Record<string, string> = {}
  private lastPhase: string | null = null

  constructor() {
    void loadNPCData()
      .then(data => {
        for (const [id, npc] of Object.entries(data)) {
          this.schedules[id] = (npc.schedule as unknown as Record<string, string>) ?? {}
          this.defaultLocations[id] = npc.defaultLocation
        }
      })
      .catch(() => {
        // data is static — failure only happens in broken test environments
      })
  }

  init(state: IGameState): IGameState {
    this.lastPhase = state.phase
    return state
  }

  /**
   * Detect phase changes on every game tick and apply NPC schedule moves.
   * Using update() rather than onEvent() ensures we catch all phase transitions
   * regardless of whether an event was dispatched (e.g. day → dusk via timer).
   */
  update(state: IGameState, _dt: number): IGameState {
    if (state.phase === this.lastPhase) return state
    this.lastPhase = state.phase
    const schedulable = ['dawn', 'day', 'dusk', 'night_safe', 'night_dark']
    if (!schedulable.includes(state.phase)) return state
    return this.applySchedules(state, state.phase)
  }

  onEvent(event: IGameEvent, state: IGameState): IGameState {
    if (event.type === 'player.died') {
      // LoopSystem (registered before us) has already set state.phase = 'dawn'.
      // Reset all NPCs to their default locations for the fresh loop, then apply
      // any dawn schedule entries on top.
      this.lastPhase = state.phase
      const reset = this.resetToDefaults(state)
      return this.applySchedules(reset, 'dawn')
    }
    return state
  }

  private applySchedules(state: IGameState, phase: string): IGameState {
    const updates: Record<string, INPCStatePatch> = {}
    let changed = false

    for (const [id, npcState] of Object.entries(state.npcStates)) {
      const target = this.schedules[id]?.[phase] as LocationId | undefined
      if (target && target !== npcState.currentLocation) {
        updates[id] = { ...npcState, currentLocation: target }
        changed = true
      }
    }

    if (!changed) return state
    return {
      ...state,
      npcStates: { ...state.npcStates, ...updates } as typeof state.npcStates,
    }
  }

  private resetToDefaults(state: IGameState): IGameState {
    const updates: Record<string, INPCStatePatch> = {}
    let changed = false

    for (const [id, npcState] of Object.entries(state.npcStates)) {
      const defaultLoc = this.defaultLocations[id] as LocationId | undefined
      if (defaultLoc && defaultLoc !== npcState.currentLocation) {
        updates[id] = { ...npcState, currentLocation: defaultLoc }
        changed = true
      }
    }

    if (!changed) return state
    return {
      ...state,
      npcStates: { ...state.npcStates, ...updates } as typeof state.npcStates,
    }
  }
}

// Local alias used only for the spread-then-cast pattern above.
type INPCStatePatch = import('@/interfaces/IGameState.js').INPCState & { currentLocation: NPCId | LocationId | null }
