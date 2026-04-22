import type { ISystem, IGameState, IGameEvent, IEventBus } from '@/interfaces/index.js'
import { VISION_TRIGGERS_DATA } from '@/data/visions/visionTriggers.js'
import type { VisionTrigger } from '@/data/visions/visionTriggers.js'

// ─────────────────────────────────────────────────────────────────────────────
// Legacy insight-sealing triggers (GDD §6, original set).
// These fire when the player seals a specific insight card.
// ─────────────────────────────────────────────────────────────────────────────

const INSIGHT_SEAL_TRIGGERS: Record<string, string> = {
  keeper_betrayal: 'vision_the_first_keeper',
  spirit_binding:  'vision_the_binding',
  vael_origin:     'vision_vaels_hunger',
}

const ALL_KEY_INSIGHTS = [
  'vael_origin', 'mechanism_purpose', 'light_source_truth',
  'keeper_betrayal', 'spirit_binding', 'island_history', 'final_signal',
]

// Flag prefix used to mark data-driven vision triggers as fired.
const FIRED_FLAG_PREFIX = 'vision.fired.'

export class VisionSystem implements ISystem {
  readonly name = 'VisionSystem'

  constructor(private readonly _eventBus: IEventBus) { void this._eventBus }

  init(state: IGameState): IGameState { return state }
  update(state: IGameState, _deltaMs: number): IGameState { return state }

  onEvent(event: IGameEvent, state: IGameState): IGameState {
    // 1. Legacy insight-sealing visions.
    if (event.type === 'insight.card.sealed') {
      state = this._handleInsightSealed(event, state)
    }

    // 2. Data-driven trigger evaluation (GDD §6 extended set).
    state = this._evaluateTriggers(event, state)

    return state
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private _handleInsightSealed(event: IGameEvent, state: IGameState): IGameState {
    const { cardId } = event.payload as { cardId: string }
    const visionId = INSIGHT_SEAL_TRIGGERS[cardId]

    const newSealed = new Set([...state.player.sealedInsights, cardId])
    const hasAllKeyInsights = ALL_KEY_INSIGHTS.every(id => newSealed.has(id))

    const toAdd: string[] = []
    if (visionId) toAdd.push(visionId)
    if (hasAllKeyInsights && !state.player.sealedInsights.has('final_signal')) {
      toAdd.push('vision_the_truth')
    }

    if (toAdd.length === 0) return state

    return this._queueVisions(toAdd, state, state.worldFlags)
  }

  /**
   * Iterate every VISION_TRIGGERS_DATA entry whose event matches the incoming
   * event, evaluate conditions, and queue any that should fire.
   */
  private _evaluateTriggers(event: IGameEvent, state: IGameState): IGameState {
    const matching = VISION_TRIGGERS_DATA.filter(t => t.event === event.type)
    if (matching.length === 0) return state

    const toAdd: string[] = []
    let flags = state.worldFlags

    for (const trigger of matching) {
      const firedFlag = `${FIRED_FLAG_PREFIX}${trigger.id}`

      // Skip if already fired and not repeatable.
      if (trigger.isRepeatable !== true && flags.has(firedFlag)) continue

      // Evaluate all conditions.
      if (!this._conditionMet(trigger, event, state)) continue

      toAdd.push(trigger.visionKey)

      // Mark fired and apply any worldFlagSet immediately.
      const next = new Set(flags)
      if (trigger.isRepeatable !== true) next.add(firedFlag)
      if (trigger.worldFlagSet) next.add(trigger.worldFlagSet)
      flags = next
    }

    if (toAdd.length === 0) return state

    return this._queueVisions(toAdd, state, flags)
  }

  /**
   * Return true when every specified condition on the trigger is satisfied.
   * Unspecified conditions are treated as "always pass".
   */
  private _conditionMet(
    trigger: VisionTrigger,
    event: IGameEvent,
    state: IGameState,
  ): boolean {
    const { condition } = trigger
    const payload = event.payload as Record<string, unknown>

    // Item ID — must match examine.completed payload.itemId.
    if (condition.itemId !== undefined && payload['itemId'] !== condition.itemId) {
      return false
    }

    // Location ID — must match location.moved payload.locationId.
    if (condition.locationId !== undefined && payload['locationId'] !== condition.locationId) {
      return false
    }

    // NPC ID — must match payload.npcId (dialogue.start, npc.trust.changed, etc.).
    if (condition.npcId !== undefined && payload['npcId'] !== condition.npcId) {
      return false
    }

    // World flag — must be set in state.
    if (condition.worldFlag !== undefined && !state.worldFlags.has(condition.worldFlag)) {
      return false
    }

    // Minimum loop count — checked against current state.
    if (condition.minLoop !== undefined && state.player.loopCount < condition.minLoop) {
      return false
    }

    // Minimum trust / resonance — the event payload carries the new absolute value.
    if (condition.minTrust !== undefined) {
      const value = payload['value']
      if (typeof value !== 'number' || value < condition.minTrust.min) {
        return false
      }
    }

    return true
  }

  /**
   * Append visions to pendingVisions and enter the vision phase if not already
   * in it. Accepts an explicit flags set so callers can pass post-update flags.
   */
  private _queueVisions(
    toAdd: string[],
    state: IGameState,
    flags: ReadonlySet<string>,
  ): IGameState {
    const pending = [...state.pendingVisions, ...toAdd]
    const shouldEnter = state.phase !== 'vision' && pending.length > 0
    return {
      ...state,
      worldFlags: flags,
      pendingVisions: pending,
      priorPhase: shouldEnter ? state.phase : state.priorPhase,
      phase: shouldEnter ? 'vision' : state.phase,
    }
  }
}
