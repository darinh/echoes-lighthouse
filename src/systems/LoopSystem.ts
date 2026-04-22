import type { ISystem, IGameState, IGameEvent, IEventBus } from '@/interfaces/index.js'

/**
 * LoopSystem — Manages the day/night cycle, death, and loop resets.
 * Persistent state is preserved; physical stats reset on death/new loop.
 * See docs/gdd/04-systems-design.md §1.1 for stat persistence rules.
 */
export class LoopSystem implements ISystem {
  readonly name = 'LoopSystem'

  constructor(private readonly eventBus: IEventBus) {}

  init(state: IGameState): IGameState {
    // Preserve the 'title' phase — the title screen drives the transition to
    // 'dawn'.  LoopSystem no longer auto-advances past title on boot so that
    // the player always sees the title screen.  loopCount is still initialised
    // to 1 so the HUD shows the correct loop number the moment gameplay begins.
    return { ...state, player: { ...state.player, loopCount: 1 } }
  }

  update(state: IGameState, deltaMs: number): IGameState {
    if (state.isPaused || state.phase === 'title' || state.phase === 'ending' || state.phase === 'death') return state

    // Drain dayTimeRemaining during day phase
    if (state.phase === 'morning' || state.phase === 'afternoon' || state.phase === 'dusk') {
      const rate = 1 / (10 * 60 * 1000) // 10 minutes per loop
      const newTime = Math.max(0, state.dayTimeRemaining - rate * deltaMs)

      if (newTime <= 0.2 && state.dayTimeRemaining > 0.2) {
        this.eventBus.emit('day.timer.warning', { remaining: newTime })
      }

      if (newTime <= 0) {
        this.eventBus.emit('phase.changed', { from: state.phase, to: 'night_dark' })
        return { ...state, phase: 'night_dark', dayTimeRemaining: 0, nightDangerLevel: 2 }
      }

      // Update night danger level based on remaining time thresholds
      let nightDangerLevel = state.nightDangerLevel
      if (newTime < 0.15) nightDangerLevel = Math.max(nightDangerLevel, 2)
      else if (newTime < 0.30) nightDangerLevel = Math.max(nightDangerLevel, 1)

      return { ...state, dayTimeRemaining: newTime, nightDangerLevel }
    }

    return state
  }

  onEvent(event: IGameEvent, state: IGameState): IGameState {
    if (event.type === 'player.died') return this.handleDeath(state)
    return state
  }

  private handleDeath(state: IGameState): IGameState {
    const { player } = state
    const survivingInsight = player.insightBanked
    return {
      ...state,
      phase: 'dawn',
      dayTimeRemaining: 1,
      deathCause: null,
      nightDangerLevel: 0,
      player: {
        ...player,
        stamina: 10,
        lightReserves: 100,
        hearts: 3,
        insight: survivingInsight,
        currentLocation: 'keepers_cottage',
        loopCount: player.loopCount + 1,
      },
    }
  }
}
