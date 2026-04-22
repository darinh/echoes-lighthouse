import { describe, it, expect, vi, beforeEach } from 'vitest'
import { WeatherSystem } from '@/systems/WeatherSystem.js'
import type { IEventBus, IGameEvent } from '@/interfaces/index.js'
import { createInitialState } from '@/engine/initialState.js'

function makeBus(): IEventBus {
  return { emit: vi.fn(), on: vi.fn(() => () => {}), off: vi.fn(), once: vi.fn() }
}

describe('WeatherSystem', () => {
  let bus: IEventBus
  let system: WeatherSystem
  beforeEach(() => { bus = makeBus(); system = new WeatherSystem(bus) })

  it('init returns state unchanged', () => { const s = createInitialState(); expect(system.init(s)).toBe(s) })
  it('update returns state unchanged', () => { const s = createInitialState(); expect(system.update(s, 16)).toBe(s) })
  it('ignores non-dawn events', () => {
    const s = createInitialState()
    const e: IGameEvent = { type: 'phase.changed', payload: {}, timestamp: 0 }
    expect(system.onEvent(e, s)).toBe(s); expect(bus.emit).not.toHaveBeenCalled()
  })
  it('rolls weather on loop.dawn when it changes', () => {
    const s = { ...createInitialState(), weather: 'clear' as const }
    const e: IGameEvent = { type: 'loop.dawn', payload: {}, timestamp: 0 }
    let changed = false
    for (let i = 0; i < 50 && !changed; i++) {
      const next = system.onEvent(e, s)
      if (next !== s) { changed = true; expect(['clear','fog','rain','storm']).toContain(next.weather) }
    }
    expect(changed).toBe(true)
  })
  it('same weather returns unchanged state', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const s = { ...createInitialState(), weather: 'clear' as const }
    expect(system.onEvent({ type: 'loop.dawn', payload: {}, timestamp: 0 }, s)).toBe(s)
    vi.restoreAllMocks()
  })
  it('produces fog at 0.55', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.55)
    const s = { ...createInitialState(), weather: 'clear' as const }
    expect(system.onEvent({ type: 'loop.dawn', payload: {}, timestamp: 0 }, s).weather).toBe('fog')
    vi.restoreAllMocks()
  })
  it('produces rain at 0.85', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.85)
    const s = { ...createInitialState(), weather: 'clear' as const }
    expect(system.onEvent({ type: 'loop.dawn', payload: {}, timestamp: 0 }, s).weather).toBe('rain')
    vi.restoreAllMocks()
  })
})
