export const VAEL_NPC = {
  id: 'vael' as const,
  nameKey: 'npc.vael.name',
  titleKey: 'npc.vael.title',
  defaultLocation: 'cliffside' as const,
  defaultAttitude: 'hidden' as const,
  schedule: {
    dusk: 'lighthouse_top' as const,
    night_safe: 'tidal_caves' as const,
  },
  tierThresholds: [0, 3, 7, 15] as const,
  greetingNodes: ['vael.greeting.tier0', 'vael.greeting.tier1', 'vael.greeting.tier2', 'vael.greeting.tier3'],
  nodes: {
    'vael.greeting.tier0': {
      speakerKey: 'npc.vael.greeting.tier0',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave', insightGain: 0, moralWeight: 0 },
      ],
    },
    'vael.greeting.tier1': {
      speakerKey: 'npc.vael.greeting.tier1',
      choices: [
        { id: 'ask.lighthouse', textKey: 'dialogue.choice.ask_lighthouse', insightGain: 8, moralWeight: 0 },
        { id: 'ask.echo',       textKey: 'dialogue.choice.ask_echo',       insightGain: 10, moralWeight: 1 },
        { id: 'leave',          textKey: 'dialogue.choice.leave',           insightGain: 0,  moralWeight: 0 },
      ],
    },
    'vael.greeting.tier2': {
      speakerKey: 'npc.vael.greeting.tier2',
      choices: [
        { id: 'ask.keeper', textKey: 'dialogue.choice.ask_keeper', insightGain: 12, moralWeight: 0 },
        { id: 'ask.echo',   textKey: 'dialogue.choice.ask_echo',   insightGain: 10, moralWeight: 1 },
        { id: 'leave',      textKey: 'dialogue.choice.leave',       insightGain: 0,  moralWeight: 0 },
      ],
    },
    'vael.greeting.tier3': {
      speakerKey: 'npc.vael.greeting.tier3',
      choices: [
        { id: 'demand_truth', textKey: 'dialogue.choice.demand_truth', insightGain: 15, moralWeight: 2 },
        { id: 'offer_help',   textKey: 'dialogue.choice.offer_help',   insightGain: 10, moralWeight: 0 },
        { id: 'leave',        textKey: 'dialogue.choice.leave',         insightGain: 0,  moralWeight: 0 },
      ],
    },
  },
} as const
