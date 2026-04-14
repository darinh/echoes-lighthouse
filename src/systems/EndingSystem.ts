import type { ISystem, IGameState, IGameEvent, IEventBus } from '@/interfaces/index.js'

interface EndingCondition {
  sealedInsights?: string[]
  maxMoralWeight?: number
  minMoralWeight?: number
  lighthouseLitEveryNight?: boolean
  minNPCTrust?: { npcId: string; minTrust: number }
}

const ENDINGS: Record<string, { title: string; subtitle: string; requires: EndingCondition }> = {
  liberation: {
    title: 'Liberation',
    subtitle: 'The sea is silent for the first time in a hundred years.',
    requires: {
      sealedInsights: ['vael_origin', 'mechanism_purpose'],
      maxMoralWeight: 20,
    },
  },
  keepers_peace: {
    title: "The Keeper's Peace",
    subtitle: 'Every light has its shadow. Every shadow, its light.',
    requires: {
      sealedInsights: ['light_source_truth', 'vael_origin', 'keeper_betrayal', 'spirit_binding', 'mechanism_purpose', 'island_history', 'final_signal'],
      lighthouseLitEveryNight: true,
    },
  },
  sacrifice: {
    title: 'The Sacrifice',
    subtitle: 'Some bindings cannot be broken. They can only be... chosen.',
    requires: {
      sealedInsights: ['keeper_betrayal', 'spirit_binding'],
      minMoralWeight: 40,
    },
  },
  corruption: {
    title: 'Corruption',
    subtitle: 'The island remembers everything. Now so do you. Forever.',
    requires: {
      sealedInsights: ['island_history'],
      minMoralWeight: 80,
    },
  },
  transcendence: {
    title: 'Transcendence',
    subtitle: 'What was divided becomes whole. What was bound becomes everything.',
    requires: {
      sealedInsights: ['light_source_truth', 'vael_origin', 'keeper_betrayal', 'spirit_binding', 'mechanism_purpose', 'island_history', 'final_signal'],
      minNPCTrust: { npcId: 'vael', minTrust: 90 },
    },
  },
}

export class EndingSystem implements ISystem {
  readonly name = 'EndingSystem'

  constructor(private readonly eventBus: IEventBus) {}

  init(state: IGameState): IGameState { return state }
  update(state: IGameState, _deltaMs: number): IGameState { return state }

  onEvent(event: IGameEvent, state: IGameState): IGameState {
    switch (event.type) {
      case 'loop.dawn':
      case 'insight.card.sealed':
        return this.checkEndings(state)
      default:
        return state
    }
  }

  private checkEndings(state: IGameState): IGameState {
    if (state.phase === 'ending') return state
    for (const [endingId] of Object.entries(ENDINGS)) {
      if (this.meetsConditions(state, ENDINGS[endingId].requires)) {
        this.eventBus.emit('ending.triggered', { endingId })
        return state
      }
    }
    return state
  }

  private meetsConditions(state: IGameState, requires: EndingCondition): boolean {
    const { player } = state

    if (requires.sealedInsights) {
      for (const insight of requires.sealedInsights) {
        if (!player.sealedInsights.has(insight)) return false
      }
    }

    if (requires.maxMoralWeight !== undefined) {
      if (player.moralWeight > requires.maxMoralWeight) return false
    }

    if (requires.minMoralWeight !== undefined) {
      if (player.moralWeight < requires.minMoralWeight) return false
    }

    if (requires.lighthouseLitEveryNight) {
      if (!state.lighthouseLitThisLoop) return false
    }

    if (requires.minNPCTrust) {
      const { npcId, minTrust } = requires.minNPCTrust
      const trust = player.resonance[npcId as keyof typeof player.resonance] ?? 0
      if (trust < minTrust) return false
    }

    return true
  }
}
