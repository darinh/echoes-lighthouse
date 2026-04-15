import type { NPCFullData } from './dialogueTypes.js'

export const ELARA_NPC: NPCFullData = {
  id: 'elara',
  nameKey: 'npc.elara.name',
  titleKey: 'npc.elara.title',
  defaultLocation: 'harbor',
  defaultAttitude: 'fearful',
  schedule: { dusk: 'village_square', night_safe: 'keepers_cottage', night_dark: 'ruins' },
  tierThresholds: [0, 3, 7, 15, 25, 40, 60, 80, 100, 130, 170],
  greetingNodes: ['elara.greeting.tier0','elara.greeting.tier1','elara.greeting.tier2','elara.greeting.tier3','elara.greeting.tier4','elara.greeting.tier5'],
  nodes: {
    'elara.greeting.tier0': {
      speakerKey: 'npc.elara.greeting.tier0',
      choices: [
        { id: 'ask.mainland', textKey: 'dialogue.choice.ask_mainland', nextNodeId: 'elara.mainland.chat', insightGain: 3, trustGain: 3 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'elara.mainland.chat': {
      speakerKey: 'npc.elara.mainland.chat',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'elara.greeting.tier1': {
      speakerKey: 'npc.elara.greeting.tier1',
      choices: [
        { id: 'ask.water.thing', textKey: 'dialogue.choice.ask_water_creature', nextNodeId: 'elara.water.creature', insightGain: 8, trustGain: 3 },
        { id: 'ask.mainland', textKey: 'dialogue.choice.ask_mainland', nextNodeId: 'elara.mainland.chat' },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'elara.water.creature': {
      speakerKey: 'npc.elara.water.creature',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'elara.greeting.tier2': {
      speakerKey: 'npc.elara.greeting.tier2',
      choices: [
        { id: 'ask.feeding.pattern', textKey: 'dialogue.choice.ask_feeding_pattern', nextNodeId: 'elara.feeding.pattern', insightGain: 10, trustGain: 4 },
        { id: 'ask.water.thing', textKey: 'dialogue.choice.ask_water_creature', nextNodeId: 'elara.water.creature' },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'elara.feeding.pattern': {
      speakerKey: 'npc.elara.feeding.pattern',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'elara.greeting.tier3': {
      speakerKey: 'npc.elara.greeting.tier3',
      choices: [
        { id: 'ask.notebook', textKey: 'dialogue.choice.ask_notebook', nextNodeId: 'elara.notebook.share', insightGain: 12, trustGain: 8, requiresTier: 3 },
        { id: 'ask.keepers.names', textKey: 'dialogue.choice.ask_keeper', nextNodeId: 'elara.keepers.names', insightGain: 15, requiresTier: 3 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'elara.notebook.share': {
      speakerKey: 'npc.elara.notebook.share',
      choices: [
        { id: 'accept.notes', textKey: 'dialogue.choice.accept_gift', nextNodeId: 'elara.notes.received', insightGain: 10, worldFlagSet: 'elara_notes_received', questTrigger: 'quest_light_source_truth' },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'elara.notes.received': {
      speakerKey: 'npc.elara.notes.received',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'elara.greeting.tier4': {
      speakerKey: 'npc.elara.greeting.tier4',
      choices: [
        { id: 'ask.beam.diagram', textKey: 'dialogue.choice.ask_beam_diagram', nextNodeId: 'elara.beam.diagram', insightGain: 15, trustGain: 6, requiresTier: 4 },
        { id: 'ask.binding.ritual', textKey: 'dialogue.choice.ask_binding', nextNodeId: 'elara.binding.ritual', insightGain: 20, requiresTier: 4 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'elara.beam.diagram': {
      speakerKey: 'npc.elara.beam.diagram',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'elara.greeting.tier5': {
      speakerKey: 'npc.elara.greeting.tier5',
      choices: [
        { id: 'ask.vael.signal', textKey: 'dialogue.choice.ask_vael_signal', nextNodeId: 'elara.vael.communication', insightGain: 20, trustGain: 10, worldFlagSet: 'light_source_truth_hint', requiresTier: 5 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'elara.vael.communication': {
      speakerKey: 'npc.elara.vael.communication',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'elara.keepers.names': {
      speakerKey: 'npc.elara.keepers.names',
      choices: [
        { id: 'ask.ritual', textKey: 'dialogue.choice.ask_binding', nextNodeId: 'elara.binding.ritual', insightGain: 12, trustGain: 5 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'elara.binding.ritual': {
      speakerKey: 'npc.elara.binding.ritual',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
  },
}
