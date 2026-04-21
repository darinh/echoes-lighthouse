import type { ISystem } from '@/interfaces/ISystem.js'
import type { IGameState, IDialogueState, IDialogueChoice } from '@/interfaces/IGameState.js'
import type { IGameEvent, IEventBus } from '@/interfaces/IEventBus.js'
import type { NPCId, InsightCardId } from '@/interfaces/types.js'
import type { NPCFullData, DialogueChoice as NPCDialogueChoice } from '@/data/npcs/dialogueTypes.js'
import { RELATIONSHIP_UNLOCKS } from '@/data/npcs/relationships.js'
import loreEn from '../../public/locales/en/lore.json'
import { MAREN_NPC }  from '@/data/npcs/maren.js'
import { VAEL_NPC }   from '@/data/npcs/vael.js'
import { SILAS_NPC }  from '@/data/npcs/silas.js'
import { PETRA_NPC }  from '@/data/npcs/petra.js'
import { TOBIAS_NPC } from '@/data/npcs/tobias.js'
import { ELARA_NPC }  from '@/data/npcs/elara.js'
import { DOV_NPC }    from '@/data/npcs/dov.js'
import { THALIA_NPC } from '@/data/npcs/thalia.js'
import { RUDD_NPC }   from '@/data/npcs/rudd.js'
import { INA_NPC }    from '@/data/npcs/ina.js'
import { BRAM_NPC }   from '@/data/npcs/bram.js'
import { YSEL_NPC }   from '@/data/npcs/ysel.js'
import { OREN_NPC }   from '@/data/npcs/oren.js'

const NPC_REGISTRY: Record<string, NPCFullData> = {
  maren:  MAREN_NPC  as unknown as NPCFullData,
  vael:   VAEL_NPC   as unknown as NPCFullData,
  silas:  SILAS_NPC  as unknown as NPCFullData,
  petra:  PETRA_NPC  as unknown as NPCFullData,
  tobias: TOBIAS_NPC as unknown as NPCFullData,
  elara:  ELARA_NPC  as unknown as NPCFullData,
dov:    DOV_NPC    as unknown as NPCFullData,
  thalia: THALIA_NPC as unknown as NPCFullData,
  rudd:   RUDD_NPC   as unknown as NPCFullData,
  ina:    INA_NPC    as unknown as NPCFullData,
  bram:   BRAM_NPC   as unknown as NPCFullData,
  ysel:   YSEL_NPC   as unknown as NPCFullData,
oren:   OREN_NPC   as unknown as NPCFullData,
}

function hasDialogueKey(key: string): boolean {
  const parts = key.split('.')
  let cursor: unknown = loreEn
  for (const part of parts) {
    if (typeof cursor !== 'object' || cursor === null) return false
    cursor = (cursor as Record<string, unknown>)[part]
  }
  return typeof cursor === 'string'
}

/**
 * DialogueSystem — Manages NPC dialogue: opening, choice selection, closing.
 * See docs/gdd/06-quest-dialogue.md for the full dialogue specification.
 */
export class DialogueSystem implements ISystem {
  readonly name = 'DialogueSystem'

  constructor(private readonly eventBus: IEventBus) {}

  init(state: IGameState): IGameState { return state }

  update(state: IGameState, _deltaMs: number): IGameState { return state }

  onEvent(event: IGameEvent, state: IGameState): IGameState {
    switch (event.type) {
      case 'dialogue.start':           return this.handleDialogueStart(event, state)
      case 'dialogue.choice.selected': return this.handleChoiceSelected(event, state)
      case 'dialogue.close':           return this.handleDialogueClose(event, state)
      default: return state
    }
  }

  // ─── Handlers ────────────────────────────────────────────────────────────

  private handleDialogueStart(event: IGameEvent, state: IGameState): IGameState {
    const { npcId } = event.payload as { npcId: NPCId }
    const npc = NPC_REGISTRY[npcId]
    if (!npc) return state

    const npcState = state.npcStates[npcId]
    const tier = npcState?.dialogueTier ?? 0
    const greetingNodeId = npc.greetingNodes[Math.min(tier, npc.greetingNodes.length - 1)]
    const node = npc.nodes[greetingNodeId]
    if (!node) return state

    const availableChoices = this.buildChoices(node.choices, npcId, state)
    const relationshipReveal = RELATIONSHIP_UNLOCKS.find(unlock =>
      unlock.npcId === npcId &&
      state.player.relationshipFlags[unlock.flag] &&
      !state.player.shownRelationshipDialogue.includes(unlock.flag) &&
      hasDialogueKey(unlock.dialogueKey)
    )

    const dialogueState: IDialogueState = {
      npcId,
      currentNodeId: greetingNodeId,
      speakerTextKey: relationshipReveal?.dialogueKey ?? node.speakerKey,
      availableChoices,
      isActive: true,
    }

    this.eventBus.emit('npc.dialogue.opened', { npcId })
    if (!relationshipReveal) {
      return { ...state, activeDialogue: dialogueState }
    }

    return {
      ...state,
      player: {
        ...state.player,
        shownRelationshipDialogue: [...state.player.shownRelationshipDialogue, relationshipReveal.flag],
      },
      activeDialogue: dialogueState,
    }
  }

  private handleChoiceSelected(event: IGameEvent, state: IGameState): IGameState {
    const { choiceId } = event.payload as { choiceId: string }
    if (!state.activeDialogue) return state

    const { npcId, currentNodeId } = state.activeDialogue
    const npc = NPC_REGISTRY[npcId]
    if (!npc) return state

    const node = npc.nodes[currentNodeId]
    if (!node) return state

    const choice = node.choices.find(c => c.id === choiceId)
    if (!choice) return state

    let newState = state

    if (choice.insightGain) {
      newState = {
        ...newState,
        player: { ...newState.player, insight: Math.min(999, newState.player.insight + choice.insightGain) },
      }
      this.eventBus.emit('insight.gained', { amount: choice.insightGain })
    }

    if (choice.trustGain) {
      const newTrust = { ...newState.player.trust, [npcId]: (newState.player.trust[npcId] ?? 0) + choice.trustGain }
      newState = { ...newState, player: { ...newState.player, trust: newTrust } }
      this.eventBus.emit('npc.trust.gained', { npcId, amount: choice.trustGain })
    }

    if (choice.trustLoss) {
      const newTrust = {
        ...newState.player.trust,
        [npcId]: Math.max(0, (newState.player.trust[npcId] ?? 0) - choice.trustLoss),
      }
      newState = { ...newState, player: { ...newState.player, trust: newTrust } }
      this.eventBus.emit('npc.trust.lost', { npcId, amount: choice.trustLoss })
    }

    if (choice.worldFlagSet) {
      const newFlags = new Set(newState.worldFlags)
      newFlags.add(choice.worldFlagSet)
      newState = { ...newState, worldFlags: newFlags }
    }

    if (choice.questTrigger) {
      const newQuests = new Set(newState.activeQuests)
      newQuests.add(choice.questTrigger)
      newState = { ...newState, activeQuests: newQuests }
      this.eventBus.emit('quest.started', { questId: choice.questTrigger })
    }

    if (choice.questStart) {
      if (!newState.activeQuests.has(choice.questStart) && !newState.completedQuests.has(choice.questStart)) {
        const newQuests = new Set(newState.activeQuests)
        newQuests.add(choice.questStart)
        newState = { ...newState, activeQuests: newQuests }
        this.eventBus.emit('quest.started', { questId: choice.questStart })
      }
    }

    this.eventBus.emit('npc.dialogue.choice.made', { npcId, choiceId })

    if (choice.nextNodeId) {
      const nextNode = npc.nodes[choice.nextNodeId]
      if (nextNode) {
        const availableChoices = this.buildChoices(nextNode.choices, npcId, newState)
        return {
          ...newState,
          activeDialogue: {
            npcId,
            currentNodeId: choice.nextNodeId,
            speakerTextKey: nextNode.speakerKey,
            availableChoices,
            isActive: true,
          },
        }
      }
    }

    // No nextNodeId or missing node → close dialogue
    this.eventBus.emit('npc.dialogue.closed', { npcId })
    return { ...newState, activeDialogue: null }
  }

  private handleDialogueClose(_event: IGameEvent, state: IGameState): IGameState {
    const npcId = state.activeDialogue?.npcId
    this.eventBus.emit('npc.dialogue.closed', { npcId: npcId ?? '' })
    return { ...state, activeDialogue: null }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private buildChoices(
    choices: readonly NPCDialogueChoice[],
    npcId: NPCId,
    state: IGameState,
  ): IDialogueChoice[] {
    const npcState = state.npcStates[npcId]

    return choices.map(c => {
      let isAvailable = true

      if (c.requiresTier !== undefined) {
        isAvailable = isAvailable && (npcState?.dialogueTier ?? 0) >= c.requiresTier
      }
      if (c.requiresInsight !== undefined) {
        isAvailable = isAvailable && state.player.insight >= c.requiresInsight
      }
      if (c.worldFlagRequired) {
        isAvailable = isAvailable && state.worldFlags.has(c.worldFlagRequired)
      }
      if (c.requiresSealedInsight) {
        isAvailable = isAvailable && state.player.sealedInsights.has(c.requiresSealedInsight as InsightCardId)
      }

      return {
        id: c.id,
        textKey: c.textKey,
        requiresInsight: c.requiresInsight,
        requiresResonance: c.requiresTier,
        requiresSealedInsight: c.requiresSealedInsight as InsightCardId | undefined,
        isAvailable,
      } satisfies IDialogueChoice
    })
  }
}
