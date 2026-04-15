import type { ISystem, IGameState, IGameEvent, IEventBus } from '@/interfaces/index.js'

const STAMINA_DRAIN_PER_MOVE = 1
const STAMINA_DRAIN_PER_EXAMINE = 1
const STAMINA_LOW_THRESHOLD = 2
const MAX_STAMINA = 10

/**
 * StaminaSystem — Drains stamina on movement/examine and light reserves on time ticks.
 * Emits exhaustion/low-light events for the engine to react to.
 */
export class StaminaSystem implements ISystem {
  readonly name = 'StaminaSystem'

  constructor(private readonly eventBus: IEventBus) {}

  init(state: IGameState): IGameState { return state }
  update(state: IGameState, _deltaMs: number): IGameState { return state }

  onEvent(event: IGameEvent, state: IGameState): IGameState {
    switch (event.type) {
      case 'location.moved':    return this.handleMoved(state)
      case 'examine.completed': return this.handleExamined(state)
      case 'time.tick':         return this.handleTimeTick(state)
      case 'player.rested':     return this.handleRested(state)
      case 'lantern.refilled':  return this.handleLanternRefilled(state)
      default:                  return state
    }
  }

  private handleMoved(state: IGameState): IGameState {
    const newStamina = Math.max(0, state.player.stamina - STAMINA_DRAIN_PER_MOVE)
    const newState: IGameState = {
      ...state,
      player: { ...state.player, stamina: newStamina },
    }

    if (newStamina === 0) {
      this.eventBus.emit('player.exhausted', {})
    } else if (newStamina <= STAMINA_LOW_THRESHOLD) {
      this.eventBus.emit('player.stamina.low', { stamina: newStamina })
    }

    return newState
  }

  private handleExamined(state: IGameState): IGameState {
    const newStamina = Math.max(0, state.player.stamina - STAMINA_DRAIN_PER_EXAMINE)
    const newState: IGameState = {
      ...state,
      player: { ...state.player, stamina: newStamina },
    }

    if (newStamina === 0) {
      this.eventBus.emit('player.exhausted', {})
    } else if (newStamina <= STAMINA_LOW_THRESHOLD) {
      this.eventBus.emit('player.stamina.low', { stamina: newStamina })
    }

    return newState
  }

  private handleTimeTick(state: IGameState): IGameState {
    const LIGHT_DRAIN_PER_TICK = 2
    const newLight = Math.max(0, state.player.lightReserves - LIGHT_DRAIN_PER_TICK)
    const newState: IGameState = {
      ...state,
      player: { ...state.player, lightReserves: newLight },
    }

    if (newLight === 0) {
      this.eventBus.emit('player.light.out', {})
    }

    return newState
  }

  private handleRested(state: IGameState): IGameState {
    return {
      ...state,
      player: { ...state.player, stamina: MAX_STAMINA },
    }
  }

  private handleLanternRefilled(state: IGameState): IGameState {
    return {
      ...state,
      player: { ...state.player, lightReserves: 100 },
    }
  }
}
