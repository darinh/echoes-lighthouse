// ─────────────────────────────────────────────────────────────────────────────
// VisionTrigger data — GDD §6 vision trigger specifications.
//
// Each entry drives VisionSystem event routing without changing engine code.
// Event names match GameEventType values emitted via GameEngine.applyEvent().
// NOTE: `examine.completed` is the engine event for examining items;
//       `item.examined` is not in the union and is intentionally mapped here
//       to the correct event name.
// ─────────────────────────────────────────────────────────────────────────────

import type { GameEventType } from '@/interfaces/IEventBus.js'

export interface VisionTrigger {
  /** Unique stable identifier for this trigger. Used as the fired-flag key. */
  id: string
  /** GameEventType to listen for. */
  event: GameEventType
  condition: {
    /** worldFlag that must be set in state.worldFlags for this to fire. */
    worldFlag?: string
    /** Player must have moved to this locationId (for location.moved events). */
    locationId?: string
    /** Event must involve this npcId (dialogue.start, npc.trust.changed, etc.). */
    npcId?: string
    /** Event must involve this itemId (examine.completed). */
    itemId?: string
    /**
     * The absolute trust/resonance value in the event payload must be >= min.
     * Used for both npc.trust.changed and npc.resonance.changed.
     */
    minTrust?: { npcId: string; min: number }
    /** state.player.loopCount must be >= this value. */
    minLoop?: number
  }
  /** i18n key for the vision text, queued into pendingVisions. */
  visionKey: string
  /** World flag to set after vision fires (regardless of repeatable status). */
  worldFlagSet?: string
  /** Default false — vision fires at most once per playthrough unless true. */
  isRepeatable?: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// The 10 data-driven triggers from GDD §6.
// ─────────────────────────────────────────────────────────────────────────────

export const VISION_TRIGGERS_DATA: readonly VisionTrigger[] = [
  // 1. Examining the old journal in Keeper's Cottage.
  {
    id: 'vision_old_journal',
    event: 'examine.completed',
    condition: { itemId: 'old_journal' },
    visionKey: 'vision.old_journal',
  },

  // 2. Examining the lighthouse lens at the top of the tower.
  //    (examine item id: 'lighthouse_lens'; examine data uses 'lens_inscription'
  //     for the inscription but the vision fires on a conceptual "lens" examine.)
  {
    id: 'vision_lighthouse_lens',
    event: 'examine.completed',
    condition: { itemId: 'lighthouse_lens' },
    visionKey: 'vision.lighthouse_lens',
  },

  // 3. First time entering the mechanism room.
  {
    id: 'vision_mechanism_symbols',
    event: 'location.moved',
    condition: { locationId: 'mechanism_room' },
    visionKey: 'vision.mechanism_symbols',
    worldFlagSet: 'examined_mechanism_symbols',
  },

  // 4. Maren's trust reaches or exceeds 5.
  {
    id: 'vision_maren_trust',
    event: 'npc.trust.changed',
    condition: { npcId: 'maren', minTrust: { npcId: 'maren', min: 5 } },
    visionKey: 'vision.maren_past',
  },

  // 5. Vael's resonance reaches or exceeds 4.
  {
    id: 'vision_vael_resonance',
    event: 'npc.resonance.changed',
    condition: { npcId: 'vael', minTrust: { npcId: 'vael', min: 4 } },
    visionKey: 'vision.vael_origin',
  },

  // 6. First time entering the tidal caves.
  {
    id: 'vision_tidal_caves',
    event: 'location.moved',
    condition: { locationId: 'tidal_caves' },
    visionKey: 'vision.tidal_caves',
  },

  // 7. Visiting the cliffside at loop 3 or later.
  {
    id: 'vision_cliffside',
    event: 'location.moved',
    condition: { locationId: 'cliffside', minLoop: 3 },
    visionKey: 'vision.cliffside_loop',
  },

  // 8. Entering the chapel while the night_phase_active flag is set.
  {
    id: 'vision_chapel_dark',
    event: 'location.moved',
    condition: { locationId: 'chapel', worldFlag: 'night_phase_active' },
    visionKey: 'vision.chapel_dark',
  },

  // 9. Beginning of the fifth loop (loop.started fires from the event bus;
  //    VisionSystem handles it via onEvent when the engine routes it).
  {
    id: 'vision_loop_5',
    event: 'loop.started',
    condition: { minLoop: 5 },
    visionKey: 'vision.fifth_return',
    isRepeatable: false,
  },

  // 10. Opening dialogue with Keeper Petra after examining the old journal.
  //     Partially closes #138.
  {
    id: 'vision_ina_keeper',
    event: 'dialogue.start',
    condition: { npcId: 'keeper_petra', worldFlag: 'examined_old_journal' },
    visionKey: 'vision.ina_keeper',
  },

  // ── Harbor arc (GDD §3.3 / §5.5 — closes #138) ───────────────────────────

  // 11. First completed loop — sets world flag used to gate Ina's loops topic.
  //     No visible vision text; visionKey is an empty atmospheric beat.
  {
    id: 'loop_1_flag_setter',
    event: 'loop.started',
    condition: { minLoop: 1 },
    visionKey: 'vision.first_return',
    worldFlagSet: 'loop_1_reached',
    isRepeatable: false,
  },

  // 12. Fourth loop reached — gates Ina's Loop 4 prophecy topic and the
  //     loop_signature insight card.
  {
    id: 'loop_4_flag_setter',
    event: 'loop.started',
    condition: { minLoop: 4 },
    visionKey: 'vision.fourth_return',
    worldFlagSet: 'loop_4_reached',
    isRepeatable: false,
  },

  // 13. First visit to the archive basement — gates Ina's archive topic
  //     and the beacon_anomaly / drowned_archive insight cards.
  {
    id: 'archive_basement_visit',
    event: 'location.moved',
    condition: { locationId: 'archive_basement' },
    visionKey: 'vision.archive_descent',
    worldFlagSet: 'archive_basement_visited',
    isRepeatable: false,
  },

  // 14. Ina harbor vision — fires the next time the player opens dialogue with
  //     Ina after selecting the vision-trigger topic (worldFlag set by that
  //     choice). Once fired, the flag 'ina_harbor_vision_fired' prevents refire.
  {
    id: 'ina_harbor_vision',
    event: 'dialogue.start',
    condition: { npcId: 'ina', worldFlag: 'ina_harbor_vision_ready' },
    visionKey: 'vision.ina_harbor',
    worldFlagSet: 'ina_harbor_vision_fired',
    isRepeatable: false,
  },
]
