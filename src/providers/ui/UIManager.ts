import type { IGameState, INPCState, NPCId } from '@/interfaces/index.js'
import type { GameAction } from '@/engine/InputHandler.js'
import type { II18n } from '@/interfaces/index.js'
import { getAdjacentLocations } from '@/data/locations/phase1Locations.js'
import { EXAMINE_DATA } from '@/data/locations/examineData.js'
import { INSIGHT_CARDS } from '@/data/insights/cards.js'
import { SaveSystem } from '@/systems/SaveSystem.js'
import { CODEX_PAGES } from '@/data/codex/pages.js'
import { ENDING_NARRATIVES } from '@/data/endings/index.js'
import { HINTS } from '@/data/hints/index.js'
import { getItemAtLocation } from '@/data/items/index.js'
import type { ArchiveDomain, LocationId } from '@/interfaces/types.js'

export class UIManager {
  private onAction: ((action: GameAction) => void) | null = null

  private hud!: HTMLElement
  private contentPanel!: HTMLElement
  private actionPanel!: HTMLElement
  private overlayPanel!: HTMLElement
  private notifications!: HTMLElement
  private gameUI!: HTMLElement

  private _i18n: II18n | null = null
  private _toastTimer: ReturnType<typeof setTimeout> | null = null
  private _milestoneTimer: ReturnType<typeof setTimeout> | null = null

  setI18n(i18n: II18n): void { this._i18n = i18n }
  private t(key: string): string { return this._i18n ? this._i18n.t(key) : key }

  init(container: HTMLElement = document.body): void {
    this.hud = container.querySelector('#hud') as HTMLElement
    this.contentPanel = container.querySelector('#content-panel') as HTMLElement
    this.actionPanel = container.querySelector('#action-panel') as HTMLElement
    this.overlayPanel = container.querySelector('#overlay-panel') as HTMLElement
    this.notifications = container.querySelector('#notifications') as HTMLElement
    this.gameUI = container.querySelector('#game-ui') as HTMLElement

    // Single delegated listener for all action buttons
    container.addEventListener('click', (e: Event) => {
      const target = (e.target as HTMLElement).closest('[data-action]') as HTMLElement | null
      if (!target) return
      const raw = target.dataset['action']
      if (!raw) return
      try {
        const action = JSON.parse(raw) as GameAction
        this.onAction?.(action)
      } catch {
        // ignore parse errors
      }
    })
  }

  setActionHandler(handler: (action: GameAction) => void): void {
    this.onAction = handler
  }

  update(state: IGameState): void {
    const isTitle = state.phase === 'title'
    this.gameUI.className = isTitle ? 'title-screen' : ''

    if (isTitle) {
      this.updateTitleUI()
      return
    }

    this.updateHUD(state)
    this.updateMainArea(state)
    this.updateOverlay(state)
    this.updateNotifications(state)
  }

  private updateTitleUI(): void {
    let prompt = this.gameUI.querySelector('.title-prompt') as HTMLElement | null
    if (!prompt) {
      prompt = document.createElement('div')
      prompt.className = 'title-prompt'
      this.gameUI.appendChild(prompt)
    }
    const hasSave = SaveSystem.hasSave()
    const label = hasSave ? '[ PRESS ENTER TO CONTINUE ]' : '[ PRESS ENTER TO START ]'
    prompt.innerHTML = `
      <button class="start-btn" data-action='{"type":"start.game"}'>${label}</button>
      ${hasSave ? `<button class="new-game-btn" data-action='{"type":"new.game"}'>[ N ] NEW GAME (clears save)</button>` : ''}
    `
  }

  private removeTitle(): void {
    const p = this.gameUI.querySelector('.title-prompt')
    if (p) p.remove()
  }

  updateHUD(state: IGameState): void {
    this.removeTitle()
    const { player, phase, dayTimeRemaining } = state
    const timerClass = dayTimeRemaining > 0.4 ? '' : dayTimeRemaining > 0.2 ? 'warn' : 'crit'
    const warnGlyph = (player.stamina <= 2 || dayTimeRemaining < 0.2) ? '<span class="hud-warn">⚠</span>' : ''
    const mutedIcon = state.audioMuted ? '🔇' : '🔊'

    this.hud.innerHTML = `
      <span class="hud-loop">LOOP <span>${player.loopCount}</span></span>
      <span class="hud-phase">${phase.replace('_', ' ').toUpperCase()}</span>
      <span class="hud-hearts">${'♥'.repeat(player.hearts)}${'♡'.repeat(Math.max(0, 3 - player.hearts))}</span>
      <span class="hud-stamina">
        ⚡${player.stamina}/10
        <span class="bar-track"><span class="bar-fill" style="width:${player.stamina * 10}%"></span></span>
      </span>
      <span class="hud-light">
        LGT
        <span class="bar-track"><span class="bar-fill" style="width:${player.lightReserves}%"></span></span>
      </span>
      <span class="hud-insight">◈ ${player.insight}</span>
      ${warnGlyph}
      <span class="hud-location">${this.locationName(player.currentLocation)}</span>
      <span class="hud-timer">
        <span class="bar-track"><span class="bar-fill ${timerClass}" style="width:${Math.round(dayTimeRemaining * 100)}%"></span></span>
      </span>
      <button class="hud-mute" data-action='{"type":"pause.toggle"}' title="Toggle audio">${mutedIcon}</button>
    `
  }

  private updateMainArea(state: IGameState): void {
    if (state.activePanel !== 'none') return

    switch (state.phase) {
      case 'morning': case 'afternoon': case 'dusk': case 'dawn':
        if (state.activeDialogue?.isActive) {
          this.renderDialogue(state)
        } else {
          this.renderLocationPanel(state)
        }
        this.renderActionPanel(state)
        break
      case 'night_safe':
        this.renderNightSafe(state)
        this.renderActionPanel(state)
        break
      case 'night_dark':
        this.renderNightDark(state)
        this.renderActionPanel(state)
        break
      case 'death':
        this.renderDeathScreen(state)
        this.actionPanel.innerHTML = ''
        break
      case 'ending':
        this.renderEndingScreen(state)
        this.actionPanel.innerHTML = ''
        break
      case 'vision':
        this.renderVisionScreen(state)
        this.renderActionPanel(state)
        break
      default:
        break
    }
  }

  private renderLocationPanel(state: IGameState): void {
    const locId = state.player.currentLocation
    let html = `<h2>${this.locationName(locId)}</h2><div class="location-rule"></div>`

    if (state.lastExaminedKey) {
      html += `
        <div class="examine-result">
          <div class="examine-label">◈ DISCOVERY</div>
          <p>${this.esc(this.t(state.lastExaminedKey))}</p>
        </div>
        <div class="examine-continue">(move to continue)</div>
      `
    } else {
      html += `<p class="location-desc">${this.esc(this.locationDesc(locId))}</p>`
    }

    // NPC presence
    const present = Object.entries(state.npcStates).filter(
      ([, ns]) => (ns as INPCState).currentLocation === locId && (ns as INPCState).isAlive
    ) as Array<[string, INPCState]>

    if (present.length > 0) {
      html += `<div class="npc-list"><h3>PRESENT</h3>`
      for (const [npcId, ns] of present) {
        const rawName = this.t(`npc.${npcId}.name`)
        const npcName = rawName === `npc.${npcId}.name` ? npcId : rawName
        const trust = state.player.trust[npcId as NPCId] ?? 0
        const filledDots = Math.min(4, Math.floor(trust / 25))
        const dots = '◈'.repeat(filledDots) + '○'.repeat(4 - filledDots)
        const titleKey = `npc.${npcId}.title`
        const npcTitle = this.t(titleKey)
        const subLine = npcTitle !== titleKey ? npcTitle : `resonance ${state.player.resonance[npcId as NPCId] ?? 0} · tier ${ns.dialogueTier}`
        html += `
          <button class="npc-card" data-action='{"type":"interact","npcId":"${npcId}"}'>
            <div><div class="npc-name">${this.esc(npcName)}</div><div class="npc-sub">${this.esc(subLine)}</div></div>
            <div class="npc-dots">${dots}</div>
          </button>
        `
      }
      html += `</div>`
    }

    // Examine items
    const items = EXAMINE_DATA[locId]
    if (items && items.length > 0) {
      html += `<div class="examine-list"><h3>EXAMINE</h3>`
      for (const item of items) {
        const examined = state.worldFlags.has(item.worldFlag)
        const label = this.t(item.labelKey)
        if (examined) {
          html += `<button class="examine-btn done" disabled>✓ ${this.esc(label)}</button>`
        } else {
          html += `<button class="examine-btn" data-action='{"type":"examine","itemId":"${item.id}","locationId":"${locId}"}'>
            ${this.esc(label)}
          </button>`
        }
      }
      html += `</div>`
    }

    // Archive desk
    if (locId === 'archive_basement') {
      html += this.archiveDeskHTML(state)
    }

    html += this.tutorialHintsHTML(state)
    this.contentPanel.innerHTML = html
  }

  private archiveDeskHTML(state: IGameState): string {
    const { player } = state
    const canBank = player.insight > 0
    let html = `
      <div class="archive-desk">
        <h3>◆ ARCHIVE DESK</h3>
        <div class="archive-stats">Banked: ${player.insightBanked}  |  Current: ${player.insight}</div>
        <button class="archive-btn" ${canBank ? `data-action='{"type":"insight.bank"}'` : 'disabled'}>
          [BANK INSIGHT]
        </button>
        <div class="archive-list"><h3>SEALABLE KNOWLEDGE:</h3>
    `
    for (const card of INSIGHT_CARDS) {
      const sealed = player.sealedInsights.has(card.id)
      const flagMet = !card.worldFlagRequired || state.worldFlags.has(card.worldFlagRequired)
      const affordable = player.insightBanked >= card.cost
      const canSeal = !sealed && flagMet && affordable
      const title = this.t(card.titleKey)
      const sealLabel = sealed ? '✓ SEALED' : `SEAL — ${card.cost}`
      const note = sealed
        ? ''
        : !flagMet && card.worldFlagRequired
          ? '<div class="seal-note">requires: examine first</div>'
          : !affordable
            ? `<div class="seal-note">need ${card.cost - player.insightBanked} more banked insight</div>`
            : ''
      html += `
        <div class="seal-card ${sealed ? 'sealed' : canSeal ? 'available' : ''}"
          ${canSeal ? `data-action='{"type":"seal.insight","cardId":"${card.id}"}'` : ''}>
          <div class="seal-row">
            <span class="seal-title">◈ ${this.esc(title)}</span>
            <span class="seal-cost ${sealed ? 'done' : ''}">[${sealLabel}]</span>
          </div>
          ${note}
        </div>
      `
    }
    html += `</div></div>`
    return html
  }

  private tutorialHintsHTML(state: IGameState): string {
    const isEarlyLoop = state.player.loopCount <= 2
    if (!isEarlyLoop) return ''
    const lines: string[] = []
    if (state.player.loopCount === 1 && !state.player.discoveredLocations.has('village_inn' as LocationId)) {
      lines.push('Tip: Explore to discover new locations.')
    }
    if (!state.worldFlags.has('journal_opened')) lines.push('J — open journal')
    if (!state.worldFlags.has('codex_opened')) lines.push('I — open codex')
    if (lines.length === 0) return ''
    return `<div class="tutorial-hints">${lines.map(l => `<p>${this.esc(l)}</p>`).join('')}</div>`
  }

  private renderDialogue(state: IGameState): void {
    const dlg = state.activeDialogue!
    const rawName = this.t(`npc.${dlg.npcId}.name`)
    const speakerName = rawName === `npc.${dlg.npcId}.name` ? dlg.npcId : rawName

    let choicesHTML = ''
    for (const choice of dlg.availableChoices) {
      choicesHTML += `<button class="dialogue-choice" ${choice.isAvailable ? `data-action='{"type":"dialogue.choice","choiceId":"${choice.id}"}'` : 'disabled'}>
        ▷ ${this.esc(this.t(choice.textKey))}
      </button>`
    }

    this.contentPanel.innerHTML = `
      <div class="dialogue-box">
        <div class="dialogue-speaker">${this.esc(speakerName.toUpperCase())}</div>
        <div class="dialogue-rule"></div>
        <div class="dialogue-text">${this.esc(this.t(dlg.speakerTextKey))}</div>
        <div class="dialogue-choices">${choicesHTML}</div>
        <button class="dialogue-leave" data-action='{"type":"dialogue.close"}'>← LEAVE</button>
      </div>
    `
  }

  private renderNightSafe(state: IGameState): void {
    const locName = this.locationName(state.player.currentLocation)
    this.contentPanel.innerHTML = `
      <div class="night-safe">
        <div class="night-label">◈ SAFE HARBOUR</div>
        <p class="night-desc">You shelter at ${this.esc(locName)} as night falls.</p>
        <p class="night-desc">Stamina: ${state.player.stamina}/10 · Light Reserves: ${state.player.lightReserves}%</p>
        <button class="night-btn safe-btn" data-action='{"type":"loop.dawn"}'>AWAIT DAWN →</button>
      </div>
    `
  }

  private renderNightDark(state: IGameState): void {
    const locName = this.locationName(state.player.currentLocation)
    this.contentPanel.innerHTML = `
      <div class="night-dark">
        <div class="night-label">⚠ DARKNESS FALLS</div>
        <p class="night-desc">You are caught in the open at ${this.esc(locName)} as night descends.</p>
        <button class="night-btn dark-btn" data-action='{"type":"night.hide"}'>TRY TO HIDE</button>
        <button class="night-btn dark-btn" data-action='{"type":"player.accept.death"}'>ACCEPT FATE</button>
      </div>
    `
  }

  private renderDeathScreen(state: IGameState): void {
    const cause = state.deathCause ? this.t(state.deathCause) : 'The darkness took you.'
    this.contentPanel.innerHTML = `
      <div class="death-screen">
        <div class="death-title">◆ YOU HAVE FALLEN ◆</div>
        <p class="death-cause">${this.esc(cause)}</p>
        <p class="death-cause">Loop ${state.player.loopCount} · Insight gathered: ${state.player.insight}</p>
        <button class="death-btn" data-action='{"type":"loop.dawn"}'>BEGIN AGAIN →</button>
        <button class="death-btn" data-action='{"type":"main.menu"}'>MAIN MENU</button>
      </div>
    `
  }

  private renderEndingScreen(state: IGameState): void {
    if (!state.endingId) return
    const narrative = ENDING_NARRATIVES[state.endingId]
    const title = narrative ? this.t(narrative.titleKey) : 'THE END'
    const text = narrative ? this.t(narrative.openingKey) : ''
    this.contentPanel.innerHTML = `
      <div class="ending-screen">
        <div class="ending-title">${this.esc(title)}</div>
        <p class="ending-text">${this.esc(text)}</p>
        <button class="ending-btn" data-action='{"type":"main.menu"}'>RETURN TO LIGHTHOUSE</button>
      </div>
    `
  }

  private renderVisionScreen(state: IGameState): void {
    const visionKey = state.pendingVisions[0]
    if (!visionKey) return
    const visionText = this.t(visionKey)
    this.contentPanel.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;text-align:center;gap:16px;padding:32px;">
        <p style="font-size:14px;color:#c4cfe0;max-width:480px;line-height:1.8;font-style:italic;">${this.esc(visionText)}</p>
        <button style="background:none;border:1px solid #2e4268;color:#465a72;font-family:monospace;font-size:12px;padding:6px 16px;cursor:pointer;" data-action='{"type":"vision.continue"}'>CONTINUE →</button>
      </div>
    `
  }

  private renderActionPanel(state: IGameState): void {
    const adjacent = getAdjacentLocations(state.player.currentLocation)
    let html = `<div class="action-label">MOVE TO</div>`

    for (const loc of adjacent) {
      const isDiscovered = state.player.discoveredLocations.has(loc.id as LocationId)
      const warnLine = loc.dangerousAtNight ? `<span class="move-warn">⚠ dangerous at night</span>` : ''
      html += `<button class="move-btn ${isDiscovered ? 'discovered' : ''}" data-action='{"type":"move","target":"${loc.id}"}'>
        ${isDiscovered ? '' : '★ '}${this.esc(this.locationName(loc.id))}
        ${warnLine}
      </button>`
    }

    html += `<button class="dim-action" data-action='{"type":"wait"}'>⏸ WAIT</button>`

    if (state.player.currentLocation === 'lighthouse_top' &&
        (state.phase === 'morning' || state.phase === 'afternoon' || state.phase === 'dusk')) {
      const hasResources = state.player.lightReserves >= 30 && state.player.stamina >= 2
      html += `<button class="${hasResources ? '' : 'dim-action'}" ${hasResources ? `data-action='{"type":"light.lighthouse"}'` : 'disabled'}>
        ◈ LIGHT THE BEACON${!hasResources ? '<span style="font-size:10px;display:block">needs 30 LGT + 2 STA</span>' : ''}
      </button>`
    }

    if (state.player.currentLocation === 'village_inn') {
      html += `<button class="safe-action" data-action='{"type":"rest"}'>◈ REST</button>`
    }

    const itemHere = getItemAtLocation(state.player.currentLocation)
    if (itemHere && !state.inventory.has(itemHere.id)) {
      html += `<button data-action='{"type":"take","itemId":"${itemHere.id}"}'>
        ⬡ TAKE ${this.esc(this.t(itemHere.nameKey).toUpperCase())}
      </button>`
    }

    html += `<div class="action-hint">J — journal · I — insight</div>`
    this.actionPanel.innerHTML = html
  }

  private updateOverlay(state: IGameState): void {
    if (state.activePanel === 'none') {
      this.overlayPanel.classList.add('hidden')
      return
    }
    this.overlayPanel.classList.remove('hidden')

    switch (state.activePanel) {
      case 'journal':  this.renderJournal(state); break
      case 'codex':    this.renderCodex(state); break
      case 'map':      this.renderMapOverlay(state); break
      case 'settings': this.renderSettings(state); break
    }
  }

  private overlayWrap(title: string, body: string, panel: string): string {
    return `
      <div class="overlay-header">
        <span class="overlay-title">${title}</span>
        <button class="overlay-close" data-action='{"type":"panel.toggle","panel":"${panel}"}'>✕ CLOSE</button>
      </div>
      <div class="overlay-body">${body}</div>
    `
  }

  private renderJournal(state: IGameState): void {
    const { player } = state
    let body = ''

    const entries = [...player.journalEntries].sort((a, b) => b.timestamp - a.timestamp)
    if (entries.length === 0) {
      body += `<p style="color:#465a72;font-size:12px;">No journal entries yet. Explore and examine to record discoveries.</p>`
    } else {
      const byLoop: Map<number, typeof entries> = new Map()
      for (const e of entries) {
        if (!byLoop.has(e.timestamp)) byLoop.set(e.timestamp, [])
        byLoop.get(e.timestamp)!.push(e)
      }
      for (const [loop, loopEntries] of [...byLoop.entries()].sort((a, b) => b[0] - a[0])) {
        body += `<div class="journal-thread"><h3>LOOP ${loop}</h3>`
        for (const entry of loopEntries) {
          const loc = this.locationName(entry.locationId)
          const text = this.t(entry.textKey)
          body += `<div class="journal-entry"><div class="entry-loc">${this.esc(loc)}</div><div class="entry-text">${this.esc(text)}</div></div>`
        }
        body += `</div>`
      }
    }

    if (player.sealedInsights.size > 0) {
      body += `<h3 style="color:#e8a830;font-size:12px;margin:16px 0 8px;letter-spacing:1px;">◈ SEALED INSIGHTS</h3>`
      for (const cardId of player.sealedInsights) {
        const card = INSIGHT_CARDS.find(c => c.id === cardId)
        if (!card) continue
        const title = this.t(card.titleKey)
        const desc = this.t(card.descKey)
        body += `<div class="sealed-insight"><div class="insight-title">${this.esc(title)}</div><div class="insight-desc">${this.esc(desc)}</div></div>`
      }
    }

    this.overlayPanel.innerHTML = this.overlayWrap('◆ JOURNAL', body, 'journal')
  }

  private renderCodex(state: IGameState): void {
    const domains: ArchiveDomain[] = ['history', 'occult', 'maritime', 'ecology', 'alchemy', 'cartography', 'linguistics']
    let body = ''

    for (const domain of domains) {
      const mastery = state.player.archiveMastery[domain] ?? 0
      const pages = CODEX_PAGES.filter(p => p.domain === domain)
      const unlockedCount = Math.min(mastery, pages.length)
      body += `
        <div class="codex-domain">
          <h3>${domain.toUpperCase()} (${mastery}/${pages.length})</h3>
          <div class="codex-bar-row">
            <span class="codex-bar-label">${domain}</span>
            <div class="codex-bar-track"><div class="codex-bar-fill" style="width:${pages.length > 0 ? Math.round(mastery / pages.length * 100) : 0}%"></div></div>
          </div>
      `
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i]
        const isUnlocked = i < unlockedCount
        const title = this.t(page.titleKey)
        const text = isUnlocked ? this.t(page.bodyKey) : '???'
        body += `<div class="codex-page ${isUnlocked ? 'unlocked' : ''}">
          <div class="page-title">${this.esc(title)}</div>
          <div class="page-text">${this.esc(text)}</div>
        </div>`
      }
      body += `</div>`
    }

    this.overlayPanel.innerHTML = this.overlayWrap('◆ CODEX', body, 'codex')
  }

  private renderMapOverlay(state: IGameState): void {
    const body = `<div class="map-canvas-wrapper"><canvas id="map-canvas" width="600" height="400"></canvas></div>`
    this.overlayPanel.innerHTML = this.overlayWrap('◆ MAP', body, 'map')
    const mapCanvas = this.overlayPanel.querySelector('#map-canvas') as HTMLCanvasElement | null
    if (mapCanvas && this._mapDrawCallback) {
      this._mapDrawCallback(mapCanvas, state)
    }
  }

  private _mapDrawCallback: ((canvas: HTMLCanvasElement, state: IGameState) => void) | null = null
  setMapDrawCallback(cb: (canvas: HTMLCanvasElement, state: IGameState) => void): void {
    this._mapDrawCallback = cb
  }

  private renderSettings(state: IGameState): void {
    const { settings } = state
    const body = `
      <div class="settings-row">
        <span class="settings-label">Master Volume</span>
        <input type="range" class="settings-input" min="0" max="1" step="0.05"
          value="${settings.masterVolume}"
          data-vol-key="masterVolume">
      </div>
      <div class="settings-row">
        <span class="settings-label">Ambient Volume</span>
        <input type="range" class="settings-input" min="0" max="1" step="0.05"
          value="${settings.ambientVolume}"
          data-vol-key="ambientVolume">
      </div>
      <div class="settings-row">
        <span class="settings-label">UI Volume</span>
        <input type="range" class="settings-input" min="0" max="1" step="0.05"
          value="${settings.uiVolume}"
          data-vol-key="uiVolume">
      </div>
      <div class="settings-row">
        <span class="settings-label">Narrative Volume</span>
        <input type="range" class="settings-input" min="0" max="1" step="0.05"
          value="${settings.narrativeVolume}"
          data-vol-key="narrativeVolume">
      </div>
      <div class="settings-row">
        <span class="settings-label">Clear Save Data</span>
        <button class="settings-btn" data-action='{"type":"save.clear"}'>CLEAR SAVE</button>
      </div>
    `
    this.overlayPanel.innerHTML = this.overlayWrap('◆ SETTINGS', body, 'settings')

    const ranges = this.overlayPanel.querySelectorAll<HTMLInputElement>('input[type="range"]')
    ranges.forEach(input => {
      input.addEventListener('input', () => {
        const key = input.dataset['volKey'] as 'masterVolume' | 'ambientVolume' | 'uiVolume' | 'narrativeVolume' | undefined
        if (!key) return
        const action: GameAction = { type: 'setting.volume', key, value: parseFloat(input.value) }
        this.onAction?.(action)
      })
    })
  }

  private updateNotifications(state: IGameState): void {
    const hint = this.getActiveHint(state)
    this.renderHintNotif(hint)

    if (state.pendingAchievement && state.pendingAchievement.shownAt > Date.now() - 4000) {
      const name = this.t(state.pendingAchievement.nameKey)
      const desc = this.t(state.pendingAchievement.descKey)
      this.renderToast(name, desc)
    }
  }

  private getActiveHint(state: IGameState): string | null {
    for (const hint of HINTS) {
      const triggered = state.worldFlags.has(`hint_trigger.${hint.id}`)
      const dismissed = state.worldFlags.has(`hint_dismissed.${hint.id}`)
      if (triggered && !dismissed) return this.t(hint.textKey)
    }
    return null
  }

  private _lastHint: string | null = null
  private _lastToast: string | null = null

  private renderHintNotif(hint: string | null): void {
    if (hint === this._lastHint) return
    this._lastHint = hint

    const existing = this.notifications.querySelector('.notif-hint')
    if (existing) existing.remove()
    if (!hint) return

    const el = document.createElement('div')
    el.className = 'notif-hint'
    el.textContent = `💡 ${hint}`
    this.notifications.appendChild(el)
  }

  private renderToast(title: string, sub: string): void {
    const key = `${title}:${sub}`
    if (key === this._lastToast) return
    this._lastToast = key

    const existing = this.notifications.querySelector('.notif-toast')
    if (existing) existing.remove()

    const el = document.createElement('div')
    el.className = 'notif-toast'
    el.innerHTML = `<div class="toast-title">⚑ ${this.esc(title)}</div><div class="toast-sub">${this.esc(sub)}</div>`
    this.notifications.appendChild(el)

    if (this._toastTimer) clearTimeout(this._toastTimer)
    this._toastTimer = setTimeout(() => { el.remove(); this._lastToast = null }, 4000)
  }

  dispose(): void {
    if (this._toastTimer) clearTimeout(this._toastTimer)
    if (this._milestoneTimer) clearTimeout(this._milestoneTimer)
  }

  private locationName(id: string): string {
    const key = `location.${id}.name`
    const val = this.t(key)
    return val === key ? id.replace(/_/g, ' ') : val
  }

  private locationDesc(id: string): string {
    const key = `location.${id}.desc`
    const val = this.t(key)
    return val === key ? '' : val
  }

  private esc(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }
}
