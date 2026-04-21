import type { NPCFullData } from './dialogueTypes.js'

export const YSEL_NPC: NPCFullData = {
  id: 'ysel',
  nameKey: 'npc.ysel.name',
  titleKey: 'npc.ysel.title',
  defaultLocation: 'harbor',
  defaultAttitude: 'friendly',
  schedule: {
    morning:    'harbor',
    afternoon:  'harbor',
    dusk:       'village_square',
    night_safe: 'village_inn',
  },
  tierThresholds: [0, 3, 7, 15, 25, 40, 60],
  greetingNodes: [
    'ysel.greeting.tier0',
    'ysel.greeting.tier1',
    'ysel.greeting.tier2',
    'ysel.greeting.tier3',
    'ysel.greeting.tier4',
  ],
  nodes: {

    // ── Tier 0 ── First meeting. Watching the water. Unhurried. ───────────

    'ysel.greeting.tier0': {
      speakerKey: 'npc.ysel.greeting.tier0',
      choices: [
        { id: 'ask_what_watching',  textKey: 'dialogue.choice.ask_water_creature',  nextNodeId: 'ysel.watching.first',  insightGain: 3, trustGain: 2 },
        { id: 'ask_island',         textKey: 'dialogue.choice.ask_island',           nextNodeId: 'ysel.island.first',    insightGain: 3 },
        { id: 'leave',              textKey: 'dialogue.choice.leave' },
      ],
    },

    'ysel.watching.first': {
      speakerKey: 'npc.ysel.watching.first',
      choices: [
        { id: 'ask_how_long',  textKey: 'dialogue.choice.press_harder',  nextNodeId: 'ysel.watching.how_long', insightGain: 3, trustGain: 2 },
        { id: 'leave',         textKey: 'dialogue.choice.leave' },
      ],
    },

    'ysel.watching.how_long': {
      speakerKey: 'npc.ysel.watching.how_long',
      choices: [
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    'ysel.island.first': {
      speakerKey: 'npc.ysel.island.first',
      choices: [
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 1 ── Warms up. Mentions the patterns, hints at the exception. ─

    'ysel.greeting.tier1': {
      speakerKey: 'npc.ysel.greeting.tier1',
      choices: [
        { id: 'ask_surfacing_patterns',  textKey: 'dialogue.choice.ask_surfacing_patterns',  nextNodeId: 'ysel.patterns.intro',  insightGain: 5, trustGain: 3 },
        { id: 'ask_feeding_pattern',     textKey: 'dialogue.choice.ask_feeding_pattern',      nextNodeId: 'ysel.feeding.pattern', insightGain: 5, trustGain: 2 },
        { id: 'ask_what_changed',        textKey: 'dialogue.choice.ask_what_changed',          nextNodeId: 'ysel.change.hint',     insightGain: 5, trustGain: 2 },
        { id: 'leave',                   textKey: 'dialogue.choice.leave' },
      ],
    },

    'ysel.patterns.intro': {
      speakerKey: 'npc.ysel.patterns.intro',
      choices: [
        { id: 'ask_more_patterns',  textKey: 'dialogue.choice.press_harder',  nextNodeId: 'ysel.patterns.detail', insightGain: 5, trustGain: 2 },
        { id: 'leave',              textKey: 'dialogue.choice.leave' },
      ],
    },

    'ysel.patterns.detail': {
      speakerKey: 'npc.ysel.patterns.detail',
      choices: [
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    'ysel.feeding.pattern': {
      speakerKey: 'npc.ysel.feeding.pattern',
      choices: [
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    'ysel.change.hint': {
      speakerKey: 'npc.ysel.change.hint',
      choices: [
        { id: 'press_change',  textKey: 'dialogue.choice.press_harder',  nextNodeId: 'ysel.change.detail', insightGain: 5, trustGain: 2 },
        { id: 'leave',         textKey: 'dialogue.choice.leave' },
      ],
    },

    'ysel.change.detail': {
      speakerKey: 'npc.ysel.change.detail',
      choices: [
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 2 ── First pattern session (trust 7+). ────────────────────────

    'ysel.greeting.tier2': {
      speakerKey: 'npc.ysel.greeting.tier2',
      choices: [
        {
          id: 'begin_session_1',
          textKey: 'dialogue.choice.offer_to_record',
          nextNodeId: 'ysel.session1.open',
          insightGain: 8,
          trustGain: 5,
        },
        {
          id: 'ask_exception_days',
          textKey: 'dialogue.choice.ask_what_changed',
          nextNodeId: 'ysel.exception.days',
          insightGain: 5,
          trustGain: 3,
        },
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    'ysel.session1.open': {
      speakerKey: 'npc.ysel.session1.open',
      choices: [
        {
          id: 'listen_patiently',
          textKey: 'dialogue.choice.listen',
          nextNodeId: 'ysel.session1.record',
          insightGain: 10,
          trustGain: 5,
          worldFlagSet: 'ysel_session_1_complete',
        },
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    'ysel.session1.record': {
      speakerKey: 'npc.ysel.session1.record',
      choices: [
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    'ysel.exception.days': {
      speakerKey: 'npc.ysel.exception.days',
      choices: [
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Scholar path: cartography shortcut (Tier 2, archive mastery) ───────

    'ysel.scholar.map': {
      speakerKey: 'npc.ysel.scholar.map',
      choices: [
        {
          id: 'map_in_session',
          textKey: 'dialogue.choice.show_map',
          nextNodeId: 'ysel.scholar.session1',
          requiresArchiveDomain: { domain: 'cartography', level: 2 },
          insightGain: 12,
          trustGain: 5,
        },
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    'ysel.scholar.session1': {
      speakerKey: 'npc.ysel.scholar.session1',
      choices: [
        {
          id: 'map_session2',
          textKey: 'dialogue.choice.begin_second_session',
          nextNodeId: 'ysel.scholar.complete',
          insightGain: 15,
          trustGain: 5,
          worldFlagSet: 'vael_surfacing_pattern',
          questTrigger: 'pattern_she_carries',
        },
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    'ysel.scholar.complete': {
      speakerKey: 'npc.ysel.scholar.complete',
      choices: [
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 3 ── Second pattern session (trust 15+, session 1 done). ──────

    'ysel.greeting.tier3': {
      speakerKey: 'npc.ysel.greeting.tier3',
      choices: [
        {
          id: 'begin_session_2',
          textKey: 'dialogue.choice.begin_second_session',
          nextNodeId: 'ysel.session2.open',
          worldFlagRequired: 'ysel_session_1_complete',
          insightGain: 10,
          trustGain: 5,
        },
        {
          id: 'show_map_scholar',
          textKey: 'dialogue.choice.show_map',
          nextNodeId: 'ysel.scholar.map',
          requiresArchiveDomain: { domain: 'cartography', level: 2 },
          insightGain: 8,
        },
        { id: 'ask_exception_increase',  textKey: 'dialogue.choice.ask_what_changed',  nextNodeId: 'ysel.exception.increase', insightGain: 8, trustGain: 3 },
        { id: 'leave',                   textKey: 'dialogue.choice.leave' },
      ],
    },

    'ysel.session2.open': {
      speakerKey: 'npc.ysel.session2.open',
      choices: [
        {
          id: 'listen_session2',
          textKey: 'dialogue.choice.listen',
          nextNodeId: 'ysel.session2.record',
          insightGain: 12,
          trustGain: 5,
          worldFlagSet: 'ysel_session_2_complete',
        },
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    'ysel.session2.record': {
      speakerKey: 'npc.ysel.session2.record',
      choices: [
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    'ysel.exception.increase': {
      speakerKey: 'npc.ysel.exception.increase',
      choices: [
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    // ── Tier 4 ── Final session (trust 25+, session 2 done). Pattern complete.

    'ysel.greeting.tier4': {
      speakerKey: 'npc.ysel.greeting.tier4',
      choices: [
        {
          id: 'begin_final_session',
          textKey: 'dialogue.choice.begin_final_session',
          nextNodeId: 'ysel.session3.open',
          worldFlagRequired: 'ysel_session_2_complete',
          insightGain: 15,
          trustGain: 5,
        },
        { id: 'ask_what_it_means',  textKey: 'dialogue.choice.press_harder',  nextNodeId: 'ysel.pattern.meaning', insightGain: 10, trustGain: 3, requiresTier: 4 },
        { id: 'leave',              textKey: 'dialogue.choice.leave' },
      ],
    },

    'ysel.session3.open': {
      speakerKey: 'npc.ysel.session3.open',
      choices: [
        {
          id: 'listen_final',
          textKey: 'dialogue.choice.listen',
          nextNodeId: 'ysel.session3.complete',
          insightGain: 20,
          trustGain: 5,
          worldFlagSet: 'ysel_session_3_complete',
          questTrigger: 'pattern_she_carries',
        },
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    'ysel.session3.complete': {
      speakerKey: 'npc.ysel.session3.complete',
      choices: [
        {
          id: 'seal_pattern',
          textKey: 'dialogue.choice.listen',
          nextNodeId: 'ysel.pattern.sealed',
          insightGain: 10,
          worldFlagSet: 'vael_surfacing_pattern',
        },
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    'ysel.pattern.sealed': {
      speakerKey: 'npc.ysel.pattern.sealed',
      choices: [
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

    'ysel.pattern.meaning': {
      speakerKey: 'npc.ysel.pattern.meaning',
      choices: [
        { id: 'leave',  textKey: 'dialogue.choice.leave' },
      ],
    },

  },
}
