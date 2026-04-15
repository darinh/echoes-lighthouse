import type { ISystem, IGameState, IGameEvent, IEventBus } from '@/interfaces/index.js'
import type { WeatherType } from '@/interfaces/IGameState.js'

// 50% clear, 30% fog, 20% rain
const WEATHER_TABLE: WeatherType[] = [
  'clear', 'clear', 'clear', 'clear', 'clear',
  'fog',   'fog',   'fog',
  'rain',  'rain',
]

/**
 * WeatherSystem — Rolls new weather each dawn and fires `weather.changed`.
 * Weather affects the canvas overlay, examine text prefixes, and the HUD icon.
 */
export class WeatherSystem implements ISystem {
  readonly name = 'WeatherSystem'

  constructor(private readonly eventBus: IEventBus) {}

  init(state: IGameState): IGameState { return state }

  update(state: IGameState, _dt: number): IGameState { return state }

  onEvent(event: IGameEvent, state: IGameState): IGameState {
    if (event.type !== 'loop.dawn') return state
    const weather = WEATHER_TABLE[Math.floor(Math.random() * WEATHER_TABLE.length)]
    if (weather === state.weather) return state
    const next: IGameState = { ...state, weather }
    this.eventBus.emit('weather.changed', { weather })
    return next
  }
}
