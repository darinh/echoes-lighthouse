import type { NPCFullData } from './dialogueTypes.js'

export const BRYNN_NPC: NPCFullData = {
  id: 'brynn',
  secret: "Brynn has been sleepwalking to the lighthouse top since childhood — her grandmother's suppressed notes document fourteen episodes, each coinciding with a keeper's final week.",
  nameKey: 'npc.brynn.name',
  titleKey: 'npc.brynn.title',
  defaultLocation: 'village_square',
  defaultAttitude: 'neutral',
  schedule: {
    morning:    'village_square',
    afternoon:  'village_square',
    dusk:       'village_inn',
    night_safe: 'village_inn',
  },
  tierThresholds: [0, 4, 9, 18, 30, 48, 70],
  greetingNodes: [
    'brynn.greeting.tier0',
    'brynn.greeting.tier1',
    'brynn.greeting.tier2',
    'brynn.greeting.tier3',
    'brynn.greeting.tier4',
  ],
  nodes: {

    // ── Tier 0 — Blunt and busy ────────────────────────────────────────────

    'brynn.greeting.tier0': {
      speakerKey: 'npc.brynn.greeting.tier0',
      choices: [
        { id: 'ask_work',    textKey: 'dialogue.choice.ask_work',    nextNodeId: 'brynn.work.intro',       insightGain: 3 },
        { id: 'ask_island',  textKey: 'dialogue.choice.ask_island',  nextNodeId: 'brynn.island.dismissal', insightGain: 3 },
        { id: 'leave',       textKey: 'dialogue.choice.leave' },
      ],
    },

    'brynn.work.intro': {
      speakerKey: 'npc.brynn.work.intro',
      choices: [
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    'brynn.island.dismissal': {
      speakerKey: 'npc.brynn.island.dismissal',
      choices: [
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 1 — Warming up ────────────────────────────────────────────────

    'brynn.greeting.tier1': {
      speakerKey: 'npc.brynn.greeting.tier1',
      choices: [
        { id: 'ask_keepers',  textKey: 'dialogue.choice.press_harder',   nextNodeId: 'brynn.keepers.observation', insightGain: 8, trustGain: 3 },
        { id: 'ask_animals',  textKey: 'dialogue.choice.ask_animals',    nextNodeId: 'brynn.animals.first',       insightGain: 8, trustGain: 3 },
        { id: 'ask_dreams',   textKey: 'dialogue.choice.ask_what_you_dream', nextNodeId: 'brynn.dreams.current',     insightGain: 7, trustGain: 3 },
        { id: 'leave',        textKey: 'dialogue.choice.leave' },
      ],
    },

    'brynn.keepers.observation': {
      speakerKey: 'npc.brynn.keepers.observation',
      choices: [
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    'brynn.animals.first': {
      speakerKey: 'npc.brynn.animals.first',
      choices: [
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 2 — The animal pattern ───────────────────────────────────────

    'brynn.greeting.tier2': {
      speakerKey: 'npc.brynn.greeting.tier2',
      choices: [
        { id: 'ask_pattern',     textKey: 'dialogue.choice.ask_animal_pattern',  nextNodeId: 'brynn.pattern.observation', insightGain: 12, trustGain: 5, worldFlagSet: 'brynn_animal_pattern_known' },
        { id: 'ask_lighthouse',  textKey: 'dialogue.choice.ask_lighthouse',      nextNodeId: 'brynn.lighthouse.theory',    insightGain: 8,  trustGain: 3 },
        { id: 'ask_figure',      textKey: 'dialogue.choice.ask_figure_in_light', nextNodeId: 'brynn.figure_in_light.seen',  insightGain: 11, trustGain: 5 },
        { id: 'leave',           textKey: 'dialogue.choice.leave' },
      ],
    },

    'brynn.pattern.observation': {
      speakerKey: 'npc.brynn.pattern.observation',
      choices: [
        { id: 'ask_recent',  textKey: 'dialogue.choice.press_harder',  nextNodeId: 'brynn.pattern.recent', insightGain: 8, trustGain: 3 },
        { id: 'leave',       textKey: 'dialogue.choice.leave' },
      ],
    },

    'brynn.pattern.recent': {
      speakerKey: 'npc.brynn.pattern.recent',
      choices: [
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    'brynn.lighthouse.theory': {
      speakerKey: 'npc.brynn.lighthouse.theory',
      choices: [
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 3 — The older memory ──────────────────────────────────────────

    'brynn.greeting.tier3': {
      speakerKey: 'npc.brynn.greeting.tier3',
      choices: [
        { id: 'ask_notes', textKey: 'dialogue.choice.ask_notebook',        nextNodeId: 'brynn.grandmother.notes',   insightGain: 15, trustGain: 8, worldFlagSet: 'brynn_grandmother_notes_known' },
        { id: 'ask_home',  textKey: 'dialogue.choice.ask_about_going_home', nextNodeId: 'brynn.going_home.revelation', insightGain: 13, trustGain: 7 },
        { id: 'leave',     textKey: 'dialogue.choice.leave' },
      ],
    },

    'brynn.grandmother.notes': {
      speakerKey: 'npc.brynn.grandmother.notes',
      choices: [
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 4 — The full picture ──────────────────────────────────────────

    'brynn.greeting.tier4': {
      speakerKey: 'npc.brynn.greeting.tier4',
      choices: [
        { id: 'ask_offerings',  textKey: 'dialogue.choice.ask_offerings',  nextNodeId: 'brynn.offerings.revelation', insightGain: 20, trustGain: 10, requiresTier: 4, worldFlagSet: 'brynn_offerings_known' },
        { id: 'leave',          textKey: 'dialogue.choice.leave' },
      ],
    },

    'brynn.offerings.revelation': {
      speakerKey: 'npc.brynn.offerings.revelation',
      choices: [
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Depth topics: dreams, figure in the light, going home ─────────────

    'brynn.dreams.current': {
      speakerKey: 'npc.brynn.dreams.current',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    'brynn.figure_in_light.seen': {
      speakerKey: 'npc.brynn.figure_in_light.seen',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave', worldFlagSet: 'brynn_figure_known' },
      ],
    },

    'brynn.going_home.revelation': {
      speakerKey: 'npc.brynn.going_home.revelation',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave', worldFlagSet: 'brynn_cannot_leave_known' },
      ],
    },

  },
}
