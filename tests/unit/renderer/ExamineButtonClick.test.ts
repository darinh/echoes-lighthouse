/**
 * Regression tests for Issue #98 — Old Journal examine button click coordinate mismatch.
 *
 * Root cause: UIManager.setHtml() replaced innerHTML without preserving scrollTop.
 * When #content-panel was scrolled (e.g. button at DOM y=641 visible at viewport y=157
 * because scrollTop=484), any state-driven HTML update reset scrollTop to 0, causing
 * subsequent clicks at viewport y=157 to miss the button that had jumped back to y=641.
 *
 * Fix: save/restore scrollTop in setHtml() before/after the innerHTML assignment.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { UIManager } from '@/providers/ui/UIManager.js'
import { createInitialState } from '@/engine/initialState.js'
import type { IGameState } from '@/interfaces/IGameState.js'
import type { GameAction } from '@/engine/InputHandler.js'

function makeContainer(): HTMLElement {
  document.body.innerHTML = `
    <div id="game-container">
      <canvas id="game-canvas"></canvas>
      <div id="game-ui">
        <div id="hud"></div>
        <div id="main-area">
          <div id="content-panel" style="height:400px;overflow-y:auto;"></div>
          <div id="action-panel"></div>
        </div>
        <div id="overlay-panel" class="hidden"></div>
        <div id="notifications"></div>
      </div>
    </div>
  `
  return document.body
}

describe('UIManager — examine button dispatch (issue #98)', () => {
  let ui: UIManager
  let container: HTMLElement
  let dispatched: GameAction[]

  beforeEach(() => {
    container = makeContainer()
    dispatched = []
    ui = new UIManager()
    ui.init(container)
    ui.setActionHandler(action => dispatched.push(action))
  })

  it('dispatches examine action when data-action button is clicked', () => {
    const state: IGameState = {
      ...createInitialState(),
      phase: 'morning',
      activePanel: 'none',
      player: {
        ...createInitialState().player,
        currentLocation: 'keepers_cottage',
      },
    }
    ui.update(state)

    const btn = container.querySelector<HTMLElement>(
      '[data-action*="examine"][data-action*="old_journal"]',
    )
    expect(btn).not.toBeNull()

    btn!.click()
    expect(dispatched).toHaveLength(1)
    expect(dispatched[0]).toMatchObject({ type: 'examine', itemId: 'old_journal' })
  })

  it('preserves #content-panel scrollTop across HTML updates (scroll-reset regression)', () => {
    const baseState: IGameState = {
      ...createInitialState(),
      phase: 'morning',
      activePanel: 'none',
      player: {
        ...createInitialState().player,
        currentLocation: 'keepers_cottage',
      },
    }

    ui.update(baseState)

    const contentPanel = container.querySelector<HTMLElement>('#content-panel')!
    // Simulate the user having scrolled the panel down
    contentPanel.scrollTop = 200

    // Trigger another update that changes the HTML (e.g. after an examine flag is set).
    // This used to reset scrollTop to 0 via the innerHTML assignment.
    const updatedState: IGameState = {
      ...baseState,
      worldFlags: new Set(['examined.keepers_cottage.mechanism_diagram']),
    }
    ui.update(updatedState)

    // scrollTop must be preserved so button positions stay consistent with clicks
    expect(contentPanel.scrollTop).toBe(200)
  })

  it('does NOT dispatch when click originates outside #game-ui', () => {
    const state: IGameState = {
      ...createInitialState(),
      phase: 'morning',
      activePanel: 'none',
      player: {
        ...createInitialState().player,
        currentLocation: 'keepers_cottage',
      },
    }
    ui.update(state)

    // Manufacture a button outside #game-ui (simulates a canvas-level synthetic click)
    const outsideBtn = document.createElement('button')
    outsideBtn.dataset['action'] = JSON.stringify({ type: 'examine', itemId: 'fake', locationId: 'nowhere' })
    document.body.appendChild(outsideBtn)

    outsideBtn.click()

    // Should not have been dispatched — button is outside #game-ui
    expect(dispatched).toHaveLength(0)

    document.body.removeChild(outsideBtn)
  })
})
