import type { NPCFullData } from './dialogueTypes.js'

export const KEEPER_TOBIAS_NPC: NPCFullData = {
  id: 'keeper_tobias',
  secret: 'Tobias lit the lamp on the night the mechanism had signalled darkness, overriding the cycle by thirteen minutes — the compounding error is the root of the current loop instability.',
  nameKey: 'npc.keeper_tobias.name',
  titleKey: 'npc.keeper_tobias.title',
  defaultLocation: 'lighthouse_top',
  defaultAttitude: 'hidden',
  schedule: {},
  tierThresholds: [0, 6, 16, 32, 52],
  greetingNodes: [
    'keeper_tobias.greeting.tier0',
    'keeper_tobias.greeting.tier1',
    'keeper_tobias.greeting.tier2',
    'keeper_tobias.greeting.tier3',
    'keeper_tobias.greeting.tier4',
  ],
  nodes: {

    // ── Tier 0 — Cold glass and the smell of old oil. ─────────────────────

    'keeper_tobias.greeting.tier0': {
      speakerKey: 'npc.keeper_tobias.greeting.tier0',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 1 — He is aware of you. He knows what you are. ──────────────

    'keeper_tobias.greeting.tier1': {
      speakerKey: 'npc.keeper_tobias.greeting.tier1',
      choices: [
        { id: 'ask_the_light',    textKey: 'dialogue.choice.ask_the_light_purpose', nextNodeId: 'keeper_tobias.light.truth',    insightGain: 7, trustGain: 3 },
        { id: 'ask_what_he_saw',  textKey: 'dialogue.choice.ask_what_you_saw',      nextNodeId: 'keeper_tobias.saw.first',      insightGain: 5, trustGain: 2 },
        { id: 'ask_came_to_role', textKey: 'dialogue.choice.ask_how_you_came_here', nextNodeId: 'keeper_tobias.came_to_role.origin', insightGain: 5, trustGain: 3 },
        { id: 'leave',            textKey: 'dialogue.choice.leave' },
      ],
    },

    'keeper_tobias.light.truth': {
      speakerKey: 'npc.keeper_tobias.light.truth',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    'keeper_tobias.saw.first': {
      speakerKey: 'npc.keeper_tobias.saw.first',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 2 — His last night. He watched it from this window. ─────────

    'keeper_tobias.greeting.tier2': {
      speakerKey: 'npc.keeper_tobias.greeting.tier2',
      choices: [
        { id: 'ask_last_night',   textKey: 'dialogue.choice.ask_what_happened',    nextNodeId: 'keeper_tobias.last_night.what',  insightGain: 12, trustGain: 5 },
        { id: 'ask_the_darkness', textKey: 'dialogue.choice.ask_about_darkness',   nextNodeId: 'keeper_tobias.darkness.seen',    insightGain: 10, trustGain: 4 },
        { id: 'ask_logs',         textKey: 'dialogue.choice.ask_lighthouse_logs',  nextNodeId: 'keeper_tobias.lighthouse_logs.found', insightGain: 10, trustGain: 4 },
        { id: 'leave',            textKey: 'dialogue.choice.leave' },
      ],
    },

    'keeper_tobias.last_night.what': {
      speakerKey: 'npc.keeper_tobias.last_night.what',
      choices: [
        { id: 'press_further', textKey: 'dialogue.choice.press_harder', nextNodeId: 'keeper_tobias.last_night.press', insightGain: 10, moralWeight: 1 },
        { id: 'leave',         textKey: 'dialogue.choice.leave' },
      ],
    },

    'keeper_tobias.last_night.press': {
      speakerKey: 'npc.keeper_tobias.last_night.press',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave', worldFlagSet: 'tobias_last_night_known' },
      ],
    },

    'keeper_tobias.darkness.seen': {
      speakerKey: 'npc.keeper_tobias.darkness.seen',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 3 — What he tried to do and why it failed. ──────────────────

    'keeper_tobias.greeting.tier3': {
      speakerKey: 'npc.keeper_tobias.greeting.tier3',
      choices: [
        { id: 'ask_his_attempt',   textKey: 'dialogue.choice.ask_what_you_tried',  nextNodeId: 'keeper_tobias.attempt.made',    insightGain: 18, trustGain: 8, worldFlagRequired: 'tobias_last_night_known' },
        { id: 'ask_why_failed',    textKey: 'dialogue.choice.ask_why_it_failed',   nextNodeId: 'keeper_tobias.attempt.failed',  insightGain: 14, trustGain: 5 },
        { id: 'ask_what_scares',   textKey: 'dialogue.choice.ask_what_scares_you', nextNodeId: 'keeper_tobias.what_scares.truth', insightGain: 14, trustGain: 6 },
        { id: 'leave',             textKey: 'dialogue.choice.leave' },
      ],
    },

    'keeper_tobias.attempt.made': {
      speakerKey: 'npc.keeper_tobias.attempt.made',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave', worldFlagSet: 'tobias_attempt_known' },
      ],
    },

    'keeper_tobias.attempt.failed': {
      speakerKey: 'npc.keeper_tobias.attempt.failed',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 4 — He tells you the one thing he wishes he'd known. ─────────

    'keeper_tobias.greeting.tier4': {
      speakerKey: 'npc.keeper_tobias.greeting.tier4',
      choices: [
        { id: 'ask_the_lesson',   textKey: 'dialogue.choice.ask_what_you_learned',  nextNodeId: 'keeper_tobias.lesson.final',   insightGain: 25, trustGain: 10, worldFlagRequired: 'tobias_attempt_known' },
        { id: 'ask_for_him',      textKey: 'dialogue.choice.ask_what_you_need',     nextNodeId: 'keeper_tobias.need.nothing',   insightGain: 8,  trustGain: 8,  moralWeight: 2 },
        { id: 'leave',            textKey: 'dialogue.choice.leave' },
      ],
    },

    'keeper_tobias.lesson.final': {
      speakerKey: 'npc.keeper_tobias.lesson.final',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave', worldFlagSet: 'tobias_lesson_received' },
      ],
    },

    'keeper_tobias.need.nothing': {
      speakerKey: 'npc.keeper_tobias.need.nothing',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave', worldFlagSet: 'keeper_tobias_witnessed' },
      ],
    },

    // ── Depth topics: origin, logs, deepest fear ──────────────────────────

    'keeper_tobias.came_to_role.origin': {
      speakerKey: 'npc.keeper_tobias.came_to_role.origin',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    'keeper_tobias.lighthouse_logs.found': {
      speakerKey: 'npc.keeper_tobias.lighthouse_logs.found',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave', worldFlagSet: 'tobias_logs_known' },
      ],
    },

    'keeper_tobias.what_scares.truth': {
      speakerKey: 'npc.keeper_tobias.what_scares.truth',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave', worldFlagSet: 'tobias_fear_known' },
      ],
    },

  },
}
