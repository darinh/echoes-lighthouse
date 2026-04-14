import type { IGameState } from '@/interfaces/index.js'
import type { ISystem, IEventBus, IAudioProvider, IRenderer } from '@/interfaces/index.js'
import type { GameAction } from './InputHandler.js'
import { createInitialState } from './initialState.js'
import { MovementSystem } from '@/world/MovementSystem.js'

/**
 * GameEngine — Owns game state, coordinates systems, drives the render loop.
 * All state changes flow through here: events from systems are applied each
 * frame, and player actions (from InputHandler) are handled synchronously.
 */
export class GameEngine {
  private state: IGameState
  private readonly systems: ISystem[] = []
  private movement!: MovementSystem
  private running = false
  private lastFrameTime = 0

  constructor(
    private readonly eventBus: IEventBus,
    private readonly renderer: IRenderer,
    private readonly _audio: IAudioProvider,
  ) {
    this.state = createInitialState()
  }

  registerSystem(system: ISystem): void {
    this.systems.push(system)
  }

  setMovementSystem(movement: MovementSystem): void {
    this.movement = movement
  }

  async start(canvas: HTMLCanvasElement): Promise<void> {
    this.renderer.init(canvas)

    for (const system of this.systems) {
      this.state = system.init(this.state)
    }

    window.addEventListener('resize', () => {
      this.renderer.resize(window.innerWidth, window.innerHeight)
      this.eventBus.emit('renderer.resized', { width: window.innerWidth, height: window.innerHeight })
    })
    this.renderer.resize(window.innerWidth, window.innerHeight)

    // Wire up event bus → state updates from events
    this.eventBus.on('audio.unlock', () => {
      this._audio.unlock()
    })

    this.running = true
    this.lastFrameTime = performance.now()
    requestAnimationFrame(t => this.loop(t))
  }

  stop(): void {
    this.running = false
  }

  getState(): IGameState {
    return this.state
  }

  loadState(state: IGameState): void {
    this.state = state
  }

  /**
   * Handle a player action. Actions come from InputHandler (keyboard/click)
   * or from rendered canvas hit-regions.
   */
  handleAction(action: GameAction): void {
    switch (action.type) {
      case 'start.game':
        if (this.state.phase === 'title' || this.state.phase === 'ending') {
          this.eventBus.emit('loop.started', { loopCount: this.state.player.loopCount })
          // Transition to dawn — LoopSystem handles loop reset on death,
          // but start.game from title just advances to the play state.
          if (this.state.phase === 'title') {
            this.state = { ...this.state, phase: 'dawn' }
          } else {
            // From ending: emit player.died so LoopSystem handles full reset
            this.applyEvent('player.died', {})
            this.eventBus.emit('player.died', {})
          }
        }
        break

      case 'move':
        if (this.movement) {
          this.state = this.movement.moveTo(this.state, action.target)
        }
        break

      case 'interact':
        this.applyEvent('dialogue.start', { npcId: action.npcId })
        this.eventBus.emit('dialogue.start', { npcId: action.npcId })
        break

      case 'dialogue.choice':
        this.applyEvent('dialogue.choice.selected', { choiceId: action.choiceId })
        this.eventBus.emit('dialogue.choice.selected', { choiceId: action.choiceId })
        break

      case 'dialogue.close':
        this.applyEvent('dialogue.close', {})
        this.eventBus.emit('dialogue.close', {})
        break

      case 'pause.toggle':
        this.state = { ...this.state, isPaused: !this.state.isPaused }
        break
    }
  }

  /** Apply an event to all systems and accumulate state changes. */
  private applyEvent(type: import('@/interfaces/index.js').GameEventType, payload: Record<string, unknown>): void {
    const event = { type, payload, timestamp: Date.now() }
    for (const system of this.systems) {
      this.state = system.onEvent(event, this.state)
    }
  }

  private loop(timestamp: number): void {
    if (!this.running) return
    const deltaMs = Math.min(timestamp - this.lastFrameTime, 100) // cap at 100ms
    this.lastFrameTime = timestamp

    // Update all systems (timer drain, etc.)
    for (const system of this.systems) {
      this.state = system.update(this.state, deltaMs)
    }

    this.renderer.render(this.state)
    requestAnimationFrame(t => this.loop(t))
  }
}
