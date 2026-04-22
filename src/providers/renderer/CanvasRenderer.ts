import type { IRenderer, RenderContext, II18n } from '@/interfaces/index.js'
import type { IGameState } from '@/interfaces/index.js'
import { getAdjacentLocations } from '@/data/locations/phase1Locations.js'
import { ECHOES_CODEX } from '@/data/codex/echoes.js'
import { SaveSystem } from '@/systems/SaveSystem.js'
import type { LocationId } from '@/interfaces/types.js'

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
    bg: '#07090e', bgPanel: '#0a0c15', borderDim: '#1b2438', borderBright: '#2e4268',
    textPrimary: '#c4cfe0', textDim: '#465a72', textFaint: '#1e2c3a',
    accent: '#d4900a', accentWarm: '#e8a830', accentGold: '#f0c040',
  }

  private get basePx(): number { return Math.max(10, Math.min(Math.min(this.width, this.height) / 38, 22)) }
  private lh(size: number): number { return Math.round(this.basePx * (size / 10) * 1.4) }
  private setFont(size: number, weight = 'normal'): void {
    this.ctx.font = `${weight} ${Math.round(this.basePx * size / 10)}px "Courier New", Courier, monospace`
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
      this.width = width; this.height = height
      this.canvas.width = width * this.scale; this.canvas.height = height * this.scale
      this.canvas.style.width = `${width}px`; this.canvas.style.height = `${height}px`
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
      case 'title': this.renderTitle(state); break
      case 'dawn': case 'morning': case 'afternoon': case 'dusk':
        this.renderDayBackground(state); this.renderWeatherOverlay(state)
        this.renderLocationBackground(state); break
      case 'night_safe': this.renderNightSafeBackground(); this.renderLocationBackground(state); break
      case 'night_dark': this.renderNightDarkBackground(); this.renderLocationBackground(state); break
      case 'death': this.renderDeathBackground(); break
      case 'vision': this.renderVisionBackground(); break
      case 'ending': this.renderEndingBackground(); break
    }
  }

  getContext(): RenderContext {
    return { canvas: this.canvas, ctx: this.ctx, width: this.width, height: this.height, scale: this.scale }
  }

  drawMap(mapCanvas: HTMLCanvasElement, state: IGameState): void {
    const ctx = mapCanvas.getContext('2d')
    if (!ctx) return
    const w = mapCanvas.width, h = mapCanvas.height
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = this.colors.bgPanel
    ctx.fillRect(0, 0, w, h)
    const locations = [
      { id: 'lighthouse_top', x: 0.5, y: 0.12 }, { id: 'lighthouse_base', x: 0.5, y: 0.28 },
      { id: 'cliffside', x: 0.3, y: 0.42 }, { id: 'village_square', x: 0.5, y: 0.55 },
      { id: 'village_inn', x: 0.25, y: 0.65 }, { id: 'harbor', x: 0.75, y: 0.65 },
      { id: 'tidal_caves', x: 0.15, y: 0.78 }, { id: 'archive_basement', x: 0.7, y: 0.42 },
      { id: 'mechanism_room', x: 0.85, y: 0.28 },
    ]
    const nodeR = 8, px = (r: number) => r * w, py = (r: number) => r * h
    ctx.strokeStyle = this.colors.borderDim; ctx.lineWidth = 1
    const drawn = new Set<string>()
    for (const loc of locations) {
      let adj: ReadonlyArray<{ id: string }>
      try { adj = getAdjacentLocations(loc.id as LocationId) } catch { adj = [] }
      for (const a of adj) {
        const key = [loc.id, a.id].sort().join(':')
        if (drawn.has(key)) continue
        drawn.add(key)
        const to = locations.find(l => l.id === a.id)
        if (!to) continue
        ctx.beginPath(); ctx.moveTo(px(loc.x), py(loc.y)); ctx.lineTo(px(to.x), py(to.y)); ctx.stroke()
      }
    }
    for (const loc of locations) {
      const discovered = state.player.discoveredLocations.has(loc.id as LocationId)
      const isCurrent = state.player.currentLocation === loc.id
      ctx.beginPath(); ctx.arc(px(loc.x), py(loc.y), nodeR, 0, Math.PI * 2)
      ctx.fillStyle = isCurrent ? this.colors.accentWarm : discovered ? this.colors.borderBright : this.colors.borderDim
      ctx.fill()
      if (isCurrent) { ctx.strokeStyle = this.colors.accentGold; ctx.lineWidth = 2; ctx.stroke(); ctx.lineWidth = 1 }
      const lKey = `location.${loc.id}.name`
      const label = this._i18n ? this._i18n.t(lKey) : loc.id
      ctx.fillStyle = discovered ? this.colors.textPrimary : this.colors.textFaint
      ctx.font = '10px monospace'; ctx.textAlign = 'center'
      ctx.fillText(label === lKey ? loc.id : label, px(loc.x), py(loc.y) + nodeR + 12)
    }
  }

  private renderTitle(_state: IGameState): void {
    const { ctx, width, height } = this
    const cx = width / 2, now = Date.now()
    const warmGrad = ctx.createRadialGradient(cx, height * 0.45, 0, cx, height * 0.45, height * 0.65)
    warmGrad.addColorStop(0, 'rgba(30,20,8,0.9)'); warmGrad.addColorStop(0.5, 'rgba(14,12,20,0.6)'); warmGrad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = warmGrad; ctx.fillRect(0, 0, width, height)
    const vignette = ctx.createRadialGradient(cx, height / 2, height * 0.2, cx, height / 2, height * 0.85)
    vignette.addColorStop(0, 'rgba(0,0,0,0)'); vignette.addColorStop(1, 'rgba(0,0,0,0.7)')
    ctx.fillStyle = vignette; ctx.fillRect(0, 0, width, height)
    for (let i = 0; i < 60; i++) {
      const sx = (Math.sin(i * 137) * 0.5 + 0.5) * width
      const sy = (Math.cos(i * 137 * 1.7) * 0.5 + 0.5) * height * 0.5
      ctx.fillStyle = `rgba(180,200,240,${0.2 + 0.5 * Math.abs(Math.sin(now / 2400 + i * 1.1))})`
      ctx.fillRect(sx, sy, i % 5 === 0 ? 1.5 : 1, i % 5 === 0 ? 1.5 : 1)
    }
    const beamAngle = (now / 4000) % (Math.PI * 2), beamLen = Math.max(width, height) * 0.9
    ctx.save(); ctx.globalAlpha = 0.08
    const beamGrad = ctx.createRadialGradient(cx, height * 0.32, 0, cx, height * 0.32, beamLen)
    beamGrad.addColorStop(0, '#f0c040'); beamGrad.addColorStop(0.3, '#d4900a'); beamGrad.addColorStop(1, 'rgba(212,144,10,0)')
    ctx.fillStyle = beamGrad; ctx.beginPath(); ctx.moveTo(cx, height * 0.32)
    ctx.arc(cx, height * 0.32, beamLen, beamAngle - Math.PI / 14, beamAngle + Math.PI / 14); ctx.closePath(); ctx.fill(); ctx.restore()
    const starPulse = 0.5 + 0.5 * Math.abs(Math.sin(now * 0.0025))
    const asciiLines: { text: string; pulse: boolean; color?: string }[] = [
      { text: '      *  *    *  *', pulse: true, color: '#f0c040' },
      { text: '    *   *  **  *   *', pulse: true, color: '#e8a830' },
      { text: '     * * ◈◈◈◈ * *', pulse: false, color: this.colors.accent },
      { text: '      *  *    *  *', pulse: true, color: '#f0c040' },
      { text: '         |    |', pulse: false, color: this.colors.accentWarm },
      { text: '        /|    |\\', pulse: false, color: this.colors.accent },
      { text: '       / |    | \\', pulse: false, color: this.colors.borderBright },
      { text: '      /  |    |  \\', pulse: false, color: this.colors.borderBright },
      { text: '═══════════════════════════', pulse: false, color: this.colors.borderBright },
    ]
    const lineH = Math.round(this.basePx * 1.35), asciiStartY = height * 0.12
    ctx.textAlign = 'center'; this.setFont(10)
    for (let i = 0; i < asciiLines.length; i++) {
      const { text, pulse, color } = asciiLines[i]; const c = color ?? this.colors.accent
      if (pulse) { const r = parseInt(c.slice(1,3),16), g = parseInt(c.slice(3,5),16), b = parseInt(c.slice(5,7),16); ctx.fillStyle = `rgba(${r},${g},${b},${starPulse})` }
      else { ctx.fillStyle = c }
      ctx.fillText(text, cx, asciiStartY + i * lineH)
    }
    const ruleY = height * 0.54, ruleW = Math.min(width * 0.6, 400)
    const ruleGrad = ctx.createLinearGradient(cx - ruleW/2, ruleY, cx + ruleW/2, ruleY)
    ruleGrad.addColorStop(0, 'rgba(212,144,10,0)'); ruleGrad.addColorStop(0.3, 'rgba(212,144,10,0.6)')
    ruleGrad.addColorStop(0.5, 'rgba(212,144,10,0.9)'); ruleGrad.addColorStop(0.7, 'rgba(212,144,10,0.6)'); ruleGrad.addColorStop(1, 'rgba(212,144,10,0)')
    ctx.fillStyle = ruleGrad; ctx.fillRect(cx - ruleW/2, ruleY - 1, ruleW, 1)
    this.setFont(28, 'bold'); ctx.fillStyle = this.colors.accentWarm; ctx.textAlign = 'center'
    ctx.fillText('ECHOES OF THE LIGHTHOUSE', cx, height * 0.58)
    this.setFont(9); ctx.fillStyle = this.colors.textDim
    ctx.fillText('a  ·  narrative mystery  ·  roguelite  ·  text edition', cx, height * 0.58 + this.lh(10) + 4)
    ctx.fillStyle = ruleGrad; ctx.fillRect(cx - ruleW/2, height * 0.58 + this.lh(10) + 10, ruleW, 1)
    this.setFont(10); ctx.fillStyle = this.colors.accent; ctx.textAlign = 'center'
    ctx.fillText('KEEP THE LIGHT BURNING', cx, height * 0.68)
    const version = (import.meta as { env?: Record<string, string> }).env?.VITE_APP_VERSION ?? '1.0.0'
    ctx.fillStyle = this.colors.textFaint; ctx.textAlign = 'right'
    ctx.fillText(`v${version}`, width - 16, height - 12); ctx.textAlign = 'center'
    this.renderTitleEchoes(cx, height)
  }

  private renderTitleEchoes(cx: number, height: number): void {
    const { ctx } = this
    const seen = SaveSystem.loadEndingsSeen()
    if (seen.size === 0 && !SaveSystem.hasSave()) return
    const panelY = height * 0.895, slotH = this.lh(8), panelW = Math.min(this.width * 0.45, 320)
    const ruleGrad = ctx.createLinearGradient(cx - panelW / 2, panelY, cx + panelW / 2, panelY)
    ruleGrad.addColorStop(0, 'rgba(212,144,10,0)'); ruleGrad.addColorStop(0.4, 'rgba(212,144,10,0.5)')
    ruleGrad.addColorStop(0.6, 'rgba(212,144,10,0.5)'); ruleGrad.addColorStop(1, 'rgba(212,144,10,0)')
    ctx.fillStyle = ruleGrad; ctx.fillRect(cx - panelW / 2, panelY - 2, panelW, 1)
    this.setFont(9, 'bold'); ctx.fillStyle = this.colors.accentWarm; ctx.textAlign = 'center'
    ctx.fillText(this.t('ending_tracker.panel_title'), cx, panelY + slotH * 0.8)
    this.setFont(8); ctx.textAlign = 'left'
    const startX = cx - panelW / 2 + 8; let y = panelY + slotH + 4
    for (const entry of ECHOES_CODEX) {
      const isSeen = seen.has(entry.endingId)
      ctx.fillStyle = isSeen ? this.colors.accentWarm : this.colors.textFaint
      ctx.fillText(isSeen ? '✦ ' + this.t(entry.shortNameKey) : '░░░░░░░░', startX, y)
      y += slotH
    }
    ctx.textAlign = 'center'
  }

  private renderDayBackground(state: IGameState): void {
    const { ctx, width, height } = this
    let topColor = '#0a0e18', bottomColor = '#07090e'
    if (state.phase === 'dawn') { topColor = '#1a1208'; bottomColor = '#0d0a12' }
    if (state.phase === 'dusk') { topColor = '#14100a'; bottomColor = '#0a0810' }
    const grad = ctx.createLinearGradient(0, 0, 0, height)
    grad.addColorStop(0, topColor); grad.addColorStop(1, bottomColor)
    ctx.fillStyle = grad; ctx.fillRect(0, 0, width, height)
  }

  private renderWeatherOverlay(state: IGameState): void {
    const { ctx, width, height } = this
    const weather = (state as IGameState & { weather?: { current?: string } }).weather?.current
    if (!weather || weather === 'clear') return
    if (weather === 'fog') {
      const fog = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height) * 0.7)
      fog.addColorStop(0, 'rgba(200,220,255,0)'); fog.addColorStop(0.6, 'rgba(200,220,255,0.04)'); fog.addColorStop(1, 'rgba(200,220,255,0.15)')
      ctx.fillStyle = fog; ctx.fillRect(0, 0, width, height)
    }
    if (weather === 'rain') {
      const now = Date.now(); ctx.strokeStyle = 'rgba(150,180,220,0.15)'; ctx.lineWidth = 1
      for (let i = 0; i < 60; i++) {
        const x = (((Math.sin(i * 73 + now * 0.001) * 0.5 + 0.5) * width * 1.5) - now * 0.3 * (i % 3 + 1)) % width
        const y = ((Math.cos(i * 53 + now * 0.0015) * 0.5 + 0.5) * height * 1.2 + now * 0.4 * (i % 4 + 0.5)) % height
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 2, y + 14); ctx.stroke()
      }
    }
  }

  private renderNightSafeBackground(): void {
    const { ctx, width, height } = this, cx = width / 2
    const grad = ctx.createRadialGradient(cx, height * 0.3, 0, cx, height * 0.5, height * 0.8)
    grad.addColorStop(0, '#101828'); grad.addColorStop(1, this.colors.bg)
    ctx.fillStyle = grad; ctx.fillRect(0, 0, width, height)
    for (let i = 0; i < 80; i++) {
      ctx.fillStyle = `rgba(180,200,240,${0.15 + 0.3 * Math.abs(Math.sin(Date.now() / 2800 + i * 1.3))})`
      ctx.fillRect((Math.sin(i * 42) * 0.5 + 0.5) * width, (Math.cos(i * 42 * 1.7) * 0.5 + 0.5) * height * 0.6, 1, 1)
    }
  }

  private renderNightDarkBackground(): void {
    const { ctx, width, height } = this, cx = width / 2
    const grad = ctx.createRadialGradient(cx, height * 0.4, 0, cx, height * 0.5, height)
    grad.addColorStop(0, '#0c0818'); grad.addColorStop(1, '#04030a')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, width, height)
  }

  private renderDeathBackground(): void {
    const { ctx, width, height } = this
    ctx.fillStyle = '#080306'; ctx.fillRect(0, 0, width, height)
    const vignette = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height) * 0.7)
    vignette.addColorStop(0, 'rgba(0,0,0,0)'); vignette.addColorStop(1, 'rgba(80,0,0,0.5)')
    ctx.fillStyle = vignette; ctx.fillRect(0, 0, width, height)
  }

  private renderVisionBackground(): void {
    const { ctx, width, height } = this
    this._visionFrame++
    ctx.fillStyle = '#050812'; ctx.fillRect(0, 0, width, height)
    const shimmer = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height) * 0.6)
    shimmer.addColorStop(0, `rgba(30,20,60,${0.3 + 0.15 * Math.sin(this._visionFrame / 60)})`); shimmer.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = shimmer; ctx.fillRect(0, 0, width, height)
  }

  private renderEndingBackground(): void {
    const { ctx, width, height } = this
    const grad = ctx.createLinearGradient(0, 0, 0, height)
    grad.addColorStop(0, '#0a0812'); grad.addColorStop(1, '#07090e')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, width, height)
    const glow = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height) * 0.5)
    glow.addColorStop(0, 'rgba(212,144,10,0.06)'); glow.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = glow; ctx.fillRect(0, 0, width, height)
  }

  // ─── Location-specific bespoke backgrounds ────────────────────────────────

  /**
   * Deterministic pseudo-random in [0,1) from a numeric seed + index.
   * Using the same seed+index always returns the same value, so particle
   * positions don't jump on re-render.
   */
  private seededRandom(seed: number, index: number): number {
    const x = Math.sin(seed * 9301 + index * 49297 + 233) * 100003
    return x - Math.floor(x)
  }

  /** Dispatch to per-location background renderers for gameplay phases. */
  private renderLocationBackground(state: IGameState): void {
    const loc = state.player.currentLocation
    const now = Date.now()
    if (loc === 'tidal_caves') this.renderTidalCaves(now)
    else if (loc === 'archive_basement') this.renderArchiveBasement(now)
    else if (loc === 'mechanism_room') this.renderMechanismRoom(now)
  }

  /**
   * Tidal Caves — dark teal base, animated sine-wave water ripples,
   * seeded bioluminescence dots that pulse, and a bottom fog gradient.
   * Seed value 1151 = sum of char codes for "tidal_caves".
   */
  private renderTidalCaves(timestamp: number): void {
    const { ctx, width, height } = this

    // Dark teal base
    ctx.fillStyle = '#0a1a1a'
    ctx.fillRect(0, 0, width, height)

    // Animated water ripple lines (horizontal sine waves that slowly scroll)
    ctx.lineWidth = 1.5
    const rippleCount = 8
    for (let i = 0; i < rippleCount; i++) {
      ctx.strokeStyle = 'rgba(0,180,150,0.3)'
      ctx.beginPath()
      const yBase = height * 0.12 + (i / rippleCount) * height * 0.76
      for (let x = 0; x <= width; x += 4) {
        const y = yBase + Math.sin(x * 0.018 + timestamp * 0.0008 + i * 0.9) * 7
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
      }
      ctx.stroke()
    }

    // Bioluminescence dots — seeded positions, pulsing glow
    // Seed 1151 = char-code sum of 'tidal_caves'
    const bioSeed = 1151
    const bioCount = 12
    for (let i = 0; i < bioCount; i++) {
      const x = this.seededRandom(bioSeed, i * 2) * width
      const y = this.seededRandom(bioSeed, i * 2 + 1) * height
      const pulse = 0.3 + 0.7 * Math.abs(Math.sin(timestamp * 0.0009 + i * 1.4))
      const r = 2 + this.seededRandom(bioSeed, i + 100) * 3
      // Soft outer glow
      const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 4)
      glow.addColorStop(0, `rgba(0,220,180,${(0.6 * pulse).toFixed(3)})`)
      glow.addColorStop(1, 'rgba(0,220,180,0)')
      ctx.fillStyle = glow
      ctx.fillRect(x - r * 4, y - r * 4, r * 8, r * 8)
      // Bright core dot
      ctx.fillStyle = `rgba(0,220,180,${(0.6 * pulse).toFixed(3)})`
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
    }

    // Fog: gradient rising from bottom 20% of canvas
    const fogGrad = ctx.createLinearGradient(0, height * 0.8, 0, height)
    fogGrad.addColorStop(0, 'rgba(0,40,30,0)')
    fogGrad.addColorStop(1, 'rgba(0,40,30,0.7)')
    ctx.fillStyle = fogGrad
    ctx.fillRect(0, height * 0.8, width, height * 0.2)
  }

  /**
   * Archive Basement — near-black base, bookshelf silhouettes, drifting
   * dust motes, and a warm candlelight bloom in the bottom-left corner.
   * Seed value 1780 = sum of char codes for "archive_basement".
   */
  private renderArchiveBasement(timestamp: number): void {
    const { ctx, width, height } = this

    // Near-black base
    ctx.fillStyle = '#0a080a'
    ctx.fillRect(0, 0, width, height)

    // Shelf silhouettes — 4 horizontal dark rectangles at different heights
    const shelfYRatios = [0.22, 0.40, 0.58, 0.76]
    const shelfH = Math.max(8, height * 0.04)
    ctx.fillStyle = 'rgba(20,15,25,0.9)'
    for (const yr of shelfYRatios) {
      ctx.fillRect(0, height * yr, width, shelfH)
    }

    // Dust motes — ~20 tiny particles drifting slowly upward with lateral sway
    // Seed 1780 = char-code sum of 'archive_basement'
    const moteSeed = 1780
    const moteCount = 20
    for (let i = 0; i < moteCount; i++) {
      const bx = this.seededRandom(moteSeed, i * 2) * width
      const by = this.seededRandom(moteSeed, i * 2 + 1) * height
      const speed = 0.15 + this.seededRandom(moteSeed, i + 50) * 0.35
      const drift = this.seededRandom(moteSeed, i + 100) * Math.PI * 2
      const x = (bx + Math.sin(timestamp * speed * 0.00025 + drift) * 18 + width) % width
      // Use ((a % n) + n) % n to guarantee a positive result regardless of
      // how large `timestamp` grows (JS % returns negative for negative dividends).
      const scrolled = (timestamp * speed * 0.008) % height
      const y = ((by - scrolled) % height + height) % height
      const alpha = 0.15 + 0.25 * Math.abs(Math.sin(timestamp * 0.0008 + i * 0.7))
      ctx.fillStyle = `rgba(200,180,160,${alpha.toFixed(3)})`
      ctx.beginPath(); ctx.arc(x, y, 1.2, 0, Math.PI * 2); ctx.fill()
    }

    // Candlelight bloom — soft warm radial glow in bottom-left corner
    // Subtle flicker via timestamp to keep the effect alive
    const gx = width * 0.14, gy = height * 0.80
    const flickerAlpha = 0.12 + 0.03 * Math.sin(timestamp * 0.003)
    const bloom = ctx.createRadialGradient(gx, gy, 0, gx, gy, 80)
    bloom.addColorStop(0, `rgba(200,120,0,${flickerAlpha.toFixed(3)})`)
    bloom.addColorStop(1, 'rgba(200,120,0,0)')
    ctx.fillStyle = bloom
    ctx.fillRect(gx - 100, gy - 100, 200, 200)
  }

  /**
   * Mechanism Room — very dark blue-grey base, faint technical grid lines,
   * amber lantern glow from center-left, and a large gear-wheel shadow
   * partially visible in the top-right corner.
   */
  private renderMechanismRoom(timestamp: number): void {
    const { ctx, width, height } = this

    // Very dark blue-grey base
    ctx.fillStyle = '#080a10'
    ctx.fillRect(0, 0, width, height)

    // Faint grid lines suggesting a technical diagram
    ctx.strokeStyle = 'rgba(80,60,40,0.15)'
    ctx.lineWidth = 1
    const gridSize = 40
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke()
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke()
    }

    // Amber oil lantern glow from center-left with subtle flicker
    const lx = width * 0.22, ly = height * 0.5
    const lanternAlpha = 0.10 + 0.02 * Math.sin(timestamp * 0.0015)
    const lanternGlow = ctx.createRadialGradient(lx, ly, 0, lx, ly, 200)
    lanternGlow.addColorStop(0, `rgba(210,130,0,${lanternAlpha.toFixed(3)})`)
    lanternGlow.addColorStop(1, 'rgba(210,130,0,0)')
    ctx.fillStyle = lanternGlow
    ctx.fillRect(0, 0, width, height)

    // Gear wheel shadow — large partial gear in top-right corner (static silhouette)
    const gearX = width * 0.90, gearY = height * 0.08
    const gearR = Math.min(width, height) * 0.20
    const toothCount = 12
    const toothDepth = gearR * 0.14
    ctx.fillStyle = 'rgba(60,50,40,0.6)'
    ctx.beginPath()
    for (let i = 0; i < toothCount; i++) {
      const baseAngle = (i / toothCount) * Math.PI * 2
      const a1 = baseAngle - (Math.PI / toothCount) * 0.35
      const a2 = baseAngle + (Math.PI / toothCount) * 0.35
      const outerR = gearR + toothDepth
      ctx.lineTo(gearX + Math.cos(a1) * outerR, gearY + Math.sin(a1) * outerR)
      ctx.lineTo(gearX + Math.cos(a2) * outerR, gearY + Math.sin(a2) * outerR)
      const nextBase = ((i + 1) / toothCount) * Math.PI * 2 - (Math.PI / toothCount) * 0.35
      const midA = (a2 + nextBase) / 2
      ctx.lineTo(gearX + Math.cos(midA) * gearR, gearY + Math.sin(midA) * gearR)
    }
    ctx.closePath()
    ctx.fill()
    // Inner hub hole punched out
    ctx.fillStyle = '#080a10'
    ctx.beginPath(); ctx.arc(gearX, gearY, gearR * 0.38, 0, Math.PI * 2); ctx.fill()
  }
}
