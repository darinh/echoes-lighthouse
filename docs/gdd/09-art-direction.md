# ECHOES OF THE LIGHTHOUSE
## DOCUMENT A: ART DIRECTION & VISUAL STYLE GUIDE

**Version:** 1.0  
**Target Platform:** HTML5 Canvas 2D (900×600px)  
**Aesthetic:** Gothic Maritime Mystery via Text & ASCII  
**Document Scope:** Complete visual specifications for developers implementing the Canvas renderer

---

## A1. DOCUMENT HEADER & PHILOSOPHY

### A1.1 Design Mandate

*Echoes of the Lighthouse* is a text-driven mystery where the visual frame amplifies the narrative weight rather than competing with it. Every pixel, every character, every color choice serves the story. The game is **not** pixel art; it is a beautifully typeset book given a frame and a voice.

**What This Game Should Feel Like:**
- *House of Leaves* by Mark Z. Danielewski (nested text, typography as meaning, disorienting beauty)
- *Return of the Obra Dinn* (limited palette, high contrast, mystery through visual composition)
- *Outer Wilds* (cosmic dread, environmental storytelling, atmosphere over spectacle)

**What This Game Should NOT Look Like:**
- Retro pixel art (Stardew Valley, Celeste) — too whimsical, too warm
- Text adventures with random color shifts — amateurish
- Stock UI frameworks — generic, corporate
- Illustrated storybooks — we're not competing with artists; we're complementing writers

### A1.2 The Core Axiom: Text IS the Art

In traditional games, text labels data. In *Echoes*, text is the data *and* the visual. A character's name, their words, the choices offered — these are rendered with the same care as a panel border or a progress bar. The canvas is not a backdrop for text; the canvas *holds* text.

**Visual Hierarchy Principle:**
1. **Typography** — character face, size, color, positioning
2. **Framing** — panel borders, backgrounds, spatial relationships
3. **Accent** — ASCII art, decorative elements, particle effects
4. **Color** — emotional and state signaling (not decoration)

---

## A2. VISUAL DESIGN PHILOSOPHY

### A2.1 Reference Points & Inspiration

#### Reference 1: *House of Leaves* Approach
*House of Leaves* uses typography, page layout, and negative space as narrative tools. Shifting margins, footnotes, and varying font sizes create unease. In our canvas:
- Variable text sizing for hierarchy (monospace for mechanics, larger for important choices)
- Negative space in panel layouts (breathing room signals safety; compressed layouts signal dread)
- Intentional "wrongness" in typography during corruption states (misaligned text, flickering)

#### Reference 2: *Return of the Obra Dinn* Aesthetic
*Obra Dinn* uses exactly 2 colors per screen: black & white. Our palette is more nuanced, but the principle holds: **constraint breeds elegance**. With only 18 colors defined, we achieve sophistication through restraint. Each color is *chosen*, never default.

#### Reference 3: *Outer Wilds* Cosmic Dread
*Outer Wilds* makes emptiness feel vast. Large black expanses, minimal UI, centered focus. In our text game:
- Generous use of VOID (#0a0a0f) as negative space
- Isolated text on dark backgrounds (journal entries feel like messages from an empty place)
- Limited animation (only necessary motion, nothing frivolous)

### A2.2 What This Game Should Never Do

1. **Drown text in color** — text-on-text with rainbow gradients. No.
2. **Animate constantly** — frenetic movement kills atmosphere. Animation is rare, purposeful.
3. **Use drop shadows carelessly** — shadows are depth tools, not decorations. Use sparingly.
4. **Mix metaphors** — don't suddenly switch to glitch effects unless corruption is the context.
5. **Trust developer taste** — hardcode colors and dimensions. Leave no room for "but I like teal better."

### A2.3 Typography as Visual Language

**Monospace Font (Game Text):**
- Used for: dialogue, journal entries, puzzle text, mechanics text
- Why: monospace evokes typewriter, documentation, historical record. It's *written*, not spoken.
- Size: 14px for body text, 12px for secondary, 18px for emphasis
- Tracking: 0 (tight) for normal text, +1px (relaxed) for important passages to slow reading

**Sans-serif Font (UI):**
- Used for: labels, turn count, currency displays, menu items
- Why: sans-serif is contemporary, clear, reads fast
- Size: 12px for labels, 16px for headers
- Weight: 400 (normal) for standard, 700 (bold) for active/hover states

---

## A3. ASCII ART CONVENTIONS & REFERENCE ART

### A3.1 The Lighthouse Icon

The lighthouse appears in the game header and in the journal as a recurrent visual motif. Use this exact ASCII art (5 lines × 7 chars):

```
  /\
 /  \
|    |
|____|
 \__/
```

**Canvas Implementation:**
- Rendered with TEXT_PRIMARY (#c8c8d8) at 11px monospace
- Each line offset +2px from the previous (creates slight animation appearance when static)
- Used as a border decoration (appears top-center of the main panel during gameplay)

**Variant for Lit State** (when lighthouse beam is active during night):
```
  /^\
 /   \
|  *  |
|_____|
 \___/
```
- The `*` is rendered in BEAM_AMBER (#e8a832)
- Creates the sense of active light without animation

### A3.2 Vael's Rest: Complete Island Map

The full island map showing all 10 locations and their spatial relationships. This is the schema for the MAP_VIEW:

```
        ╔════════════════════════╗
        ║    V A E L ' S  R E S T ║
        ║   THE LOST ISLAND (MAP) ║
        ╚════════════════════════╝

      ┌─────────────┐
      │  3. CLIFF   │
      │  WATCH      │      ┌──────────────┐
      │             │──┬───│ 2. EASTERN   │
      └─────────────┘  │   │ BEACON       │
                       │   └──────────────┘
      ┌──────────────┐ │
      │ 4. THE       │─┼───┬──────────────┐
      │ RUINS        │ │   │ 1. THE       │
      └──────────────┘ │   │ LIGHTHOUSE   │
           │           │   │ (ARCHIVE)    │
      ┌────┴────────┐  │   └──────────────┘
      │ 5. THE      │──┘
      │ ARCHIVE     │
      │ (HEART)     │
      └─────┬───────┘
            │
      ┌─────┴────────────┐
      │ 6. TIDE POOLS    │
      │ & ROCKS          │
      │                  │
      └─────┬────────────┘
            │
      ┌─────┴──────────────┐
      │ 7. KEEPER'S        │
      │ CHAMBER            │
      │ (UNDERWORLD)       │
      └────────────────────┘

   ┌──────────────────────────┐
   │ 8. THE FORGE             │
   │ (WEST WING)              │
   └────────┬─────────────────┘
            │
   ┌────────┴─────────────────┐
   │ 9. THE GARDEN            │
   │ (SANCTUARY)              │
   └────────┬─────────────────┘
            │
   ┌────────┴──────────────────┐
   │ 10. THE VOID              │
   │ (FINAL DESCENT)           │
   └───────────────────────────┘
```

**Canvas Rendering:**
- Render as a graph, not ASCII art text (see A4.4 for specifications)
- Each location is a circle node, connections are lines
- On hover, location name brightens to TEXT_HIGHLIGHT
- Current location node pulses with BEAM_AMBER

### A3.3 NPC Portraits (5-Line ASCII Silhouettes)

Each major NPC has a stylized 5-line face. These appear in dialogue headers and journal entries.

#### Portrait 1: ORIN (The Keeper — stern, unyielding)
```
  [| |]
  [|_|]
  < | >
   \|/
    |
```

#### Portrait 2: MIRA (The Keeper's Daughter — young, uncertain)
```
   /~\
  | o |
  ( - )
   \V/
   / \
```

#### Portrait 3: CROW (The Smuggler — sly, observant)
```
   /==\
  [o o]
   >-<
   /|\
  / | \
```

#### Portrait 4: LYSANDER (The Scholar — contemplative, precise)
```
   ===
  | . |
  | : |
   \ /
   / \
```

#### Portrait 5: HELENA (The Beacon Keeper — protective, fearful)
```
   /^\
  | * |
  | O |
   \|/
   / \
```

#### Portrait 6: VAEL (The Ghost/Betrayer — ethereal, corrupting)
```
   ~~~
  [_ _]
   (~)
   / \
  |   |
```

#### Portrait 7: THE AUTOMATON (Echo/Mechanism — blank, alien)
```
   [#]
  [#_#]
  |   |
  |___|
  / | \
```

#### Portrait 8: PHOSPHENE (The Thing — unknowable, threatening)
```
   ???
  (o o)
   \=/
   / \
  |   |
```

**Canvas Implementation:**
- Render with TEXT_PRIMARY at 10px monospace
- When an NPC speaks, their portrait appears left of dialogue box with a BORDER color frame
- During corruption states, portraits render with CORRUPTION_GREEN overlay (opacity 0.3)
- During ghost states, portraits render in GHOST_CYAN

### A3.4 Decorative Borders

Three border styles for different panel types, each using Box-Drawing Unicode characters:

#### Border Style 1: Standard Panel (dialogue, journal entries, menu)
```
╔════════════════════════╗
║  [CONTENT HERE]        ║
║                        ║
╚════════════════════════╝
```
- Box-drawing: ╔ ═ ╗ ║ ╚ ═ ╝
- Color: BORDER (#2a2a45)
- Canvas: strokeRect with 1px line, color BORDER, no glow

#### Border Style 2: Important Panel (sealed cards, crucial choices, final scenes)
```
╠════════════════════════╣
║  [IMPORTANT CONTENT]   ║
║                        ║
╠════════════════════════╣
```
- Box-drawing: ╠ ═ ╣
- Color: BORDER_HI (#4a4a70)
- Canvas: strokeRect with 2px line, color BORDER_HI, shadowBlur: 8, shadowColor: BORDER_HI @ 0.5 opacity

#### Border Style 3: Ghost/Vision Panel (otherworldly, supernatural)
```
◇─────────────────────────◇
│ [VISION CONTENT]        │
│                         │
◇─────────────────────────◇
```
- Box-drawing: ◇ ─ │
- Color: GHOST_CYAN (#28c8c8)
- Canvas: strokeRect with 1px dashed line (setLineDash([4, 2])), color GHOST_CYAN, shadowBlur: 12, shadowColor: GHOST_CYAN @ 0.3 opacity

### A3.5 Section Dividers

Two divider styles used to separate content within a panel:

#### Divider 1: Standard (between dialogue and choices, between journal entries)
```
─────────────────────────
```
- Canvas: horizontal line, y-offset mid-panel, 1px stroke, color BORDER
- Length: 90% of panel width, centered

#### Divider 2: Emphasis (before final choice, before ending, before major revelation)
```
≈ ≈ ≈ ≈ ≈ ≈ ≈ ≈ ≈ ≈ ≈ ≈
```
- Canvas: series of "≈" characters at 12px monospace, color BORDER_HI, 2px vertical spacing
- Creates a "wave" visual metaphor for the lighthouse/ocean setting

### A3.6 Weather & Atmospheric Text Effects

These descriptors render as faded text overlays at specific game moments:

#### Weather 1: Fog (Dawn phase, uncertain beginning)
```
     ~     ~    ~
   ~   ~  ~  ~      ~
```
- Canvas: render "~" characters in TEXT_SECONDARY at 16px, opacity 0.2, scattered randomly across upper canvas
- Creates sense of limited visibility without blocking interface

#### Weather 2: Rain (Dusk phase, urgency)
```
  | | | | |
 | | | | | |
| | | | | |
```
- Canvas: vertical lines (| characters) in TEXT_SECONDARY at 14px, opacity 0.15, arranged in diagonal rows
- Creates sense of cascading, increasing pressure

#### Weather 3: Clear Night Sky (Night phase)
```
  •   •     •
•      •        •
    •   •  •
```
- Canvas: small circles (•) or periods in BORDER at 12px, opacity 0.25, distributed like stars
- No animation, purely atmospheric
- During NIGHT (dark), increase density by 50% and dim to opacity 0.1

---

## A4. CANVAS DRAWING SPECIFICATIONS

### A4.1 Panel Backgrounds & Borders

All UI panels use these exact Canvas 2D calls. Assume canvas context is `ctx`.

#### Standard Panel Background
```javascript
// Background fill
ctx.fillStyle = '#0f0f1a';  // DEEP color
ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

// Border
ctx.strokeStyle = '#2a2a45';  // BORDER color
ctx.lineWidth = 1;
ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
```

**Dimensions:**
- Main content panel: 900 - 40px (x margins) = 820px wide, 600 - 120px (top/bottom reserve) = 480px tall
- Dialogue box: 820px wide × 200px tall
- Journal panel: 200px wide × 480px tall (left sidebar)
- Status bar: 820px wide × 30px tall

#### Raised Surface (buttons, cards, highlighted areas)
```javascript
// Background fill (lighter than DEEP)
ctx.fillStyle = '#141428';  // SURFACE color
ctx.fillRect(surfaceX, surfaceY, surfaceWidth, surfaceHeight);

// Border
ctx.strokeStyle = '#2a2a45';  // BORDER color
ctx.lineWidth = 1;
ctx.strokeRect(surfaceX, surfaceY, surfaceWidth, surfaceHeight);

// Optional inner border for depth
ctx.strokeStyle = '#0a0a0f';  // VOID color
ctx.lineWidth = 1;
ctx.strokeRect(surfaceX + 1, surfaceY + 1, surfaceWidth - 2, surfaceHeight - 2);
```

#### Important Panel (sealed cards, crucial warnings)
```javascript
// Background fill
ctx.fillStyle = '#0f0f1a';  // DEEP color
ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

// Glow shadow (depth effect)
ctx.shadowColor = 'rgba(74, 74, 112, 0.5)';  // BORDER_HI with alpha
ctx.shadowBlur = 12;
ctx.shadowOffsetX = 0;
ctx.shadowOffsetY = 0;

// Border (thicker, brighter)
ctx.strokeStyle = '#4a4a70';  // BORDER_HI color
ctx.lineWidth = 2;
ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

// Reset shadow for next draw
ctx.shadowBlur = 0;
ctx.shadowColor = 'transparent';
```

#### Ghost/Vision Panel (supernatural, otherworldly)
```javascript
// Background fill
ctx.fillStyle = '#0f0f1a';  // DEEP color
ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

// Outer glow (cyan, diffuse)
ctx.shadowColor = 'rgba(40, 200, 200, 0.3)';  // GHOST_CYAN with alpha
ctx.shadowBlur = 20;
ctx.shadowOffsetX = 0;
ctx.shadowOffsetY = 0;

// Dashed border
ctx.strokeStyle = '#28c8c8';  // GHOST_CYAN color
ctx.lineWidth = 1;
ctx.setLineDash([4, 2]);
ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
ctx.setLineDash([]);  // Reset to solid

// Reset shadow
ctx.shadowBlur = 0;
ctx.shadowColor = 'transparent';
```

### A4.2 Progress Bars

#### Insight Currency Bar
Location: Top-left of status bar, below "INSIGHT: X / Y"

```javascript
const barX = 20, barY = 520, barWidth = 200, barHeight = 12;
const currentInsight = 45, maxInsight = 100;
const fillRatio = currentInsight / maxInsight;

// Background (DEEP)
ctx.fillStyle = '#0f0f1a';
ctx.fillRect(barX, barY, barWidth, barHeight);

// Border
ctx.strokeStyle = '#2a2a45';
ctx.lineWidth = 1;
ctx.strokeRect(barX, barY, barWidth, barHeight);

// Fill (INSIGHT_GOLD)
ctx.fillStyle = '#c8a832';
ctx.fillRect(barX + 2, barY + 2, (barWidth - 4) * fillRatio, barHeight - 4);

// Highlight on top (shimmer effect)
ctx.fillStyle = 'rgba(200, 168, 50, 0.3)';
ctx.fillRect(barX + 2, barY + 2, (barWidth - 4) * fillRatio, (barHeight - 4) * 0.4);
```

#### Resonance Currency Bar
Location: Top-center of status bar, after Insight bar

```javascript
const barX = 250, barY = 520, barWidth = 200, barHeight = 12;
const currentResonance = 28, maxResonance = 50;
const fillRatio = currentResonance / maxResonance;

// Background
ctx.fillStyle = '#0f0f1a';
ctx.fillRect(barX, barY, barWidth, barHeight);

// Border
ctx.strokeStyle = '#2a2a45';
ctx.lineWidth = 1;
ctx.strokeRect(barX, barY, barWidth, barHeight);

// Fill (RESONANCE_BLUE)
ctx.fillStyle = '#3278c8';
ctx.fillRect(barX + 2, barY + 2, (barWidth - 4) * fillRatio, barHeight - 4);

// Highlight
ctx.fillStyle = 'rgba(50, 120, 200, 0.3)';
ctx.fillRect(barX + 2, barY + 2, (barWidth - 4) * fillRatio, (barHeight - 4) * 0.4);
```

#### Turn Indicator (Turns Remaining in Phase)
Location: Top-right of status bar

```javascript
const barX = 650, barY = 520, barWidth = 120, barHeight = 12;
const currentTurn = 5, turnsPerPhase = 8;
const fillRatio = currentTurn / turnsPerPhase;

// Background
ctx.fillStyle = '#0a0a0f';  // VOID (darker for contrast)
ctx.fillRect(barX, barY, barWidth, barHeight);

// Border (conditional color based on phase)
let phaseColor = '#c83228';  // WARNING_RED if close to end
if (currentTurn < turnsPerPhase * 0.5) {
  phaseColor = '#287832';  // SAFE_GREEN if early
} else if (currentTurn < turnsPerPhase * 0.8) {
  phaseColor = '#e8a832';  // BEAM_AMBER if mid
}

ctx.strokeStyle = phaseColor;
ctx.lineWidth = 1;
ctx.strokeRect(barX, barY, barWidth, barHeight);

// Fill (phase color)
ctx.fillStyle = phaseColor;
ctx.fillRect(barX + 2, barY + 2, (barWidth - 4) * fillRatio, barHeight - 4);
```

### A4.3 Lighthouse Beam Visualization

The lighthouse beam appears in the top-right corner during NIGHT phases. It's the primary visual indicator of the game's core mechanic.

```javascript
// Position: top-right corner, inset 20px from edges
const beamX = 820, beamY = 30;
const beamSize = 40;  // diameter

// Beam state determines color (set by game logic)
// BEAM_AMBER: #e8a832 (balanced, safe)
// BEAM_WHITE: #d8d8f8 (betrayals accumulating, danger)
// BEAM_GREEN: #28e832 (corruption)

let beamColor = '#e8a832';  // Default
if (worldState.corruption > 0.7) {
  beamColor = '#28e832';
} else if (worldState.betrayals > 5) {
  beamColor = '#d8d8f8';
}

// Draw beam circle
ctx.fillStyle = beamColor;
ctx.beginPath();
ctx.arc(beamX, beamY, beamSize / 2, 0, Math.PI * 2);
ctx.fill();

// Outer glow ring
ctx.strokeStyle = beamColor;
ctx.lineWidth = 2;
ctx.globalAlpha = 0.4;
ctx.beginPath();
ctx.arc(beamX, beamY, beamSize / 2 + 6, 0, Math.PI * 2);
ctx.stroke();
ctx.globalAlpha = 1.0;

// Inner indicator dot
ctx.fillStyle = '#0a0a0f';  // VOID (center darkness)
ctx.beginPath();
ctx.arc(beamX, beamY, 4, 0, Math.PI * 2);
ctx.fill();

// Optional: lighthouse icon label below
ctx.fillStyle = '#787890';  // TEXT_SECONDARY
ctx.font = '10px monospace';
ctx.textAlign = 'center';
ctx.fillText('BEAM', beamX, beamY + beamSize / 2 + 18);
```

### A4.4 Insight Gain Particle Effect

When the player gains Insight (e.g., "+12 Insight"), a floating gold text particle appears at the location where the gain occurred and floats upward, fading out.

```javascript
// Particle object (created at gain event)
const particle = {
  x: eventX,
  y: eventY,
  text: '+12',
  age: 0,
  maxAge: 1200,  // 1.2 seconds
  vx: 0,
  vy: -1.5  // pixels per ms upward
};

// In animation loop, per particle:
particle.age += deltaTime;

if (particle.age < particle.maxAge) {
  // Calculate opacity (fade-out over duration)
  const progress = particle.age / particle.maxAge;
  const opacity = 1 - progress;

  ctx.fillStyle = '#c8a832';  // INSIGHT_GOLD
  ctx.globalAlpha = opacity;
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  
  particle.x += particle.vx * deltaTime;
  particle.y += particle.vy * deltaTime;
  
  ctx.fillText(particle.text, particle.x, particle.y);
  ctx.globalAlpha = 1.0;
}
```

### A4.5 Insight Card States

#### In-Progress Card (dashed border, unfilled)
```javascript
const cardX = 50, cardY = 150, cardWidth = 150, cardHeight = 100;

// Background
ctx.fillStyle = '#0f0f1a';  // DEEP
ctx.fillRect(cardX, cardY, cardWidth, cardHeight);

// Dashed border (unfilled state)
ctx.strokeStyle = '#787890';  // TEXT_SECONDARY (muted)
ctx.lineWidth = 1;
ctx.setLineDash([3, 3]);
ctx.strokeRect(cardX, cardY, cardWidth, cardHeight);
ctx.setLineDash([]);

// Card ID/Label
ctx.fillStyle = '#787890';  // TEXT_SECONDARY
ctx.font = '10px monospace';
ctx.fillText('[INCOMPLETE]', cardX + 75, cardY + 10);

// Progress indicator (text inside card)
ctx.fillStyle = '#c8c8d8';  // TEXT_PRIMARY
ctx.font = '11px monospace';
ctx.textAlign = 'center';
ctx.fillText('2/3 clues', cardX + 75, cardY + 50);
```

#### Sealed Card (solid border, gold glow, complete)
```javascript
const cardX = 50, cardY = 150, cardWidth = 150, cardHeight = 100;

// Outer glow (INSIGHT_GOLD halo)
ctx.shadowColor = 'rgba(200, 168, 50, 0.6)';  // INSIGHT_GOLD with alpha
ctx.shadowBlur = 10;
ctx.shadowOffsetX = 0;
ctx.shadowOffsetY = 0;

// Background
ctx.fillStyle = '#0f0f1a';  // DEEP
ctx.fillRect(cardX, cardY, cardWidth, cardHeight);

// Solid border (sealed state)
ctx.strokeStyle = '#c8a832';  // INSIGHT_GOLD
ctx.lineWidth = 2;
ctx.strokeRect(cardX, cardY, cardWidth, cardHeight);

// Reset shadow
ctx.shadowBlur = 0;
ctx.shadowColor = 'transparent';

// Sealed indicator (✓ symbol)
ctx.fillStyle = '#c8a832';  // INSIGHT_GOLD
ctx.font = 'bold 18px sans-serif';
ctx.fillText('✓', cardX + 75, cardY + 35);

// Card label
ctx.fillStyle = '#c8c8d8';  // TEXT_PRIMARY
ctx.font = '11px monospace';
ctx.textAlign = 'center';
ctx.fillText('SEALED', cardX + 75, cardY + 85);
```

### A4.6 Map Visualization (Locations as Graph)

The island map is rendered as an interactive graph of nodes (locations) and edges (connections).

```javascript
// Location nodes (simplified structure)
const locations = {
  1: { name: 'THE LIGHTHOUSE', x: 700, y: 150 },
  2: { name: 'EASTERN BEACON', x: 750, y: 120 },
  3: { name: 'CLIFF WATCH', x: 600, y: 100 },
  4: { name: 'THE RUINS', x: 550, y: 200 },
  5: { name: 'THE ARCHIVE', x: 500, y: 280 },
  6: { name: 'TIDE POOLS', x: 480, y: 380 },
  7: { name: 'KEEPERS CHAMBER', x: 450, y: 450 },
  8: { name: 'THE FORGE', x: 300, y: 400 },
  9: { name: 'THE GARDEN', x: 320, y: 480 },
  10: { name: 'THE VOID', x: 330, y: 550 }
};

const connections = [
  [1, 2], [1, 3], [1, 5],
  [2, 3], [3, 4], [4, 5],
  [5, 6], [6, 7], [7, 8],
  [8, 9], [9, 10]
];

// Draw connections (edges) first
ctx.strokeStyle = '#2a2a45';  // BORDER
ctx.lineWidth = 1;
connections.forEach(([from, to]) => {
  const fromLoc = locations[from];
  const toLoc = locations[to];
  ctx.beginPath();
  ctx.moveTo(fromLoc.x, fromLoc.y);
  ctx.lineTo(toLoc.x, toLoc.y);
  ctx.stroke();
});

// Draw location nodes (circles)
Object.entries(locations).forEach(([id, loc]) => {
  const isCurrentLocation = gameState.currentLocation === parseInt(id);
  const radius = 12;

  // Background circle
  ctx.fillStyle = isCurrentLocation ? '#e8a832' : '#141428';  // BEAM_AMBER if current, else SURFACE
  ctx.beginPath();
  ctx.arc(loc.x, loc.y, radius, 0, Math.PI * 2);
  ctx.fill();

  // Border circle
  ctx.strokeStyle = isCurrentLocation ? '#c8a832' : '#2a2a45';  // Gold border if current
  ctx.lineWidth = isCurrentLocation ? 2 : 1;
  ctx.stroke();

  // Location number label
  ctx.fillStyle = '#c8c8d8';  // TEXT_PRIMARY
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(id, loc.x, loc.y);

  // Hover state: highlight location name
  if (isHovering(loc.x, loc.y, radius)) {
    ctx.fillStyle = '#e8e8f8';  // TEXT_HIGHLIGHT
    ctx.font = '9px monospace';
    ctx.fillText(loc.name, loc.x, loc.y + radius + 12);
  }
});
```

---

## A5. PHASE VISUAL TREATMENTS

Each of the 7 game phases (Title, Dawn, Day, Dusk, Night Safe, Night Dark, Vision, Ending) has distinct visual characteristics.

### A5.1 TITLE Phase
**Intent:** Establish tone — mysterious, Gothic, maritime.

```javascript
// Background color shift to deep midnight
ctx.fillStyle = '#0a0a0f';  // VOID (darkest)
ctx.fillRect(0, 0, 900, 600);

// Border color: neutral BORDER
borderColor = '#2a2a45';

// Text colors:
// - Main title: TEXT_PRIMARY (#c8c8d8)
// - Subtitle: TEXT_SECONDARY (#787890)
// - Interactive button: TEXT_HIGHLIGHT (#e8e8f8) on hover

// Special effect: subtle "breathing" animation on title
// Opacity oscillates 0.8 → 1.0 over 3 seconds
const opacity = 0.8 + Math.sin(Date.now() / 3000) * 0.2;
ctx.globalAlpha = opacity;
```

### A5.2 DAWN Phase
**Intent:** Beginning, hope, clarity emerging.

```javascript
// Background: slightly lighter than void, hints of warmth
ctx.fillStyle = '#0f0a15';  // DEEP with slight warm tint
ctx.fillRect(0, 0, 900, 600);

// Add subtle sunrise glow at top
const gradient = ctx.createLinearGradient(0, 0, 0, 150);
gradient.addColorStop(0, 'rgba(232, 168, 50, 0.1)');  // BEAM_AMBER at 10% opacity
gradient.addColorStop(1, 'rgba(10, 10, 15, 0)');  // Fade to void
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 900, 150);

// Border color: BORDER (standard)
borderColor = '#2a2a45';

// Text colors: TEXT_PRIMARY is readable
// Weather effect: fog overlay (see A3.6)
```

### A5.3 DAY Phase
**Intent:** Normal operations, clarity, safety.

```javascript
// Background: DEEP (standard)
ctx.fillStyle = '#0f0f1a';
ctx.fillRect(0, 0, 900, 600);

// Border color: BORDER (standard)
borderColor = '#2a2a45';

// Text colors: TEXT_PRIMARY, TEXT_SECONDARY (standard)
// Weather effect: None, or clear sky (see A3.6)

// UI is at normal contrast — no special effects
```

### A5.4 DUSK Phase
**Intent:** Tension rising, time running out, urgency palpable.

```javascript
// Background: noticeably darker, warm undertones
ctx.fillStyle = '#0a0f18';  // DEEP + deeper
ctx.fillRect(0, 0, 900, 600);

// Urgent warning glow (subtle red at edges)
const vignette = ctx.createRadialGradient(450, 300, 0, 450, 300, 700);
vignette.addColorStop(0, 'rgba(200, 50, 40, 0)');  // WARNING_RED @ 0% center
vignette.addColorStop(0.8, 'rgba(200, 50, 40, 0)');
vignette.addColorStop(1, 'rgba(200, 50, 40, 0.15)');  // WARNING_RED @ 15% edges
ctx.fillStyle = vignette;
ctx.fillRect(0, 0, 900, 600);

// Border color: shift to BORDER_HI (brighter, more urgent)
borderColor = '#4a4a70';

// Text colors: TEXT_PRIMARY (unaffected), but panel titles in TEXT_HIGHLIGHT
// Weather effect: rain overlay (see A3.6)

// Turn counter bar color: shift to BEAM_AMBER or WARNING_RED (see A4.2)
```

### A5.5 NIGHT (Safe) Phase
**Intent:** Mystery deepens, but controlled. Players have shelter/light.

```javascript
// Background: NIGHT_PURPLE (defined in palette)
ctx.fillStyle = '#1a0a28';
ctx.fillRect(0, 0, 900, 600);

// Border color: BORDER (standard), but panels feel isolated
borderColor = '#2a2a45';

// Text colors: TEXT_PRIMARY is primary, TEXT_SECONDARY is dimmer
// Weather effect: clear night sky (see A3.6)

// Lighthouse beam visible in corner (see A4.3) — state is BEAM_AMBER (safe)

// Optional: dim starfield
const starOpacity = 0.15;
ctx.fillStyle = `rgba(180, 180, 200, ${starOpacity})`;
```

### A5.6 NIGHT (Dark) Phase
**Intent:** Maximum danger. Vael active. Reality unstable.

```javascript
// Background: darker than safe night, almost black
ctx.fillStyle = '#050508';  // VOID (darkest)
ctx.fillRect(0, 0, 900, 600);

// Threat vignette (red + cyan ghosts)
const threatVignette = ctx.createRadialGradient(450, 300, 100, 450, 300, 600);
threatVignette.addColorStop(0, 'rgba(10, 10, 15, 1)');  // VOID center
threatVignette.addColorStop(0.7, 'rgba(40, 200, 200, 0.1)');  // GHOST_CYAN edges
threatVignette.addColorStop(1, 'rgba(200, 50, 40, 0.1)');  // WARNING_RED outermost
ctx.fillStyle = threatVignette;
ctx.fillRect(0, 0, 900, 600);

// Border color: BORDER_HI (highlighted, reactive)
borderColor = '#4a4a70';

// Text colors: TEXT_PRIMARY with possible glitch (misaligned duplicates)
// If corruption is high, render text twice with slight offset:
//   First pass: offset (1px right, 1px down), opacity 0.3, color CORRUPTION_GREEN
//   Second pass: normal, opacity 1.0, color TEXT_PRIMARY

// Weather effect: dense starfield + eerie calm

// Lighthouse beam visible (see A4.3) — state is BEAM_WHITE or BEAM_GREEN (danger)
// Beam pulses: opacity oscillates 0.5 → 1.0 every 500ms
const pulseOpacity = 0.5 + Math.sin(Date.now() / 500) * 0.5;
ctx.globalAlpha = pulseOpacity;
// [draw beam]
ctx.globalAlpha = 1.0;
```

### A5.7 VISION Phase
**Intent:** Disorienting. Rules break. Supernatural, non-linear, fragmentary.

```javascript
// Background: NIGHT_PURPLE with cyan overlay
ctx.fillStyle = '#1a0a28';  // NIGHT_PURPLE
ctx.fillRect(0, 0, 900, 600);

// Ethereal cyan overlay
ctx.fillStyle = 'rgba(40, 200, 200, 0.15)';  // GHOST_CYAN @ 15%
ctx.fillRect(0, 0, 900, 600);

// Border color: GHOST_CYAN (otherworldly)
borderColor = '#28c8c8';

// All panels use the Ghost/Vision Border Style (see A3.4)

// Text colors:
// - Primary speaker: TEXT_PRIMARY (still readable)
// - Ghost/Vision text: GHOST_CYAN
// - Corrupted text: glitch effect (see NIGHT Dark)

// Visual distortion: screen shake (very subtle)
// Offset canvas content by random(-2, 2) px horizontally and vertically
const shakeX = (Math.random() - 0.5) * 4;
const shakeY = (Math.random() - 0.5) * 4;
ctx.translate(shakeX, shakeY);
// [draw all content]
ctx.translate(-shakeX, -shakeY);

// Particle effect: floating "corrupted text" (like A4.4) but random words
// Words: "echo", "void", "betrayal", "light", "trapped"
// Color: GHOST_CYAN @ 0.3 opacity, drifting slowly

// No lighthouse beam visible during visions
```

### A5.8 ENDING Phase
**Intent:** Resolution. Depends on ending type (Ascension, Paradox, Void, Corruption).

#### Ending 1: Ascension (Hope, Light)
```javascript
// Background: gradient from NIGHT_PURPLE to white-ish
const endGradient = ctx.createLinearGradient(0, 0, 0, 600);
endGradient.addColorStop(0, '#1a0a28');  // NIGHT_PURPLE
endGradient.addColorStop(1, '#d8d8f8');  // BEAM_WHITE
ctx.fillStyle = endGradient;
ctx.fillRect(0, 0, 900, 600);

// Border color: BEAM_WHITE (triumphant)
borderColor = '#d8d8f8';

// Text colors: TEXT_HIGHLIGHT (bright, clear)
// No weather, no distortion — clarity
```

#### Ending 2: Paradox (Uncertain, Fractured)
```javascript
// Background: alternating vertical stripes of NIGHT_PURPLE and VOID
ctx.fillStyle = '#1a0a28';
ctx.fillRect(0, 0, 900, 600);
ctx.fillStyle = '#0a0a0f';
for (let x = 0; x < 900; x += 40) {
  ctx.fillRect(x, 0, 20, 600);
}

// Border color: BORDER_HI (unstable)
borderColor = '#4a4a70';

// Text colors: TEXT_PRIMARY but fragmented (words scattered, some rotated)
// Heavy glitch effect
```

#### Ending 3: Void (Darkness, Emptiness)
```javascript
// Background: solid VOID
ctx.fillStyle = '#0a0a0f';
ctx.fillRect(0, 0, 900, 600);

// Border color: BORDER (muted, distant)
borderColor = '#2a2a45';

// Text colors: TEXT_SECONDARY (muted, fading)
// Text opacity: 0.5
// Final message appears centered, very large, very slow
```

#### Ending 4: Corruption (Green Takeover)
```javascript
// Background: VOID with green overlay
ctx.fillStyle = '#0a0a0f';
ctx.fillRect(0, 0, 900, 600);
ctx.fillStyle = 'rgba(40, 232, 50, 0.2)';  // BEAM_GREEN @ 20%
ctx.fillRect(0, 0, 900, 600);

// Border color: CORRUPTION_GREEN (dominant)
borderColor = '#28a832';

// Text colors: CORRUPTION_GREEN (all text corrupted)
// Glitch effects on all UI elements
```

---

## A6. ANIMATION SPECIFICATIONS

All animations are defined with trigger, duration, what changes, and easing.

### A6.1 Text Typewriter Effect

**Trigger:** When dialogue appears, when journal entry is revealed  
**Duration:** Depends on text length (configurable characters per second)  
**What Changes:** Character visibility (revealed one by one)  
**Easing:** Linear (no easing function needed)

```javascript
// Configuration
const CHARS_PER_SECOND = 20;

// Animation logic
const typewriterAnimation = {
  targetText: "The lighthouse has always been here.",
  displayText: "",
  charsPerMs: CHARS_PER_SECOND / 1000,
  timeElapsed: 0,
  isComplete: false,

  update: function(deltaTime) {
    this.timeElapsed += deltaTime;
    const charsToShow = Math.floor(this.timeElapsed * this.charsPerMs);
    this.displayText = this.targetText.substring(0, charsToShow);
    
    if (charsToShow >= this.targetText.length) {
      this.isComplete = true;
      this.displayText = this.targetText;
    }
  }
};

// During render:
if (typewriterAnimation) {
  typewriterAnimation.update(deltaTime);
  ctx.fillStyle = '#c8c8d8';  // TEXT_PRIMARY
  ctx.font = '14px monospace';
  ctx.fillText(typewriterAnimation.displayText, textX, textY);
  
  // Optional: cursor blink at end
  if (!typewriterAnimation.isComplete) {
    const cursorOpacity = Math.sin(Date.now() / 300) * 0.5 + 0.5;  // oscillate 0.5 → 1.0
    ctx.fillStyle = `rgba(200, 200, 216, ${cursorOpacity})`;
    const cursorX = textX + ctx.measureText(typewriterAnimation.displayText).width + 2;
    ctx.fillText('|', cursorX, textY);
  }
}
```

**Duration Calculation:**  
- Text length / CHARS_PER_SECOND = duration in seconds
- Example: 60 characters at 20 chars/sec = 3 seconds

### A6.2 Fade Transition (Between Phases)

**Trigger:** Phase change (e.g., Dawn → Day, Day → Dusk)  
**Duration:** 800ms  
**What Changes:** Canvas opacity (fade-out old, fade-in new)  
**Easing:** easeInOutQuad

```javascript
const fadeTransition = {
  startTime: Date.now(),
  duration: 800,  // ms
  phase: 'in',  // 'in' or 'out'
  isComplete: false,

  getProgress: function() {
    const elapsed = Date.now() - this.startTime;
    return Math.min(elapsed / this.duration, 1.0);
  },

  getOpacity: function() {
    const progress = this.getProgress();
    // easeInOutQuad
    const t = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
    
    if (this.phase === 'out') {
      return 1 - t;
    } else {
      return t;
    }
  },

  update: function() {
    if (this.getProgress() >= 1.0) {
      this.isComplete = true;
      this.phase = this.phase === 'out' ? 'in' : 'out';
      if (this.phase === 'in') {
        this.startTime = Date.now();
      }
    }
  }
};

// During render:
ctx.globalAlpha = fadeTransition.getOpacity();
// [draw all game content]
ctx.globalAlpha = 1.0;
```

### A6.3 Insight Card Seal Flash

**Trigger:** When an Insight Card transitions from in-progress to sealed  
**Duration:** 600ms total  
**What Changes:** Border color, glow intensity, scale (subtle)  
**Easing:** easeOutElastic

```javascript
const sealFlashAnimation = {
  startTime: Date.now(),
  duration: 600,
  scale: 1.0,
  borderColor: '#c8a832',  // INSIGHT_GOLD
  glowIntensity: 0,

  getProgress: function() {
    const elapsed = Date.now() - this.startTime;
    return Math.min(elapsed / this.duration, 1.0);
  },

  update: function() {
    const progress = this.getProgress();
    // easeOutElastic: bouncy return to origin
    const n = 5.0;
    const c4 = (2 * Math.PI) / 3;
    let t;
    
    if (progress === 0) {
      t = 0;
    } else if (progress === 1) {
      t = 1;
    } else {
      t = Math.pow(2, -10 * progress) * Math.sin((progress * 10 - 0.75) * c4) + 1;
    }

    // Scale oscillates outward then returns
    this.scale = 1.0 + (t * 0.1);  // +10% scale max

    // Glow intensity peaks mid-animation
    this.glowIntensity = Math.sin(progress * Math.PI) * 20;  // 0 → 20 → 0
  }
};

// During render:
sealFlashAnimation.update();
// Draw card with scale transform
ctx.save();
ctx.translate(cardCenterX, cardCenterY);
ctx.scale(sealFlashAnimation.scale, sealFlashAnimation.scale);
ctx.translate(-cardCenterX, -cardCenterY);

// Draw card with enhanced glow
ctx.shadowColor = `rgba(200, 168, 50, ${sealFlashAnimation.glowIntensity / 20})`;
ctx.shadowBlur = sealFlashAnimation.glowIntensity;
// [draw card border & fill]

ctx.restore();
```

### A6.4 Screen Shake on Death

**Trigger:** When player dies or game-over event occurs  
**Duration:** 400ms  
**What Changes:** Canvas translation (x, y offsets)  
**Easing:** easeOutExpo

```javascript
const screenShakeAnimation = {
  startTime: Date.now(),
  duration: 400,
  amplitude: 4,  // pixels max offset

  getProgress: function() {
    const elapsed = Date.now() - this.startTime;
    return Math.min(elapsed / this.duration, 1.0);
  },

  getShakeOffset: function() {
    const progress = this.getProgress();
    // easeOutExpo: fast start, slow end
    const eased = 1 - Math.pow(2, -10 * progress);
    const intensity = (1 - progress) * eased;  // intensity decreases over time

    // Random offset within amplitude, scaled by intensity
    const offsetX = (Math.random() - 0.5) * this.amplitude * 2 * intensity;
    const offsetY = (Math.random() - 0.5) * this.amplitude * 2 * intensity;

    return { x: offsetX, y: offsetY };
  }
};

// During render:
const shake = screenShakeAnimation.getShakeOffset();
ctx.translate(shake.x, shake.y);
// [draw all game content]
ctx.translate(-shake.x, -shake.y);
```

### A6.5 Vignette on Night Phase

**Trigger:** Entering NIGHT phase  
**Duration:** 1200ms (fade-in over time)  
**What Changes:** Vignette opacity (edge darkening)  
**Easing:** easeInQuad

```javascript
const vignetteAnimation = {
  startTime: Date.now(),
  duration: 1200,
  targetOpacity: 0.3,  // max vignette darkness

  getProgress: function() {
    const elapsed = Date.now() - this.startTime;
    return Math.min(elapsed / this.duration, 1.0);
  },

  getOpacity: function() {
    const progress = this.getProgress();
    // easeInQuad
    const eased = progress * progress;
    return this.targetOpacity * eased;
  }
};

// During render (after drawing main game content):
const vignetteOpacity = vignetteAnimation.getOpacity();
const vignette = ctx.createRadialGradient(450, 300, 0, 450, 300, 700);
vignette.addColorStop(0, `rgba(0, 0, 0, 0)`);
vignette.addColorStop(0.8, `rgba(0, 0, 0, 0)`);
vignette.addColorStop(1, `rgba(0, 0, 0, ${vignetteOpacity})`);
ctx.fillStyle = vignette;
ctx.fillRect(0, 0, 900, 600);
```

---

## A7. RESPONSIVE SCALING

### A7.1 Canvas on Different Screen Sizes

The game canvas is 900×600px, but must scale gracefully on various screen sizes.

**Approach: Letterbox (preserve 900×600 aspect ratio)**

```javascript
// In HTML/CSS
const designWidth = 900;
const designHeight = 600;
const designAspect = designWidth / designHeight;  // 1.5

const windowAspect = window.innerWidth / window.innerHeight;

let displayWidth, displayHeight;

if (windowAspect > designAspect) {
  // Window is wider than design aspect — letterbox horizontally
  displayHeight = window.innerHeight * 0.95;  // Leave 5% margin
  displayWidth = displayHeight * designAspect;
} else {
  // Window is taller than design aspect — letterbox vertically
  displayWidth = window.innerWidth * 0.95;  // Leave 5% margin
  displayHeight = displayWidth / designAspect;
}

// Apply to canvas
canvas.style.width = displayWidth + 'px';
canvas.style.height = displayHeight + 'px';
canvas.style.display = 'block';
canvas.style.margin = 'auto';

// Calculate scaling factor
const scaleX = displayWidth / designWidth;
const scaleY = displayHeight / designHeight;
const scale = Math.min(scaleX, scaleY);

// Apply CSS transform to center
canvas.style.transform = `scale(${scale}) translateX(${(window.innerWidth - displayWidth) / 2}px)`;
```

**Alternative: Fill (stretch to fill window, may distort)**

```javascript
// Only use if aspect ratio flexibility is acceptable
canvas.style.width = '100vw';
canvas.style.height = '100vh';
canvas.style.display = 'block';

// Adjust canvas internal resolution to match actual display
const rect = canvas.getBoundingClientRect();
canvas.width = rect.width * window.devicePixelRatio;
canvas.height = rect.height * window.devicePixelRatio;
ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
```

### A7.2 Touch Target Minimum Sizes

On mobile/touch devices, interactive elements must be large enough to tap accurately.

**Minimum touch target size:** 44×44px (iOS HIG standard)

```javascript
// Button sizing
const buttonMinWidth = 60;  // pixels
const buttonMinHeight = 44;  // pixels

// If content is smaller, expand button area
const finalButtonWidth = Math.max(contentWidth + 16, buttonMinWidth);
const finalButtonHeight = Math.max(contentHeight + 8, buttonMinHeight);

// Hitbox for touch detection
const hitbox = {
  x: buttonX,
  y: buttonY,
  width: finalButtonWidth,
  height: finalButtonHeight,

  contains: function(px, py) {
    return px >= this.x && px < this.x + this.width &&
           py >= this.y && py < this.y + this.height;
  }
};

// On touch, detect hitbox containing touch point
document.addEventListener('touchend', (e) => {
  const touch = e.changedTouches[0];
  const rect = canvas.getBoundingClientRect();
  
  // Scale touch coordinates to canvas
  const canvasX = (touch.clientX - rect.left) / (rect.width / 900);
  const canvasY = (touch.clientY - rect.top) / (rect.height / 600);

  if (hitbox.contains(canvasX, canvasY)) {
    // Button tapped
  }
});
```

### A7.3 Responsive Font Sizing

Text sizes may need to adjust on very small screens.

```javascript
// Calculate responsive font size
const minScreenSize = Math.min(window.innerWidth, window.innerHeight);
const fontSize = Math.max(10, Math.min(14, minScreenSize * 0.015));

// Apply when rendering
ctx.font = `${fontSize}px monospace`;
```

---

## APPENDIX: Color Palette Quick Reference

| Color Name | Hex Value | Usage |
|---|---|---|
| VOID | #0a0a0f | Deepest background, darkness |
| DEEP | #0f0f1a | Panel backgrounds |
| SURFACE | #141428 | Raised surfaces, buttons |
| BORDER | #2a2a45 | Standard panel borders |
| BORDER_HI | #4a4a70 | Highlighted borders, emphasis |
| TEXT_PRIMARY | #c8c8d8 | Main readable text |
| TEXT_SECONDARY | #787890 | Secondary, muted text |
| TEXT_HIGHLIGHT | #e8e8f8 | Important text, hover |
| INSIGHT_GOLD | #c8a832 | Insight currency |
| RESONANCE_BLUE | #3278c8 | Resonance currency |
| CORRUPTION_GREEN | #28a832 | Vael-fed state, corruption |
| WARNING_RED | #c83228 | Danger, hostile, death |
| BEAM_AMBER | #e8a832 | Lighthouse lit, balanced |
| BEAM_WHITE | #d8d8f8 | Betrayals accumulating |
| BEAM_GREEN | #28e832 | Corruption |
| NIGHT_PURPLE | #1a0a28 | Night phase background |
| GHOST_CYAN | #28c8c8 | Ghost keeper text/borders |
| SAFE_GREEN | #287832 | Positive states |

---

**END OF DOCUMENT A**
