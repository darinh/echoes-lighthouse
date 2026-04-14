import type { ISystem, IEventBus } from '@/interfaces/index.js'
import type { IGameState, IDialogueChoice } from '@/interfaces/IGameState.js'
import type { IGameEvent } from '@/interfaces/IEventBus.js'
import type { NPCId } from '@/interfaces/types.js'
import type { NPCFullData, NPCDialogueChoice } from '@/data/npcs/dialogueTypes.js'
import { MAREN_NPC } from '@/data/npcs/maren.js'
import { VAEL_NPC } from '@/data/npcs/vael.js'
import { SILAS_NPC } from '@/data/npcs/silas.js'
import { PETRA_NPC } from '@/data/npcs/petra.js'
import { TOBIAS_NPC } from '@/data/npcs/tobias.js'
import { ELARA_NPC } from '@/data/npcs/elara.js'

export class DialogueSystem implements ISystem {
  readonly name = 'DialogueSystem'
  private readonly npcRegistry: Partial<Record<NPCId, NPCFullData>>

  constructor(private readonly eventBus: IEventBus) {
    this.npcRegistry = {
      maren: MAREN_NPC,
      vael: VAEL_NPC,
      silas: SILAS_NPC,
      petra: PETRA_NPC,
      tobias: TOBIAS_NPC,
      elara: ELARA_NPC,
    }
  }

  init(state: IGameState): IGameState {
    return state
  }

  update(state: IGameState, _deltaMs: number): IGameState {
    return state
  }

  onEvent(event: IGameEvent, state: IGameState): IGameState {
    switch (event.type) {
      case 'dialogue.start':
        return this.handleDialogueStart(event.payload as { npcId: NPCId }, state)
      case 'dialogue.choice.selected':
        return this.handleChoiceSelected(event.payload as { choiceId: string }, state)
      case 'dialogue.close':
        return { ...state, activeDialogue: null }
      default:
        return state
    }
  }

  private handleDialogueStart({ npcId }: { npcId: NPCId }, state: IGameState): IGameState {
    const npcData = this.npcRegistry[npcId]
    if (!npcData) return state

    const npcState = state.npcStates[npcId]
    if (!npcState) return state

    const tier = npcState.dialogueTier
    const greetingNodeId = npcData.greetingNodes[Math.min(tier, npcData.greetingNodes.length - 1)]
    const node = npcData.nodes[greetingNodeId]
    if (!node) return state

    const resolvedChoices = this.resolveChoices(node.choices, state, npcId)

    const isFirstTime = !npcState.revealedFacts.has(greetingNodeId)
    const updatedRevealedFacts = isFirstTime
      ? new Set([...npcState.revealedFacts, greetingNodeId])
      : npcState.revealedFacts

    let newState: IGameState = {
      ...state,
      npcStates: {
        ...state.npcStates,
        [npcId]: { ...npcState, revealedFacts: updatedRevealedFacts },
      },
      activeDialogue: {
        npcId,
        currentNodeId: greetingNodeId,
        speakerTextKey: node.speakerKey,
        availableChoices: resolvedChoices,
        isActive: true,
      },
    }

    this.eventBus.emit('npc.dialogue.opened', { npcId })

    if (isFirstTime) {
      newState = {
        ...newState,
        player: { ...newState.player, insight: newState.player.insight + 3 },
      }
      this.eventBus.emit('insight.gained', { amount: 3 })
    }

    return newState
  }

  private handleChoiceSelected({ choiceId }: { choiceId: string }, state: IGameState): IGameState {
    if (!state.activeDialogue) return state

    const { npcId, currentNodeId } = state.activeDialogue
    const npcData = this.npcRegistry[npcId]
    if (!npcData) return state

    const node = npcData.nodes[currentNodeId]
    if (!node) return state

    const choice = node.choices.find((c: NPCDialogueChoice) => c.id === choiceId)
    if (!choice) return state

    const npcState = state.npcStates[npcId]
    let player = { ...state.player }
    let worldFlags = state.worldFlags
    const updatedRevealedFacts = new Set([...(npcState?.revealedFacts ?? []), choiceId])

    if (choice.insightGain) {
      player = { ...player, insight: player.insight + choice.insightGain }
      this.eventBus.emit('insight.gained', { amount: choice.insightGain })
    }

    if (choice.trustGain) {
      const currentTrust = player.trust[npcId] ?? 0
      player = {
        ...player,
        trust: { ...player.trust, [npcId]: currentTrust + choice.trustGain },
      }
      this.eventBus.emit('npc.trust.gained', { npcId, amount: choice.trustGain })
    }

    if (choice.trustLoss) {
      const currentTrust = player.trust[npcId] ?? 0
      player = {
        ...player,
        trust: { ...player.trust, [npcId]: currentTrust - choice.trustLoss },
      }
      this.eventBus.emit('npc.trust.lost', { npcId, amount: choice.trustLoss })
    }

    if (choice.moralWeight) {
      player = { ...player, moralWeight: player.moralWeight + choice.moralWeight }
      this.eventBus.emit('moral.choice.made', { weight: choice.moralWeight })
    }

    if (choice.worldFlagSet) {
      worldFlags = new Set([...worldFlags, choice.worldFlagSet])
    }

    if (choice.questTrigger) {
      this.eventBus.emit('quest.started', { questId: choice.questTrigger })
    }

    this.eventBus.emit('npc.dialogue.choice.made', {
      npcId,
      choiceId,
      nodeId: currentNodeId,
    })

    let newState: IGameState = {
      ...state,
      player,
      worldFlags,
      npcStates: {
        ...state.npcStates,
        [npcId]: { ...npcState, revealedFacts: updatedRevealedFacts },
      },
    }

    if (choice.nextNodeId) {
      const nextNode = npcData.nodes[choice.nextNodeId]
      if (nextNode) {
        const nextChoices = this.resolveChoices(nextNode.choices, newState, npcId)
        newState = {
          ...newState,
          activeDialogue: {
            npcId,
            currentNodeId: choice.nextNodeId,
            speakerTextKey: nextNode.speakerKey,
            availableChoices: nextChoices,
            isActive: true,
          },
        }
      } else {
        newState = { ...newState, activeDialogue: null }
        this.eventBus.emit('npc.dialogue.closed', { npcId })
      }
    } else {
      newState = { ...newState, activeDialogue: null }
      this.eventBus.emit('npc.dialogue.closed', { npcId })
    }

    return newState
  }

  private resolveChoices(
    choices: ReadonlyArray<NPCDialogueChoice>,
    state: IGameState,
    npcId: NPCId,
  ): IDialogueChoice[] {
    return choices.map((choice: NPCDialogueChoice) => {
      let isAvailable = true

      if (choice.requiresInsight !== undefined) {
        const total = state.player.insight + state.player.insightBanked
        if (total < choice.requiresInsight) isAvailable = false
      }

      if (choice.requiresTier !== undefined) {
        if ((state.npcStates[npcId]?.dialogueTier ?? 0) < choice.requiresTier) isAvailable = false
      }

      if (choice.requiresArchiveDomain !== undefined) {
        const { domain, level } = choice.requiresArchiveDomain
        const pages = (state.player.archiveMastery as Record<string, number>)[domain] ?? 0
        if (this.archiveMasteryLevel(pages) < level) isAvailable = false
      }

      if (choice.requiresSealedInsight !== undefined) {
        if (!state.player.sealedInsights.has(choice.requiresSealedInsight)) isAvailable = false
      }

      if (choice.requiresQuestFlag !== undefined) {
        if (!state.worldFlags.has(choice.requiresQuestFlag)) isAvailable = false
      }

      return {
        id: choice.id,
        textKey: choice.textKey,
        isAvailable,
      }
    })
  }

  private archiveMasteryLevel(pages: number): number {
    if (pages >= 10) return 3
    if (pages >= 6) return 2
    if (pages >= 3) return 1
    return 0
  }
}
