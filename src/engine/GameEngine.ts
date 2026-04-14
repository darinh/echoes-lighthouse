import type { IGameState } from '@/interfaces/index.js'
import type { ISystem } from '@/interfaces/index.js'
import type { IEventBus } from '@/interfaces/index.js'
import type { IAudioProvider } from '@/interfaces/index.js'
import type { IRenderer } from '@/interfaces/index.js'
import { createInitialState } from './initialState.js'

/**
 * GameEngine — Coordinates all systems, the renderer, and the audio provider.
 * Owns the game state and is the single point of state mutation.
 */
export class GameEngine {
  private state: IGameState
  private readonly systems: ISystem[] = []
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

  async start(canvas: HTMLCanvasElement): Promise<void> {
    this.renderer.init(canvas)

    // Initialise all systems
    for (const system of this.systems) {
      this.state = system.init(this.state)
    }

    // Wire resize
    window.addEventListener('resize', () => {
      this.renderer.resize(window.innerWidth, window.innerHeight)
      this.eventBus.emit('renderer.resized', { width: window.innerWidth, height: window.innerHeight })
    })
    this.renderer.resize(window.innerWidth, window.innerHeight)

    this.running = true
    this.lastFrameTime = performance.now()
    requestAnimationFrame(t => this.loop(t))
  }

  stop(): void {
    this.running = false
  }

  /** Advance the game by one player turn. Called by the input handler. */
  tick(): void {
    for (const system of this.systems) {
      this.state = system.update(this.state, 0)
    }
  }

  getState(): IGameState {
    return this.state
  }

  private loop(timestamp: number): void {
    if (!this.running) return
    const deltaMs = timestamp - this.lastFrameTime
    this.lastFrameTime = timestamp
    this.renderer.render(this.state)
    // Continuous updates (animations, ambient, timers) — not the turn system
    for (const system of this.systems) {
      this.state = system.update(this.state, deltaMs)
    }
    requestAnimationFrame(t => this.loop(t))
  }
}
