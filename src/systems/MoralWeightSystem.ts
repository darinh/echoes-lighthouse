import type { ISystem, IGameState, IGameEvent, IEventBus } from '@/interfaces/index.js'
import type { NPCId } from '@/interfaces/types.js'
import { DILEMMAS } from '@/data/dilemmas/index.js'
import type { MoralDilemma, MoralDilemmaChoice } from '@/data/dilemmas/index.js'

/**
 * MoralWeightSystem — Presents and resolves moral dilemmas; accumulates moral weight.
 * See docs/gdd/04-systems-design.md §4 for alignment tracking.
 *
 * Dilemma lifecycle:
 *  1. A trigger event fires (dialogue.start, location.moved, item.taken, etc.)
 *  2. If a matching dilemma's conditions are met and it hasn't been resolved: set activeDilemma.
 *  3. UIManager renders choice buttons dispatching { type: 'dilemma.choose', choiceId }.
 *  4. GameEngine converts that action to applyEvent('dilemma.choice.made', { choiceId }).
 *  5. This system handles 'dilemma.choice.made': applies effects, clears activeDilemma.
 */
export class MoralWeightSystem implements ISystem {
  readonly name = 'MoralWeightSystem'

  constructor(_eventBus: IEventBus) {}

  init(state: IGameState): IGameState { return state }
  update(state: IGameState, _deltaMs: number): IGameState { return state }

  onEvent(event: IGameEvent, state: IGameState): IGameState {
    switch (event.type) {
      // Legacy: raw moral weight change from other systems
      case 'moral.choice.made': {
        const { weight } = event.payload as { weight: number }
        return {
          ...state,
          player: { ...state.player, moralWeight: state.player.moralWeight + weight },
        }
      }

      // Dilemma triggers — check if any dilemma should activate
      case 'dialogue.start':
      case 'location.moved':
      case 'item.taken':
      case 'insight.card.sealed':
      case 'loop.night':
        return this.checkTriggers(event, state)

      // Dilemma resolution
      case 'dilemma.choice.made': {
        const { choiceId } = event.payload as { choiceId: string }
        return this.resolveChoice(choiceId, state)
      }

      default:
        return state
    }
  }

  // ─── Trigger evaluation ───────────────────────────────────────────────────

  private checkTriggers(event: IGameEvent, state: IGameState): IGameState {
    // Don't stack dilemmas
    if (state.activeDilemma !== null) return state

    for (const dilemma of DILEMMAS) {
      if (dilemma.triggerEvent !== event.type) continue
      if (state.resolvedDilemmas.has(dilemma.id)) continue
      if (!this.conditionsMet(dilemma, event, state)) continue

      return { ...state, activeDilemma: dilemma.id }
    }

    return state
  }

  private conditionsMet(
    dilemma: MoralDilemma,
    event: IGameEvent,
    state: IGameState,
  ): boolean {
    const cond = dilemma.triggerCondition
    if (!cond) return true

    const payload = event.payload as Record<string, unknown>

    if (cond.requiredWorldFlag !== undefined) {
      if (!state.worldFlags.has(cond.requiredWorldFlag)) return false
    }

    if (cond.requiredNpcId !== undefined) {
      if ((payload['npcId'] as string | undefined) !== cond.requiredNpcId) return false
    }

    if (cond.requiredLocationId !== undefined) {
      // For location.moved the new location comes in payload; for others use player location
      const locId =
        (payload['locationId'] as string | undefined) ?? state.player.currentLocation
      if (locId !== cond.requiredLocationId) return false
    }

    if (cond.requiredCardId !== undefined) {
      if ((payload['cardId'] as string | undefined) !== cond.requiredCardId) return false
    }

    if (cond.minNpcTrust !== undefined) {
      const { npcId, min } = cond.minNpcTrust
      const trust = (state.player.trust as Record<string, number>)[npcId] ?? 0
      if (trust < min) return false
    }

    if (cond.minNpcResonance !== undefined) {
      const { npcId, min } = cond.minNpcResonance
      const resonance = (state.player.resonance as Record<string, number>)[npcId] ?? 0
      if (resonance < min) return false
    }

    if (cond.minLoopCount !== undefined) {
      if (state.player.loopCount < cond.minLoopCount) return false
    }

    return true
  }

  // ─── Choice resolution ────────────────────────────────────────────────────

  private resolveChoice(choiceId: string, state: IGameState): IGameState {
    const dilemmaId = state.activeDilemma
    if (!dilemmaId) return state

    const dilemma = DILEMMAS.find(d => d.id === dilemmaId)
    if (!dilemma) return { ...state, activeDilemma: null }

    const choice = dilemma.choices.find(c => c.id === choiceId)
    if (!choice) return { ...state, activeDilemma: null }

    let next = this.applyChoiceEffects(choice, state)

    // Mark dilemma resolved and clear active
    const newResolved = new Set(next.resolvedDilemmas)
    newResolved.add(dilemmaId)
    next = { ...next, activeDilemma: null, resolvedDilemmas: newResolved }

    return next
  }

  private applyChoiceEffects(choice: MoralDilemmaChoice, state: IGameState): IGameState {
    let next = state

    // moralWeight
    if (choice.moralWeightDelta !== 0) {
      next = {
        ...next,
        player: {
          ...next.player,
          moralWeight: next.player.moralWeight + choice.moralWeightDelta,
        },
      }
    }

    // worldFlag
    if (choice.worldFlagSet) {
      const newFlags = new Set(next.worldFlags)
      newFlags.add(choice.worldFlagSet)
      next = { ...next, worldFlags: newFlags }
    }

    // trustEffects
    if (choice.trustEffects && choice.trustEffects.length > 0) {
      const newTrust = { ...(next.player.trust as Record<string, number>) }
      for (const { npcId, delta } of choice.trustEffects) {
        newTrust[npcId] = (newTrust[npcId] ?? 0) + delta
      }
      next = {
        ...next,
        player: {
          ...next.player,
          trust: newTrust as IGameState['player']['trust'],
        },
      }
    }

    // resonanceEffects
    if (choice.resonanceEffects && choice.resonanceEffects.length > 0) {
      const newResonance = { ...(next.player.resonance as Record<string, number>) }
      for (const { npcId, delta } of choice.resonanceEffects) {
        newResonance[npcId] = Math.max(0, Math.min(10, (newResonance[npcId] ?? 0) + delta))
      }
      next = {
        ...next,
        player: {
          ...next.player,
          resonance: newResonance as IGameState['player']['resonance'],
        },
      }
      // Mirror resonance into npcStates so the rest of the engine sees it
      const newNpcStates = { ...next.npcStates }
      for (const { npcId } of choice.resonanceEffects) {
        const existing = newNpcStates[npcId as NPCId]
        if (existing) {
          newNpcStates[npcId as NPCId] = {
            ...existing,
            resonance: (newResonance[npcId] ?? 0),
          }
        }
      }
      next = { ...next, npcStates: newNpcStates }
    }

    // insightDelta
    if (choice.insightDelta) {
      next = {
        ...next,
        player: {
          ...next.player,
          insight: Math.max(0, next.player.insight + choice.insightDelta),
        },
      }
    }

    return next
  }
}

