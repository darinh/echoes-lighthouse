import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SynthAudioProvider } from '@/providers/audio/SynthAudioProvider.js'

const makeOscillator = () => ({
  type: 'sine' as OscillatorType,
  frequency: {
    value: 440,
    setValueAtTime: vi.fn(),
    setTargetAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    cancelScheduledValues: vi.fn(),
  },
  connect: vi.fn(),
  disconnect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
})

const makeGain = () => ({
  gain: {
    value: 1,
    setValueAtTime: vi.fn(),
    setTargetAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    cancelScheduledValues: vi.fn(),
  },
  connect: vi.fn(),
  disconnect: vi.fn(),
})

const makeFilter = () => ({
  type: 'lowpass' as BiquadFilterType,
  frequency: { value: 1000, setValueAtTime: vi.fn(), setTargetAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
  Q: { value: 1 },
  connect: vi.fn(),
  disconnect: vi.fn(),
})

const makeDelay = () => ({
  delayTime: { value: 0 },
  connect: vi.fn(),
  disconnect: vi.fn(),
})

const makeBufferSource = () => ({
  buffer: null as null,
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
  createDelay = vi.fn(() => makeDelay())
  createBiquadFilter = vi.fn(() => makeFilter())
  createBufferSource = vi.fn(() => makeBufferSource())
  createBuffer = vi.fn((_c: number, size: number) => ({
    getChannelData: () => new Float32Array(size),
  }))
  resume = vi.fn(() => Promise.resolve())
}

// @ts-expect-error - jsdom does not include Web Audio API
global.AudioContext = MockAudioContext

describe('SynthAudioProvider', () => {
  let provider: SynthAudioProvider

  beforeEach(() => {
    provider = new SynthAudioProvider()
    vi.clearAllMocks()
  })

  it('starts in unlocked=false state', () => {
    expect(provider.isUnlocked()).toBe(false)
  })

  it('unlock() initialises AudioContext and sets unlocked=true', async () => {
    await provider.unlock()
    expect(provider.isUnlocked()).toBe(true)
  })

  it('calling unlock() twice is idempotent', async () => {
    await provider.unlock()
    await provider.unlock()
    expect(provider.isUnlocked()).toBe(true)
  })

  it('play() before unlock does not throw', () => {
    expect(() => provider.play('button.hover')).not.toThrow()
    expect(() => provider.play('insight.gained')).not.toThrow()
    expect(() => provider.play('unknown.sound')).not.toThrow()
  })

  it('play() after unlock does not throw for all known sounds', async () => {
    await provider.unlock()
    const sounds = [
      'button.hover', 'button.click',
      'insight.gained', 'insight.banked', 'insight.sealed',
      'dialogue.advance', 'location.moved',
      'player.died', 'loop.started', 'lighthouse.lit', 'ending.reached',
    ]
    for (const id of sounds) {
      expect(() => provider.play(id)).not.toThrow()
    }
  })

  it('stop() before unlock does not throw', () => {
    expect(() => provider.stop('button.hover')).not.toThrow()
  })

  it('stop() after play does not throw', async () => {
    await provider.unlock()
    provider.play('button.hover')
    expect(() => provider.stop('button.hover')).not.toThrow()
  })

  it('stopAll() does not throw', async () => {
    await provider.unlock()
    provider.play('button.hover')
    expect(() => provider.stopAll()).not.toThrow()
  })

  it('setVolume() does not throw before or after unlock', async () => {
    expect(() => provider.setVolume('master', 0.5)).not.toThrow()
    await provider.unlock()
    expect(() => provider.setVolume('master', 0.5)).not.toThrow()
    expect(() => provider.setVolume('ambient', 0.8)).not.toThrow()
    expect(() => provider.setVolume('ui', 0.3)).not.toThrow()
    expect(() => provider.setVolume('narrative', 1.0)).not.toThrow()
  })

  it('setPhase() does not throw before unlock', () => {
    expect(() => provider.setPhase('dawn')).not.toThrow()
    expect(() => provider.setPhase('day')).not.toThrow()
    expect(() => provider.setPhase('night_dark')).not.toThrow()
  })

  it('setPhase() does not throw after unlock for all phases', async () => {
    await provider.unlock()
    const phases = ['dawn', 'day', 'dusk', 'night_safe', 'night_dark', 'vision', 'ending'] as const
    for (const phase of phases) {
      expect(() => provider.setPhase(phase)).not.toThrow()
    }
  })

  it('setThreatLevel() does not throw for any value', async () => {
    await provider.unlock()
    expect(() => provider.setThreatLevel(0)).not.toThrow()
    expect(() => provider.setThreatLevel(0.5)).not.toThrow()
    expect(() => provider.setThreatLevel(1)).not.toThrow()
    expect(() => provider.setThreatLevel(-0.5)).not.toThrow()
    expect(() => provider.setThreatLevel(1.5)).not.toThrow()
  })
})
