import type { LocationId } from '@/interfaces/index.js'
import type { IEventBus } from '@/interfaces/index.js'

/** All actions the player can take — UI translates input into these. */
export type GameAction =
  | { type: 'move'; target: LocationId }
  | { type: 'interact'; npcId: string }
  | { type: 'dialogue.choice'; choiceId: string }
  | { type: 'dialogue.close' }
  | { type: 'start.game' }
  | { type: 'pause.toggle' }
  | { type: 'panel.toggle'; panel: 'journal' | 'codex' | 'map' | 'settings' }
  | { type: 'panel.close' }
  | { type: 'insight.bank' }
  | { type: 'seal.insight'; cardId: string }
  | { type: 'save.now' }
  | { type: 'save.clear.confirmed' }
  | { type: 'light.lighthouse' }
  | { type: 'loop.dawn' }
  | { type: 'vision.continue' }
  | { type: 'dismiss.vision' }
  | { type: 'night.hide' }
  | { type: 'player.accept.death' }
  | { type: 'main.menu' }
  | { type: 'examine'; itemId: string; locationId: string }
  | { type: 'take'; itemId: string }
  | { type: 'search' }
  | { type: 'rest' }
  | { type: 'wait' }
  | { type: 'investigate' }
  | { type: 'ignore_encounter' }
  | { type: 'setting.volume'; key: 'masterVolume' | 'ambientVolume' | 'uiVolume' | 'narrativeVolume'; value: number }
  | { type: 'settings.difficulty'; value: 'easy' | 'normal' | 'hard' }
  | { type: 'save.clear' }
  | { type: 'new.game' }
  | { type: 'puzzle.dial.set'; dialIndex: 0 | 1 | 2; value: number }
  | { type: 'puzzle.signal.submit' }

export type ActionHandler = (action: GameAction) => void

/**
 * InputHandler — Translates raw DOM events into typed GameActions.
 *
 * Design: no state mutation here. Handler calls an onAction callback
 * that the GameEngine provides. Input targets are registered via
 * `registerButton()` so the renderer can wire up DOM elements.
 *
 * Keyboard shortcuts:
 *   Escape → dialogue.close / pause.toggle
 *   Space  → start.game (from title)
 */
export class InputHandler {
  private onAction: ActionHandler | null = null
  private readonly abortController = new AbortController()

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly eventBus: IEventBus,
  ) {}

  init(onAction: ActionHandler): void {
    this.onAction = onAction
    const { signal } = this.abortController

    // Canvas click → emit audio.unlock (first interaction unblocks Web Audio)
    this.canvas.addEventListener(
      'click',
      () => this.eventBus.emit('audio.unlock', {}),
      { signal, once: true },
    )
    this.canvas.addEventListener(
      'touchstart',
      () => this.eventBus.emit('audio.unlock', {}),
      { signal, once: true, passive: true },
    )

    // Keyboard shortcuts
    window.addEventListener('keydown', (e: KeyboardEvent) => this.handleKey(e), { signal })
  }

  dispose(): void {
    this.abortController.abort()
    this.onAction = null
  }

  /** Register a DOM element as a game action button. Returns cleanup fn. */
  registerButton(el: HTMLElement, action: GameAction): () => void {
    const handler = (e: Event) => {
      e.preventDefault()
      this.dispatch(action)
    }
    el.addEventListener('click', handler)
    return () => el.removeEventListener('click', handler)
  }

  /** Dispatch an action directly (used by renderer-drawn buttons via hit-test). */
  dispatch(action: GameAction): void {
    this.onAction?.(action)
  }

  private handleKey(e: KeyboardEvent): void {
    if (e.repeat) return
    // Any key dismisses an active vision sequence
    this.dispatch({ type: 'dismiss.vision' })
    switch (e.key) {
      case 'Escape':
        this.dispatch({ type: 'dialogue.close' })
        break
      case ' ':
      case 'Enter':
        this.dispatch({ type: 'start.game' })
        break
      case 'n':
      case 'N':
        this.dispatch({ type: 'new.game' })
        break
    }
  }
}
