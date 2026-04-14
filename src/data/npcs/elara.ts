export const ELARA_NPC = {
  id: 'elara' as const,
  nameKey: 'npc.elara.name',
  titleKey: 'npc.elara.title',
  defaultLocation: 'harbor' as const,
  defaultAttitude: 'fearful' as const,
  schedule: {
    dusk: 'village_square' as const,
    night_safe: 'keepers_cottage' as const,
  },
  tierThresholds: [0, 3, 7, 15] as const,
  greetingNodes: ['elara.greeting.tier0', 'elara.greeting.tier1', 'elara.greeting.tier2', 'elara.greeting.tier3'],
  nodes: {
    'elara.greeting.tier0': {
      speakerKey: 'npc.elara.greeting.tier0',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave', insightGain: 0, moralWeight: 0 },
      ],
    },
    'elara.greeting.tier1': {
      speakerKey: 'npc.elara.greeting.tier1',
      choices: [
        { id: 'ask.lighthouse', textKey: 'dialogue.choice.ask_lighthouse', insightGain: 5, moralWeight: 0 },
        { id: 'offer_help',     textKey: 'dialogue.choice.offer_help',     insightGain: 8, moralWeight: 0 },
        { id: 'leave',          textKey: 'dialogue.choice.leave',           insightGain: 0, moralWeight: 0 },
      ],
    },
    'elara.greeting.tier2': {
      speakerKey: 'npc.elara.greeting.tier2',
      choices: [
        { id: 'ask.echo',   textKey: 'dialogue.choice.ask_echo',   insightGain: 10, moralWeight: 1 },
        { id: 'offer_help', textKey: 'dialogue.choice.offer_help', insightGain: 8,  moralWeight: 0 },
        { id: 'leave',      textKey: 'dialogue.choice.leave',       insightGain: 0,  moralWeight: 0 },
      ],
    },
    'elara.greeting.tier3': {
      speakerKey: 'npc.elara.greeting.tier3',
      choices: [
        { id: 'demand_truth', textKey: 'dialogue.choice.demand_truth', insightGain: 15, moralWeight: 2 },
        { id: 'offer_help',   textKey: 'dialogue.choice.offer_help',   insightGain: 10, moralWeight: 0 },
        { id: 'leave',        textKey: 'dialogue.choice.leave',         insightGain: 0,  moralWeight: 0 },
      ],
    },
  },
} as const
