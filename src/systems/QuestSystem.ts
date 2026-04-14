import type { ISystem, IGameState, IGameEvent, IEventBus } from '@/interfaces/index.js'
import type { QuestDefinition } from '@/data/quests/index.js'
import { loadQuestData } from '@/data/quests/index.js'

interface QuestProgress {
  stepsCompleted: Set<string>
  failed: boolean
  completedLoop: number | null
}

/**
 * QuestSystem — Tracks quest state, triggers, and completions.
 * See docs/gdd/06-quest-dialogue.md for the full quest catalogue.
 */
export class QuestSystem implements ISystem {
  readonly name = 'QuestSystem'

  private questData: Record<string, QuestDefinition> = {}
  private progress: Map<string, QuestProgress> = new Map()

  constructor(private readonly eventBus: IEventBus) {
    // Load quest data asynchronously; sync ops are safe because quests only
    // become relevant after at least one player action.
    loadQuestData().then(data => { this.questData = data }).catch(() => {})
  }

  init(state: IGameState): IGameState { return state }
  update(state: IGameState, _deltaMs: number): IGameState { return state }

  onEvent(event: IGameEvent, state: IGameState): IGameState {
    switch (event.type) {
      case 'quest.started':        return this.handleQuestStarted(event, state)
      case 'quest.step.completed': return this.handleStepCompleted(event, state)
      case 'quest.failed':         return this.handleQuestFailed(event, state)
      default:                     return state
    }
  }

  private handleQuestStarted(event: IGameEvent, state: IGameState): IGameState {
    const { questId } = event.payload as { questId: string }
    if (state.activeQuests.has(questId) || state.completedQuests.has(questId)) {
      return state
    }
    this.progress.set(questId, { stepsCompleted: new Set(), failed: false, completedLoop: null })
    const newActive = new Set(state.activeQuests)
    newActive.add(questId)
    return { ...state, activeQuests: newActive }
  }

  private handleStepCompleted(event: IGameEvent, state: IGameState): IGameState {
    const { questId, stepId } = event.payload as { questId: string; stepId: string }
    const prog = this.progress.get(questId)
    if (!prog || prog.failed) return state

    prog.stepsCompleted.add(stepId)

    const definition = this.questData[questId]
    if (definition && prog.stepsCompleted.size >= definition.steps.length) {
      return this.completeQuest(questId, state, definition)
    }

    return state
  }

  private handleQuestFailed(event: IGameEvent, state: IGameState): IGameState {
    const { questId } = event.payload as { questId: string }
    const prog = this.progress.get(questId)
    if (prog) prog.failed = true

    const newActive = new Set(state.activeQuests)
    newActive.delete(questId)

    this.eventBus.emit('journal.thread.failed', { threadId: questId })
    return { ...state, activeQuests: newActive }
  }

  private completeQuest(questId: string, state: IGameState, definition: QuestDefinition): IGameState {
    const prog = this.progress.get(questId)!
    prog.completedLoop = state.player.loopCount

    const newActive = new Set(state.activeQuests)
    newActive.delete(questId)
    const newCompleted = new Set(state.completedQuests)
    newCompleted.add(questId)

    this.eventBus.emit('quest.completed', { questId })

    // Award insight reward if defined.
    if (definition.rewardInsight > 0) {
      this.eventBus.emit('insight.gained', { amount: definition.rewardInsight })
    }

    // Award sealed insight card if quest produces one (rewardFact doubles as card id).
    let newSealed = state.player.sealedInsights
    if (definition.rewardFact) {
      const sealed = new Set(state.player.sealedInsights)
      sealed.add(definition.rewardFact)
      newSealed = sealed
    }

    return {
      ...state,
      player: { ...state.player, sealedInsights: newSealed },
      activeQuests: newActive,
      completedQuests: newCompleted,
    }
  }
}

