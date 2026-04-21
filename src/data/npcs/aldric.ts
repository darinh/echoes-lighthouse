import type { NPCFullData } from './dialogueTypes.js'

export const ALDRIC_NPC: NPCFullData = {
  id: 'aldric',
  nameKey: 'npc.aldric.name',
  titleKey: 'npc.aldric.title',
  defaultLocation: 'mill',
  defaultAttitude: 'friendly',
  schedule: {
    morning:    'mill',
    afternoon:  'mill',
    dusk:       'village_inn',
    night_safe: 'village_inn',
  },
  tierThresholds: [0, 4, 9, 18, 32, 50, 75],
  greetingNodes: [
    'aldric.greeting.tier0',
    'aldric.greeting.tier1',
    'aldric.greeting.tier2',
    'aldric.greeting.tier3',
    'aldric.greeting.tier4',
  ],
  nodes: {

    // ── Tier 0 — Open and friendly ────────────────────────────────────────

    'aldric.greeting.tier0': {
      speakerKey: 'npc.aldric.greeting.tier0',
      choices: [
        { id: 'ask_customs', textKey: 'dialogue.choice.ask_island', nextNodeId: 'aldric.customs.first', insightGain: 5, trustGain: 2 },
        { id: 'ask_mill',    textKey: 'dialogue.choice.ask_work',   nextNodeId: 'aldric.mill.intro',    insightGain: 3 },
        { id: 'leave',       textKey: 'dialogue.choice.leave' },
      ],
    },

    'aldric.customs.first': {
      speakerKey: 'npc.aldric.customs.first',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    'aldric.mill.intro': {
      speakerKey: 'npc.aldric.mill.intro',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 1 — Sharing history ──────────────────────────────────────────

    'aldric.greeting.tier1': {
      speakerKey: 'npc.aldric.greeting.tier1',
      choices: [
        { id: 'ask_prev_keeper',     textKey: 'dialogue.choice.ask_prev_keeper', nextNodeId: 'aldric.previous_keeper.mention', insightGain: 8, trustGain: 3 },
        { id: 'ask_lighthouse_hist', textKey: 'dialogue.choice.ask_lighthouse',  nextNodeId: 'aldric.lighthouse.history',      insightGain: 8, trustGain: 2 },
        { id: 'leave',               textKey: 'dialogue.choice.leave' },
      ],
    },

    'aldric.previous_keeper.mention': {
      speakerKey: 'npc.aldric.previous_keeper.mention',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    'aldric.lighthouse.history': {
      speakerKey: 'npc.aldric.lighthouse.history',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 2 — The records ──────────────────────────────────────────────

    'aldric.greeting.tier2': {
      speakerKey: 'npc.aldric.greeting.tier2',
      choices: [
        { id: 'ask_records', textKey: 'dialogue.choice.ask_mill_records', nextNodeId: 'aldric.records.offer', insightGain: 12, trustGain: 5 },
        { id: 'leave',       textKey: 'dialogue.choice.leave' },
      ],
    },

    'aldric.records.offer': {
      speakerKey: 'npc.aldric.records.offer',
      choices: [
        { id: 'accept_records',  textKey: 'dialogue.choice.confirm_accept', nextNodeId: 'aldric.records.examine', insightGain: 15, trustGain: 5, worldFlagSet: 'aldric_records_offered' },
        { id: 'decline_records', textKey: 'dialogue.choice.leave',                                                                              worldFlagSet: 'aldric_records_offered' },
      ],
    },

    'aldric.records.examine': {
      speakerKey: 'npc.aldric.records.examine',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave', worldFlagSet: 'aldric_records_seen' },
      ],
    },

    // ── Tier 3 — Connecting dots ──────────────────────────────────────────

    'aldric.greeting.tier3': {
      speakerKey: 'npc.aldric.greeting.tier3',
      choices: [
        { id: 'ask_suspicion', textKey: 'dialogue.choice.ask_unusual', nextNodeId: 'aldric.suspicion', insightGain: 15, trustGain: 8 },
        { id: 'leave',         textKey: 'dialogue.choice.leave' },
      ],
    },

    'aldric.suspicion': {
      speakerKey: 'npc.aldric.suspicion',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave', worldFlagSet: 'aldric_feeding_suspicion' },
      ],
    },

    // ── Tier 4 — Full picture (trust 32+) ─────────────────────────────────

    'aldric.greeting.tier4': {
      speakerKey: 'npc.aldric.greeting.tier4',
      choices: [
        { id: 'ask_conclusion', textKey: 'dialogue.choice.ask_what_happened', nextNodeId: 'aldric.conclusion', insightGain: 20, trustGain: 10, requiresTier: 4 },
        { id: 'thank_him',      textKey: 'dialogue.choice.thank_him',         nextNodeId: 'aldric.thank',      insightGain: 5,  trustGain: 5 },
        { id: 'leave',          textKey: 'dialogue.choice.leave' },
      ],
    },

    'aldric.conclusion': {
      speakerKey: 'npc.aldric.conclusion',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave', worldFlagSet: 'aldric_truth_understood' },
      ],
    },

    'aldric.thank': {
      speakerKey: 'npc.aldric.thank',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

  },
}
