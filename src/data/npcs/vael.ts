import type { NPCFullData } from './dialogueTypes.js'

export const VAEL_NPC: NPCFullData = {
  id: 'vael',
  nameKey: 'npc.vael.name',
  titleKey: 'npc.vael.title',
  defaultLocation: 'cliffside',
  defaultAttitude: 'hidden',
  schedule: { dusk: 'lighthouse_top', night_safe: 'tidal_caves' },
  tierThresholds: [0, 3, 7, 15, 25, 40, 60, 80, 100, 130, 170],
  greetingNodes: ['vael.greeting.tier0','vael.greeting.tier1','vael.greeting.tier2','vael.greeting.tier3','vael.greeting.tier4','vael.greeting.tier5'],
  nodes: {
    'vael.greeting.tier0': {
      speakerKey: 'npc.vael.greeting.tier0',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'vael.greeting.tier1': {
      speakerKey: 'npc.vael.greeting.tier1',
      choices: [
        { id: 'ask.lighthouse', textKey: 'dialogue.choice.ask_lighthouse', nextNodeId: 'vael.light.hunger', insightGain: 8, trustGain: 3, questStart: 'quest_light_source_truth' },
        { id: 'ask.echo', textKey: 'dialogue.choice.ask_echo', nextNodeId: 'vael.echo.nature', insightGain: 10, moralWeight: 1 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'vael.light.hunger': {
      speakerKey: 'npc.vael.light.hunger',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'vael.echo.nature': {
      speakerKey: 'npc.vael.echo.nature',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'vael.greeting.tier2': {
      speakerKey: 'npc.vael.greeting.tier2',
      choices: [
        { id: 'ask.mechanism', textKey: 'dialogue.choice.ask_mechanism', nextNodeId: 'vael.mechanism.reset', insightGain: 12, trustGain: 4 },
        { id: 'ask.echo', textKey: 'dialogue.choice.ask_echo', nextNodeId: 'vael.echo.nature', insightGain: 10 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'vael.mechanism.reset': {
      speakerKey: 'npc.vael.mechanism.reset',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'vael.greeting.tier3': {
      speakerKey: 'npc.vael.greeting.tier3',
      choices: [
        { id: 'ask.former.keeper', textKey: 'dialogue.choice.ask_former_keeper', nextNodeId: 'vael.keeper.confession', insightGain: 15, trustGain: 8 },
        { id: 'ask.binding', textKey: 'dialogue.choice.ask_binding', nextNodeId: 'vael.binding.nature', insightGain: 12, requiresTier: 3 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'vael.keeper.confession': {
      speakerKey: 'npc.vael.keeper.confession',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'vael.binding.nature': {
      speakerKey: 'npc.vael.binding.nature',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'vael.greeting.tier4': {
      speakerKey: 'npc.vael.greeting.tier4',
      choices: [
        { id: 'ask.binding.detail', textKey: 'dialogue.choice.ask_how_bound', nextNodeId: 'vael.binding.eternal', insightGain: 15, trustGain: 8, requiresTier: 4 },
        { id: 'offer.help', textKey: 'dialogue.choice.offer_help', nextNodeId: 'vael.help.offer', insightGain: 10, trustGain: 5 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'vael.binding.eternal': {
      speakerKey: 'npc.vael.binding.eternal',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'vael.help.offer': {
      speakerKey: 'npc.vael.help.offer',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'vael.greeting.tier5': {
      speakerKey: 'npc.vael.greeting.tier5',
      choices: [
        { id: 'accept.bargain', textKey: 'dialogue.choice.accept_bargain', nextNodeId: 'vael.bargain.terms', insightGain: 20, trustGain: 15, moralWeight: 2, worldFlagSet: 'vael_bargain_offered' },
        { id: 'refuse.bargain', textKey: 'dialogue.choice.refuse_bargain', nextNodeId: 'vael.bargain.refused', moralWeight: -1, trustLoss: 5 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'vael.bargain.terms': {
      speakerKey: 'npc.vael.bargain.terms',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'vael.bargain.refused': {
      speakerKey: 'npc.vael.bargain.refused',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
  },
}
