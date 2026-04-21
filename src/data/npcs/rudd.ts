import type { NPCFullData } from './dialogueTypes.js'

export const RUDD_NPC: NPCFullData = {
  id: 'rudd',
  nameKey: 'npc.rudd.name',
  titleKey: 'npc.rudd.title',
  defaultLocation: 'forest_path',
  defaultAttitude: 'neutral',
  schedule: {
    morning: 'harbor',
    afternoon: 'forest_path',
    dusk: 'forest_path',
    night_safe: 'village_inn',
  },
  tierThresholds: [0, 3, 7, 15, 25, 40, 60, 80, 100, 130, 170],
  greetingNodes: [
    'rudd.greeting.tier0',
    'rudd.greeting.tier1',
    'rudd.greeting.tier2',
    'rudd.greeting.tier3',
  ],
  nodes: {
    // ─── Tier 0 — Guarded introduction ───────────────────────────────────────
    'rudd.greeting.tier0': {
      speakerKey: 'npc.rudd.greeting.tier0',
      choices: [
        {
          id: 'ask.what.doing',
          textKey: 'dialogue.choice.ask_what_doing',
          nextNodeId: 'rudd.path.business',
          insightGain: 3,
        },
        {
          id: 'ask.forest',
          textKey: 'dialogue.choice.ask_forest',
          nextNodeId: 'rudd.forest.shortcut',
          insightGain: 3,
          trustGain: 1,
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'rudd.path.business': {
      speakerKey: 'npc.rudd.path.business',
      choices: [
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'rudd.forest.shortcut': {
      speakerKey: 'npc.rudd.forest.shortcut',
      choices: [
        {
          id: 'ask.harbor.road',
          textKey: 'dialogue.choice.ask_harbor_road',
          nextNodeId: 'rudd.harbor.road',
          insightGain: 4,
          trustGain: 1,
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'rudd.harbor.road': {
      speakerKey: 'npc.rudd.harbor.road',
      choices: [
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },

    // ─── Tier 1 — Opening up, package quest offered ──────────────────────────
    'rudd.greeting.tier1': {
      speakerKey: 'npc.rudd.greeting.tier1',
      choices: [
        {
          id: 'ask.package.deliver',
          textKey: 'dialogue.choice.rudd_accept_package',
          nextNodeId: 'rudd.package.accepted',
          trustGain: 2,
          questStart: 'smugglers_shortcut',
        },
        {
          id: 'ask.package.refuse',
          textKey: 'dialogue.choice.rudd_refuse_package',
          nextNodeId: 'rudd.package.refused',
          worldFlagSet: 'rudd_non_ally',
          trustLoss: 3,
        },
        {
          id: 'ask.what.package',
          textKey: 'dialogue.choice.ask_what_in_package',
          nextNodeId: 'rudd.package.deflect',
          insightGain: 4,
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'rudd.package.accepted': {
      speakerKey: 'npc.rudd.package.accepted',
      choices: [
        {
          id: 'ask.cliff.route',
          textKey: 'dialogue.choice.ask_cliff_route',
          nextNodeId: 'rudd.cliff.route',
          insightGain: 4,
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'rudd.cliff.route': {
      speakerKey: 'npc.rudd.cliff.route',
      choices: [
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'rudd.package.refused': {
      speakerKey: 'npc.rudd.package.refused',
      choices: [
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'rudd.package.deflect': {
      speakerKey: 'npc.rudd.package.deflect',
      choices: [
        {
          id: 'accept.anyway',
          textKey: 'dialogue.choice.rudd_accept_package',
          nextNodeId: 'rudd.package.accepted',
          trustGain: 1,
          questStart: 'smugglers_shortcut',
        },
        {
          id: 'refuse.anyway',
          textKey: 'dialogue.choice.rudd_refuse_package',
          nextNodeId: 'rudd.package.refused',
          worldFlagSet: 'rudd_non_ally',
          trustLoss: 2,
        },
      ],
    },

    // ─── Tier 2 — Quest resolution paths ─────────────────────────────────────
    'rudd.greeting.tier2': {
      speakerKey: 'npc.rudd.greeting.tier2',
      choices: [
        // Path A: Delivered as promised
        {
          id: 'delivered.package',
          textKey: 'dialogue.choice.rudd_delivered_package',
          nextNodeId: 'rudd.delivery.complete',
          requiresTier: 2,
          worldFlagRequired: 'rudd_package_delivered',
          trustGain: 5,
          insightGain: 10,
        },
        // Path B: Opened the package
        {
          id: 'opened.package',
          textKey: 'dialogue.choice.rudd_opened_package',
          nextNodeId: 'rudd.package.opened.confront',
          requiresTier: 2,
          worldFlagRequired: 'rudd_package_opened',
          trustLoss: 5,
          insightGain: 8,
          moralWeight: 1,
        },
        // Path C: After refusing (non-ally) — can still ask about forest
        {
          id: 'reconsider.errand',
          textKey: 'dialogue.choice.ask_reconsider',
          nextNodeId: 'rudd.non.ally.cold',
          worldFlagRequired: 'rudd_non_ally',
        },
        {
          id: 'ask.lighthouse.supply',
          textKey: 'dialogue.choice.ask_lighthouse_supply',
          nextNodeId: 'rudd.lighthouse.supply',
          insightGain: 8,
          requiresTier: 2,
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'rudd.delivery.complete': {
      speakerKey: 'npc.rudd.delivery.complete',
      choices: [
        {
          id: 'ask.what.was.in.it',
          textKey: 'dialogue.choice.ask_what_in_package',
          nextNodeId: 'rudd.contents.reveal',
          insightGain: 12,
          trustGain: 3,
          worldFlagSet: 'harbor_old_records',
        },
        {
          id: 'accept.reward',
          textKey: 'dialogue.choice.accept_reward',
          nextNodeId: 'rudd.shortcut.marked',
          trustGain: 2,
          worldFlagSet: 'rudd_shortcut_known',
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'rudd.contents.reveal': {
      speakerKey: 'npc.rudd.contents.reveal',
      choices: [
        {
          id: 'accept.reward.after',
          textKey: 'dialogue.choice.accept_reward',
          nextNodeId: 'rudd.shortcut.marked',
          worldFlagSet: 'rudd_shortcut_known',
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'rudd.shortcut.marked': {
      speakerKey: 'npc.rudd.shortcut.marked',
      choices: [
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'rudd.package.opened.confront': {
      speakerKey: 'npc.rudd.package.opened.confront',
      choices: [
        {
          id: 'admit.curiosity',
          textKey: 'dialogue.choice.admit_curiosity',
          nextNodeId: 'rudd.opened.aftermath',
          insightGain: 8,
          moralWeight: 1,
        },
        {
          id: 'deny.intent',
          textKey: 'dialogue.choice.deny_intent',
          nextNodeId: 'rudd.opened.stalemate',
          trustLoss: 3,
        },
      ],
    },
    'rudd.opened.aftermath': {
      speakerKey: 'npc.rudd.opened.aftermath',
      choices: [
        {
          id: 'ask.supply.chain',
          textKey: 'dialogue.choice.ask_lighthouse_supply',
          nextNodeId: 'rudd.lighthouse.supply',
          insightGain: 10,
          worldFlagSet: 'harbor_old_records',
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'rudd.opened.stalemate': {
      speakerKey: 'npc.rudd.opened.stalemate',
      choices: [
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'rudd.non.ally.cold': {
      speakerKey: 'npc.rudd.non.ally.cold',
      choices: [
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'rudd.lighthouse.supply': {
      speakerKey: 'npc.rudd.lighthouse.supply',
      choices: [
        {
          id: 'press.who.ordered',
          textKey: 'dialogue.choice.press_harder',
          nextNodeId: 'rudd.supply.chain.silent',
          insightGain: 6,
          moralWeight: 1,
          trustLoss: 2,
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'rudd.supply.chain.silent': {
      speakerKey: 'npc.rudd.supply.chain.silent',
      choices: [
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },

    // ─── Tier 3 — Post-quest resolution ──────────────────────────────────────
    'rudd.greeting.tier3': {
      speakerKey: 'npc.rudd.greeting.tier3',
      choices: [
        {
          id: 'ask.why.smuggle',
          textKey: 'dialogue.choice.ask_why_smuggle',
          nextNodeId: 'rudd.motive.reveal',
          insightGain: 12,
          trustGain: 4,
          requiresTier: 3,
        },
        {
          id: 'ask.ina.blackmail',
          textKey: 'dialogue.choice.ask_ina_blackmail',
          nextNodeId: 'rudd.ina.confronted',
          worldFlagRequired: 'rudd_evidence_found',
          insightGain: 15,
          trustLoss: 5,
          moralWeight: 2,
          worldFlagSet: 'rudd_blackmail_confronted',
        },
        {
          id: 'ask.what.next.loop',
          textKey: 'dialogue.choice.ask_what_changes',
          nextNodeId: 'rudd.loop.wisdom',
          insightGain: 8,
          requiresTier: 3,
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'rudd.motive.reveal': {
      speakerKey: 'npc.rudd.motive.reveal',
      choices: [
        {
          id: 'ask.knot.marker',
          textKey: 'dialogue.choice.ask_knot_marker',
          nextNodeId: 'rudd.knot.marker',
          insightGain: 10,
          worldFlagSet: 'rudd_evidence_found',
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'rudd.knot.marker': {
      speakerKey: 'npc.rudd.knot.marker',
      choices: [
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'rudd.ina.confronted': {
      speakerKey: 'npc.rudd.ina.confronted',
      choices: [
        {
          id: 'demand.stop',
          textKey: 'dialogue.choice.demand_stop',
          nextNodeId: 'rudd.blackmail.dropped',
          moralWeight: 1,
          trustLoss: 3,
          worldFlagSet: 'ina_blackmail_resolved_expose',
        },
        {
          id: 'press.mediate',
          textKey: 'dialogue.choice.press_mediate',
          nextNodeId: 'rudd.mediation.offer',
          trustGain: 2,
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'rudd.blackmail.dropped': {
      speakerKey: 'npc.rudd.blackmail.dropped',
      choices: [
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'rudd.mediation.offer': {
      speakerKey: 'npc.rudd.mediation.offer',
      choices: [
        {
          id: 'accept.mediation',
          textKey: 'dialogue.choice.accept_mediation',
          nextNodeId: 'rudd.mediation.agreed',
          worldFlagSet: 'ina_blackmail_resolved_mediate',
          trustGain: 5,
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'rudd.mediation.agreed': {
      speakerKey: 'npc.rudd.mediation.agreed',
      choices: [
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'rudd.loop.wisdom': {
      speakerKey: 'npc.rudd.loop.wisdom',
      choices: [
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
  },
}
