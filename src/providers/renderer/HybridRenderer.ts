import type { IRenderer, RenderContext } from '@/interfaces/index.js'
import type { IGameState } from '@/interfaces/index.js'
import { CanvasRenderer } from './CanvasRenderer.js'
import { UIManager } from '../ui/UIManager.js'

export class HybridRenderer implements IRenderer {
  constructor(
    private readonly canvasRenderer: CanvasRenderer,
    private readonly ui: UIManager,
  ) {}

  init(canvasEl: HTMLCanvasElement): void {
    this.canvasRenderer.init(canvasEl)
    this.ui.init(document.body)
    this.ui.setMapDrawCallback((mapCanvas, state) => {
      this.canvasRenderer.drawMap(mapCanvas, state)
    })
  }

  render(state: IGameState): void {
    this.canvasRenderer.render(state)
    this.ui.update(state)
  }

  resize(width: number, height: number): void {
    this.canvasRenderer.resize(width, height)
  }

  getContext(): RenderContext {
    return this.canvasRenderer.getContext()
  }
}
