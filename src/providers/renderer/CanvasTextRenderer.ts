import type { IRenderer, RenderContext, II18n } from '@/interfaces/index.js'
import type { IGameState, INPCState, NPCId } from '@/interfaces/index.js'
import type { GameAction } from '@/engine/InputHandler.js'
import { getAdjacentLocations } from '@/data/locations/phase1Locations.js'
import { CODEX_PAGES } from '@/data/codex/pages.js'
import { EXAMINE_DATA } from '@/data/locations/examineData.js'
import { INSIGHT_CARDS } from '@/data/insights/cards.js'
import { QUEST_REGISTRY } from '@/data/quests/index.js'

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
  private resizeDebounceTimer: ReturnType<typeof setTimeout> | null = null
  private _journalScrollOffset = 0
  private _actionScrollX = 0
  private _touchStartX = 0
  private _touchStartY = 0
  private _actionPanelY = 0
  private _actionPanelH = 0
  private _selectedDomain: import('@/interfaces/types.js').ArchiveDomain | null = null
  private _clearSaveConfirmPending = false
  private _currentActivePanel: string = 'none'
  private _visionFrame = 0
  private _i18n: II18n | null = null
  private _lastTouchY = 0
  private _journalScrollMoved = false
  private _journalContentHeight = 0

  setI18n(i18n: II18n): void { this._i18n = i18n }
  private t(key: string): string { return this._i18n ? this._i18n.t(key) : key }
  private _prevLocation = ''

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
    return Math.max(10, Math.min(Math.min(this.width, this.height) / 38, 22))
  }

  private get layout() {
    const m = Math.round(this.basePx * 1.5)
    return {
      hudHeight:    this.isPortrait ? this.lh(11) * 5   : this.lh(11) * 5.5,
      actionWidth:  this.isPortrait ? 1.0  : 0.22,
      actionHeight: this.isPortrait ? this.lh(11) * 7 : 0,
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
    canvas.addEventListener('touchstart', (e: TouchEvent) => {
      const touch = e.touches[0]
      if (!touch) return
      const rect = this.canvas.getBoundingClientRect()
      this._touchStartX = touch.clientX - rect.left
      this._touchStartY = touch.clientY - rect.top
      this._lastTouchY = this._touchStartY
      this._journalScrollMoved = false
    }, { passive: true })
    canvas.addEventListener('touchmove', (e: TouchEvent) => {
      if (this._currentActivePanel !== 'journal') return
      const touch = e.touches[0]
      if (!touch) return
      e.preventDefault()
      const rect = this.canvas.getBoundingClientRect()
      const currentY = touch.clientY - rect.top
      const dy = currentY - this._lastTouchY
      this._lastTouchY = currentY
      this._journalScrollOffset = Math.max(0, this._journalScrollOffset - dy)
      this._journalScrollMoved = true
    }, { passive: false })
    canvas.addEventListener('touchend', (e: TouchEvent) => {
      e.preventDefault()
      const touch = e.changedTouches[0]
      if (!touch) return
      const rect = this.canvas.getBoundingClientRect()
      const mx = touch.clientX - rect.left
      const my = touch.clientY - rect.top
      const dx = mx - this._touchStartX
      const dy = my - this._touchStartY
      // Horizontal swipe on action panel → scroll, don't fire action
      const inActionPanel = my >= this._actionPanelY && my <= this._actionPanelY + this._actionPanelH
      if (inActionPanel && Math.abs(dx) > 20 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        this._actionScrollX = Math.max(0, this._actionScrollX - dx)
        return
      }
      // Vertical drag in journal panel — handled in touchmove; don't fire click
      if (this._journalScrollMoved && this._currentActivePanel === 'journal') {
        this._journalScrollMoved = false
        return
      }
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
    if (this.resizeDebounceTimer) clearTimeout(this.resizeDebounceTimer)
    this.resizeDebounceTimer = setTimeout(() => {
      this._doResize(width, height)
    }, 50)
  }

  private _doResize(width: number, height: number): void {
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
    // Reset action scroll when player moves to a new location
    if (state.player.currentLocation !== this._prevLocation) {
      this._actionScrollX = 0
      this._prevLocation = state.player.currentLocation
    }
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
      case 'death':      this.renderDeath(state); break
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
    this.updateAriaLabel(state)
  }

  getContext(): RenderContext {
    return { canvas: this.canvas, ctx: this.ctx, width: this.width, height: this.height, scale: this.scale }
  }

  private renderTitle(_state: IGameState): void {
    const { ctx, width, height } = this
    const cx = width / 2
    const now = Date.now()

    const grad = ctx.createRadialGradient(cx, height * 0.4, 0, cx, height * 0.4, height * 0.7)
    grad.addColorStop(0, '#0f1020')
    grad.addColorStop(1, this.colors.bg)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, width, height)

    // Animated ASCII lighthouse — stars pulse in and out
    const starPulse = 0.4 + 0.6 * Math.abs(Math.sin(now * 0.003))
    const asciiLines: { text: string; pulse: boolean }[] = [
      { text: `         *        *`,        pulse: true  },
      { text: `       *   *    *   *`,      pulse: true  },
      { text: `      *     ****     *`,     pulse: false },
      { text: `       *   *    *   *`,      pulse: true  },
      { text: `         * *    * *`,        pulse: true  },
      { text: `           |    |`,           pulse: false },
      { text: `           |    |`,           pulse: false },
    ]

    const lineH = Math.round(this.basePx * 1.4)
    const asciiStartY = height * 0.14
    ctx.textAlign = 'center'
    this.setFont(10)
    for (let i = 0; i < asciiLines.length; i++) {
      const { text, pulse } = asciiLines[i]
      if (pulse) {
        ctx.fillStyle = `rgba(212,170,68,${starPulse})`
      } else {
        ctx.fillStyle = this.colors.accent
      }
      ctx.fillText(text, cx, asciiStartY + i * lineH)
    }

    // Lighthouse body
    const bodyY = asciiStartY + asciiLines.length * lineH
    const bodyLines = [
      `          /|    |\\`,
      `         / |    | \\`,
      `        /  |    |  \\`,
      `\u254a\u254a\u254a\u254a\u254a\u254a\u254a\u254a\u254a\u254a\u254a\u254a\u254a\u254a\u254a\u254a\u254a\u254a\u254a\u254a\u254a\u254a\u254a\u254a\u254a`,
    ]
    ctx.fillStyle = this.colors.accent
    for (let i = 0; i < bodyLines.length; i++) {
      ctx.fillText(bodyLines[i], cx, bodyY + i * lineH)
    }

    // Title
    this.setFont(28, 'bold')
    ctx.fillStyle = this.colors.accent
    ctx.textAlign = 'center'
    ctx.fillText('ECHOES OF THE LIGHTHOUSE', cx, height * 0.57)

    this.setFont(11)
    ctx.fillStyle = this.colors.textDim
    ctx.fillText('a narrative mystery \u00b7 roguelite \u00b7 canvas text edition', cx, height * 0.57 + 24)

    // Tagline
    this.setFont(10)
    ctx.fillStyle = this.colors.textDim
    ctx.fillText('KEEP THE LIGHT BURNING', cx, height * 0.68)

    // Prompt (pulsing)
    const pulse = 0.6 + 0.4 * Math.abs(Math.sin(now / 900))
    ctx.fillStyle = `rgba(68,136,204,${pulse})`
    this.setFont(13)
    ctx.fillText('[ PRESS ENTER OR CLICK ]', cx, height * 0.76)

    // Quote
    this.setFont(9)
    ctx.fillStyle = this.colors.textFaint
    ctx.fillText('"Do not let it go dark."  \u2014 H.V.', cx, height * 0.84)

    // Version \u2014 bottom right
    const version = (import.meta as { env?: Record<string, string> }).env?.VITE_APP_VERSION ?? '1.0.0'
    ctx.fillStyle = this.colors.textFaint
    ctx.textAlign = 'right'
    ctx.fillText(`v${version}`, width - 16, height - 12)
    ctx.textAlign = 'center'
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
      const warnGlyph = (player.stamina <= 2 || dayTimeRemaining < 0.2) ? ' ⚠' : ''
      ctx.fillText(this.locationName(state.player.currentLocation) + warnGlyph, timerX - m, y + h * 0.65)
      return
    }

    this.setFont(10)
    ctx.fillStyle = this.colors.textDim
    ctx.textAlign = 'left'
    ctx.fillText(`LOOP ${player.loopCount}  ·  ${phase.replace('_', ' ').toUpperCase()}`, x + m, y + this.lh(10))

    this.setFont(12)
    ctx.fillStyle = this.colors.danger
    ctx.fillText('♥'.repeat(player.hearts) + '♡'.repeat(Math.max(0, 3 - player.hearts)), x + m, y + this.lh(10) + this.lh(12))

    const statX = x + m + 80
    const row1Y = y + this.lh(10) + 4
    const row2Y = y + this.lh(10) + this.lh(12) - 4
    this.renderSegmentedBar(statX, row1Y, 90, 8, player.stamina / 100, 10, this.colors.safe, 'STA')
    this.renderStatBar(statX + 100, row1Y, 90, 8, player.lightReserves / 100, this.colors.accentWarm, 'LGT')

    // ⚠ warning glyph when stamina critical or time running out
    if (player.stamina <= 2 || dayTimeRemaining < 0.2) {
      this.setFont(12)
      ctx.fillStyle = this.colors.danger
      ctx.textAlign = 'left'
      ctx.fillText('⚠', statX + 200, row2Y)
    }

    this.setFont(11)
    ctx.fillStyle = this.colors.accentGold
    ctx.textAlign = 'left'
    ctx.fillText(`◈ ${player.insight}`, statX + 220, row2Y)

    const timerW = Math.min(200, w * 0.25)
    const timerX = x + w - timerW - m
    const timerColor =
      dayTimeRemaining > 0.4 ? this.colors.timerFull :
      dayTimeRemaining > 0.2 ? this.colors.timerWarn :
      this.colors.timerCrit

    this.setFont(9)
    ctx.fillStyle = this.colors.textDim
    ctx.textAlign = 'right'
    ctx.fillText('DAY', timerX - 6, row2Y)
    this.renderStatBar(timerX, row1Y, timerW, 8, dayTimeRemaining, timerColor)

    ctx.textAlign = 'right'
    this.setFont(10)
    ctx.fillStyle = this.colors.textPrimary
    ctx.fillText(this.locationName(state.player.currentLocation), x + w - m, y + this.lh(10))
  }

  private renderLocationPanel(state: IGameState, x: number, y: number, w: number, h: number): void {
    const { ctx } = this
    const locId = state.player.currentLocation

    this.setFont(16, 'bold')
    ctx.fillStyle = this.colors.accent
    ctx.textAlign = 'left'
    ctx.fillText(this.locationName(locId), x, y + this.lh(16))

    ctx.fillStyle = this.colors.borderDim
    ctx.fillRect(x, y + this.lh(16) + 4, w, 1)

    // If an examine was just triggered, show its flavor text prominently
    if (state.lastExaminedKey) {
      this.setFont(11)
      ctx.fillStyle = this.colors.accentGold
      ctx.textAlign = 'left'
      ctx.fillText('◈ DISCOVERY', x, y + this.lh(16) + this.lh(11) + 4)

      ctx.fillStyle = this.colors.borderBright
      ctx.fillRect(x, y + this.lh(16) + this.lh(11) * 2 + 4, w, 1)

      this.setFont(12)
      ctx.fillStyle = this.colors.textPrimary
      const examineText = this.t(state.lastExaminedKey)
      this.wrapText(examineText, x, y + this.lh(16) + this.lh(11) * 2 + this.lh(12), w, this.lh(12))

      ctx.fillStyle = this.colors.borderDim
      ctx.fillRect(x, y + this.lh(16) + this.lh(11) * 2 + this.lh(12) * 5, w, 1)

      this.setFont(10)
      ctx.fillStyle = this.colors.textFaint
      ctx.textAlign = 'left'
      ctx.fillText('(move to continue)', x, y + this.lh(16) + this.lh(11) * 2 + this.lh(12) * 5 + this.lh(10))
    } else {
      this.setFont(12)
      ctx.fillStyle = this.colors.textPrimary
      this.wrapText(this.locationDesc(locId), x, y + this.lh(16) * 2, w, this.lh(12))
    }

    const contentOffsetY = state.lastExaminedKey ? this.lh(16) + this.lh(11) * 2 + this.lh(12) * 6 + this.lh(10) : this.lh(16) * 5
    const npcH = this.renderNPCPresence(state, x, y + contentOffsetY, w)
    const examineH = this.renderExamineItems(state, x, y + contentOffsetY + npcH, w)

    if (state.player.currentLocation === 'archive_basement') {
      this.renderArchiveDesk(state, x, y + this.lh(16) * 5 + npcH + examineH, w)
    }

    this.renderTutorialHints(state, x, y + h - this.lh(11) * 4, w)
  }

  private renderNPCPresence(state: IGameState, x: number, y: number, _w: number): number {
    const { ctx } = this
    const locId = state.player.currentLocation
    const present: Array<[string, INPCState]> = Object.entries(state.npcStates).filter(
      ([, ns]) => ns.currentLocation === locId && ns.isAlive
    ) as Array<[string, INPCState]>
    if (present.length === 0) return 0

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
      const displayName = this.t(`npc.${npcId}.name`)
      const npcName = (displayName === `npc.${npcId}.name`) ? npcId : displayName

      // Resonance dots: trust/25 filled out of 4
      const trust = state.player.trust[npcId as NPCId] ?? 0
      const filledDots = Math.min(4, Math.floor(trust / 25))
      const dots = '◈'.repeat(filledDots) + '○'.repeat(4 - filledDots)
      ctx.fillText(npcName, x + 10, npcY + 15)

      this.setFont(9)
      ctx.fillStyle = this.colors.accentGold
      ctx.textAlign = 'right'
      ctx.fillText(dots, x + 170, npcY + 15)

      const titleKey = `npc.${npcId}.title`
      const npcTitle = this.t(titleKey)
      if (npcTitle !== titleKey) {
        this.setFont(9)
        ctx.fillStyle = this.colors.textDim
        ctx.fillText(npcTitle, x + 10, npcY + 28)
      } else {
        this.setFont(9)
        ctx.fillStyle = this.colors.textDim
        ctx.fillText(`resonance ${state.player.resonance[npcId as keyof typeof state.player.resonance] ?? 0}  ·  tier ${ns.dialogueTier}`, x + 10, npcY + 28)
      }

      this.addClickRegion(x, npcY, 180, 36, { type: 'interact', npcId: npcId as NPCId }, `Talk to ${npcId}`)
    })

    return 20 + present.length * 44 + 12
  }

  private renderExamineItems(state: IGameState, x: number, y: number, w: number): number {
    const { ctx } = this
    const locId = state.player.currentLocation
    const items = EXAMINE_DATA[locId]
    if (!items || items.length === 0) return 0

    this.setFont(11)
    ctx.fillStyle = this.colors.textDim
    ctx.textAlign = 'left'
    ctx.fillText('EXAMINE', x, y)

    let btnY = y + 16
    for (const item of items) {
      const examined = state.worldFlags.has(item.worldFlag)
      const btnH = 28
      const btnW = Math.min(w, 200)

      ctx.fillStyle = examined ? this.colors.bgPanel : this.colors.bgHighlight
      ctx.fillRect(x, btnY, btnW, btnH)
      ctx.strokeStyle = examined ? this.colors.borderDim : this.colors.borderBright
      ctx.strokeRect(x, btnY, btnW, btnH)

      const label = this.t(item.labelKey)
      this.setFont(10)
      ctx.fillStyle = examined ? this.colors.textDim : this.colors.textPrimary
      ctx.textAlign = 'left'
      ctx.fillText(examined ? `✓ ${label}` : label, x + 8, btnY + 18)

      if (!examined) {
        this.addClickRegion(x, btnY, btnW, btnH, { type: 'examine', itemId: item.id, locationId: locId }, label)
      }

      btnY += btnH + 4
    }

    return 16 + items.length * (28 + 4) + 12
  }

  private renderArchiveDesk(state: IGameState, x: number, y: number, w: number): void {
    const { ctx } = this
    const { player } = state

    // Section divider + header
    ctx.fillStyle = this.colors.borderDim
    ctx.fillRect(x, y + 8, w, 1)

    this.setFont(11, 'bold')
    ctx.fillStyle = this.colors.accent
    ctx.textAlign = 'left'
    ctx.fillText('◆ ARCHIVE DESK', x, y + 24)

    ctx.fillStyle = this.colors.borderDim
    ctx.fillRect(x, y + 30, w, 1)

    // Banked / current insight stats
    this.setFont(11)
    ctx.fillStyle = this.colors.textPrimary
    ctx.fillText(`Banked: ${player.insightBanked}  |  Current: ${player.insight}`, x, y + 48)

    // BANK INSIGHT button
    const bankBtnY = y + 58
    const bankBtnW = 140
    const bankBtnH = 28
    const canBank = player.insight > 0
    ctx.fillStyle = canBank ? this.colors.bgHighlight : this.colors.bgPanel
    ctx.fillRect(x, bankBtnY, bankBtnW, bankBtnH)
    ctx.strokeStyle = canBank ? this.colors.borderBright : this.colors.borderDim
    ctx.strokeRect(x, bankBtnY, bankBtnW, bankBtnH)
    this.setFont(10)
    ctx.fillStyle = canBank ? this.colors.textPrimary : this.colors.textDim
    ctx.textAlign = 'center'
    ctx.fillText('[BANK INSIGHT]', x + bankBtnW / 2, bankBtnY + 18)
    ctx.textAlign = 'left'
    if (canBank) {
      this.addClickRegion(x, bankBtnY, bankBtnW, bankBtnH, { type: 'insight.bank' }, 'Bank current insight')
    }

    // Sealable cards section header
    let cardY = bankBtnY + bankBtnH + 18
    this.setFont(11)
    ctx.fillStyle = this.colors.textDim
    ctx.textAlign = 'left'
    ctx.fillText('SEALABLE KNOWLEDGE:', x, cardY)
    cardY += 16

    for (const card of INSIGHT_CARDS) {
      const sealed = player.sealedInsights.has(card.id)
      const flagMet = !card.worldFlagRequired || state.worldFlags.has(card.worldFlagRequired)
      const affordable = player.insightBanked >= card.cost
      const canSeal = !sealed && flagMet && affordable

      const btnH = 34
      const btnW = w

      ctx.fillStyle = sealed ? this.colors.bgPanel : canSeal ? this.colors.bgHighlight : this.colors.bgPanel
      ctx.fillRect(x, cardY, btnW, btnH)
      ctx.strokeStyle = sealed ? this.colors.borderDim : flagMet ? (affordable ? this.colors.borderBright : this.colors.borderDim) : this.colors.borderDim
      ctx.strokeRect(x, cardY, btnW, btnH)

      const title = this.t(card.titleKey)
      const sealLabel = sealed ? '✓ SEALED' : `SEAL — ${card.cost}`

      this.setFont(10)
      ctx.fillStyle = sealed ? this.colors.textDim : flagMet ? this.colors.textPrimary : this.colors.textDim
      ctx.textAlign = 'left'
      ctx.fillText(`◈ ${title}`, x + 8, cardY + 14)

      this.setFont(9)
      ctx.fillStyle = sealed ? this.colors.textDim : affordable && flagMet ? this.colors.accent : this.colors.textDim
      ctx.textAlign = 'right'
      ctx.fillText(`[${sealLabel}]`, x + btnW - 8, cardY + 14)
      ctx.textAlign = 'left'

      if (!sealed && !flagMet && card.worldFlagRequired) {
        this.setFont(8)
        ctx.fillStyle = this.colors.textDim
        ctx.fillText('  requires: examine first', x + 8, cardY + 26)
      } else if (!sealed && !affordable) {
        this.setFont(8)
        ctx.fillStyle = this.colors.textDim
        ctx.fillText(`  need ${card.cost - player.insightBanked} more banked insight`, x + 8, cardY + 26)
      }

      if (canSeal) {
        this.addClickRegion(x, cardY, btnW, btnH, { type: 'seal.insight', cardId: card.id }, `Seal: ${title}`)
      }

      cardY += btnH + 4
    }
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
    let btnY = y + m + this.lh(12)

    for (const loc of adjacent) {
      const btnH = this.lh(11) * 2 + 8  // two text lines + padding, fully scaled
      const btnW = w - m * 2
      const isDiscovered = state.player.discoveredLocations.has(loc.id)

      ctx.fillStyle = this.colors.bgHighlight
      ctx.fillRect(x + m, btnY, btnW, btnH)

      // Location name
      this.setFont(11)
      ctx.fillStyle = isDiscovered ? this.colors.textPrimary : this.colors.accentGold
      ctx.textAlign = 'left'
      ctx.fillText(
        (isDiscovered ? '' : '★ ') + this.locationName(loc.id),
        x + m + 8, btnY + this.lh(11)
      )

      // Danger label — only show warning for dangerous locations, omit "safe" entirely
      if (loc.dangerousAtNight) {
        this.setFont(9)
        ctx.fillStyle = this.colors.danger
        ctx.fillText('⚠ dangerous at night', x + m + 8, btnY + this.lh(11) + this.lh(9))
      }

      this.addClickRegion(x + m, btnY, btnW, btnH, { type: 'move', target: loc.id }, this.locationName(loc.id))
      btnY += btnH + 4
    }

    ctx.fillStyle = this.colors.borderDim
    ctx.fillRect(x + m, btnY + 4, w - m * 2, 1)
    btnY += 10

    this.renderActionButton(x + m, btnY, w - m * 2, this.lh(12) * 2, '⏸  WAIT', this.colors.textDim)
    this.addClickRegion(x + m, btnY, w - m * 2, this.lh(12) * 2, { type: 'pause.toggle' }, 'Wait')
    btnY += this.lh(12) * 2 + 4

    if (state.player.currentLocation === 'lighthouse_top' &&
        (state.phase === 'day' || state.phase === 'dusk')) {
      const hasResources = state.player.lightReserves >= 30 && state.player.stamina >= 20
      const beaconColor = hasResources ? this.colors.accentWarm : this.colors.textFaint
      const bH = this.lh(12) * 2
      this.renderActionButton(x + m, btnY, w - m * 2, bH, '◈ LIGHT THE BEACON', beaconColor)
      if (hasResources) {
        this.addClickRegion(x + m, btnY, w - m * 2, bH, { type: 'light.lighthouse' }, 'Light the beacon')
      } else {
        this.setFont(8)
        ctx.fillStyle = this.colors.textFaint
        ctx.textAlign = 'left'
        ctx.fillText('needs 30 LGT + 20 STA', x + m + 4, btnY + bH + this.lh(8))
      }
      btnY += bH + 4
    }

    if (state.player.currentLocation === 'village_inn') {
      const bH = this.lh(12) * 2
      this.renderActionButton(x + m, btnY, w - m * 2, bH, '◈ REST', this.colors.safe)
      this.addClickRegion(x + m, btnY, w - m * 2, bH, { type: 'rest' }, 'Rest at the inn')
      btnY += bH + 4
    }

    this.setFont(9)
    ctx.fillStyle = this.colors.textFaint
    ctx.textAlign = 'left'
    ctx.fillText('J — journal  ·  I — insight', x + m, y + h - this.lh(9))
  }

  private renderActionPanelPortrait(state: IGameState, x: number, y: number, w: number, h: number): void {
    const { ctx } = this
    const m = this.layout.margin

    // Record panel bounds for swipe detection
    this._actionPanelY = y
    this._actionPanelH = h

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
      ...(state.player.currentLocation === 'village_inn' ?
        [{
          label: '◈ REST',
          action: { type: 'rest' } as GameAction,
          color: this.colors.safe,
        }] : []),
    ]

    // Fixed button width: min 80px, enough for label
    this.setFont(11)
    const btnH = Math.max(44, Math.round(h * 0.72))
    const btnY = y + Math.round((h - btnH) / 2)
    const btnW = Math.max(80, Math.round(w / Math.min(allActions.length, 4)))
    const totalW = allActions.length * (btnW + 4)

    // Clamp scroll offset
    this._actionScrollX = Math.max(0, Math.min(this._actionScrollX, Math.max(0, totalW - w + m * 2)))

    // Clip to panel area so buttons don't bleed outside
    ctx.save()
    ctx.beginPath()
    ctx.rect(x, y + 1, w, h - 1)
    ctx.clip()

    // Translate for scroll
    ctx.translate(-this._actionScrollX, 0)

    let btnX = x + m
    for (const item of allActions) {
      const bw = btnW
      // Register click region adjusted for scroll offset
      ctx.fillStyle = this.colors.bgHighlight
      ctx.fillRect(btnX, btnY, bw - 4, btnH)
      ctx.strokeStyle = this.colors.borderDim
      ctx.strokeRect(btnX, btnY, bw - 4, btnH)
      ctx.fillStyle = item.color
      ctx.textAlign = 'center'
      ctx.fillText(item.label, btnX + (bw - 4) / 2, btnY + btnH / 2 + Math.round(this.basePx * 0.4))
      // Click region must be in real (unscrolled) canvas coordinates
      this.addClickRegion(
        btnX - this._actionScrollX, btnY, bw - 4, btnH,
        item.action, item.label
      )
      btnX += btnW + 4
    }

    ctx.restore()

    // Scroll indicators
    const canScrollLeft  = this._actionScrollX > 0
    const canScrollRight = this._actionScrollX < totalW - w + m * 2
    const arrowY = y + h / 2
    this.setFont(14)
    ctx.textAlign = 'center'
    if (canScrollLeft) {
      ctx.fillStyle = this.colors.textPrimary
      ctx.fillText('◀', x + 10, arrowY + 5)
    }
    if (canScrollRight) {
      ctx.fillStyle = this.colors.textPrimary
      ctx.fillText('▶', x + w - 10, arrowY + 5)
    }
  }

  private renderDialogue(state: IGameState, x: number, y: number, w: number, _h: number): void {
    const { ctx } = this
    const dlg = state.activeDialogue!

    this.setFont(14, 'bold')
    ctx.fillStyle = this.colors.accent
    ctx.textAlign = 'left'
    const rawDisplayName = this.t(`npc.${dlg.npcId}.name`)
    const speakerName = (rawDisplayName === `npc.${dlg.npcId}.name`) ? dlg.npcId : rawDisplayName
    ctx.fillText(speakerName.toUpperCase(), x, y + this.lh(14))

    ctx.fillStyle = this.colors.borderBright
    ctx.fillRect(x, y + this.lh(14) + 6, w, 1)

    this.setFont(13)
    ctx.fillStyle = this.colors.textPrimary
    this.wrapText(this.t(dlg.speakerTextKey), x, y + this.lh(14) + this.lh(13) + 6, w, this.lh(13))

    let choiceY = y + this.lh(14) + this.lh(13) * 4 + 6
    for (const choice of dlg.availableChoices) {
      const btnH = 32
      ctx.fillStyle = choice.isAvailable ? this.colors.bgHighlight : this.colors.bgPanel
      ctx.fillRect(x, choiceY, w, btnH)
      this.setFont(11)
      ctx.fillStyle = choice.isAvailable ? this.colors.textPrimary : this.colors.textFaint
      ctx.textAlign = 'left'
      ctx.fillText(`▷  ${this.t(choice.textKey)}`, x + 12, choiceY + 14)
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
    ctx.fillText("VAEL'S REST — NIGHT", cx, contentY + this.lh(14))

    this.setFont(11)
    ctx.fillStyle = this.colors.accentGold
    ctx.fillText('◉  Lighthouse Lit', cx, contentY + this.lh(14) + this.lh(11))

    this.setFont(12)
    ctx.fillStyle = this.colors.textPrimary
    ctx.fillText('The beacon turns slowly. The waters are quiet.', cx, contentY + this.lh(14) + this.lh(11) + this.lh(12) * 2)
    ctx.fillStyle = this.colors.textDim
    ctx.fillText('Something moves beneath the surface — but keeps its distance.', cx, contentY + this.lh(14) + this.lh(11) + this.lh(12) * 3)

    const barY = contentY + this.lh(14) + this.lh(11) + this.lh(12) * 4 + 4
    this.setFont(10)
    ctx.fillStyle = this.colors.textDim
    ctx.textAlign = 'center'
    ctx.fillText(`◈ ${state.player.insight} INSIGHT  ·  STA ${state.player.stamina}%  ·  LGT ${state.player.lightReserves}%`, cx, barY)

    const btnY = contentY + this.lh(14) + this.lh(11) + this.lh(12) * 5 + 4
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
    ctx.fillText('The darkness is complete. The lighthouse is cold.', cx, contentY + this.lh(14) + this.lh(12))
    ctx.fillStyle = this.colors.textDim
    ctx.fillText('Something stirs beneath the water.', cx, contentY + this.lh(14) + this.lh(12) * 2)

    const dangerFrac = state.nightDangerLevel / 100
    const barW = Math.min(300, width * 0.5)
    const barX = cx - barW / 2
    const barY = contentY + this.lh(14) + this.lh(12) * 3 + 4

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

    // If the vision has i18n content, use the sequence renderer
    const i18nTitle = this.t(`vision.${visionId}.title`)
    if (i18nTitle !== `vision.${visionId}.title`) {
      this.renderVisionSequence(state)
      return
    }

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
      this.wrapText(line, cx - Math.min(300, width * 0.4), lineY, Math.min(600, width * 0.8), this.lh(12))
      lineY += this.lh(12)
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

  /** Renders a vision from i18n keys `vision.{id}.title` and `vision.{id}.text`. */
  private renderVisionSequence(state: IGameState): void {
    const { ctx, width, height } = this
    const visionId = state.pendingVisions[0]
    if (!visionId) return

    const cx = width / 2
    const fadeIn = Math.min(1, this._visionFrame / 90)

    // Darkened full-panel overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.96)'
    ctx.fillRect(0, 0, width, height)

    const titleKey = `vision.${visionId}.title`
    const textKey = `vision.${visionId}.text`
    const title = this.t(titleKey) === titleKey ? 'A vision stirs…' : this.t(titleKey)
    const text = this.t(textKey) === textKey ? 'Something ancient brushes against your memory, shapeless and fleeting.' : this.t(textKey)

    ctx.globalAlpha = fadeIn

    // Title header in amber/accent
    this.setFont(13, 'bold')
    ctx.fillStyle = this.colors.accentWarm
    ctx.textAlign = 'center'
    ctx.fillText(title, cx, height * 0.25)

    ctx.fillStyle = this.colors.borderBright
    ctx.fillRect(cx - Math.min(260, width * 0.38), height * 0.29, Math.min(520, width * 0.76), 1)

    // Vision body text in warm white
    this.setFont(12)
    ctx.fillStyle = '#e8dfc0'
    const textX = cx - Math.min(280, width * 0.38)
    const textW = Math.min(560, width * 0.76)
    this.wrapText(text, textX, height * 0.36, textW, this.lh(12))

    // Dismiss prompt — appears after brief fade
    if (this._visionFrame > 60) {
      const pulse = 0.6 + 0.4 * Math.abs(Math.sin(Date.now() / 900))
      ctx.fillStyle = `rgba(204,136,68,${pulse * fadeIn})`
      this.setFont(10)
      ctx.textAlign = 'center'
      ctx.fillText('[ press any key ]', cx, height * 0.80)

      ctx.globalAlpha = 1
      const btnW = 220
      const btnH = 40
      const btnX = cx - btnW / 2
      const btnY = height * 0.80 - 24
      this.addClickRegion(btnX, btnY, btnW, btnH, { type: 'dismiss.vision' }, 'Dismiss vision')
    }

    ctx.globalAlpha = 1
  }

  private renderDeath(state: IGameState): void {
    const { ctx, width, height } = this
    const cx = width / 2
    const m = this.layout.margin

    ctx.fillStyle = '#070508'
    ctx.fillRect(0, 0, width, height)

    const panelW = Math.min(560, width - m * 4)
    const panelX = cx - panelW / 2
    let y = height * 0.18

    // Loop count
    this.setFont(10)
    ctx.fillStyle = this.colors.textFaint
    ctx.textAlign = 'center'
    ctx.fillText(`Loop #${state.player.loopCount}`, cx, y)
    y += this.lh(10)

    // Death title
    this.setFont(18, 'bold')
    ctx.fillStyle = this.colors.danger
    ctx.fillText(this.t('death.title'), cx, y)
    y += this.lh(18)

    // Cause of death
    if (state.deathCause) {
      this.setFont(12)
      ctx.fillStyle = this.colors.textPrimary
      ctx.font = `italic ${ctx.font}`
      ctx.fillText(this.t(state.deathCause), cx, y)
      y += this.lh(12)
    }

    // Divider
    ctx.fillStyle = this.colors.borderDim
    ctx.fillRect(panelX + m * 2, y, panelW - m * 4, 1)
    y += this.lh(10)

    // Last journal memory
    const lastEntry = state.player.journalEntries[state.player.journalEntries.length - 1]
    if (lastEntry) {
      this.setFont(9)
      ctx.fillStyle = this.colors.textFaint
      ctx.textAlign = 'center'
      ctx.fillText('LAST MEMORY', cx, y)
      y += this.lh(9)
      this.setFont(10)
      ctx.fillStyle = this.colors.textDim
      ctx.font = `italic ${ctx.font}`
      const memoryText = this.t(lastEntry.textKey)
      this.wrapText(memoryText.length > 160 ? memoryText.slice(0, 157) + '…' : memoryText, panelX + m, y, panelW - m * 2, this.lh(10))
      y += this.lh(10) * 3
    }

    // Divider
    ctx.fillStyle = this.colors.borderDim
    ctx.fillRect(panelX + m * 2, y, panelW - m * 4, 1)
    y += this.lh(10)

    // Tagline
    this.setFont(11)
    ctx.fillStyle = this.colors.accentGold
    ctx.textAlign = 'center'
    ctx.font = `italic ${ctx.font}`
    ctx.fillText(this.t('death.tagline'), cx, y)
    y += this.lh(11) * 2

    // Restart prompt
    const btnW = Math.min(200, panelW - m * 4)
    const btnH = 40
    const btnX = cx - btnW / 2
    this.renderActionButton(btnX, y, btnW, btnH, `▶ ${this.t('death.continue').toUpperCase()}`, this.colors.accent)
    this.addClickRegion(btnX, y, btnW, btnH, { type: 'start.game' }, 'Wake again')
  }

  private renderEnding(state: IGameState): void {
    const { ctx, width, height } = this
    const cx = width / 2
    const m = this.layout.margin

    ctx.fillStyle = '#050508'
    ctx.fillRect(0, 0, width, height)

    const endingId = state.endingId ?? 'liberation'

    // Prefer i18n-driven content; fall back to hardcoded epilogues
    const i18nTitle = this.t(`ending.${endingId}.title`)
    const i18nText  = this.t(`ending.${endingId}.text`)
    const hasI18n   = i18nTitle !== `ending.${endingId}.title`

    const fallbackEpilogues: Record<string, { title: string; text: string }> = {
      liberation:   { title: 'LIBERATION',        text: "Maren closed the archive for the last time. The records were complete. Silas watched the fog lift from the harbor — truly lift — for the first time he could remember. The lighthouse still burns. It no longer needs to." },
      keepers_peace:{ title: "THE KEEPER'S PEACE", text: "Vael remained. Not trapped — present. There is a difference, in the end. The lighthouse burns still. It always will." },
      sacrifice:    { title: 'THE SACRIFICE',      text: "The keeper's name was not recorded. That was their choice. The island keeps its bargains. It always has." },
      corruption:   { title: 'CORRUPTION',         text: "You remember now. All of it. Every loop, every face, every name. The lighthouse beam moves faster now. It knows where to look." },
      transcendence:{ title: 'TRANSCENDENCE',      text: "What was divided became whole. The lighthouse still burns — but it answers to no one now." },
    }
    const fallback = fallbackEpilogues[endingId] ?? fallbackEpilogues['liberation']

    const title = hasI18n ? i18nTitle.toUpperCase() : fallback.title
    const bodyText = hasI18n ? i18nText : fallback.text

    const sealedCount = state.player.sealedInsights.size
    const journalPct = Math.round(Math.min(100, (sealedCount / 7) * 100))

    const panelW = Math.min(600, width - m * 4)
    const panelX = cx - panelW / 2
    let panelY = m * 2

    ctx.strokeStyle = this.colors.borderBright
    ctx.lineWidth = 1
    ctx.strokeRect(panelX, panelY, panelW, height - m * 4)

    const titleSectionH = this.lh(20) + this.lh(11)
    ctx.fillStyle = this.colors.borderDim
    ctx.fillRect(panelX, panelY + titleSectionH, panelW, 1)

    this.setFont(20, 'bold')
    ctx.fillStyle = this.colors.accentGold
    ctx.textAlign = 'center'
    ctx.fillText(title, cx, panelY + this.lh(20))

    panelY += titleSectionH + 14

    // Body text (wrapped)
    this.setFont(11)
    ctx.fillStyle = this.colors.textPrimary
    ctx.textAlign = 'left'
    let textY = panelY + 8
    this.wrapText(bodyText, panelX + m, textY, panelW - m * 2, this.lh(11))
    // Estimate lines for spacing (rough: 60 chars per line)
    const estimatedLines = Math.ceil(bodyText.length / 60)
    textY += estimatedLines * this.lh(11) + this.lh(11)

    const statsY = textY + 8
    ctx.fillStyle = this.colors.borderDim
    ctx.fillRect(panelX, statsY - 8, panelW, 1)

    this.setFont(9)
    ctx.fillStyle = this.colors.textDim
    ctx.textAlign = 'left'
    ctx.fillText('JOURNAL COMPLETION', panelX + m, statsY + this.lh(9))
    this.setFont(16, 'bold')
    ctx.fillStyle = this.colors.accentGold
    ctx.fillText(`${journalPct}%`, panelX + m, statsY + this.lh(9) + this.lh(16))

    this.setFont(10)
    ctx.fillStyle = this.colors.textDim
    ctx.fillText(`Completed in ${state.player.loopCount} loop${state.player.loopCount !== 1 ? 's' : ''}   ·   Moral weight: ${state.player.moralWeight}`, panelX + m, statsY + this.lh(9) + this.lh(16) + this.lh(10))

    const btnY = statsY + this.lh(9) + this.lh(16) + this.lh(10) + this.lh(10)
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

  /** Segmented bar: draws `segments` discrete filled/unfilled blocks. */
  private renderSegmentedBar(
    x: number, y: number, w: number, h: number,
    value: number, segments: number, color: string, label?: string,
  ): void {
    const { ctx } = this
    const gap = 1
    const segW = Math.max(1, Math.floor((w - gap * (segments - 1)) / segments))
    const filled = Math.round(Math.max(0, Math.min(1, value)) * segments)
    for (let i = 0; i < segments; i++) {
      const sx = x + i * (segW + gap)
      ctx.fillStyle = i < filled ? color : this.colors.borderDim
      ctx.fillRect(sx, y, segW, h)
    }
    if (label) {
      this.setFont(8)
      ctx.fillStyle = this.colors.textDim
      ctx.textAlign = 'left'
      ctx.fillText(label, x, y - 2)
    }
  }

  /**
   * Tutorial hints overlay for first-run players.
   * Shown on loop 1 while discoveredLocations.size <= 3, fading as player explores.
   */
  private renderTutorialHints(state: IGameState, x: number, y: number, _w: number): void {
    const { discoveredLocations, loopCount } = state.player
    if (loopCount !== 1 || discoveredLocations.size > 3) return

    const { ctx } = this
    const isTouchDevice = navigator.maxTouchPoints > 0
    const moveHint = isTouchDevice
      ? this.t('tutorial.hint.move_touch')
      : this.t('tutorial.hint.move')

    const hints = [
      moveHint,
      this.t('tutorial.hint.npc'),
      this.t('tutorial.hint.examine'),
      this.t('tutorial.hint.goal'),
    ]

    // Fade out gradually as player explores more locations
    const fadeSteps = Math.max(1, discoveredLocations.size)
    const alpha = Math.max(0.15, 1 - (fadeSteps - 1) / 3) * 0.55

    ctx.save()
    ctx.globalAlpha = alpha
    this.setFont(9)
    ctx.fillStyle = this.colors.textDim
    ctx.textAlign = 'left'
    hints.forEach((hint, i) => {
      ctx.fillText(`· ${hint}`, x, y + i * 15)
    })
    ctx.restore()
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

  private wrapTextCount(text: string, maxW: number): number {
    const { ctx } = this
    const words = text.split(' ')
    let line = ''
    let count = 1
    for (const word of words) {
      const test = line ? `${line} ${word}` : word
      if (ctx.measureText(test).width > maxW && line) {
        line = word
        count++
      } else {
        line = test
      }
    }
    return count
  }

  private setFont(size: number, weight = ''): void {
    const scaled = Math.round(size * this.basePx / 11)
    this.ctx.font = `${weight ? weight + ' ' : ''}${scaled}px monospace`
  }

  /** Returns the actual pixel line height for a given font size step. */
  private lh(size: number, multiplier = 1.4): number {
    return Math.round(size * this.basePx / 11 * multiplier)
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
        if (region.action.type === 'save.clear') {
          if (this._clearSaveConfirmPending) {
            this._clearSaveConfirmPending = false
            this.onAction({ type: 'save.clear.confirmed' })
          } else {
            this._clearSaveConfirmPending = true
          }
          return
        }
        this.onAction(region.action)
        return
      }
    }
  }

  private locationName(id: string): string {
    return id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  }

  private locationDesc(id: string): string {
    const key = `location.${id}.desc`
    const val = this.t(key)
    if (val === key) {
      const fallbacks: Record<string, string> = {
        keepers_cottage:  'A modest dwelling near the cliff path. The smell of old paper and sea salt. Maren tends the archive here.',
        village_square:   'The heart of the island. Villagers move with purpose, eyes cast low. The well stands dry.',
        harbor:           'Weathered boats creak against the dock. Silas watches the horizon. The fog is thick this morning.',
        lighthouse_base:  'The base of the great tower. Its shadow falls long across the rocks. The mechanism hums faintly.',
        lighthouse_top:   'The lens room. From here you can see the whole island — and something in the water below.',
        archive_basement: 'Stone steps descending into cold air. Rows of iron shelving. Maren\'s domain. Water stains mark the walls at hip height — the flood came this far, once.',
        chapel:           'The pews are empty but the candles are lit. Someone tends this place. The stained glass is cracked; the saint\'s face replaced with rough plaster.',
        cliffside:        'Wind tears at your coat. The cliff drops eighty feet to the rocks below. You can see the lighthouse from here — and the shape beneath the water.',
        forest_path:      'The trees press close. Roots cross the path like sleeping fingers. You hear movement that stops when you stop.',
        mechanism_room:   'Gears the size of millstones turn without apparent power. The hum from above is louder here. The walls are covered in symbols no one on the island claims to recognise.',
        mill:             'The wheel still turns though the stream has been dry for years. The miller\'s log is open on the table, the last entry three weeks ago.',
        ruins:            'Crumbled walls of what was once a manor. The east wing still stands, barely. The smell of old smoke that will not quite leave.',
        tidal_caves:      'Seawater pools on the cave floor, lit from below by something bioluminescent. The tide is coming in. You have perhaps an hour.',
      }
      return fallbacks[id] ?? 'You stand here. The air is still.'
    }
    return val
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
        const nameKey = `insight.${id}.name`
        const resolvedName = this.t(nameKey)
        const displayName = resolvedName !== nameKey ? resolvedName : id.replace(/_/g, ' ')
        this.setFont(11)
        ctx.fillStyle = this.colors.accentGold
        ctx.fillText(`◈ ${displayName}`, contentX, y + 12)
        y += lineH
      }
    }

    // Show endings available based on sealed insights
    const endingRequirements: Record<string, string[]> = {
      liberation:   ['vael_origin', 'mechanism_purpose'],
      keeper_peace: ['vael_origin', 'mechanism_purpose', 'keeper_betrayal', 'spirit_binding', 'island_history', 'light_covenant', 'warden_truth'],
      sacrifice:    ['keeper_betrayal', 'spirit_binding'],
      corruption:   ['island_history'],
      transcendence:['vael_origin', 'mechanism_purpose', 'keeper_betrayal', 'spirit_binding', 'island_history', 'light_covenant', 'warden_truth'],
    }
    const endingTitles: Record<string, string> = {
      liberation:    'Liberation — Free the Vael',
      keeper_peace:  "Keeper's Peace",
      sacrifice:     'The Sacrifice',
      corruption:    'Corruption',
      transcendence: 'Transcendence',
    }
    const availableEndings = Object.entries(endingRequirements)
      .filter(([, reqs]) => reqs.every(r => state.player.sealedInsights.has(r)))
      .map(([id]) => id)

    if (availableEndings.length > 0) {
      y += lineH * 0.5
      this.setFont(10, 'bold')
      ctx.fillStyle = this.colors.accentGold
      ctx.fillText('ENDINGS AVAILABLE', contentX, y + 14)
      y += 20
      ctx.fillStyle = this.colors.borderDim
      ctx.fillRect(contentX, y, contentW, 1)
      y += lineH
      for (const endId of availableEndings) {
        this.setFont(11)
        ctx.fillStyle = this.colors.accentWarm
        ctx.fillText(`◉ ${endingTitles[endId] ?? endId}`, contentX, y + 12)
        y += lineH
      }
    }

    y += lineH * 0.5

    this.setFont(10, 'bold')
    ctx.fillStyle = this.colors.textDim
    ctx.fillText('ACTIVE QUESTS', contentX, y + 14)
    y += 20
    ctx.fillStyle = this.colors.borderDim
    ctx.fillRect(contentX, y, contentW, 1)
    y += lineH

    const activeQuestIds = Array.from(state.activeQuests)
    if (activeQuestIds.length === 0) {
      this.setFont(11)
      ctx.fillStyle = this.colors.textFaint
      ctx.fillText('(no active quests)', contentX, y + 12)
      y += lineH
    } else {
      for (const questId of activeQuestIds) {
        const quest = QUEST_REGISTRY[questId]
        if (!quest) continue

        this.setFont(12, 'bold')
        ctx.fillStyle = this.colors.accent
        ctx.fillText(`◉ ${this.t(quest.titleKey)}`, contentX, y + 14)
        y += lineH * 1.2

        this.setFont(10)
        ctx.fillStyle = this.colors.textDim
        const desc = this.t(quest.descriptionKey)
        this.wrapText(desc, contentX + 12, y + 12, contentW - 12, this.lh(10))
        y += lineH * 2.2

        for (const step of quest.steps) {
          this.setFont(11)
          ctx.fillStyle = this.colors.textPrimary
          ctx.fillText(`  □ ${this.t(step.descriptionKey)}`, contentX, y + 12)
          y += lineH
        }

        y += lineH * 0.4
      }
    }

    y += lineH * 0.5

    this.setFont(10, 'bold')
    ctx.fillStyle = this.colors.textDim
    ctx.fillText('COMPLETED QUESTS', contentX, y + 14)
    y += 20
    ctx.fillStyle = this.colors.borderDim
    ctx.fillRect(contentX, y, contentW, 1)
    y += lineH

    const completedQuestIds = Array.from(state.completedQuests)
    if (completedQuestIds.length === 0) {
      this.setFont(11)
      ctx.fillStyle = this.colors.textFaint
      ctx.fillText('(none yet)', contentX, y + 12)
      y += lineH
    } else {
      for (const questId of completedQuestIds) {
        const quest = QUEST_REGISTRY[questId]
        const title = quest ? this.t(quest.titleKey) : questId
        this.setFont(11)
        ctx.fillStyle = this.colors.accentGold
        ctx.fillText(`✓ ${title}`, contentX, y + 12)
        y += lineH
      }
    }

    y += lineH * 0.5

    this.setFont(10, 'bold')
    ctx.fillStyle = this.colors.textDim
    ctx.fillText('FIELD NOTES', contentX, y + 14)
    y += 20
    ctx.fillStyle = this.colors.borderDim
    ctx.fillRect(contentX, y, contentW, 1)
    y += lineH

    const entries = Array.from(state.player.journalEntries).reverse()
    if (entries.length === 0) {
      this.setFont(11)
      ctx.fillStyle = this.colors.textFaint
      ctx.fillText('(no entries yet)', contentX, y + 12)
      y += lineH
    } else {
      for (const entry of entries) {
        this.setFont(10)
        ctx.fillStyle = this.colors.accentWarm
        ctx.fillText(`[Loop ${entry.timestamp}] ${entry.locationId.replace(/_/g, ' ').toUpperCase()}`, contentX, y + 12)
        y += lineH * 0.8
        this.setFont(11)
        ctx.fillStyle = this.colors.textPrimary
        const text = this.t(entry.textKey)
        this.wrapText(text, contentX, y + 12, contentW, this.lh(11))
        y += lineH * 3.5
      }
    }

    // Track total content height for scroll indicator
    this._journalContentHeight = Math.max(contentH, y - contentY + this._journalScrollOffset)

    ctx.restore()

    // Scroll indicator: thin bar on right edge of journal panel
    if (this._journalContentHeight > contentH) {
      const indicatorX = panelX + panelW - 6
      const indicatorTrackH = contentH
      const indicatorH = Math.max(20, Math.round(indicatorTrackH * (contentH / this._journalContentHeight)))
      const indicatorY = contentY + Math.round((indicatorTrackH - indicatorH) * (this._journalScrollOffset / (this._journalContentHeight - contentH)))
      ctx.fillStyle = this.colors.borderDim
      ctx.fillRect(indicatorX, contentY, 3, indicatorTrackH)
      ctx.fillStyle = this.colors.borderBright
      ctx.fillRect(indicatorX, indicatorY, 3, indicatorH)
    }

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
      const label = (domain.charAt(0).toUpperCase() + domain.slice(1)).padEnd(11)
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
          const title = this.t(page.titleKey)
          const body = this.t(page.bodyKey)
          const bodyResolved = body !== page.bodyKey

          this.setFont(11, 'bold')
          ctx.fillStyle = this.colors.textPrimary
          ctx.fillText(`• ${title}`, contentX, y + 12)
          y += Math.round(this.basePx * 1.7)

          this.setFont(10)
          if (bodyResolved) {
            ctx.fillStyle = this.colors.textDim
            const bodyLines = this.wrapTextCount(body, panelW - m * 2 - 12)
            this.wrapText(body, contentX + 12, y, panelW - m * 2 - 12, this.lh(11))
            y += bodyLines * this.lh(11) + 6
          } else {
            ctx.fillStyle = this.colors.textFaint
            ctx.fillText('No entry recorded.', contentX + 12, y + 12)
            y += Math.round(this.basePx * 1.6)
          }

          ctx.fillStyle = this.colors.borderDim
          ctx.fillRect(contentX, y, panelW - m * 2, 1)
          y += 10

          if (y > panelY + panelH - 40) break
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

    // ── Node positions (x/y as fractions of map content area) ────────────────
    type LocId = import('@/interfaces/types.js').LocationId
    const NODE_POS: Record<LocId, { x: number; y: number }> = {
      lighthouse_top:    { x: 0.50, y: 0.04 },
      lighthouse_base:   { x: 0.50, y: 0.15 },
      mechanism_room:    { x: 0.28, y: 0.25 },
      cliffside:         { x: 0.23, y: 0.15 },
      tidal_caves:       { x: 0.08, y: 0.25 },
      keepers_cottage:   { x: 0.72, y: 0.25 },
      village_square:    { x: 0.72, y: 0.40 },
      village_inn:       { x: 0.55, y: 0.54 },
      harbor:            { x: 0.72, y: 0.54 },
      chapel:            { x: 0.88, y: 0.54 },
      forest_path:       { x: 0.72, y: 0.68 },
      mill:              { x: 0.88, y: 0.68 },
      ruins:             { x: 0.72, y: 0.82 },
      archive_basement:  { x: 0.72, y: 0.94 },
    }

    // Edges (bidirectional)
    const EDGES: ReadonlyArray<[LocId, LocId]> = [
      ['lighthouse_top',   'lighthouse_base'],
      ['lighthouse_base',  'mechanism_room'],
      ['lighthouse_base',  'keepers_cottage'],
      ['lighthouse_base',  'cliffside'],
      ['cliffside',        'tidal_caves'],
      ['keepers_cottage',  'village_square'],
      ['village_square',   'village_inn'],
      ['village_square',   'harbor'],
      ['village_square',   'chapel'],
      ['harbor',           'forest_path'],
      ['forest_path',      'mill'],
      ['forest_path',      'ruins'],
      ['ruins',            'archive_basement'],
    ]

    // Map content area (leave 26px at bottom for legend + footer)
    const legendH = 36
    const mapX = panelX + m
    const mapY = hY + 24
    const mapW = panelW - m * 2
    const mapH = panelH - (mapY - panelY) - legendH - 20

    const discovered = state.player.discoveredLocations
    const cur = state.player.currentLocation

    // Resolve pixel coords
    const px = (fx: number): number => mapX + Math.round(fx * mapW)
    const py = (fy: number): number => mapY + Math.round(fy * mapH)

    // ── Draw edges ────────────────────────────────────────────────────────────
    ctx.strokeStyle = this.colors.borderDim
    ctx.lineWidth = 1
    for (const [a, b] of EDGES) {
      ctx.beginPath()
      ctx.moveTo(px(NODE_POS[a].x), py(NODE_POS[a].y))
      ctx.lineTo(px(NODE_POS[b].x), py(NODE_POS[b].y))
      ctx.stroke()
    }
    ctx.lineWidth = 1

    // ── Draw nodes ────────────────────────────────────────────────────────────
    const NODE_R = 6
    const CUR_R  = 10
    const allLocIds = Object.keys(NODE_POS) as LocId[]

    for (const id of allLocIds) {
      const np = NODE_POS[id]
      const nx = px(np.x)
      const ny = py(np.y)
      const isCurrent    = cur === id
      const isDiscovered = discovered.has(id)

      if (isCurrent) {
        // Outer accent ring
        ctx.strokeStyle = this.colors.accent
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(nx, ny, CUR_R, 0, Math.PI * 2)
        ctx.stroke()
        ctx.lineWidth = 1
        // Filled core
        ctx.fillStyle = this.colors.accentWarm
        ctx.beginPath()
        ctx.arc(nx, ny, NODE_R, 0, Math.PI * 2)
        ctx.fill()
      } else if (isDiscovered) {
        ctx.fillStyle = this.colors.textPrimary
        ctx.beginPath()
        ctx.arc(nx, ny, NODE_R, 0, Math.PI * 2)
        ctx.fill()
      } else {
        // Unknown — dim dot
        ctx.fillStyle = this.colors.textFaint
        ctx.beginPath()
        ctx.arc(nx, ny, 3, 0, Math.PI * 2)
        ctx.fill()
      }

      // Label (discovered or current only)
      if (isDiscovered || isCurrent) {
        const label = id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        this.setFont(8)
        ctx.fillStyle = isCurrent ? this.colors.accentWarm : this.colors.textDim
        ctx.textAlign = 'center'
        ctx.fillText(label, nx, ny + CUR_R + 10)
      }
    }

    // ── Legend ────────────────────────────────────────────────────────────────
    const legendY = panelY + panelH - legendH
    ctx.fillStyle = this.colors.borderDim
    ctx.fillRect(panelX + m, legendY, panelW - m * 2, 1)

    this.setFont(9)
    ctx.textAlign = 'left'
    const lx = panelX + m

    // Discovered dot
    ctx.fillStyle = this.colors.textPrimary
    ctx.beginPath()
    ctx.arc(lx + 6, legendY + 14, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = this.colors.textDim
    ctx.fillText('discovered', lx + 16, legendY + 18)

    // Current ring
    ctx.strokeStyle = this.colors.accent
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(lx + 110, legendY + 14, 7, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fillStyle = this.colors.accentWarm
    ctx.beginPath()
    ctx.arc(lx + 110, legendY + 14, 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.lineWidth = 1
    ctx.fillStyle = this.colors.textDim
    ctx.fillText('current', lx + 122, legendY + 18)

    // Unknown dot
    ctx.fillStyle = this.colors.textFaint
    ctx.beginPath()
    ctx.arc(lx + 192, legendY + 14, 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = this.colors.textDim
    ctx.fillText('unknown', lx + 200, legendY + 18)

    // Footer
    const footerY = panelY + panelH - 8
    this.setFont(9)
    ctx.fillStyle = this.colors.textFaint
    ctx.textAlign = 'right'
    const phaseName = state.phase.replace('_', ' ').toUpperCase()
    ctx.fillText(`${phaseName}  ·  ${Math.round(state.dayTimeRemaining * 100)}% day remaining`, panelX + panelW - m, footerY)
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
    ctx.fillText('[S] close', panelX + panelW - m, hY)

    ctx.fillStyle = this.colors.borderDim
    ctx.fillRect(panelX + m, hY + 8, panelW - m * 2, 1)

    let y = hY + 28
    const contentX = panelX + m
    const rowH = Math.round(this.basePx * 2.6)
    const SEGS = 10
    const segGap = 2
    const segTotalW = Math.min(200, Math.round((panelW - m * 2) * 0.45))
    const segW = Math.round((segTotalW - segGap * (SEGS - 1)) / SEGS)
    const segH = 14
    const labelW = 140

    // ── AUDIO section ─────────────────────────────────────────────────────────
    this.setFont(10, 'bold')
    ctx.fillStyle = this.colors.textDim
    ctx.textAlign = 'left'
    ctx.fillText('AUDIO', contentX, y + 14)
    y += 24

    const volumes: Array<{
      label: string
      key: 'masterVolume' | 'ambientVolume' | 'uiVolume' | 'narrativeVolume'
    }> = [
      { label: 'Master Volume', key: 'masterVolume' },
      { label: 'Ambient',       key: 'ambientVolume' },
      { label: 'UI Sounds',     key: 'uiVolume' },
      { label: 'Narrative',     key: 'narrativeVolume' },
    ]

    for (const vol of volumes) {
      const value = state.settings[vol.key]
      const filledSegs = Math.round(value * SEGS)

      this.setFont(11)
      ctx.fillStyle = this.colors.textPrimary
      ctx.textAlign = 'left'
      ctx.fillText(vol.label, contentX, y + segH)

      const sx = contentX + labelW
      for (let i = 0; i < SEGS; i++) {
        const segX = sx + i * (segW + segGap)
        const segY = y + 2
        ctx.fillStyle = i < filledSegs ? this.colors.accent : this.colors.borderDim
        ctx.fillRect(segX, segY, segW, segH)
        // Clickable region: each segment sets volume to (i+1)/SEGS
        const segValue = (i + 1) / SEGS
        this.addClickRegion(segX, segY, segW, segH, {
          type: 'setting.volume',
          key: vol.key,
          value: segValue,
        }, `${vol.label} ${Math.round(segValue * 100)}%`)
      }

      const pct = Math.round(value * 100)
      this.setFont(10)
      ctx.fillStyle = this.colors.textDim
      ctx.textAlign = 'left'
      ctx.fillText(`${pct}%`, sx + segTotalW + 8, y + segH)

      y += rowH
    }

    y += 12

    // ── DISPLAY section ───────────────────────────────────────────────────────
    this.setFont(10, 'bold')
    ctx.fillStyle = this.colors.textDim
    ctx.textAlign = 'left'
    ctx.fillText('DISPLAY', contentX, y + 14)
    y += 24

    this.setFont(11)
    ctx.fillStyle = this.colors.textPrimary
    ctx.fillText('Language', contentX, y + 14)
    ctx.fillStyle = this.colors.textDim
    ctx.fillText(`[${state.settings.locale} ▾]`, contentX + labelW, y + 14)
    y += rowH + 12

    // ── DATA section ──────────────────────────────────────────────────────────
    this.setFont(10, 'bold')
    ctx.fillStyle = this.colors.textDim
    ctx.textAlign = 'left'
    ctx.fillText('DATA', contentX, y + 14)
    y += 24

    const btnW = 120
    const btnH = 32

    this.renderActionButton(contentX, y, btnW, btnH, 'SAVE NOW', this.colors.safe)
    this.addClickRegion(contentX, y, btnW, btnH, { type: 'save.now' }, 'Save Now')

    const clearLabel = this._clearSaveConfirmPending ? 'CONFIRM?' : 'CLEAR SAVE'
    const clearColor = this._clearSaveConfirmPending ? this.colors.danger : this.colors.textDim
    this.renderActionButton(contentX + btnW + 16, y, btnW, btnH, clearLabel, clearColor)
    this.addClickRegion(contentX + btnW + 16, y, btnW, btnH, { type: 'save.clear' }, 'Clear Save')

    if (this._clearSaveConfirmPending) {
      this.setFont(9)
      ctx.fillStyle = this.colors.danger
      ctx.textAlign = 'left'
      ctx.fillText('Press again to confirm — this cannot be undone', contentX, y + btnH + 16)
    }
  }

  private updateAriaLabel(state: IGameState): void {
    if (!this.canvas || typeof this.canvas.setAttribute !== 'function') return
    const phase = state.phase
    const loc = state.player.currentLocation.replace(/_/g, ' ')
    const insight = state.player.insight
    const loopCount = state.player.loopCount
    this.canvas.setAttribute('aria-label',
      `Echoes of the Lighthouse. Phase: ${phase}. Location: ${loc}. Insight: ${insight}. Loop ${loopCount}.`
    )
  }

}
