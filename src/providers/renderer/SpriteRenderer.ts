import type { IRenderer, RenderContext } from '@/interfaces/index.js'
import type { IGameState } from '@/interfaces/index.js'

/**
 * SpriteRenderer — Stub for future sprite-based rendering.
 * Drop-in replacement for CanvasTextRenderer.
 * Sprites live in public/sprites/{sheet}.png with a JSON atlas.
 */
export class SpriteRenderer implements IRenderer {
  init(_canvas: HTMLCanvasElement): void {
    throw new Error('SpriteRenderer: not yet implemented')
  }
  render(_state: IGameState): void {
    throw new Error('SpriteRenderer: not yet implemented')
  }
  resize(_width: number, _height: number): void {
    throw new Error('SpriteRenderer: not yet implemented')
  }
  getContext(): RenderContext {
    throw new Error('SpriteRenderer: not yet implemented')
  }
}
