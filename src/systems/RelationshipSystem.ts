import type { IEventBus, IGameEvent, IGameState, ISystem } from '@/interfaces/index.js'
import { RELATIONSHIP_UNLOCKS } from '@/data/npcs/relationships.js'

export class RelationshipSystem implements ISystem {
  readonly name = 'RelationshipSystem'

  constructor(private readonly eventBus: IEventBus) {}

  init(state: IGameState): IGameState { return state }
  update(state: IGameState, _deltaMs: number): IGameState { return state }

  onEvent(event: IGameEvent, state: IGameState): IGameState {
    if (event.type !== 'npc.trust.changed' && event.type !== 'npc.resonance.changed') {
      return state
    }
    const { npcId } = event.payload as { npcId?: string }
    if (!npcId) return state
    return this.evaluateUnlocks(state, npcId)
  }

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
}
