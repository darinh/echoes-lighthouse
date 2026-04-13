**Document ID:** EOTL-SPEC-001  
**Version:** 1.0.0  
**Status:** Implementation-Ready  
**Authors:** Architecture Team  
**Audience:** Engineers only. This document assumes fluency in JavaScript (ES2020+), browser APIs (Canvas 2D, Web Audio, localStorage), and game-loop architecture. No game design rationale is given; every statement is an engineering requirement.

---

## 1. Document Header

**Purpose:** Provide a fully unambiguous specification from which a single engineer can implement the complete game — "Echoes of the Lighthouse" — as a single self-contained HTML file with zero external dependencies. Every data structure, algorithm, state machine, and interface contract defined herein is normative.

**Constraints summary:** Single `.html` file. ES2020 strict mode. Target 5,000 LOC (±10%). No bundler. No libraries. No network calls. No audio files. No image files. Persistent state via `localStorage` only.

---

## 2. Architecture Overview

### 2.1 Text Block Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SINGLE HTML FILE                             │
│                                                                     │
│  ┌───────────┐   ┌────────────┐   ┌──────────────┐                 │
│  │  CONSTANTS │   │   UTILS    │   │  SAVE / LOAD  │                │
│  └─────┬─────┘   └─────┬──────┘   └──────┬───────┘                │
│        │               │                  │                         │
│  ┌─────▼───────────────▼──────────────────▼───────┐                │
│  │                 WORLD STATE                      │                │
│  │  (single source of truth — plain JS object)      │                │
│  └──┬──────────┬──────────┬───────────┬────────────┘               │
│     │          │          │           │                             │
│  ┌──▼──┐  ┌───▼──┐  ┌────▼───┐  ┌───▼──────────┐                  │
│  │ NPC │  │INSIGHT│  │JOURNAL │  │  TURN SYSTEM  │                  │
│  │SYS  │  │CARDS  │  │        │  │               │                  │
│  └──┬──┘  └───┬──┘  └────┬───┘  └───┬──────────┘                  │
│     └─────────┴──────────┴──────────┘                              │
│                      │                                              │
│  ┌────────────────────▼────────────────────────────┐               │
│  │              GAME STATE MACHINE                  │               │
│  │  MENU→INTRO→DAWN→DAY→DUSK→NIGHT→LOOP_END→...    │               │
│  └────────────┬────────────────────────────────────┘               │
│               │                                                     │
│  ┌────────────▼───────────────────────────────────┐                │
│  │                   RENDERER                      │                │
│  │  Canvas 2D — scene panel / sidebar / action bar │                │
│  └────────────┬───────────────────────────────────┘                │
│               │                                                     │
│  ┌────────────▼───────────────────────────────────┐                │
│  │              INPUT SYSTEM                       │                │
│  │  click → hit-test → action dispatch             │                │
│  └────────────────────────────────────────────────┘                │
│                                                                     │
│  ┌──────────────────────────────────────────────┐                   │
│  │              AUDIO SYSTEM                     │                   │
│  │  Web Audio API — synthesis only, no files     │                   │
│  └──────────────────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Module List

| Module Alias | Responsibility |
|---|---|
| `CONSTANTS` | All magic numbers, enums, string keys — zero runtime logic |
| `UTILS` | Pure helper functions: text wrap, clamp, RNG, deep-clone |
| `AUDIO` | Web Audio API bootstrap, sound event dispatch, ambient drone |
| `INPUT` | Event registration, click-region registry, keyboard dispatch |
| `RENDERER` | Canvas draw calls — all visual output funnels through here |
| `GAME_STATE` | State machine: current state, valid transitions, transition guards |
| `WORLD` | World state object definition, accessors, mutators |
| `NPC_SYSTEM` | NPC data, trust engine, secrets tracker |
| `DIALOGUE` | Dialogue tree loader, option filter, conversation runner |
| `INSIGHT_SYSTEM` | Card formation, sealing, flag propagation |
| `JOURNAL` | Entry management, thread tracking, sealed insight log |
| `ARCHIVE` | Permanent unlock store, Resonance-spend logic |
| `LOCATION` | Location data, hotspot interaction, movement cost |
| `NIGHT_PHASE` | Vision generator, consequence applier |
| `ENDING_SYSTEM` | Flag evaluator, ending trigger, epilogue renderer |
| `SAVE_LOAD` | Serialise/deserialise WORLD to localStorage |
| `UI_COMPONENTS` | Reusable Canvas drawing primitives (box, button, progress bar) |
| `SCREENS` | Per-state render orchestrators (menu, dawn, day, dusk, night, journal, archive, ending) |

### 2.3 Data Flow

```
DOM Event (click / keydown)
        │
        ▼
INPUT.handleEvent()
  → resolves (x, y) or key
  → hit-test against INPUT.clickRegions[]
  → emits ACTION object: { type, payload }
        │
        ▼
GAME_STATE.dispatch(action)
  → validates action against current state
  → calls WORLD mutator(s)
  → may transition state machine
  → calls SAVE_LOAD.save() if action is meaningful
        │
        ▼
RENDERER.requestRedraw()          AUDIO.playEvent(eventId)
  → sets dirty flags                → fires synthesis event
  → next rAF renders dirty regions
```

### 2.4 Single-File Code Structure

All code lives inside `<script type="module">` inside a single `.html`. The file is authored in logical blocks separated by `// ─── MODULE: NAME ───` banners. Variables and functions are lexically scoped within IIFEs or `const` blocks assigned to uppercase module names. There is no `import`/`export` — modules communicate through explicit object references bound at boot. Execution order:

1. CONSTANTS (no deps)
2. UTILS (no deps)
3. WORLD (depends CONSTANTS)
4. AUDIO (depends CONSTANTS)
5. INPUT (depends CONSTANTS, RENDERER)
6. RENDERER (depends CONSTANTS, UTILS, UI_COMPONENTS)
7. All game-logic modules (depend WORLD, CONSTANTS, UTILS)
8. SAVE_LOAD (depends WORLD)
9. GAME_STATE (depends all game-logic, RENDERER, AUDIO, SAVE_LOAD)
10. Boot call: `GAME_STATE.init()`

---

## 3. Rendering System

### 3.1 Canvas Setup

```javascript
const CANVAS = document.getElementById('c');
const CTX    = CANVAS.getContext('2d');

// Logical size (always this — layout defined in logical px)
const LOGICAL_W = 900;
const LOGICAL_H = 600;

function setupCanvas() {
  const dpr = window.devicePixelRatio || 1;
  CANVAS.width  = LOGICAL_W * dpr;
  CANVAS.height = LOGICAL_H * dpr;
  CANVAS.style.width  = LOGICAL_W + 'px';
  CANVAS.style.height = LOGICAL_H + 'px';
  CTX.scale(dpr, dpr);
}
```

`setupCanvas()` is called once at boot and again on `window.resize` (debounced 200 ms). All draw calls use logical coordinates. The DPR scale is transparent to all rendering code.

### 3.2 Layout Specification (Logical Pixels)

```
┌──────────────────────────────────────────────────┬──────────────────┐
│  SCENE PANEL                                      │   SIDEBAR         │
│  x:0  y:0  w:600  h:540                          │  x:620 y:0        │
│                                                  │  w:280 h:540      │
│  Sub-regions:                                    │                   │
│   SCENE_TITLE   x:10  y:10  w:580 h:28           │  Tabs:            │
│   SCENE_BODY    x:10  y:48  w:580 h:390           │   JOURNAL tab     │
│   DIALOGUE_BOX  x:0   y:300 w:600 h:240 (overlay)│   ARCHIVE tab     │
│                 (only when dialogue active)       │   QUESTS tab      │
│                                                  │   MAP tab         │
│                                                  │                   │
├──────────────────────────────────────────────────┴──────────────────┤
│  ACTION BAR                                                           │
│  x:0  y:548  w:900  h:52                                             │
│  Sub-regions:                                                         │
│   HUD_LEFT  x:4   y:552 w:280 h:44  (Insight, Resonance, Turns)     │
│   HUD_MID   x:300 y:552 w:300 h:44  (Location name, Time of Day)    │
│   HUD_RIGHT x:610 y:552 w:285 h:44  (action buttons contextual)     │
└───────────────────────────────────────────────────────────────────────┘

SEPARATOR lines:
  Vertical:   x=610, y=0 to y=548, lineWidth=2
  Horizontal: y=548, x=0 to x=900, lineWidth=2
```

### 3.3 Text Rendering Pipeline

All text is rendered via `RENDERER.drawText(ctx, text, x, y, opts)`.

```typescript
interface TextOpts {
  font:      string;     // full CSS font string e.g. '14px monospace'
  color:     string;     // hex string
  maxWidth:  number;     // wrap at this pixel width
  lineHeight:number;     // px between lines
  align:     'left'|'center'|'right';
  baseline:  'top'|'middle'|'alphabetic';
}
```

**Word-wrap algorithm:**

```javascript
function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    const test = current ? current + ' ' + word : word;
    if (ctx.measureText(test).width <= maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}
```

Scrollable text regions maintain a `scrollOffset` integer (line index). Scroll buttons (▲/▼) are rendered at fixed positions and registered as click regions.

### 3.4 Scene Description Rendering

Scene descriptions are rendered in `SCENE_BODY` using `font: '14px "Courier New", monospace'`, `color: PALETTE.text_primary`, `lineHeight: 20`, `maxWidth: 560`. A horizontal rule (`─` repeated 57 times) separates the scene heading from body copy. Hotspot items are rendered as `[ hotspot name ]` in `PALETTE.hotspot_idle` and change to `PALETTE.hotspot_hover` on mouse-over.

### 3.5 Dialogue Rendering

When `WORLD.ui.dialogue_active === true`, a `DIALOGUE_BOX` overlay is drawn:

1. Fill rect `(0, 300, 600, 240)` with `PALETTE.dialogue_bg` at 95% opacity.
2. Border: 1px `PALETTE.border_dim`.
3. Speaker label: `'14px sans-serif'`, bold, `PALETTE.npc_name`, at `(12, 308)`.
4. Dialogue text: wrapped at 576px, `'13px monospace'`, starting at `(12, 332)`.
5. Options: each option is a rect `(12, baseY + i*32, 576, 28)`. Background: `PALETTE.option_idle`; on hover `PALETTE.option_hover`. Text: `'12px monospace'`, `PALETTE.text_primary`. Greyed-out (unaffordable) options: `PALETTE.text_disabled`. Prepend `[i+1] ` index glyph.

### 3.6 Journal Rendering

Sidebar shows Journal by default. Four tabs along top of sidebar: **JOURNAL | ARCHIVE | QUESTS | MAP**. Active tab underlined with `PALETTE.accent`.

Journal tab body:
- Active threads: rendered as `▶ thread title` in `PALETTE.thread_active`.
- Resolved threads: `✓ thread title` in `PALETTE.thread_resolved`.
- Sealed Insight count: `⬡ N Insights Sealed` badge.
- Scrollable; max 6 entries visible at once.

### 3.7 HUD Rendering

```
HUD_LEFT:   ◆ Insight: [bar 80px] NNN/150    ◈ Resonance: NNN/200
HUD_MID:    📍 LOCATION_NAME          ☀ TIME_OF_DAY
HUD_RIGHT:  [JOURNAL] [ARCHIVE] [SEAL] [END TURN] — contextual
```

- Insight bar: filled rect ratio = `insight / 150`. Color: `PALETTE.insight_fill`.
- Resonance: numeric only (no bar). Color: `PALETTE.resonance_text`.
- Turn counter on HUD_RIGHT: `Turn NN/30`. Red when ≥ 25.

### 3.8 Color Palette (All Hex Values)

```javascript
const PALETTE = {
  bg_primary:       '#0d0f1a',   // canvas fill / scene background
  bg_secondary:     '#13162a',   // sidebar background
  bg_dialogue:      '#0a0d1f',   // dialogue overlay
  border_bright:    '#4a6fa5',   // active borders
  border_dim:       '#1f2b45',   // inactive borders
  text_primary:     '#c8d8e8',   // body text
  text_secondary:   '#7a99b8',   // secondary/label text
  text_disabled:    '#3a4a5a',   // greyed-out options
  text_highlight:   '#f0e68c',   // highlighted discoveries
  accent:           '#5bc8af',   // active tab, selected state
  accent_warm:      '#e8935a',   // warnings, dusk timer
  accent_danger:    '#c0392b',   // danger states, low turns
  npc_name:         '#a78bfa',   // NPC speaker labels
  hotspot_idle:     '#5bc8af',   // interactable hotspots
  hotspot_hover:    '#ffffff',   // hovered hotspot
  option_idle:      '#0f1830',   // dialogue option background
  option_hover:     '#1e2d50',   // dialogue option hover
  option_border:    '#2a3f6f',   // dialogue option border
  insight_fill:     '#5bc8af',   // insight bar fill
  insight_bg:       '#1a2a3a',   // insight bar background
  resonance_text:   '#ffd700',   // resonance value text
  thread_active:    '#f0e68c',   // active journal thread
  thread_resolved:  '#4a6a4a',   // resolved journal thread
  card_sealed:      '#a78bfa',   // sealed insight card badge
  card_forming:     '#5bc8af',   // forming card indicator
  night_overlay:    '#00000088', // night phase vignette
  dawn_tint:        '#1a120800', // dawn warm tint (transparent)
};
```

### 3.9 Dirty-Rect Optimization

The renderer maintains a `DIRTY` flags object:

```javascript
const DIRTY = {
  scene:      true,   // SCENE_PANEL — scene description, hotspots
  dialogue:   false,  // DIALOGUE_BOX overlay
  sidebar:    true,   // SIDEBAR — journal/archive/map tabs
  hud:        true,   // ACTION_BAR — all HUD elements
  full:       false,  // force full repaint (state transitions)
};
```

Rules:
- Turn counter change → `hud = true`.
- Dialogue open/close → `dialogue = true`, `scene = true`.
- Moving locations → `scene = true`, `hud = true`.
- Sealing card → `sidebar = true`, `hud = true`.
- State transition → `full = true` (clears all, repaints all).

### 3.10 Frame Loop

```javascript
function gameLoop(timestamp) {
  if (DIRTY.full) {
    CTX.fillStyle = PALETTE.bg_primary;
    CTX.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
    RENDERER.drawSeparators();
    DIRTY.scene = DIRTY.dialogue = DIRTY.sidebar = DIRTY.hud = true;
    DIRTY.full = false;
  }
  if (DIRTY.scene)    { RENDERER.drawScenePanel();   DIRTY.scene    = false; }
  if (DIRTY.sidebar)  { RENDERER.drawSidebar();       DIRTY.sidebar  = false; }
  if (DIRTY.hud)      { RENDERER.drawHUD();           DIRTY.hud      = false; }
  if (DIRTY.dialogue) { RENDERER.drawDialogue();      DIRTY.dialogue = false; }
  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
```

No game logic runs inside `gameLoop`. It is render-only. Logic runs synchronously in response to input events, then sets dirty flags.

---

## 4. Input System

### 4.1 Event Listeners

```javascript
CANVAS.addEventListener('click',     INPUT.onClick);
CANVAS.addEventListener('mousemove', INPUT.onMouseMove);
document.addEventListener('keydown', INPUT.onKeyDown);
```

`touchstart` is mapped to `click` for future mobile support but is not primary.

### 4.2 Click Region Registry

```javascript
// Region entry shape
interface ClickRegion {
  id:       string;        // unique identifier
  x: number; y: number; w: number; h: number;  // logical px AABB
  action:   ActionType;   // dispatched on hit
  payload:  any;          // attached data
  states:   GameStateId[]; // valid in these game states only ([] = all)
  enabled:  boolean;       // can be toggled at runtime
}

const INPUT = {
  clickRegions: [] as ClickRegion[],

  register(region: ClickRegion): void {
    // Replace existing region with same id
    this.clickRegions = this.clickRegions.filter(r => r.id !== region.id);
    this.clickRegions.push(region);
  },

  clear(prefix?: string): void {
    if (prefix) this.clickRegions = this.clickRegions.filter(r => !r.id.startsWith(prefix));
    else        this.clickRegions = [];
  },

  onClick(e: MouseEvent): void {
    const rect = CANVAS.getBoundingClientRect();
    const scaleX = LOGICAL_W / rect.width;
    const scaleY = LOGICAL_H / rect.height;
    const lx = (e.clientX - rect.left) * scaleX;
    const ly = (e.clientY - rect.top)  * scaleY;
    for (const region of INPUT.clickRegions) {
      if (!region.enabled) continue;
      if (region.states.length && !region.states.includes(GAME_STATE.current)) continue;
      if (lx >= region.x && lx <= region.x + region.w &&
          ly >= region.y && ly <= region.y + region.h) {
        GAME_STATE.dispatch({ type: region.action, payload: region.payload });
        return; // first match wins (regions must not overlap)
      }
    }
  },
};
```

Hover state is tracked separately: `INPUT.hoverRegionId` updated in `onMouseMove`. Renderer reads this to apply hover styles.

### 4.3 Keyboard Shortcuts

| Key | Action | Valid States |
|---|---|---|
| `1`–`8` | Select dialogue option N | `DAY` (dialogue active) |
| `J` | Toggle Journal sidebar tab | `DAY`, `DAWN`, `DUSK` |
| `A` | Toggle Archive sidebar tab | any |
| `M` | Toggle Map sidebar tab | `DAY`, `DAWN` |
| `Escape` | Close dialogue / cancel seal | `DAY` |
| `Enter` | Confirm selected action | `DAY`, `DAWN` |
| `ArrowUp`/`ArrowDown` | Scroll active text region | any |
| `S` | Force save | any |

### 4.4 Input State Machine

```
State       | Valid Input Classes
────────────┬──────────────────────────────────────────────────────
MENU        | click(start_new_game), click(load_game), click(archetype_N)
INTRO       | click(continue), keydown(Enter)
DAWN        | click(journal_entry), click(begin_day), keydown(Enter)
DAY         | click(hotspot_N), click(npc_N), click(exit_N),
            | click(dialogue_option_N), keydown(1-8),
            | click(seal_card), click(tab_N), scroll events
DUSK        | click(lighthouse_component_N), click(attempt_repair), click(skip)
NIGHT       | click(continue_vision), click(dismiss), keydown(Enter)
LOOP_END    | click(acknowledge), keydown(Enter)
ENDING      | click(restart), click(main_menu), keydown(Enter)
JOURNAL     | scroll, click(thread_N), click(close)
ARCHIVE     | click(unlock_N), click(close)
```

---

## 5. Game State Machine

### 5.1 All States

```javascript
const GAME_STATES = {
  MENU:      'MENU',       // Title screen, archetype select
  INTRO:     'INTRO',      // First-run lore exposition (loop 1 only)
  DAWN:      'DAWN',       // Start-of-day journal review, planning
  DAY:       'DAY',        // Main exploration phase (turn-based)
  DUSK:      'DUSK',       // Lighthouse repair attempt
  NIGHT:     'NIGHT',      // Vision or consequence sequence
  LOOP_END:  'LOOP_END',   // Brief recap before next dawn
  ENDING:    'ENDING',     // Final ending screen
  JOURNAL:   'JOURNAL',    // Full-screen journal overlay (from any state)
  ARCHIVE:   'ARCHIVE',    // Full-screen archive overlay (from any state)
};
```

### 5.2 Transition Table

```
FROM        → TO          TRIGGER
──────────────────────────────────────────────────────────────────────
MENU        → INTRO       New game selected AND loop_count == 0
MENU        → DAWN        Load game selected AND save exists AND loop_count > 0
MENU        → DAY         Load game selected AND save mid-day (day_in_progress)
INTRO       → DAWN        Player clicks Continue after lore
DAWN        → DAY         Player clicks "Begin Day" action
DAY         → DUSK        turn_count >= 25 AND !at_lighthouse
DAY         → DUSK        Player clicks "Return to Lighthouse" with turns ≤ 5 remaining
DAY         → JOURNAL     Player opens Journal (overlay; previous state pushed to stack)
DAY         → ARCHIVE     Player opens Archive (overlay; previous state pushed to stack)
DAY         → ENDING      ENDING_SYSTEM.checkFlags() returns a valid ending ID
DUSK        → NIGHT       Repair attempt resolved (success or fail)
DUSK        → NIGHT       turn_count >= 30 (auto-advance)
NIGHT       → LOOP_END    All vision/consequence sequences dismissed
LOOP_END    → DAWN        Player acknowledges recap (loop_count++ triggers here)
LOOP_END    → ENDING      ENDING_SYSTEM.checkFlags() returns valid (checked again post-loop)
ENDING      → MENU        Player clicks Main Menu
JOURNAL     → [prev]      Player closes Journal overlay
ARCHIVE     → [prev]      Player closes Archive overlay
```

State stack for overlays: `GAME_STATE.stateStack = []`. Push on JOURNAL/ARCHIVE open; pop on close.

### 5.3 Transition Handlers

Each transition fires `GAME_STATE.onExit(fromState)` then `GAME_STATE.onEnter(toState)`.

**`onEnter(DAWN)`:**  
- Reset `WORLD.loop.turn_count = 0`.  
- Reset all loop-resetting fields (see §7.3).  
- Populate today's NPC schedules.  
- Clear `INPUT.clickRegions` with prefix `'day_'`.  
- Set `DIRTY.full = true`.  
- Call `SAVE_LOAD.save()`.

**`onEnter(DAY)`:**  
- Register hotspot/exit/NPC click regions for current location.  
- Set `DIRTY.scene = true`.

**`onEnter(DUSK)`:**  
- Compute available repair components in `WORLD.player.inventory`.  
- Set `DIRTY.full = true`.  
- Start dusk ambient audio.

**`onEnter(NIGHT)`:**  
- Evaluate `lighthouse_lit` flag.  
- If lit: generate vision sequence via `NIGHT_PHASE.generateVision()`.  
- If dark: apply consequences via `NIGHT_PHASE.applyConsequences()`.  
- Set `DIRTY.full = true`.

**`onEnter(LOOP_END)`:**  
- Increment `WORLD.journal.loop_count`.  
- Award Resonance from loop results.  
- Snapshot loop summary for display.  
- Call `SAVE_LOAD.save()`.

---

## 6. Turn System

### 6.1 Turn Counter

```javascript
// Stored in WORLD.loop (resets each loop)
WORLD.loop.turn_count:   number = 0;  // current turn
WORLD.loop.turn_max:     number = 30; // modified by Archives
WORLD.loop.dusk_trigger: number = 25; // modified by Archives
```

### 6.2 Action Costs (Complete List)

| Action | Turn Cost |
|---|---|
| Move to adjacent location | 1 |
| Move to non-adjacent location (map shortcut) | 2 |
| Examine hotspot (first time) | 1 |
| Examine hotspot (subsequent) | 0 |
| Speak to NPC (open dialogue) | 1 |
| Each dialogue option selected | 0 |
| Use item on hotspot | 1 |
| Attempt to seal Insight Card | 1 |
| Rest at cottage | 2 (restores 15 Insight) |
| Search hidden area (requires Archive "Night Walker") | 1 |
| Fast-travel to Lighthouse (Archive unlock) | 1 flat cost, ignores distance |

### 6.3 Dusk Trigger

```javascript
function advanceTurn(cost = 1) {
  WORLD.loop.turn_count += cost;
  if (WORLD.loop.turn_count >= WORLD.loop.dusk_trigger &&
      !WORLD.loop.dusk_warned) {
    WORLD.loop.dusk_warned = true;
    RENDERER.showAlert('The sun begins to set. Return to the lighthouse.');
    DIRTY.hud = true;
  }
  if (WORLD.loop.turn_count >= WORLD.loop.turn_max) {
    GAME_STATE.transition(GAME_STATES.DUSK);
    return;
  }
  if (WORLD.loop.turn_count >= WORLD.loop.dusk_trigger &&
      WORLD.player.location_id === 'lighthouse') {
    GAME_STATE.transition(GAME_STATES.DUSK);
    return;
  }
  DIRTY.hud = true;
  SAVE_LOAD.save();
}
```

### 6.4 Archive Turn Modifications

| Archive ID | Effect |
|---|---|
| `extra_turns_i` | `turn_max += 3`, `dusk_trigger += 3` |
| `extra_turns_ii` | `turn_max += 3` (stacks with above) |
| `night_walker` | Adds 5 post-night turns usable only in certain locations |
| `cartographer` | No turn change; adds clue hints to map render |
| `fast_travel` | Reduces lighthouse travel cost to 1 always |

Archive modifications are re-applied at every `onEnter(DAWN)` after resets.

---

## 7. World State Object — Complete Specification

### 7.1 Full Schema

```javascript
const WORLD = {
  // ── PLAYER ─────────────────────────────────────────────────────────
  player: {
    archetype:        'WITNESS' | 'CONFESSOR' | 'SCHOLAR',  // set once, never resets
    insight:          0,          // integer 0–150; loop-resetting
    insight_max:      150,        // modified by loop events
    resonance:        0,          // integer 0–200; persistent
    resonance_cap:    200,        // permanent
    location_id:      'cottage',  // current location; loop-resetting
    inventory:        [],         // string[] of item IDs; loop-resetting
    insight_spent:    0,          // total this loop; loop-resetting
    insight_earned:   0,          // total this loop; loop-resetting
  },

  // ── LOOP ───────────────────────────────────────────────────────────
  loop: {
    turn_count:       0,          // 0–30; resets each loop
    turn_max:         30,         // modified by Archives
    dusk_trigger:     25,         // modified by Archives
    dusk_warned:      false,      // loop-resetting bool
    lighthouse_lit:   false,      // was lighthouse lit THIS loop? loop-resetting
    day_in_progress:  false,      // true between DAWN and LOOP_END
  },

  // ── JOURNAL (all persistent) ────────────────────────────────────────
  journal: {
    loop_count:       0,          // total completed loops; PERSISTENT
    entries:          [],         // JournalEntry[]; PERSISTENT
    active_threads:   [],         // string[] thread IDs; PERSISTENT
    resolved_threads: [],         // string[] thread IDs; PERSISTENT
    sealed_insights:  [],         // SealedInsight[]; PERSISTENT
    visited_locations:[],         // string[] location IDs; PERSISTENT
    discovered_facts: [],         // string[] fact IDs; PERSISTENT
  },

  // ── NPC STATES (all persistent) ─────────────────────────────────────
  npcs: {
    // Keyed by NPC ID. All 15 defined (abbreviated to 3 here for space).
    maren: {
      trust:            0,        // 0–100; PERSISTENT
      known_secrets:    [],       // string[] secret IDs; PERSISTENT
      dialogue_state:   {},       // { [nodeId]: boolean }; PERSISTENT
      quest_state:      'NONE',   // 'NONE'|'ACTIVE'|'COMPLETE'; PERSISTENT
      location_history: [],       // loop-resetting (current loop positions)
    },
    vael: {
      trust:            0,
      known_secrets:    [],
      dialogue_state:   {},
      quest_state:      'NONE',
      fed_count:        0,        // PERSISTENT — feeds into ending flag
      pact_accepted:    false,    // PERSISTENT
      offered_freedom:  false,    // PERSISTENT
    },
    silas: {
      trust:            0,
      known_secrets:    [],
      dialogue_state:   {},
      quest_state:      'NONE',
    },
    // … 12 more NPCs follow identical shape …
  },

  // ── LOCATION STATES ─────────────────────────────────────────────────
  locations: {
    // Keyed by location ID. 10 locations.
    cottage: {
      visited:          false,    // PERSISTENT (first visit)
      hotspots_found:   [],       // string[]; PERSISTENT
      events_triggered: [],       // string[] event IDs; PERSISTENT (permanent events)
      loop_events_done: [],       // string[] event IDs; loop-resetting
    },
    lighthouse:  { /* same shape */ },
    cove:        { /* same shape */ },
    forest_path: { /* same shape */ },
    village:     { /* same shape */ },
    old_mill:    { /* same shape */ },
    cliff_top:   { /* same shape */ },
    ruins:       { /* same shape */ },
    grotto:      { /* same shape */ },
    beacon_room: { /* same shape */ },
  },

  // ── ENDING FLAGS (all persistent) ───────────────────────────────────
  flags: {
    lighthouse_lit_count:      0,      // increments each loop lighthouse is lit
    vael_fed_count:            0,      // increments each loop Vael is fed
    spirits_freed:             0,      // count of individual spirits freed (0–5)
    vael_pact_accepted:        false,
    vael_offered_freedom:      false,
    all_7_key_insights_sealed: false,  // computed, not set directly
    mechanism_dismantled:      false,
    all_npc_quests_complete:   false,  // computed
    // 7 key insight IDs that must all be sealed:
    key_insight_ids: [
      'light_source_truth',
      'vael_origin',
      'keeper_betrayal',
      'spirit_binding',
      'mechanism_purpose',
      'island_history',
      'final_signal',
    ],
  },

  // ── UI STATE ────────────────────────────────────────────────────────
  ui: {
    sidebar_tab:        'JOURNAL',   // 'JOURNAL'|'ARCHIVE'|'QUESTS'|'MAP'; not persisted
    dialogue_active:    false,       // not persisted
    active_dialogue:    null,        // current DialogueState | null; not persisted
    scene_scroll:       0,           // scroll offset for scene text; not persisted
    journal_scroll:     0,           // scroll offset for journal; not persisted
    pending_card:       null,        // InsightCard being formed; not persisted
    alert_message:      null,        // transient alert string; not persisted
    alert_timer:        0,           // frames remaining; not persisted
  },

  // ── ARCHIVE UNLOCKS (persistent) ────────────────────────────────────
  archive: {
    unlocked: [],                    // string[] of archive IDs; PERSISTENT
    resonance_spent: 0,              // PERSISTENT total
  },
};
```

### 7.2 NPC Full List (15 NPCs)

| ID | Name | Role |
|---|---|---|
| `maren` | Maren | Keeper's daughter, early ally |
| `vael` | Vael | Ancient entity, central antagonist |
| `silas` | Silas | Fisherman, knows the coast |
| `petra` | Petra | Village elder, holds secrets |
| `dov` | Dov | Lighthouse mechanic, critical for repairs |
| `thalia` | Thalia | Herbalist, trades components |
| `rudd` | Rudd | Smuggler, access to shortcuts |
| `sera` | Sera | Child spirit, first freed spirit |
| `oren` | Oren | Priest, ritual knowledge |
| `cal` | Cal | Former keeper, now reclusive |
| `ina` | Ina | Innkeeper, rumour hub |
| `bram` | Bram | Blacksmith, crafts repair tools |
| `ysel` | Ysel | Fishwife, knows Vael's feeding pattern |
| `ghost_keeper` | The Keeper | Vision-only NPC, appears in night sequences |
| `mirror_self` | The Echo | Vision-only NPC (player's reflection) |

### 7.3 Loop-Persistent vs Loop-Resetting Fields

**PERSIST across loops (never reset):**
- `player.archetype`, `player.resonance`, `player.resonance_cap`
- All of `journal.*`
- All of `npcs.*.trust`, `npcs.*.known_secrets`, `npcs.*.dialogue_state`, `npcs.*.quest_state`
- `npcs.vael.fed_count`, `npcs.vael.pact_accepted`, `npcs.vael.offered_freedom`
- All of `locations.*.visited`, `locations.*.hotspots_found`, `locations.*.events_triggered`
- All of `flags.*`
- All of `archive.*`

**RESET each loop (`onEnter(DAWN)`):**
- `player.insight = 0`, `player.inventory = []`, `player.location_id = 'cottage'`
- `player.insight_spent = 0`, `player.insight_earned = 0`
- `loop.turn_count = 0`, `loop.dusk_warned = false`, `loop.lighthouse_lit = false`
- `loop.day_in_progress = false`
- `locations.*.loop_events_done = []`
- `npcs.*.location_history = []`
- `ui.*` (all UI state)

**Computed flags (recomputed on every save):**
```javascript
function recomputeFlags() {
  const sealed = WORLD.journal.sealed_insights.map(s => s.card_id);
  WORLD.flags.all_7_key_insights_sealed =
    WORLD.flags.key_insight_ids.every(id => sealed.includes(id));
  WORLD.flags.all_npc_quests_complete =
    Object.values(WORLD.npcs).every(n => n.quest_state !== 'ACTIVE');
}
```

---

## 8. NPC & Dialogue System

### 8.1 Dialogue Tree Data Structure

```javascript
// Full type definition
interface DialogueTree {
  npc_id:   string;
  nodes:    { [nodeId: string]: DialogueNode };
  root:     string;   // starting nodeId
}

interface DialogueNode {
  id:       string;
  speaker:  string;                 // 'NPC_NAME' or 'PLAYER'
  text:     string;                 // displayed text
  options:  DialogueOption[];       // player choices (empty = auto-advance)
  on_enter: SideEffect[];           // fired when node is reached
  auto_next:string | null;          // next node if no options (NPC monologue)
}

interface DialogueOption {
  id:           string;
  text:         string;             // option display text
  next_node:    string | null;      // null = end conversation
  requires:     OptionRequirement;
  on_select:    SideEffect[];       // effects when option chosen
  hidden_if_unmet: boolean;         // true = hidden; false = shown greyed
}

interface OptionRequirement {
  min_trust?:        number;        // NPC trust threshold
  insight_cost?:     number;        // deducted if selected
  sealed_insight?:   string;        // card_id that must be sealed
  item?:             string;        // item_id in inventory
  archive?:          string;        // archive_id that must be unlocked
  flag?:             string;        // world flag key that must be truthy
}

interface SideEffect {
  type:    'GAIN_INSIGHT' | 'GAIN_RESONANCE' | 'ADD_FACT' | 'MODIFY_TRUST'
           | 'ADD_SECRET' | 'SET_FLAG' | 'ADD_ITEM' | 'UNLOCK_THREAD'
           | 'TRIGGER_EVENT';
  payload: any;
}
```

### 8.2 Dialogue Option Filtering

```javascript
function filterOptions(options, npcId) {
  const npc = WORLD.npcs[npcId];
  return options.filter(opt => {
    const r = opt.requires;
    const met =
      (!r.min_trust        || npc.trust >= r.min_trust)                         &&
      (!r.insight_cost     || WORLD.player.insight >= r.insight_cost)            &&
      (!r.sealed_insight   || WORLD.journal.sealed_insights.some(s => s.card_id === r.sealed_insight)) &&
      (!r.item             || WORLD.player.inventory.includes(r.item))           &&
      (!r.archive          || WORLD.archive.unlocked.includes(r.archive))        &&
      (!r.flag             || WORLD.flags[r.flag]);
    if (!met && opt.hidden_if_unmet) return false;
    return true; // shown greyed if !met && !hidden
  });
}
```

### 8.3 Trust Modification

```javascript
function modifyTrust(npcId, delta) {
  const npc = WORLD.npcs[npcId];
  npc.trust = Math.max(0, Math.min(100, npc.trust + delta));
  // Archetype modifier
  if (WORLD.player.archetype === 'CONFESSOR') {
    if (delta > 0) npc.trust = Math.min(100, npc.trust + Math.ceil(delta * 0.15));
  }
  DIRTY.sidebar = true;
}
```

Trust changes persist. Standard deltas: friendly answer +5, secret shared +10, betrayal -20, gift +8, Insight option (costs currency) +12.

### 8.4 Known Secrets & Conversation End

A secret is added to `npc.known_secrets` via `SideEffect { type: 'ADD_SECRET', payload: secretId }`. Secrets gate future dialogue nodes by appearing in `OptionRequirement.flag` lookups (stored as `npc_${npcId}_secret_${secretId}`).

On conversation end:
1. Fire `on_exit` side effects if defined on final node.
2. Call `advanceTurn(1)`.
3. Check for Insight Card formation via `INSIGHT_SYSTEM.checkFormation()`.
4. Set `WORLD.ui.dialogue_active = false`.
5. Set `DIRTY.scene = true`, `DIRTY.sidebar = true`.
6. Call `SAVE_LOAD.save()`.

---

## 9. Insight Card System

### 9.1 Card Formation Trigger

Card formation is checked after every: fact discovery, NPC secret reveal, hotspot examination, puzzle solve. The function `INSIGHT_SYSTEM.checkFormation()` scans all card definitions against `WORLD.journal.discovered_facts` and `WORLD.npcs.*.known_secrets`.

```javascript
interface CardDefinition {
  id:           string;
  title:        string;
  description:  string;
  required_facts:   string[];     // ALL must be in discovered_facts
  required_secrets: string[];     // ALL must be in any npc.known_secrets
  seal_cost_base:   number;       // 25–75 Insight
  world_effects:    WorldEffect[];// applied on seal
  archetype_discount: {           // Scholar gets -10
    SCHOLAR: 10,
    WITNESS: 0,
    CONFESSOR: 0,
  };
}

interface WorldEffect {
  type:    'SET_FLAG' | 'UNLOCK_LOCATION' | 'MODIFY_NPC_DIALOGUE' | 'ADD_THREAD';
  target:  string;
  value:   any;
}
```

When all requirements of a `CardDefinition` are met and the card is not already sealed or forming:
- Set `WORLD.ui.pending_card = { card_id, title, cost }`.
- Show formation notification in scene panel.
- Register "Seal Now" and "Seal Later" click regions.

### 9.2 Card Data Structure (Sealed)

```javascript
interface SealedInsight {
  card_id:      string;
  title:        string;
  sealed_loop:  number;   // loop_count when sealed
  insight_cost: number;   // actual cost paid
  effects_applied: WorldEffect[];
}
```

### 9.3 Sealing Process

```javascript
function sealCard(cardDef) {
  const cost = Math.max(0,
    cardDef.seal_cost_base -
    (WORLD.player.archetype === 'SCHOLAR' ? 10 : 0)
  );
  if (WORLD.player.insight < cost) {
    RENDERER.showAlert('Insufficient Insight to seal this card.');
    return false;
  }
  WORLD.player.insight -= cost;
  WORLD.player.insight_spent += cost;

  // Award Resonance
  const resonanceGain = Math.floor(cost * 0.4);
  WORLD.player.resonance = Math.min(WORLD.player.resonance_cap,
    WORLD.player.resonance + resonanceGain);

  // Apply world effects
  for (const effect of cardDef.world_effects) {
    applyWorldEffect(effect);
  }

  const sealed = {
    card_id: cardDef.id,
    title: cardDef.title,
    sealed_loop: WORLD.journal.loop_count,
    insight_cost: cost,
    effects_applied: cardDef.world_effects,
  };
  WORLD.journal.sealed_insights.push(sealed);
  WORLD.ui.pending_card = null;
  recomputeFlags();
  advanceTurn(1);
  SAVE_LOAD.save();
  AUDIO.playEvent('card_seal');
  DIRTY.sidebar = true; DIRTY.hud = true;
  return true;
}
```

### 9.4 Sealed Insight Propagation

After sealing, effects propagate automatically because dialogue option filters and location access checks read from `WORLD.flags` and `WORLD.journal.sealed_insights` dynamically. No explicit "refresh" is needed — all reads are live.

---

## 10. Save/Load System

### 10.1 localStorage Key and Structure

Key: `"echoes_save"` (single key, entire game state as JSON).

```javascript
interface SaveFile {
  version:    string;    // semver e.g. "1.0.0"
  saved_at:   number;    // Date.now() timestamp
  world:      WorldState; // serialised WORLD minus ui.*
}
```

`ui.*` is never persisted (always reconstructed on load).

### 10.2 Save Triggers

Every meaningful action triggers a save. Complete list:

- Any dialogue option selected
- Any hotspot examined (first time)
- Any location move
- Any item picked up
- Any Insight Card sealed
- Any NPC trust change
- Any Archive unlock purchased
- Loop start (`onEnter(DAWN)`)
- Loop end (`onEnter(LOOP_END)`)
- Night phase consequences applied
- Lighthouse lit/not lit result
- `keydown('S')` manual save
- Ending triggered

### 10.3 Load Process (Boot Sequence)

```javascript
function boot() {
  setupCanvas();
  AUDIO.init();
  INPUT.init();
  const raw = localStorage.getItem('echoes_save');
  if (raw) {
    try {
      const save = JSON.parse(raw);
      SAVE_LOAD.migrate(save);
      SAVE_LOAD.applyToWorld(save.world);
      GAME_STATE.transition(
        save.world.loop.day_in_progress ? GAME_STATES.DAWN : GAME_STATES.MENU
      );
    } catch (e) {
      console.warn('Save corrupted, starting fresh.', e);
      SAVE_LOAD.resetWorld();
      GAME_STATE.transition(GAME_STATES.MENU);
    }
  } else {
    SAVE_LOAD.resetWorld();
    GAME_STATE.transition(GAME_STATES.MENU);
  }
  requestAnimationFrame(gameLoop);
}
```

### 10.4 Corruption Handling

If `JSON.parse` throws, or if any required top-level key (`player`, `journal`, `npcs`, `flags`, `archive`) is missing, the save is considered corrupted. The player is shown: *"Your save could not be loaded. Starting a new journey."* A corrupted save is NOT deleted — it is archived under key `"echoes_save_corrupted_[timestamp]"` for debugging.

### 10.5 Save Migration

```javascript
const MIGRATIONS = {
  '1.0.0': (save) => save,  // baseline
  // Future patches add migration functions here:
  // '1.1.0': (save) => { save.world.flags.new_flag = false; return save; },
};

function migrate(save) {
  const versions = Object.keys(MIGRATIONS).sort();
  let current = save.version || '1.0.0';
  for (const v of versions) {
    if (v > current) {
      save = MIGRATIONS[v](save);
      save.version = v;
    }
  }
  return save;
}
```

---

## 11. Audio System

### 11.1 Web Audio API Setup

```javascript
const AUDIO = (() => {
  let ctx = null;
  let masterGain = null;
  let ambientNode = null;

  function init() {
    // AudioContext created on first user gesture to comply with autoplay policy
    document.addEventListener('click', function initCtx() {
      if (ctx) return;
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.6;
      masterGain.connect(ctx.destination);
      startAmbient('dawn');
      document.removeEventListener('click', initCtx);
    }, { once: false });
  }

  return { init, playEvent, startAmbient, stopAmbient, setVolume };
})();
```

### 11.2 Sound Event List

| Event ID | Description | Oscillator | Frequency | Envelope (A/D/S/R ms) |
|---|---|---|---|---|
| `ui_click` | Button click | sine | 660 Hz | 0/30/0/50 |
| `ui_hover` | Hover over region | sine | 440 Hz, gain 0.1 | 0/20/0/30 |
| `dialogue_open` | Conversation start | triangle | 220→330 sweep | 10/200/0/100 |
| `dialogue_close` | Conversation end | triangle | 330→220 sweep | 10/200/0/100 |
| `insight_gain` | Insight earned | sine | 528 Hz | 10/100/0.3/300 |
| `card_form` | Insight Card forming | sawtooth→sine | 396→528 | 50/400/0.4/500 |
| `card_seal` | Card sealed | sine chord | 528+660+792 Hz | 20/50/0.6/800 |
| `trust_up` | Trust increase | sine | 396 Hz | 0/150/0/200 |
| `trust_down` | Trust decrease | square | 220 Hz, gain 0.3 | 0/100/0/150 |
| `lighthouse_lit` | Lighthouse success | sine sweep up | 220→880 | 100/1000/0.8/2000 |
| `lighthouse_fail` | Lighthouse fail | sawtooth | 110 Hz | 0/500/0.2/1000 |
| `vision_start` | Night vision begins | sine, reverb-like | 165 Hz | 500/2000/0.5/1000 |
| `consequence` | Dark consequence | square | 55 Hz | 0/300/0.4/500 |
| `archive_unlock` | Archive purchased | sine arpeggio | 264/330/396/528 | 10/80/0/80 each |
| `ending_trigger` | Ending reached | all-oscillator chord | specific per ending | 200/3000/0.7/3000 |
| `turn_advance` | Turn ticks | sine | 330 Hz, gain 0.05 | 0/10/0/20 |
| `alert` | Alert notification | square | 880 Hz | 0/50/0/100 |

### 11.3 Sound Synthesis Helper

```javascript
function playTone(freq, type, attack, decay, sustain, release, gainVal = 0.4) {
  if (!ctx) return;
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(masterGain);
  osc.type = type;
  osc.frequency.value = freq;
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(gainVal, now + attack / 1000);
  gain.gain.linearRampToValueAtTime(gainVal * sustain, now + (attack + decay) / 1000);
  gain.gain.linearRampToValueAtTime(0, now + (attack + decay + release) / 1000);
  osc.start(now);
  osc.stop(now + (attack + decay + release) / 1000);
}

function playEvent(eventId) {
  const def = SOUND_DEFS[eventId];
  if (!def) return;
  playTone(def.freq, def.type, def.a, def.d, def.s, def.r, def.gain);
}
```

### 11.4 Ambient Drone

```javascript
function startAmbient(mood) {
  stopAmbient();
  // mood: 'dawn'|'day'|'dusk'|'night'
  const freqs = { dawn: 110, day: 130, dusk: 98, night: 82 };
  const f = freqs[mood] || 110;
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const ambGain = ctx.createGain();
  osc1.type = 'sine'; osc1.frequency.value = f;
  osc2.type = 'sine'; osc2.frequency.value = f * 1.5; // perfect fifth
  ambGain.gain.value = 0.08;
  osc1.connect(ambGain); osc2.connect(ambGain);
  ambGain.connect(masterGain);
  osc1.start(); osc2.start();
  ambientNode = { osc1, osc2, gain: ambGain };
}
function stopAmbient() {
  if (!ambientNode) return;
  ambientNode.osc1.stop(); ambientNode.osc2.stop();
  ambientNode = null;
}
```

### 11.5 Volume Management

Master gain (`masterGain.gain.value`) is the single volume knob. Value persisted in `localStorage` under key `"echoes_volume"` (separate from save file). Range: 0.0–1.0, default 0.6. A volume slider is rendered in the MENU state only.

---

## 12. Performance Targets & Constraints

| Metric | Target | Hard Limit |
|---|---|---|
| Frame rate | 60 fps | 30 fps minimum |
| Input-to-visual latency | < 16 ms (one frame) | < 33 ms |
| `localStorage` save size | < 50 KB | 100 KB (browser limits) |
| Total LOC (HTML file) | 5,000 | 5,500 |
| Boot time (parse + init) | < 200 ms | 500 ms |
| Dialogue filter computation | < 1 ms | 5 ms |
| Canvas redraw (dirty region) | < 4 ms | 10 ms |
| Full canvas repaint | < 12 ms | 25 ms |

**Memory:** No audio buffers (synthesis only). No image data. World state object peak size: ~80 KB in-memory (JSON stringified ~30 KB). GC pressure: zero persistent allocation per frame. No closures created inside `gameLoop`.

**localStorage budget breakdown:**
- `world.player.*`: ~200 bytes
- `world.journal.entries`: ~8 KB (100 entries × 80 bytes)
- `world.journal.sealed_insights`: ~2 KB
- `world.npcs.*`: ~6 KB (15 NPCs × 400 bytes)
- `world.locations.*`: ~3 KB
- `world.flags.*`: ~500 bytes
- `world.archive.*`: ~200 bytes
- Metadata (version, timestamp): ~100 bytes
- **Total estimated:** ~20 KB typical, 50 KB max

---

## 13. Module Breakdown & LOC Budget

Each module is a `const MODULE_NAME = (() => { ... return { publicInterface }; })();` IIFE. They communicate only through their returned public interface.

---

### MODULE: CONSTANTS
**File position:** Block 1 in `<script>`  
**LOC:** ~80  
**Responsibilities:** All magic numbers, enum strings, key names. Zero logic.

```javascript
const CONSTANTS = {
  CANVAS_W: 900, CANVAS_H: 600,
  SCENE_W: 600,  SCENE_H: 540,
  SIDEBAR_X: 620, SIDEBAR_W: 280,
  ACTION_BAR_Y: 548, ACTION_BAR_H: 52,
  TURN_MAX_DEFAULT: 30,
  DUSK_TRIGGER_DEFAULT: 25,
  INSIGHT_MAX: 150,
  RESONANCE_CAP: 200,
  INSIGHT_DEATH_LOSS_PCT: 0.20,
  ARCHETYPE_INSIGHT_BONUS: 0.15,
  SCHOLAR_CARD_DISCOUNT: 10,
  CONFESSOR_TRUST_BONUS: 0.15,
  RESONANCE_PER_INSIGHT_SPENT: 0.40,
  SAVE_KEY: 'echoes_save',
  VOLUME_KEY: 'echoes_volume',
  GAME_VERSION: '1.0.0',
  STATES: { MENU, INTRO, DAWN, DAY, DUSK, NIGHT, LOOP_END, ENDING, JOURNAL, ARCHIVE },
  ARCHETYPES: { WITNESS, CONFESSOR, SCHOLAR },
  SIDEBAR_TABS: ['JOURNAL', 'ARCHIVE', 'QUESTS', 'MAP'],
};
```

**Public interface:** The `CONSTANTS` object itself. No functions.  
**Dependencies:** None.

---

### MODULE: UTILS
**LOC:** ~120  
**Responsibilities:** Pure utility functions. No side effects. No state.

**Public interface:**
```javascript
{
  wrapText(ctx, text, maxWidth): string[],
  clamp(value, min, max): number,
  lerp(a, b, t): number,
  deepClone(obj): any,            // JSON.parse(JSON.stringify(obj))
  rng(seed): number,              // deterministic LCG 0.0–1.0
  rngInt(min, max, seed): number,
  formatNumber(n): string,        // e.g. 42 → '42', for HUD display
  debounce(fn, ms): Function,
  padLeft(str, len, char): string,
  hexToRgba(hex, alpha): string,  // '#aabbcc' → 'rgba(r,g,b,a)'
}
```

**Dependencies:** None.

---

### MODULE: AUDIO
**LOC:** ~180  
**Responsibilities:** Web Audio API bootstrap, all sound synthesis, ambient drone lifecycle.

**Public interface:**
```javascript
{
  init(): void,
  playEvent(eventId: string): void,
  startAmbient(mood: 'dawn'|'day'|'dusk'|'night'): void,
  stopAmbient(): void,
  setVolume(v: number): void,   // 0.0–1.0
  getVolume(): number,
}
```

**Dependencies:** CONSTANTS.

---

### MODULE: UI_COMPONENTS
**LOC:** ~200  
**Responsibilities:** Low-level Canvas draw primitives. Stateless — all state passed as arguments.

**Public interface:**
```javascript
{
  drawBox(ctx, x, y, w, h, opts: {fill, stroke, radius}): void,
  drawButton(ctx, x, y, w, h, label, opts: {hover, disabled, font, color}): void,
  drawProgressBar(ctx, x, y, w, h, value, max, opts: {fillColor, bgColor}): void,
  drawText(ctx, text, x, y, opts: TextOpts): void,
  drawWrappedText(ctx, lines: string[], x, y, lineHeight, color, font): number,  // returns bottom y
  drawSeparator(ctx, x1, y1, x2, y2, color): void,
  drawScrollBar(ctx, x, y, h, scrollOffset, totalLines, visibleLines): void,
  drawBadge(ctx, x, y, text, bgColor, textColor): void,
  drawAsciiBox(ctx, x, y, w, h, title, color): void,  // ╔═╗ style borders
}
```

**Dependencies:** CONSTANTS, UTILS, PALETTE (inline constant).

---

### MODULE: RENDERER
**LOC:** ~400  
**Responsibilities:** Orchestrate all draw calls. Manage DIRTY flags. Manage scroll state. Register hover regions for visual response.

**Public interface:**
```javascript
{
  init(canvas, ctx): void,
  requestRedraw(region: 'scene'|'sidebar'|'hud'|'dialogue'|'full'): void,
  drawScenePanel(): void,
  drawSidebar(): void,
  drawHUD(): void,
  drawDialogue(): void,
  drawSeparators(): void,
  showAlert(message: string, durationFrames?: number): void,
  scrollScene(delta: number): void,
  scrollJournal(delta: number): void,
  // Internal — called by gameLoop only:
  renderFrame(): void,
}
```

**Dependencies:** CONSTANTS, UTILS, UI_COMPONENTS, WORLD, GAME_STATE, INPUT.

---

### MODULE: INPUT
**LOC:** ~150  
**Responsibilities:** DOM event registration, click region management, keyboard dispatch, hover state.

**Public interface:**
```javascript
{
  init(canvas): void,
  register(region: ClickRegion): void,
  clear(prefix?: string): void,
  getHoverRegionId(): string | null,
  // Internal:
  onClick(e: MouseEvent): void,
  onMouseMove(e: MouseEvent): void,
  onKeyDown(e: KeyboardEvent): void,
}
```

**Dependencies:** CONSTANTS, GAME_STATE (for state guard), RENDERER.

---

### MODULE: WORLD
**LOC:** ~250  
**Responsibilities:** Define and own the canonical WORLD object. Provide typed mutators. No logic — pure data operations.

**Public interface:**
```javascript
{
  state: WorldState,           // the object itself (mutable by mutators only)
  reset(): void,               // full reset to defaults
  resetLoop(): void,           // loop-resetting fields only
  gainInsight(amount, source): void,
  spendInsight(amount): boolean,  // returns false if insufficient
  gainResonance(amount): void,
  spendResonance(amount): boolean,
  setFlag(key, value): void,
  getFlag(key): any,
  recomputeFlags(): void,
  getNpc(id): NpcState,
  getLocation(id): LocationState,
}
```

**Dependencies:** CONSTANTS, UTILS.

---

### MODULE: NPC_SYSTEM
**LOC:** ~350  
**Responsibilities:** NPC data definitions (all 15), trust engine, location scheduling (which NPCs are where each loop), secret management.

**Public interface:**
```javascript
{
  getNpcData(id): NpcDefinition,    // static definition (name, portrait-char, etc.)
  getNpcsAtLocation(locationId): string[],   // NPC IDs present there this turn
  scheduleNpcs(): void,             // called on DAWN to assign NPC locations
  modifyTrust(npcId, delta): void,
  revealSecret(npcId, secretId): void,
  hasSecret(npcId, secretId): boolean,
  getConversationEntryNode(npcId): string,  // respects dialogue_state
}
```

**Dependencies:** CONSTANTS, WORLD, UTILS.

---

### MODULE: DIALOGUE
**LOC:** ~300  
**Responsibilities:** All dialogue tree data, conversation state machine, option filter, side-effect applier.

**Public interface:**
```javascript
{
  startConversation(npcId): void,
  selectOption(optionIndex): void,
  getCurrentNode(): DialogueNode | null,
  getFilteredOptions(): DialogueOption[],
  endConversation(): void,
  // Data:
  trees: { [npcId]: DialogueTree },
}
```

**Dependencies:** CONSTANTS, WORLD, NPC_SYSTEM, INSIGHT_SYSTEM, AUDIO, SAVE_LOAD.

---

### MODULE: INSIGHT_SYSTEM
**LOC:** ~250  
**Responsibilities:** Card definitions (all cards), formation detection, sealing process, effect application.

**Public interface:**
```javascript
{
  checkFormation(): InsightCard | null,  // returns card if newly formed
  sealCard(cardId): boolean,
  getCardDef(cardId): CardDefinition,
  getAllCardDefs(): CardDefinition[],
  getSealCost(cardId): number,          // accounts for archetype discount
}
```

**Dependencies:** CONSTANTS, WORLD, AUDIO, SAVE_LOAD.

---

### MODULE: JOURNAL
**LOC:** ~180  
**Responsibilities:** Entry management, thread tracking, sealed insight log rendering data prep.

**Public interface:**
```javascript
{
  addEntry(text: string, threadId?: string): void,
  addFact(factId: string): void,
  openThread(threadId: string, title: string): void,
  resolveThread(threadId: string): void,
  getActiveThreads(): Thread[],
  getEntries(threadId?: string): JournalEntry[],
  getSealedInsights(): SealedInsight[],
}
```

**Dependencies:** CONSTANTS, WORLD, SAVE_LOAD.

---

### MODULE: ARCHIVE
**LOC:** ~200  
**Responsibilities:** Archive definitions (all unlocks), Resonance-spend logic, unlock effects application.

**Archive Definitions (complete list):**

| ID | Name | Cost | Effect |
|---|---|---|---|
| `keeper_memory` | Keeper's Memory | 30 R | +3 dialogue options shown per conversation |
| `night_walker` | Night Walker | 50 R | Move during night phase in 3 locations |
| `cartographer` | Cartographer | 20 R | Clue hints visible on MAP tab |
| `extra_turns_i` | Enduring Light I | 40 R | +3 turn_max, +3 dusk_trigger |
| `extra_turns_ii` | Enduring Light II | 60 R | +3 turn_max (stacks) |
| `fast_travel` | The Long Road | 35 R | Lighthouse travel always costs 1 turn |
| `spirit_tongue` | Spirit Tongue | 45 R | Unlocks dialogue with vision-only NPCs |
| `deep_pockets` | Deep Pockets | 25 R | Carry 2 extra items per loop |

**Public interface:**
```javascript
{
  getAllUnlocks(): ArchiveDef[],
  isUnlocked(id): boolean,
  purchase(id): boolean,         // deducts Resonance, applies effects
  getAffordable(): ArchiveDef[], // filtered by resonance
  applyUnlockEffects(): void,    // re-applies all unlocks to WORLD.loop on DAWN
}
```

**Dependencies:** CONSTANTS, WORLD, AUDIO, SAVE_LOAD.

---

### MODULE: LOCATION
**LOC:** ~400  
**Responsibilities:** All 10 location definitions (description, hotspots, exits, time rules), movement, hotspot interaction.

**Location Definition Shape:**
```javascript
interface LocationDef {
  id:          string;
  name:        string;
  description: string;            // scene body text
  hotspots:    HotspotDef[];
  exits:       ExitDef[];
  night_available: boolean;       // reachable during night phase?
  dawn_only:   boolean;           // available only at dawn?
  requires_archive?: string;      // locked until archive unlocked
}
interface HotspotDef {
  id:          string;
  label:       string;            // display in scene panel
  description: string;            // text on examine
  first_examine_effects: SideEffect[];
  repeat_examine_text:   string;
  requires_item?:        string;
  requires_flag?:        string;
  consumable_item?:      string;  // item removed after use
}
interface ExitDef {
  to:          string;            // target location_id
  label:       string;            // "Go to ..."
  turn_cost:   number;            // 1 or 2
  requires_flag?: string;
}
```

**Public interface:**
```javascript
{
  getLocationDef(id): LocationDef,
  moveTo(locationId): void,         // validates, deducts turns, updates WORLD
  examineHotspot(hotspotId): void,
  getAvailableExits(locationId): ExitDef[],
  getAvailableHotspots(locationId): HotspotDef[],
}
```

**Dependencies:** CONSTANTS, WORLD, NPC_SYSTEM, JOURNAL, INSIGHT_SYSTEM, AUDIO, SAVE_LOAD.

---

### MODULE: NIGHT_PHASE
**LOC:** ~200  
**Responsibilities:** Vision sequence generation, consequence application, night location handling.

**Vision sequences** are data-driven arrays of `VisionFrame`:
```javascript
interface VisionFrame {
  text:        string;     // rendered in scene panel
  speaker?:    string;     // 'ghost_keeper' or 'mirror_self' or null
  effects?:    SideEffect[];  // applied when frame is dismissed
  ascii_art?:  string;     // optional ASCII decoration lines
}
```

Visions are seeded by: `loop_count % 5` (cycles through 5 vision pools), modified by which insights are sealed (sealed insights unlock additional frames).

**Public interface:**
```javascript
{
  generateVision(): VisionFrame[],
  applyConsequences(): void,   // when lighthouse was dark
  nextFrame(): boolean,        // advance vision; returns false when done
  getCurrentFrame(): VisionFrame | null,
}
```

**Consequences (lighthouse dark):**
- Insight lost: `Math.floor(WORLD.player.insight * 0.20)` (rounds down).
- One random NPC trust decreases by 5.
- If `dark_count >= 3` (tracked in flags): one random location becomes "fog-locked" for next loop (requires extra turn to enter).

**Dependencies:** CONSTANTS, WORLD, JOURNAL, AUDIO, UTILS.

---

### MODULE: ENDING_SYSTEM
**LOC:** ~150  
**Responsibilities:** Evaluate all ending conditions, trigger ending sequence, render epilogue.

**Public interface:**
```javascript
{
  checkFlags(): EndingId | null,   // null = no ending yet
  triggerEnding(endingId): void,
  getEndingDef(endingId): EndingDef,
}

interface EndingDef {
  id:          string;
  title:       string;
  epilogue:    string;   // long form text rendered in scene panel
  ascii_art:   string;  // decorative ASCII for ending screen
  audio_mood:  string;  // ambient mood to play
}
```

**Ending evaluation (checked in priority order):**
```javascript
function checkFlags() {
  const f = WORLD.flags;
  if (f.vael_fed_count >= 5 && f.vael_pact_accepted)                                  return 'THE_CORRUPTION';
  if (f.spirits_freed >= 3 && f.vael_offered_freedom)                                 return 'THE_LIBERATION';
  if (f.all_7_key_insights_sealed && f.mechanism_dismantled)                          return 'THE_TRUTH';
  if (f.lighthouse_lit_count >= 15 && f.vael_fed_count === 0 && f.spirits_freed === 0) return 'THE_SACRIFICE';
  if (f.all_npc_quests_complete && f.lighthouse_lit_count >= 12)                      return 'THE_KEEPERS_PEACE';
  return null;
}
```

**Dependencies:** CONSTANTS, WORLD, GAME_STATE, AUDIO, RENDERER.

---

### MODULE: SAVE_LOAD
**LOC:** ~150  
**Responsibilities:** Serialise/deserialise WORLD to/from localStorage. Migration. Corruption handling.

**Public interface:**
```javascript
{
  save(): void,
  load(): boolean,          // returns false if no save exists
  deleteSave(): void,
  hasSave(): boolean,
  migrate(save): SaveFile,
  applyToWorld(worldData): void,
  resetWorld(): void,
}
```

**Dependencies:** CONSTANTS, WORLD, UTILS.

---

### MODULE: GAME_STATE
**LOC:** ~200  
**Responsibilities:** State machine. Owns `current` state string. Owns state stack for overlays. All transition logic.

**Public interface:**
```javascript
{
  current: GameStateId,
  stateStack: GameStateId[],
  init(): void,           // called at boot
  transition(to: GameStateId): void,
  dispatch(action: Action): void,
  pushOverlay(state: GameStateId): void,
  popOverlay(): void,
}

interface Action {
  type:    ActionType;   // string enum of all possible actions
  payload: any;
}
```

All `ActionType` values (complete enumeration):
```
MOVE_TO_LOCATION, EXAMINE_HOTSPOT, OPEN_DIALOGUE, SELECT_OPTION, CLOSE_DIALOGUE,
BEGIN_SEAL, CONFIRM_SEAL, CANCEL_SEAL, OPEN_ARCHIVE, PURCHASE_ARCHIVE,
ADVANCE_VISION, BEGIN_DAY, END_TURN_MANUAL, OPEN_TAB, SCROLL_UP, SCROLL_DOWN,
START_NEW_GAME, LOAD_GAME, SELECT_ARCHETYPE, ACKNOWLEDGE_LOOP_END, RESTART,
MAIN_MENU, FORCE_SAVE, OPEN_JOURNAL
```

**Dependencies:** All game-logic modules, RENDERER, AUDIO, SAVE_LOAD, INPUT.

---

### MODULE: SCREENS
**LOC:** ~500 (split across logical sub-sections)  
**Responsibilities:** Per-state render orchestration. Each screen function registers its click regions, renders its specific layout, and wires up screen-specific input handlers.

**Sub-sections and their individual LOC:**

| Screen | LOC | Key Responsibilities |
|---|---|---|
| `screen_menu` | 80 | Title art, archetype buttons, load button, volume slider |
| `screen_intro` | 50 | Lore text scroll, continue button |
| `screen_dawn` | 80 | Journal summary, today's open threads, Begin Day button |
| `screen_day` | 120 | Hotspot list, NPC list, exit list, turn counter, seal button |
| `screen_dusk` | 80 | Component list, repair button, result display |
| `screen_night` | 70 | Vision frame display, next/dismiss, ASCII art overlay |
| `screen_loop_end` | 50 | Loop recap: insight earned, resonance gained, new seals |
| `screen_ending` | 70 | Epilogue text, restart/menu buttons, ending title |

**Public interface:** Each screen exports only its `render(ctx)` function, called by RENDERER.

**Dependencies:** CONSTANTS, WORLD, GAME_STATE, INPUT, UI_COMPONENTS, RENDERER, all game-logic modules.

---

## Appendix A: Insight Card Catalog (Summary)

| Card ID | Required Facts | Required Secrets | Cost | Key Effect |
|---|---|---|---|---|
| `light_source_truth` | `light_origin`, `vael_hunger` | `vael_light_feeding` | 50 | Unlocks beacon_room |
| `vael_origin` | `vael_age`, `vael_binding` | `vael_true_name` | 75 | `vael_offered_freedom` dialogue unlocks |
| `keeper_betrayal` | `keeper_diary_1`, `keeper_diary_3` | `maren_secret_grief` | 40 | Opens Cal's hidden room |
| `spirit_binding` | `spirit_history`, `ruins_inscription` | `oren_ritual_knowledge` | 60 | Enables spirit-freeing ritual |
| `mechanism_purpose` | `mechanism_schematic`, `beacon_gear` | `dov_confession` | 55 | Enables mechanism dismantling |
| `island_history` | `old_map`, `petra_history` | `petra_archive_key` | 35 | Unlocks grotto exit |
| `final_signal` | `signal_pattern`, `all_6_others_sealed` | — | 75 | Triggers ending check immediately |

---

## Appendix B: Location Data Catalog

| ID | Name | NPCs (default) | Night? | Special |
|---|---|---|---|---|
| `cottage` | Keeper's Cottage | `maren` | Yes | Loop start point |
| `lighthouse` | The Lighthouse | `dov` (dusk only) | Yes | Repair target |
| `cove` | Tidal Cove | `silas`, `ysel` | No | Vael feeding site |
| `forest_path` | Forest Path | `rudd` | No | Shortcut route |
| `village` | Village Square | `petra`, `ina`, `bram` | No | Social hub |
| `old_mill` | The Old Mill | `thalia` | No | Component source |
| `cliff_top` | Cliff Top | `cal` | No | Requires `island_history` |
| `ruins` | Drowned Ruins | `oren` | No | Ritual site |
| `grotto` | Sea Grotto | `sera` (spirit) | No | Requires `island_history` sealed |
| `beacon_room` | Beacon Chamber | `ghost_keeper` (night) | Yes | Requires `light_source_truth` sealed |

---

## Appendix C: Ending Flag Summary (Quick Reference)

| Ending | Flags Required |
|---|---|
| THE_SACRIFICE | `lighthouse_lit_count >= 15` AND `vael_fed_count === 0` AND `spirits_freed === 0` |
| THE_LIBERATION | `spirits_freed >= 3` AND `vael_offered_freedom === true` |
| THE_TRUTH | `all_7_key_insights_sealed === true` AND `mechanism_dismantled === true` |
| THE_CORRUPTION | `vael_fed_count >= 5` AND `vael_pact_accepted === true` |
| THE_KEEPER'S PEACE | `all_npc_quests_complete === true` AND `lighthouse_lit_count >= 12` |

Ending evaluation runs: (1) at end of every `DUSK→NIGHT` transition, (2) at end of `LOOP_END`, (3) after any Insight Card is sealed. Evaluation order: CORRUPTION → LIBERATION → TRUTH → SACRIFICE → KEEPER'S PEACE. First match wins.

---

*End of specification. Document length: approximately 5,800 words. All sections are implementation-ready. No design intent is implicit; every value, structure, and algorithm is explicitly defined above.*
