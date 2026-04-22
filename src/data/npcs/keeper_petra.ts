import type { NPCFullData } from './dialogueTypes.js'

export const KEEPER_PETRA_NPC: NPCFullData = {
  id: 'keeper_petra',
  nameKey: 'npc.keeper_petra.name',
  titleKey: 'npc.keeper_petra.title',
  defaultLocation: 'archive_basement',
  defaultAttitude: 'hidden',
  schedule: {},
  tierThresholds: [0, 8, 18, 35, 55],
  greetingNodes: [
    'keeper_petra.greeting.tier0',
    'keeper_petra.greeting.tier1',
    'keeper_petra.greeting.tier2',
    'keeper_petra.greeting.tier3',
    'keeper_petra.greeting.tier4',
  ],
  nodes: {

    // ── Tier 0 — A sound among the papers. Not a person yet. ─────────────

    'keeper_petra.greeting.tier0': {
      speakerKey: 'npc.keeper_petra.greeting.tier0',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 1 — She forms. She was writing when it happened. ─────────────

    'keeper_petra.greeting.tier1': {
      speakerKey: 'npc.keeper_petra.greeting.tier1',
      choices: [
        { id: 'ask_research',     textKey: 'dialogue.choice.ask_what_you_found',  nextNodeId: 'keeper_petra.research.what',       insightGain: 8, trustGain: 3 },
        { id: 'ask_who_she_was',  textKey: 'dialogue.choice.ask_who_are_you',     nextNodeId: 'keeper_petra.identity.before',     insightGain: 5, trustGain: 2 },
        { id: 'leave',            textKey: 'dialogue.choice.leave' },
      ],
    },

    'keeper_petra.research.what': {
      speakerKey: 'npc.keeper_petra.research.what',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    'keeper_petra.identity.before': {
      speakerKey: 'npc.keeper_petra.identity.before',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 2 — The pattern she was closing in on. ───────────────────────

    'keeper_petra.greeting.tier2': {
      speakerKey: 'npc.keeper_petra.greeting.tier2',
      choices: [
        { id: 'ask_the_pattern',  textKey: 'dialogue.choice.ask_about_pattern',   nextNodeId: 'keeper_petra.pattern.found',      insightGain: 12, trustGain: 5 },
        { id: 'ask_the_notes',    textKey: 'dialogue.choice.ask_about_the_notes', nextNodeId: 'keeper_petra.notes.location',     insightGain: 10, trustGain: 4 },
        { id: 'leave',            textKey: 'dialogue.choice.leave' },
      ],
    },

    'keeper_petra.pattern.found': {
      speakerKey: 'npc.keeper_petra.pattern.found',
      choices: [
        { id: 'press_further', textKey: 'dialogue.choice.press_harder', nextNodeId: 'keeper_petra.pattern.press', insightGain: 8, moralWeight: 1 },
        { id: 'leave',         textKey: 'dialogue.choice.leave' },
      ],
    },

    'keeper_petra.pattern.press': {
      speakerKey: 'npc.keeper_petra.pattern.press',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    'keeper_petra.notes.location': {
      speakerKey: 'npc.keeper_petra.notes.location',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave', worldFlagSet: 'petra_notes_location_known' },
      ],
    },

    // ── Tier 3 — What she discovered and what it cost her. ───────────────

    'keeper_petra.greeting.tier3': {
      speakerKey: 'npc.keeper_petra.greeting.tier3',
      choices: [
        { id: 'ask_final_entry',    textKey: 'dialogue.choice.ask_about_the_end',     nextNodeId: 'keeper_petra.end.what_happened', insightGain: 18, trustGain: 8, worldFlagRequired: 'petra_notes_location_known' },
        { id: 'ask_warning',        textKey: 'dialogue.choice.ask_what_to_avoid',     nextNodeId: 'keeper_petra.warning.given',     insightGain: 12, trustGain: 5 },
        { id: 'leave',              textKey: 'dialogue.choice.leave' },
      ],
    },

    'keeper_petra.end.what_happened': {
      speakerKey: 'npc.keeper_petra.end.what_happened',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave', worldFlagSet: 'keeper_petra_fate_known' },
      ],
    },

    'keeper_petra.warning.given': {
      speakerKey: 'npc.keeper_petra.warning.given',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 4 — The last thing she wants to tell you. ───────────────────

    'keeper_petra.greeting.tier4': {
      speakerKey: 'npc.keeper_petra.greeting.tier4',
      choices: [
        { id: 'ask_the_cipher',     textKey: 'dialogue.choice.ask_about_cipher',      nextNodeId: 'keeper_petra.cipher.revealed',   insightGain: 25, trustGain: 10, worldFlagRequired: 'keeper_petra_fate_known' },
        { id: 'offer_witness',      textKey: 'dialogue.choice.offer_to_witness',       nextNodeId: 'keeper_petra.witnessed',         insightGain: 10, trustGain: 8,  moralWeight: 2 },
        { id: 'leave',              textKey: 'dialogue.choice.leave' },
      ],
    },

    'keeper_petra.cipher.revealed': {
      speakerKey: 'npc.keeper_petra.cipher.revealed',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave', worldFlagSet: 'archive_cipher_full' },
      ],
    },

    'keeper_petra.witnessed': {
      speakerKey: 'npc.keeper_petra.witnessed',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave', worldFlagSet: 'keeper_petra_witnessed' },
      ],
    },

  },
}
