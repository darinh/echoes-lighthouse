import type { NPCFullData } from './dialogueTypes.js'

export const SERA_NPC: NPCFullData = {
  id: 'sera',
  nameKey: 'npc.sera.name',
  titleKey: 'npc.sera.title',
  defaultLocation: 'tidal_caves',
  defaultAttitude: 'hidden',
  schedule: {},
  tierThresholds: [0, 5, 15, 30, 50],
  greetingNodes: [
    'sera.greeting.tier0',
    'sera.greeting.tier1',
    'sera.greeting.tier2',
    'sera.greeting.tier3',
    'sera.greeting.tier4',
  ],
  nodes: {
    // ── Tier 0 ─────────────────────────────────────────────────────────────
    // A cold presence — no worldFlag gate. Pure atmosphere. No real dialogue.
    'sera.greeting.tier0': {
      speakerKey: 'npc.sera.greeting.tier0',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 1: First contact ───────────────────────────────────────────────
    // Only accessible after spirit_binding is sealed.
    'sera.greeting.tier1': {
      speakerKey: 'npc.sera.greeting.tier1',
      choices: [
        {
          id: 'ask.who_are_you',
          textKey: 'dialogue.choice.ask_who_are_you',
          nextNodeId: 'sera.first_contact.who',
          worldFlagRequired: 'spirit_binding',
          insightGain: 5,
          trustGain: 2,
        },
        {
          id: 'ask.what_smell',
          textKey: 'dialogue.choice.ask_light_smell',
          nextNodeId: 'sera.first_contact.light_smell',
          worldFlagRequired: 'spirit_binding',
          insightGain: 5,
          trustGain: 2,
        },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'sera.first_contact.who': {
      speakerKey: 'npc.sera.first_contact.who',
      choices: [
        {
          id: 'ask.how_long',
          textKey: 'dialogue.choice.ask_how_long',
          nextNodeId: 'sera.first_contact.how_long',
          worldFlagRequired: 'spirit_binding',
          insightGain: 5,
          trustGain: 2,
        },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'sera.first_contact.light_smell': {
      speakerKey: 'npc.sera.first_contact.light_smell',
      choices: [
        {
          id: 'ask.how_long',
          textKey: 'dialogue.choice.ask_how_long',
          nextNodeId: 'sera.first_contact.how_long',
          worldFlagRequired: 'spirit_binding',
          insightGain: 5,
          trustGain: 2,
        },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'sera.first_contact.how_long': {
      speakerKey: 'npc.sera.first_contact.how_long',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 2: Sera's history ──────────────────────────────────────────────
    'sera.greeting.tier2': {
      speakerKey: 'npc.sera.greeting.tier2',
      choices: [
        {
          id: 'ask.before',
          textKey: 'dialogue.choice.ask_before',
          nextNodeId: 'sera.history.before',
          worldFlagRequired: 'spirit_binding',
          insightGain: 8,
          trustGain: 3,
        },
        {
          id: 'ask.sky_loops',
          textKey: 'dialogue.choice.ask_sky_loops',
          nextNodeId: 'sera.history.sky_loops',
          worldFlagRequired: 'spirit_binding',
          insightGain: 6,
        },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'sera.history.before': {
      speakerKey: 'npc.sera.history.before',
      choices: [
        {
          id: 'ask.what_happened',
          textKey: 'dialogue.choice.ask_what_happened',
          nextNodeId: 'sera.history.nothing_then',
          worldFlagRequired: 'spirit_binding',
          insightGain: 8,
          trustGain: 3,
        },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'sera.history.nothing_then': {
      speakerKey: 'npc.sera.history.nothing_then',
      choices: [
        {
          id: 'ask.why_caves',
          textKey: 'dialogue.choice.ask_why_caves',
          nextNodeId: 'sera.history.cave_forever',
          worldFlagRequired: 'spirit_binding',
          insightGain: 8,
          trustGain: 2,
          worldFlagSet: 'sera_history_known',
        },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'sera.history.cave_forever': {
      speakerKey: 'npc.sera.history.cave_forever',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'sera.history.sky_loops': {
      speakerKey: 'npc.sera.history.sky_loops',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 3: The choice ─────────────────────────────────────────────────
    'sera.greeting.tier3': {
      speakerKey: 'npc.sera.greeting.tier3',
      choices: [
        {
          id: 'path.accept',
          textKey: 'dialogue.choice.sera_accept',
          nextNodeId: 'sera.choice.accept',
          worldFlagRequired: 'spirit_binding',
          insightGain: 10,
          trustGain: 5,
          moralWeight: 1,
        },
        {
          id: 'path.resist',
          textKey: 'dialogue.choice.sera_resist',
          nextNodeId: 'sera.choice.resist',
          worldFlagRequired: 'spirit_binding',
          moralWeight: -2,
        },
        {
          id: 'path.free',
          textKey: 'dialogue.choice.sera_free',
          nextNodeId: 'sera.choice.free',
          worldFlagRequired: 'oren_ritual_known',
          insightGain: 15,
          trustGain: 8,
          moralWeight: 2,
        },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'sera.choice.accept': {
      speakerKey: 'npc.sera.choice.accept',
      choices: [
        {
          id: 'confirm.accept',
          textKey: 'dialogue.choice.confirm_accept',
          nextNodeId: 'sera.resolution.peace',
          worldFlagRequired: 'spirit_binding',
          insightGain: 10,
          trustGain: 5,
          worldFlagSet: 'sera_at_peace',
        },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'sera.choice.resist': {
      speakerKey: 'npc.sera.choice.resist',
      choices: [
        {
          id: 'confirm.resist',
          textKey: 'dialogue.choice.confirm_resist',
          nextNodeId: 'sera.resolution.rage',
          worldFlagRequired: 'spirit_binding',
          worldFlagSet: 'sera_raging',
          moralWeight: -3,
        },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'sera.choice.free': {
      speakerKey: 'npc.sera.choice.free',
      choices: [
        {
          id: 'confirm.free',
          textKey: 'dialogue.choice.confirm_free',
          nextNodeId: 'sera.resolution.freed',
          worldFlagRequired: 'oren_ritual_known',
          insightGain: 20,
          trustGain: 10,
          worldFlagSet: 'sera_freed',
        },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 4: Resolution ─────────────────────────────────────────────────
    'sera.greeting.tier4': {
      speakerKey: 'npc.sera.greeting.tier4',
      choices: [
        {
          id: 'ask.still_here',
          textKey: 'dialogue.choice.ask_still_here',
          nextNodeId: 'sera.resolution.linger',
          worldFlagRequired: 'spirit_binding',
          insightGain: 5,
        },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'sera.resolution.peace': {
      speakerKey: 'npc.sera.resolution.peace',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'sera.resolution.rage': {
      speakerKey: 'npc.sera.resolution.rage',
      choices: [
        {
          id: 'abandon',
          textKey: 'dialogue.choice.leave',
          worldFlagSet: 'sera_abandoned',
        },
      ],
    },
    'sera.resolution.freed': {
      speakerKey: 'npc.sera.resolution.freed',
      choices: [
        {
          id: 'witness_departure',
          textKey: 'dialogue.choice.witness_departure',
          worldFlagSet: 'spirit_unbound',
          insightGain: 25,
        },
      ],
    },
    'sera.resolution.linger': {
      speakerKey: 'npc.sera.resolution.linger',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
  },
}
