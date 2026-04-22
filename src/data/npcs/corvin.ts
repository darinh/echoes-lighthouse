import type { NPCFullData } from './dialogueTypes.js'

export const CORVIN_NPC: NPCFullData = {
  id: 'corvin',
  secret: "Corvin has three conflicting charts of the island from different decades, each showing the lighthouse in a different position — the lighthouse migrates between loops, and his navigational memory is accurate enough to have noticed.",
  nameKey: 'npc.corvin.name',
  titleKey: 'npc.corvin.title',
  defaultLocation: 'harbor',
  defaultAttitude: 'neutral',
  schedule: {
    morning:    'harbor',
    afternoon:  'harbor',
    dusk:       'village_inn',
    night_safe: 'village_inn',
  },
  tierThresholds: [0, 5, 10, 20, 35, 55, 80],
  greetingNodes: [
    'corvin.greeting.tier0',
    'corvin.greeting.tier1',
    'corvin.greeting.tier2',
    'corvin.greeting.tier3',
    'corvin.greeting.tier4',
  ],
  nodes: {

    // ── Tier 0 — Closed off ────────────────────────────────────────────────

    'corvin.greeting.tier0': {
      speakerKey: 'npc.corvin.greeting.tier0',
      choices: [
        { id: 'ask_ferry_schedule', textKey: 'dialogue.choice.ask_ferry',    nextNodeId: 'corvin.ferry.schedule',  insightGain: 3 },
        { id: 'ask_mainland',  textKey: 'dialogue.choice.ask_mainland',    nextNodeId: 'corvin.mainland.closed', insightGain: 3 },
        { id: 'ask_charts',    textKey: 'dialogue.choice.ask_your_charts', nextNodeId: 'corvin.charts.current',  insightGain: 5, trustGain: 1 },
        { id: 'leave',         textKey: 'dialogue.choice.leave' },
      ],
    },

    'corvin.ferry.schedule': {
      speakerKey: 'npc.corvin.ferry.schedule',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    'corvin.mainland.closed': {
      speakerKey: 'npc.corvin.mainland.closed',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 1 — Cracks in the wall ───────────────────────────────────────

    'corvin.greeting.tier1': {
      speakerKey: 'npc.corvin.greeting.tier1',
      choices: [
        { id: 'ask_keepers_history', textKey: 'dialogue.choice.ask_other_keepers', nextNodeId: 'corvin.keepers.history',     insightGain: 8, trustGain: 3 },
        { id: 'ask_last_keeper',     textKey: 'dialogue.choice.ask_prev_keeper',   nextNodeId: 'corvin.last_keeper.deflect', insightGain: 5 },
        { id: 'leave',               textKey: 'dialogue.choice.leave' },
      ],
    },

    'corvin.keepers.history': {
      speakerKey: 'npc.corvin.keepers.history',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    'corvin.last_keeper.deflect': {
      speakerKey: 'npc.corvin.last_keeper.deflect',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 2 — Partial confession ───────────────────────────────────────

    'corvin.greeting.tier2': {
      speakerKey: 'npc.corvin.greeting.tier2',
      choices: [
        { id: 'ask_cargo',       textKey: 'dialogue.choice.ask_ferry_cargo', nextNodeId: 'corvin.cargo.hint',       insightGain: 12, trustGain: 5 },
        { id: 'ask_knew_keeper', textKey: 'dialogue.choice.ask_prev_keeper',      nextNodeId: 'corvin.last_keeper.knew',          insightGain: 8,  trustGain: 3 },
        { id: 'ask_route',       textKey: 'dialogue.choice.ask_route_never_took', nextNodeId: 'corvin.route_never_took.admission', insightGain: 10, trustGain: 4 },
        { id: 'leave',           textKey: 'dialogue.choice.leave' },
      ],
    },

    'corvin.cargo.hint': {
      speakerKey: 'npc.corvin.cargo.hint',
      choices: [
        { id: 'press_further', textKey: 'dialogue.choice.press_harder', nextNodeId: 'corvin.cargo.press', insightGain: 8, moralWeight: 1 },
        { id: 'leave',         textKey: 'dialogue.choice.leave' },
      ],
    },

    'corvin.cargo.press': {
      speakerKey: 'npc.corvin.cargo.press',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    'corvin.last_keeper.knew': {
      speakerKey: 'npc.corvin.last_keeper.knew',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 3 — The weight surfaces ──────────────────────────────────────

    'corvin.greeting.tier3': {
      speakerKey: 'npc.corvin.greeting.tier3',
      choices: [
        { id: 'ask_cargo_suspicion', textKey: 'dialogue.choice.ask_what_you_found', nextNodeId: 'corvin.cargo.suspicion', insightGain: 15, trustGain: 8 },
        { id: 'ask_employer',  textKey: 'dialogue.choice.ask_who_ordered',    nextNodeId: 'corvin.employer.hint',   insightGain: 12, trustGain: 5 },
        { id: 'ask_hiding',    textKey: 'dialogue.choice.ask_what_youre_hiding', nextNodeId: 'corvin.what_hiding.full', insightGain: 14, trustGain: 6 },
        { id: 'leave',         textKey: 'dialogue.choice.leave' },
      ],
    },

    'corvin.cargo.suspicion': {
      speakerKey: 'npc.corvin.cargo.suspicion',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave', worldFlagSet: 'corvin_cargo_suspicion_known' },
      ],
    },

    'corvin.employer.hint': {
      speakerKey: 'npc.corvin.employer.hint',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 4 — Full truth (trust 35+) ───────────────────────────────────

    'corvin.greeting.tier4': {
      speakerKey: 'npc.corvin.greeting.tier4',
      choices: [
        { id: 'ask_full_truth',  textKey: 'dialogue.choice.ask_what_happened', nextNodeId: 'corvin.full_truth', insightGain: 25, trustGain: 10, requiresResonance: 4 },
        { id: 'show_compassion', textKey: 'dialogue.choice.offer_absolution',  nextNodeId: 'corvin.compassion', insightGain: 10, trustGain: 8 },
        { id: 'leave',           textKey: 'dialogue.choice.leave' },
      ],
    },

    'corvin.full_truth': {
      speakerKey: 'npc.corvin.full_truth',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave', worldFlagSet: 'corvin_truth_known' },
      ],
    },

    'corvin.compassion': {
      speakerKey: 'npc.corvin.compassion',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave', worldFlagSet: 'corvin_remorse_acknowledged' },
      ],
    },

    // ── Depth topics: charts, the route not taken, what he hides ─────────

    'corvin.charts.current': {
      speakerKey: 'npc.corvin.charts.current',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    'corvin.route_never_took.admission': {
      speakerKey: 'npc.corvin.route_never_took.admission',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave', worldFlagSet: 'corvin_north_route_known' },
      ],
    },

    'corvin.what_hiding.full': {
      speakerKey: 'npc.corvin.what_hiding.full',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave', worldFlagSet: 'corvin_chart_discrepancy_known' },
      ],
    },

  },
}
