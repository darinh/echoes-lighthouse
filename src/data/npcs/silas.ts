export const SILAS_NPC = {
  id: 'silas' as const,
  nameKey: 'npc.silas.name',
  titleKey: 'npc.silas.title',
  defaultLocation: 'harbor' as const,
  defaultAttitude: 'neutral' as const,
  schedule: {
    night_safe: 'keepers_cottage' as const,
    night_dark: 'keepers_cottage' as const,
  },
  tierThresholds: [0, 3, 7, 15] as const,
  greetingNodes: ['silas.greeting.tier0', 'silas.greeting.tier1', 'silas.greeting.tier2', 'silas.greeting.tier3'],
  nodes: {
    'silas.greeting.tier0': {
      speakerKey: 'npc.silas.greeting.tier0',
      choices: [
        { id: 'ask.lighthouse', textKey: 'dialogue.choice.ask_lighthouse', insightGain: 5, moralWeight: 0 },
        { id: 'leave',          textKey: 'dialogue.choice.leave',           insightGain: 0, moralWeight: 0 },
      ],
    },
    'silas.greeting.tier1': {
      speakerKey: 'npc.silas.greeting.tier1',
      choices: [
        { id: 'ask.lighthouse', textKey: 'dialogue.choice.ask_lighthouse', insightGain: 5, moralWeight: 0 },
        { id: 'ask.keeper',     textKey: 'dialogue.choice.ask_keeper',     insightGain: 8, moralWeight: 0 },
        { id: 'leave',          textKey: 'dialogue.choice.leave',           insightGain: 0, moralWeight: 0 },
      ],
    },
    'silas.greeting.tier2': {
      speakerKey: 'npc.silas.greeting.tier2',
      choices: [
        { id: 'ask.echo',    textKey: 'dialogue.choice.ask_echo',    insightGain: 10, moralWeight: 1 },
        { id: 'ask.keeper',  textKey: 'dialogue.choice.ask_keeper',  insightGain: 8,  moralWeight: 0 },
        { id: 'press_harder', textKey: 'dialogue.choice.press_harder', insightGain: 12, moralWeight: 1 },
        { id: 'leave',       textKey: 'dialogue.choice.leave',        insightGain: 0,  moralWeight: 0 },
      ],
    },
    'silas.greeting.tier3': {
      speakerKey: 'npc.silas.greeting.tier3',
      choices: [
        { id: 'demand_truth', textKey: 'dialogue.choice.demand_truth', insightGain: 15, moralWeight: 2 },
        { id: 'let_it_go',    textKey: 'dialogue.choice.let_it_go',    insightGain: 5,  moralWeight: 0 },
        { id: 'leave',        textKey: 'dialogue.choice.leave',         insightGain: 0,  moralWeight: 0 },
      ],
    },
  },
} as const
