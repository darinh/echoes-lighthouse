import type { NPCFullData } from './dialogueTypes.js'

export const DOV_NPC: NPCFullData = {
  id: 'dov',
  nameKey: 'npc.dov.name',
  titleKey: 'npc.dov.title',
  defaultLocation: 'lighthouse_base',
  defaultAttitude: 'neutral',
  schedule: { dusk: 'lighthouse_base', morning: 'mechanism_room', afternoon: 'mechanism_room' },
  tierThresholds: [0, 3, 7, 15, 25, 40, 60, 80, 100, 130, 170],
  greetingNodes: [
    'dov.greeting.tier0',
    'dov.greeting.tier1',
    'dov.greeting.tier2',
    'dov.greeting.tier3',
    'dov.greeting.tier4',
  ],
  nodes: {

    // ── Tier 0 — Stranger at the base ──────────────────────────────────────
    'dov.greeting.tier0': {
      speakerKey: 'npc.dov.greeting.tier0',
      choices: [
        { id: 'ask.mechanism', textKey: 'dialogue.choice.ask_mechanism', nextNodeId: 'dov.mechanism.basic', insightGain: 3 },
        { id: 'ask.lighthouse', textKey: 'dialogue.choice.ask_lighthouse', nextNodeId: 'dov.lighthouse.observation', insightGain: 3 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    'dov.mechanism.basic': {
      speakerKey: 'npc.dov.mechanism.basic',
      choices: [
        { id: 'ask.how_long', textKey: 'dialogue.choice.ask_how_long', nextNodeId: 'dov.maintenance.years', insightGain: 4, trustGain: 2 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    'dov.lighthouse.observation': {
      speakerKey: 'npc.dov.lighthouse.observation',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    'dov.maintenance.years': {
      speakerKey: 'npc.dov.maintenance.years',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 1 — Recognised, a little warmer ───────────────────────────────
    'dov.greeting.tier1': {
      speakerKey: 'npc.dov.greeting.tier1',
      choices: [
        { id: 'ask.mechanism.sounds', textKey: 'dialogue.choice.ask_unusual', nextNodeId: 'dov.mechanism.sounds', insightGain: 6, trustGain: 2 },
        { id: 'ask.how_long', textKey: 'dialogue.choice.ask_how_long', nextNodeId: 'dov.maintenance.years', insightGain: 4 },
        { id: 'ask.schematics.hint', textKey: 'dialogue.choice.ask_what_you_found', nextNodeId: 'dov.schematics.hint', insightGain: 8, trustGain: 3 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    'dov.mechanism.sounds': {
      speakerKey: 'npc.dov.mechanism.sounds',
      choices: [
        { id: 'press.schematics', textKey: 'dialogue.choice.ask_what_you_found', nextNodeId: 'dov.schematics.hint', insightGain: 6, trustGain: 2 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    'dov.schematics.hint': {
      speakerKey: 'npc.dov.schematics.hint',
      choices: [
        { id: 'press.hidden', textKey: 'dialogue.choice.press_harder', nextNodeId: 'dov.schematics.hidden', insightGain: 8, trustLoss: 1 },
        { id: 'let.go', textKey: 'dialogue.choice.let_it_go', trustGain: 2 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    'dov.schematics.hidden': {
      speakerKey: 'npc.dov.schematics.hidden',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 2 — The Confession ─────────────────────────────────────────────
    'dov.greeting.tier2': {
      speakerKey: 'npc.dov.greeting.tier2',
      choices: [
        {
          id: 'confess.compassionate',
          textKey: 'dialogue.choice.let_him_speak',
          nextNodeId: 'dov.confession.compassionate',
          requiresSealedInsight: 'light_source_truth',
          trustGain: 25,
          insightGain: 15,
          worldFlagSet: 'dov_confession_heard',
        },
        {
          id: 'confess.practical',
          textKey: 'dialogue.choice.ask_schematics',
          nextNodeId: 'dov.confession.practical',
          requiresSealedInsight: 'light_source_truth',
          trustGain: 10,
          insightGain: 12,
          worldFlagSet: 'dov_confession_heard',
        },
        {
          id: 'confess.accusatory',
          textKey: 'dialogue.choice.blame_him',
          nextNodeId: 'dov.confession.accusatory',
          requiresSealedInsight: 'light_source_truth',
          trustLoss: 20,
          insightGain: 10,
          moralWeight: -2,
          worldFlagSet: 'dov_accused',
        },
        { id: 'ask.mechanism', textKey: 'dialogue.choice.ask_mechanism', nextNodeId: 'dov.mechanism.sounds', insightGain: 4 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    'dov.confession.compassionate': {
      speakerKey: 'npc.dov.confession.compassionate',
      choices: [
        { id: 'ask.mechanism.purpose', textKey: 'dialogue.choice.ask_mechanism_purpose', nextNodeId: 'dov.confession.reveal', insightGain: 10, trustGain: 5 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    'dov.confession.practical': {
      speakerKey: 'npc.dov.confession.practical',
      choices: [
        { id: 'ask.mechanism.purpose', textKey: 'dialogue.choice.ask_mechanism_purpose', nextNodeId: 'dov.confession.reveal', insightGain: 8 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    'dov.confession.accusatory': {
      speakerKey: 'npc.dov.confession.accusatory',
      choices: [
        { id: 'ask.mechanism.purpose', textKey: 'dialogue.choice.ask_mechanism_purpose', nextNodeId: 'dov.confession.reveal', insightGain: 8, worldFlagSet: 'dov_confession_heard' },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    'dov.confession.reveal': {
      speakerKey: 'npc.dov.confession.reveal',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 3 — Aftermath ──────────────────────────────────────────────────
    'dov.greeting.tier3': {
      speakerKey: 'npc.dov.greeting.tier3',
      choices: [
        { id: 'ask.bram', textKey: 'dialogue.choice.ask_bram', nextNodeId: 'dov.aftermath.bram', insightGain: 8, trustGain: 3 },
        { id: 'ask.mechanism.purpose', textKey: 'dialogue.choice.ask_mechanism_purpose', nextNodeId: 'dov.mechanism.purpose_late', insightGain: 10 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    'dov.aftermath.bram': {
      speakerKey: 'npc.dov.aftermath.bram',
      choices: [
        { id: 'ask.mechanism.purpose', textKey: 'dialogue.choice.ask_mechanism_purpose', nextNodeId: 'dov.mechanism.purpose_late', insightGain: 8 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    'dov.mechanism.purpose_late': {
      speakerKey: 'npc.dov.mechanism.purpose_late',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 4 — Reckoning ──────────────────────────────────────────────────
    'dov.greeting.tier4': {
      speakerKey: 'npc.dov.greeting.tier4',
      choices: [
        {
          id: 'ask.schematics.final',
          textKey: 'dialogue.choice.ask_what_irreversible',
          nextNodeId: 'dov.schematics.final',
          requiresResonance: 4,
          insightGain: 15,
          trustGain: 5,
        },
        { id: 'ask.mechanism.purpose', textKey: 'dialogue.choice.ask_mechanism_purpose', nextNodeId: 'dov.mechanism.purpose_late', insightGain: 8 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    'dov.schematics.final': {
      speakerKey: 'npc.dov.schematics.final',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

  },
}
