// ─────────────────────────────────────────────────────────────────────────────
// SHARED TYPES — All primitive enums and type aliases used across modules.
// Changing any value here is a BREAKING CHANGE. Discuss before modifying.
// ─────────────────────────────────────────────────────────────────────────────

/** The seven phases of each loop, plus title and ending screens. */
export type GamePhase =
  | 'title'
  | 'dawn'
  | 'morning'
  | 'afternoon'
  | 'dusk'
  | 'night_safe'   // lighthouse lit
  | 'night_dark'   // lighthouse unlit, danger escalates
  | 'death'        // death screen before loop reset
  | 'vision'       // narrative revelation sequence
  | 'ending'

/** The five narrative endings. */
export type EndingId =
  | 'liberation'
  | 'keepers_peace'
  | 'sacrifice'
  | 'corruption'
  | 'transcendence'

/** The seven knowledge domains of the Archive Mastery system. */
export type ArchiveDomain =
  | 'history'
  | 'occult'
  | 'maritime'
  | 'ecology'
  | 'alchemy'
  | 'cartography'
  | 'linguistics'

/** All NPC identifiers. The 21 named characters of the island. */
/** All NPC identifiers. The 16 named characters of the island. */
export type NPCId =
  | 'maren'           // The Archivist
  | 'vael'            // The Echo (prior Keeper, trapped)
  | 'silas'           // The Harbormaster
  | 'petra'           // The Apothecary
  | 'tobias'          // The Blacksmith
  | 'elara'           // The Fisherman's Daughter
  | 'corvin'          // The Ferryman
  | 'aldric'          // The Miller
  | 'isolde'          // The Innkeeper
  | 'brynn'           // The Butcher
  | 'fenn'            // The Lighthouse Keeper (Echo: Elias)
  | 'keeper_petra'    // Lighthouse Keeper Echo: Petra
  | 'keeper_tobias'   // Lighthouse Keeper Echo: Tobias
  | 'the_warden'      // The thing beneath (late-game)
  | 'mirror_keeper'   // The player's own echo (late-game)
| 'dov'             // The Mechanic
  | 'thalia'          // The Herbalist
  | 'rudd'            // The Smuggler
  | 'ina'             // The Innkeeper (village square)
  | 'bram'            // The Blacksmith — Village Square forge
  | 'ysel'            // The Pattern Keeper — Harbor pier
| 'cal'             // The Former Keeper's Silence
| 'oren'            // The Priest — Ruins (The Priest's Penance)
| 'sera'            // The Lost Child -- Tidal Caves (spirit, hidden until spirit_binding)

/** All explorable location identifiers. */
export type LocationId =
  | 'keepers_cottage'
  | 'lighthouse_base'
  | 'lighthouse_top'
  | 'mechanism_room'
  | 'village_square'
  | 'village_inn'
  | 'harbor'
  | 'chapel'
  | 'mill'
  | 'forest_path'
  | 'ruins'
  | 'cliffside'
  | 'archive_basement'
  | 'tidal_caves'

/** Unique identifiers for Insight Cards (formed hypotheses). */
export type InsightCardId = string

/** Unique identifiers for Journal narrative threads. */
export type JournalThreadId = string

/** Unique quest identifiers. */
export type QuestId = string

/** Moral stance options — never a binary good/evil choice. */
export type MoralAlignment = 'protect' | 'sacrifice' | 'betray' | 'expose' | 'neutral'

/** Volume categories for the audio system. */
export type AudioCategory = 'master' | 'ambient' | 'ui' | 'narrative'

/** NPC attitude toward the player — can change based on choices. */
export type NPCAttitude = 'friendly' | 'neutral' | 'hostile' | 'hidden' | 'fearful'

/** Collectible item identifiers. */
export type ItemId =
  | 'keeper_logbook'
  | 'old_compass'
  | 'signal_flare'
  | 'rusted_key'
  | 'tide_chart'
  | 'brass_coupling'

/** Achievement identifiers — one per milestone. */
export type AchievementId =
  | 'first_steps'
  | 'curious_mind'
  | 'voices_of_the_island'
  | 'finder_of_things'
  | 'full_pockets'
  | 'truth_seeker'
  | 'lore_keeper'
  | 'echo'
  | 'all_echoes'
  | 'survivor'
