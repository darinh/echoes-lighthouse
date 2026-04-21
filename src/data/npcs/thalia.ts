import type { NPCFullData } from './dialogueTypes.js'

export const THALIA_NPC: NPCFullData = {
  id: 'thalia',
  nameKey: 'npc.thalia.name',
  titleKey: 'npc.thalia.title',
  defaultLocation: 'mill',
  defaultAttitude: 'friendly',
  schedule: { morning: 'mill', afternoon: 'mill', dusk: 'village_square' },
  tierThresholds: [0, 3, 7, 15, 25, 40, 60, 80, 100, 130, 170],
  greetingNodes: [
    'thalia.greeting.tier0',
    'thalia.greeting.tier1',
    'thalia.greeting.tier2',
    'thalia.greeting.tier3',
    'thalia.greeting.tier4',
  ],
  nodes: {

    // ── Tier 0 — Wary stranger ──────────────────────────────────────────────
    'thalia.greeting.tier0': {
      speakerKey: 'npc.thalia.greeting.tier0',
      choices: [
        { id: 'ask.herbs', textKey: 'dialogue.choice.ask_herbs', nextNodeId: 'thalia.herbs.general', insightGain: 3, trustGain: 1 },
        { id: 'ask.lighthouse', textKey: 'dialogue.choice.ask_lighthouse', nextNodeId: 'thalia.lighthouse.distance', insightGain: 3 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    'thalia.herbs.general': {
      speakerKey: 'npc.thalia.herbs.general',
      choices: [
        { id: 'ask.patient', textKey: 'dialogue.choice.ask_patient', nextNodeId: 'thalia.patient.mention', insightGain: 5, trustGain: 2 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    'thalia.lighthouse.distance': {
      speakerKey: 'npc.thalia.lighthouse.distance',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    'thalia.patient.mention': {
      speakerKey: 'npc.thalia.patient.mention',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 1 — Ally taking shape ──────────────────────────────────────────
    'thalia.greeting.tier1': {
      speakerKey: 'npc.thalia.greeting.tier1',
      choices: [
        { id: 'ask.shadow_root', textKey: 'dialogue.choice.ask_shadow_root', nextNodeId: 'thalia.shadow_root.explain', insightGain: 8, trustGain: 3 },
        { id: 'ask.knowledge', textKey: 'dialogue.choice.ask_knowledge', nextNodeId: 'thalia.knowledge.origin', insightGain: 6, trustGain: 2 },
        { id: 'ask.herbs', textKey: 'dialogue.choice.ask_herbs', nextNodeId: 'thalia.herbs.general', insightGain: 3 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    'thalia.shadow_root.explain': {
      speakerKey: 'npc.thalia.shadow_root.explain',
      choices: [
        { id: 'offer.fetch', textKey: 'dialogue.choice.offer_help', nextNodeId: 'thalia.quest.accept', trustGain: 5, insightGain: 5, questStart: 'herbalist_debt' },
        { id: 'ask.substitute', textKey: 'dialogue.choice.suggest_substitute', nextNodeId: 'thalia.quest.substitute', trustGain: 3, insightGain: 10 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    'thalia.knowledge.origin': {
      speakerKey: 'npc.thalia.knowledge.origin',
      choices: [
        { id: 'ask.shadow_root', textKey: 'dialogue.choice.ask_shadow_root', nextNodeId: 'thalia.shadow_root.explain', insightGain: 6, trustGain: 2 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 2 — Quest paths ─────────────────────────────────────────────────
    'thalia.greeting.tier2': {
      speakerKey: 'npc.thalia.greeting.tier2',
      choices: [
        { id: 'fetch.herb', textKey: 'dialogue.choice.fetch_herb', nextNodeId: 'thalia.quest.accept', insightGain: 5, questStart: 'herbalist_debt' },
        { id: 'negotiate.upfront', textKey: 'dialogue.choice.negotiate_upfront', nextNodeId: 'thalia.quest.negotiate', insightGain: 8, trustLoss: 3, moralWeight: 1 },
        { id: 'ask.substitute', textKey: 'dialogue.choice.suggest_substitute', nextNodeId: 'thalia.quest.substitute', insightGain: 10 },
        { id: 'ask.shadow_root', textKey: 'dialogue.choice.ask_shadow_root', nextNodeId: 'thalia.shadow_root.explain', insightGain: 5 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    'thalia.quest.accept': {
      speakerKey: 'npc.thalia.quest.accept',
      choices: [
        { id: 'ask.where_ruins', textKey: 'dialogue.choice.ask_what_happened', nextNodeId: 'thalia.ruins.directions', insightGain: 5, trustGain: 3, worldFlagSet: 'thalia_quest_complete' },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    'thalia.quest.negotiate': {
      speakerKey: 'npc.thalia.quest.negotiate',
      choices: [
        { id: 'accept.terms', textKey: 'dialogue.choice.accept_bargain', nextNodeId: 'thalia.schematic.mention', trustLoss: 5, worldFlagSet: 'thalia_debt_owed' },
        { id: 'refuse.negotiate', textKey: 'dialogue.choice.refuse_bargain', nextNodeId: 'thalia.quest.accept', trustGain: 2 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    'thalia.quest.substitute': {
      speakerKey: 'npc.thalia.quest.substitute',
      choices: [
        { id: 'explain.substitute', textKey: 'dialogue.choice.press_harder', nextNodeId: 'thalia.substitute.knowledge', trustGain: 15, insightGain: 12, worldFlagSet: 'thalia_substitution_known' },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    'thalia.substitute.knowledge': {
      speakerKey: 'npc.thalia.substitute.knowledge',
      choices: [
        { id: 'ask.schematic', textKey: 'dialogue.choice.ask_unusual', nextNodeId: 'thalia.schematic.mention', insightGain: 8, trustGain: 5 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    'thalia.ruins.directions': {
      speakerKey: 'npc.thalia.ruins.directions',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    'thalia.schematic.mention': {
      speakerKey: 'npc.thalia.schematic.mention',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 3 — Resolution ──────────────────────────────────────────────────
    'thalia.greeting.tier3': {
      speakerKey: 'npc.thalia.greeting.tier3',
      choices: [
        { id: 'ask.patient.outcome', textKey: 'dialogue.choice.ask_what_happened', nextNodeId: 'thalia.patient.outcome', insightGain: 8, trustGain: 3 },
        { id: 'ask.schematic.meaning', textKey: 'dialogue.choice.ask_mechanism', nextNodeId: 'thalia.schematic.meaning', insightGain: 10 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    'thalia.patient.outcome': {
      speakerKey: 'npc.thalia.patient.outcome',
      choices: [
        { id: 'ask.schematic.meaning', textKey: 'dialogue.choice.ask_mechanism', nextNodeId: 'thalia.schematic.meaning', insightGain: 8 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    'thalia.schematic.meaning': {
      speakerKey: 'npc.thalia.schematic.meaning',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 4 — Late-loop trust ─────────────────────────────────────────────
    'thalia.greeting.tier4': {
      speakerKey: 'npc.thalia.greeting.tier4',
      choices: [
        {
          id: 'ask.cycles',
          textKey: 'dialogue.choice.ask_what_irreversible',
          nextNodeId: 'thalia.cycles.awareness',
          requiresTier: 4,
          insightGain: 15,
          trustGain: 5,
        },
        { id: 'ask.schematic.meaning', textKey: 'dialogue.choice.ask_mechanism', nextNodeId: 'thalia.schematic.meaning', insightGain: 8 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    'thalia.cycles.awareness': {
      speakerKey: 'npc.thalia.cycles.awareness',
      choices: [
        { id: 'ask.what_survives', textKey: 'dialogue.choice.ask_what_was_coming', nextNodeId: 'thalia.cycles.survives', insightGain: 12, trustGain: 5 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    'thalia.cycles.survives': {
      speakerKey: 'npc.thalia.cycles.survives',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

  },
}
