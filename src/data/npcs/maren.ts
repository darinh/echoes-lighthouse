/**
 * Maren — The Archivist
 *
 * Phase 1 NPC data: tier 0–2 dialogue stubs.
 * Full tier 3–10 tree is Phase 2 (quest-locked nodes, moral branching).
 *
 * See docs/gdd/06-quest-dialogue.md §2 for Maren's full arc.
 * i18n keys match public/locales/en/dialogue.json.
 */

export const MAREN_NPC = {
  id: 'maren',
  nameKey: 'npc.maren.name',
  titleKey: 'npc.maren.title',
  defaultLocation: 'keepers_cottage',
  defaultAttitude: 'neutral' as const,
  schedule: {} as const,

  /** Resonance threshold needed to unlock each dialogue tier. */
  tierThresholds: [0, 3, 7, 15, 25, 40, 60, 80, 100, 130, 170] as const,

  /** Greeting node IDs by tier. Engine picks the highest unlocked tier. */
  greetingNodes: [
    'maren.greeting.tier0',
    'maren.greeting.tier1',
    'maren.greeting.tier2',
  ],

  /**
   * Phase 1 dialogue nodes (stubs).
   * Full tree added in Phase 2 via content pipeline.
   */
  nodes: {
    'maren.greeting.tier0': {
      speakerKey: 'npc.maren.greeting.tier0',
      choices: [
        { id: 'ask.lighthouse',   textKey: 'dialogue.choice.ask_lighthouse',   insightGain: 5, moralWeight: 0 },
        { id: 'ask.archive',      textKey: 'dialogue.choice.ask_archive',       insightGain: 5, moralWeight: 0 },
        { id: 'leave',            textKey: 'dialogue.choice.leave',             insightGain: 0, moralWeight: 0 },
      ],
    },
    'maren.greeting.tier1': {
      speakerKey: 'npc.maren.greeting.tier1',
      choices: [
        { id: 'ask.lighthouse',   textKey: 'dialogue.choice.ask_lighthouse',    insightGain: 5, moralWeight: 0 },
        { id: 'ask.archive',      textKey: 'dialogue.choice.ask_archive',       insightGain: 5, moralWeight: 0 },
        { id: 'ask.keeper',       textKey: 'dialogue.choice.ask_keeper',        insightGain: 8, moralWeight: 0 },
        { id: 'leave',            textKey: 'dialogue.choice.leave',             insightGain: 0, moralWeight: 0 },
      ],
    },
    'maren.greeting.tier2': {
      speakerKey: 'npc.maren.greeting.tier2',
      choices: [
        { id: 'ask.echo',         textKey: 'dialogue.choice.ask_echo',          insightGain: 10, moralWeight: 1 },
        { id: 'ask.archive',      textKey: 'dialogue.choice.ask_archive',       insightGain: 5,  moralWeight: 0 },
        { id: 'ask.keeper',       textKey: 'dialogue.choice.ask_keeper',        insightGain: 8,  moralWeight: 0 },
        { id: 'leave',            textKey: 'dialogue.choice.leave',             insightGain: 0,  moralWeight: 0 },
      ],
    },
  },
} as const

export type MarenNodeId = keyof typeof MAREN_NPC.nodes
