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
        { id: 'ask.binding.lore', textKey: 'dialogue.choice.ask_binding', nextNodeId: 'vael.binding.vision', insightGain: 10, trustGain: 4 },
        { id: 'ask.other.keepers', textKey: 'dialogue.choice.ask_other_keepers', nextNodeId: 'vael.other.keepers', insightGain: 8, trustGain: 3 },
        { id: 'ask.what.want', textKey: 'dialogue.choice.ask_what_want', nextNodeId: 'vael.what.want', insightGain: 10, trustGain: 5 },
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
    'vael.binding.vision': {
      speakerKey: 'npc.vael.binding.vision',
      choices: [
        { id: 'ask.keeper_memory', textKey: 'dialogue.choice.ask_former_keeper', nextNodeId: 'vael.keeper.memory', insightGain: 10, trustGain: 3 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'vael.keeper.memory': {
      speakerKey: 'npc.vael.keeper.memory',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'vael.other.keepers': {
      speakerKey: 'npc.vael.other.keepers',
      choices: [
        { id: 'ask.wrong_choice', textKey: 'dialogue.choice.ask_what_was_coming', nextNodeId: 'vael.wrong.choice', insightGain: 8, trustGain: 2 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'vael.wrong.choice': {
      speakerKey: 'npc.vael.wrong.choice',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'vael.what.want': {
      speakerKey: 'npc.vael.what.want',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'vael.freedom.offer': {
      speakerKey: 'npc.vael.freedom.offer',
      choices: [
        { id: 'confirm.freedom', textKey: 'dialogue.choice.accept_bargain', nextNodeId: 'vael.freedom.accepted', insightGain: 20, trustGain: 10, moralWeight: 3, worldFlagSet: 'vael_freedom_confirmed' },
        { id: 'ask.what_costs', textKey: 'dialogue.choice.ask_what_was_coming', nextNodeId: 'vael.freedom.cost', insightGain: 8 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'vael.freedom.accepted': {
      speakerKey: 'npc.vael.freedom.accepted',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'vael.freedom.cost': {
      speakerKey: 'npc.vael.freedom.cost',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'vael.transcendence.clue': {
      speakerKey: 'npc.vael.transcendence.clue',
      choices: [
        { id: 'ask.all_seven', textKey: 'dialogue.choice.ask_archive_deeper', nextNodeId: 'vael.seven.insights', insightGain: 15, trustGain: 5, requiresTier: 2 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'vael.seven.insights': {
      speakerKey: 'npc.vael.seven.insights',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'vael.greeting.tier2': {
      speakerKey: 'npc.vael.greeting.tier2',
      choices: [
        { id: 'ask.mechanism', textKey: 'dialogue.choice.ask_mechanism', nextNodeId: 'vael.mechanism.reset', insightGain: 12, trustGain: 4 },
        { id: 'ask.echo', textKey: 'dialogue.choice.ask_echo', nextNodeId: 'vael.echo.nature', insightGain: 10 },
        { id: 'offer.free_vael', textKey: 'dialogue.choice.offer_free_vael', nextNodeId: 'vael.freedom.offer', insightGain: 15, trustGain: 8, worldFlagSet: 'vael_offered_freedom' },
        { id: 'ask.transcendence', textKey: 'dialogue.choice.ask_transcendence', nextNodeId: 'vael.transcendence.clue', insightGain: 12, trustGain: 4, requiresTier: 2 },
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
        { id: 'ask.break.binding', textKey: 'dialogue.choice.ask_break_binding', nextNodeId: 'vael.break.binding', insightGain: 15, requiresTier: 3 },
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
        { id: 'ask.original.imprisonment', textKey: 'dialogue.choice.ask_original_imprisonment', nextNodeId: 'vael.original.imprisonment', insightGain: 20, requiresTier: 4 },
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
        { id: 'ask.the.choice', textKey: 'dialogue.choice.ask_the_choice', nextNodeId: 'vael.the.choice', insightGain: 25, requiresTier: 5 },
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
    'vael.break.binding': {
      speakerKey: 'npc.vael.break.binding',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'vael.original.imprisonment': {
      speakerKey: 'npc.vael.original.imprisonment',
      choices: [
        { id: 'react.shock', textKey: 'dialogue.choice.react_shock', nextNodeId: 'vael.the.choice', insightGain: 15, trustGain: 5 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'vael.the.choice': {
      speakerKey: 'npc.vael.the.choice',
      choices: [
        { id: 'choose.free', textKey: 'dialogue.choice.offer_free_vael', nextNodeId: 'vael.freedom.offer', insightGain: 20, trustGain: 10, moralWeight: 2, worldFlagSet: 'vael_freedom_path' },
        { id: 'choose.purpose', textKey: 'dialogue.choice.accept_bargain', nextNodeId: 'vael.bargain.terms', insightGain: 20, moralWeight: -1, worldFlagSet: 'lighthouse_purpose_accepted' },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
  },
}
