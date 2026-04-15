import type { IGameState } from '@/interfaces/index.js'
import type { ISystem, IEventBus, IAudioProvider, IRenderer } from '@/interfaces/index.js'
import type { GameAction } from './InputHandler.js'
import type { IJournalEntry } from '@/interfaces/IGameState.js'
import type { LocationId } from '@/interfaces/types.js'
import { createInitialState } from './initialState.js'
import { MovementSystem } from '@/world/MovementSystem.js'
import { EXAMINE_DATA } from '@/data/locations/examineData.js'
import { INSIGHT_CARDS } from '@/data/insights/cards.js'
import { SaveSystem } from '@/systems/SaveSystem.js'
import { HINTS } from '@/data/hints/index.js'
import { getItemAtLocation, itemTakenFlag } from '@/data/items/index.js'
import { pickRandomEncounter, NIGHT_ENCOUNTERS } from '@/data/encounters/index.js'

/**
 * GameEngine — Owns game state, coordinates systems, drives the render loop.
 * All state changes flow through here: events from systems are applied each
 * frame, and player actions (from InputHandler) are handled synchronously.
 */
export class GameEngine {
  private state: IGameState
  private readonly systems: ISystem[] = []
  private movement!: MovementSystem
  private running = false
  private lastFrameTime = 0

  constructor(
    private readonly eventBus: IEventBus,
    private readonly renderer: IRenderer,
    private readonly _audio: IAudioProvider,
  ) {
    this.state = createInitialState()
  }

  registerSystem(system: ISystem): void {
    this.systems.push(system)
  }

  setMovementSystem(movement: MovementSystem): void {
    this.movement = movement
  }

  async start(canvas: HTMLCanvasElement): Promise<void> {
    this.renderer.init(canvas)

    for (const system of this.systems) {
      this.state = system.init(this.state)
    }

    window.addEventListener('resize', () => {
      this.renderer.resize(window.innerWidth, window.innerHeight)
      this.eventBus.emit('renderer.resized', { width: window.innerWidth, height: window.innerHeight })
    })
    this.renderer.resize(window.innerWidth, window.innerHeight)

    // Wire up event bus → state updates from events
    this.eventBus.on('audio.unlock', () => {
      this._audio.unlock()
    })

    this.running = true
    this.lastFrameTime = performance.now()
    requestAnimationFrame(t => this.loop(t))
  }

  stop(): void {
    this.running = false
  }

  getState(): IGameState {
    return this.state
  }

  loadState(state: IGameState): void {
    this.state = state
  }

  /**
   * Handle a player action. Actions come from InputHandler (keyboard/click)
   * or from rendered canvas hit-regions.
   */
  handleAction(action: GameAction): void {
    switch (action.type) {
      case 'move':
        if (this.movement) {
          if (this.state.player.stamina === 0) {
            this.state = { ...this.state, phase: 'death', deathCause: 'death.stamina_depleted' }
            break
          }
          const wasDiscovered = this.state.player.discoveredLocations.has(action.target)
          this.state = { ...this.movement.moveTo(this.state, action.target), lastExaminedKey: null }
          this.applyEvent('location.moved', { locationId: action.target })
          // Transition to death immediately when stamina is depleted by this move
          if (this.state.player.stamina === 0) {
            this.state = { ...this.state, phase: 'death', deathCause: 'death.stamina_depleted' }
            break
          }
          if (!wasDiscovered) {
            const exploreEntry: IJournalEntry = {
              id: `discover.${action.target}`,
              timestamp: this.state.player.loopCount,
              locationId: action.target,
              textKey: `location.${action.target}.enter`,
              source: 'explore',
            }
            this.state = {
              ...this.state,
              player: {
                ...this.state.player,
                journalEntries: [...this.state.player.journalEntries, exploreEntry],
              },
            }
          }
          // Trigger first_move hint after the player's first move to a new location
          if (
            this.state.player.discoveredLocations.size === 1 &&
            !this.state.worldFlags.has('hint_trigger.first_move') &&
            !this.state.worldFlags.has('hint_dismissed.first_move')
          ) {
            this.setFlag('hint_trigger.first_move')
          }
        }
        break

      case 'examine': {
        const { itemId, locationId } = action
        const items = EXAMINE_DATA[locationId as LocationId]
        const item = items?.find(i => i.id === itemId)
        if (!item) break
        if (this.state.worldFlags.has(item.worldFlag)) break
        const newFlags = new Set(this.state.worldFlags)
        newFlags.add(item.worldFlag)
        const examineEntry: IJournalEntry = {
          id: `${locationId}.${itemId}`,
          timestamp: this.state.player.loopCount,
          locationId: locationId as LocationId,
          textKey: item.textKey,
          source: 'examine',
        }
        this.state = {
          ...this.state,
          worldFlags: newFlags,
          lastExaminedKey: item.textKey,
          player: {
            ...this.state.player,
            journalEntries: [...this.state.player.journalEntries, examineEntry],
          },
        }
        this.eventBus.emit('insight.gained', { amount: item.insight })
        this.applyEvent('insight.gained', { amount: item.insight })
        this.eventBus.emit('archive.page.found', { domain: item.domain })
        this.applyEvent('archive.page.found', { domain: item.domain })
        this.eventBus.emit('examine.completed', { itemId, locationId, insight: item.insight })
        this.applyEvent('examine.completed', { itemId, locationId: locationId, insight: item.insight })
        if (this.state.player.stamina === 0) {
          this.state = { ...this.state, phase: 'death', deathCause: 'death.stamina_depleted' }
        }
        // Hint triggers after examine
        if (!this.state.worldFlags.has('hint_dismissed.first_examine')) {
          this.setFlag('hint_trigger.first_examine')
        }
        if (
          this.state.player.insight > 20 &&
          !this.state.worldFlags.has('hint_trigger.first_insight') &&
          !this.state.worldFlags.has('hint_dismissed.first_insight')
        ) {
          this.setFlag('hint_trigger.first_insight')
        }
        break
      }

      case 'interact':
        this.applyEvent('dialogue.start', { npcId: action.npcId })
        this.eventBus.emit('dialogue.start', { npcId: action.npcId })
        if (!this.state.worldFlags.has('hint_dismissed.first_npc')) {
          this.setFlag('hint_trigger.first_npc')
        }
        break

      case 'dialogue.choice':
        this.applyEvent('dialogue.choice.selected', { choiceId: action.choiceId })
        this.eventBus.emit('dialogue.choice.selected', { choiceId: action.choiceId })
        break

      case 'dialogue.close':
        this.applyEvent('dialogue.close', {})
        this.eventBus.emit('dialogue.close', {})
        break

      case 'pause.toggle':
        this.state = { ...this.state, isPaused: !this.state.isPaused }
        break

      case 'panel.toggle':
        this.state = {
          ...this.state,
          activePanel: this.state.activePanel === action.panel ? 'none' : action.panel,
        }
        if (
          action.panel === 'journal' &&
          this.state.activePanel === 'journal' &&
          !this.state.worldFlags.has('hint_dismissed.first_journal')
        ) {
          this.setFlag('hint_trigger.first_journal')
        }
        break

      case 'insight.bank':
        if (this.state.player.insight > 0) {
          this.applyEvent('insight.banked', { amount: this.state.player.insight })
          this.eventBus.emit('insight.banked', { amount: this.state.player.insight })
        }
        break

      case 'seal.insight': {
        const sealAction = action as { type: 'seal.insight'; cardId: string }
        const card = INSIGHT_CARDS.find(c => c.id === sealAction.cardId)
        if (
          card &&
          this.state.player.insightBanked >= card.cost &&
          !this.state.player.sealedInsights.has(sealAction.cardId)
        ) {
          this.applyEvent('insight.card.sealed', { cardId: sealAction.cardId })
          this.eventBus.emit('insight.card.sealed', { cardId: sealAction.cardId })
        }
        break
      }

      case 'dismiss.vision': {
        if (this.state.pendingVisions.length === 0) break
        const remaining = this.state.pendingVisions.slice(1)
        if (remaining.length === 0 && this.state.lighthouseLitThisLoop) {
          // Visions complete after lighting lighthouse — resolve ending
          const endingId = this.resolveEnding(this.state)
          const newEndingsSeen = new Set(this.state.endingsSeen)
          newEndingsSeen.add(endingId as import('@/interfaces/types.js').EndingId)
          this.state = {
            ...this.state,
            pendingVisions: [],
            phase: 'ending',
            priorPhase: null,
            endingId,
            endingsSeen: newEndingsSeen,
          }
          SaveSystem.saveState(this.state)
        } else {
          const nextPhase = remaining.length === 0
            ? (this.state.priorPhase ?? 'night_safe')
            : 'vision'
          this.state = {
            ...this.state,
            pendingVisions: remaining,
            phase: nextPhase,
            priorPhase: remaining.length === 0 ? null : this.state.priorPhase,
          }
          if (nextPhase === 'night_safe') {
            this.maybeTriggerNightEncounter()
          }
        }
        break
      }

      case 'light.lighthouse': {
        if (this.state.player.currentLocation !== 'lighthouse_top') break
        const hasResources = this.state.player.lightReserves >= 30 && this.state.player.stamina >= 2
        if (!hasResources) break
        this.state = {
          ...this.state,
          lighthouseLitThisLoop: true,
          pendingVisions: ['lighthouse_ignition', 'keeper_echo', 'final_resonance'],
          phase: 'vision',
          priorPhase: this.state.phase,
        }
        this.eventBus.emit('lighthouse.lit', {})
        break
      }

      case 'take': {
        const item = getItemAtLocation(this.state.player.currentLocation)
        if (!item || item.id !== action.itemId) break
        if (this.state.inventory.has(item.id)) break
        const newInventory = new Set(this.state.inventory)
        newInventory.add(item.id)
        const newFlags = new Set(this.state.worldFlags)
        newFlags.add(itemTakenFlag(item.id))
        this.state = {
          ...this.state,
          inventory: newInventory,
          worldFlags: newFlags,
          lastExaminedKey: item.pickupKey,
        }
        this.eventBus.emit('item.taken', { itemId: item.id, locationId: this.state.player.currentLocation })
        this.applyEvent('item.taken', { itemId: item.id, locationId: this.state.player.currentLocation })
        break
      }

      case 'rest': {
        if (this.state.player.currentLocation !== 'village_inn') break
        this.state = {
          ...this.state,
          player: { ...this.state.player, stamina: 10 },
        }
        this.applyEvent('player.rested', {})
        break
      }

      case 'wait': {
        const phaseOrder: import('@/interfaces/types.js').GamePhase[] = ['dawn', 'morning', 'afternoon', 'dusk']
        const currentIndex = phaseOrder.indexOf(this.state.phase as import('@/interfaces/types.js').GamePhase)
        if (currentIndex !== -1 && currentIndex < phaseOrder.length - 1) {
          const nextPhase = phaseOrder[currentIndex + 1]!
          this.state = { ...this.state, phase: nextPhase }
          this.eventBus.emit('time.passed', { from: this.state.phase, to: nextPhase })
        } else if (this.state.phase === 'dusk') {
          this.state = { ...this.state, phase: 'night_dark', nightDangerLevel: 2 }
          this.eventBus.emit('time.passed', { from: 'dusk', to: 'night_dark' })
          this.maybeTriggerNightEncounter()
        }
        break
      }

      case 'player.accept.death': {
        this.state = { ...this.state, phase: 'death', deathCause: this.state.deathCause ?? 'death.night_danger' }
        break
      }

      case 'start.game': {
        // If a hint is showing, Space dismisses it instead of starting/restarting
        const activeHint = HINTS.find(h =>
          this.state.worldFlags.has(h.triggerFlag) &&
          !this.state.worldFlags.has(h.dismissFlag)
        )
        if (activeHint) {
          this.setFlag(activeHint.dismissFlag)
          break
        }
        if (this.state.phase === 'title' || this.state.phase === 'ending' || this.state.phase === 'death') {
          this.eventBus.emit('loop.started', { loopCount: this.state.player.loopCount })
          if (this.state.phase === 'title') {
            const saved = SaveSystem.loadState()
            if (saved) {
              this.state = saved
            } else {
              this.state = { ...this.state, phase: 'dawn' }
            }
          } else {
            this.state = { ...this.state, deathCause: null }
            this.applyEvent('player.died', {})
            this.eventBus.emit('player.died', {})
          }
        }
        break
      }

      case 'new.game':
        SaveSystem.clearSave()
        this.state = { ...createInitialState(), phase: 'dawn', endingsSeen: this.state.endingsSeen }
        break

      case 'main.menu':
        this.state = { ...this.state, phase: 'title' }
        break

      case 'save.now':
        // eslint-disable-next-line no-case-declarations -- needed for static call
        { SaveSystem.saveState(this.state); break }

      case 'save.clear':
        // Confirm flow is handled in the renderer; engine no-ops on first click.
        break

      case 'save.clear.confirmed':
        SaveSystem.clearSave()
        this.state = createInitialState()
        break

      case 'setting.volume': {
        const { key, value } = action
        this.state = {
          ...this.state,
          settings: { ...this.state.settings, [key]: value },
        }
        const categoryMap: Record<typeof key, import('@/interfaces/types.js').AudioCategory> = {
          masterVolume:    'master',
          ambientVolume:   'ambient',
          uiVolume:        'ui',
          narrativeVolume: 'narrative',
        }
        this._audio.setVolume(categoryMap[key], value)
        break
      }

      case 'night.hide': {
        if (Math.random() < 0.5) {
          const newDanger = Math.max(0, this.state.nightDangerLevel - 20)
          this.state = { ...this.state, nightDangerLevel: newDanger }
        } else {
          this.applyEvent('night.danger.escalate', {})
        }
        break
      }

      case 'loop.dawn':
        this.state = {
          ...this.state,
          activeEncounter: null,
          nightEncounterShown: 0,
        }
        this.applyEvent('loop.dawn', {})
        this.eventBus.emit('loop.dawn', {})
        break

      case 'investigate': {
        const enc = NIGHT_ENCOUNTERS.find(e => e.id === this.state.activeEncounter)
        if (!enc || this.state.player.stamina < enc.staminaCost) break
        const newFlags = new Set(this.state.worldFlags)
        if (enc.rewardFlag) newFlags.add(enc.rewardFlag)
        const insight = enc.rewardInsight ?? 0
        this.state = {
          ...this.state,
          activeEncounter: null,
          worldFlags: newFlags,
          player: {
            ...this.state.player,
            stamina: this.state.player.stamina - enc.staminaCost,
            insight: this.state.player.insight + insight,
          },
        }
        this.eventBus.emit('encounter.resolved', { encounterId: enc.id, choice: 'investigate' })
        break
      }

      case 'ignore_encounter': {
        const encId = this.state.activeEncounter
        this.state = { ...this.state, activeEncounter: null }
        if (encId) this.eventBus.emit('encounter.resolved', { encounterId: encId, choice: 'ignore' })
        break
      }

      case 'vision.continue':
        this.handleAction({ type: 'dismiss.vision' })
        break
    }
  }

  /** Apply an event to all systems and accumulate state changes. */
  private applyEvent(type: import('@/interfaces/index.js').GameEventType, payload: Record<string, unknown>): void {
    const event = { type, payload, timestamp: Date.now() }
    for (const system of this.systems) {
      this.state = system.onEvent(event, this.state)
    }
  }

  /** Resolve the winning ending based on sealedInsights priority order. */
  private resolveEnding(state: IGameState): string {
    const sealed = state.player.sealedInsights
    const allSeven = ['light_source_truth', 'vael_origin', 'keeper_betrayal', 'spirit_binding', 'mechanism_purpose', 'island_history', 'final_signal']
    const hasAll = allSeven.every(id => sealed.has(id))
    if (hasAll) return 'transcendence'
    if (sealed.has('vael_origin') && sealed.has('mechanism_purpose')) return 'liberation'
    if (sealed.has('keeper_betrayal') && sealed.has('spirit_binding')) return 'sacrifice'
    if (sealed.has('island_history')) return 'corruption'
    return 'sacrifice'
  }

  private setFlag(flag: string): void {
    const newFlags = new Set(this.state.worldFlags)
    newFlags.add(flag)
    this.state = { ...this.state, worldFlags: newFlags }
  }

  private maybeTriggerNightEncounter(): void {
    if (this.state.nightEncounterShown >= 1) return
    const encounter = pickRandomEncounter(new Set<string>())
    if (!encounter) return
    this.state = {
      ...this.state,
      activeEncounter: encounter.id,
      nightEncounterShown: this.state.nightEncounterShown + 1,
    }
  }

  private loop(timestamp: number): void {
    if (!this.running) return
    const deltaMs = Math.min(timestamp - this.lastFrameTime, 100) // cap at 100ms
    this.lastFrameTime = timestamp

    // Update all systems (timer drain, etc.)
    for (const system of this.systems) {
      this.state = system.update(this.state, deltaMs)
    }

    // Trigger night_warning hint as day time runs low
    if (
      (this.state.phase === 'morning' || this.state.phase === 'afternoon' || this.state.phase === 'dusk') &&
      this.state.dayTimeRemaining < 0.30 &&
      !this.state.worldFlags.has('hint_trigger.night_warning') &&
      !this.state.worldFlags.has('hint_dismissed.night_warning')
    ) {
      this.setFlag('hint_trigger.night_warning')
    }

    this.renderer.render(this.state)
    requestAnimationFrame(t => this.loop(t))
  }
}
