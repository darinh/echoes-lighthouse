import type { ISystem, IGameState, IGameEvent, IEventBus } from '@/interfaces/index.js'
import type { WeatherType } from '@/interfaces/IGameState.js'

const WEATHER_TABLE: WeatherType[] = [
  'clear', 'clear', 'clear', 'clear', 'clear',
  'fog',   'fog',   'fog',
  'rain',  'rain',
]

export class WeatherSystem implements ISystem {
  readonly name = 'WeatherSystem'
  constructor(private readonly eventBus: IEventBus) {}
  init(state: IGameState): IGameState { return state }
  update(state: IGameState, _dt: number): IGameState { return state }
  onEvent(event: IGameEvent, state: IGameState): IGameState {
    if (event.type !== 'loop.dawn') return state
    const weather = WEATHER_TABLE[Math.floor(Math.random() * WEATHER_TABLE.length)]
    if (weather === state.weather) return state
    this.eventBus.emit('weather.changed', { weather })
    return { ...state, weather }
  }
}
