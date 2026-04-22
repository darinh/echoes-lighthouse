/**
 * TitleScreen.test.ts
 * Tests for:
 *   - SaveSystem.hasSaveWithProgress() — CONTINUE button visibility logic
 *   - GameEngine handling of game.new, game.continue, game.title, audio.toggle
 *   - UIManager title-screen rendering (phase === 'title')
 *   - Settings panel: audio toggle, difficulty selector
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { UIManager } from '@/providers/ui/UIManager.js'
import { GameEngine } from '@/engine/GameEngine.js'
import { EventBus } from '@/engine/EventBus.js'
import { SaveSystem } from '@/systems/SaveSystem.js'
import { createInitialState } from '@/engine/initialState.js'
import type { IGameState } from '@/interfaces/IGameState.js'
import type { IAudioProvider, IRenderer } from '@/interfaces/index.js'

// ─── localStorage mock ────────────────────────────────────────────────────────
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem:    vi.fn((key: string) => store[key] ?? null),
    setItem:    vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: () => { store = {} },
  }
})()
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true })

// ─── Minimal renderer / audio stubs ──────────────────────────────────────────
const stubRenderer = {
  init: vi.fn(),
  resize: vi.fn(),
  render: vi.fn(),
  getContext: () => ({
    canvas: document.createElement('canvas'),
    ctx: {} as CanvasRenderingContext2D,
    width: 0, height: 0, scale: 1,
  }),
} as unknown as IRenderer

const stubAudio = {
  play:           vi.fn(),
  stop:           vi.fn(),
  stopAll:        vi.fn(),
  setPhase:       vi.fn(),
  setThreatLevel: vi.fn(),
  setVolume:      vi.fn(),
  unlock:         vi.fn().mockResolvedValue(undefined),
  isUnlocked:     vi.fn().mockReturnValue(true),
} as unknown as IAudioProvider

// ─── UIManager DOM fixture ────────────────────────────────────────────────────
function makeContainer(): HTMLElement {
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
  return document.body
}

// ─────────────────────────────────────────────────────────────────────────────
// SaveSystem.hasSaveWithProgress
// ─────────────────────────────────────────────────────────────────────────────
describe('SaveSystem.hasSaveWithProgress', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('returns false when no save exists', () => {
    expect(SaveSystem.hasSaveWithProgress()).toBe(false)
  })

  it('returns false for a fresh save (loopCount=0, no discovered locations)', () => {
    const state = createInitialState()
    SaveSystem.saveState(state)
    // createInitialState has loopCount=0 and empty discoveredLocations
    expect(SaveSystem.hasSaveWithProgress()).toBe(false)
  })

  it('returns true when loopCount >= 1', () => {
    const state: IGameState = {
      ...createInitialState(),
      player: { ...createInitialState().player, loopCount: 1 },
    }
    SaveSystem.saveState(state)
    expect(SaveSystem.hasSaveWithProgress()).toBe(true)
  })

  it('returns true when player has discovered locations (even loopCount=0)', () => {
    const state: IGameState = {
      ...createInitialState(),
      player: {
        ...createInitialState().player,
        loopCount: 0,
        // More than just keepers_cottage (the starting location)
        discoveredLocations: new Set(['keepers_cottage', 'harbor']),
      },
    }
    SaveSystem.saveState(state)
    expect(SaveSystem.hasSaveWithProgress()).toBe(true)
  })

  it('returns false for a corrupt save', () => {
    localStorageMock.setItem('echoes-lighthouse-save', '{bad json}')
    expect(SaveSystem.hasSaveWithProgress()).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// GameEngine — title screen actions
// ─────────────────────────────────────────────────────────────────────────────
describe('GameEngine — title screen actions', () => {
  let engine: GameEngine

  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
    const bus = new EventBus()
    engine = new GameEngine(bus, stubRenderer, stubAudio)
  })

  describe('game.new', () => {
    it('sets phase to dawn', () => {
      engine.handleAction({ type: 'game.new' })
      expect(engine.getState().phase).toBe('dawn')
    })

    it('clears the save', () => {
      const state: IGameState = {
        ...createInitialState(),
        player: { ...createInitialState().player, loopCount: 5 },
      }
      SaveSystem.saveState(state)
      engine.handleAction({ type: 'game.new' })
      expect(SaveSystem.hasSave()).toBe(false)
    })

    it('preserves endingsSeen from previous state', () => {
      engine.loadState({
        ...engine.getState(),
        endingsSeen: new Set(['light_restored']) as IGameState['endingsSeen'],
      })
      engine.handleAction({ type: 'game.new' })
      expect(engine.getState().endingsSeen.has('light_restored')).toBe(true)
    })

    it('preserves current difficulty', () => {
      engine.loadState({ ...engine.getState(), difficulty: 'hard' })
      engine.handleAction({ type: 'game.new' })
      expect(engine.getState().difficulty).toBe('hard')
    })

    it('sets loopCount to 1', () => {
      engine.handleAction({ type: 'game.new' })
      expect(engine.getState().player.loopCount).toBe(1)
    })
  })

  describe('game.continue', () => {
    it('loads the saved state', () => {
      const savedState: IGameState = {
        ...createInitialState(),
        player: { ...createInitialState().player, loopCount: 3, insightBanked: 42 },
      }
      SaveSystem.saveState(savedState)
      engine.handleAction({ type: 'game.continue' })
      expect(engine.getState().player.insightBanked).toBe(42)
    })

    it('falls back to new game when no save exists', () => {
      engine.handleAction({ type: 'game.continue' })
      expect(engine.getState().phase).toBe('dawn')
    })

    it('does not crash when save is present', () => {
      const s = createInitialState()
      SaveSystem.saveState(s)
      expect(() => engine.handleAction({ type: 'game.continue' })).not.toThrow()
    })
  })

  describe('game.title', () => {
    it('sets phase to title', () => {
      engine.loadState({ ...engine.getState(), phase: 'ending' })
      engine.handleAction({ type: 'game.title' })
      expect(engine.getState().phase).toBe('title')
    })

    it('can be called from dawn phase', () => {
      engine.loadState({ ...engine.getState(), phase: 'dawn' })
      engine.handleAction({ type: 'game.title' })
      expect(engine.getState().phase).toBe('title')
    })
  })

  describe('audio.toggle', () => {
    it('toggles audioMuted from false to true', () => {
      engine.loadState({ ...engine.getState(), audioMuted: false })
      engine.handleAction({ type: 'audio.toggle' })
      expect(engine.getState().audioMuted).toBe(true)
    })

    it('toggles audioMuted from true to false', () => {
      engine.loadState({ ...engine.getState(), audioMuted: true })
      engine.handleAction({ type: 'audio.toggle' })
      expect(engine.getState().audioMuted).toBe(false)
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// UIManager — title screen rendering
// ─────────────────────────────────────────────────────────────────────────────
describe('UIManager — title screen rendering', () => {
  let ui: UIManager

  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
    const container = makeContainer()
    ui = new UIManager()
    ui.init(container)
  })

  function titleState(overrides: Partial<IGameState> = {}): IGameState {
    return { ...createInitialState(), phase: 'title', ...overrides }
  }

  it('renders without throwing for phase=title', () => {
    expect(() => ui.update(titleState())).not.toThrow()
  })

  it('renders the game title text', () => {
    ui.update(titleState())
    expect(document.body.innerHTML).toContain('ECHOES OF THE LIGHTHOUSE')
  })

  it('always renders the New Game button', () => {
    ui.update(titleState())
    expect(document.body.innerHTML).toContain('game.new')
  })

  it('does NOT render Continue when no save with progress exists', () => {
    ui.update(titleState())
    expect(document.body.innerHTML).not.toContain('game.continue')
  })

  it('renders Continue when a save with progress exists', () => {
    const progressState: IGameState = {
      ...createInitialState(),
      player: { ...createInitialState().player, loopCount: 1 },
    }
    SaveSystem.saveState(progressState)

    ui.update(titleState())
    expect(document.body.innerHTML).toContain('game.continue')
  })

  it('always renders the Settings button', () => {
    ui.update(titleState())
    expect(document.body.innerHTML).toContain('title.settings.open')
  })

  it('sets game-ui class to title-screen during title phase', () => {
    ui.update(titleState())
    const gameUi = document.querySelector('#game-ui')
    expect(gameUi?.className).toBe('title-screen')
  })

  it('renders version badge element', () => {
    ui.update(titleState())
    expect(document.querySelector('.title-version')).not.toBeNull()
  })

  describe('settings sub-panel', () => {
    it('opens settings panel when title.settings.open is clicked', () => {
      ui.update(titleState())
      const btn = document.querySelector('[data-action*="title.settings.open"]') as HTMLElement
      expect(btn).not.toBeNull()
      btn.click()
      // Simulate the next game-loop tick — click sets _titleShowSettings=true,
      // update() renders the settings panel.
      ui.update(titleState())
      expect(document.body.innerHTML).toContain('title.settings.close')
    })

    it('shows audio toggle in settings', () => {
      ui.update(titleState())
      const btn = document.querySelector('[data-action*="title.settings.open"]') as HTMLElement
      btn?.click()
      ui.update(titleState())
      expect(document.body.innerHTML).toContain('audio.toggle')
    })

    it('shows difficulty selector in settings', () => {
      ui.update(titleState())
      const btn = document.querySelector('[data-action*="title.settings.open"]') as HTMLElement
      btn?.click()
      ui.update(titleState())
      expect(document.body.innerHTML).toContain('settings.difficulty')
    })

    it('closes settings and returns to main menu', () => {
      ui.update(titleState())
      const openBtn = document.querySelector('[data-action*="title.settings.open"]') as HTMLElement
      openBtn?.click()
      ui.update(titleState()) // tick: open settings
      const closeBtn = document.querySelector('[data-action*="title.settings.close"]') as HTMLElement
      expect(closeBtn).not.toBeNull()
      closeBtn?.click()
      ui.update(titleState()) // tick: close settings
      expect(document.body.innerHTML).toContain('game.new')
    })

    it('reflects audioMuted=true in audio toggle class', () => {
      ui.update(titleState({ audioMuted: true }))
      const settingsBtn = document.querySelector('[data-action*="title.settings.open"]') as HTMLElement
      settingsBtn?.click()
      ui.update(titleState({ audioMuted: true })) // tick: open settings with muted state
      const toggleBtn = document.querySelector('[data-action*="audio.toggle"]') as HTMLElement
      expect(toggleBtn?.className).toContain('off')
    })

    it('marks the active difficulty button (normal is default)', () => {
      ui.update(titleState())
      const settingsBtn = document.querySelector('[data-action*="title.settings.open"]') as HTMLElement
      settingsBtn?.click()
      ui.update(titleState()) // tick: open settings
      const activeBtn = document.querySelector('.title-diff-btn.active') as HTMLElement
      expect(activeBtn).not.toBeNull()
    })
  })
})
