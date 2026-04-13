import type { IRenderer, RenderContext } from '@/interfaces/index.js'
import type { IGameState } from '@/interfaces/index.js'

/**
 * CanvasTextRenderer — Typography-first Canvas 2D renderer.
 * No sprites, no image assets. All visuals are Canvas 2D primitives + text.
 * See docs/gdd/09-art-direction.md for full visual specifications.
 */
export class CanvasTextRenderer implements IRenderer {
  private canvas!: HTMLCanvasElement
  private ctx!: CanvasRenderingContext2D
  private width = 0
  private height = 0
  private scale = 1

  init(canvas: HTMLCanvasElement): void {
    this.canvas = canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('CanvasTextRenderer: failed to get 2D context')
    this.ctx = ctx
    this.scale = window.devicePixelRatio || 1
  }

  resize(width: number, height: number): void {
    this.width = width
    this.height = height
    this.canvas.width = width * this.scale
    this.canvas.height = height * this.scale
    this.canvas.style.width = `${width}px`
    this.canvas.style.height = `${height}px`
    this.ctx.scale(this.scale, this.scale)
  }

  render(state: IGameState): void {
    const { ctx, width, height } = this
    ctx.clearRect(0, 0, width, height)

    // Background
    ctx.fillStyle = '#0a0a0f'
    ctx.fillRect(0, 0, width, height)

    switch (state.phase) {
      case 'title':  this.renderTitle(state); break
      case 'dawn':
      case 'day':
      case 'dusk':   this.renderDay(state);   break
      case 'night_safe':
      case 'night_dark': this.renderNight(state); break
      case 'vision': this.renderVision(state); break
      case 'ending': this.renderEnding(state); break
    }
  }

  getContext(): RenderContext {
    return { canvas: this.canvas, ctx: this.ctx, width: this.width, height: this.height, scale: this.scale }
  }

  private renderTitle(_state: IGameState): void {
    const { ctx, width, height } = this
    ctx.fillStyle = '#4488cc'
    ctx.font = 'bold 24px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('ECHOES OF THE LIGHTHOUSE', width / 2, height / 2 - 20)
    ctx.fillStyle = '#556677'
    ctx.font = '12px monospace'
    ctx.fillText('click anywhere to begin', width / 2, height / 2 + 20)
  }

  private renderDay(_state: IGameState): void {
    // TODO: full day-phase layout per art-direction.md
    this.renderPlaceholder('DAY PHASE')
  }

  private renderNight(_state: IGameState): void {
    this.renderPlaceholder('NIGHT PHASE')
  }

  private renderVision(_state: IGameState): void {
    this.renderPlaceholder('VISION SEQUENCE')
  }

  private renderEnding(_state: IGameState): void {
    this.renderPlaceholder('ENDING')
  }

  private renderPlaceholder(label: string): void {
    const { ctx, width, height } = this
    ctx.fillStyle = '#334455'
    ctx.font = '14px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(`[ ${label} — renderer stub ]`, width / 2, height / 2)
  }
}
