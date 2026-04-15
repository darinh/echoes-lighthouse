import { beforeEach, describe, expect, it } from 'vitest'
import { GameEngine } from '@/engine/GameEngine.js'
import { EventBus } from '@/engine/EventBus.js'
import type { IAudioProvider, IRenderer } from '@/interfaces/index.js'
import { SIGNAL_SOLUTION, SIGNAL_DIAL_MAX } from '@/data/puzzle/signalPuzzle.js'

const mockRenderer = {
  init: () => {},
  render: () => {},
  resize: () => {},
  getContext: () => ({ canvas: document.createElement('canvas'), ctx: {} as CanvasRenderingContext2D, width: 0, height: 0, scale: 1 }),
} as unknown as IRenderer

const mockAudio = {
  play: () => {},
  stop: () => {},
  stopAll: () => {},
  setPhase: () => {},
  setThreatLevel: () => {},
  setVolume: () => {},
  unlock: async () => {},
  isUnlocked: () => true,
} as unknown as IAudioProvider

describe('Signal Puzzle', () => {
  let engine: GameEngine
  let bus: EventBus
  let emitted: Array<{ type: string; payload: Record<string, unknown> }>

  beforeEach(() => {
    bus = new EventBus()
    emitted = []
    bus.on('puzzle.solved', (e) => emitted.push({ type: e.type, payload: e.payload }))
    bus.on('puzzle.failed', (e) => emitted.push({ type: e.type, payload: e.payload }))
    bus.on('insight.gained', (e) => emitted.push({ type: e.type, payload: e.payload }))
    engine = new GameEngine(bus, mockRenderer, mockAudio)
  })

  describe('Initial state', () => {
    it('starts with dials at [0, 0, 0]', () => {
      const { puzzleState } = engine.getState()
      expect(puzzleState.signalDials).toEqual([0, 0, 0])
    })

    it('starts unsolved', () => {
      expect(engine.getState().puzzleState.signalSolved).toBe(false)
    })
  })

  describe('puzzle.dial.set', () => {
    it('sets individual dial values', () => {
      engine.handleAction({ type: 'puzzle.dial.set', dialIndex: 0, value: 3 })
      engine.handleAction({ type: 'puzzle.dial.set', dialIndex: 1, value: 1 })
      engine.handleAction({ type: 'puzzle.dial.set', dialIndex: 2, value: 5 })
      expect(engine.getState().puzzleState.signalDials).toEqual([3, 1, 5])
    })

    it('clamps dial values to 0 at minimum', () => {
      engine.handleAction({ type: 'puzzle.dial.set', dialIndex: 0, value: -5 })
      expect(engine.getState().puzzleState.signalDials[0]).toBe(0)
    })

    it(`clamps dial values to ${SIGNAL_DIAL_MAX} at maximum`, () => {
      engine.handleAction({ type: 'puzzle.dial.set', dialIndex: 1, value: 99 })
      expect(engine.getState().puzzleState.signalDials[1]).toBe(SIGNAL_DIAL_MAX)
    })

    it('clamps boundary values exactly', () => {
      engine.handleAction({ type: 'puzzle.dial.set', dialIndex: 2, value: 0 })
      expect(engine.getState().puzzleState.signalDials[2]).toBe(0)
      engine.handleAction({ type: 'puzzle.dial.set', dialIndex: 2, value: SIGNAL_DIAL_MAX })
      expect(engine.getState().puzzleState.signalDials[2]).toBe(SIGNAL_DIAL_MAX)
    })

    it('ignores dial changes after puzzle is solved', () => {
      // Solve the puzzle first
      engine.handleAction({ type: 'puzzle.dial.set', dialIndex: 0, value: SIGNAL_SOLUTION[0] })
      engine.handleAction({ type: 'puzzle.dial.set', dialIndex: 1, value: SIGNAL_SOLUTION[1] })
      engine.handleAction({ type: 'puzzle.dial.set', dialIndex: 2, value: SIGNAL_SOLUTION[2] })
      engine.handleAction({ type: 'puzzle.signal.submit' })
      expect(engine.getState().puzzleState.signalSolved).toBe(true)

      // Attempt to change dial after solved
      engine.handleAction({ type: 'puzzle.dial.set', dialIndex: 0, value: 0 })
      expect(engine.getState().puzzleState.signalDials[0]).toBe(SIGNAL_SOLUTION[0])
    })
  })

  describe('puzzle.signal.submit — correct sequence', () => {
    beforeEach(() => {
      engine.handleAction({ type: 'puzzle.dial.set', dialIndex: 0, value: SIGNAL_SOLUTION[0] })
      engine.handleAction({ type: 'puzzle.dial.set', dialIndex: 1, value: SIGNAL_SOLUTION[1] })
      engine.handleAction({ type: 'puzzle.dial.set', dialIndex: 2, value: SIGNAL_SOLUTION[2] })
      engine.handleAction({ type: 'puzzle.signal.submit' })
    })

    it('marks puzzle as solved', () => {
      expect(engine.getState().puzzleState.signalSolved).toBe(true)
    })

    it('adds final_signal to sealedInsights', () => {
      expect(engine.getState().player.sealedInsights.has('final_signal')).toBe(true)
    })

    it('emits puzzle.solved event', () => {
      expect(emitted.some(e => e.type === 'puzzle.solved')).toBe(true)
    })

    it('emits insight.gained event', () => {
      expect(emitted.some(e => e.type === 'insight.gained')).toBe(true)
    })

    it('does not emit puzzle.failed', () => {
      expect(emitted.some(e => e.type === 'puzzle.failed')).toBe(false)
    })

    it('ignores subsequent submit calls once solved', () => {
      const solvedEmits = emitted.filter(e => e.type === 'puzzle.solved').length
      engine.handleAction({ type: 'puzzle.signal.submit' })
      expect(emitted.filter(e => e.type === 'puzzle.solved').length).toBe(solvedEmits)
    })
  })

  describe('puzzle.signal.submit — wrong sequence', () => {
    beforeEach(() => {
      // Use wrong dials (all zeros — not the solution)
      engine.handleAction({ type: 'puzzle.signal.submit' })
    })

    it('leaves puzzle unsolved', () => {
      expect(engine.getState().puzzleState.signalSolved).toBe(false)
    })

    it('does not add final_signal to sealedInsights', () => {
      expect(engine.getState().player.sealedInsights.has('final_signal')).toBe(false)
    })

    it('emits puzzle.failed event', () => {
      expect(emitted.some(e => e.type === 'puzzle.failed')).toBe(true)
    })

    it('does not emit puzzle.solved', () => {
      expect(emitted.some(e => e.type === 'puzzle.solved')).toBe(false)
    })
  })

  describe('puzzle.signal.submit — partial match', () => {
    it('fails when only some dials match', () => {
      engine.handleAction({ type: 'puzzle.dial.set', dialIndex: 0, value: SIGNAL_SOLUTION[0] })
      engine.handleAction({ type: 'puzzle.dial.set', dialIndex: 1, value: SIGNAL_SOLUTION[1] })
      // dialIndex 2 left at 0, not SIGNAL_SOLUTION[2]
      engine.handleAction({ type: 'puzzle.signal.submit' })
      expect(engine.getState().puzzleState.signalSolved).toBe(false)
      expect(emitted.some(e => e.type === 'puzzle.failed')).toBe(true)
    })
  })
})
