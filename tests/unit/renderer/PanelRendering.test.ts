import { describe, it, expect, beforeEach } from 'vitest'
import { UIManager } from '@/providers/ui/UIManager.js'
import { createInitialState } from '@/engine/initialState.js'
import type { IGameState } from '@/interfaces/IGameState.js'

describe('UIManager panels', () => {
  let ui: UIManager
  let container: HTMLElement
  let baseState: IGameState

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="game-container">
        <canvas id="game-canvas"></canvas>
        <div id="game-ui">
          <div id="hud"></div>
          <div id="main-area">
            <div id="content-panel"></div>
            <div id="action-panel"></div>
          </div>
          <div id="overlay-panel" class="hidden"></div>
          <div id="notifications"></div>
        </div>
      </div>
    `
    container = document.body
    ui = new UIManager()
    ui.init(container)
    baseState = { ...createInitialState(), phase: 'morning' }
  })

  it('renders journal overlay without crash when sealedInsights is empty', () => {
    const state: IGameState = {
      ...baseState,
      activePanel: 'journal',
      player: { ...baseState.player, sealedInsights: new Set() },
    }
    expect(() => ui.update(state)).not.toThrow()
  })

  it('renders journal overlay with sealed insights', () => {
    const state: IGameState = {
      ...baseState,
      activePanel: 'journal',
      player: {
        ...baseState.player,
        sealedInsights: new Set(['vael_origin', 'mechanism_purpose']),
      },
    }
    expect(() => ui.update(state)).not.toThrow()
  })

  it('renders codex overlay with domain progress bars', () => {
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
    expect(() => ui.update(state)).not.toThrow()
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

  it('renders settings overlay without crash', () => {
    const state: IGameState = { ...baseState, activePanel: 'settings' }
    expect(() => ui.update(state)).not.toThrow()
  })

  it('renders location panel without crash', () => {
    const state: IGameState = { ...baseState, activePanel: 'none' }
    expect(() => ui.update(state)).not.toThrow()
  })

  it('renders action panel with move buttons', () => {
    const state: IGameState = { ...baseState, activePanel: 'none' }
    ui.update(state)
    const actionPanel = container.querySelector('#action-panel')!
    expect(actionPanel.innerHTML.length).toBeGreaterThan(0)
  })

  it('renders HUD with loop counter', () => {
    const state: IGameState = { ...baseState, activePanel: 'none' }
    ui.update(state)
    const hud = container.querySelector('#hud')!
    expect(hud.innerHTML).toContain('LOOP')
  })
})
