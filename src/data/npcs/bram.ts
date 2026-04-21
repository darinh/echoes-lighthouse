import type { NPCFullData } from './dialogueTypes.js'

export const BRAM_NPC: NPCFullData = {
  id: 'bram',
  nameKey: 'npc.bram.name',
  titleKey: 'npc.bram.title',
  defaultLocation: 'village_square',
  defaultAttitude: 'neutral',
  schedule: {
    morning:    'village_square',
    afternoon:  'village_square',
    dusk:       'village_inn',
    night_safe: 'keepers_cottage',
  },
  tierThresholds: [0, 5, 10, 20, 35, 55, 80],
  greetingNodes: [
    'bram.greeting.tier0',
    'bram.greeting.tier1',
    'bram.greeting.tier2',
    'bram.greeting.tier3',
    'bram.greeting.tier4',
  ],
  nodes: {

    // ── Tier 0 ── First meeting. Measured, not unfriendly. ─────────────────

    'bram.greeting.tier0': {
      speakerKey: 'npc.bram.greeting.tier0',
      choices: [
        { id: 'ask_forge_work',  textKey: 'dialogue.choice.ask_forge_work',  nextNodeId: 'bram.forge.work',    insightGain: 3 },
        { id: 'ask_island',      textKey: 'dialogue.choice.ask_island',       nextNodeId: 'bram.island.first',  insightGain: 3 },
        { id: 'leave',           textKey: 'dialogue.choice.leave' },
      ],
    },

    'bram.forge.work': {
      speakerKey: 'npc.bram.forge.work',
      choices: [
        { id: 'ask_commission',  textKey: 'dialogue.choice.ask_commission',  nextNodeId: 'bram.commission.intro', insightGain: 5, trustGain: 2 },
        { id: 'leave',           textKey: 'dialogue.choice.leave' },
      ],
    },

    'bram.island.first': {
      speakerKey: 'npc.bram.island.first',
      choices: [
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    'bram.commission.intro': {
      speakerKey: 'npc.bram.commission.intro',
      choices: [
        { id: 'press_harder',  textKey: 'dialogue.choice.press_harder',  nextNodeId: 'bram.commission.early_deflect', insightGain: 3, trustLoss: 1, moralWeight: 1 },
        { id: 'leave',         textKey: 'dialogue.choice.leave' },
      ],
    },

    'bram.commission.early_deflect': {
      speakerKey: 'npc.bram.commission.early_deflect',
      choices: [
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 1 ── Opens up. Mentions Dov. Commission weighs on him. ─────────

    'bram.greeting.tier1': {
      speakerKey: 'npc.bram.greeting.tier1',
      choices: [
        { id: 'ask_commission_burden',  textKey: 'dialogue.choice.ask_commission',       nextNodeId: 'bram.commission.burden',     insightGain: 5, trustGain: 3 },
        { id: 'ask_mechanism',          textKey: 'dialogue.choice.ask_mechanism',         nextNodeId: 'bram.mechanism.suspicion',   insightGain: 5, trustGain: 2 },
        { id: 'ask_dov',                textKey: 'dialogue.choice.ask_dov',               nextNodeId: 'bram.dov.mention',           insightGain: 5, trustGain: 2 },
        { id: 'leave',                  textKey: 'dialogue.choice.leave' },
      ],
    },

    'bram.commission.burden': {
      speakerKey: 'npc.bram.commission.burden',
      choices: [
        { id: 'ask_coupling_purpose',  textKey: 'dialogue.choice.press_harder',  nextNodeId: 'bram.coupling.purpose', insightGain: 5, trustGain: 2 },
        { id: 'leave',                 textKey: 'dialogue.choice.leave' },
      ],
    },

    'bram.coupling.purpose': {
      speakerKey: 'npc.bram.coupling.purpose',
      choices: [
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    'bram.mechanism.suspicion': {
      speakerKey: 'npc.bram.mechanism.suspicion',
      choices: [
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    'bram.dov.mention': {
      speakerKey: 'npc.bram.dov.mention',
      choices: [
        { id: 'press_dov',  textKey: 'dialogue.choice.press_harder',  nextNodeId: 'bram.dov.disappeared', insightGain: 5 },
        { id: 'leave',      textKey: 'dialogue.choice.leave' },
      ],
    },

    'bram.dov.disappeared': {
      speakerKey: 'npc.bram.dov.disappeared',
      choices: [
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 2 ── Quest door opens. Truth/lie branch. ──────────────────────

    'bram.greeting.tier2': {
      speakerKey: 'npc.bram.greeting.tier2',
      choices: [
        { id: 'open_truth_path',   textKey: 'dialogue.choice.ask_mechanism',          nextNodeId: 'bram.quest.door',     insightGain: 5, trustGain: 2 },
        { id: 'ask_spare_coupling', textKey: 'dialogue.choice.ask_commission',         nextNodeId: 'bram.coupling.spare', insightGain: 3, trustGain: 1 },
        { id: 'leave',             textKey: 'dialogue.choice.leave' },
      ],
    },

    'bram.quest.door': {
      speakerKey: 'npc.bram.quest.door',
      choices: [
        {
          id: 'tell_full_truth',
          textKey: 'dialogue.choice.tell_full_truth',
          nextNodeId: 'bram.truth.full',
          requiresSealedInsight: 'mechanism_purpose',
          trustGain: 15,
          insightGain: 10,
          worldFlagSet: 'bram_full_truth_told',
          questTrigger: 'blacksmiths_commission',
        },
        {
          id: 'tell_partial_truth',
          textKey: 'dialogue.choice.tell_partial_truth',
          nextNodeId: 'bram.truth.partial',
          trustGain: 5,
          insightGain: 5,
          worldFlagSet: 'bram_partial_truth_told',
          questTrigger: 'blacksmiths_commission',
        },
        {
          id: 'tell_lie',
          textKey: 'dialogue.choice.tell_lie',
          nextNodeId: 'bram.truth.lie',
          worldFlagSet: 'bram_lied_to',
          moralWeight: -2,
        },
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    'bram.truth.full': {
      speakerKey: 'npc.bram.truth.full',
      choices: [
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    'bram.truth.partial': {
      speakerKey: 'npc.bram.truth.partial',
      choices: [
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    'bram.truth.lie': {
      speakerKey: 'npc.bram.truth.lie',
      choices: [
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    'bram.coupling.spare': {
      speakerKey: 'npc.bram.coupling.spare',
      choices: [
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 3 ── Aftermath. He's had time to sit with what you told him. ──

    'bram.greeting.tier3': {
      speakerKey: 'npc.bram.greeting.tier3',
      choices: [
        {
          id: 'ask_aftermath_full',
          textKey: 'dialogue.choice.press_harder',
          nextNodeId: 'bram.aftermath.full',
          worldFlagRequired: 'bram_full_truth_told',
          insightGain: 8,
          trustGain: 5,
        },
        {
          id: 'ask_aftermath_partial',
          textKey: 'dialogue.choice.press_harder',
          nextNodeId: 'bram.aftermath.partial',
          worldFlagRequired: 'bram_partial_truth_told',
          insightGain: 5,
          trustGain: 2,
        },
        {
          id: 'ask_aftermath_lie',
          textKey: 'dialogue.choice.press_harder',
          nextNodeId: 'bram.aftermath.lie',
          worldFlagRequired: 'bram_lied_to',
          insightGain: 3,
        },
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    'bram.aftermath.full': {
      speakerKey: 'npc.bram.aftermath.full',
      choices: [
        { id: 'offer_help_dismantle',  textKey: 'dialogue.choice.offer_help',  nextNodeId: 'bram.dismantle.offer', insightGain: 8, trustGain: 5 },
        { id: 'leave',                 textKey: 'dialogue.choice.leave' },
      ],
    },

    'bram.dismantle.offer': {
      speakerKey: 'npc.bram.dismantle.offer',
      choices: [
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    'bram.aftermath.partial': {
      speakerKey: 'npc.bram.aftermath.partial',
      choices: [
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    'bram.aftermath.lie': {
      speakerKey: 'npc.bram.aftermath.lie',
      choices: [
        { id: 'confess_truth',  textKey: 'dialogue.choice.demand_truth',  nextNodeId: 'bram.lie.confess', insightGain: 5, trustGain: 8, moralWeight: 2, worldFlagSet: 'bram_full_truth_told' },
        { id: 'leave',          textKey: 'dialogue.choice.leave' },
      ],
    },

    'bram.lie.confess': {
      speakerKey: 'npc.bram.lie.confess',
      choices: [
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 4 ── Late-game reflection. He's made peace with the weight. ───

    'bram.greeting.tier4': {
      speakerKey: 'npc.bram.greeting.tier4',
      choices: [
        { id: 'ask_father_keeper',  textKey: 'dialogue.choice.ask_keeper',  nextNodeId: 'bram.father.keeper', insightGain: 10, trustGain: 5, requiresTier: 4 },
        { id: 'leave',              textKey: 'dialogue.choice.leave' },
      ],
    },

    'bram.father.keeper': {
      speakerKey: 'npc.bram.father.keeper',
      choices: [
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

  },
}
