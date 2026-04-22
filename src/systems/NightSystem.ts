import type { ISystem, IGameState, IGameEvent, IEventBus } from '@/interfaces/index.js'
import { pickDangerEncounter } from '@/data/encounters/nightEncounters.js'

/**
 * NightSystem — Tracks danger level during night_dark phase, manages
 * consecutive-dark-night escalation, and selects night encounters from
 * the danger-gated encounter pool.
 *
 * Consecutive escalation tiers (GDD §6.9):
 *   3+ consecutive → emit `night.consecDark`, insight loss on survival
 *   5+ consecutive → set `corruption_path_unlocked` world flag
 *   7+ consecutive → game-over state (phase = 'death', cause = 'dark_nights')
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
    const { from, to } = payload

    if (to === 'night_dark') {
      return this.enterDarkNight(state)
    }

    // Transitioning out of night_dark to a daytime phase means the player survived.
    if (from === 'night_dark' && (to === 'dawn' || to === 'morning' || to === 'afternoon' || to === 'dusk')) {
      return this.surviveDarkNight(state)
    }

    // Any daytime phase also resets the consecutive streak (safety net for other transitions).
    if (to === 'dawn' || to === 'morning' || to === 'afternoon' || to === 'dusk') {
      return { ...state, consecutiveDarkNights: 0 }
    }

    return state
  }

  private enterDarkNight(state: IGameState): IGameState {
    const consecutive = state.consecutiveDarkNights + 1

    // Game-over at 7+ consecutive dark nights — GDD §6.9
    if (consecutive >= 7) {
      this.eventBus.emit('game.over', { reason: 'dark_nights', count: consecutive })
      return {
        ...state,
        consecutiveDarkNights: consecutive,
        phase: 'death',
        deathCause: 'dark_nights',
      }
    }

    // Determine starting danger level based on escalation tier.
    let startDanger = state.nightDangerLevel
    if (consecutive >= 3) {
      startDanger = Math.max(startDanger, 50)
    } else if (consecutive === 2) {
      startDanger = Math.max(startDanger, 25)
    }

    let next: IGameState = { ...state, consecutiveDarkNights: consecutive, nightDangerLevel: startDanger }

    // Emit night.consecDark on 3+ consecutive dark nights — GDD §6.9
    if (consecutive >= 3) {
      this.eventBus.emit('night.consecDark', { count: consecutive })
      // Keep legacy event for backward compatibility with existing listeners.
      this.eventBus.emit('night.breaking_point', { consecutiveDarkNights: consecutive })
    }

    // Unlock Corruption ending path at 5+ consecutive — GDD §6.9
    if (consecutive >= 5) {
      const flags = new Set(next.worldFlags)
      flags.add('corruption_path_unlocked')
      next = { ...next, worldFlags: flags }
    }

    // Select an encounter from the danger-gated pool.
    next = this.spawnEncounter(next)

    return next
  }

  /**
   * Called when the player survives a dark night (transitions to daytime).
   * Applies insight loss, increments counters, sets NPC dialogue flags.
   */
  private surviveDarkNight(state: IGameState): IGameState {
    const survived = state.player.darkNightsSurvived + 1

    // Insight loss: 30–50% of current insight (GDD §6.9), inclusive of both endpoints.
    // Sample an integer percent in [30, 50] to avoid floating-point exclusion of 50%.
    const lossPercent = 30 + Math.floor(Math.random() * 21)  // [30, 50] inclusive
    const insightLost = Math.floor(state.player.insight * lossPercent / 100)
    const newInsight = Math.max(0, state.player.insight - insightLost)

    const newFlags = new Set(state.worldFlags)
    // NPC dialogue shift flag — GDD §6.9: shifts after dark_nights_survived >= 2
    if (survived >= 2) {
      newFlags.add('dark_nights_survived_2plus')
    }

    return {
      ...state,
      consecutiveDarkNights: 0,
      player: {
        ...state.player,
        insight: newInsight,
        darkNightsSurvived: survived,
      },
      worldFlags: newFlags,
    }
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

    // Apply encounter effects immediately.
    let next: IGameState = { ...state, worldFlags: newFlags }
    const { effect } = encounter

    if (effect.staminaDelta !== undefined) {
      const newStamina = Math.max(0, Math.min(10, next.player.stamina + effect.staminaDelta))
      next = { ...next, player: { ...next.player, stamina: newStamina } }
    }

    if (effect.insightDelta !== undefined) {
      const newInsight = Math.max(0, next.player.insight + effect.insightDelta)
      next = { ...next, player: { ...next.player, insight: newInsight } }
    }

    if (effect.moralWeightDelta !== undefined) {
      const newMoral = next.player.moralWeight + effect.moralWeightDelta
      next = { ...next, player: { ...next.player, moralWeight: newMoral } }
    }

    if (effect.dangerDelta !== undefined) {
      const newDanger = Math.min(100, Math.max(0, next.nightDangerLevel + effect.dangerDelta))
      next = { ...next, nightDangerLevel: newDanger }
    }

    if (effect.worldFlagSet) {
      const flags = new Set(next.worldFlags)
      flags.add(effect.worldFlagSet)
      next = { ...next, worldFlags: flags }
    }

    if (effect.visionTrigger) {
      next = { ...next, pendingVisions: [...next.pendingVisions, effect.visionTrigger] }
    }

    // locationClosed: flag the current location as temporarily closed for this loop.
    if (effect.locationClosed) {
      const flags = new Set(next.worldFlags)
      flags.add(`location_closed.${next.player.currentLocation}`)
      next = { ...next, worldFlags: flags }
    }

    return next
  }

  // ─── Danger escalation ───────────────────────────────────────────────────

  private handleDangerEscalate(state: IGameState): IGameState {
    // Clear weather during night reduces danger escalation by 1 (floor 0)
    const weatherReduction = state.weather === 'clear' ? 1 : 0
    const increment = Math.max(0, 10 - weatherReduction)
    const newLevel = Math.min(100, state.nightDangerLevel + increment)
    if (newLevel >= 100) {
      return { ...state, nightDangerLevel: 100, phase: 'death', deathCause: 'death.night_danger' }
    }
    return { ...state, nightDangerLevel: newLevel }
  }
}

