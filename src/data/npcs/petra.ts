export const PETRA_NPC = {
  id: 'petra' as const,
  nameKey: 'npc.petra.name',
  titleKey: 'npc.petra.title',
  defaultLocation: 'ruins' as const,
  defaultAttitude: 'neutral' as const,
  schedule: {
    night_dark: 'chapel' as const,
  },
  tierThresholds: [0, 3, 7, 15] as const,
  greetingNodes: ['petra.greeting.tier0', 'petra.greeting.tier1', 'petra.greeting.tier2', 'petra.greeting.tier3'],
  nodes: {
    'petra.greeting.tier0': {
      speakerKey: 'npc.petra.greeting.tier0',
      choices: [
        { id: 'ask.lighthouse', textKey: 'dialogue.choice.ask_lighthouse', insightGain: 5, moralWeight: 0 },
        { id: 'leave',          textKey: 'dialogue.choice.leave',           insightGain: 0, moralWeight: 0 },
      ],
    },
    'petra.greeting.tier1': {
      speakerKey: 'npc.petra.greeting.tier1',
      choices: [
        { id: 'ask.lighthouse', textKey: 'dialogue.choice.ask_lighthouse', insightGain: 5, moralWeight: 0 },
        { id: 'ask.keeper',     textKey: 'dialogue.choice.ask_keeper',     insightGain: 8, moralWeight: 0 },
        { id: 'leave',          textKey: 'dialogue.choice.leave',           insightGain: 0, moralWeight: 0 },
      ],
    },
    'petra.greeting.tier2': {
      speakerKey: 'npc.petra.greeting.tier2',
      choices: [
        { id: 'ask.echo',   textKey: 'dialogue.choice.ask_echo',   insightGain: 10, moralWeight: 1 },
        { id: 'ask.keeper', textKey: 'dialogue.choice.ask_keeper', insightGain: 8,  moralWeight: 0 },
        { id: 'leave',      textKey: 'dialogue.choice.leave',       insightGain: 0,  moralWeight: 0 },
      ],
    },
    'petra.greeting.tier3': {
      speakerKey: 'npc.petra.greeting.tier3',
      choices: [
        { id: 'demand_truth', textKey: 'dialogue.choice.demand_truth', insightGain: 15, moralWeight: 2 },
        { id: 'offer_help',   textKey: 'dialogue.choice.offer_help',   insightGain: 10, moralWeight: 0 },
        { id: 'leave',        textKey: 'dialogue.choice.leave',         insightGain: 0,  moralWeight: 0 },
      ],
    },
  },
} as const
