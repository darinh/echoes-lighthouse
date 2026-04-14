import type { NPCFullData } from './dialogueTypes.js'

export const SILAS_NPC: NPCFullData = {
  id: 'silas',
  nameKey: 'npc.silas.name',
  titleKey: 'npc.silas.title',
  defaultLocation: 'harbor',
  defaultAttitude: 'neutral',
  schedule: { night_safe: 'keepers_cottage', night_dark: 'keepers_cottage' },
  tierThresholds: [0, 3, 7, 15, 25, 40, 60, 80, 100, 130, 170],
  greetingNodes: ['silas.greeting.tier0','silas.greeting.tier1','silas.greeting.tier2','silas.greeting.tier3','silas.greeting.tier4','silas.greeting.tier5'],
  nodes: {
    'silas.greeting.tier0': {
      speakerKey: 'npc.silas.greeting.tier0',
      choices: [
        { id: 'ask.ferry', textKey: 'dialogue.choice.ask_ferry', nextNodeId: 'silas.ferry.schedule', insightGain: 3 },
        { id: 'ask.lighthouse', textKey: 'dialogue.choice.ask_lighthouse', nextNodeId: 'silas.lighthouse.brush', insightGain: 5, trustLoss: 1 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'silas.ferry.schedule': {
      speakerKey: 'npc.silas.ferry.schedule',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'silas.lighthouse.brush': {
      speakerKey: 'npc.silas.lighthouse.brush',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'silas.greeting.tier1': {
      speakerKey: 'npc.silas.greeting.tier1',
      choices: [
        { id: 'ask.keeper.departure', textKey: 'dialogue.choice.ask_keeper', nextNodeId: 'silas.keeper.hurry', insightGain: 8, trustGain: 2, questStart: 'harbor_silence' },
        { id: 'ask.ferry', textKey: 'dialogue.choice.ask_ferry', nextNodeId: 'silas.ferry.schedule' },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'silas.keeper.hurry': {
      speakerKey: 'npc.silas.keeper.hurry',
      choices: [
        { id: 'press.when', textKey: 'dialogue.choice.press_harder', nextNodeId: 'silas.keeper.inconsistency', insightGain: 8, moralWeight: 1 },
        { id: 'accept', textKey: 'dialogue.choice.let_it_go' },
      ],
    },
    'silas.keeper.inconsistency': {
      speakerKey: 'npc.silas.keeper.inconsistency',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'silas.greeting.tier2': {
      speakerKey: 'npc.silas.greeting.tier2',
      choices: [
        { id: 'press.inconsistency', textKey: 'dialogue.choice.press_harder', nextNodeId: 'silas.timeline.pressure', insightGain: 12, moralWeight: 2, requiresTier: 2 },
        { id: 'ask.keeper', textKey: 'dialogue.choice.ask_keeper', nextNodeId: 'silas.keeper.hurry', insightGain: 5 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'silas.timeline.pressure': {
      speakerKey: 'npc.silas.timeline.pressure',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'silas.greeting.tier3': {
      speakerKey: 'npc.silas.greeting.tier3',
      choices: [
        { id: 'confront.coverup', textKey: 'dialogue.choice.confront_coverup', nextNodeId: 'silas.coverup.admit', insightGain: 15, moralWeight: 2, requiresTier: 3 },
        { id: 'ask.keeper', textKey: 'dialogue.choice.ask_keeper', nextNodeId: 'silas.keeper.hurry' },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'silas.coverup.admit': {
      speakerKey: 'npc.silas.coverup.admit',
      choices: [
        { id: 'ask.what.happened', textKey: 'dialogue.choice.ask_what_happened', nextNodeId: 'silas.harbor.discovery', insightGain: 12, trustGain: 5 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'silas.harbor.discovery': {
      speakerKey: 'npc.silas.harbor.discovery',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'silas.greeting.tier4': {
      speakerKey: 'npc.silas.greeting.tier4',
      choices: [
        { id: 'ask.mechanism.harbor', textKey: 'dialogue.choice.ask_mechanism', nextNodeId: 'silas.mechanism.harbor', insightGain: 15, trustGain: 5, requiresTier: 4 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'silas.mechanism.harbor': {
      speakerKey: 'npc.silas.mechanism.harbor',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'silas.greeting.tier5': {
      speakerKey: 'npc.silas.greeting.tier5',
      choices: [
        { id: 'demand.full.truth', textKey: 'dialogue.choice.demand_truth', nextNodeId: 'silas.full.truth', insightGain: 20, moralWeight: 3, worldFlagSet: 'silas_truth_known', requiresTier: 5 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'silas.full.truth': {
      speakerKey: 'npc.silas.full.truth',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
  },
}
