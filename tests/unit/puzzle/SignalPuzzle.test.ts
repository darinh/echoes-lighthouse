import { describe, it, expect, beforeEach } from 'vitest'
import { createInitialState } from '@/engine/initialState.js'
import type { IGameState } from '@/interfaces/IGameState.js'

// We test the puzzle logic directly (same logic as GameEngine cases)
import { SIGNAL_SOLUTION, SIGNAL_DIAL_MAX } from '@/data/puzzle/signalPuzzle.js'

function applyDialSet(state: IGameState, dialIndex: number, value: number): IGameState {
  if (state.puzzleState.signalSolved) return state
  const dials = [...state.puzzleState.signalDials] as [number, number, number]
  dials[dialIndex] = Math.max(0, Math.min(SIGNAL_DIAL_MAX, value))
  return { ...state, puzzleState: { ...state.puzzleState, signalDials: dials } }
}

function applySubmit(state: IGameState): { state: IGameState; correct: boolean } {
  if (state.puzzleState.signalSolved) return { state, correct: false }
  const correct = state.puzzleState.signalDials.every((v, i) => v === SIGNAL_SOLUTION[i])
  if (correct) {
    const newSealed = new Set(state.player.sealedInsights)
    newSealed.add('final_signal')
    return {
      state: {
        ...state,
        puzzleState: { ...state.puzzleState, signalSolved: true },
        player: { ...state.player, sealedInsights: newSealed },
      },
      correct: true,
    }
  }
  return { state, correct: false }
}

describe('Signal Puzzle', () => {
  let state: IGameState

  beforeEach(() => {
    state = createInitialState()
  })

  it('initial state has dials [0,0,0] and not solved', () => {
    expect(state.puzzleState.signalDials).toEqual([0, 0, 0])
    expect(state.puzzleState.signalSolved).toBe(false)
  })

  it('sets individual dial values', () => {
    state = applyDialSet(state, 0, 3)
    expect(state.puzzleState.signalDials[0]).toBe(3)
    state = applyDialSet(state, 1, 1)
    expect(state.puzzleState.signalDials[1]).toBe(1)
    state = applyDialSet(state, 2, 5)
    expect(state.puzzleState.signalDials[2]).toBe(5)
  })

  it('clamps dial value to 0', () => {
    state = applyDialSet(state, 0, -5)
    expect(state.puzzleState.signalDials[0]).toBe(0)
  })

  it('clamps dial value to SIGNAL_DIAL_MAX (7)', () => {
    state = applyDialSet(state, 1, 99)
    expect(state.puzzleState.signalDials[1]).toBe(SIGNAL_DIAL_MAX)
  })

  it('wrong sequence does not solve the puzzle', () => {
    state = applyDialSet(state, 0, 1)
    state = applyDialSet(state, 1, 2)
    state = applyDialSet(state, 2, 3)
    const { state: newState, correct } = applySubmit(state)
    expect(correct).toBe(false)
    expect(newState.puzzleState.signalSolved).toBe(false)
    expect(newState.player.sealedInsights.has('final_signal')).toBe(false)
  })

  it('correct sequence [3,1,5] solves the puzzle and grants final_signal insight', () => {
    state = applyDialSet(state, 0, SIGNAL_SOLUTION[0])
    state = applyDialSet(state, 1, SIGNAL_SOLUTION[1])
    state = applyDialSet(state, 2, SIGNAL_SOLUTION[2])
    const { state: newState, correct } = applySubmit(state)
    expect(correct).toBe(true)
    expect(newState.puzzleState.signalSolved).toBe(true)
    expect(newState.player.sealedInsights.has('final_signal')).toBe(true)
  })

  it('actions are ignored after puzzle is solved', () => {
    // Solve first
    state = applyDialSet(state, 0, SIGNAL_SOLUTION[0])
    state = applyDialSet(state, 1, SIGNAL_SOLUTION[1])
    state = applyDialSet(state, 2, SIGNAL_SOLUTION[2])
    const { state: solved } = applySubmit(state)
    // Try to change a dial after solve
    const afterAttempt = applyDialSet(solved, 0, 0)
    expect(afterAttempt.puzzleState.signalDials[0]).toBe(SIGNAL_SOLUTION[0])
  })

  it('SIGNAL_SOLUTION is [3, 1, 5]', () => {
    expect(SIGNAL_SOLUTION).toEqual([3, 1, 5])
  })
})
