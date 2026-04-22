import type { NPCFullData } from './dialogueTypes.js'

export const THE_WARDEN_NPC: NPCFullData = {
  id: 'the_warden',
  secret: 'The Warden was bound to the island as a guardian by the second keeper — the binding has become a prison, and it enforces the cycle not from duty but because it no longer remembers how to exist without enforcement.',
  nameKey: 'npc.the_warden.name',
  titleKey: 'npc.the_warden.title',
  defaultLocation: 'tidal_caves',
  defaultAttitude: 'hostile',
  schedule: {},
  tierThresholds: [0, 20, 40, 70, 110],
  greetingNodes: [
    'the_warden.greeting.tier0',
    'the_warden.greeting.tier1',
    'the_warden.greeting.tier2',
    'the_warden.greeting.tier3',
    'the_warden.greeting.tier4',
  ],
  nodes: {

    // ── Tier 0 — You should not be here. Something agrees. ───────────────

    'the_warden.greeting.tier0': {
      speakerKey: 'npc.the_warden.greeting.tier0',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 1 — It speaks. One word at a time. It is old. ───────────────

    'the_warden.greeting.tier1': {
      speakerKey: 'npc.the_warden.greeting.tier1',
      choices: [
        { id: 'ask_what_it_is',   textKey: 'dialogue.choice.ask_what_are_you',      nextNodeId: 'the_warden.nature.answer',     insightGain: 10, trustGain: 2,  moralWeight: -1 },
        { id: 'demand_passage',   textKey: 'dialogue.choice.demand_passage',         nextNodeId: 'the_warden.passage.refused',   insightGain: 0,  moralWeight: -2 },
        { id: 'ask_laws',         textKey: 'dialogue.choice.ask_the_laws',           nextNodeId: 'the_warden.laws.here.statement', insightGain: 8, trustGain: 1 },
        { id: 'leave',            textKey: 'dialogue.choice.leave' },
      ],
    },

    'the_warden.nature.answer': {
      speakerKey: 'npc.the_warden.nature.answer',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    'the_warden.passage.refused': {
      speakerKey: 'npc.the_warden.passage.refused',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 2 — It remembers the keepers before you. ─────────────────────

    'the_warden.greeting.tier2': {
      speakerKey: 'npc.the_warden.greeting.tier2',
      choices: [
        { id: 'ask_the_keepers',  textKey: 'dialogue.choice.ask_other_keepers',     nextNodeId: 'the_warden.keepers.count',     insightGain: 15, trustGain: 3 },
        { id: 'ask_the_cycle',    textKey: 'dialogue.choice.ask_about_cycle',       nextNodeId: 'the_warden.cycle.what_it_is',  insightGain: 18, trustGain: 5, worldFlagRequired: 'fenn_cycle_understood' },
        { id: 'ask_answers_to',   textKey: 'dialogue.choice.ask_who_you_answer_to', nextNodeId: 'the_warden.answers_to.admission', insightGain: 12, trustGain: 3 },
        { id: 'leave',            textKey: 'dialogue.choice.leave' },
      ],
    },

    'the_warden.keepers.count': {
      speakerKey: 'npc.the_warden.keepers.count',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave', worldFlagSet: 'warden_keepers_known' },
      ],
    },

    'the_warden.cycle.what_it_is': {
      speakerKey: 'npc.the_warden.cycle.what_it_is',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave', worldFlagSet: 'warden_cycle_known' },
      ],
    },

    // ── Tier 3 — What it enforces and why. ───────────────────────────────

    'the_warden.greeting.tier3': {
      speakerKey: 'npc.the_warden.greeting.tier3',
      choices: [
        { id: 'ask_its_purpose',  textKey: 'dialogue.choice.ask_your_purpose',      nextNodeId: 'the_warden.purpose.keeper',    insightGain: 22, trustGain: 8, worldFlagRequired: 'warden_cycle_known' },
        { id: 'challenge_it',     textKey: 'dialogue.choice.challenge_the_order',   nextNodeId: 'the_warden.challenged.answer', insightGain: 15, moralWeight: -1 },
        { id: 'leave',            textKey: 'dialogue.choice.leave' },
      ],
    },

    'the_warden.purpose.keeper': {
      speakerKey: 'npc.the_warden.purpose.keeper',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave', worldFlagSet: 'warden_purpose_known' },
      ],
    },

    'the_warden.challenged.answer': {
      speakerKey: 'npc.the_warden.challenged.answer',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 4 — The bargain. What it will accept in exchange. ───────────

    'the_warden.greeting.tier4': {
      speakerKey: 'npc.the_warden.greeting.tier4',
      choices: [
        { id: 'ask_the_price',    textKey: 'dialogue.choice.ask_the_price',         nextNodeId: 'the_warden.bargain.price',     insightGain: 30, trustGain: 10, worldFlagRequired: 'warden_purpose_known' },
        { id: 'refuse_bargain',   textKey: 'dialogue.choice.refuse_the_bargain',    nextNodeId: 'the_warden.bargain.refused',   insightGain: 10, moralWeight: 3 },
        { id: 'ask_what_buried',  textKey: 'dialogue.choice.ask_what_youve_buried',  nextNodeId: 'the_warden.what_youve_buried.confession', insightGain: 22, trustGain: 8, worldFlagRequired: 'warden_purpose_known' },
        { id: 'leave',            textKey: 'dialogue.choice.leave' },
      ],
    },

    'the_warden.bargain.price': {
      speakerKey: 'npc.the_warden.bargain.price',
      choices: [
        { id: 'accept_price', textKey: 'dialogue.choice.accept_the_price', nextNodeId: 'the_warden.bargain.accepted', insightGain: 15, moralWeight: -2, worldFlagSet: 'warden_bargain_struck' },
        { id: 'leave',        textKey: 'dialogue.choice.leave' },
      ],
    },

    'the_warden.bargain.accepted': {
      speakerKey: 'npc.the_warden.bargain.accepted',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave', worldFlagSet: 'warden_passage_granted' },
      ],
    },

    'the_warden.bargain.refused': {
      speakerKey: 'npc.the_warden.bargain.refused',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave', worldFlagSet: 'warden_bargain_refused' },
      ],
    },

    // ── Depth topics: the laws, authority, what was buried ────────────────

    'the_warden.laws.here.statement': {
      speakerKey: 'npc.the_warden.laws.here.statement',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },

    'the_warden.answers_to.admission': {
      speakerKey: 'npc.the_warden.answers_to.admission',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave', worldFlagSet: 'warden_authority_known' },
      ],
    },

    'the_warden.what_youve_buried.confession': {
      speakerKey: 'npc.the_warden.what_youve_buried.confession',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave', worldFlagSet: 'warden_buried_known' },
      ],
    },

  },
}
