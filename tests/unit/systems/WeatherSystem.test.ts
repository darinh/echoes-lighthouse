import { describe, it, expect, vi, beforeEach } from 'vitest'
import { WeatherSystem } from '@/systems/WeatherSystem.js'
import type { IEventBus, IGameEvent } from '@/interfaces/index.js'
import { createInitialState } from '@/engine/initialState.js'

function makeBus(): IEventBus {
  return {
    emit: vi.fn(),
    on: vi.fn(() => () => {}),
    off: vi.fn(),
    once: vi.fn(),
  }
}

describe('WeatherSystem', () => {
  let bus: IEventBus
  let system: WeatherSystem

  beforeEach(() => {
    bus = makeBus()
    system = new WeatherSystem(bus)
  })

  it('init returns state unchanged', () => {
    const state = createInitialState()
    expect(system.init(state)).toBe(state)
  })

  it('update returns state unchanged', () => {
    const state = createInitialState()
    expect(system.update(state, 16)).toBe(state)
  })

  it('ignores non-dawn events', () => {
    const state = createInitialState()
    const event: IGameEvent = { type: 'phase.changed', payload: {}, timestamp: 0 }
    expect(system.onEvent(event, state)).toBe(state)
    expect(bus.emit).not.toHaveBeenCalled()
  })

  it('rolls new weather on loop.dawn and fires weather.changed when it changes', () => {
    const state = { ...createInitialState(), weather: 'clear' as const }
    const event: IGameEvent = { type: 'loop.dawn', payload: {}, timestamp: 0 }

    // Run many times — weather must sometimes change and fire event
    let changed = false
    for (let i = 0; i < 50 && !changed; i++) {
      const next = system.onEvent(event, state)
      if (next !== state) {
        changed = true
        expect(['clear', 'fog', 'rain']).toContain(next.weather)
        expect(bus.emit).toHaveBeenCalledWith('weather.changed', { weather: next.weather })
      }
    }
    expect(changed).toBe(true)
  })

  it('returns unchanged state when rolled weather equals current', () => {
    // Force clear→clear: mock Math.random to always pick first slot (clear)
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0)
    const state = { ...createInitialState(), weather: 'clear' as const }
    const event: IGameEvent = { type: 'loop.dawn', payload: {}, timestamp: 0 }
    const next = system.onEvent(event, state)
    expect(next).toBe(state)
    expect(bus.emit).not.toHaveBeenCalled()
    spy.mockRestore()
  })

  it('produces fog when Math.random returns 0.55 (fog band)', () => {
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0.55)
    const state = { ...createInitialState(), weather: 'clear' as const }
    const event: IGameEvent = { type: 'loop.dawn', payload: {}, timestamp: 0 }
    const next = system.onEvent(event, state)
    expect(next.weather).toBe('fog')
    spy.mockRestore()
  })

  it('produces rain when Math.random returns 0.85 (rain band)', () => {
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0.85)
    const state = { ...createInitialState(), weather: 'clear' as const }
    const event: IGameEvent = { type: 'loop.dawn', payload: {}, timestamp: 0 }
    const next = system.onEvent(event, state)
    expect(next.weather).toBe('rain')
    spy.mockRestore()
  })
})
