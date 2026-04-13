# ECHOES OF THE LIGHTHOUSE
## DOCUMENT B: DATA SPECIFICATION & SCHEMAS

**Version:** 1.0  
**Scope:** Complete game state definitions, save data structure, world constants  
**Format:** JSON schema with TypeScript-style type annotations and examples

---

## B1. DOCUMENT HEADER & SCOPE

### B1.1 Purpose

This document defines every data structure used in *Echoes of the Lighthouse*. It serves as:
1. **The authoritative world schema** — what fields exist, what they contain, how they relate
2. **Save/load specification** — what gets persisted to localStorage
3. **Constant references** — all hardcoded values, thresholds, balancing numbers
4. **Example data** — realistic instances of each schema, showing how data flows

### B1.2 Data Flow Overview

```
Player Input
    ↓
Game Logic (processes input, checks prerequisites)
    ↓
World State (game updates fields in worldState)
    ↓
Serialization (to JSON, stored in localStorage)
    ↓
Deserialization (loaded back as game object)
```

All persistent data flows through the `worldState` JSON object. Runtime calculations (e.g., derived stats, UI state) are NOT saved; they're computed from the persisted data on load.

---

## B2. COMPLETE WORLD STATE SCHEMA

The authoritative save object structure. Every field with type, default, and description.

```json
{
  "version": "1.0",
  "meta": {
    "version": "1.0",
    "created_at": "2025-01-15T08:32:00Z",
    "last_saved": "2025-01-15T08:47:30Z"
  },
  "player": {
    "archetype": "SCHOLAR",
    "loop_count": 0,
    "total_insight_earned": 285,
    "death_count": 2
  },
  "loop_state": {
    "current_insight": 45,
    "current_resonance": 28,
    "current_turns": 5,
    "current_phase": "DAY",
    "current_location": 1,
    "phase_end_turn": 8,
    "time_of_day_index": 2
  },
  "journal": {
    "entries": [
      {
        "id": "entry_001",
        "timestamp": 5,
        "location_id": 1,
        "speaker_npc_id": "orin",
        "text": "The lighthouse guides those lost at sea...",
        "entry_type": "dialogue",
        "revealed": true
      }
    ],
    "active_threads": [
      {
        "id": "thread_001",
        "name": "The Lighthouse Conspiracy",
        "clues": ["clue_001", "clue_002"],
        "status": "in_progress"
      }
    ],
    "sealed_insights": [
      {
        "id": "insight_card_001",
        "title": "The lighthouse was built to trap",
        "description": "The lighthouse is not a beacon — it is a prison.",
        "sealed_at_turn": 12,
        "sealed_by_clues": ["clue_001", "clue_003", "clue_007"],
        "resonance_reward": 10
      }
    ],
    "insight_cards": [
      {
        "id": "card_001",
        "card_number": 1,
        "title": "The lighthouse was built to trap",
        "description": "Speculation: what if the lighthouse imprisoned something, not guided ships?",
        "required_clues": 3,
        "current_clues_found": 2,
        "clues_list": ["clue_001", "clue_003"],
        "status": "in_progress",
        "sealed_at_turn": null
      }
    ]
  },
  "npcs": {
    "orin": {
      "npc_id": "orin",
      "name": "Orin",
      "title": "The Keeper",
      "trust_level": 60,
      "secrets_known": ["secret_001", "secret_004"],
      "dialogue_state": "first_meeting_complete",
      "quest_stage": 2,
      "interactions_count": 4,
      "last_interaction_turn": 7,
      "mood": "guarded",
      "is_alive": true,
      "betrayal_flag": false
    },
    "mira": {
      "npc_id": "mira",
      "name": "Mira",
      "title": "The Keeper's Daughter",
      "trust_level": 25,
      "secrets_known": [],
      "dialogue_state": "encountered",
      "quest_stage": 0,
      "interactions_count": 1,
      "last_interaction_turn": 3,
      "mood": "wary",
      "is_alive": true,
      "betrayal_flag": false
    }
  },
  "locations": {
    "1": {
      "location_id": 1,
      "location_name": "THE LIGHTHOUSE",
      "location_code": "LIGHTHOUSE_ARCHIVE",
      "visited": true,
      "visit_count": 5,
      "hotspots_discovered": ["hotspot_101", "hotspot_102"],
      "events_triggered": ["event_001", "event_004"],
      "npcs_met": ["orin", "crow"],
      "last_visited_turn": 7
    },
    "5": {
      "location_id": 5,
      "location_name": "THE ARCHIVE",
      "location_code": "ARCHIVE_HEART",
      "visited": false,
      "visit_count": 0,
      "hotspots_discovered": [],
      "events_triggered": [],
      "npcs_met": [],
      "last_visited_turn": null
    }
  },
  "flags": {
    "tutorial_complete": true,
    "first_insight_found": true,
    "betrayal_discovered": false,
    "orin_trust_open": false,
    "mira_alive": true,
    "vael_awakened": false,
    "corruption_visible": false,
    "lighthouse_beam_seen": false,
    "final_choice_made": false,
    "loop_end_reached": false,
    "ghosts_appearing": false,
    "keeper_chamber_unlocked": false,
    "archive_heart_accessed": false,
    "void_threshold_crossed": false
  },
  "endings": {
    "ending_reached": null,
    "endings_seen": [],
    "loop_endings_count": 0
  }
}
```

### B2.1 Meta Fields

| Field | Type | Default | Loop-Persistent | Description |
|---|---|---|---|---|
| `version` | string | `"1.0"` | Yes | Save file format version for migration |
| `created_at` | ISO 8601 timestamp | `Date.now()` | Yes | When this save was first created |
| `last_saved` | ISO 8601 timestamp | `Date.now()` | No | When save was last written |

### B2.2 Player Fields

| Field | Type | Default | Loop-Persistent | Description |
|---|---|---|---|---|
| `archetype` | enum: SCHOLAR \| SEEKER \| OBSERVER \| KEEPER | `SCHOLAR` | Yes | Player's chosen starting archetype. Determines initial bonuses. |
| `loop_count` | number | `0` | Yes | How many loops completed. Increments when player reaches ending. |
| `total_insight_earned` | number | `0` | Yes | Cumulative Insight across all loops. Used for meta-progression cosmetics. |
| `death_count` | number | `0` | Yes | Total deaths across loops (stats only). |

### B2.3 Loop State Fields

| Field | Type | Default | Loop-Persistent | Description |
|---|---|---|---|---|
| `current_insight` | number | Archetype-dependent (50-70) | **No** | Active Insight currency this loop. Resets per loop. |
| `current_resonance` | number | Archetype-dependent (10-20) | **No** | Active Resonance currency this loop. Resets per loop. |
| `current_turns` | number | `0` | **No** | Turn counter (1-48 typically). Increments each turn. |
| `current_phase` | enum: TITLE \| DAWN \| DAY \| DUSK \| NIGHT_SAFE \| NIGHT_DARK \| VISION \| ENDING | `TITLE` | **No** | Current game phase. |
| `current_location` | number (1-10) | `1` | **No** | Active location ID. |
| `phase_end_turn` | number | Depends on phase | **No** | Turn at which current phase ends. (e.g., DAY ends at turn 24). |
| `time_of_day_index` | number (0-7) | `0` | **No** | Index into TIME_OF_DAY array for narrative flavor. |

### B2.4 Journal Fields

#### entries[]

Array of journal log entries (dialogue snippets, events, discoveries).

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique entry ID (e.g., "entry_001") |
| `timestamp` | number | Turn when entry was created |
| `location_id` | number (1-10) | Where entry occurred |
| `speaker_npc_id` | string \| null | Which NPC spoke (or null for system/player) |
| `text` | string | Entry text (dialogue, narration, or system message) |
| `entry_type` | enum: "dialogue" \| "discovery" \| "event" \| "system" | Categorization |
| `revealed` | boolean | Whether entry is visible (false = unseen until revealed by quest trigger) |

#### active_threads[]

Array of active mystery threads (each thread is a collection of related clues).

| Field | Type | Description |
|---|---|---|
| `id` | string | Thread ID (e.g., "thread_001") |
| `name` | string | Human-readable thread name ("The Lighthouse Conspiracy", "Orin's Past", etc.) |
| `clues` | string[] | Array of clue IDs that belong to this thread |
| `status` | enum: "in_progress" \| "complete" \| "abandoned" | Thread progression |

#### sealed_insights[]

Array of completed Insight Cards (sealed and stored for reference).

| Field | Type | Description |
|---|---|---|
| `id` | string | Card ID (e.g., "insight_card_001") |
| `title` | string | Card title |
| `description` | string | Full card text |
| `sealed_at_turn` | number | Turn when player sealed this card |
| `sealed_by_clues` | string[] | Which clue IDs were used to seal it |
| `resonance_reward` | number | Resonance gained when sealed |

#### insight_cards[]

Array of in-progress Insight Cards (unsolved mysteries).

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique card ID |
| `card_number` | number (1-12) | Card position in deck (narrative order) |
| `title` | string | Mystery title |
| `description` | string | Mystery description |
| `required_clues` | number | How many clues needed to solve (typically 3-5) |
| `current_clues_found` | number | How many clues player has found |
| `clues_list` | string[] | Array of clue IDs found so far |
| `status` | enum: "in_progress" \| "sealed" | Solved or unsolved |
| `sealed_at_turn` | number \| null | Turn sealed (null if not sealed) |

### B2.5 NPC Fields

Each NPC object in the `npcs` map shares this structure:

| Field | Type | Default | Description |
|---|---|---|---|
| `npc_id` | string (key) | — | Unique identifier (e.g., "orin", "mira", "crow") |
| `name` | string | — | Display name |
| `title` | string | — | NPC title/role |
| `trust_level` | number (0-100) | 0 | Trust relationship with player (0=hostile, 50=neutral, 100=full trust) |
| `secrets_known` | string[] | [] | Array of secret IDs player has learned about this NPC |
| `dialogue_state` | enum | "unmet" | Current dialogue tree state ("unmet" → "first_meeting" → "first_meeting_complete" → "open_dialogue" → "betrayed" → etc.) |
| `quest_stage` | number | 0 | Progress on this NPC's quest arc (0=unmet, 1+= stages of quest) |
| `interactions_count` | number | 0 | Total dialogue interactions with this NPC |
| `last_interaction_turn` | number \| null | null | Turn of last interaction |
| `mood` | enum | "neutral" | NPC's current emotional state ("hostile" \| "wary" \| "guarded" \| "open" \| "friendly" \| "betrayed") |
| `is_alive` | boolean | true | Whether NPC is still alive (can die in certain branches) |
| `betrayal_flag` | boolean | false | Whether this NPC has betrayed the player (affects dialogue/ending) |

### B2.6 Location Fields

Each location object in the `locations` map:

| Field | Type | Default | Description |
|---|---|---|---|
| `location_id` | number (1-10) | — | Unique location ID |
| `location_name` | string | — | Display name (e.g., "THE LIGHTHOUSE") |
| `location_code` | string | — | Internal code (e.g., "LIGHTHOUSE_ARCHIVE") |
| `visited` | boolean | false | Whether player has visited |
| `visit_count` | number | 0 | Total visits (for repeat encounter logic) |
| `hotspots_discovered` | string[] | [] | Array of discovered hotspot IDs at this location |
| `events_triggered` | string[] | [] | Array of triggered event IDs |
| `npcs_met` | string[] | [] | Array of NPC IDs encountered at this location |
| `last_visited_turn` | number \| null | null | Turn of last visit |

### B2.7 Flags (World State Booleans)

An object containing every binary world-state flag used throughout the game:

| Flag | Default | Description |
|---|---|---|
| `tutorial_complete` | false | Has player seen tutorial? |
| `first_insight_found` | false | Has player found first Insight card clue? |
| `betrayal_discovered` | false | Has player discovered a betrayal? |
| `orin_trust_open` | false | Is Orin's trust high enough for full dialogue? |
| `mira_alive` | true | Is Mira still alive? |
| `vael_awakened` | false | Has Vael been awakened/revealed? |
| `corruption_visible` | false | Is corruption beginning to show visually? |
| `lighthouse_beam_seen` | false | Has player witnessed the lighthouse beam? |
| `final_choice_made` | false | Has player made the final ending choice? |
| `loop_end_reached` | false | Has player reached an ending? |
| `ghosts_appearing` | false | Are ghosts visible in the environment? |
| `keeper_chamber_unlocked` | false | Has Keeper's Chamber been unlocked? |
| `archive_heart_accessed` | false | Has the Archive heart been accessed? |
| `void_threshold_crossed` | false | Has player's corruption crossed the "point of no return"? |

### B2.8 Endings Fields

| Field | Type | Default | Description |
|---|---|---|---|
| `ending_reached` | string \| null | null | Which ending was reached ("ASCENSION", "PARADOX", "VOID", "CORRUPTION", or null) |
| `endings_seen` | string[] | [] | All endings player has experienced (for end-game gallery) |
| `loop_endings_count` | number | 0 | How many distinct endings player has seen |

---

## B3. NPC DATA SCHEMA

Schema for defining an NPC (used in game data files and asset definitions, not in save state).

```json
{
  "npc_id": "orin",
  "name": "Orin",
  "title": "The Keeper",
  "portrait_ascii": "  [| |]\n  [|_|]\n  < | >\n   \\|/\n    |",
  "introduction": "A stern figure who guards the lighthouse archives. Ancient and unyielding.",
  "bio": "Orin has kept the lighthouse for decades, perhaps centuries. His memories are fractured.",
  "personality_traits": ["stern", "protective", "haunted", "knowledgeable"],
  "starting_trust": 30,
  "trust_modifiers": {
    "on_first_meeting": 0,
    "per_dialogue_success": 5,
    "per_wrong_choice": -10,
    "if_betrayed_by_player": -30
  },
  "base_mood": "guarded",
  "can_die": false,
  "can_betray": false,
  "quest_arc": {
    "stages": [
      {
        "stage": 0,
        "name": "Unmet",
        "triggers": ["location_change_1"]
      },
      {
        "stage": 1,
        "name": "First Meeting",
        "triggers": ["dialogue_with_orin"]
      },
      {
        "stage": 2,
        "name": "Open",
        "condition": "trust_level > 50"
      },
      {
        "stage": 3,
        "name": "Revelation",
        "condition": "insight_card_3_sealed"
      }
    ]
  },
  "dialogue_trees": {
    "greeting": "dialogue_tree_001",
    "question_about_lighthouse": "dialogue_tree_002",
    "question_about_betrayal": "dialogue_tree_003",
    "final": "dialogue_tree_004"
  },
  "available_secrets": ["secret_001", "secret_002", "secret_005"],
  "can_give_quests": true,
  "starting_quests": ["quest_001"]
}
```

### B3.1 NPC Definition Fields

| Field | Type | Description |
|---|---|---|
| `npc_id` | string | Unique ID (lowercase, no spaces) |
| `name` | string | Display name |
| `title` | string | Title/role |
| `portrait_ascii` | string | 5-line ASCII art for portrait (see Document A3.3) |
| `introduction` | string | One-line intro (shown on first meeting) |
| `bio` | string | Longer background (shown in journal if player finds it) |
| `personality_traits` | string[] | Array of personality descriptors |
| `starting_trust` | number (0-100) | Initial trust level this loop |
| `trust_modifiers` | object | Trust change amounts for various events |
| `base_mood` | enum | Default mood at loop start |
| `can_die` | boolean | Whether this NPC can die in gameplay |
| `can_betray` | boolean | Whether this NPC can betray player |
| `quest_arc.stages` | array | Array of quest progression stages |
| `dialogue_trees` | object | Map of dialogue tree IDs (e.g., "greeting" → "dialogue_tree_001") |
| `available_secrets` | string[] | Secrets this NPC can reveal |
| `can_give_quests` | boolean | Whether NPC offers quests |
| `starting_quests` | string[] | Quest IDs given at loop start |

---

## B4. LOCATION DATA SCHEMA

Schema for defining a location in the game world.

```json
{
  "location_id": 5,
  "location_name": "THE ARCHIVE",
  "location_code": "ARCHIVE_HEART",
  "description": "A vast underground chamber filled with impossibly tall shelves. The air is stale and cold.",
  "flavor_text": "Here, records of every lighthouse keeper are written into the stone itself.",
  "is_accessible": true,
  "access_requirements": {
    "prerequisite_insight_cards": ["card_001", "card_002"],
    "prerequisite_flags": ["keeper_chamber_unlocked"],
    "min_trust_with_npc": null,
    "forbidden_if_corruption": false,
    "forbidden_if_loop_count_exceeds": null
  },
  "connections": [
    {
      "to_location": 1,
      "direction": "up",
      "narrative": "A spiral staircase leads back to the lighthouse proper."
    },
    {
      "to_location": 6,
      "direction": "down",
      "narrative": "A passage descends deeper into the island."
    }
  ],
  "npcs_present": ["lysander"],
  "hotspots": [
    {
      "hotspot_id": "hotspot_501",
      "hotspot_name": "Ancient Ledger",
      "description": "A book so old the ink is barely visible.",
      "on_interact": "event_501",
      "gives_insight_clue": "clue_003",
      "one_time": true,
      "requires_item": null
    },
    {
      "hotspot_id": "hotspot_502",
      "hotspot_name": "Stone Tablet",
      "description": "Carved into the wall: names upon names.",
      "on_interact": "event_502",
      "gives_dialogue": "dialogue_tree_archive_tablet",
      "one_time": false,
      "requires_item": null
    }
  ],
  "events": [
    {
      "event_id": "event_501",
      "event_name": "Reading the Ledger",
      "trigger": "player_examines_hotspot_501",
      "gives_insight": 15,
      "gives_clue": "clue_003",
      "narration": "You carefully turn the pages. Names and dates blur together until...",
      "outcomes": {
        "success": {
          "narration": "You discover a hidden entry: 'Vael was always here.'",
          "sets_flag": "betrayal_discovered"
        }
      }
    }
  ],
  "music_track": "archive_theme.ogg",
  "ambience_track": "archive_ambient.ogg",
  "phase_modifications": {
    "NIGHT_DARK": {
      "description_override": "The archive is pitch black. You can hear something breathing.",
      "hostile_entities_appear": ["phosphene"],
      "extra_corruption": 10
    }
  }
}
```

### B4.1 Location Definition Fields

| Field | Type | Description |
|---|---|---|
| `location_id` | number (1-10) | Unique ID |
| `location_name` | string | Display name in all caps |
| `location_code` | string | Internal code for reference |
| `description` | string | Scene description (shown when player enters) |
| `flavor_text` | string | Optional atmospheric text |
| `is_accessible` | boolean | Whether location can be visited |
| `access_requirements` | object | Gates (prerequisites, forbidden conditions) |
| `connections` | array | Adjacent locations player can travel to |
| `npcs_present` | string[] | NPC IDs at this location |
| `hotspots` | array | Interactive objects/areas at location |
| `events` | array | Triggered events at this location |
| `music_track` | string | Audio file name (for future audio implementation) |
| `ambience_track` | string | Background ambience (for future audio) |
| `phase_modifications` | object | How location changes in different game phases |

---

## B5. DIALOGUE TREE SCHEMA

Schema for a dialogue tree node (a single step in a conversation).

```json
{
  "dialogue_tree_id": "dialogue_tree_002",
  "dialogue_title": "Question About Lighthouse",
  "speaker_npc_id": "orin",
  "speaker_name": "Orin",
  "text": "The lighthouse has guided lost souls for generations. Or perhaps... it has guided them here.",
  "prerequisites": {
    "min_trust": 30,
    "flags_required": [],
    "flags_forbidden": [],
    "insight_cards_sealed": [],
    "min_loop_count": 0
  },
  "outcomes": [
    {
      "outcome_id": "outcome_001_a",
      "player_dialogue": "What are you hiding?",
      "leads_to_dialogue_tree": "dialogue_tree_003",
      "gives_insight": 0,
      "gives_clue": null,
      "changes_trust": -10,
      "sets_flag": null,
      "narration": "Orin's eyes narrow. He turns away from you."
    },
    {
      "outcome_id": "outcome_001_b",
      "player_dialogue": "Tell me more.",
      "leads_to_dialogue_tree": "dialogue_tree_004",
      "gives_insight": 5,
      "gives_clue": "clue_001",
      "changes_trust": 5,
      "sets_flag": null,
      "narration": "Orin seems to appreciate your patience."
    },
    {
      "outcome_id": "outcome_001_c",
      "player_dialogue": "I should leave.",
      "leads_to_dialogue_tree": null,
      "gives_insight": 0,
      "gives_clue": null,
      "changes_trust": 0,
      "sets_flag": null,
      "narration": "You excuse yourself from the conversation."
    }
  ],
  "can_repeat": true,
  "max_repeats": null,
  "exit_on_silence": true
}
```

### B5.1 Dialogue Tree Fields

| Field | Type | Description |
|---|---|---|
| `dialogue_tree_id` | string | Unique ID for this dialogue node |
| `dialogue_title` | string | Human-readable label (for dev reference) |
| `speaker_npc_id` | string | Which NPC is speaking (can be null for player narration) |
| `speaker_name` | string | Name as displayed (allows override) |
| `text` | string | The dialogue text (may contain formatting tags like \n for line breaks) |
| `prerequisites` | object | Conditions that must be true for this dialogue to appear |
| `outcomes` | array | Player choices and their consequences |
| `can_repeat` | boolean | Can player select this dialogue multiple times? |
| `max_repeats` | number \| null | Maximum times (null = infinite) |
| `exit_on_silence` | boolean | If player chooses to leave, end dialogue? |

---

## B6. INSIGHT CARD SCHEMA

Schema for an Insight Card (mystery to be solved).

```json
{
  "insight_card_id": "insight_card_001",
  "card_number": 1,
  "title": "The lighthouse was built to trap",
  "description": "What if the lighthouse was never a beacon? What if it was constructed to imprison something?",
  "lore_text": "Hidden within the oldest records, a discrepancy: the lighthouse was built to contain, not guide.",
  "required_clues": 3,
  "clue_ids": ["clue_001", "clue_003", "clue_007"],
  "resonance_reward_on_seal": 10,
  "sets_flags_on_seal": ["betrayal_discovered"],
  "unlocks_dialogue_on_seal": ["dialogue_tree_revelation_001"],
  "affects_ending_branches": ["PARADOX", "VOID"],
  "narrative_significance": "high",
  "reveals_npc_secret": "secret_002"
}
```

### B6.1 Insight Card Fields

| Field | Type | Description |
|---|---|---|
| `insight_card_id` | string | Unique card ID |
| `card_number` | number (1-12) | Position in the mystery deck (narrative order) |
| `title` | string | Mystery title (one sentence) |
| `description` | string | Mystery description (1-3 sentences, player-facing) |
| `lore_text` | string | Full lore text (shown when card is sealed) |
| `required_clues` | number | How many clues needed to solve |
| `clue_ids` | string[] | Which clue IDs can be used to solve this card |
| `resonance_reward_on_seal` | number | Resonance gained when player seals this card |
| `sets_flags_on_seal` | string[] | World flags set when card is sealed |
| `unlocks_dialogue_on_seal` | string[] | New dialogue trees available after sealing |
| `affects_ending_branches` | string[] | Which ending routes are affected by solving this |
| `narrative_significance` | enum: "low" \| "medium" \| "high" | Used for pacing |
| `reveals_npc_secret` | string \| null | Secret ID revealed when sealed |

---

## B7. CONSTANTS REFERENCE

Every hardcoded value used in gameplay.

### B7.1 Turn & Phase Timing

```javascript
const TURNS_PER_LOOP = 48;
const DAWN_END_TURN = 8;
const DAY_END_TURN = 24;
const DUSK_END_TURN = 32;
const NIGHT_SAFE_END_TURN = 40;
const NIGHT_DARK_END_TURN = 48;

const PHASE_ORDER = [
  "TITLE",
  "DAWN",
  "DAY",
  "DUSK",
  "NIGHT_SAFE",
  "NIGHT_DARK",
  "VISION",
  "ENDING"
];

const TURNS_PER_PHASE = {
  DAWN: 8,
  DAY: 16,
  DUSK: 8,
  NIGHT_SAFE: 8,
  NIGHT_DARK: 8
};
```

### B7.2 Currency Limits

```javascript
const INSIGHT_MAX = 100;
const INSIGHT_MIN = 0;
const RESONANCE_BANK_MAX = 50;
const RESONANCE_MIN = 0;
```

### B7.3 Insight Gain & Loss

```javascript
const INSIGHT_FIRST_CLUE = 5;
const INSIGHT_DIALOGUE_SUCCESS = 3;
const INSIGHT_HOTSPOT_DISCOVERY = 10;
const INSIGHT_THREAD_COMPLETE = 15;

const INSIGHT_DEATH_TAX_PERCENT = 25;  // 25% of current Insight lost on death
const INSIGHT_BETRAYAL_LOSS = 20;
```

### B7.4 Trust Thresholds (NPC Relationships)

```javascript
const NPC_TRUST_HOSTILE = 0;
const NPC_TRUST_WARY = 25;
const NPC_TRUST_GUARDED = 50;
const NPC_TRUST_OPEN = 75;
const NPC_TRUST_FULL = 100;

// Mood states based on trust
const TRUST_TO_MOOD = {
  [NPC_TRUST_HOSTILE]: "hostile",
  [NPC_TRUST_WARY]: "wary",
  [NPC_TRUST_GUARDED]: "guarded",
  [NPC_TRUST_OPEN]: "open",
  [NPC_TRUST_FULL]: "friendly"
};
```

### B7.5 Archetype Bonuses

```javascript
const ARCHETYPES = {
  SCHOLAR: {
    starting_insight: 70,
    starting_resonance: 10,
    insight_gain_multiplier: 1.1,
    trust_gain_multiplier: 1.0,
    description: "Knowledge seeker. Gains Insight faster."
  },
  SEEKER: {
    starting_insight: 50,
    starting_resonance: 15,
    insight_gain_multiplier: 0.9,
    trust_gain_multiplier: 1.2,
    description: "Social explorer. Gains trust faster, builds relationships easier."
  },
  OBSERVER: {
    starting_insight: 60,
    starting_resonance: 12,
    insight_gain_multiplier: 1.0,
    trust_gain_multiplier: 1.0,
    description: "Balanced. No bonuses, no penalties."
  },
  KEEPER: {
    starting_insight: 45,
    starting_resonance: 20,
    insight_gain_multiplier: 0.8,
    trust_gain_multiplier: 1.0,
    description: "Guardian. Starts with more Resonance for protection."
  }
};
```

### B7.6 Ending Thresholds

```javascript
const ENDING_ASCENSION_CORRUPTION_THRESHOLD = 0;
const ENDING_ASCENSION_INSIGHT_REQUIREMENT = 50;
const ENDING_ASCENSION_BETRAYALS_MAX = 0;

const ENDING_PARADOX_CORRUPTION_MAX = 0.3;
const ENDING_PARADOX_INSIGHT_MIN = 30;
const ENDING_PARADOX_BETRAYALS_MIN = 2;
const ENDING_PARADOX_BETRAYALS_MAX = 5;

const ENDING_VOID_CORRUPTION_MIN = 0.5;
const ENDING_VOID_REQUIRES_VAEL_AWAKENED = true;

const ENDING_CORRUPTION_CORRUPTION_MIN = 0.7;
const ENDING_CORRUPTION_TURNS_REMAINING_MAX = 0;
```

### B7.7 Corruption & Vael Mechanics

```javascript
const CORRUPTION_RATE_BASE = 0.01;  // % per turn in normal state
const CORRUPTION_RATE_NIGHT_DARK = 0.03;  // % per turn during NIGHT_DARK phase
const CORRUPTION_VISIBLE_THRESHOLD = 0.2;  // At 20%, visuals show corruption
const CORRUPTION_POINT_OF_NO_RETURN = 0.8;  // At 80%, certain endings are locked

const VAEL_AWAKENING_CORRUPTION_THRESHOLD = 0.3;
const VAEL_AWAKENING_TURN = 32;  // After DUSK phase ends
const VAEL_ATTACK_CORRUPTION_GAIN = 0.15;
```

### B7.8 Loop & Meta-Progression

```javascript
const MAX_LOOPS = 4;  // Game ends after 4 loops
const LOOP_RESET_INSIGHT = false;  // Insight doesn't carry over
const LOOP_RESET_TRUST = true;  // All NPC trust resets
const LOOP_RESET_LOCATIONS = true;  // All locations unexplored
const LOOP_RESET_FLAGS = true;  // Except loop_count and total_insight_earned

const UNLOCK_NEW_ARCHETYPE_AFTER_ENDINGS = 2;  // After seeing 2 different endings
const UNLOCK_HARD_MODE_AFTER_ENDINGS = 3;  // After seeing 3 endings
```

### B7.9 NPC-Specific Thresholds

```javascript
const MIRA_DEATH_CONDITION = {
  corruption_exceeds: 0.6,
  and_turns_remaining_less_than: 5,
  and_trust_orin_below: 40
};

const GHOST_KEEPER_APPEARS_WHEN = {
  loop_count_exceeds: 1,
  and_correlation_sequence_solved: true  // Orin's past revealed
};

const PHOSPHENE_APPEARS_WHEN = {
  corruption_exceeds: 0.5,
  and_night_dark_phase: true,
  and_void_threshold_crossed: false
};
```

### B7.10 UI & Display Constants

```javascript
const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 600;

const TEXT_COLOR_PRIMARY = "#c8c8d8";
const TEXT_COLOR_SECONDARY = "#787890";
const PANEL_BACKGROUND = "#0f0f1a";
const PANEL_BORDER = "#2a2a45";

const TYPEWRITER_CHARS_PER_SECOND = 20;
const FADE_TRANSITION_MS = 800;
const CARD_SEAL_FLASH_MS = 600;
const SCREEN_SHAKE_AMPLITUDE = 4;
const VIGNETTE_MAX_OPACITY = 0.3;
```

### B7.11 Dialogue & NPC Configuration

```javascript
const DIALOGUE_TIMEOUT_MS = 60000;  // 60 seconds before auto-exit dialogue
const DIALOGUE_OPTIONS_MAX = 4;  // Max player choices per dialogue node
const DIALOGUE_HISTORY_RETENTION = 100;  // Keep last 100 dialogue entries in log

const NPC_INTERACTION_TRUST_GAIN = 2;
const NPC_WRONG_CHOICE_TRUST_LOSS = 10;
const NPC_BETRAYAL_TRUST_LOSS = 30;
```

### B7.12 Timing & Animation

```javascript
const ANIMATION_FRAME_RATE = 60;  // Target 60 FPS
const TURN_DURATION_MS = 5000;  // 5 seconds per turn (for auto-advance)
const PARTICLE_LIFETIME_MS = 1200;  // Insight particles live for 1.2s
const SCREEN_FADE_MS = 800;
const TOAST_NOTIFICATION_MS = 3000;  // Toast notifications show for 3s
```

---

## B8. LOCALSTORAGE SPECIFICATION

### B8.1 Storage Key & Format

```javascript
const SAVE_STORAGE_KEY = "echoes_lighthouse_save";

// Serialization format
const SAVE_DATA = JSON.stringify(worldState);
localStorage.setItem(SAVE_STORAGE_KEY, SAVE_DATA);

// Deserialization
const savedData = localStorage.getItem(SAVE_STORAGE_KEY);
const worldState = JSON.parse(savedData);
```

### B8.2 Size Expectations

**Typical save file size: ~15–25 KB**

- Base structure + metadata: ~2 KB
- Journal entries (50–100 entries): ~8 KB
- NPC data (8 NPCs × ~1 KB): ~8 KB
- Location data (10 locations): ~2 KB
- Flags & misc: ~1 KB

**Maximum expected size: ~40 KB** (after 4 full loops with extensive journal)

### B8.3 Save Version & Migration Strategy

```javascript
const SAVE_FORMAT_VERSION = "1.0";

// On load, check version
function loadSave() {
  const savedData = JSON.parse(localStorage.getItem(SAVE_STORAGE_KEY));
  
  if (!savedData.version) {
    // Very old save, pre-version tracking
    migrate_v0_to_v1(savedData);
  }
  
  if (savedData.version === "1.0") {
    return savedData;  // Current version, no migration needed
  }
  
  if (savedData.version === "1.1") {
    // Future: migrate from 1.1 to 1.0 or forward to 1.1 depending on direction
    migrate_v1_1_to_v1_0(savedData);
  }
  
  return savedData;
}

function migrate_v0_to_v1(oldSave) {
  // Example: v0 didn't have the "meta" object
  const newSave = {
    version: "1.0",
    meta: {
      version: "1.0",
      created_at: oldSave.created_at || new Date().toISOString(),
      last_saved: new Date().toISOString()
    },
    ...oldSave
  };
  return newSave;
}
```

### B8.4 Auto-Save & Backup

```javascript
const AUTO_SAVE_INTERVAL_MS = 30000;  // Auto-save every 30 seconds
const BACKUP_SAVE_SLOTS = 3;  // Keep 3 backup saves

function autoSave() {
  // Rotate backups
  const backup3 = localStorage.getItem("echoes_lighthouse_save_backup_2");
  const backup2 = localStorage.getItem("echoes_lighthouse_save_backup_1");
  const backup1 = localStorage.getItem("echoes_lighthouse_save");
  
  if (backup2) localStorage.setItem("echoes_lighthouse_save_backup_3", backup2);
  if (backup1) localStorage.setItem("echoes_lighthouse_save_backup_2", backup1);
  
  // Save current
  localStorage.setItem("echoes_lighthouse_save", JSON.stringify(worldState));
  worldState.meta.last_saved = new Date().toISOString();
}

setInterval(autoSave, AUTO_SAVE_INTERVAL_MS);
```

---

## APPENDIX: Complete Example — Orin NPC Instance

**Static Definition:**
```json
{
  "npc_id": "orin",
  "name": "Orin",
  "title": "The Keeper",
  "portrait_ascii": "  [| |]\n  [|_|]\n  < | >\n   \\|/\n    |",
  "introduction": "An ancient figure guards the lighthouse archives with quiet intensity.",
  "bio": "Orin has served as Keeper for a very long time. His earliest memories are fragmented.",
  "personality_traits": ["stern", "protective", "haunted", "knowledgeable"],
  "starting_trust": 30,
  "base_mood": "guarded",
  "can_die": false,
  "can_betray": false,
  "available_secrets": ["secret_001_orin_long_life", "secret_002_vael_imprisonment"],
  "can_give_quests": true,
  "starting_quests": ["quest_001_explore_lighthouse"]
}
```

**Runtime Instance (from worldState):**
```json
{
  "npc_id": "orin",
  "name": "Orin",
  "title": "The Keeper",
  "trust_level": 65,
  "secrets_known": ["secret_001_orin_long_life"],
  "dialogue_state": "open_dialogue",
  "quest_stage": 2,
  "interactions_count": 7,
  "last_interaction_turn": 12,
  "mood": "guarded",
  "is_alive": true,
  "betrayal_flag": false
}
```

---

## APPENDIX: Complete Example — Insight Card #1

**Static Definition (Card Data):**
```json
{
  "insight_card_id": "insight_card_001",
  "card_number": 1,
  "title": "The lighthouse was built to trap",
  "description": "The lighthouse seems to have been constructed with imprisonment in mind, not guidance.",
  "lore_text": "Hidden within the oldest records: 'Vael was always here. The lighthouse was the seal.'",
  "required_clues": 3,
  "clue_ids": ["clue_001_discrepancy", "clue_003_ancient_ledger", "clue_007_stone_tablet"],
  "resonance_reward_on_seal": 10,
  "sets_flags_on_seal": ["betrayal_discovered"],
  "affects_ending_branches": ["PARADOX", "VOID"]
}
```

**Runtime Instance (in-progress):**
```json
{
  "id": "insight_card_001",
  "card_number": 1,
  "title": "The lighthouse was built to trap",
  "description": "The lighthouse seems to have been constructed with imprisonment in mind.",
  "required_clues": 3,
  "current_clues_found": 2,
  "clues_list": ["clue_001_discrepancy", "clue_003_ancient_ledger"],
  "status": "in_progress",
  "sealed_at_turn": null
}
```

**Runtime Instance (sealed):**
```json
{
  "id": "insight_card_001",
  "title": "The lighthouse was built to trap",
  "description": "The lighthouse was never a beacon — it was a seal.",
  "sealed_at_turn": 18,
  "sealed_by_clues": ["clue_001_discrepancy", "clue_003_ancient_ledger", "clue_007_stone_tablet"],
  "resonance_reward": 10
}
```

---

**END OF DOCUMENT B**

**Total Word Count (Both Documents): ~6,200 words**
