import type { NPCFullData } from './dialogueTypes.js'

export const MAREN_NPC: NPCFullData = {
  id: 'maren',
  nameKey: 'npc.maren.name',
  titleKey: 'npc.maren.title',
  defaultLocation: 'keepers_cottage',
  defaultAttitude: 'neutral',
  schedule: {},
  tierThresholds: [0, 3, 7, 15, 25, 40, 60, 80, 100, 130, 170],
  greetingNodes: ['maren.greeting.tier0','maren.greeting.tier1','maren.greeting.tier2','maren.greeting.tier3','maren.greeting.tier4','maren.greeting.tier5','maren.greeting.tier6'],
  nodes: {
    'maren.greeting.tier0': {
      speakerKey: 'npc.maren.greeting.tier0',
      choices: [
        { id: 'ask.lighthouse', textKey: 'dialogue.choice.ask_lighthouse', nextNodeId: 'maren.lighthouse.lore', insightGain: 5 },
        { id: 'ask.archive', textKey: 'dialogue.choice.ask_archive', nextNodeId: 'maren.archive.lore', insightGain: 5 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'maren.lighthouse.lore': {
      speakerKey: 'npc.maren.lighthouse.lore',
      choices: [
        { id: 'ask.keeper', textKey: 'dialogue.choice.ask_keeper', nextNodeId: 'maren.keeper.departure', insightGain: 5, trustGain: 2 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'maren.archive.lore': {
      speakerKey: 'npc.maren.archive.lore',
      choices: [
        { id: 'ask.keeper', textKey: 'dialogue.choice.ask_keeper', nextNodeId: 'maren.keeper.departure', insightGain: 5, trustGain: 2 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'maren.keeper.departure': {
      speakerKey: 'npc.maren.keeper.departure',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'maren.greeting.tier1': {
      speakerKey: 'npc.maren.greeting.tier1',
      choices: [
        { id: 'ask.history', textKey: 'dialogue.choice.ask_history', nextNodeId: 'maren.history.gaps', insightGain: 8, trustGain: 3 },
        { id: 'ask.archive', textKey: 'dialogue.choice.ask_archive', nextNodeId: 'maren.archive.lore', insightGain: 5 },
        { id: 'ask.keeper', textKey: 'dialogue.choice.ask_keeper', nextNodeId: 'maren.keeper.departure', insightGain: 5 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'maren.history.gaps': {
      speakerKey: 'npc.maren.history.gaps',
      choices: [
        { id: 'ask.who_removed', textKey: 'dialogue.choice.ask_who_removed', nextNodeId: 'maren.records.curated', insightGain: 8, trustGain: 2 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'maren.records.curated': {
      speakerKey: 'npc.maren.records.curated',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'maren.greeting.tier2': {
      speakerKey: 'npc.maren.greeting.tier2',
      choices: [
        { id: 'ask.unusual', textKey: 'dialogue.choice.ask_unusual', nextNodeId: 'maren.ledger.overwritten', insightGain: 10, trustGain: 4, questStart: 'archivist_bargain' },
        { id: 'ask.echo', textKey: 'dialogue.choice.ask_echo', nextNodeId: 'maren.echo.denial', insightGain: 8, moralWeight: 1 },
        { id: 'ask.keeper', textKey: 'dialogue.choice.ask_keeper', nextNodeId: 'maren.keeper.departure' },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'maren.ledger.overwritten': {
      speakerKey: 'npc.maren.ledger.overwritten',
      choices: [
        { id: 'press.what_replaced', textKey: 'dialogue.choice.press_harder', nextNodeId: 'maren.ledger.deflect', insightGain: 5, trustLoss: 2 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'maren.ledger.deflect': {
      speakerKey: 'npc.maren.ledger.deflect',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'maren.echo.denial': {
      speakerKey: 'npc.maren.echo.denial',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'maren.greeting.tier3': {
      speakerKey: 'npc.maren.greeting.tier3',
      choices: [
        { id: 'ask.father', textKey: 'dialogue.choice.ask_father', nextNodeId: 'maren.father.mention', insightGain: 10 },
        { id: 'ask.archive.deeper', textKey: 'dialogue.choice.ask_archive_deeper', nextNodeId: 'maren.archive.deeper', insightGain: 8, requiresInsight: 20 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'maren.father.mention': {
      speakerKey: 'npc.maren.father.mention',
      choices: [
        { id: 'press.more.father', textKey: 'dialogue.choice.press_harder', nextNodeId: 'maren.father.letters', insightGain: 12, trustGain: 5, moralWeight: 1, requiresTier: 3 },
        { id: 'change.subject', textKey: 'dialogue.choice.let_it_go', nextNodeId: 'maren.father.deflect', trustGain: 3 },
      ],
    },
    'maren.father.deflect': {
      speakerKey: 'npc.maren.father.deflect',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'maren.father.letters': {
      speakerKey: 'npc.maren.father.letters',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'maren.archive.deeper': {
      speakerKey: 'npc.maren.archive.deeper',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'maren.greeting.tier4': {
      speakerKey: 'npc.maren.greeting.tier4',
      choices: [
        { id: 'ask.father.strange', textKey: 'dialogue.choice.ask_father_direct', nextNodeId: 'maren.father.strange', insightGain: 15, trustGain: 5, requiresTier: 4 },
        { id: 'ask.mechanism', textKey: 'dialogue.choice.ask_mechanism', nextNodeId: 'maren.mechanism.lore', insightGain: 10 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'maren.father.strange': {
      speakerKey: 'npc.maren.father.strange',
      choices: [
        { id: 'ask.irreversible', textKey: 'dialogue.choice.ask_what_irreversible', nextNodeId: 'maren.father.irreversible', insightGain: 12, trustGain: 5 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'maren.father.irreversible': {
      speakerKey: 'npc.maren.father.irreversible',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'maren.mechanism.lore': {
      speakerKey: 'npc.maren.mechanism.lore',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'maren.greeting.tier5': {
      speakerKey: 'npc.maren.greeting.tier5',
      choices: [
        { id: 'listen', textKey: 'dialogue.choice.listen', nextNodeId: 'maren.confession.burned', trustGain: 10, insightGain: 20 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'maren.confession.burned': {
      speakerKey: 'npc.maren.confession.burned',
      choices: [
        { id: 'ask.what.pages', textKey: 'dialogue.choice.ask_what_was_on_them', nextNodeId: 'maren.confession.mechanism', insightGain: 15, trustGain: 8, worldFlagSet: 'maren_confession_heard' },
        { id: 'react.shock', textKey: 'dialogue.choice.react_shock', nextNodeId: 'maren.confession.mechanism', trustGain: 5 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'maren.confession.mechanism': {
      speakerKey: 'npc.maren.confession.mechanism',
      choices: [
        { id: 'ask.what.coming', textKey: 'dialogue.choice.ask_what_was_coming', nextNodeId: 'maren.confession.unknown', insightGain: 10 },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'maren.confession.unknown': {
      speakerKey: 'npc.maren.confession.unknown',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'maren.greeting.tier6': {
      speakerKey: 'npc.maren.greeting.tier6',
      choices: [
        { id: 'confront.betrayal', textKey: 'dialogue.choice.confront_betrayal', nextNodeId: 'maren.full.confession', requiresSealedInsight: 'keeper_betrayal', insightGain: 25, moralWeight: -3, worldFlagSet: 'maren_full_truth_known' },
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
    'maren.full.confession': {
      speakerKey: 'npc.maren.full.confession',
      choices: [
        { id: 'leave', textKey: 'dialogue.choice.leave' },
      ],
    },
  },
}
