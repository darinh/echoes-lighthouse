import type { NPCFullData } from './dialogueTypes.js'

export const TOBIAS_NPC: NPCFullData = {
  id: 'tobias',
  nameKey: 'npc.tobias.name',
  titleKey: 'npc.tobias.title',
  defaultLocation: 'mill',
  defaultAttitude: 'friendly',
  schedule: { dusk: 'village_square', night_safe: 'keepers_cottage', night_dark: 'village_square' },
  tierThresholds: [0, 3, 7, 15, 25, 40, 60, 80, 100, 130, 170],
  greetingNodes: ['tobias.greeting.tier0','tobias.greeting.tier1','tobias.greeting.tier2','tobias.greeting.tier3','tobias.greeting.tier4','tobias.greeting.tier5'],
  nodes: {
    'tobias.greeting.tier0': {
      speakerKey: 'npc.tobias.greeting.tier0',
      choices: [
        { id: 'ask.work', textKey: 'dialogue.choice.ask_work', nextNodeId: 'tobias.work.description', insightGain: 3, trustGain: 2 },
        { id: 'ask.lighthouse', textKey: 'dialogue.choice.ask_lighthouse', nextNodeId: 'tobias.lighthouse.brush', insightGain: 5 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'tobias.work.description': {
      speakerKey: 'npc.tobias.work.description',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'tobias.lighthouse.brush': {
      speakerKey: 'npc.tobias.lighthouse.brush',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'tobias.greeting.tier1': {
      speakerKey: 'npc.tobias.greeting.tier1',
      choices: [
        { id: 'ask.gears', textKey: 'dialogue.choice.ask_gears', nextNodeId: 'tobias.gears.commission', insightGain: 8, trustGain: 3 },
        { id: 'ask.lighthouse', textKey: 'dialogue.choice.ask_lighthouse', nextNodeId: 'tobias.lighthouse.brush' },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'tobias.gears.commission': {
      speakerKey: 'npc.tobias.gears.commission',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'tobias.greeting.tier2': {
      speakerKey: 'npc.tobias.greeting.tier2',
      choices: [
        { id: 'ask.gears.fit', textKey: 'dialogue.choice.ask_gears_fit', nextNodeId: 'tobias.gears.misfit', insightGain: 10, trustGain: 4 },
        { id: 'ask.gears', textKey: 'dialogue.choice.ask_gears', nextNodeId: 'tobias.gears.commission' },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'tobias.gears.misfit': {
      speakerKey: 'npc.tobias.gears.misfit',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'tobias.greeting.tier3': {
      speakerKey: 'npc.tobias.greeting.tier3',
      choices: [
        { id: 'ask.silence', textKey: 'dialogue.choice.ask_silenced', nextNodeId: 'tobias.paid.silence', insightGain: 12, trustGain: 5, moralWeight: 1, requiresTier: 3 },
        { id: 'ask.trapdoor', textKey: 'dialogue.choice.ask_what_happened', nextNodeId: 'tobias.trapdoor.truth', insightGain: 12, requiresTier: 3 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'tobias.paid.silence': {
      speakerKey: 'npc.tobias.paid.silence',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'tobias.greeting.tier4': {
      speakerKey: 'npc.tobias.greeting.tier4',
      choices: [
        { id: 'ask.gear.kept', textKey: 'dialogue.choice.ask_gear_kept', nextNodeId: 'tobias.gear.offer', insightGain: 15, trustGain: 8, requiresTier: 4 },
        { id: 'ask.grandfather', textKey: 'dialogue.choice.ask_former_keeper', nextNodeId: 'tobias.grandfather.secret', insightGain: 18, requiresTier: 4 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'tobias.gear.offer': {
      speakerKey: 'npc.tobias.gear.offer',
      choices: [
        { id: 'accept.gear', textKey: 'dialogue.choice.accept_gift', nextNodeId: 'tobias.gear.received', insightGain: 10, worldFlagSet: 'mechanism_gear_received' },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'tobias.gear.received': {
      speakerKey: 'npc.tobias.gear.received',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'tobias.greeting.tier5': {
      speakerKey: 'npc.tobias.greeting.tier5',
      choices: [
        { id: 'ask.commissioner', textKey: 'dialogue.choice.ask_commissioner', nextNodeId: 'tobias.commissioner.silas', insightGain: 20, moralWeight: 2, worldFlagSet: 'tobias_named_silas', requiresTier: 5 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'tobias.commissioner.silas': {
      speakerKey: 'npc.tobias.commissioner.silas',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'tobias.trapdoor.truth': {
      speakerKey: 'npc.tobias.trapdoor.truth',
      choices: [
        { id: 'ask.grandfather', textKey: 'dialogue.choice.ask_former_keeper', nextNodeId: 'tobias.grandfather.secret', insightGain: 10, trustGain: 5 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'tobias.grandfather.secret': {
      speakerKey: 'npc.tobias.grandfather.secret',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
  },
}
