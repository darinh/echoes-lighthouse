import type { IEventBus, IGameEvent, IGameState, ISystem } from '@/interfaces/index.js'
import { RELATIONSHIP_UNLOCKS } from '@/data/npcs/relationships.js'
import { QUEST_REGISTRY } from '@/data/quests/index.js'

export class RelationshipSystem implements ISystem {
  readonly name = 'RelationshipSystem'

  constructor(private readonly eventBus: IEventBus) {}

  init(state: IGameState): IGameState { return state }
  update(state: IGameState, _deltaMs: number): IGameState { return state }

  onEvent(event: IGameEvent, state: IGameState): IGameState {
    switch (event.type) {
      case 'npc.trust.changed':
      case 'npc.resonance.changed': {
        const { npcId, delta } = event.payload as { npcId?: string; delta?: number }
        if (!npcId) return state
        let next = this.evaluateUnlocks(state, npcId)
        if (typeof delta === 'number' && delta < -1) {
          next = this.applyTrustDecay(next, npcId)
        }
        return next
      }

      case 'turn.end':
        return this.checkQuestExpiry(state)

      case 'loop.started':
        return this.recordQuestExpiry(state)

      default:
        return state
    }
  }

  // ─── Relationship unlocks ─────────────────────────────────────────────────

  private evaluateUnlocks(state: IGameState, npcId: string): IGameState {
    const trustMap = state.player.trust as Readonly<Record<string, number>>
    const resonanceMap = state.player.resonance as Readonly<Record<string, number>>
    const currentFlags = state.player.relationshipFlags

    let nextFlags: Record<string, boolean> = { ...currentFlags }
    let didUnlock = false

    for (const unlock of RELATIONSHIP_UNLOCKS) {
      if (unlock.npcId !== npcId) continue
      if (currentFlags[unlock.flag] || nextFlags[unlock.flag]) continue
      if (unlock.prerequisiteFlag && !nextFlags[unlock.prerequisiteFlag]) continue

      const trustOk = unlock.trustThreshold === undefined || (trustMap[npcId] ?? 0) >= unlock.trustThreshold
      const resonanceOk = unlock.resonanceThreshold === undefined || (resonanceMap[npcId] ?? 0) >= unlock.resonanceThreshold
      if (!trustOk || !resonanceOk) continue

      didUnlock = true
      nextFlags[unlock.flag] = true
      this.eventBus.emit('relationship.unlocked', { npcId, flag: unlock.flag, dialogueKey: unlock.dialogueKey })
    }

    if (!didUnlock) return state
    return {
      ...state,
      player: {
        ...state.player,
        relationshipFlags: nextFlags,
      },
    }
  }

  // ─── Trust decay for repeated harmful choices ─────────────────────────────

  /**
   * When a dialogue choice with delta < -1 is made, increment npcHarmCount
   * and apply 1 additional trust decay per prior offence (scaled punishment).
   * The base delta is already applied by DialogueSystem; this adds the penalty.
   */
  private applyTrustDecay(state: IGameState, npcId: string): IGameState {
    const harmCount = (state.player.npcHarmCount as Readonly<Record<string, number>>)[npcId] ?? 0
    const newHarmCount = {
      ...(state.player.npcHarmCount as Readonly<Record<string, number>>),
      [npcId]: harmCount + 1,
    }

    // Extra decay = prior harm count (0 on first offence, 1 on second, ...)
    const extraDecay = harmCount
    if (extraDecay === 0) {
      return {
        ...state,
        player: { ...state.player, npcHarmCount: newHarmCount },
      }
    }

    const currentTrust = (state.player.trust as Readonly<Record<string, number>>)[npcId] ?? 0
    const newTrust = Math.max(0, currentTrust - extraDecay)
    const updatedTrust = {
      ...(state.player.trust as Readonly<Record<string, number>>),
      [npcId]: newTrust,
    }

    return {
      ...state,
      player: {
        ...state.player,
        trust: updatedTrust as IGameState['player']['trust'],
        npcHarmCount: newHarmCount,
      },
    }
  }

  // ─── Quest expiry ─────────────────────────────────────────────────────────

  /**
   * Called on `turn.end` (end of a loop).
   * Checks all active quests with `expiresAfterLoops` configured.
   * Quests past their expiry threshold are removed and `quest.expired` is emitted.
   */
  private checkQuestExpiry(state: IGameState): IGameState {
    const { loopCount } = state.player
    const questExpiry = state.player.questExpiry as Readonly<Record<string, number>>
    const expiredIds: string[] = []

    for (const questId of state.activeQuests) {
      const quest = QUEST_REGISTRY[questId]
      if (!quest?.expiresAfterLoops) continue
      const startLoop = questExpiry[questId]
      if (startLoop === undefined) continue
      if (loopCount - startLoop >= quest.expiresAfterLoops) {
        expiredIds.push(questId)
      }
    }

    if (expiredIds.length === 0) return state

    const newActiveQuests = new Set(state.activeQuests)
    for (const id of expiredIds) {
      newActiveQuests.delete(id)
      this.eventBus.emit('quest.expired', { questId: id })
    }

    return { ...state, activeQuests: newActiveQuests }
  }

  /**
   * Called on `loop.started`.
   * Records the current loopCount as the start loop for any active quests
   * not yet in questExpiry. This anchors the expiry clock.
   */
  private recordQuestExpiry(state: IGameState): IGameState {
    const { loopCount } = state.player
    const questExpiry = state.player.questExpiry as Readonly<Record<string, number>>
    const updates: Record<string, number> = {}

    for (const questId of state.activeQuests) {
      if (questExpiry[questId] === undefined) {
        updates[questId] = loopCount
      }
    }

    if (Object.keys(updates).length === 0) return state

    return {
      ...state,
      player: {
        ...state.player,
        questExpiry: { ...questExpiry, ...updates },
      },
    }
  }

  // ─── Turn-window availability check (public utility) ─────────────────────

  /**
   * Returns true if the given quest is available at the current loop count.
   * Quests without `availableTurns` are always considered available.
   * Used by DialogueSystem/UI before showing a quest branch.
   */
  static isQuestAvailableAtLoop(questId: string, loopCount: number): boolean {
    const quest = QUEST_REGISTRY[questId]
    if (!quest?.availableTurns) return true
    return loopCount >= quest.availableTurns.min && loopCount <= quest.availableTurns.max
  }
}
