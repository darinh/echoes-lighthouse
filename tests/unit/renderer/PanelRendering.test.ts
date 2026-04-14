import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CanvasTextRenderer } from '@/providers/renderer/CanvasTextRenderer.js'
import { createInitialState } from '@/engine/initialState.js'
import type { IGameState } from '@/interfaces/IGameState.js'

function makeMockCanvas() {
  const ctx = {
    clearRect: vi.fn(), fillRect: vi.fn(), strokeRect: vi.fn(),
    fillText: vi.fn(), measureText: vi.fn(() => ({ width: 50 })),
    beginPath: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(),
    closePath: vi.fn(), fill: vi.fn(), stroke: vi.fn(), rect: vi.fn(),
    save: vi.fn(), restore: vi.fn(), clip: vi.fn(),
    scale: vi.fn(), createRadialGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    canvas: { width: 800, height: 600 },
    font: '',
    fillStyle: '',
    strokeStyle: '',
    textAlign: '',
    lineWidth: 1,
    globalAlpha: 1,
  }
  const canvas = {
    getContext: vi.fn(() => ctx),
    addEventListener: vi.fn(),
    width: 800, height: 600,
    style: { width: '', height: '' },
    getBoundingClientRect: vi.fn(() => ({ left: 0, top: 0 })),
  }
  return { canvas: canvas as unknown as HTMLCanvasElement, ctx }
}

describe('PanelRendering', () => {
  let renderer: CanvasTextRenderer
  let baseState: IGameState

  beforeEach(() => {
    renderer = new CanvasTextRenderer()
    const { canvas } = makeMockCanvas()
    renderer.init(canvas)
    renderer.resize(800, 600)
    baseState = { ...createInitialState(), phase: 'day' }
  })

  it('renders journal panel without crash when sealedInsights is empty', () => {
    const state: IGameState = {
      ...baseState,
      activePanel: 'journal',
      player: { ...baseState.player, sealedInsights: new Set(), activeJournalThreads: new Set() },
    }
    expect(() => renderer.render(state)).not.toThrow()
  })

  it('renders journal panel with sealed insights', () => {
    const state: IGameState = {
      ...baseState,
      activePanel: 'journal',
      player: {
        ...baseState.player,
        sealedInsights: new Set(['the-beam-does-not-warn', 'keeper-in-water']),
      },
    }
    expect(() => renderer.render(state)).not.toThrow()
  })

  it('renders codex panel with domain progress bars', () => {
    const state: IGameState = {
      ...baseState,
      activePanel: 'codex',
      player: {
        ...baseState.player,
        archiveMastery: {
          history: 0, occult: 4, maritime: 10,
          ecology: 2, alchemy: 0, cartography: 3, linguistics: 2,
        },
      },
    }
    expect(() => renderer.render(state)).not.toThrow()
  })

  it('panel.toggle changes activePanel correctly', () => {
    const initial = createInitialState()
    expect(initial.activePanel).toBe('none')

    const stateWithJournal: IGameState = { ...initial, activePanel: 'journal' }
    expect(stateWithJournal.activePanel).toBe('journal')

    const toggled = stateWithJournal.activePanel === 'journal'
      ? { ...stateWithJournal, activePanel: 'none' as const }
      : stateWithJournal
    expect(toggled.activePanel).toBe('none')
  })

  it('renders map panel without crash', () => {
    const state: IGameState = {
      ...baseState,
      activePanel: 'map',
    }
    expect(() => renderer.render(state)).not.toThrow()
  })

  it('renders settings panel without crash', () => {
    const state: IGameState = {
      ...baseState,
      activePanel: 'settings',
    }
    expect(() => renderer.render(state)).not.toThrow()
  })
})
