export const TOBIAS_NPC = {
  id: 'tobias' as const,
  nameKey: 'npc.tobias.name',
  titleKey: 'npc.tobias.title',
  defaultLocation: 'mill' as const,
  defaultAttitude: 'friendly' as const,
  schedule: {
    night_dark: 'village_square' as const,
  },
  tierThresholds: [0, 3, 7, 15] as const,
  greetingNodes: ['tobias.greeting.tier0', 'tobias.greeting.tier1', 'tobias.greeting.tier2', 'tobias.greeting.tier3'],
  nodes: {
    'tobias.greeting.tier0': {
      speakerKey: 'npc.tobias.greeting.tier0',
      choices: [
        { id: 'ask.lighthouse', textKey: 'dialogue.choice.ask_lighthouse', insightGain: 5, moralWeight: 0 },
        { id: 'leave',          textKey: 'dialogue.choice.leave',           insightGain: 0, moralWeight: 0 },
      ],
    },
    'tobias.greeting.tier1': {
      speakerKey: 'npc.tobias.greeting.tier1',
      choices: [
        { id: 'ask.lighthouse', textKey: 'dialogue.choice.ask_lighthouse', insightGain: 5, moralWeight: 0 },
        { id: 'ask.keeper',     textKey: 'dialogue.choice.ask_keeper',     insightGain: 8, moralWeight: 0 },
        { id: 'leave',          textKey: 'dialogue.choice.leave',           insightGain: 0, moralWeight: 0 },
      ],
    },
    'tobias.greeting.tier2': {
      speakerKey: 'npc.tobias.greeting.tier2',
      choices: [
        { id: 'ask.echo',   textKey: 'dialogue.choice.ask_echo',   insightGain: 10, moralWeight: 1 },
        { id: 'ask.keeper', textKey: 'dialogue.choice.ask_keeper', insightGain: 8,  moralWeight: 0 },
        { id: 'leave',      textKey: 'dialogue.choice.leave',       insightGain: 0,  moralWeight: 0 },
      ],
    },
    'tobias.greeting.tier3': {
      speakerKey: 'npc.tobias.greeting.tier3',
      choices: [
        { id: 'demand_truth', textKey: 'dialogue.choice.demand_truth', insightGain: 15, moralWeight: 2 },
        { id: 'offer_help',   textKey: 'dialogue.choice.offer_help',   insightGain: 10, moralWeight: 0 },
        { id: 'leave',        textKey: 'dialogue.choice.leave',         insightGain: 0,  moralWeight: 0 },
      ],
    },
  },
} as const
