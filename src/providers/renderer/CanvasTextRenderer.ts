import type { IRenderer, RenderContext } from '@/interfaces/index.js'
import type { IGameState, INPCState, NPCId } from '@/interfaces/index.js'
import type { GameAction } from '@/engine/InputHandler.js'
import { getAdjacentLocations } from '@/data/locations/phase1Locations.js'
import { CODEX_PAGES } from '@/data/codex/pages.js'

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
  private _journalScrollOffset = 0
  private _selectedDomain: import('@/interfaces/types.js').ArchiveDomain | null = null
  private _clearSaveConfirmPending = false
  private _currentActivePanel: string = 'none'
  private _visionFrame = 0

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
    canvas.addEventListener('wheel', (e: WheelEvent) => {
      if (this._currentActivePanel === 'journal') {
        this._journalScrollOffset = Math.max(0, this._journalScrollOffset + e.deltaY * 0.5)
      }
    }, { passive: true })
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
    this._currentActivePanel = state.activePanel
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = this.colors.bg
    ctx.fillRect(0, 0, width, height)

    switch (state.phase) {
      case 'title':      this.renderTitle(state); break
      case 'dawn':
      case 'day':
      case 'dusk':       this.renderDay(state);   break
      case 'night_safe': this.renderNightSafe(state); break
      case 'night_dark': this.renderNightDark(state); break
      case 'vision':     this.renderVision(state); break
      case 'ending':     this.renderEnding(state); break
    }

    if (state.activePanel !== 'none') {
      switch (state.activePanel) {
        case 'journal':  this.renderJournal(state);   break
        case 'codex':    this.renderCodex(state);    break
        case 'map':      this.renderMap(state);      break
        case 'settings': this.renderSettings(state); break
      }
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

    if (state.player.currentLocation === 'lighthouse_top' &&
        (state.phase === 'day' || state.phase === 'dusk')) {
      const hasResources = state.player.lightReserves >= 30 && state.player.stamina >= 20
      const beaconColor = hasResources ? this.colors.accentWarm : this.colors.textFaint
      this.renderActionButton(x + m, btnY, w - m * 2, 32, '◈ LIGHT THE BEACON', beaconColor)
      if (hasResources) {
        this.addClickRegion(x + m, btnY, w - m * 2, 32, { type: 'light.lighthouse' }, 'Light the beacon')
      } else {
        this.setFont(8)
        ctx.fillStyle = this.colors.textFaint
        ctx.textAlign = 'left'
        ctx.fillText('needs 30 LGT + 20 STA', x + m + 4, btnY + 44)
      }
      btnY += 40
    }

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
      ...(state.player.currentLocation === 'lighthouse_top' &&
          (state.phase === 'day' || state.phase === 'dusk') ?
        [{
          label: '◈ BEACON',
          action: { type: 'light.lighthouse' } as GameAction,
          color: (state.player.lightReserves >= 30 && state.player.stamina >= 20) ?
            this.colors.accentWarm : this.colors.textFaint,
        }] : []),
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

  private renderNightSafe(state: IGameState): void {
    const { ctx, width, height } = this
    const { hudHeight, margin } = this.layout
    const cx = width / 2

    const grad = ctx.createRadialGradient(cx, height * 0.3, 0, cx, height * 0.5, height * 0.8)
    grad.addColorStop(0, '#101828')
    grad.addColorStop(1, this.colors.bg)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, width, height)

    this.renderHUD(state, 0, 0, width, hudHeight)

    const starSeed = 42
    for (let i = 0; i < 80; i++) {
      const sx = ((Math.sin(i * starSeed) * 0.5 + 0.5)) * width
      const sy = ((Math.cos(i * starSeed * 1.3) * 0.5 + 0.5)) * height * 0.6 + hudHeight
      const alpha = 0.4 + 0.6 * Math.abs(Math.sin(Date.now() / 2000 + i * 0.7))
      ctx.fillStyle = `rgba(200,210,255,${alpha})`
      ctx.fillRect(sx, sy, 2, 2)
    }

    const beamAngle = ((Date.now() / 3000) % (Math.PI * 2))
    const beamOriginX = cx
    const beamOriginY = hudHeight + margin * 2
    const beamLen = Math.min(width, height) * 0.6
    ctx.save()
    ctx.globalAlpha = 0.18
    ctx.fillStyle = this.colors.accentGold
    ctx.beginPath()
    ctx.moveTo(beamOriginX, beamOriginY)
    const spread = Math.PI / 10
    ctx.arc(beamOriginX, beamOriginY, beamLen, beamAngle - spread, beamAngle + spread)
    ctx.closePath()
    ctx.fill()
    ctx.restore()

    const contentY = hudHeight + margin * 4
    this.setFont(14, 'bold')
    ctx.fillStyle = this.colors.accent
    ctx.textAlign = 'center'
    ctx.fillText("VAEL'S REST — NIGHT", cx, contentY + 20)

    this.setFont(11)
    ctx.fillStyle = this.colors.accentGold
    ctx.fillText('◉  Lighthouse Lit', cx, contentY + 44)

    this.setFont(12)
    ctx.fillStyle = this.colors.textPrimary
    ctx.fillText('The beacon turns slowly. The waters are quiet.', cx, contentY + 76)
    ctx.fillStyle = this.colors.textDim
    ctx.fillText('Something moves beneath the surface — but keeps its distance.', cx, contentY + 96)

    const barY = contentY + 128
    this.setFont(10)
    ctx.fillStyle = this.colors.textDim
    ctx.textAlign = 'center'
    ctx.fillText(`◈ ${state.player.insight} INSIGHT  ·  STA ${state.player.stamina}%  ·  LGT ${state.player.lightReserves}%`, cx, barY)

    const btnY = contentY + 160
    const btnW = Math.min(180, width * 0.3)
    const gap = 20
    const totalW = btnW * 2 + gap
    const b1x = cx - totalW / 2
    const b2x = cx + gap / 2

    this.renderActionButton(b1x, btnY, btnW, 36, 'WAIT UNTIL DAWN', this.colors.accent)
    this.addClickRegion(b1x, btnY, btnW, 36, { type: 'loop.dawn' }, 'Wait until dawn')

    if (state.pendingVisions.length > 0) {
      this.renderActionButton(b2x, btnY, btnW, 36, 'ENTER VISION', this.colors.accentWarm)
      this.addClickRegion(b2x, btnY, btnW, 36, { type: 'vision.continue' }, 'Enter vision')
    }
  }

  private renderNightDark(state: IGameState): void {
    const { ctx, width, height } = this
    const { hudHeight, margin } = this.layout
    const cx = width / 2

    ctx.fillStyle = '#08080d'
    ctx.fillRect(0, 0, width, height)

    this.renderHUD(state, 0, 0, width, hudHeight)

    const contentY = hudHeight + margin * 3
    this.setFont(14, 'bold')
    ctx.fillStyle = this.colors.danger
    ctx.textAlign = 'center'
    ctx.fillText('DARKNESS FALLS', cx, contentY)

    this.setFont(12)
    ctx.fillStyle = this.colors.textPrimary
    ctx.fillText('The darkness is complete. The lighthouse is cold.', cx, contentY + 32)
    ctx.fillStyle = this.colors.textDim
    ctx.fillText('Something stirs beneath the water.', cx, contentY + 54)

    const dangerFrac = state.nightDangerLevel / 100
    const barW = Math.min(300, width * 0.5)
    const barX = cx - barW / 2
    const barY = contentY + 80

    this.setFont(9)
    ctx.fillStyle = this.colors.danger
    ctx.textAlign = 'left'
    ctx.fillText('DANGER', barX, barY - 4)
    this.renderStatBar(barX, barY, barW, 10, dangerFrac, this.colors.danger)

    const btnW = Math.min(220, width * 0.4)
    const btnH = 36
    const btnX = cx - btnW / 2

    let btnY = contentY + 116

    const canRun = state.player.stamina > 0
    const runColor = canRun ? this.colors.accentWarm : this.colors.textFaint
    this.renderActionButton(btnX, btnY, btnW, btnH, '◈ RUN TO LIGHTHOUSE', runColor)
    if (canRun) {
      this.addClickRegion(btnX, btnY, btnW, btnH, { type: 'light.lighthouse' }, 'Run to lighthouse')
    }
    btnY += btnH + 8

    this.renderActionButton(btnX, btnY, btnW, btnH, '◈ HIDE (50% chance)', this.colors.textPrimary)
    this.addClickRegion(btnX, btnY, btnW, btnH, { type: 'night.hide' }, 'Hide')
    btnY += btnH + 8

    this.renderActionButton(btnX, btnY, btnW, btnH, '◈ ACCEPT DEATH', this.colors.danger)
    this.addClickRegion(btnX, btnY, btnW, btnH, { type: 'player.accept.death' }, 'Accept death')
  }

  private renderVision(state: IGameState): void {
    const { ctx, width, height } = this

    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, width, height)

    this._visionFrame = (this._visionFrame + 1) % 10000
    const fadeIn = Math.min(1, this._visionFrame / 90)

    const visionId = state.pendingVisions[0] ?? 'vision_the_binding'
    const cx = width / 2

    const visions: Record<string, { title: string; lines: string[] }> = {
      vision_the_first_keeper: {
        title: '◈  VISION: THE FIRST KEEPER  ◈',
        lines: [
          "The lighthouse was dark the night Elias made his bargain.",
          "He did not know what he offered. He thought he knew what he wanted.",
          "The thing beneath the water listened with patience older than the island.",
          "It remembered his face. It remembers yours."
        ]
      },
      vision_the_binding: {
        title: '◈  VISION: THE BINDING  ◈',
        lines: [
          "The torches smelled of salt and iron.",
          "Five men stood in a circle they could not explain and would never forget.",
          "The thing they bound was not evil. It was merely... inconvenient.",
          "It remembered their faces. It remembers yours."
        ]
      },
      vision_vaels_hunger: {
        title: "◈  VISION: VAEL'S HUNGER  ◈",
        lines: [
          "Vael was not always what it is now.",
          "Once it had a name that could be spoken without cost.",
          "The hunger came slowly, the way all hungers do — first a want, then a need, then a shape.",
          "It learned to speak in echoes. It learned to wait."
        ]
      },
      vision_the_truth: {
        title: '◈  VISION: THE TRUTH  ◈',
        lines: [
          "The island was not found. It was placed.",
          "The lighthouse was not built to guide ships. It was built to hold something still.",
          "Every keeper who came here came because something called them.",
          "The loop is not a curse. It is a lock. You are the key."
        ]
      }
    }

    const vision = visions[visionId] ?? visions['vision_the_binding']

    ctx.globalAlpha = fadeIn
    this.setFont(13, 'bold')
    ctx.fillStyle = this.colors.accent
    ctx.textAlign = 'center'
    ctx.fillText(vision.title, cx, height * 0.28)

    this.setFont(12)
    ctx.fillStyle = this.colors.textPrimary
    let lineY = height * 0.38
    for (const line of vision.lines) {
      this.wrapText(line, cx - Math.min(300, width * 0.4), lineY, Math.min(600, width * 0.8), 22)
      lineY += 28
    }

    if (this._visionFrame > 60) {
      const pulse = 0.6 + 0.4 * Math.abs(Math.sin(Date.now() / 800))
      ctx.fillStyle = `rgba(68,136,204,${pulse * fadeIn})`
      this.setFont(11)
      ctx.fillText('[ CONTINUE ]', cx, height * 0.75)
      ctx.globalAlpha = 1
      const btnW = 140
      const btnH = 36
      const btnX = cx - btnW / 2
      const btnY = height * 0.75 - 20
      this.addClickRegion(btnX, btnY, btnW, btnH, { type: 'vision.continue' }, 'Continue vision')
    }

    ctx.globalAlpha = 1
  }

  private renderEnding(state: IGameState): void {
    const { ctx, width, height } = this
    const cx = width / 2
    const m = this.layout.margin

    ctx.fillStyle = '#050508'
    ctx.fillRect(0, 0, width, height)

    const endingId = state.endingId ?? 'liberation'
    const endings: Record<string, { title: string; subtitle: string; epilogue: string[] }> = {
      liberation: {
        title: 'LIBERATION',
        subtitle: 'The sea is silent for the first time in a hundred years.',
        epilogue: [
          "Maren closed the archive for the last time. The records were complete.",
          "Silas watched the fog lift from the harbor — truly lift — for the first time he could remember.",
          "Vael's echo faded like breath on cold glass. It said nothing. It was enough.",
          "The lighthouse still burns. It no longer needs to."
        ]
      },
      keepers_peace: {
        title: "THE KEEPER'S PEACE",
        subtitle: 'Every light has its shadow. Every shadow, its light.',
        epilogue: [
          "Maren closed the archive for the last time. The records were complete.",
          "Silas never spoke of what he saw. Some silences are their own forgiveness.",
          "Vael remained. Not trapped — present. There is a difference, in the end.",
          "The lighthouse burns still. It always will."
        ]
      },
      sacrifice: {
        title: 'THE SACRIFICE',
        subtitle: 'Some bindings cannot be broken. They can only be... chosen.',
        epilogue: [
          "The keeper's name was not recorded. That was their choice.",
          "Maren found the final page blank. She left it that way.",
          "Silas saw the light that night and did not ask questions. He was grateful for that.",
          "The island keeps its bargains. It always has."
        ]
      },
      corruption: {
        title: 'CORRUPTION',
        subtitle: 'The island remembers everything. Now so do you. Forever.',
        epilogue: [
          "You remember now. All of it. Every loop, every face, every name.",
          "Maren found the archive changed. She did not understand what she read.",
          "Silas locked the harbor and did not say why. He could not explain the fear.",
          "The lighthouse beam moves faster now. It knows where to look."
        ]
      },
      transcendence: {
        title: 'TRANSCENDENCE',
        subtitle: 'What was divided becomes whole. What was bound becomes everything.',
        epilogue: [
          "Vael and the keeper became something without a name in any of Maren's books.",
          "The island exhaled. The tidal caves fell silent for the first time in a century.",
          "Silas saw the light on the horizon and felt, without knowing why, that he was forgiven.",
          "What was divided became whole. The lighthouse still burns — but it answers to no one now."
        ]
      }
    }

    const ending = endings[endingId] ?? endings['liberation']
    const sealedCount = state.player.sealedInsights.size
    const journalPct = Math.round(Math.min(100, (sealedCount / 7) * 100))

    const panelW = Math.min(600, width - m * 4)
    const panelX = cx - panelW / 2
    let panelY = m * 2

    ctx.strokeStyle = this.colors.borderBright
    ctx.lineWidth = 1
    ctx.strokeRect(panelX, panelY, panelW, height - m * 4)

    const titleSectionH = 90
    ctx.fillStyle = this.colors.borderDim
    ctx.fillRect(panelX, panelY + titleSectionH, panelW, 1)

    this.setFont(20, 'bold')
    ctx.fillStyle = this.colors.accentGold
    ctx.textAlign = 'center'
    ctx.fillText(ending.title, cx, panelY + 36)

    this.setFont(11)
    ctx.fillStyle = this.colors.textPrimary
    ctx.font = `italic ${ctx.font}`
    ctx.fillText(`"${ending.subtitle}"`, cx, panelY + 60)

    panelY += titleSectionH + 14
    this.setFont(9)
    ctx.fillStyle = this.colors.textDim
    ctx.textAlign = 'left'
    ctx.fillText('EPILOGUE', panelX + m, panelY)

    this.setFont(11)
    ctx.fillStyle = this.colors.textPrimary
    let textY = panelY + 22
    for (const line of ending.epilogue) {
      this.wrapText(line, panelX + m, textY, panelW - m * 2, 18)
      textY += 24
    }

    const statsY = textY + 16
    ctx.fillStyle = this.colors.borderDim
    ctx.fillRect(panelX, statsY - 8, panelW, 1)

    this.setFont(9)
    ctx.fillStyle = this.colors.textDim
    ctx.textAlign = 'left'
    ctx.fillText('JOURNAL COMPLETION', panelX + m, statsY + 12)
    this.setFont(16, 'bold')
    ctx.fillStyle = this.colors.accentGold
    ctx.fillText(`${journalPct}%`, panelX + m, statsY + 32)

    this.setFont(10)
    ctx.fillStyle = this.colors.textDim
    ctx.fillText(`LOOPS: ${state.player.loopCount}   MORAL WEIGHT: ${state.player.moralWeight}`, panelX + m, statsY + 54)

    const btnY = statsY + 76
    const btnW = Math.min(140, (panelW - m * 3) / 2)
    ctx.fillStyle = this.colors.borderDim
    ctx.fillRect(panelX, btnY - 12, panelW, 1)

    this.renderActionButton(panelX + m, btnY, btnW, 36, '▶ PLAY AGAIN', this.colors.accent)
    this.addClickRegion(panelX + m, btnY, btnW, 36, { type: 'start.game' }, 'Play again')

    this.renderActionButton(panelX + m * 2 + btnW, btnY, btnW, 36, 'MAIN MENU', this.colors.textDim)
    this.addClickRegion(panelX + m * 2 + btnW, btnY, btnW, 36, { type: 'main.menu' }, 'Main menu')
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

  private renderJournal(state: IGameState): void {
    const { ctx, width, height } = this
    const m = 24

    ctx.fillStyle = 'rgba(0,0,0,0.88)'
    ctx.fillRect(0, 0, width, height)

    const panelX = m
    const panelY = m
    const panelW = width - m * 2
    const panelH = height - m * 2

    ctx.fillStyle = this.colors.bgPanel
    ctx.fillRect(panelX, panelY, panelW, panelH)
    ctx.strokeStyle = this.colors.borderBright
    ctx.strokeRect(panelX, panelY, panelW, panelH)

    const hY = panelY + 28
    this.setFont(14, 'bold')
    ctx.fillStyle = this.colors.accentGold
    ctx.textAlign = 'left'
    ctx.fillText('◆ JOURNAL', panelX + m, hY)

    this.setFont(10)
    ctx.fillStyle = this.colors.textDim
    ctx.textAlign = 'right'
    ctx.fillText('[J] close', panelX + panelW - m, hY)

    ctx.fillStyle = this.colors.borderDim
    ctx.fillRect(panelX + m, hY + 8, panelW - m * 2, 1)

    const contentX = panelX + m
    const contentY = hY + 18
    const contentW = panelW - m * 2
    const contentH = panelH - (contentY - panelY) - 40
    const lineH = Math.round(this.basePx * 1.6)

    ctx.save()
    ctx.beginPath()
    ctx.rect(contentX, contentY, contentW, contentH)
    ctx.clip()

    let y = contentY - this._journalScrollOffset

    this.setFont(10, 'bold')
    ctx.fillStyle = this.colors.textDim
    ctx.textAlign = 'left'
    ctx.fillText('SEALED INSIGHTS', contentX, y + 14)
    y += 20
    ctx.fillStyle = this.colors.borderDim
    ctx.fillRect(contentX, y, contentW, 1)
    y += lineH

    const insights = Array.from(state.player.sealedInsights)
    if (insights.length === 0) {
      this.setFont(11)
      ctx.fillStyle = this.colors.textFaint
      ctx.fillText('(none yet)', contentX, y + 12)
      y += lineH
    } else {
      for (const id of insights) {
        this.setFont(11)
        ctx.fillStyle = this.colors.accentGold
        ctx.fillText(`◈ ${id}`, contentX, y + 12)
        y += lineH
      }
    }

    y += lineH * 0.5

    this.setFont(10, 'bold')
    ctx.fillStyle = this.colors.textDim
    ctx.fillText('ACTIVE THREADS', contentX, y + 14)
    y += 20
    ctx.fillStyle = this.colors.borderDim
    ctx.fillRect(contentX, y, contentW, 1)
    y += lineH

    const threads = Array.from(state.player.activeJournalThreads)
    if (threads.length === 0) {
      this.setFont(11)
      ctx.fillStyle = this.colors.textFaint
      ctx.fillText('(no active threads)', contentX, y + 12)
      y += lineH
    } else {
      for (const threadId of threads) {
        this.setFont(12)
        ctx.fillStyle = this.colors.accent
        ctx.fillText(`▶ ${threadId}`, contentX, y + 14)
        y += lineH * 1.2
      }
    }

    ctx.restore()

    const footerY = panelY + panelH - 20
    this.setFont(10)
    ctx.fillStyle = this.colors.textDim
    ctx.textAlign = 'left'
    ctx.fillText(`LOOP #${state.player.loopCount}  ·  MORAL WEIGHT: ${state.player.moralWeight}`, panelX + m, footerY)
  }

  private renderCodex(state: IGameState): void {
    const { ctx, width, height } = this
    const m = 24

    ctx.fillStyle = 'rgba(0,0,0,0.88)'
    ctx.fillRect(0, 0, width, height)

    const panelX = m
    const panelY = m
    const panelW = width - m * 2
    const panelH = height - m * 2

    ctx.fillStyle = this.colors.bgPanel
    ctx.fillRect(panelX, panelY, panelW, panelH)
    ctx.strokeStyle = this.colors.borderBright
    ctx.strokeRect(panelX, panelY, panelW, panelH)

    const hY = panelY + 28
    this.setFont(14, 'bold')
    ctx.fillStyle = this.colors.accentGold
    ctx.textAlign = 'left'
    ctx.fillText('◆ ARCHIVE CODEX', panelX + m, hY)

    this.setFont(10)
    ctx.fillStyle = this.colors.textDim
    ctx.textAlign = 'right'
    ctx.fillText('[C] close', panelX + panelW - m, hY)

    ctx.fillStyle = this.colors.borderDim
    ctx.fillRect(panelX + m, hY + 8, panelW - m * 2, 1)

    const contentX = panelX + m
    let y = hY + 28

    this.setFont(10, 'bold')
    ctx.fillStyle = this.colors.textDim
    ctx.textAlign = 'left'
    ctx.fillText('DOMAINS', contentX, y + 14)
    y += 20
    ctx.fillStyle = this.colors.borderDim
    ctx.fillRect(contentX, y, panelW - m * 2, 1)
    y += 14

    const domains: import('@/interfaces/types.js').ArchiveDomain[] = [
      'history','occult','maritime','ecology','alchemy','cartography','linguistics'
    ]
    const barW = Math.round((panelW - m * 2) * 0.35)
    const rowH = Math.round(this.basePx * 2.2)

    for (const domain of domains) {
      const count = state.player.archiveMastery[domain] ?? 0
      const label = domain.toUpperCase().slice(0, 11).padEnd(11)
      const masteryLabel = count >= 10 ? 'MASTER' : count >= 6 ? 'Adept' : count >= 3 ? 'Novice' : ''
      const fillFrac = Math.min(1, count / 10)

      this.setFont(11)
      ctx.fillStyle = this._selectedDomain === domain ? this.colors.accent : this.colors.textPrimary
      ctx.textAlign = 'left'
      ctx.fillText(`[${label}]`, contentX, y + 14)

      const bx = contentX + 110
      ctx.fillStyle = this.colors.borderDim
      ctx.fillRect(bx, y + 4, barW, 10)
      ctx.fillStyle = count >= 10 ? this.colors.accentGold : this.colors.accent
      ctx.fillRect(bx, y + 4, Math.round(barW * fillFrac), 10)

      this.setFont(10)
      ctx.fillStyle = count >= 10 ? this.colors.accentGold : this.colors.textDim
      ctx.textAlign = 'left'
      ctx.fillText(`${count}/10${masteryLabel ? ' ' + masteryLabel : ''}`, bx + barW + 8, y + 14)

      this.addClickRegion(contentX, y, panelW - m * 2, rowH, { type: 'codex.select', domain } as unknown as GameAction, domain)

      y += rowH
    }

    y += 8
    ctx.fillStyle = this.colors.borderDim
    ctx.fillRect(contentX, y, panelW - m * 2, 1)
    y += 14

    this.setFont(10, 'bold')
    ctx.fillStyle = this.colors.textDim
    ctx.textAlign = 'left'
    ctx.fillText('PAGES FOUND', contentX, y + 14)
    y += 24

    if (this._selectedDomain) {
      const domainPages = CODEX_PAGES.filter((p) => p.domain === this._selectedDomain)
      const count = state.player.archiveMastery[this._selectedDomain] ?? 0
      const found = domainPages.slice(0, count)
      if (found.length === 0) {
        this.setFont(11)
        ctx.fillStyle = this.colors.textFaint
        ctx.fillText('(no pages found in this domain)', contentX, y + 12)
      } else {
        for (const page of found) {
          this.setFont(11)
          ctx.fillStyle = this.colors.textPrimary
          ctx.fillText(`• ${page.titleKey}`, contentX, y + 12)
          y += Math.round(this.basePx * 1.6)
          if (y > panelY + panelH - 20) break
        }
      }
    } else {
      this.setFont(11)
      ctx.fillStyle = this.colors.textFaint
      ctx.fillText('(select a domain above)', contentX, y + 12)
    }
  }

  private renderMap(state: IGameState): void {
    const { ctx, width, height } = this
    const m = 24

    ctx.fillStyle = 'rgba(0,0,0,0.88)'
    ctx.fillRect(0, 0, width, height)

    const panelX = m
    const panelY = m
    const panelW = width - m * 2
    const panelH = height - m * 2

    ctx.fillStyle = this.colors.bgPanel
    ctx.fillRect(panelX, panelY, panelW, panelH)
    ctx.strokeStyle = this.colors.borderBright
    ctx.strokeRect(panelX, panelY, panelW, panelH)

    const hY = panelY + 28
    this.setFont(14, 'bold')
    ctx.fillStyle = this.colors.accentGold
    ctx.textAlign = 'left'
    ctx.fillText('◆ ISLAND MAP', panelX + m, hY)

    this.setFont(10)
    ctx.fillStyle = this.colors.textDim
    ctx.textAlign = 'right'
    ctx.fillText('[M] close', panelX + panelW - m, hY)

    ctx.fillStyle = this.colors.borderDim
    ctx.fillRect(panelX + m, hY + 8, panelW - m * 2, 1)

    const mapStartY = hY + 28
    const mapX = panelX + m
    ctx.font = `${Math.round(this.basePx * 1.45)}px monospace`
    ctx.textAlign = 'left'
    const lh = Math.round(this.basePx * 1.8)

    const discovered = state.player.discoveredLocations
    const cur = state.player.currentLocation

    const locLabel = (id: import('@/interfaces/types.js').LocationId, short: string): string => {
      if (cur === id) return `►${short}◄`
      if (discovered.has(id)) return `[${short}]`
      return '[????]'
    }
    const locColor = (id: import('@/interfaces/types.js').LocationId): string => {
      if (cur === id) return this.colors.accentWarm
      if (discovered.has(id)) return this.colors.textPrimary
      return this.colors.textFaint
    }

    type MapLine = { text: string; locations: Array<{ id: import('@/interfaces/types.js').LocationId; label: string }> }
    const mapLines: MapLine[] = [
      { text: '           N ↑', locations: [] },
      { text: '', locations: [] },
      { text: `  LH──────────CL`, locations: [
        { id: 'lighthouse_base', label: 'LH' },
        { id: 'cliffside', label: 'CL' },
      ]},
      { text: `  │                │`, locations: [] },
      { text: `  │            HARBOUR`, locations: [{ id: 'harbor', label: 'HARBOUR' }] },
      { text: `  RU──VIL──────────┤`, locations: [
        { id: 'ruins', label: 'RU' },
        { id: 'village_square', label: 'VIL' },
      ]},
      { text: `      │  ╲         PIER`, locations: [] },
      { text: `  FORGE CHAPEL APOTH`, locations: [] },
      { text: '', locations: [] },
      { text: `  COTTAGE──VIL (via path)`, locations: [{ id: 'keepers_cottage', label: 'COTTAGE' }] },
      { text: `  ARCHIVE ← via lighthouse`, locations: [{ id: 'archive_basement', label: 'ARCHIVE' }] },
      { text: `  TIDAL CAVES ← via harbour`, locations: [{ id: 'tidal_caves', label: 'TIDAL CAVES' }] },
    ]

    let ly = mapStartY
    for (const line of mapLines) {
      if (line.locations.length === 0) {
        ctx.fillStyle = this.colors.textDim
        ctx.fillText(line.text, mapX, ly + lh * 0.8)
      } else {
        ctx.fillStyle = this.colors.textDim
        ctx.fillText(line.text, mapX, ly + lh * 0.8)
        for (const loc of line.locations) {
          const idx = line.text.indexOf(loc.label)
          if (idx >= 0) {
            const before = line.text.slice(0, idx)
            const bW = ctx.measureText(before).width
            ctx.fillStyle = locColor(loc.id)
            ctx.fillText(locLabel(loc.id, loc.label), mapX + bW, ly + lh * 0.8)
          }
        }
      }
      ly += lh
    }

    const footerY = panelY + panelH - 20
    this.setFont(10)
    ctx.fillStyle = this.colors.textDim
    ctx.textAlign = 'left'
    const phaseName = state.phase.replace('_', ' ').toUpperCase()
    ctx.fillText(`Phase: ${phaseName}  ·  Time: ${Math.round(state.dayTimeRemaining * 100)}%`, panelX + m, footerY)
  }

  private renderSettings(state: IGameState): void {
    const { ctx, width, height } = this
    const m = 24

    ctx.fillStyle = 'rgba(0,0,0,0.88)'
    ctx.fillRect(0, 0, width, height)

    const panelX = m
    const panelY = m
    const panelW = width - m * 2
    const panelH = height - m * 2

    ctx.fillStyle = this.colors.bgPanel
    ctx.fillRect(panelX, panelY, panelW, panelH)
    ctx.strokeStyle = this.colors.borderBright
    ctx.strokeRect(panelX, panelY, panelW, panelH)

    const hY = panelY + 28
    this.setFont(14, 'bold')
    ctx.fillStyle = this.colors.accentGold
    ctx.textAlign = 'left'
    ctx.fillText('◆ SETTINGS', panelX + m, hY)

    this.setFont(10)
    ctx.fillStyle = this.colors.textDim
    ctx.textAlign = 'right'
    ctx.fillText('[Esc] close', panelX + panelW - m, hY)

    ctx.fillStyle = this.colors.borderDim
    ctx.fillRect(panelX + m, hY + 8, panelW - m * 2, 1)

    let y = hY + 28
    const contentX = panelX + m
    const sliderW = 120
    const rowH = Math.round(this.basePx * 2.4)

    this.setFont(10, 'bold')
    ctx.fillStyle = this.colors.textDim
    ctx.textAlign = 'left'
    ctx.fillText('AUDIO', contentX, y + 14)
    y += 24

    const volumes: Array<{ label: string; key: 'masterVolume' | 'ambientVolume' | 'uiVolume' | 'narrativeVolume' }> = [
      { label: 'Master Volume', key: 'masterVolume' },
      { label: 'Ambient', key: 'ambientVolume' },
      { label: 'UI Sounds', key: 'uiVolume' },
      { label: 'Narrative', key: 'narrativeVolume' },
    ]

    for (const vol of volumes) {
      const value = state.settings[vol.key]
      const pct = Math.round(value * 100)
      const labelW = 130

      this.setFont(11)
      ctx.fillStyle = this.colors.textPrimary
      ctx.textAlign = 'left'
      ctx.fillText(vol.label, contentX, y + 14)

      const sx = contentX + labelW
      ctx.fillStyle = this.colors.borderDim
      ctx.fillRect(sx, y + 6, sliderW, 10)
      ctx.fillStyle = this.colors.accent
      ctx.fillRect(sx, y + 6, Math.round(sliderW * value), 10)

      ctx.fillStyle = this.colors.textDim
      ctx.fillText(`${pct}%`, sx + sliderW + 8, y + 14)

      y += rowH
    }

    y += 12

    this.setFont(10, 'bold')
    ctx.fillStyle = this.colors.textDim
    ctx.textAlign = 'left'
    ctx.fillText('DISPLAY', contentX, y + 14)
    y += 24

    this.setFont(11)
    ctx.fillStyle = this.colors.textPrimary
    ctx.fillText(`Language`, contentX, y + 14)
    ctx.fillStyle = this.colors.textDim
    ctx.fillText(`[${state.settings.locale} ▾]`, contentX + 130, y + 14)
    y += rowH + 12

    this.setFont(10, 'bold')
    ctx.fillStyle = this.colors.textDim
    ctx.textAlign = 'left'
    ctx.fillText('DATA', contentX, y + 14)
    y += 24

    const btnW = 120
    const btnH = 32

    this.renderActionButton(contentX, y, btnW, btnH, 'SAVE NOW', this.colors.safe)
    this.addClickRegion(contentX, y, btnW, btnH, { type: 'save.now' } as unknown as GameAction, 'Save Now')

    const clearLabel = this._clearSaveConfirmPending ? 'CONFIRM?' : 'CLEAR SAVE'
    const clearColor = this._clearSaveConfirmPending ? this.colors.danger : this.colors.textDim
    this.renderActionButton(contentX + btnW + 16, y, btnW, btnH, clearLabel, clearColor)
    this.addClickRegion(contentX + btnW + 16, y, btnW, btnH, { type: 'save.clear' } as unknown as GameAction, 'Clear Save')
  }
}
