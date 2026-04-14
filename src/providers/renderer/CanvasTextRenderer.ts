import type { IRenderer, RenderContext } from '@/interfaces/index.js'
import type { IGameState, INPCState, NPCId } from '@/interfaces/index.js'
import type { GameAction } from '@/engine/InputHandler.js'
import { getAdjacentLocations } from '@/data/locations/phase1Locations.js'

/** A hit-testable clickable region drawn on the canvas. */
interface ClickRegion {
  x: number; y: number; w: number; h: number
  action: GameAction
  label: string
}

/**
CanvasTextRenderer  * Typography-first Canvas 2D renderer. 
 * No sprites, no image assets. All visuals are Canvas 2D primitives + text.
 * See docs/gdd/09-art-direction.md for full visual specifications.
 */
export class CanvasTextRenderer implements IRenderer {
  private canvas!: HTMLCanvasElement
  private ctx!: CanvasRenderingContext2D
  private width = 0
  private height = 0
  private scale = 1
  private clickRegions: ClickRegion[] = []
  private onAction: ((action: GameAction) => void) | null = null

  private readonly colors = {
    bg:           '#0a0a0f',
    bgPanel:      '#0f0f18',
    bgHighlight:  '#1a1a2a',
    borderDim:    '#1e2030',
    borderBright: '#3a4060',
    textPrimary:  '#c8ccd8',
    textDim:      '#556677',
    textFaint:    '#2a3040',
    accent:       '#4488cc',
    accentWarm:   '#cc8844',
    accentGold:   '#d4aa44',
    danger:       '#cc4444',
    safe:         '#44cc88',
    timerFull:    '#4488cc',
    timerWarn:    '#cc8844',
    timerCrit:    '#cc4444',
  }

  private get isPortrait(): boolean {
    return this.height > this.width
  }

  private get basePx(): number {
    return Math.max(10, Math.min(this.width, this.height) / 38)
  }

  private get layout() {
    const m = Math.round(this.basePx * 1.2)
    return {
      hudHeight:    this.isPortrait ? Math.round(this.basePx * 5)   : Math.round(this.basePx * 5.5),
      actionWidth:  this.isPortrait ? 1.0  : 0.22,
      actionHeight: this.isPortrait ? Math.round(this.basePx * 14) : 0,
      margin: m,
    }
  }

  init(canvas: HTMLCanvasElement): void {
    this.canvas = canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('CanvasTextRenderer: failed to get 2D context')
    this.ctx = ctx
    this.scale = window.devicePixelRatio || 1
    canvas.addEventListener('click', (e: MouseEvent) => this.handleClick(e))
    canvas.addEventListener('touchend', (e: TouchEvent) => {
      e.preventDefault()
      const touch = e.changedTouches[0]
      if (!touch) return
      const rect = this.canvas.getBoundingClientRect()
      const mx = touch.clientX - rect.left
      const my = touch.clientY - rect.top
      if (!this.onAction) return
      for (const region of this.clickRegions) {
        if (mx >= region.x && mx <= region.x + region.w && my >= region.y && my <= region.y + region.h) {
          this.onAction(region.action)
          return
        }
      }
    }, { passive: false })
  }

  setActionHandler(handler: (action: GameAction) => void): void {
    this.onAction = handler
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
    this.clickRegions = []
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = this.colors.bg
    ctx.fillRect(0, 0, width, height)

    switch (state.phase) {
      case 'title':      this.renderTitle(state); break
      case 'dawn':
      case 'day':
      case 'dusk':       this.renderDay(state);   break
      case 'night_safe':
      case 'night_dark': this.renderNight(state); break
      case 'vision':     this.renderVision(state); break
      case 'ending':     this.renderEnding(state); break
    }
  }

  getContext(): RenderContext {
    return { canvas: this.canvas, ctx: this.ctx, width: this.width, height: this.height, scale: this.scale }
  }

  private renderTitle(_state: IGameState): void {
    const { ctx, width, height } = this
    const cx = width / 2

    const grad = ctx.createRadialGradient(cx, height * 0.4, 0, cx, height * 0.4, height * 0.7)
    grad.addColorStop(0, '#0f1020')
    grad.addColorStop(1, this.colors.bg)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, width, height)

    this.drawLighthouseIcon(cx, height * 0.28, 60)

    this.setFont(28, 'bold')
    ctx.fillStyle = this.colors.accent
    ctx.textAlign = 'center'
    ctx.fillText('ECHOES OF THE LIGHTHOUSE', cx, height * 0.46)

    this.setFont(11)
    ctx.fillStyle = this.colors.textDim
    ctx.fillText('a narrative mystery · roguelite · canvas text edition', cx, height * 0.46 + 28)

    const pulse = 0.6 + 0.4 * Math.abs(Math.sin(Date.now() / 900))
    ctx.fillStyle = `rgba(68,136,204,${pulse})`
    this.setFont(13)
    ctx.fillText('▶  press enter or click to begin', cx, height * 0.62)

    this.setFont(9)
    ctx.fillStyle = this.colors.textFaint
    ctx.fillText('v0.1.0-alpha', cx, height - 20)
  }

  private renderDay(state: IGameState): void {
    const { width, height } = this
    const { hudHeight, margin } = this.layout

    this.renderHUD(state, 0, 0, width, hudHeight)

    if (this.isPortrait) {
      const actionH = this.layout.actionHeight
      const contentY = hudHeight + 1
      const contentH = height - contentY - actionH

      if (state.activeDialogue?.isActive) {
        this.renderDialogue(state, margin, contentY + margin, width - margin * 2, contentH - margin * 2)
      } else {
        this.renderLocationPanel(state, margin, contentY + margin, width - margin * 2, contentH - margin * 2)
      }

      this.renderActionPanelPortrait(state, 0, height - actionH, width, actionH)
    } else {
      const actionPanelW = Math.floor(width * this.layout.actionWidth)
      const mainW = width - actionPanelW
      const contentY = hudHeight + 1
      const contentH = height - contentY

      if (state.activeDialogue?.isActive) {
        this.renderDialogue(state, margin, contentY + margin, mainW - margin * 2, contentH - margin * 2)
      } else {
        this.renderLocationPanel(state, margin, contentY + margin, mainW - margin * 2, contentH - margin * 2)
      }
      this.renderActionPanel(state, mainW, contentY, actionPanelW, contentH)
    }
  }

  private renderHUD(state: IGameState, x: number, y: number, w: number, h: number): void {
    const { ctx } = this
    const { player, phase, dayTimeRemaining } = state
    const m = 12

    ctx.fillStyle = this.colors.bgPanel
    ctx.fillRect(x, y, w, h)
    ctx.fillStyle = this.colors.borderDim
    ctx.fillRect(x, y + h - 1, w, 1)

    if (this.isPortrait) {
      // Compact single-row HUD for portrait
      this.setFont(9)
      ctx.fillStyle = this.colors.textDim
      ctx.textAlign = 'left'
      ctx.fillText(`LOOP ${player.loopCount}`, x + m, y + h * 0.65)

      this.setFont(10)
      ctx.fillStyle = this.colors.danger
      ctx.fillText('♥'.repeat(player.hearts) + '♡'.repeat(Math.max(0, 3 - player.hearts)), x + m + 60, y + h * 0.65)

      const timerW = Math.round(w * 0.3)
      const timerX = x + w - timerW - m
      const timerColor =
        dayTimeRemaining > 0.4 ? this.colors.timerFull :
        dayTimeRemaining > 0.2 ? this.colors.timerWarn :
        this.colors.timerCrit
      this.renderStatBar(timerX, y + Math.round(h * 0.35), timerW, 6, dayTimeRemaining, timerColor)
      this.setFont(9)
      ctx.fillStyle = this.colors.textDim
      ctx.textAlign = 'right'
      ctx.fillText(this.locationName(state.player.currentLocation), timerX - m, y + h * 0.65)
      return
    }

    this.setFont(10)
    ctx.fillStyle = this.colors.textDim
    ctx.textAlign = 'left'
    ctx.fillText(`LOOP ${player.loopCount}  ·  ${phase.replace('_', ' ').toUpperCase()}`, x + m, y + 18)

    this.setFont(12)
    ctx.fillStyle = this.colors.danger
    ctx.fillText('♥'.repeat(player.hearts) + '♡'.repeat(Math.max(0, 3 - player.hearts)), x + m, y + 38)

    const statX = x + m + 80
    this.renderStatBar(statX, y + 28, 90, 8, player.stamina / 100, this.colors.safe, 'STA')
    this.renderStatBar(statX + 100, y + 28, 90, 8, player.lightReserves / 100, this.colors.accentWarm, 'LGT')

    this.setFont(11)
    ctx.fillStyle = this.colors.accentGold
    ctx.textAlign = 'left'
    ctx.fillText(`◈ ${player.insight}`, statX + 208, y + 38)

    const timerW = Math.min(200, w * 0.25)
    const timerX = x + w - timerW - m
    const timerColor =
      dayTimeRemaining > 0.4 ? this.colors.timerFull :
      dayTimeRemaining > 0.2 ? this.colors.timerWarn :
      this.colors.timerCrit

    this.setFont(9)
    ctx.fillStyle = this.colors.textDim
    ctx.textAlign = 'right'
    ctx.fillText('DAY', timerX - 6, y + 38)
    this.renderStatBar(timerX, y + 28, timerW, 8, dayTimeRemaining, timerColor)

    ctx.textAlign = 'right'
    this.setFont(10)
    ctx.fillStyle = this.colors.textPrimary
    ctx.fillText(this.locationName(state.player.currentLocation), x + w - m, y + 16)
  }

  private renderLocationPanel(state: IGameState, x: number, y: number, w: number, _h: number): void {
    const { ctx } = this
    const locId = state.player.currentLocation

    this.setFont(16, 'bold')
    ctx.fillStyle = this.colors.accent
    ctx.textAlign = 'left'
    ctx.fillText(this.locationName(locId), x, y + 20)

    ctx.fillStyle = this.colors.borderDim
    ctx.fillRect(x, y + 28, w, 1)

    this.setFont(12)
    ctx.fillStyle = this.colors.textPrimary
    this.wrapText(this.locationDesc(locId), x, y + 50, w, 18)

    this.renderNPCPresence(state, x, y + 130, w)
  }

  private renderNPCPresence(state: IGameState, x: number, y: number, _w: number): void {
    const { ctx } = this
    const locId = state.player.currentLocation
    const present: Array<[string, INPCState]> = Object.entries(state.npcStates).filter(
      ([, ns]) => ns.currentLocation === locId && ns.isAlive
    ) as Array<[string, INPCState]>
    if (present.length === 0) return

    this.setFont(11)
    ctx.fillStyle = this.colors.textDim
    ctx.textAlign = 'left'
    ctx.fillText('PRESENT', x, y)

    present.forEach(([npcId, ns], i) => {
      const npcY = y + 20 + i * 44
      ctx.fillStyle = this.colors.bgHighlight
      ctx.fillRect(x, npcY, 180, 36)
      ctx.strokeStyle = this.colors.borderDim
      ctx.strokeRect(x, npcY, 180, 36)

      this.setFont(12)
      ctx.fillStyle = this.colors.textPrimary
      ctx.textAlign = 'left'
      ctx.fillText(npcId, x + 10, npcY + 15)
      this.setFont(9)
      ctx.fillStyle = this.colors.textDim
      ctx.fillText(`resonance ${state.player.resonance[npcId as keyof typeof state.player.resonance] ?? 0}  ·  tier ${ns.dialogueTier}`, x + 10, npcY + 28)

      this.addClickRegion(x, npcY, 180, 36, { type: 'interact', npcId: npcId as NPCId }, `Talk to ${npcId}`)
    })
  }

  private renderActionPanel(state: IGameState, x: number, y: number, w: number, h: number): void {
    const { ctx } = this
    const m = 12

    ctx.fillStyle = this.colors.bgPanel
    ctx.fillRect(x, y, w, h)
    ctx.fillStyle = this.colors.borderDim
    ctx.fillRect(x, y, 1, h)

    this.setFont(9)
    ctx.fillStyle = this.colors.textDim
    ctx.textAlign = 'left'
    ctx.fillText('MOVE TO', x + m, y + m + 10)

    const adjacent = getAdjacentLocations(state.player.currentLocation)
    let btnY = y + m + 26

    for (const loc of adjacent) {
      const btnH = 34
      const btnW = w - m * 2
      const isDiscovered = state.player.discoveredLocations.has(loc.id)

      ctx.fillStyle = this.colors.bgHighlight
      ctx.fillRect(x + m, btnY, btnW, btnH)

      this.setFont(11)
      ctx.fillStyle = isDiscovered ? this.colors.textPrimary : this.colors.accentGold
      ctx.textAlign = 'left'
      ctx.fillText(
        (isDiscovered ? '' : '★ ') + this.locationName(loc.id),
        x + m + 8, btnY + 14
      )
      this.setFont(9)
      ctx.fillStyle = this.colors.textDim
      ctx.fillText(loc.dangerousAtNight ? '⚠ dangerous at night' : 'safe', x + m + 8, btnY + 26)

      this.addClickRegion(x + m, btnY, btnW, btnH, { type: 'move', target: loc.id }, this.locationName(loc.id))
      btnY += btnH + 6
    }

    ctx.fillStyle = this.colors.borderDim
    ctx.fillRect(x + m, btnY + 4, w - m * 2, 1)
    btnY += 14

    this.renderActionButton(x + m, btnY, w - m * 2, 30, '⏸  WAIT', this.colors.textDim)
    btnY += 36

    this.setFont(9)
    ctx.fillStyle = this.colors.textFaint
    ctx.textAlign = 'left'
    ctx.fillText('J — journal  ·  I — insight', x + m, y + h - 16)
  }

  private renderActionPanelPortrait(state: IGameState, x: number, y: number, w: number, h: number): void {
    const { ctx } = this
    const m = this.layout.margin

    ctx.fillStyle = this.colors.bgPanel
    ctx.fillRect(x, y, w, h)
    ctx.fillStyle = this.colors.borderDim
    ctx.fillRect(x, y, w, 1)

    const adjacent = getAdjacentLocations(state.player.currentLocation)
    const allActions: Array<{ label: string; action: GameAction; color: string }> = [
      ...adjacent.map(loc => ({
        label: this.locationName(loc.id),
        action: { type: 'move', target: loc.id } as GameAction,
        color: state.player.discoveredLocations.has(loc.id) ? this.colors.textPrimary : this.colors.accentGold,
      })),
      { label: 'WAIT', action: { type: 'pause.toggle' } as GameAction, color: this.colors.textDim },
    ]

    const minBtnW = Math.round(w / (allActions.length + 0.5))
    const btnH = Math.max(44, Math.round(h * 0.72))
    const btnY = y + Math.round((h - btnH) / 2)

    let btnX = x + m
    for (const item of allActions) {
      const btnW = Math.max(minBtnW, ctx.measureText(item.label).width + m * 3)
      ctx.fillStyle = this.colors.bgHighlight
      ctx.fillRect(btnX, btnY, btnW - 4, btnH)
      ctx.strokeStyle = this.colors.borderDim
      ctx.strokeRect(btnX, btnY, btnW - 4, btnH)
      this.setFont(11)
      ctx.fillStyle = item.color
      ctx.textAlign = 'center'
      ctx.fillText(item.label, btnX + (btnW - 4) / 2, btnY + btnH / 2 + Math.round(this.basePx * 0.4))
      this.addClickRegion(btnX, btnY, btnW - 4, btnH, item.action, item.label)
      btnX += btnW
    }
  }

  private renderDialogue(state: IGameState, x: number, y: number, w: number, _h: number): void {
    const { ctx } = this
    const dlg = state.activeDialogue!

    this.setFont(14, 'bold')
    ctx.fillStyle = this.colors.accent
    ctx.textAlign = 'left'
    ctx.fillText(dlg.npcId.toUpperCase(), x, y + 16)

    ctx.fillStyle = this.colors.borderBright
    ctx.fillRect(x, y + 24, w, 1)

    this.setFont(13)
    ctx.fillStyle = this.colors.textPrimary
    this.wrapText(`[${dlg.speakerTextKey}]`, x, y + 48, w, 20)

    let choiceY = y + 110
    for (const choice of dlg.availableChoices) {
      const btnH = 32
      ctx.fillStyle = choice.isAvailable ? this.colors.bgHighlight : this.colors.bgPanel
      ctx.fillRect(x, choiceY, w, btnH)
      this.setFont(11)
      ctx.fillStyle = choice.isAvailable ? this.colors.textPrimary : this.colors.textFaint
      ctx.textAlign = 'left'
      ctx.fillText(`▷  [${choice.textKey}]`, x + 12, choiceY + 14)
      if (choice.isAvailable) {
        this.addClickRegion(x, choiceY, w, btnH, { type: 'dialogue.choice', choiceId: choice.id }, choice.textKey)
      }
      choiceY += btnH + 4
    }

    this.renderActionButton(x, choiceY + 8, 100, 28, '← LEAVE', this.colors.textDim)
    this.addClickRegion(x, choiceY + 8, 100, 28, { type: 'dialogue.close' }, 'Leave dialogue')
  }

  private renderNight(state: IGameState): void {
    const { ctx, width, height } = this
    const isLit = state.phase === 'night_safe'

    const grad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, height * 0.7)
    grad.addColorStop(0, isLit ? '#101828' : '#0a0a10')
    grad.addColorStop(1, this.colors.bg)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, width, height)

    this.renderHUD(state, 0, 0, width, this.layout.hudHeight)

    const cx = width / 2
    const cy = (height + this.layout.hudHeight) / 2

    this.setFont(11)
    ctx.fillStyle = this.colors.textDim
    ctx.textAlign = 'center'
    ctx.fillText(
      isLit ? 'THE LIGHTHOUSE BURNS. NIGHT IS HELD AT BAY.' : 'DARKNESS FALLS. THE WARDEN STIRS.',
      cx, cy
    )

    if (!isLit) {
      this.setFont(10)
      ctx.fillStyle = this.colors.danger
      ctx.fillText(`light reserves: ${state.player.lightReserves}%`, cx, cy + 24)
    }
  }

  private renderVision(_state: IGameState): void {
    const { ctx, width, height } = this
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, width, height)
    const fade = 0.5 + 0.5 * Math.sin(Date.now() / 2000)
    ctx.fillStyle = `rgba(68,136,204,${fade * 0.8})`
    this.setFont(14)
    ctx.textAlign = 'center'
    ctx.fillText('The echo speaks…', width / 2, height / 2)
  }

  private renderEnding(state: IGameState): void {
    const { ctx, width, height } = this
    const cx = width / 2

    ctx.fillStyle = '#050508'
    ctx.fillRect(0, 0, width, height)

    this.setFont(20, 'bold')
    ctx.fillStyle = this.colors.textPrimary
    ctx.textAlign = 'center'
    ctx.fillText('THE LOOP ENDS', cx, height * 0.35)

    this.setFont(11)
    ctx.fillStyle = this.colors.textDim
    ctx.fillText(`Loop ${state.player.loopCount} complete`, cx, height * 0.35 + 32)

    this.setFont(12)
    const statY = height * 0.48
    ctx.fillStyle = this.colors.accentGold
    ctx.fillText(`◈ ${state.player.insightBanked} insight preserved`, cx, statY)
    ctx.fillStyle = this.colors.textDim
    ctx.fillText(`moral weight: ${state.player.moralWeight}`, cx, statY + 22)

    const btnX = cx - 80
    const btnY = height * 0.65
    this.renderActionButton(btnX, btnY, 160, 36, '▶  CONTINUE', this.colors.accent)
    this.addClickRegion(btnX, btnY, 160, 36, { type: 'start.game' }, 'Continue to next loop')
  }

  private renderStatBar(x: number, y: number, w: number, h: number, value: number, color: string, label?: string): void {
    const { ctx } = this
    ctx.fillStyle = this.colors.borderDim
    ctx.fillRect(x, y, w, h)
    ctx.fillStyle = color
    ctx.fillRect(x, y, Math.round(w * Math.max(0, Math.min(1, value))), h)
    if (label) {
      this.setFont(8)
      ctx.fillStyle = this.colors.textDim
      ctx.textAlign = 'left'
      ctx.fillText(label, x, y - 2)
    }
  }

  private renderActionButton(x: number, y: number, w: number, h: number, label: string, color: string): void {
    const { ctx } = this
    ctx.fillStyle = this.colors.bgHighlight
    ctx.fillRect(x, y, w, h)
    ctx.strokeStyle = this.colors.borderDim
    ctx.strokeRect(x, y, w, h)
    this.setFont(11)
    ctx.fillStyle = color
    ctx.textAlign = 'center'
    ctx.fillText(label, x + w / 2, y + h / 2 + 4)
  }

  private drawLighthouseIcon(cx: number, cy: number, size: number): void {
    const { ctx } = this
    ctx.lineWidth = 2
    ctx.strokeStyle = this.colors.accent
    ctx.beginPath()
    ctx.moveTo(cx - size * 0.15, cy + size * 0.5)
    ctx.lineTo(cx - size * 0.1, cy - size * 0.1)
    ctx.lineTo(cx + size * 0.1, cy - size * 0.1)
    ctx.lineTo(cx + size * 0.15, cy + size * 0.5)
    ctx.stroke()
    ctx.strokeStyle = this.colors.accentGold
    ctx.strokeRect(cx - size * 0.12, cy - size * 0.3, size * 0.24, size * 0.2)
    const beamAlpha = 0.4 + 0.4 * Math.abs(Math.sin(Date.now() / 600))
    ctx.fillStyle = `rgba(212,170,68,${beamAlpha})`
    ctx.beginPath()
    ctx.moveTo(cx, cy - size * 0.2)
    ctx.lineTo(cx - size * 0.5, cy - size * 0.7)
    ctx.lineTo(cx + size * 0.5, cy - size * 0.7)
    ctx.closePath()
    ctx.fill()
    ctx.lineWidth = 1
  }

  private wrapText(text: string, x: number, y: number, maxW: number, lineH: number): void {
    const { ctx } = this
    ctx.textAlign = 'left'
    const words = text.split(' ')
    let line = ''
    let lineY = y
    for (const word of words) {
      const test = line ? `${line} ${word}` : word
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, x, lineY)
        line = word
        lineY += lineH
      } else {
        line = test
      }
    }
    if (line) ctx.fillText(line, x, lineY)
  }

  private setFont(size: number, weight = ''): void {
    const scaled = Math.round(size * this.basePx / 11)
    this.ctx.font = `${weight ? weight + ' ' : ''}${scaled}px monospace`
  }

  private addClickRegion(x: number, y: number, w: number, h: number, action: GameAction, label: string): void {
    this.clickRegions.push({ x, y, w, h, action, label })
  }

  private handleClick(e: MouseEvent): void {
    if (!this.onAction) return
    const rect = this.canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    for (const region of this.clickRegions) {
      if (mx >= region.x && mx <= region.x + region.w && my >= region.y && my <= region.y + region.h) {
        this.onAction(region.action)
        return
      }
    }
  }

  private locationName(id: string): string {
    return id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  }

  private locationDesc(id: string): string {
    const descs: Record<string, string> = {
      keepers_cottage: 'A modest dwelling near the cliff path. The smell of old paper and sea salt. Maren tends the archive here.',
      village_square: 'The heart of the island. Villagers move with purpose, eyes cast low. The well stands dry.',
      harbor: 'Weathered boats creak against the dock. Silas watches the horizon. The fog is thick this morning.',
      lighthouse_base: 'The base of the great tower. Its shadow falls long across the rocks. The mechanism hums faintly.',
      lighthouse_top: 'The lens room. From here you can see the whole island — and something in the water below.',
    }
    return descs[id] ?? 'You stand here. The air is still.'
  }
}
