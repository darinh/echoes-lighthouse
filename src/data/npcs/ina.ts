import type { NPCFullData } from './dialogueTypes.js'

export const INA_NPC: NPCFullData = {
  id: 'ina',
  nameKey: 'npc.ina.name',
  titleKey: 'npc.ina.title',
  defaultLocation: 'village_square',
  defaultAttitude: 'friendly',
  schedule: {
    morning: 'village_square',
    afternoon: 'village_square',
    dusk: 'village_inn',
    night_safe: 'village_inn',
  },
  tierThresholds: [0, 3, 7, 15, 25, 40, 60, 80, 100, 130, 170],
  greetingNodes: [
    'ina.greeting.tier0',
    'ina.greeting.tier1',
    'ina.greeting.tier2',
    'ina.greeting.tier3',
  ],
  nodes: {
    // ─── Tier 0 — Warm but cautious introduction ─────────────────────────────
    'ina.greeting.tier0': {
      speakerKey: 'npc.ina.greeting.tier0',
      choices: [
        {
          id: 'ask.village.news',
          textKey: 'dialogue.choice.ask_village_news',
          nextNodeId: 'ina.village.news',
          insightGain: 3,
          trustGain: 1,
        },
        {
          id: 'ask.inn.rooms',
          textKey: 'dialogue.choice.ask_inn_rooms',
          nextNodeId: 'ina.inn.rooms',
          insightGain: 2,
        },
        {
          id: 'ask.lighthouse',
          textKey: 'dialogue.choice.ask_lighthouse',
          nextNodeId: 'ina.lighthouse.deflect',
          insightGain: 3,
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'ina.village.news': {
      speakerKey: 'npc.ina.village.news',
      choices: [
        {
          id: 'ask.about.petra',
          textKey: 'dialogue.choice.ask_about_petra',
          nextNodeId: 'ina.rumour.petra',
          insightGain: 5,
          trustGain: 1,
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'ina.rumour.petra': {
      speakerKey: 'npc.ina.rumour.petra',
      choices: [
        {
          id: 'press.elder.records',
          textKey: 'dialogue.choice.press_harder',
          nextNodeId: 'ina.elder.records',
          insightGain: 6,
          trustGain: 2,
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'ina.elder.records': {
      speakerKey: 'npc.ina.elder.records',
      choices: [
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'ina.inn.rooms': {
      speakerKey: 'npc.ina.inn.rooms',
      choices: [
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'ina.lighthouse.deflect': {
      speakerKey: 'npc.ina.lighthouse.deflect',
      choices: [
        {
          id: 'ask.what.heard',
          textKey: 'dialogue.choice.ask_what_heard',
          nextNodeId: 'ina.lighthouse.rumour',
          insightGain: 4,
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'ina.lighthouse.rumour': {
      speakerKey: 'npc.ina.lighthouse.rumour',
      choices: [
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },

    // ─── Tier 1 — Warming up, gossip flows freely ─────────────────────────────
    'ina.greeting.tier1': {
      speakerKey: 'npc.ina.greeting.tier1',
      choices: [
        {
          id: 'ask.trouble',
          textKey: 'dialogue.choice.ask_whats_wrong',
          nextNodeId: 'ina.trouble.surface',
          insightGain: 5,
          trustGain: 2,
        },
        {
          id: 'ask.about.petra',
          textKey: 'dialogue.choice.ask_about_petra',
          nextNodeId: 'ina.rumour.petra',
          insightGain: 5,
        },
        {
          id: 'ask.strangers',
          textKey: 'dialogue.choice.ask_strangers',
          nextNodeId: 'ina.strangers.seen',
          insightGain: 5,
          trustGain: 1,
        },
        {
          id: 'ask.inn.history',
          textKey: 'dialogue.choice.ask_inn_history',
          nextNodeId: 'ina.inn.history',
          insightGain: 6,
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'ina.trouble.surface': {
      speakerKey: 'npc.ina.trouble.surface',
      choices: [
        {
          id: 'press.what.trouble',
          textKey: 'dialogue.choice.press_harder',
          nextNodeId: 'ina.trouble.deflect',
          trustLoss: 1,
          moralWeight: 1,
        },
        {
          id: 'offer.help',
          textKey: 'dialogue.choice.offer_help',
          nextNodeId: 'ina.help.offered',
          trustGain: 3,
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'ina.trouble.deflect': {
      speakerKey: 'npc.ina.trouble.deflect',
      choices: [
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'ina.help.offered': {
      speakerKey: 'npc.ina.help.offered',
      choices: [
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'ina.strangers.seen': {
      speakerKey: 'npc.ina.strangers.seen',
      choices: [
        {
          id: 'ask.rudd.seen',
          textKey: 'dialogue.choice.ask_about_rudd',
          nextNodeId: 'ina.rudd.mention',
          insightGain: 5,
          trustGain: 1,
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'ina.rudd.mention': {
      speakerKey: 'npc.ina.rudd.mention',
      choices: [
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'ina.inn.history': {
      speakerKey: 'npc.ina.inn.history',
      choices: [
        {
          id: 'ask.old.guests',
          textKey: 'dialogue.choice.ask_old_guests',
          nextNodeId: 'ina.old.guests',
          insightGain: 6,
          trustGain: 2,
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'ina.old.guests': {
      speakerKey: 'npc.ina.old.guests',
      choices: [
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },

    // ─── Tier 2 — Blackmail quest becomes available (trust 15+) ──────────────
    'ina.greeting.tier2': {
      speakerKey: 'npc.ina.greeting.tier2',
      choices: [
        {
          id: 'ask.real.problem',
          textKey: 'dialogue.choice.ask_real_problem',
          nextNodeId: 'ina.blackmail.confession',
          requiresResonance: 2,
          insightGain: 10,
          trustGain: 5,
          questStart: 'innkeepers_inventory',
        },
        {
          id: 'ask.about.petra',
          textKey: 'dialogue.choice.ask_about_petra',
          nextNodeId: 'ina.rumour.petra',
        },
        {
          id: 'ask.strangers',
          textKey: 'dialogue.choice.ask_strangers',
          nextNodeId: 'ina.strangers.seen',
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'ina.blackmail.confession': {
      speakerKey: 'npc.ina.blackmail.confession',
      choices: [
        {
          id: 'ask.who.does.this',
          textKey: 'dialogue.choice.ask_who_blackmails',
          nextNodeId: 'ina.blackmailer.hinted',
          insightGain: 8,
          trustGain: 3,
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'ina.blackmailer.hinted': {
      speakerKey: 'npc.ina.blackmailer.hinted',
      choices: [
        // Path A — Expose (requires evidence from Rudd's questline)
        {
          id: 'expose.rudd',
          textKey: 'dialogue.choice.ina_expose_rudd',
          nextNodeId: 'ina.expose.rudd.ready',
          worldFlagRequired: 'rudd_evidence_found',
          insightGain: 12,
          trustGain: 8,
          worldFlagSet: 'ina_blackmail_resolved_expose',
        },
        // Path B — Buy out (costs 20 Insight)
        {
          id: 'buyout.blackmail',
          textKey: 'dialogue.choice.ina_buyout_blackmail',
          nextNodeId: 'ina.buyout.complete',
          requiresInsight: 20,
          insightGain: 0,
          trustGain: 5,
          worldFlagSet: 'ina_blackmail_resolved_buyout',
        },
        // Path C — Mediate (requires Rudd to have dropped leverage)
        {
          id: 'mediate.resolution',
          textKey: 'dialogue.choice.ina_mediate_resolution',
          nextNodeId: 'ina.mediation.begin',
          worldFlagRequired: 'rudd_blackmail_confronted',
          insightGain: 15,
          trustGain: 10,
          worldFlagSet: 'ina_blackmail_resolved_mediate',
        },
        {
          id: 'investigate.first',
          textKey: 'dialogue.choice.investigate_first',
          nextNodeId: 'ina.investigate.guidance',
          insightGain: 5,
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'ina.expose.rudd.ready': {
      speakerKey: 'npc.ina.expose.rudd.ready',
      choices: [
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'ina.buyout.complete': {
      speakerKey: 'npc.ina.buyout.complete',
      choices: [
        {
          id: 'warn.may.return',
          textKey: 'dialogue.choice.warn_may_return',
          nextNodeId: 'ina.buyout.warning',
          insightGain: 4,
          moralWeight: 1,
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'ina.buyout.warning': {
      speakerKey: 'npc.ina.buyout.warning',
      choices: [
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'ina.mediation.begin': {
      speakerKey: 'npc.ina.mediation.begin',
      choices: [
        {
          id: 'ask.records.truth',
          textKey: 'dialogue.choice.ask_records_truth',
          nextNodeId: 'ina.records.falsified',
          insightGain: 12,
          trustGain: 5,
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'ina.records.falsified': {
      speakerKey: 'npc.ina.records.falsified',
      choices: [
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'ina.investigate.guidance': {
      speakerKey: 'npc.ina.investigate.guidance',
      choices: [
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },

    // ─── Tier 3 — Post-quest resolution, Petra lead deepens ──────────────────
    'ina.greeting.tier3': {
      speakerKey: 'npc.ina.greeting.tier3',
      choices: [
        {
          id: 'ask.relief',
          textKey: 'dialogue.choice.ask_how_feel_now',
          nextNodeId: 'ina.relief.felt',
          requiresResonance: 3,
          insightGain: 8,
          trustGain: 5,
        },
        {
          id: 'ask.falsification.why',
          textKey: 'dialogue.choice.ask_falsification_why',
          nextNodeId: 'ina.falsification.reason',
          requiresResonance: 3,
          insightGain: 12,
          moralWeight: 1,
        },
        {
          id: 'ask.petra.deeper',
          textKey: 'dialogue.choice.ask_about_petra',
          nextNodeId: 'ina.petra.deeper',
          requiresResonance: 3,
          insightGain: 10,
          trustGain: 3,
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'ina.relief.felt': {
      speakerKey: 'npc.ina.relief.felt',
      choices: [
        {
          id: 'ask.what.now',
          textKey: 'dialogue.choice.ask_what_changes',
          nextNodeId: 'ina.future.open',
          insightGain: 5,
          trustGain: 2,
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'ina.future.open': {
      speakerKey: 'npc.ina.future.open',
      choices: [
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'ina.falsification.reason': {
      speakerKey: 'npc.ina.falsification.reason',
      choices: [
        {
          id: 'ask.who.asked',
          textKey: 'dialogue.choice.ask_who_ordered',
          nextNodeId: 'ina.council.shadow',
          insightGain: 12,
          trustGain: 4,
          worldFlagSet: 'ina_council_shadow_known',
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'ina.council.shadow': {
      speakerKey: 'npc.ina.council.shadow',
      choices: [
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'ina.petra.deeper': {
      speakerKey: 'npc.ina.petra.deeper',
      choices: [
        {
          id: 'ask.what.elder.knows',
          textKey: 'dialogue.choice.ask_what_elder_knows',
          nextNodeId: 'ina.elder.secret',
          insightGain: 12,
          trustGain: 3,
          worldFlagSet: 'ina_petra_lead_given',
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'ina.elder.secret': {
      speakerKey: 'npc.ina.elder.secret',
      choices: [
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
  },
  weatherDialogue: {
    storm: 'npc.ina.weather.storm',
    fog: 'npc.ina.weather.fog',
  },
}
