import { beforeEach, describe, expect, it } from 'vitest'
import { GameEngine } from '@/engine/GameEngine.js'
import { EventBus } from '@/engine/EventBus.js'
import { UIManager } from '@/providers/ui/UIManager.js'
import { createInitialState } from '@/engine/initialState.js'
import type { IAudioProvider, IRenderer } from '@/interfaces/index.js'

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

describe('Location secrets', () => {
  let engine: GameEngine

  beforeEach(() => {
    engine = new GameEngine(new EventBus(), mockRenderer, mockAudio)
  })

  it('increments location examine history', () => {
    engine.handleAction({ type: 'examine', locationId: 'keepers_cottage', itemId: 'old_journal' })
    expect(engine.getState().player.examineHistory.keepers_cottage).toBe(1)
  })

  it('reveals secret when threshold is reached', () => {
    engine.handleAction({ type: 'examine', locationId: 'keepers_cottage', itemId: 'old_journal' })
    engine.handleAction({ type: 'examine', locationId: 'keepers_cottage', itemId: 'old_journal' })
    engine.handleAction({ type: 'examine', locationId: 'keepers_cottage', itemId: 'old_journal' })
    const state = engine.getState()
    expect(state.lastExaminedKey).toBe('secret.keepers_cottage')
    expect(state.worldFlags.has('secret.keepers_cottage_seen')).toBe(true)
  })

  it('sets configured world flag when a secret is revealed', () => {
    engine.handleAction({ type: 'examine', locationId: 'lighthouse_top', itemId: 'lens_inscription' })
    engine.handleAction({ type: 'examine', locationId: 'lighthouse_top', itemId: 'lens_inscription' })
    engine.handleAction({ type: 'examine', locationId: 'lighthouse_top', itemId: 'lens_inscription' })
    const state = engine.getState()
    expect(state.lastExaminedKey).toBe('secret.lighthouse_lantern')
    expect(state.worldFlags.has('secret.lighthouse_lantern_seen')).toBe(true)
    expect(state.worldFlags.has('secret.lens_frequency')).toBe(true)
  })

  it('does not retrigger secret text after first reveal', () => {
    engine.handleAction({ type: 'examine', locationId: 'keepers_cottage', itemId: 'old_journal' })
    engine.handleAction({ type: 'examine', locationId: 'keepers_cottage', itemId: 'old_journal' })
    engine.handleAction({ type: 'examine', locationId: 'keepers_cottage', itemId: 'old_journal' })
    engine.handleAction({ type: 'examine', locationId: 'keepers_cottage', itemId: 'old_journal' })
    const state = engine.getState()
    expect(state.lastExaminedKey).toBe('examine.keepers_cottage.old_journal.text')
    expect(state.worldFlags.has('secret.keepers_cottage_seen')).toBe(true)
  })

  it('does not grant repeat insight after the first item examine', () => {
    engine.handleAction({ type: 'examine', locationId: 'keepers_cottage', itemId: 'old_journal' })
    const firstInsight = engine.getState().player.insight
    engine.handleAction({ type: 'examine', locationId: 'keepers_cottage', itemId: 'old_journal' })
    expect(engine.getState().player.insight).toBe(firstInsight)
  })

  it('shows and clears the UI secret indicator based on count and seen state', () => {
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
    const ui = new UIManager()
    ui.init(document.body)
    const base = createInitialState()
    const withHint = {
      ...base,
      phase: 'morning' as const,
      player: {
        ...base.player,
        examineHistory: { ...base.player.examineHistory, keepers_cottage: 2 },
      },
    }
    ui.update(withHint)
    expect(document.querySelector('#content-panel')?.textContent).toContain('◈')

    const withSeen = {
      ...withHint,
      worldFlags: new Set([...withHint.worldFlags, 'secret.keepers_cottage_seen']),
    }
    ui.update(withSeen)
    expect(document.querySelector('#content-panel')?.textContent).not.toContain('Old Journal ◈')
  })
})
