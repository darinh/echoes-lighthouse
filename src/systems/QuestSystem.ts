import type { ISystem, IGameState, IGameEvent, IEventBus } from '@/interfaces/index.js'
import type { QuestDefinition, QuestStep } from '@/data/quests/index.js'
import { QUEST_REGISTRY } from '@/data/quests/index.js'

/**
 * QuestSystem — Auto-starts quests and advances steps based on game events.
 * See docs/gdd/06-quest-dialogue.md for the full quest catalogue.
 */
export class QuestSystem implements ISystem {
  readonly name = 'QuestSystem'

  constructor(private readonly eventBus: IEventBus) {}

  init(state: IGameState): IGameState { return state }
  update(state: IGameState, _deltaMs: number): IGameState { return state }

  onEvent(event: IGameEvent, state: IGameState): IGameState {
    switch (event.type) {
      case 'location.moved':
      case 'examine.completed':
      case 'dialogue.start':
      case 'insight.card.sealed':
      case 'loop.dawn':
        return this.processGameEvent(event, state)
      default:
        return state
    }
  }

  // ─── Core event processor ─────────────────────────────────────────────────

  private processGameEvent(event: IGameEvent, state: IGameState): IGameState {
    let s = state

    // 1. Try to start new quests whose trigger conditions are met.
    for (const [questId, quest] of Object.entries(QUEST_REGISTRY)) {
      if (s.activeQuests.has(questId) || s.completedQuests.has(questId)) continue
      if (this.matchesTrigger(quest, event, s)) {
        s = this.startQuest(questId, s)
      }
    }

    // 2. Advance steps for all active quests.
    for (const questId of s.activeQuests) {
      const quest = QUEST_REGISTRY[questId]
      if (!quest) continue
      s = this.advanceSteps(questId, quest, event, s)
    }

    return s
  }

  // ─── Quest trigger matching ───────────────────────────────────────────────

  private matchesTrigger(quest: QuestDefinition, event: IGameEvent, state: IGameState): boolean {
    const { triggerType, triggerValue } = quest
    switch (triggerType) {
      case 'location_visit':
        if (event.type !== 'location.moved') return false
        return (event.payload as Record<string, unknown>).locationId === triggerValue

      case 'examine':
        if (event.type !== 'examine.completed') return false
        return this.examineKey(event) === triggerValue

      case 'dialogue':
        if (event.type !== 'dialogue.start') return false
        return (event.payload as Record<string, unknown>).npcId === triggerValue

      case 'dialogue_tier': {
        if (event.type !== 'dialogue.start') return false
        const [npcId, tierStr] = triggerValue.split(':')
        const tier = parseInt(tierStr, 10)
        const npcState = state.npcStates[npcId as import('@/interfaces/types.js').NPCId]
        return (event.payload as Record<string, unknown>).npcId === npcId &&
               (npcState?.dialogueTier ?? 0) >= tier
      }

      case 'world_flag':
        return state.worldFlags.has(triggerValue)

      case 'automatic':
        return event.type === 'loop.dawn'

      default:
        return false
    }
  }

  // ─── Step completion matching ─────────────────────────────────────────────

  private matchesStep(step: QuestStep, event: IGameEvent, state: IGameState): boolean {
    const { type, value } = step.completedBy
    switch (type) {
      case 'location':
        if (event.type !== 'location.moved') return false
        return (event.payload as Record<string, unknown>).locationId === value

      case 'examine':
        if (event.type !== 'examine.completed') return false
        return this.examineKey(event) === value

      case 'dialogue':
        if (event.type !== 'dialogue.start') return false
        return (event.payload as Record<string, unknown>).npcId === value

      case 'world_flag':
        return state.worldFlags.has(value)

      case 'fact':
        // A fact step completes when an insight card with matching id is sealed.
        if (event.type !== 'insight.card.sealed') return false
        return (event.payload as Record<string, unknown>).cardId === value

      default:
        return false
    }
  }

  // ─── State mutations (returns new state, never mutates) ───────────────────

  private startQuest(questId: string, state: IGameState): IGameState {
    const newActive = new Set(state.activeQuests)
    newActive.add(questId)
    this.eventBus.emit('quest.started', { questId })
    return { ...state, activeQuests: newActive }
  }

  private advanceSteps(
    questId: string,
    quest: QuestDefinition,
    event: IGameEvent,
    state: IGameState,
  ): IGameState {
    const currentProgress = state.questStepProgress[questId] ?? new Set<string>()
    let changed = false
    const newProgress = new Set(currentProgress)

    for (const step of quest.steps) {
      if (newProgress.has(step.id)) continue
      if (this.matchesStep(step, event, state)) {
        newProgress.add(step.id)
        changed = true
        this.eventBus.emit('quest.step.completed', { questId, stepId: step.id })
      }
    }

    if (!changed) return state

    const newStepProgress = { ...state.questStepProgress, [questId]: newProgress }
    const updatedState = { ...state, questStepProgress: newStepProgress }

    // Check if all steps are now complete.
    if (newProgress.size >= quest.steps.length) {
      return this.completeQuest(questId, quest, updatedState)
    }

    return updatedState
  }

  private completeQuest(questId: string, definition: QuestDefinition, state: IGameState): IGameState {
    const newActive = new Set(state.activeQuests)
    newActive.delete(questId)
    const newCompleted = new Set(state.completedQuests)
    newCompleted.add(questId)

    this.eventBus.emit('quest.completed', { questId })

    if (definition.rewardInsight > 0) {
      this.eventBus.emit('insight.gained', { amount: definition.rewardInsight })
    }

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

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private examineKey(event: IGameEvent): string {
    const p = event.payload as Record<string, unknown>
    return `${p.locationId}.${p.itemId}`
  }
}

