import type { IRenderer, RenderContext, II18n } from '@/interfaces/index.js'
import type { IGameState } from '@/interfaces/index.js'
import { getAdjacentLocations } from '@/data/locations/phase1Locations.js'
import { ECHOES_CODEX } from '@/data/codex/echoes.js'
import { SaveSystem } from '@/systems/SaveSystem.js'

/**
 * CanvasRenderer — Visual-only canvas renderer.
 * Draws backgrounds, weather overlays, map node graph, title screen visuals.
 * All UI (HUD, panels, buttons, text) is handled by UIManager (HTML/CSS).
 */
export class CanvasRenderer implements IRenderer {
  private canvas!: HTMLCanvasElement
  private ctx!: CanvasRenderingContext2D
  private width = 0
  private height = 0
  private scale = 1
  private resizeDebounceTimer: ReturnType<typeof setTimeout> | null = null
  private _i18n: II18n | null = null
  private _visionFrame = 0

  setI18n(i18n: II18n): void { this._i18n = i18n }
  private t(key: string): string { return this._i18n ? this._i18n.t(key) : key }

  private readonly colors = {
    bg:           '#07090e',
    bgPanel:      '#0a0c15',
    borderDim:    '#1b2438',
    borderBright: '#2e4268',
    textPrimary:  '#c4cfe0',
    textDim:      '#465a72',
    textFaint:    '#1e2c3a',
    accent:       '#d4900a',
    accentWarm:   '#e8a830',
    accentGold:   '#f0c040',
  }

  private get basePx(): number {
    return Math.max(10, Math.min(Math.min(this.width, this.height) / 38, 22))
  }

  private lh(size: number): number {
    return Math.round(this.basePx * (size / 10) * 1.4)
  }

  private setFont(size: number, weight: string = 'normal'): void {
    const px = Math.round(this.basePx * size / 10)
    this.ctx.font = `${weight} ${px}px "Courier New", Courier, monospace`
  }

  init(canvas: HTMLCanvasElement): void {
    this.canvas = canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('CanvasRenderer: failed to get 2D context')
    this.ctx = ctx
    this.scale = window.devicePixelRatio || 1
  }

  resize(width: number, height: number): void {
    if (this.resizeDebounceTimer) clearTimeout(this.resizeDebounceTimer)
    this.resizeDebounceTimer = setTimeout(() => {
      this.width = width
      this.height = height
      this.canvas.width = width * this.scale
      this.canvas.height = height * this.scale
      this.canvas.style.width = `${width}px`
      this.canvas.style.height = `${height}px`
      this.ctx.scale(this.scale, this.scale)
    }, 50)
  }

  render(state: IGameState): void {
    const { ctx, width, height } = this
    if (width === 0 || height === 0) return
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = this.colors.bg
    ctx.fillRect(0, 0, width, height)

    switch (state.phase) {
      case 'title':
        this.renderTitle(state)
        break
      case 'dawn':
      case 'morning':
      case 'afternoon':
      case 'dusk':
        this.renderDayBackground(state)
        this.renderWeatherOverlay(state)
        break
      case 'night_safe':
        this.renderNightSafeBackground()
        break
      case 'night_dark':
        this.renderNightDarkBackground()
        break
      case 'death':
        this.renderDeathBackground()
        break
      case 'vision':
        this.renderVisionBackground()
        break
      case 'ending':
        this.renderEndingBackground()
        break
    }
  }

  getContext(): RenderContext {
    return { canvas: this.canvas, ctx: this.ctx, width: this.width, height: this.height, scale: this.scale }
  }

  drawMap(mapCanvas: HTMLCanvasElement, state: IGameState): void {
    const ctx = mapCanvas.getContext('2d')
    if (!ctx) return
    const w = mapCanvas.width
    const h = mapCanvas.height
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = this.colors.bgPanel
    ctx.fillRect(0, 0, w, h)

    const locations = [
      { id: 'lighthouse_top',    x: 0.5,  y: 0.12 },
      { id: 'lighthouse_base',   x: 0.5,  y: 0.28 },
      { id: 'cliffside',         x: 0.3,  y: 0.42 },
      { id: 'village_square',    x: 0.5,  y: 0.55 },
      { id: 'village_inn',       x: 0.25, y: 0.65 },
      { id: 'harbor',            x: 0.75, y: 0.65 },
      { id: 'tidal_caves',       x: 0.15, y: 0.78 },
      { id: 'archive_basement',  x: 0.7,  y: 0.42 },
      { id: 'mechanism_room',    x: 0.85, y: 0.28 },
    ]
    const nodeR = 8
    const px = (r: number) => r * w
    const py = (r: number) => r * h

    ctx.strokeStyle = this.colors.borderDim
    ctx.lineWidth = 1
    const drawn = new Set<string>()
    for (const loc of locations) {
      let adj: ReadonlyArray<{ id: string }>
      try { adj = getAdjacentLocations(loc.id as import('@/interfaces/types.js').LocationId) }
      catch { adj = [] }
      for (const a of adj) {
        const key = [loc.id, a.id].sort().join(':')
        if (drawn.has(key)) continue
        drawn.add(key)
        const to = locations.find(l => l.id === a.id)
        if (!to) continue
        ctx.beginPath()
        ctx.moveTo(px(loc.x), py(loc.y))
        ctx.lineTo(px(to.x), py(to.y))
        ctx.stroke()
      }
    }

    for (const loc of locations) {
      const discovered = state.player.discoveredLocations.has(loc.id as import('@/interfaces/types.js').LocationId)
      const isCurrent = state.player.currentLocation === loc.id
      ctx.beginPath()
      ctx.arc(px(loc.x), py(loc.y), nodeR, 0, Math.PI * 2)
      ctx.fillStyle = isCurrent ? this.colors.accentWarm : discovered ? this.colors.borderBright : this.colors.borderDim
      ctx.fill()
      if (isCurrent) {
        ctx.strokeStyle = this.colors.accentGold
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.lineWidth = 1
        ctx.strokeStyle = this.colors.borderDim
      }
      const lKey = `location.${loc.id}.name`
      const label = this._i18n ? this._i18n.t(lKey) : loc.id
      ctx.fillStyle = discovered ? this.colors.textPrimary : this.colors.textFaint
      ctx.font = '10px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(label === lKey ? loc.id : label, px(loc.x), py(loc.y) + nodeR + 12)
    }
  }

  private renderTitle(_state: IGameState): void {
    const { ctx, width, height } = this
    const cx = width / 2
    const now = Date.now()

    const warmGrad = ctx.createRadialGradient(cx, height * 0.45, 0, cx, height * 0.45, height * 0.65)
    warmGrad.addColorStop(0, 'rgba(30,20,8,0.9)')
    warmGrad.addColorStop(0.5, 'rgba(14,12,20,0.6)')
    warmGrad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = warmGrad
    ctx.fillRect(0, 0, width, height)

    const vignette = ctx.createRadialGradient(cx, height / 2, height * 0.2, cx, height / 2, height * 0.85)
    vignette.addColorStop(0, 'rgba(0,0,0,0)')
    vignette.addColorStop(1, 'rgba(0,0,0,0.7)')
    ctx.fillStyle = vignette
    ctx.fillRect(0, 0, width, height)

    // Stars
    for (let i = 0; i < 60; i++) {
      const sx = (Math.sin(i * 137) * 0.5 + 0.5) * width
      const sy = (Math.cos(i * 137 * 1.7) * 0.5 + 0.5) * height * 0.5
      const alpha = 0.2 + 0.5 * Math.abs(Math.sin(now / 2400 + i * 1.1))
      const sz = i % 5 === 0 ? 1.5 : 1
      ctx.fillStyle = `rgba(180,200,240,${alpha})`
      ctx.fillRect(sx, sy, sz, sz)
    }

    // Sweeping beam
    const beamAngle = (now / 4000) % (Math.PI * 2)
    const beamOriginX = cx
    const beamOriginY = height * 0.32
    const beamLen = Math.max(width, height) * 0.9
    ctx.save()
    ctx.globalAlpha = 0.08
    const beamGrad = ctx.createRadialGradient(beamOriginX, beamOriginY, 0, beamOriginX, beamOriginY, beamLen)
    beamGrad.addColorStop(0, '#f0c040')
    beamGrad.addColorStop(0.3, '#d4900a')
    beamGrad.addColorStop(1, 'rgba(212,144,10,0)')
    ctx.fillStyle = beamGrad
    ctx.beginPath()
    ctx.moveTo(beamOriginX, beamOriginY)
    const spread = Math.PI / 14
    ctx.arc(beamOriginX, beamOriginY, beamLen, beamAngle - spread, beamAngle + spread)
    ctx.closePath()
    ctx.fill()
    ctx.restore()

    // ASCII lighthouse
    const starPulse = 0.5 + 0.5 * Math.abs(Math.sin(now * 0.0025))
    const asciiLines: { text: string; pulse: boolean; color?: string }[] = [
      { text: '      *  *    *  *',        pulse: true,  color: '#f0c040' },
      { text: '    *   *  **  *   *',      pulse: true,  color: '#e8a830' },
      { text: '     * * ◈◈◈◈ * *',        pulse: false, color: this.colors.accent },
      { text: '      *  *    *  *',        pulse: true,  color: '#f0c040' },
      { text: '         |    |',           pulse: false, color: this.colors.accentWarm },
      { text: '        /|    |\\',          pulse: false, color: this.colors.accent },
      { text: '       / |    | \\',         pulse: false, color: this.colors.borderBright },
      { text: '      /  |    |  \\',        pulse: false, color: this.colors.borderBright },
      { text: '═══════════════════════════', pulse: false, color: this.colors.borderBright },
    ]

    const lineH = Math.round(this.basePx * 1.35)
    const asciiStartY = height * 0.12
    ctx.textAlign = 'center'
    this.setFont(10)
    for (let i = 0; i < asciiLines.length; i++) {
      const { text, pulse, color } = asciiLines[i]
      const c = color ?? this.colors.accent
      if (pulse) {
        const r = parseInt(c.slice(1,3),16), g = parseInt(c.slice(3,5),16), b = parseInt(c.slice(5,7),16)
        ctx.fillStyle = `rgba(${r},${g},${b},${starPulse})`
      } else {
        ctx.fillStyle = c
      }
      ctx.fillText(text, cx, asciiStartY + i * lineH)
    }

    // Decorative rule
    const ruleY = height * 0.54
    const ruleW = Math.min(width * 0.6, 400)
    const ruleGrad = ctx.createLinearGradient(cx - ruleW/2, ruleY, cx + ruleW/2, ruleY)
    ruleGrad.addColorStop(0, 'rgba(212,144,10,0)')
    ruleGrad.addColorStop(0.3, 'rgba(212,144,10,0.6)')
    ruleGrad.addColorStop(0.5, 'rgba(212,144,10,0.9)')
    ruleGrad.addColorStop(0.7, 'rgba(212,144,10,0.6)')
    ruleGrad.addColorStop(1, 'rgba(212,144,10,0)')
    ctx.fillStyle = ruleGrad
    ctx.fillRect(cx - ruleW/2, ruleY - 1, ruleW, 1)

    // Title text
    this.setFont(28, 'bold')
    ctx.fillStyle = this.colors.accentWarm
    ctx.textAlign = 'center'
    ctx.fillText('ECHOES OF THE LIGHTHOUSE', cx, height * 0.58)

    this.setFont(9)
    ctx.fillStyle = this.colors.textDim
    ctx.fillText('a  ·  narrative mystery  ·  roguelite  ·  text edition', cx, height * 0.58 + this.lh(10) + 4)

    const r2Y = height * 0.58 + this.lh(10) + 10
    ctx.fillStyle = ruleGrad
    ctx.fillRect(cx - ruleW/2, r2Y, ruleW, 1)

    this.setFont(10)
    ctx.fillStyle = this.colors.accent
    ctx.textAlign = 'center'
    ctx.fillText('KEEP THE LIGHT BURNING', cx, height * 0.68)

    // Version
    const version = (import.meta as { env?: Record<string, string> }).env?.VITE_APP_VERSION ?? '1.0.0'
    ctx.fillStyle = this.colors.textFaint
    ctx.textAlign = 'right'
    ctx.fillText(`v${version}`, width - 16, height - 12)
    ctx.textAlign = 'center'

    this.renderTitleEchoes(cx, height)
  }

  private renderTitleEchoes(cx: number, height: number): void {
    const { ctx } = this
    const seen = SaveSystem.loadEndingsSeen()
    if (seen.size === 0 && !SaveSystem.hasSave()) return

    const panelY = height * 0.895
    const slotH = this.lh(8)
    const panelW = Math.min(this.width * 0.45, 320)

    const ruleGrad = ctx.createLinearGradient(cx - panelW / 2, panelY, cx + panelW / 2, panelY)
    ruleGrad.addColorStop(0, 'rgba(212,144,10,0)')
    ruleGrad.addColorStop(0.4, 'rgba(212,144,10,0.5)')
    ruleGrad.addColorStop(0.6, 'rgba(212,144,10,0.5)')
    ruleGrad.addColorStop(1, 'rgba(212,144,10,0)')
    ctx.fillStyle = ruleGrad
    ctx.fillRect(cx - panelW / 2, panelY - 2, panelW, 1)

    this.setFont(9, 'bold')
    ctx.fillStyle = this.colors.accentWarm
    ctx.textAlign = 'center'
    ctx.fillText(this.t('ending_tracker.panel_title'), cx, panelY + slotH * 0.8)

    this.setFont(8)
    ctx.textAlign = 'left'
    const startX = cx - panelW / 2 + 8
    let y = panelY + slotH + 4

    for (const entry of ECHOES_CODEX) {
      const isSeen = seen.has(entry.endingId)
      if (isSeen) {
        ctx.fillStyle = this.colors.accentWarm
        ctx.fillText('✦ ' + this.t(entry.shortNameKey), startX, y)
      } else {
        ctx.fillStyle = this.colors.textFaint
        ctx.fillText('░░░░░░░░', startX, y)
      }
      y += slotH
    }
    ctx.textAlign = 'center'
  }

  private renderDayBackground(state: IGameState): void {
    const { ctx, width, height } = this
    const phase = state.phase
    let topColor = '#0a0e18'
    let bottomColor = '#07090e'
    if (phase === 'dawn') { topColor = '#1a1208'; bottomColor = '#0d0a12' }
    if (phase === 'dusk') { topColor = '#14100a'; bottomColor = '#0a0810' }
    const grad = ctx.createLinearGradient(0, 0, 0, height)
    grad.addColorStop(0, topColor)
    grad.addColorStop(1, bottomColor)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, width, height)
  }

  private renderWeatherOverlay(state: IGameState): void {
    const { ctx, width, height } = this
    const weather = (state as IGameState & { weather?: { current?: string } }).weather?.current
    if (!weather || weather === 'clear') return

    if (weather === 'fog') {
      const fog = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height) * 0.7)
      fog.addColorStop(0, 'rgba(200,220,255,0)')
      fog.addColorStop(0.6, 'rgba(200,220,255,0.04)')
      fog.addColorStop(1, 'rgba(200,220,255,0.15)')
      ctx.fillStyle = fog
      ctx.fillRect(0, 0, width, height)
    }

    if (weather === 'rain') {
      const now = Date.now()
      ctx.strokeStyle = 'rgba(150,180,220,0.15)'
      ctx.lineWidth = 1
      for (let i = 0; i < 60; i++) {
        const x = (((Math.sin(i * 73 + now * 0.001) * 0.5 + 0.5) * width * 1.5) - now * 0.3 * (i % 3 + 1)) % width
        const y = ((Math.cos(i * 53 + now * 0.0015) * 0.5 + 0.5) * height * 1.2 + now * 0.4 * (i % 4 + 0.5)) % height
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x - 2, y + 14)
        ctx.stroke()
      }
    }
  }

  private renderNightSafeBackground(): void {
    const { ctx, width, height } = this
    const cx = width / 2
    const grad = ctx.createRadialGradient(cx, height * 0.3, 0, cx, height * 0.5, height * 0.8)
    grad.addColorStop(0, '#101828')
    grad.addColorStop(1, this.colors.bg)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, width, height)
    // Stars
    for (let i = 0; i < 80; i++) {
      const sx = (Math.sin(i * 42) * 0.5 + 0.5) * width
      const sy = (Math.cos(i * 42 * 1.7) * 0.5 + 0.5) * height * 0.6
      ctx.fillStyle = `rgba(180,200,240,${0.15 + 0.3 * Math.abs(Math.sin(Date.now() / 2800 + i * 1.3))})`
      ctx.fillRect(sx, sy, 1, 1)
    }
  }

  private renderNightDarkBackground(): void {
    const { ctx, width, height } = this
    const cx = width / 2
    const grad = ctx.createRadialGradient(cx, height * 0.4, 0, cx, height * 0.5, height)
    grad.addColorStop(0, '#0c0818')
    grad.addColorStop(1, '#04030a')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, width, height)
  }

  private renderDeathBackground(): void {
    const { ctx, width, height } = this
    ctx.fillStyle = '#080306'
    ctx.fillRect(0, 0, width, height)
    const vignette = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height) * 0.7)
    vignette.addColorStop(0, 'rgba(0,0,0,0)')
    vignette.addColorStop(1, 'rgba(80,0,0,0.5)')
    ctx.fillStyle = vignette
    ctx.fillRect(0, 0, width, height)
  }

  private renderVisionBackground(): void {
    const { ctx, width, height } = this
    this._visionFrame++
    const t2 = this._visionFrame / 60
    ctx.fillStyle = '#050812'
    ctx.fillRect(0, 0, width, height)
    const shimmer = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height) * 0.6)
    shimmer.addColorStop(0, `rgba(30,20,60,${0.3 + 0.15 * Math.sin(t2)})`)
    shimmer.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = shimmer
    ctx.fillRect(0, 0, width, height)
  }

  private renderEndingBackground(): void {
    const { ctx, width, height } = this
    const grad = ctx.createLinearGradient(0, 0, 0, height)
    grad.addColorStop(0, '#0a0812')
    grad.addColorStop(1, '#07090e')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, width, height)
    const glow = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height) * 0.5)
    glow.addColorStop(0, 'rgba(212,144,10,0.06)')
    glow.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, width, height)
  }
}
