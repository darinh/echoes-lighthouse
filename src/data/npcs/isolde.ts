import type { NPCFullData } from './dialogueTypes.js'

export const ISOLDE_NPC: NPCFullData = {
  id: 'isolde',
  secret: "Isolde has cross-referenced three villagers' identical memory excisions with the lighthouse log and confirmed all three were on the cliff path the night the previous keeper vanished — their bodies remember what their minds were made to forget.",
  nameKey: 'npc.isolde.name',
  titleKey: 'npc.isolde.title',
  defaultLocation: 'village_inn',
  defaultAttitude: 'friendly',
  schedule: {
    morning:    'village_inn',
    afternoon:  'village_inn',
    dusk:       'village_inn',
    night_safe: 'village_inn',
  },
  tierThresholds: [0, 4, 9, 18, 32, 50, 75],
  greetingNodes: [
    'isolde.greeting.tier0',
    'isolde.greeting.tier1',
    'isolde.greeting.tier2',
    'isolde.greeting.tier3',
    'isolde.greeting.tier4',
  ],
  nodes: {

    // ── Tier 0 — Polite and professional ───────────────────────────────────

    'isolde.greeting.tier0': {
      speakerKey: 'npc.isolde.greeting.tier0',
      choices: [
        { id: 'ask_rooms',      textKey: 'dialogue.choice.ask_inn_rooms',   nextNodeId: 'isolde.rooms.available', insightGain: 3, trustGain: 2 },
        { id: 'ask_news',       textKey: 'dialogue.choice.ask_what_heard',  nextNodeId: 'isolde.news.deflect',    insightGain: 3 },
        { id: 'leave',          textKey: 'dialogue.choice.leave' },
      ],
    },

    'isolde.rooms.available': {
      speakerKey: 'npc.isolde.rooms.available',
      choices: [
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    'isolde.news.deflect': {
      speakerKey: 'npc.isolde.news.deflect',
      choices: [
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 1 — Warm but guarded ──────────────────────────────────────────

    'isolde.greeting.tier1': {
      speakerKey: 'npc.isolde.greeting.tier1',
      choices: [
        { id: 'ask_honestly',   textKey: 'dialogue.choice.ask_honestly',   nextNodeId: 'isolde.honest.ask',     insightGain: 8, trustGain: 4 },
        { id: 'deflect',   textKey: 'dialogue.choice.let_it_go',          nextNodeId: 'isolde.honest.deflect',          insightGain: 3 },
        { id: 'ask_lost',  textKey: 'dialogue.choice.ask_who_youve_lost', nextNodeId: 'isolde.who_youve_lost.admission', insightGain: 7, trustGain: 3 },
        { id: 'leave',     textKey: 'dialogue.choice.leave' },
      ],
    },

    'isolde.honest.ask': {
      speakerKey: 'npc.isolde.honest.ask',
      choices: [
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    'isolde.honest.deflect': {
      speakerKey: 'npc.isolde.honest.deflect',
      choices: [
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 2 — A hint of what she heard ─────────────────────────────────

    'isolde.greeting.tier2': {
      speakerKey: 'npc.isolde.greeting.tier2',
      choices: [
        { id: 'ask_night',   textKey: 'dialogue.choice.ask_night_before',  nextNodeId: 'isolde.night.hint',    insightGain: 12, trustGain: 5, worldFlagSet: 'isolde_overheard_partial' },
        { id: 'ask_secret',   textKey: 'dialogue.choice.ask_unusual',      nextNodeId: 'isolde.secret.hint',           insightGain: 8,  trustGain: 3 },
        { id: 'ask_sickness', textKey: 'dialogue.choice.ask_sickness_here', nextNodeId: 'isolde.sickness_here.pattern',  insightGain: 11, trustGain: 5 },
        { id: 'leave',        textKey: 'dialogue.choice.leave' },
      ],
    },

    'isolde.night.hint': {
      speakerKey: 'npc.isolde.night.hint',
      choices: [
        { id: 'press_night',  textKey: 'dialogue.choice.press_harder',  nextNodeId: 'isolde.night.press', insightGain: 8, moralWeight: 1 },
        { id: 'leave',        textKey: 'dialogue.choice.leave' },
      ],
    },

    'isolde.night.press': {
      speakerKey: 'npc.isolde.night.press',
      choices: [
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    'isolde.secret.hint': {
      speakerKey: 'npc.isolde.secret.hint',
      choices: [
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 3 — The full overheard fragment ──────────────────────────────

    'isolde.greeting.tier3': {
      speakerKey: 'npc.isolde.greeting.tier3',
      choices: [
        { id: 'ask_full',           textKey: 'dialogue.choice.demand_truth',             nextNodeId: 'isolde.overheard.full',             insightGain: 15, trustGain: 8, worldFlagSet: 'isolde_overheard_full' },
        { id: 'ask_body_remembers', textKey: 'dialogue.choice.ask_what_body_remembers', nextNodeId: 'isolde.body_remembers.dark_knowledge', insightGain: 16, trustGain: 8 },
        { id: 'leave',              textKey: 'dialogue.choice.leave' },
      ],
    },

    'isolde.overheard.full': {
      speakerKey: 'npc.isolde.overheard.full',
      choices: [
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 4 — The figure she saw ───────────────────────────────────────

    'isolde.greeting.tier4': {
      speakerKey: 'npc.isolde.greeting.tier4',
      choices: [
        { id: 'ask_figure',  textKey: 'dialogue.choice.ask_figure_seen',  nextNodeId: 'isolde.figure.description', insightGain: 20, trustGain: 10, requiresResonance: 4, worldFlagSet: 'isolde_figure_known' },
        { id: 'leave',       textKey: 'dialogue.choice.leave' },
      ],
    },

    'isolde.figure.description': {
      speakerKey: 'npc.isolde.figure.description',
      choices: [
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Depth topics: who she's lost, the sickness, what the body knows ──

    'isolde.who_youve_lost.admission': {
      speakerKey: 'npc.isolde.who_youve_lost.admission',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    'isolde.sickness_here.pattern': {
      speakerKey: 'npc.isolde.sickness_here.pattern',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave', worldFlagSet: 'isolde_sickness_pattern_known' },
      ],
    },

    'isolde.body_remembers.dark_knowledge': {
      speakerKey: 'npc.isolde.body_remembers.dark_knowledge',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave', worldFlagSet: 'isolde_body_memory_known' },
      ],
    },

  },
}
