// ─────────────────────────────────────────────────────────────────────────────
// The Keeper — GDD §5.5 (closes #138)
//
// The Keeper is a ghost. He appears only in vision states, spawned by the
// VisionSystem or by direct vision-scene routing. He speaks in fragments,
// like a man remembering through water. Five monologue paths branch based on
// which sealed insights the player has accumulated.
//
// Tier structure is minimal (one tier) because the Keeper does not accumulate
// trust in the conventional sense — each encounter is its own complete moment.
// The five paths are gated via requiresSealedInsight on each branch choice.
// ─────────────────────────────────────────────────────────────────────────────

import type { NPCFullData } from './dialogueTypes.js'

export const THE_KEEPER_NPC: NPCFullData = {
  id: 'the_keeper',
  nameKey: 'npc.the_keeper.name',
  titleKey: 'npc.the_keeper.title',
  defaultLocation: 'lighthouse_top',
  defaultAttitude: 'hidden',
  schedule: {},
  tierThresholds: [0],
  greetingNodes: ['the_keeper.vision.entrance'],
  secret: "The Keeper suppressed Alistair's discovery that the sixth light was a doorway, not a beacon. The lighthouse bound him as consequence. He is the lock; the player who walks all six paths becomes the key.",

  nodes: {

    // ── Vision entrance — the player encounters him in the white space ─────

    'the_keeper.vision.entrance': {
      speakerKey: 'npc.the_keeper.vision.entrance',
      choices: [
        // Path 1 — Default (no sealed insights required)
        // "You're new to it. The weight of the light. Give it time."
        {
          id: 'keeper_listen_default',
          textKey: 'dialogue.choice.listen_to_the_keeper',
          nextNodeId: 'the_keeper.monologue.default',
          insightGain: 5,
        },
        // Path 2 — beacon_anomaly sealed
        // "The sixth light. I tried to write it down. The pages kept changing."
        {
          id: 'keeper_sixth_light',
          textKey: 'dialogue.choice.ask_about_the_sixth_light',
          nextNodeId: 'the_keeper.monologue.beacon_anomaly',
          requiresSealedInsight: 'beacon_anomaly',
          insightGain: 12,
          trustGain: 3,
        },
        // Path 3 — alistair_connection sealed
        // "He came to me, near the end. Said he'd found the pattern."
        {
          id: 'keeper_alistair_pattern',
          textKey: 'dialogue.choice.ask_about_alistair_and_keeper',
          nextNodeId: 'the_keeper.monologue.alistair_connection',
          requiresSealedInsight: 'alistair_connection',
          insightGain: 14,
          trustGain: 4,
        },
        // Path 4 — loop_signature sealed
        // "The loops aren't a trap. They're a search."
        {
          id: 'keeper_loops_purpose',
          textKey: 'dialogue.choice.ask_what_the_loops_are_for',
          nextNodeId: 'the_keeper.monologue.loop_signature',
          requiresSealedInsight: 'loop_signature',
          insightGain: 16,
          trustGain: 5,
        },
        // Path 5 — drowned_archive sealed — the full revelation
        // "I am the lock. You are the key."
        {
          id: 'keeper_what_you_did',
          textKey: 'dialogue.choice.ask_what_you_did_keeper',
          nextNodeId: 'the_keeper.monologue.drowned_archive',
          requiresSealedInsight: 'drowned_archive',
          insightGain: 30,
          trustGain: 10,
          worldFlagSet: 'keeper_revelation_received',
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },

    // ── Path 1 — Default monologue ─────────────────────────────────────────
    // No sealed insights. He is observing. He is not yet sure the player
    // is the one he has been waiting for.
    'the_keeper.monologue.default': {
      speakerKey: 'npc.the_keeper.monologue.default',
      choices: [
        {
          id: 'ask_keeper_how_long',
          textKey: 'dialogue.choice.ask_how_long_you_have_waited',
          nextNodeId: 'the_keeper.waiting.duration',
          insightGain: 6,
          trustGain: 2,
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'the_keeper.waiting.duration': {
      speakerKey: 'npc.the_keeper.waiting.duration',
      choices: [
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },

    // ── Path 2 — beacon_anomaly monologue ──────────────────────────────────
    // The player has sealed beacon_anomaly — they know about the sixth light.
    // The Keeper confirms it is real. He saw it. He could not document it.
    'the_keeper.monologue.beacon_anomaly': {
      speakerKey: 'npc.the_keeper.monologue.beacon_anomaly',
      choices: [
        {
          id: 'ask_keeper_why_pages_changed',
          textKey: 'dialogue.choice.ask_why_the_pages_changed',
          nextNodeId: 'the_keeper.sixth_light.pages',
          insightGain: 10,
          trustGain: 3,
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
          worldFlagSet: 'keeper_sixth_light_known',
        },
      ],
    },
    'the_keeper.sixth_light.pages': {
      speakerKey: 'npc.the_keeper.sixth_light.pages',
      choices: [
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
          worldFlagSet: 'keeper_sixth_light_known',
        },
      ],
    },

    // ── Path 3 — alistair_connection monologue ─────────────────────────────
    // The player has sealed alistair_connection. The Keeper confesses his
    // regret — Alistair came to him and he turned him away.
    'the_keeper.monologue.alistair_connection': {
      speakerKey: 'npc.the_keeper.monologue.alistair_connection',
      choices: [
        {
          id: 'ask_keeper_what_pattern',
          textKey: 'dialogue.choice.ask_what_pattern_alistair_found',
          nextNodeId: 'the_keeper.alistair.pattern',
          insightGain: 12,
          trustGain: 4,
        },
        {
          id: 'ask_keeper_why_not_believe',
          textKey: 'dialogue.choice.ask_why_you_did_not_believe',
          nextNodeId: 'the_keeper.alistair.disbelief',
          insightGain: 10,
          moralWeight: 1,
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
          worldFlagSet: 'keeper_alistair_regret_known',
        },
      ],
    },
    'the_keeper.alistair.pattern': {
      speakerKey: 'npc.the_keeper.alistair.pattern',
      choices: [
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
          worldFlagSet: 'keeper_alistair_regret_known',
        },
      ],
    },
    'the_keeper.alistair.disbelief': {
      speakerKey: 'npc.the_keeper.alistair.disbelief',
      choices: [
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
          worldFlagSet: 'keeper_alistair_regret_known',
        },
      ],
    },

    // ── Path 4 — loop_signature monologue ──────────────────────────────────
    // The player has sealed loop_signature. The Keeper has witnessed many loops.
    // He explains: the loops are not punishment, they are a search algorithm.
    'the_keeper.monologue.loop_signature': {
      speakerKey: 'npc.the_keeper.monologue.loop_signature',
      choices: [
        {
          id: 'ask_keeper_what_is_searching',
          textKey: 'dialogue.choice.ask_what_is_searching',
          nextNodeId: 'the_keeper.loops.searcher',
          insightGain: 14,
          trustGain: 5,
        },
        {
          id: 'ask_keeper_thirty_seven',
          textKey: 'dialogue.choice.ask_about_thirty_seven_loops',
          nextNodeId: 'the_keeper.loops.count',
          insightGain: 10,
          trustGain: 3,
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
          worldFlagSet: 'keeper_loop_count_known',
        },
      ],
    },
    'the_keeper.loops.searcher': {
      speakerKey: 'npc.the_keeper.loops.searcher',
      choices: [
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
          worldFlagSet: 'keeper_loop_count_known',
        },
      ],
    },
    'the_keeper.loops.count': {
      speakerKey: 'npc.the_keeper.loops.count',
      choices: [
        {
          id: 'ask_keeper_what_right_ending_looks_like',
          textKey: 'dialogue.choice.ask_what_the_right_ending_looks_like',
          nextNodeId: 'the_keeper.loops.right_ending',
          insightGain: 12,
          moralWeight: 2,
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
          worldFlagSet: 'keeper_loop_count_known',
        },
      ],
    },
    'the_keeper.loops.right_ending': {
      speakerKey: 'npc.the_keeper.loops.right_ending',
      choices: [
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
          worldFlagSet: 'keeper_loop_count_known',
        },
      ],
    },

    // ── Path 5 — drowned_archive monologue (full revelation) ──────────────
    // The player has sealed drowned_archive. The Keeper finally names his act:
    // he suppressed Alistair's discovery, and the lighthouse bound him as
    // consequence. He reveals the mechanic of the six paths.
    'the_keeper.monologue.drowned_archive': {
      speakerKey: 'npc.the_keeper.monologue.drowned_archive',
      choices: [
        {
          id: 'ask_keeper_what_discovery',
          textKey: 'dialogue.choice.ask_what_alistair_discovered',
          nextNodeId: 'the_keeper.revelation.discovery',
          insightGain: 20,
          trustGain: 8,
        },
        {
          id: 'ask_keeper_what_lock_means',
          textKey: 'dialogue.choice.ask_what_you_mean_lock_and_key',
          nextNodeId: 'the_keeper.revelation.lock_and_key',
          insightGain: 25,
          trustGain: 10,
          worldFlagSet: 'keeper_lock_key_understood',
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'the_keeper.revelation.discovery': {
      speakerKey: 'npc.the_keeper.revelation.discovery',
      choices: [
        {
          id: 'ask_keeper_why_suppress',
          textKey: 'dialogue.choice.ask_why_you_suppressed_it',
          nextNodeId: 'the_keeper.revelation.why_suppressed',
          insightGain: 15,
          moralWeight: 2,
          trustGain: 5,
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'the_keeper.revelation.why_suppressed': {
      speakerKey: 'npc.the_keeper.revelation.why_suppressed',
      choices: [
        {
          id: 'ask_keeper_lock_and_key_now',
          textKey: 'dialogue.choice.ask_what_you_mean_lock_and_key',
          nextNodeId: 'the_keeper.revelation.lock_and_key',
          insightGain: 20,
          trustGain: 8,
          worldFlagSet: 'keeper_lock_key_understood',
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'the_keeper.revelation.lock_and_key': {
      speakerKey: 'npc.the_keeper.revelation.lock_and_key',
      choices: [
        {
          id: 'accept_the_role',
          textKey: 'dialogue.choice.accept_the_role_of_key',
          nextNodeId: 'the_keeper.revelation.accepted',
          insightGain: 30,
          trustGain: 15,
          moralWeight: 3,
          worldFlagSet: 'keeper_truth_revealed',
        },
        {
          id: 'refuse_the_role',
          textKey: 'dialogue.choice.refuse_the_role_of_key',
          nextNodeId: 'the_keeper.revelation.refused',
          moralWeight: -2,
          worldFlagSet: 'keeper_truth_refused',
        },
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },
    'the_keeper.revelation.accepted': {
      speakerKey: 'npc.the_keeper.revelation.accepted',
      choices: [
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
          worldFlagSet: 'six_paths_unlocked',
        },
      ],
    },
    'the_keeper.revelation.refused': {
      speakerKey: 'npc.the_keeper.revelation.refused',
      choices: [
        {
          id: 'leave',
          textKey: 'dialogue.choice.leave',
        },
      ],
    },

  },
}
