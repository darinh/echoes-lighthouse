import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AmbientAudioSystem } from '@/systems/AmbientAudioSystem.js'
import { createInitialState } from '@/engine/initialState.js'
import type { IGameEvent } from '@/interfaces/IEventBus.js'

// ─── Minimal Web Audio mock ───────────────────────────────────────────────────

const makeParam = () => ({
  value: 0,
  setValueAtTime: vi.fn(),
  linearRampToValueAtTime: vi.fn(),
  cancelScheduledValues: vi.fn(),
})

const makeOscillator = () => ({
  type: 'sine' as OscillatorType,
  frequency: makeParam(),
  connect: vi.fn(),
  disconnect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
})

const makeGain = () => ({
  gain: makeParam(),
  connect: vi.fn(),
  disconnect: vi.fn(),
})

const makeFilter = () => ({
  type: 'lowpass' as BiquadFilterType,
  frequency: makeParam(),
  Q: makeParam(),
  connect: vi.fn(),
  disconnect: vi.fn(),
})

const makeBufferSource = () => ({
  buffer: null as AudioBuffer | null,
  loop: false,
  connect: vi.fn(),
  disconnect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
})

class MockAudioContext {
  state = 'running'
  currentTime = 0
  sampleRate = 44100
  destination = {} as AudioDestinationNode
  createOscillator = vi.fn(() => makeOscillator())
  createGain = vi.fn(() => makeGain())
  createBiquadFilter = vi.fn(() => makeFilter())
  createBufferSource = vi.fn(() => makeBufferSource())
  createBuffer = vi.fn((_channels: number, size: number, _rate: number) => ({
    getChannelData: () => new Float32Array(size),
  }))
  resume = vi.fn(() => Promise.resolve())
  close = vi.fn(() => Promise.resolve())
}

// @ts-expect-error — jsdom does not include Web Audio API
global.AudioContext = MockAudioContext

// ─── Event bus mock ───────────────────────────────────────────────────────────

function makeBus() {
  const handlers = new Map<string, Array<(e: IGameEvent) => void>>()
  return {
    emit: vi.fn((type: string, payload: unknown) => {
      const hs = handlers.get(type) ?? []
      hs.forEach(h => h({ type, payload, timestamp: 0 } as IGameEvent))
    }),
    on: vi.fn((type: string, handler: (e: IGameEvent) => void) => {
      if (!handlers.has(type)) handlers.set(type, [])
      handlers.get(type)!.push(handler)
      return () => {
        const hs = handlers.get(type) ?? []
        const idx = hs.indexOf(handler)
        if (idx >= 0) hs.splice(idx, 1)
      }
    }),
    off: vi.fn(),
    once: vi.fn(),
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AmbientAudioSystem', () => {
  let system: AmbientAudioSystem
  let bus: ReturnType<typeof makeBus>
  let state: ReturnType<typeof createInitialState>

  beforeEach(() => {
    vi.clearAllMocks()
    bus = makeBus()
    system = new AmbientAudioSystem(bus as unknown as import('@/interfaces/IEventBus.js').IEventBus)
    state = createInitialState()
  })

  afterEach(() => {
    system.destroy()
  })

  it('has correct name', () => {
    expect(system.name).toBe('AmbientAudioSystem')
  })

  it('init() does not throw and returns state unchanged (except audioMuted remains)', () => {
    const result = system.init(state)
    expect(result).toBe(state) // same reference — no state mutation on init
  })

  it('update() returns state unchanged', () => {
    system.init(state)
    const result = system.update(state, 16)
    expect(result).toBe(state)
  })

  it('audio.toggle event flips audioMuted in state', () => {
    system.init(state)
    const event: IGameEvent = { type: 'audio.toggle', payload: {}, timestamp: 0 }
    const after = system.onEvent(event, state)
    expect(after.audioMuted).toBe(true)

    // Toggle again — should flip back
    const after2 = system.onEvent(event, after)
    expect(after2.audioMuted).toBe(false)
  })

  it('location.moved to coastal zone does not throw', () => {
    system.init(state)
    const event: IGameEvent = {
      type: 'location.moved',
      payload: { locationId: 'harbor' },
      timestamp: 0,
    }
    expect(() => system.onEvent(event, state)).not.toThrow()
  })

  it('location.moved to interior zone does not throw', () => {
    system.init(state)
    const event: IGameEvent = {
      type: 'location.moved',
      payload: { locationId: 'lighthouse_base' },
      timestamp: 0,
    }
    expect(() => system.onEvent(event, state)).not.toThrow()
  })

  it('location.moved to inland zone does not throw', () => {
    system.init(state)
    const event: IGameEvent = {
      type: 'location.moved',
      payload: { locationId: 'forest_path' },
      timestamp: 0,
    }
    expect(() => system.onEvent(event, state)).not.toThrow()
  })

  it('phase.changed to night_safe triggers night mode without throw', () => {
    system.init(state)
    const event: IGameEvent = {
      type: 'phase.changed',
      payload: { phase: 'night_safe' },
      timestamp: 0,
    }
    expect(() => system.onEvent(event, state)).not.toThrow()
  })

  it('loop.dawn event restores day mode without throw', () => {
    system.init(state)
    const nightEvent: IGameEvent = { type: 'loop.night', payload: {}, timestamp: 0 }
    system.onEvent(nightEvent, state)
    const dawnEvent: IGameEvent = { type: 'loop.dawn', payload: {}, timestamp: 0 }
    expect(() => system.onEvent(dawnEvent, state)).not.toThrow()
  })

  it('subscribes to audio.toggle and loop.dawn on init', () => {
    system.init(state)
    expect(bus.on).toHaveBeenCalledWith('audio.toggle', expect.any(Function))
    expect(bus.on).toHaveBeenCalledWith('loop.dawn', expect.any(Function))
  })

  it('destroy() does not throw', () => {
    system.init(state)
    expect(() => system.destroy()).not.toThrow()
  })

  it('destroy() can be called without init without throw', () => {
    expect(() => system.destroy()).not.toThrow()
  })

  it('all events return unchanged state (no unintended mutations)', () => {
    system.init(state)
    const events: IGameEvent[] = [
      { type: 'location.moved', payload: { locationId: 'cliffside' }, timestamp: 0 },
      { type: 'phase.changed', payload: { phase: 'night_dark' }, timestamp: 0 },
      { type: 'loop.dawn', payload: {}, timestamp: 0 },
      { type: 'loop.night', payload: {}, timestamp: 0 },
    ]
    for (const ev of events) {
      const result = system.onEvent(ev, state)
      // State reference should be unchanged (no new state object for non-toggle events)
      expect(result).toBe(state)
    }
  })

  describe('graceful degradation without Web Audio API', () => {
    it('works correctly when AudioContext is not available', () => {
      const saved = global.AudioContext
      ;(global as Record<string, unknown>)['AudioContext'] = undefined

      const noAudioSystem = new AmbientAudioSystem(bus as unknown as import('@/interfaces/IEventBus.js').IEventBus)
      expect(() => noAudioSystem.init(state)).not.toThrow()
      expect(() => noAudioSystem.update(state, 16)).not.toThrow()
      expect(() => noAudioSystem.destroy()).not.toThrow()

      ;(global as Record<string, unknown>)['AudioContext'] = saved
    })

    it('audio.toggle still updates state even without AudioContext', () => {
      const saved = global.AudioContext
      ;(global as Record<string, unknown>)['AudioContext'] = undefined

      const noAudioSystem = new AmbientAudioSystem(bus as unknown as import('@/interfaces/IEventBus.js').IEventBus)
      noAudioSystem.init(state)
      const after = noAudioSystem.onEvent({ type: 'audio.toggle', payload: {}, timestamp: 0 }, state)
      expect(after.audioMuted).toBe(true)

      ;(global as Record<string, unknown>)['AudioContext'] = saved
      noAudioSystem.destroy()
    })
  })
})
