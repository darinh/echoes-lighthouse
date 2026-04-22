import type { NPCFullData } from './dialogueTypes.js'

export const FENN_NPC: NPCFullData = {
  id: 'fenn',
  nameKey: 'npc.fenn.name',
  titleKey: 'npc.fenn.title',
  defaultLocation: 'mechanism_room',
  defaultAttitude: 'hidden',
  schedule: {},
  tierThresholds: [0, 5, 15, 30, 50, 80],
  greetingNodes: [
    'fenn.greeting.tier0',
    'fenn.greeting.tier1',
    'fenn.greeting.tier2',
    'fenn.greeting.tier3',
    'fenn.greeting.tier4',
  ],
  nodes: {

    // ── Tier 0 — Atmospheric presence. Not yet coherent. ─────────────────

    'fenn.greeting.tier0': {
      speakerKey: 'npc.fenn.greeting.tier0',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 1 — First words. He is not sure you can hear him. ───────────

    'fenn.greeting.tier1': {
      speakerKey: 'npc.fenn.greeting.tier1',
      choices: [
        { id: 'ask_who_built',   textKey: 'dialogue.choice.ask_who_built_this', nextNodeId: 'fenn.mechanism.builder',  insightGain: 6, trustGain: 3 },
        { id: 'ask_what_sound',  textKey: 'dialogue.choice.ask_about_sound',    nextNodeId: 'fenn.mechanism.sound',    insightGain: 4 },
        { id: 'leave',           textKey: 'dialogue.choice.leave' },
      ],
    },

    'fenn.mechanism.builder': {
      speakerKey: 'npc.fenn.mechanism.builder',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    'fenn.mechanism.sound': {
      speakerKey: 'npc.fenn.mechanism.sound',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 2 — He remembers his name. Begins to trust. ─────────────────

    'fenn.greeting.tier2': {
      speakerKey: 'npc.fenn.greeting.tier2',
      choices: [
        { id: 'ask_the_light',   textKey: 'dialogue.choice.ask_the_light_purpose', nextNodeId: 'fenn.light.purpose',   insightGain: 10, trustGain: 5 },
        { id: 'ask_his_end',     textKey: 'dialogue.choice.ask_what_happened',     nextNodeId: 'fenn.elias.death',     insightGain: 8,  trustGain: 3 },
        { id: 'leave',           textKey: 'dialogue.choice.leave' },
      ],
    },

    'fenn.light.purpose': {
      speakerKey: 'npc.fenn.light.purpose',
      choices: [
        { id: 'press_further', textKey: 'dialogue.choice.press_harder', nextNodeId: 'fenn.light.press', insightGain: 8, moralWeight: 1 },
        { id: 'leave',         textKey: 'dialogue.choice.leave' },
      ],
    },

    'fenn.light.press': {
      speakerKey: 'npc.fenn.light.press',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    'fenn.elias.death': {
      speakerKey: 'npc.fenn.elias.death',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave', worldFlagSet: 'fenn_death_known' },
      ],
    },

    // ── Tier 3 — The mechanism's true function. ───────────────────────────

    'fenn.greeting.tier3': {
      speakerKey: 'npc.fenn.greeting.tier3',
      choices: [
        { id: 'ask_cycle',      textKey: 'dialogue.choice.ask_about_cycle',    nextNodeId: 'fenn.cycle.explanation', insightGain: 15, trustGain: 8, worldFlagRequired: 'fenn_death_known' },
        { id: 'ask_stop_it',    textKey: 'dialogue.choice.ask_how_to_stop',    nextNodeId: 'fenn.cycle.impossible',  insightGain: 12, trustGain: 5 },
        { id: 'leave',          textKey: 'dialogue.choice.leave' },
      ],
    },

    'fenn.cycle.explanation': {
      speakerKey: 'npc.fenn.cycle.explanation',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave', worldFlagSet: 'fenn_cycle_understood' },
      ],
    },

    'fenn.cycle.impossible': {
      speakerKey: 'npc.fenn.cycle.impossible',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 4 — What he wants from you. The keeper's choice. ────────────

    'fenn.greeting.tier4': {
      speakerKey: 'npc.fenn.greeting.tier4',
      choices: [
        { id: 'ask_the_key',    textKey: 'dialogue.choice.ask_about_the_key',  nextNodeId: 'fenn.key.revelation',   insightGain: 25, trustGain: 10, worldFlagRequired: 'fenn_cycle_understood' },
        { id: 'ask_why_stayed', textKey: 'dialogue.choice.ask_why_stayed',     nextNodeId: 'fenn.stayed.reason',    insightGain: 10, trustGain: 8 },
        { id: 'leave',          textKey: 'dialogue.choice.leave' },
      ],
    },

    'fenn.key.revelation': {
      speakerKey: 'npc.fenn.key.revelation',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave', worldFlagSet: 'mechanism_key_known' },
      ],
    },

    'fenn.stayed.reason': {
      speakerKey: 'npc.fenn.stayed.reason',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

  },
}
