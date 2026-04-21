import type { NPCFullData } from './dialogueTypes.js'

// Cal — The Former Keeper's Silence
// Location: cliffside. Absent until `keeper_betrayal` is sealed.
// All substantive nodes require worldFlagRequired: 'keeper_betrayal'.
// Path C (hidden room) additionally requires: worldFlagRequired: 'dov_confession_heard'.
// Failure path: confronting Cal without `keeper_betrayal` sets `cal_driven_away`.

export const CAL_NPC: NPCFullData = {
  id: 'cal',
  nameKey: 'npc.cal.name',
  titleKey: 'npc.cal.title',
  defaultLocation: 'cliffside',
  defaultAttitude: 'absent',
  schedule: {},
  tierThresholds: [0, 5, 15, 30, 50],
  greetingNodes: [
    'cal.greeting.tier0',
    'cal.greeting.tier1',
    'cal.greeting.tier2',
    'cal.greeting.tier3',
    'cal.greeting.tier4',
  ],
  nodes: {
    // ─── Tier 0 ─────────────────────────────────────────────────────────────
    // Atmospheric only. No name given. No worldFlag gate.
    // Player sees a figure at the cliff edge — nothing more.
    'cal.greeting.tier0': {
      speakerKey: 'npc.cal.greeting.tier0',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // ─── Tier 1 ─────────────────────────────────────────────────────────────
    // Cal acknowledges the player found what she left. Terse, assessing.
    // Substantive choices gated on keeper_betrayal.
    // Confront choice (no gate) → failure path: cal_driven_away.
    'cal.greeting.tier1': {
      speakerKey: 'npc.cal.greeting.tier1',
      choices: [
        {
          id: 'ask.who_are_you',
          textKey: 'dialogue.choice.ask_identity',
          nextNodeId: 'cal.identity',
          worldFlagRequired: 'keeper_betrayal',
          insightGain: 8,
          trustGain: 2,
        },
        {
          id: 'confront.accuse',
          textKey: 'dialogue.choice.confront_accusations',
          nextNodeId: 'cal.driven_away',
          worldFlagSet: 'cal_driven_away',
          moralWeight: -2,
        },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // Cal introduces herself — the keeper before the keeper before the player.
    'cal.identity': {
      speakerKey: 'npc.cal.identity',
      choices: [
        {
          id: 'ask.what_left',
          textKey: 'dialogue.choice.ask_what_left',
          nextNodeId: 'cal.handover.what_left',
          worldFlagRequired: 'keeper_betrayal',
          insightGain: 8,
          trustGain: 3,
        },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // Failure path: Cal vanishes. Sets cal_driven_away.
    'cal.driven_away': {
      speakerKey: 'npc.cal.driven_away',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // The sealed record she left in the foundation stones.
    'cal.handover.what_left': {
      speakerKey: 'npc.cal.handover.what_left',
      choices: [
        {
          id: 'ask.what_told',
          textKey: 'dialogue.choice.ask_what_told',
          nextNodeId: 'cal.handover.what_told',
          worldFlagRequired: 'keeper_betrayal',
          insightGain: 8,
        },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // ─── Tier 2 ─────────────────────────────────────────────────────────────
    // Cal's account of the handover: what she was told, what she found, what she left.
    'cal.greeting.tier2': {
      speakerKey: 'npc.cal.greeting.tier2',
      choices: [
        {
          id: 'ask.what_told',
          textKey: 'dialogue.choice.ask_what_told',
          nextNodeId: 'cal.handover.what_told',
          worldFlagRequired: 'keeper_betrayal',
          insightGain: 8,
        },
        {
          id: 'ask.what_found',
          textKey: 'dialogue.choice.ask_what_found',
          nextNodeId: 'cal.handover.what_found',
          worldFlagRequired: 'keeper_betrayal',
          insightGain: 10,
          trustGain: 3,
        },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // What the council told her vs what the manual actually said.
    'cal.handover.what_told': {
      speakerKey: 'npc.cal.handover.what_told',
      choices: [
        {
          id: 'ask.what_found',
          textKey: 'dialogue.choice.ask_what_found',
          nextNodeId: 'cal.handover.what_found',
          worldFlagRequired: 'keeper_betrayal',
          insightGain: 10,
          trustGain: 3,
        },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // What she actually observed the mechanism doing.
    'cal.handover.what_found': {
      speakerKey: 'npc.cal.handover.what_found',
      choices: [
        {
          id: 'ask.left_behind',
          textKey: 'dialogue.choice.ask_what_left',
          nextNodeId: 'cal.handover.left_behind',
          worldFlagRequired: 'keeper_betrayal',
          insightGain: 10,
          trustGain: 4,
        },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // The schematics she photographed and sealed in the foundation.
    'cal.handover.left_behind': {
      speakerKey: 'npc.cal.handover.left_behind',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // ─── Tier 3 ─────────────────────────────────────────────────────────────
    // The core choice moment. Three paths.
    'cal.greeting.tier3': {
      speakerKey: 'npc.cal.greeting.tier3',
      choices: [
        // Path A: Accept truth — Cal tells everything.
        // Sets cal_truth_given. keeper_history_known set at tier 4 aftermath.
        {
          id: 'accept.truth',
          textKey: 'dialogue.choice.accept_truth',
          nextNodeId: 'cal.path.accept_truth',
          worldFlagRequired: 'keeper_betrayal',
          worldFlagSet: 'cal_truth_given',
          insightGain: 20,
          trustGain: 10,
          moralWeight: 2,
        },
        // Path B: Reject — player decides truth isn't worth the cost.
        {
          id: 'reject.truth',
          textKey: 'dialogue.choice.reject_truth',
          nextNodeId: 'cal.path.reject_truth',
          worldFlagRequired: 'keeper_betrayal',
          worldFlagSet: 'cal_truth_withheld',
          moralWeight: -1,
        },
        // Path C: Hidden room — requires Dov's confession to unlock.
        {
          id: 'ask.hidden.room',
          textKey: 'dialogue.choice.ask_hidden_room',
          nextNodeId: 'cal.path.hidden_room',
          worldFlagRequired: 'dov_confession_heard',
          worldFlagSet: 'hidden_room_found',
          insightGain: 15,
          trustGain: 8,
        },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // Path A: Cal tells everything. Not the rehearsed version — the actual one.
    'cal.path.accept_truth': {
      speakerKey: 'npc.cal.path.accept_truth',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // Path B: Player refuses the truth. Cal respects it — she made the same choice once.
    'cal.path.reject_truth': {
      speakerKey: 'npc.cal.path.reject_truth',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // Path C: Cal reveals the hidden room in the cliff. Requires Dov's confession.
    'cal.path.hidden_room': {
      speakerKey: 'npc.cal.path.hidden_room',
      choices: [
        {
          id: 'ask.what_is_inside',
          textKey: 'dialogue.choice.ask_what_is_inside',
          nextNodeId: 'cal.path.schematic_revealed',
          worldFlagSet: 'final_schematic_location',
          insightGain: 15,
          trustGain: 5,
        },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // The final schematics — the complete ones, with the previous Keeper's failsafe.
    'cal.path.schematic_revealed': {
      speakerKey: 'npc.cal.path.schematic_revealed',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // ─── Tier 4 ─────────────────────────────────────────────────────────────
    // Aftermath: full truth revealed, or the weight of deliberate silence.
    'cal.greeting.tier4': {
      speakerKey: 'npc.cal.greeting.tier4',
      choices: [
        // Complete Path A — sets keeper_history_known.
        {
          id: 'ask.keeper_history',
          textKey: 'dialogue.choice.ask_former_keeper',
          nextNodeId: 'cal.aftermath.keeper_history',
          worldFlagRequired: 'cal_truth_given',
          worldFlagSet: 'keeper_history_known',
          insightGain: 20,
          trustGain: 5,
        },
        // Dismantling instructions — available after truth is given.
        {
          id: 'ask.dismantling',
          textKey: 'dialogue.choice.ask_dismantling',
          nextNodeId: 'cal.aftermath.dismantling',
          worldFlagRequired: 'keeper_betrayal',
          insightGain: 15,
        },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // What the previous Keeper actually knew and chose.
    'cal.aftermath.keeper_history': {
      speakerKey: 'npc.cal.aftermath.keeper_history',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // The safe dismantling sequence — three components, in order.
    'cal.aftermath.dismantling': {
      speakerKey: 'npc.cal.aftermath.dismantling',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
  },
}
