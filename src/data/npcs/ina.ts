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
  secret: 'Ina answered the lighthouse signal the night Alistair drowned; the margin note "I have answered it" in the archive is in her hand. She has never told anyone.',
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
          id: 'farewell',
          textKey: 'dialogue.choice.farewell',
          nextNodeId: 'ina.farewell.warm',
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
          id: 'ask.keeper.gone',
          textKey: 'dialogue.choice.ask_keeper_gone',
          nextNodeId: 'ina.lighthouse.keeper.gone',
          insightGain: 5,
          trustGain: 1,
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },

    // ─── Topic 2: About the lighthouse — full deflection chain ───────────────
    // "The Keeper's been gone for years. It's just rock and light now."
    'ina.lighthouse.keeper.gone': {
      speakerKey: 'npc.ina.lighthouse.keeper.gone',
      choices: [
        {
          id: 'ask.keeper.name',
          textKey: 'dialogue.choice.ask_keeper_name',
          nextNodeId: 'ina.lighthouse.keeper.name',
          insightGain: 6,
          trustGain: 2,
          worldFlagSet: 'ina_keeper_named',
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'ina.lighthouse.keeper.name': {
      speakerKey: 'npc.ina.lighthouse.keeper.name',
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
        // Topic 3: About the loops (requires at least 1 completed loop)
        {
          id: 'ask.loops',
          textKey: 'dialogue.choice.ask_loops',
          nextNodeId: 'ina.loops.awareness',
          worldFlagRequired: 'loop_1_reached',
          insightGain: 8,
          trustGain: 2,
        },
        // Topic 7: About Alistair (always available once tier 1 trust reached)
        {
          id: 'ask.alistair',
          textKey: 'dialogue.choice.ask_alistair',
          nextNodeId: 'ina.alistair.grief',
          insightGain: 7,
          trustGain: 3,
        },
        {
          id: 'farewell',
          textKey: 'dialogue.choice.farewell',
          nextNodeId: 'ina.farewell.warm',
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

    // ─── Topic 3: About the loops ─────────────────────────────────────────────
    // "You have that look. Like you've been here before. I don't ask those questions anymore."
    'ina.loops.awareness': {
      speakerKey: 'npc.ina.loops.awareness',
      choices: [
        {
          id: 'press.loops.how.long',
          textKey: 'dialogue.choice.ask_how_long_you_know',
          nextNodeId: 'ina.loops.how.long',
          insightGain: 8,
          trustGain: 2,
        },
        {
          id: 'ask.loops.what.changes',
          textKey: 'dialogue.choice.ask_what_changes_each_time',
          nextNodeId: 'ina.loops.changes',
          insightGain: 6,
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'ina.loops.how.long': {
      speakerKey: 'npc.ina.loops.how.long',
      choices: [
        {
          id: 'ask.loops.who.else',
          textKey: 'dialogue.choice.ask_who_else_knows',
          nextNodeId: 'ina.loops.who.else',
          insightGain: 7,
          trustGain: 1,
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'ina.loops.who.else': {
      speakerKey: 'npc.ina.loops.who.else',
      choices: [
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'ina.loops.changes': {
      speakerKey: 'npc.ina.loops.changes',
      choices: [
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },

    // ─── Topic 7: About Alistair ──────────────────────────────────────────────
    // "He used to sit right there. Every morning. I keep his mug."
    'ina.alistair.grief': {
      speakerKey: 'npc.ina.alistair.grief',
      choices: [
        {
          id: 'ask.alistair.what.happened',
          textKey: 'dialogue.choice.ask_what_happened',
          nextNodeId: 'ina.alistair.drowned',
          insightGain: 8,
          trustGain: 3,
        },
        {
          id: 'ask.alistair.mug',
          textKey: 'dialogue.choice.ask_about_the_mug',
          nextNodeId: 'ina.alistair.mug',
          insightGain: 5,
          trustGain: 2,
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'ina.alistair.drowned': {
      speakerKey: 'npc.ina.alistair.drowned',
      choices: [
        {
          id: 'ask.alistair.what.found',
          textKey: 'dialogue.choice.ask_what_alistair_found',
          nextNodeId: 'ina.alistair.what.found',
          insightGain: 10,
          trustGain: 3,
          worldFlagSet: 'alistair_story_started',
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'ina.alistair.mug': {
      speakerKey: 'npc.ina.alistair.mug',
      choices: [
        {
          id: 'ask.alistair.what.found',
          textKey: 'dialogue.choice.ask_what_alistair_found',
          nextNodeId: 'ina.alistair.what.found',
          insightGain: 10,
          trustGain: 3,
          worldFlagSet: 'alistair_story_started',
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'ina.alistair.what.found': {
      speakerKey: 'npc.ina.alistair.what.found',
      choices: [
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
          worldFlagSet: 'ina_alistair_story_told',
        },
      ],
    },

    // ─── Topic 8: Farewell ────────────────────────────────────────────────────
    'ina.farewell.warm': {
      speakerKey: 'npc.ina.farewell.warm',
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
        // Topic 4: Prophecy — Loop 4+ required
        {
          id: 'ask.prophecy',
          textKey: 'dialogue.choice.ask_about_the_dream',
          nextNodeId: 'ina.prophecy.six_colors',
          worldFlagRequired: 'loop_4_reached',
          insightGain: 15,
          trustGain: 4,
        },
        // Topic 6: About the archive
        {
          id: 'ask.archive',
          textKey: 'dialogue.choice.ask_about_the_archive',
          nextNodeId: 'ina.archive.found',
          worldFlagRequired: 'archive_basement_visited',
          insightGain: 10,
          trustGain: 3,
        },
        {
          id: 'ask.loops',
          textKey: 'dialogue.choice.ask_loops',
          nextNodeId: 'ina.loops.awareness',
          worldFlagRequired: 'loop_1_reached',
          insightGain: 8,
        },
        {
          id: 'ask.alistair',
          textKey: 'dialogue.choice.ask_alistair',
          nextNodeId: 'ina.alistair.grief',
          insightGain: 7,
        },
        {
          id: 'farewell',
          textKey: 'dialogue.choice.farewell',
          nextNodeId: 'ina.farewell.warm',
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

    // ─── Topic 4: Prophecy — Loop 4+ ─────────────────────────────────────────
    // "Every visitor who stays long enough starts dreaming the same dream."
    'ina.prophecy.six_colors': {
      speakerKey: 'npc.ina.prophecy.six_colors',
      choices: [
        {
          id: 'ask.prophecy.your.dream',
          textKey: 'dialogue.choice.ask_about_your_dream',
          nextNodeId: 'ina.prophecy.her.dream',
          insightGain: 12,
          trustGain: 5,
          worldFlagSet: 'ina_prophecy_heard',
        },
        {
          id: 'ask.prophecy.what.paths',
          textKey: 'dialogue.choice.ask_what_the_paths_mean',
          nextNodeId: 'ina.prophecy.paths.meaning',
          insightGain: 10,
          trustGain: 3,
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'ina.prophecy.her.dream': {
      speakerKey: 'npc.ina.prophecy.her.dream',
      choices: [
        {
          id: 'ask.prophecy.which.ending',
          textKey: 'dialogue.choice.ask_which_ending_was_right',
          nextNodeId: 'ina.prophecy.no.answer',
          insightGain: 8,
          moralWeight: 1,
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'ina.prophecy.no.answer': {
      speakerKey: 'npc.ina.prophecy.no.answer',
      choices: [
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'ina.prophecy.paths.meaning': {
      speakerKey: 'npc.ina.prophecy.paths.meaning',
      choices: [
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },

    // ─── Topic 6: About the archive ───────────────────────────────────────────
    // "You found it, then. The Keeper kept records of everything."
    'ina.archive.found': {
      speakerKey: 'npc.ina.archive.found',
      choices: [
        {
          id: 'ask.archive.what.feared',
          textKey: 'dialogue.choice.ask_what_you_feared',
          nextNodeId: 'ina.archive.feared',
          insightGain: 10,
          trustGain: 4,
        },
        {
          id: 'ask.archive.records',
          textKey: 'dialogue.choice.ask_what_the_records_say',
          nextNodeId: 'ina.archive.records.what',
          insightGain: 8,
          trustGain: 3,
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'ina.archive.feared': {
      speakerKey: 'npc.ina.archive.feared',
      choices: [
        {
          id: 'ask.archive.name.in.records',
          textKey: 'dialogue.choice.ask_if_your_name_is_there',
          nextNodeId: 'ina.archive.name.in.records',
          insightGain: 12,
          trustGain: 4,
          worldFlagSet: 'ina_archive_truth_sought',
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'ina.archive.name.in.records': {
      speakerKey: 'npc.ina.archive.name.in.records',
      choices: [
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'ina.archive.records.what': {
      speakerKey: 'npc.ina.archive.records.what',
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
        // Topic 4: Prophecy (Loop 4+) — accessible at tier 3 without resonance gate
        {
          id: 'ask.prophecy',
          textKey: 'dialogue.choice.ask_about_the_dream',
          nextNodeId: 'ina.prophecy.six_colors',
          worldFlagRequired: 'loop_4_reached',
          insightGain: 15,
          trustGain: 4,
        },
        // Topic 5: Vision trigger — requires harbor_silence sealed insight
        {
          id: 'ask.vision.touch',
          textKey: 'dialogue.choice.ask_about_the_light_you_felt',
          nextNodeId: 'ina.harbor.vision.approach',
          requiresSealedInsight: 'harbor_silence',
          insightGain: 20,
          trustGain: 6,
        },
        // Topic 6: About the archive
        {
          id: 'ask.archive',
          textKey: 'dialogue.choice.ask_about_the_archive',
          nextNodeId: 'ina.archive.found',
          worldFlagRequired: 'archive_basement_visited',
          insightGain: 10,
        },
        {
          id: 'ask.loops',
          textKey: 'dialogue.choice.ask_loops',
          nextNodeId: 'ina.loops.awareness',
          worldFlagRequired: 'loop_1_reached',
          insightGain: 8,
        },
        {
          id: 'ask.alistair',
          textKey: 'dialogue.choice.ask_alistair',
          nextNodeId: 'ina.alistair.grief',
          insightGain: 7,
        },
        {
          id: 'farewell',
          textKey: 'dialogue.choice.farewell',
          nextNodeId: 'ina.farewell.warm',
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

    // ─── Topic 5: Vision trigger ──────────────────────────────────────────────
    // Requires harbor_silence sealed. Ina touches the player's hand → world goes white.
    // Sets 'ina_harbor_vision_ready'; VisionTrigger 'ina_harbor_vision' fires on
    // the NEXT dialogue.start with npcId 'ina', queuing 'vision.ina_harbor'.
    // The trigger's isRepeatable: false ensures it fires at most once per playthrough.
    'ina.harbor.vision.approach': {
      speakerKey: 'npc.ina.harbor.vision.approach',
      choices: [
        {
          id: 'reach.back',
          textKey: 'dialogue.choice.reach_back',
          nextNodeId: 'ina.harbor.vision.touch',
          insightGain: 18,
          trustGain: 8,
          worldFlagSet: 'ina_harbor_vision_ready',
        },
        {
          id: 'pull.back',
          textKey: 'dialogue.choice.pull_away',
          nextNodeId: 'ina.harbor.vision.refused',
          moralWeight: -1,
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'ina.harbor.vision.touch': {
      speakerKey: 'npc.ina.harbor.vision.touch',
      choices: [
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'ina.harbor.vision.refused': {
      speakerKey: 'npc.ina.harbor.vision.refused',
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
