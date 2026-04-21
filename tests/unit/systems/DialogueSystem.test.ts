import { describe, it, expect, beforeEach } from 'vitest'
import { DialogueSystem } from '@/systems/DialogueSystem.js'
import type { IGameState, IPlayerState, INPCState } from '@/interfaces/IGameState.js'
import type { NPCId, LocationId } from '@/interfaces/types.js'

function makeBus() {
  const emitted: Array<{ type: string; payload: unknown }> = []
  return {
    emit: (type: string, payload: unknown) => { emitted.push({ type, payload }) },
    on: () => () => {},
    off: () => {},
    once: () => {},
    emitted,
  }
}

function makeNPCState(id: NPCId, overrides: Partial<INPCState> = {}): INPCState {
  return {
    id,
    resonance: 0,
    isAlive: true,
    dialogueTier: 0,
    revealedFacts: new Set<string>(),
    lastInteractionLoop: 0,
    attitude: 'neutral',
    currentLocation: null,
    ...overrides,
  }
}

function makeState(overrides: Partial<IGameState> = {}): IGameState {
  const npcIds: NPCId[] = ['maren','vael','silas','petra','tobias','elara','corvin','aldric','isolde','brynn','fenn','keeper_petra','keeper_tobias','the_warden','mirror_keeper','dov','thalia','rudd','ina','bram','ysel']
  const resonance = Object.fromEntries(npcIds.map(id => [id, 0])) as Record<NPCId, number>
  const trust = Object.fromEntries(npcIds.map(id => [id, 0])) as Record<NPCId, number>
  const npcStates = Object.fromEntries(npcIds.map(id => [id, makeNPCState(id)])) as Record<NPCId, INPCState>

  const player: IPlayerState = {
    stamina: 100,
    lightReserves: 100,
    hearts: 3,
    insight: 0,
    insightBanked: 0,
    resonance,
    trust,
    archiveMastery: { history: 0, occult: 0, maritime: 0, ecology: 0, alchemy: 0, cartography: 0, linguistics: 0 },
    loopCount: 0,
    moralWeight: 0,
    discoveredLocations: new Set<LocationId>(['keepers_cottage']),
    sealedInsights: new Set<string>(),
    activeJournalThreads: new Set<string>(),
    journalEntries: [],
    currentLocation: 'keepers_cottage',
    relationshipFlags: {},
    shownRelationshipDialogue: [],
    examineHistory: {},
    searchedLocations: new Set(),
  }

  return {
    phase: 'dawn',
    dayTimeRemaining: 1,
    player,
    npcStates,
    activeDialogue: null,
    activeQuests: new Set<string>(),
    completedQuests: new Set<string>(),
    questStepProgress: {},
    locale: 'en',
    isPaused: false,
    saveVersion: 1,
    worldFlags: new Set<string>(),
    activePanel: 'none',
    endingId: null,
    lastExaminedKey: null,
    nightDangerLevel: 0,
    pendingVisions: [],
    priorPhase: null,
    lighthouseLitThisLoop: false,
    deathCause: null,
    inventory: new Set(),
    endingsSeen: new Set(),
    audioMuted: false,
    achievements: new Set(),
    pendingAchievement: null,
    pendingMilestoneMessage: null,
    settings: {
      masterVolume: 1,
      ambientVolume: 0.6,
      uiVolume: 0.8,
      narrativeVolume: 1,
      locale: 'en',
    },
    weather: 'clear' as const,
    activeEncounter: null,
    nightEncounterShown: 0,
    ...overrides,
  } as IGameState
}

describe('DialogueSystem', () => {
  let bus: ReturnType<typeof makeBus>
  let system: DialogueSystem

  beforeEach(() => {
    bus = makeBus()
    system = new DialogueSystem(bus as any)
  })

  it('dialogue.start event loads the correct greeting node for tier 0', () => {
    const state = makeState()
    const result = system.onEvent({ type: 'dialogue.start', payload: { npcId: 'maren' }, timestamp: 0 }, state)
    expect(result.activeDialogue).not.toBeNull()
    expect(result.activeDialogue?.currentNodeId).toBe('maren.greeting.tier0')
  })

  it('dialogue.start sets activeDialogue with correct speakerTextKey', () => {
    const state = makeState()
    const result = system.onEvent({ type: 'dialogue.start', payload: { npcId: 'maren' }, timestamp: 0 }, state)
    expect(result.activeDialogue?.speakerTextKey).toBe('npc.maren.greeting.tier0')
  })

  it('choice with requiresInsight unmet → isAvailable false', () => {
    const state = makeState()
    const stateWithTier3 = makeState({
      npcStates: {
        ...state.npcStates,
        maren: makeNPCState('maren', { dialogueTier: 3 }),
      },
    })
    const result = system.onEvent({ type: 'dialogue.start', payload: { npcId: 'maren' }, timestamp: 0 }, stateWithTier3)
    const choice = result.activeDialogue?.availableChoices.find(c => c.id === 'ask.archive.deeper')
    expect(choice?.isAvailable).toBe(false)
  })

  it('choice with requiresInsight met → isAvailable true', () => {
    const state = makeState()
    const stateWithTier3 = makeState({
      player: { ...state.player, insight: 20 },
      npcStates: {
        ...state.npcStates,
        maren: makeNPCState('maren', { dialogueTier: 3 }),
      },
    })
    const result = system.onEvent({ type: 'dialogue.start', payload: { npcId: 'maren' }, timestamp: 0 }, stateWithTier3)
    const choice = result.activeDialogue?.availableChoices.find(c => c.id === 'ask.archive.deeper')
    expect(choice?.isAvailable).toBe(true)
  })

  it('dialogue.choice.selected with insightGain → updates player insight', () => {
    const state = makeState()
    let result = system.onEvent({ type: 'dialogue.start', payload: { npcId: 'maren' }, timestamp: 0 }, state)
    result = { ...result, player: { ...result.player, insight: 0 } }
    result = system.onEvent({ type: 'dialogue.choice.selected', payload: { choiceId: 'ask.lighthouse' }, timestamp: 0 }, result)
    expect(result.player.insight).toBe(5)
  })

  it('dialogue.choice.selected with trustGain → updates player trust', () => {
    const state = makeState()
    let result = system.onEvent({ type: 'dialogue.start', payload: { npcId: 'maren' }, timestamp: 0 }, state)
    result = system.onEvent({ type: 'dialogue.choice.selected', payload: { choiceId: 'ask.lighthouse' }, timestamp: 0 }, result)
    result = system.onEvent({ type: 'dialogue.choice.selected', payload: { choiceId: 'ask.keeper' }, timestamp: 0 }, result)
    expect(result.player.trust['maren']).toBeGreaterThan(0)
  })

  it('dialogue.choice.selected with worldFlagSet → adds to worldFlags', () => {
    const base = makeState()
    const state = makeState({
      npcStates: {
        ...base.npcStates,
        maren: makeNPCState('maren', { dialogueTier: 5 }),
      },
      player: { ...base.player, insight: 100 },
    })
    let result = system.onEvent({ type: 'dialogue.start', payload: { npcId: 'maren' }, timestamp: 0 }, state)
    result = system.onEvent({ type: 'dialogue.choice.selected', payload: { choiceId: 'listen' }, timestamp: 0 }, result)
    result = system.onEvent({ type: 'dialogue.choice.selected', payload: { choiceId: 'ask.what.pages' }, timestamp: 0 }, result)
    expect(result.worldFlags.has('maren_confession_heard')).toBe(true)
  })

  it('dialogue.choice.selected with nextNodeId → navigates to next node', () => {
    const state = makeState()
    let result = system.onEvent({ type: 'dialogue.start', payload: { npcId: 'maren' }, timestamp: 0 }, state)
    result = system.onEvent({ type: 'dialogue.choice.selected', payload: { choiceId: 'ask.lighthouse' }, timestamp: 0 }, result)
    expect(result.activeDialogue?.currentNodeId).toBe('maren.lighthouse.lore')
  })

  it('dialogue.choice.selected without nextNodeId → closes dialogue', () => {
    const state = makeState()
    let result = system.onEvent({ type: 'dialogue.start', payload: { npcId: 'maren' }, timestamp: 0 }, state)
    result = system.onEvent({ type: 'dialogue.choice.selected', payload: { choiceId: 'leave' }, timestamp: 0 }, result)
    expect(result.activeDialogue).toBeNull()
  })

  it('dialogue.close event → sets activeDialogue to null', () => {
    const state = makeState()
    let result = system.onEvent({ type: 'dialogue.start', payload: { npcId: 'maren' }, timestamp: 0 }, state)
    result = system.onEvent({ type: 'dialogue.close', payload: {}, timestamp: 0 }, result)
    expect(result.activeDialogue).toBeNull()
  })
})
