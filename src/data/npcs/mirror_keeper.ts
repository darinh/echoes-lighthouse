import type { NPCFullData } from './dialogueTypes.js'

export const MIRROR_KEEPER_NPC: NPCFullData = {
  id: 'mirror_keeper',
  secret: "The mirror_keeper is the last echo of a keeper who chose to become the lighthouse's reflective conscience — their name dissolved into the mechanism, but their will to warn every subsequent keeper persists.",
  nameKey: 'npc.mirror_keeper.name',
  titleKey: 'npc.mirror_keeper.title',
  defaultLocation: 'cliffside',
  defaultAttitude: 'hidden',
  schedule: {},
  tierThresholds: [0, 15, 30, 55, 90],
  greetingNodes: [
    'mirror_keeper.greeting.tier0',
    'mirror_keeper.greeting.tier1',
    'mirror_keeper.greeting.tier2',
    'mirror_keeper.greeting.tier3',
    'mirror_keeper.greeting.tier4',
  ],
  nodes: {

    // ── Tier 0 — You see yourself. You look away. ─────────────────────────

    'mirror_keeper.greeting.tier0': {
      speakerKey: 'npc.mirror_keeper.greeting.tier0',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 1 — It turns. It has your face. ─────────────────────────────

    'mirror_keeper.greeting.tier1': {
      speakerKey: 'npc.mirror_keeper.greeting.tier1',
      choices: [
        { id: 'ask_who_it_is',    textKey: 'dialogue.choice.ask_who_are_you',        nextNodeId: 'mirror_keeper.identity.denial',   insightGain: 8,  trustGain: 3 },
        { id: 'refuse_to_look',   textKey: 'dialogue.choice.turn_away',              nextNodeId: 'mirror_keeper.turned_away',       insightGain: 0,  moralWeight: -1 },
        { id: 'ask_what_shown',   textKey: 'dialogue.choice.ask_what_mirrors_show',  nextNodeId: 'mirror_keeper.mirrors_show.truth', insightGain: 7, trustGain: 2 },
        { id: 'leave',            textKey: 'dialogue.choice.leave' },
      ],
    },

    'mirror_keeper.identity.denial': {
      speakerKey: 'npc.mirror_keeper.identity.denial',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    'mirror_keeper.turned_away': {
      speakerKey: 'npc.mirror_keeper.turned_away',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 2 — It remembers the things you did. ─────────────────────────

    'mirror_keeper.greeting.tier2': {
      speakerKey: 'npc.mirror_keeper.greeting.tier2',
      choices: [
        { id: 'ask_what_it_knows',  textKey: 'dialogue.choice.ask_what_you_know',     nextNodeId: 'mirror_keeper.memory.loop',       insightGain: 15, trustGain: 5 },
        { id: 'ask_the_difference', textKey: 'dialogue.choice.ask_what_difference',   nextNodeId: 'mirror_keeper.difference.none',   insightGain: 12, trustGain: 4 },
        { id: 'ask_original_name',  textKey: 'dialogue.choice.ask_your_original_name', nextNodeId: 'mirror_keeper.original_name.partial', insightGain: 12, trustGain: 5 },
        { id: 'leave',              textKey: 'dialogue.choice.leave' },
      ],
    },

    'mirror_keeper.memory.loop': {
      speakerKey: 'npc.mirror_keeper.memory.loop',
      choices: [
        { id: 'press_further', textKey: 'dialogue.choice.press_harder', nextNodeId: 'mirror_keeper.memory.press', insightGain: 10, moralWeight: 1 },
        { id: 'leave',         textKey: 'dialogue.choice.leave' },
      ],
    },

    'mirror_keeper.memory.press': {
      speakerKey: 'npc.mirror_keeper.memory.press',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave', worldFlagSet: 'mirror_loop_known' },
      ],
    },

    'mirror_keeper.difference.none': {
      speakerKey: 'npc.mirror_keeper.difference.none',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 3 — What it is asking you not to do. ─────────────────────────

    'mirror_keeper.greeting.tier3': {
      speakerKey: 'npc.mirror_keeper.greeting.tier3',
      choices: [
        { id: 'ask_the_warning',    textKey: 'dialogue.choice.ask_what_to_avoid',     nextNodeId: 'mirror_keeper.warning.given',     insightGain: 20, trustGain: 8, worldFlagRequired: 'mirror_loop_known' },
        { id: 'ask_if_it_tried',    textKey: 'dialogue.choice.ask_if_you_tried',      nextNodeId: 'mirror_keeper.tried.yes',         insightGain: 15, trustGain: 6 },
        { id: 'ask_why_stay',       textKey: 'dialogue.choice.ask_why_you_stay',      nextNodeId: 'mirror_keeper.why_stay.revelation', insightGain: 18, trustGain: 7, worldFlagRequired: 'mirror_loop_known' },
        { id: 'leave',              textKey: 'dialogue.choice.leave' },
      ],
    },

    'mirror_keeper.warning.given': {
      speakerKey: 'npc.mirror_keeper.warning.given',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave', worldFlagSet: 'mirror_warning_known' },
      ],
    },

    'mirror_keeper.tried.yes': {
      speakerKey: 'npc.mirror_keeper.tried.yes',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 4 — What happens when you look at it and really see. ─────────

    'mirror_keeper.greeting.tier4': {
      speakerKey: 'npc.mirror_keeper.greeting.tier4',
      choices: [
        { id: 'accept_the_truth',   textKey: 'dialogue.choice.accept_the_truth',       nextNodeId: 'mirror_keeper.truth.accepted',    insightGain: 35, trustGain: 10, worldFlagRequired: 'mirror_warning_known', moralWeight: 3, worldFlagSet: 'mirror_truth_accepted' },
        { id: 'reject_the_self',    textKey: 'dialogue.choice.reject_the_reflection',  nextNodeId: 'mirror_keeper.truth.rejected',    insightGain: 10, moralWeight: -3, worldFlagSet: 'mirror_truth_rejected' },
        { id: 'leave',              textKey: 'dialogue.choice.leave' },
      ],
    },

    'mirror_keeper.truth.accepted': {
      speakerKey: 'npc.mirror_keeper.truth.accepted',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave', worldFlagSet: 'self_witnessed' },
      ],
    },

    'mirror_keeper.truth.rejected': {
      speakerKey: 'npc.mirror_keeper.truth.rejected',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave', worldFlagSet: 'self_denied' },
      ],
    },

    // ── Depth topics: what mirrors show, original name, why they stay ─────

    'mirror_keeper.mirrors_show.truth': {
      speakerKey: 'npc.mirror_keeper.mirrors_show.truth',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    'mirror_keeper.original_name.partial': {
      speakerKey: 'npc.mirror_keeper.original_name.partial',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave', worldFlagSet: 'mirror_keeper_name_sought' },
      ],
    },

    'mirror_keeper.why_stay.revelation': {
      speakerKey: 'npc.mirror_keeper.why_stay.revelation',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave', worldFlagSet: 'mirror_keeper_purpose_known' },
      ],
    },

  },
}
