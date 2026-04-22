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
import { CAL_NPC }    from '@/data/npcs/cal.js'
import { SERA_NPC }   from '@/data/npcs/sera.js'
import { ISOLDE_NPC } from '@/data/npcs/isolde.js'
import { BRYNN_NPC }  from '@/data/npcs/brynn.js'
import { CORVIN_NPC } from '@/data/npcs/corvin.js'
import { ALDRIC_NPC } from '@/data/npcs/aldric.js'
import { FENN_NPC } from '@/data/npcs/fenn.js'
import { KEEPER_PETRA_NPC } from '@/data/npcs/keeper_petra.js'
import { KEEPER_TOBIAS_NPC } from '@/data/npcs/keeper_tobias.js'
import { THE_WARDEN_NPC } from '@/data/npcs/the_warden.js'
import { MIRROR_KEEPER_NPC } from '@/data/npcs/mirror_keeper.js'
import { THE_KEEPER_NPC } from '@/data/npcs/the_keeper.js'

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
cal:    CAL_NPC    as unknown as NPCFullData,
sera:   SERA_NPC   as unknown as NPCFullData,
  isolde: ISOLDE_NPC as unknown as NPCFullData,
  brynn:  BRYNN_NPC  as unknown as NPCFullData,
  corvin:        CORVIN_NPC        as unknown as NPCFullData,
  aldric:        ALDRIC_NPC        as unknown as NPCFullData,
  fenn:          FENN_NPC          as unknown as NPCFullData,
  keeper_petra:  KEEPER_PETRA_NPC  as unknown as NPCFullData,
  keeper_tobias: KEEPER_TOBIAS_NPC as unknown as NPCFullData,
  the_warden:    THE_WARDEN_NPC    as unknown as NPCFullData,
  mirror_keeper: MIRROR_KEEPER_NPC as unknown as NPCFullData,
  the_keeper:    THE_KEEPER_NPC    as unknown as NPCFullData,
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

    // Weather-aware greeting: if the NPC has a line for the current weather, show it first
    // Relationship reveals take priority since they are one-shot narrative moments
    const weatherSpeakerKey = !relationshipReveal
      ? npc.weatherDialogue?.[state.weather as keyof typeof npc.weatherDialogue]
      : undefined

    const dialogueState: IDialogueState = {
      npcId,
      currentNodeId: greetingNodeId,
      speakerTextKey: relationshipReveal?.dialogueKey ?? weatherSpeakerKey ?? node.speakerKey,
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

      if (c.requiresResonance !== undefined) {
        isAvailable = isAvailable && (npcState?.dialogueTier ?? 0) >= c.requiresResonance
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
        requiresResonance: c.requiresResonance,
        requiresSealedInsight: c.requiresSealedInsight as InsightCardId | undefined,
        isAvailable,
      } satisfies IDialogueChoice
    })
  }
}
