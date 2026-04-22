import type { ISystem, IGameState, IGameEvent, IEventBus } from '@/interfaces/index.js'
import { pickDangerEncounter } from '@/data/encounters/nightEncounters.js'

/**
 * NightSystem — Tracks danger level during night_dark phase, manages
 * consecutive-dark-night escalation, and selects night encounters from
 * the danger-gated encounter pool.
 */
export class NightSystem implements ISystem {
  readonly name = 'NightSystem'

  constructor(private readonly eventBus: IEventBus) {}

  init(state: IGameState): IGameState { return state }
  update(state: IGameState, _deltaMs: number): IGameState { return state }

  onEvent(event: IGameEvent, state: IGameState): IGameState {
    switch (event.type) {
      case 'phase.changed':
        return this.handlePhaseChanged(event.payload as { from: string; to: string }, state)
      case 'night.danger.escalate':
        return this.handleDangerEscalate(state)
      case 'loop.started':
      case 'player.died':
        return { ...state, nightDangerLevel: 0, consecutiveDarkNights: 0 }
      default:
        return state
    }
  }

  // ─── Phase change ────────────────────────────────────────────────────────

  private handlePhaseChanged(
    payload: { from: string; to: string },
    state: IGameState,
  ): IGameState {
    const { to } = payload

    if (to === 'night_dark') {
      return this.enterDarkNight(state)
    }

    // Any daytime phase resets the consecutive streak.
    if (to === 'dawn' || to === 'morning' || to === 'afternoon' || to === 'dusk') {
      return { ...state, consecutiveDarkNights: 0 }
    }

    return state
  }

  private enterDarkNight(state: IGameState): IGameState {
    const consecutive = state.consecutiveDarkNights + 1

    // Determine starting danger level based on escalation tier.
    let startDanger = state.nightDangerLevel
    if (consecutive >= 3) {
      startDanger = Math.max(startDanger, 50)
    } else if (consecutive === 2) {
      startDanger = Math.max(startDanger, 25)
    }

    let next: IGameState = { ...state, consecutiveDarkNights: consecutive, nightDangerLevel: startDanger }

    // Emit breaking point on 3+ consecutive dark nights.
    if (consecutive >= 3) {
      this.eventBus.emit('night.breaking_point', { consecutiveDarkNights: consecutive })
    }

    // Select an encounter from the danger-gated pool.
    next = this.spawnEncounter(next)

    return next
  }

  // ─── Encounter selection ─────────────────────────────────────────────────

  private spawnEncounter(state: IGameState): IGameState {
    const shownThisNight = new Set(
      [...state.worldFlags]
        .filter(f => f.startsWith('night_enc_seen.'))
        .map(f => f.replace('night_enc_seen.', '')),
    )

    const encounter = pickDangerEncounter(state.nightDangerLevel, state, shownThisNight)
    if (!encounter) return state

    const newFlags = new Set(state.worldFlags)
    newFlags.add(`night_enc_seen.${encounter.id}`)

    this.eventBus.emit('night.encounter.started', { encounterId: encounter.id })

    return { ...state, worldFlags: newFlags }
  }

  // ─── Danger escalation ───────────────────────────────────────────────────

  private handleDangerEscalate(state: IGameState): IGameState {
    const newLevel = Math.min(100, state.nightDangerLevel + 10)
    if (newLevel >= 100) {
      return { ...state, nightDangerLevel: 100, phase: 'death', deathCause: 'death.night_danger' }
    }
    return { ...state, nightDangerLevel: newLevel }
  }
}

