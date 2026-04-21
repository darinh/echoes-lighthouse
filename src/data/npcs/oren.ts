import type { NPCFullData } from './dialogueTypes.js'

export const OREN_NPC: NPCFullData = {
  id: 'oren',
  nameKey: 'npc.oren.name',
  titleKey: 'npc.oren.title',
  defaultLocation: 'ruins',
  defaultAttitude: 'neutral',
  schedule: {},
  tierThresholds: [0, 5, 15, 25, 50],
  greetingNodes: [
    'oren.greeting.tier0',
    'oren.greeting.tier1',
    'oren.greeting.tier2',
    'oren.greeting.tier3',
    'oren.greeting.tier4',
  ],
  nodes: {

    // ─── TIER 0: Dismissive ───────────────────────────────────────────────
    'oren.greeting.tier0': {
      speakerKey: 'npc.oren.greeting.tier0',
      choices: [
        { id: 'ask.why_here', textKey: 'dialogue.choice.ask_why_here', nextNodeId: 'oren.why.here', insightGain: 3 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'oren.why.here': {
      speakerKey: 'npc.oren.why.here',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // ─── TIER 1: Acknowledges, ruins abstract ─────────────────────────────
    'oren.greeting.tier1': {
      speakerKey: 'npc.oren.greeting.tier1',
      choices: [
        { id: 'ask.ruins', textKey: 'dialogue.choice.ask_ruins', nextNodeId: 'oren.ruins.history', insightGain: 5, trustGain: 2 },
        { id: 'ask.identity', textKey: 'dialogue.choice.ask_identity', nextNodeId: 'oren.identity', insightGain: 5, trustGain: 3 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'oren.ruins.history': {
      speakerKey: 'npc.oren.ruins.history',
      choices: [
        { id: 'ask.older_practice', textKey: 'dialogue.choice.ask_older_practice', nextNodeId: 'oren.ruins.older', insightGain: 8, trustGain: 2 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'oren.ruins.older': {
      speakerKey: 'npc.oren.ruins.older',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'oren.identity': {
      speakerKey: 'npc.oren.identity',
      choices: [
        { id: 'ask.service', textKey: 'dialogue.choice.ask_what_happened', nextNodeId: 'oren.service.evasion', insightGain: 5, trustGain: 2 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'oren.service.evasion': {
      speakerKey: 'npc.oren.service.evasion',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // ─── TIER 2: Admits a ritual, won't say what it did ───────────────────
    'oren.greeting.tier2': {
      speakerKey: 'npc.oren.greeting.tier2',
      choices: [
        { id: 'ask.ritual.detail', textKey: 'dialogue.choice.ask_binding', nextNodeId: 'oren.ritual.admission', insightGain: 8, trustGain: 3 },
        { id: 'ask.what_went_wrong', textKey: 'dialogue.choice.ask_what_happened', nextNodeId: 'oren.ritual.wrong', insightGain: 5, trustGain: 2 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'oren.ritual.admission': {
      speakerKey: 'npc.oren.ritual.admission',
      choices: [
        { id: 'ask.who_bound', textKey: 'dialogue.choice.ask_who_was_bound', nextNodeId: 'oren.ritual.who_bound', insightGain: 10, trustGain: 2 },
        { id: 'ask.what_persisted', textKey: 'dialogue.choice.ask_what_persisted', nextNodeId: 'oren.ritual.persisted', insightGain: 8, trustGain: 2 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'oren.ritual.who_bound': {
      speakerKey: 'npc.oren.ritual.who_bound',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'oren.ritual.persisted': {
      speakerKey: 'npc.oren.ritual.persisted',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'oren.ritual.wrong': {
      speakerKey: 'npc.oren.ritual.wrong',
      choices: [
        { id: 'ask.what_persisted', textKey: 'dialogue.choice.ask_what_persisted', nextNodeId: 'oren.ritual.persisted', insightGain: 8, trustGain: 2 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // ─── TIER 3: Full confession + branching paths ────────────────────────
    'oren.greeting.tier3': {
      speakerKey: 'npc.oren.greeting.tier3',
      choices: [
        { id: 'listen', textKey: 'dialogue.choice.listen', nextNodeId: 'oren.confession.full', trustGain: 5, insightGain: 10 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'oren.confession.full': {
      speakerKey: 'npc.oren.confession.full',
      choices: [
        // Path A: present inscription evidence (requires spirit_binding sealed insight)
        {
          id: 'present_inscription',
          textKey: 'dialogue.choice.present_inscription',
          nextNodeId: 'oren.path_a.argument',
          requiresSealedInsight: 'spirit_binding',
          trustGain: 20,
          insightGain: 20,
          worldFlagSet: 'oren_ritual_known',
        },
        // Path C: offer absolution — hear full confession, Oren volunteers ritual
        {
          id: 'offer_absolution',
          textKey: 'dialogue.choice.offer_absolution',
          nextNodeId: 'oren.path_c.confess',
          trustGain: 30,
          insightGain: 15,
          worldFlagSet: 'oren_absolved',
        },
        // Path B: condemn — trust locked, ritual withheld
        {
          id: 'condemn_him',
          textKey: 'dialogue.choice.condemn_him',
          nextNodeId: 'oren.path_b.condemn',
          moralWeight: -1,
          trustLoss: 15,
          worldFlagSet: 'oren_condemned',
        },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // ─── Path A: Theological argument — inscription proves coercion ───────
    'oren.path_a.argument': {
      speakerKey: 'npc.oren.path_a.argument',
      choices: [
        { id: 'ask.ritual_words', textKey: 'dialogue.choice.ask_ritual_words', nextNodeId: 'oren.ritual.teaching', insightGain: 15 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'oren.ritual.teaching': {
      speakerKey: 'npc.oren.ritual.teaching',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // ─── Path B: Condemn — Oren withdraws ────────────────────────────────
    'oren.path_b.condemn': {
      speakerKey: 'npc.oren.path_b.condemn',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // ─── Path C: Absolution — Oren confesses fully, gives ritual + lore ──
    'oren.path_c.confess': {
      speakerKey: 'npc.oren.path_c.confess',
      choices: [
        { id: 'ask.ritual_words', textKey: 'dialogue.choice.ask_ritual_words', nextNodeId: 'oren.absolved.ritual', insightGain: 10 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'oren.absolved.ritual': {
      speakerKey: 'npc.oren.absolved.ritual',
      choices: [
        {
          id: 'ask.vael_window',
          textKey: 'dialogue.choice.ask_original_imprisonment',
          nextNodeId: 'oren.absolved.vael_lore',
          insightGain: 15,
          worldFlagSet: 'oren_ritual_known',
        },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'oren.absolved.vael_lore': {
      speakerKey: 'npc.oren.absolved.vael_lore',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // ─── TIER 4: Aftermath ────────────────────────────────────────────────
    'oren.greeting.tier4': {
      speakerKey: 'npc.oren.greeting.tier4',
      choices: [
        {
          id: 'ask.ritual_words_again',
          textKey: 'dialogue.choice.ask_ritual_words',
          nextNodeId: 'oren.ritual.teaching',
          worldFlagRequired: 'oren_ritual_known',
          insightGain: 5,
        },
        {
          id: 'ask.vael_window_again',
          textKey: 'dialogue.choice.ask_original_imprisonment',
          nextNodeId: 'oren.absolved.vael_lore',
          worldFlagRequired: 'oren_absolved',
          insightGain: 10,
        },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

  },
}
