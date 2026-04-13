import type { IGameState } from './IGameState.js'

export interface RenderContext {
  readonly canvas: HTMLCanvasElement
  readonly ctx: CanvasRenderingContext2D
  readonly width: number
  readonly height: number
  readonly scale: number   // device pixel ratio
}

// ─────────────────────────────────────────────────────────────────────────────
// IRenderer — Stable contract for all rendering implementations.
//
// Current implementation: CanvasTextRenderer (Canvas 2D, typography-first)
// Future implementation:  SpriteRenderer     (Canvas 2D with sprite sheets)
//
// The engine calls this interface only. Swap renderers in config.ts.
// ─────────────────────────────────────────────────────────────────────────────

export interface IRenderer {
  /** Attach renderer to a canvas element. Must be called before render(). */
  init(canvas: HTMLCanvasElement): void

  /** Full render pass. Called once per animation frame. */
  render(state: IGameState): void

  /** Handle canvas resize (window resize, orientation change). */
  resize(width: number, height: number): void

  /** Expose raw context for UI panels that need direct canvas access. */
  getContext(): RenderContext
}
