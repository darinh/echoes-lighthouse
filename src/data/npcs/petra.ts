import type { NPCFullData } from './dialogueTypes.js'

export const PETRA_NPC: NPCFullData = {
  id: 'petra',
  nameKey: 'npc.petra.name',
  titleKey: 'npc.petra.title',
  defaultLocation: 'village_square',
  defaultAttitude: 'neutral',
  schedule: { night_dark: 'chapel' },
  tierThresholds: [0, 3, 7, 15, 25, 40, 60, 80, 100, 130, 170],
  greetingNodes: ['petra.greeting.tier0','petra.greeting.tier1','petra.greeting.tier2','petra.greeting.tier3','petra.greeting.tier4','petra.greeting.tier5'],
  nodes: {
    'petra.greeting.tier0': {
      speakerKey: 'npc.petra.greeting.tier0',
      choices: [
        { id: 'ask.remedies', textKey: 'dialogue.choice.ask_remedies', nextNodeId: 'petra.remedies.offer', insightGain: 3, trustGain: 2 },
        { id: 'ask.island', textKey: 'dialogue.choice.ask_island', nextNodeId: 'petra.island.intro', insightGain: 5 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'petra.remedies.offer': {
      speakerKey: 'npc.petra.remedies.offer',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'petra.island.intro': {
      speakerKey: 'npc.petra.island.intro',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'petra.greeting.tier1': {
      speakerKey: 'npc.petra.greeting.tier1',
      choices: [
        { id: 'ask.keepers', textKey: 'dialogue.choice.ask_keeper', nextNodeId: 'petra.keepers.pattern', insightGain: 8, trustGain: 3 },
        { id: 'ask.remedies', textKey: 'dialogue.choice.ask_remedies', nextNodeId: 'petra.remedies.offer' },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'petra.keepers.pattern': {
      speakerKey: 'npc.petra.keepers.pattern',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'petra.greeting.tier2': {
      speakerKey: 'npc.petra.greeting.tier2',
      choices: [
        { id: 'ask.archive.pages', textKey: 'dialogue.choice.ask_archive_pages', nextNodeId: 'petra.archive.hints', insightGain: 10, trustGain: 4, requiresArchiveDomain: { domain: 'history', level: 1 } },
        { id: 'ask.island.memory', textKey: 'dialogue.choice.ask_island_memory', nextNodeId: 'petra.island.gossip', insightGain: 8 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'petra.archive.hints': {
      speakerKey: 'npc.petra.archive.hints',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'petra.island.gossip': {
      speakerKey: 'npc.petra.island.gossip',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'petra.greeting.tier3': {
      speakerKey: 'npc.petra.greeting.tier3',
      choices: [
        { id: 'ask.who.forgot', textKey: 'dialogue.choice.ask_who_needed_to_forget', nextNodeId: 'petra.memory.medicine', insightGain: 12, moralWeight: 1, trustGain: 5 },
        { id: 'ask.beam.signal', textKey: 'dialogue.choice.ask_lighthouse', nextNodeId: 'petra.beam.signal', insightGain: 15, requiresTier: 3 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'petra.memory.medicine': {
      speakerKey: 'npc.petra.memory.medicine',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'petra.greeting.tier4': {
      speakerKey: 'npc.petra.greeting.tier4',
      choices: [
        { id: 'ask.family.silenced', textKey: 'dialogue.choice.ask_silenced', nextNodeId: 'petra.family.silenced', insightGain: 15, moralWeight: 2, requiresTier: 4 },
        { id: 'ask.coordinates', textKey: 'dialogue.choice.press_harder', nextNodeId: 'petra.coordinates', insightGain: 20, requiresTier: 4 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'petra.family.silenced': {
      speakerKey: 'npc.petra.family.silenced',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'petra.greeting.tier5': {
      speakerKey: 'npc.petra.greeting.tier5',
      choices: [
        { id: 'accept.vial', textKey: 'dialogue.choice.accept_gift', nextNodeId: 'petra.vial.gift', insightGain: 15, trustGain: 10, worldFlagSet: 'ruins_unlocked_petra' },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'petra.vial.gift': {
      speakerKey: 'npc.petra.vial.gift',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'petra.beam.signal': {
      speakerKey: 'npc.petra.beam.signal',
      choices: [
        { id: 'ask.decode', textKey: 'dialogue.choice.press_harder', nextNodeId: 'petra.coordinates', insightGain: 12, trustGain: 6 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'petra.coordinates': {
      speakerKey: 'npc.petra.coordinates',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
  },
}
