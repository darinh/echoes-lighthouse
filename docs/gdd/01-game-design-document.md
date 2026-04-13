# ECHOES OF THE LIGHTHOUSE
## Master Game Design Document

---

**Document Version:** 1.0  
**Date:** January 2025  
**Status:** Production Ready  
**Classification:** Internal Studio Document  

**Intended Audience:** Engineers, designers, QA testers, producers, narrative writers, and any team member who needs complete understanding of this project to begin implementation without external reference.

**Document Purpose:** This Master GDD is the single source of truth for *Echoes of the Lighthouse*. It contains exhaustive specifications for all game systems, mechanics, content, and edge cases. Any team member should be able to implement their assigned feature using only this document and standard web development knowledge. Ambiguity is failure—every mechanic is defined to the point of implementability.

---

## 1. Document Header

| Field | Value |
|-------|-------|
| **Game Title** | Echoes of the Lighthouse |
| **Working Title** | EOTL |
| **Version** | 1.0 |
| **Document Date** | January 2025 |
| **Target LOC** | ~5,000 lines of JavaScript |
| **Platform** | Single HTML file, zero external dependencies |
| **Engine** | Vanilla JavaScript ES2020+, HTML5 Canvas 2D, Web Audio API (synthesized), localStorage |
| **Target Browsers** | Modern Chromium (Chrome 90+, Edge 90+), Firefox 88+ |
| **Development Timeline** | 8 weeks estimated |
| **Content Rating** | Teen (T) - Mature themes, no graphic violence |

---

## 2. Vision Statement

### 2.1 The Player's Fantasy

**What the player FEELS they are doing:**

The player is a lighthouse keeper on a haunted island who slowly pieces together a supernatural mystery by dying, remembering, and returning. They are not a hero with a sword—they are a detective with a journal. Every death teaches them something. Every loop brings them closer to a truth that the island desperately wants to hide.

The fantasy is: **"I am the only one who remembers. My knowledge is my power. Death is not failure—it is research."**

### 2.2 What Makes This Game Unlike Anything Else

Three elements combine to create a unique experience:

1. **Death as Discovery:** Unlike roguelikes where death means lost progress, death here means *gained understanding*. Players actively seek risky areas because dying there might reveal something new.

2. **No Combat, Pure Investigation:** This is not an action game with story elements—it is a story game with survival elements. The only "weapon" is the journal. The only "enemy" is ignorance.

3. **Moral Complexity Without Metrics:** The game never tells players they are "good" or "evil." They make choices. The world changes. NPCs remember. The lighthouse beam shifts color. But no meter judges them. Players must judge themselves.

### 2.3 Three Design Pillars

#### Pillar 1: Knowledge is the Only Permanent Progression

**Definition:** Every game system reinforces that understanding—not items, not stats, not upgrades—is what carries forward across death.

**Manifestation in Gameplay:**
- The Journal persists across all loops. Every discovery, every sealed insight, every NPC relationship state survives death. A player on loop 15 has a Journal full of knowledge; a new player has an empty one. This is the difference.
- Areas that were inaccessible become accessible not because players found a key, but because they learned the door's secret. The Mechanism Room doesn't open with an item—it opens when players have sealed specific Insights proving they understand what lies within.

#### Pillar 2: Every NPC is Trapped by Something You Can Solve

**Definition:** No quest-giver hands the player a task they could do themselves. Every NPC is blocked by a physical, social, supernatural, or moral constraint that only the player can navigate.

**Manifestation in Gameplay:**
- Mira, the blind former mapmaker, buried evidence in the Manor's East Wing 30 years ago. She cannot retrieve it—she cannot see, and the building has collapsed since. Only the player can navigate the dangerous ruins with working eyes and knowledge of what they're looking for.
- Cael, the ferryman, knows where the previous Keeper went, but revealing this would make him complicit in a conspiracy that could destroy his family. Only the player—an outsider with loop-immunity—can expose the truth without Cael being implicated.

#### Pillar 3: The World Reacts, But Never Judges

**Definition:** Player choices have visible, mechanical consequences, but the game never assigns moral labels. Players see effects; they assign meaning.

**Manifestation in Gameplay:**
- If the player repeatedly lies to NPCs, the lighthouse beam shifts from amber to white. There is no "Deception +5" popup. The beam just changes. Observant players notice; unobservant players feel something is different without knowing why.
- If the player betrays Orin by revealing his secret to Sister Aldis, Orin's forge is closed the next morning. Orin doesn't say "you betrayed me"—he says "I can't work today. Too much on my mind." The player must connect cause and effect.

---

## 3. Player Experience Goals

### 3.1 First Loop (Minutes 0-15)

**What the player feels:** Disorientation, isolation, quiet dread, curiosity.

The player wakes in a cottage they don't recognize. A journal sits on the nightstand—empty except for a handwritten note: "Keep the light burning. Do not let it go dark. —H.V." They explore the cottage. They find a map showing 10 locations. They walk to the lighthouse. They meet their first NPC—perhaps Orin, who seems helpful but evasive. Dusk falls suddenly. They race to the lighthouse but don't know how to light it. The night is dark. They hear things. They see shapes. They wake in the cottage. The journal now has a new entry: "Day 1. The light failed. Something stirred."

**Key emotions:** "What is this place?" "What happened to the last Keeper?" "Why do I feel like I'm being watched?" "I died... but I'm still here?"

### 3.2 Loop 5 (Hours 1-2)

**What the player feels:** Growing confidence, dawning horror, attachment to NPCs, strategic planning.

By loop 5, the player has lit the lighthouse successfully at least once. They've talked to most NPCs. They've sealed 2-3 Insights. They understand the basic rhythm: day = explore, dusk = return, night = consequence. But they've also started noticing contradictions. Orin says the previous Keeper left three weeks ago. Nessa says it's been three months. One of them is lying—or one of them is in a different loop. The player starts planning their days: "I'll spend morning getting Orin to Resonance 3, afternoon checking the cliffs, return by dusk." They have theories. They have suspicions. The Journal is filling up.

**Key emotions:** "I'm starting to understand." "I don't trust Aldis." "If I can just find that one piece of evidence..." "The Vael—what IS it?"

### 3.3 Loop 12 (Hours 5-7)

**What the player feels:** Moral weight, difficult choices, revelations, urgency.

By loop 12, the player has likely unlocked the Mechanism Room. They've met Elias—the ghost of Keeper #2 trapped in the lighthouse's heart. They know The Vael is not a monster but an ancient intelligence, wrongly imprisoned. They've reached high Resonance with 3-4 NPCs and learned their deepest secrets. Aldis believes The Vael is sacred and will sabotage the lighthouse if she discovers the truth. Orin participated in sealing a previous Keeper alive. Nessa traded medicine for silence. The player faces choices: Who do they trust? Who do they expose? Can The Vael be freed safely? Should it be?

**Key emotions:** "There are no good options." "Everyone has done something terrible." "I understand why they did it, but..." "The ending I'm heading toward—is this what I want?"

### 3.4 First Ending (Hours 8-12)

**What the player feels:** Catharsis, lingering questions, reflection, the urge to see alternatives.

The player completes one of five endings. Depending on their choices, The Vael is contained, freed, or transcended. Keepers pass on or remain trapped. The island sinks or is reborn. An epilogue shows the consequences for each NPC the player significantly interacted with. The ending is emotionally complete—but the player saw doors they didn't open. NPCs they didn't fully understand. Insights they didn't seal. The Journal shows: "73% Knowledge Discovered."

**Key emotions:** "That was worth it." "But I wanted to save Petra too." "What would have happened if I'd trusted Aldis?" "One more playthrough—just to see."

### 3.5 What Makes Them Start a New Playthrough

Three compelling reasons:

1. **Unseen Endings:** The player saw one ending. Four remain. Each requires different choices, different NPC relationships, different sealed Insights. The Liberation ending requires freeing The Vael. The Keeper's Peace requires completing all NPC quests AND lighting the lighthouse every single night. These are mutually exclusive paths.

2. **Unanswered Questions:** Even in completion, mysteries remain. Who is H.V.? What happened to Keeper #4? Why does Cael refuse to leave the harbour after sunset? These answers exist but require different investigative paths.

3. **Build Diversity:** The Witness, Confessor, and Scholar archetypes play differently. A Witness playthrough emphasizes observation and Archives. A Confessor playthrough emphasizes NPC relationships. A Scholar playthrough emphasizes deduction puzzles. Replaying as a different archetype reveals content impossible to find otherwise.

---

## 4. Game Overview

### 4.1 Genre Definition

**Precise Genre:** Narrative mystery roguelite with persistent knowledge progression, turn-based exploration, and relationship simulation.

**What this means in practice:**
- **Narrative mystery:** The core engagement is solving a multi-layered mystery through dialogue, environmental clues, and document discovery. Story is not context for gameplay—story IS gameplay.
- **Roguelite with persistent knowledge:** Death resets the game world but not the player's accumulated understanding. The Journal, sealed Insights, NPC relationship states, and unlocked Archives persist across all loops.
- **Turn-based exploration:** Movement between locations consumes time in discrete units (15-minute increments). This is not real-time navigation—it is resource allocation disguised as geography.
- **Relationship simulation:** NPC relationships are tracked via Resonance scores (0-5) and hidden consequence flags. Building Resonance unlocks dialogue; consequences change world state.

### 4.2 Platform and Technical Constraints

| Constraint | Specification |
|-----------|---------------|
| **Distribution Format** | Single .html file, <2MB total including all assets |
| **External Dependencies** | Zero. No CDNs, no npm packages, no external fonts. |
| **Rendering** | HTML5 Canvas 2D (single canvas element, 960x540 native resolution, scaled responsively) |
| **Audio** | Web Audio API only. All sounds synthesized at runtime using oscillators, filters, and envelopes. No audio file imports. |
| **Storage** | localStorage only. Save format: JSON. Maximum save size: 100KB. |
| **JavaScript Standard** | ES2020+. No transpilation. Features used: nullish coalescing, optional chaining, async/await, Map/Set, template literals. |
| **Browser Support** | Chrome 90+, Firefox 88+, Edge 90+. Safari explicitly unsupported (Web Audio inconsistencies). |
| **Input** | Mouse/touch primary. Keyboard shortcuts secondary. |
| **Accessibility** | All text readable at 16px minimum. Color-blind safe palette. All actions possible via mouse alone. |
| **Performance Target** | 30 FPS minimum on 2018 mid-range laptop. No noticeable input lag (<100ms response). |

### 4.3 Session Length Expectations

| Session Type | Duration | Natural Exit Points |
|-------------|----------|---------------------|
| **Micro Session** | 5-10 minutes | After banking Insight; after single NPC conversation |
| **Short Session** | 15-30 minutes | After completing one loop; after lighting lighthouse |
| **Standard Session** | 45-90 minutes | After completing quest; after major discovery |
| **Long Session** | 2-3 hours | After reaching new ending; after completing NPC questline |

**Auto-Save Points:** Game auto-saves after every: location transition, NPC dialogue completion, Insight seal, loop reset, lighthouse lighting.

### 4.4 Target Audience

**Primary:** Adults 25-45 who enjoy narrative puzzle games like *Return of the Obra Dinn*, *Outer Wilds*, *The Forgotten City*, or *Her Story*. They have limited gaming time, prefer meaningful choices over mechanical skill, and enjoy games they can think about when not playing.

**Secondary:** Teens 16-24 who enjoy atmospheric horror games like *SOMA*, *Amnesia*, or *Oxenfree*. They're drawn by mood and mystery, stay for character relationships.

**Excluded Audiences:** Players seeking action gameplay, competitive mechanics, or open-world exploration. Players who dislike reading or text-heavy games.

### 4.5 Content Rating and Why

**Rating:** Teen (T) / PEGI 12

**Content Descriptors:**
- **Mild Violence:** No combat, but NPCs describe deaths, drownings, and ritual sacrifice in dialogue. A character mentions murdering their child (mercy killing context).
- **Mild Language:** NPCs occasionally curse ("damn," "hell") but no strong profanity.
- **Disturbing Themes:** Wrongful imprisonment, institutional conspiracy, guilt, suicide ideation (NPC context, never glorified). The Vael's backstory involves being punished for benevolence.
- **No Sexual Content:** No romance mechanics. No suggestive dialogue.
- **No Substances:** Nessa's apothecary deals in medicine, not intoxicants.

---

## 5. Core Game Loop — Complete Specification

### 5.1 Loop Overview

One complete loop represents one in-game day (dawn to dawn). Real-world duration: 5-15 minutes depending on player efficiency and exploration depth.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          SINGLE LOOP STRUCTURE                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│  DAWN (0:00)          │ Wake in Cottage → Journal review → Plan day            │
│  ↓                    │                                                         │
│  DAY PHASE            │ Turn-based exploration of locations                     │
│  (0:00 - 18:00)       │ NPC dialogues, discoveries, quests, choices             │
│  ↓                    │                                                         │
│  DUSK (18:00)         │ Warning triggers → Must reach lighthouse               │
│  ↓                    │                                                         │
│  NIGHT PHASE          │ If light LIT: visions + story progression              │
│  (18:00 - 24:00)      │ If light DARK: The Vael stirs + consequences           │
│  ↓                    │                                                         │
│  DAWN (Loop resets)   │ Return to Cottage → Journal persists → Day counter +1  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Phase 1: Dawn (The Start of Each Loop)

**Duration:** Instantaneous (no time passes during dawn sequence)

**What Happens:**
1. Screen fades from black. Ambient audio: distant waves, creaking wood, seagulls.
2. Camera: Interior of Keeper's Cottage, bed visible, sunlight through window.
3. Text overlay: "Day [X]" where X is the current loop number.
4. Journal automatically opens to the Active Threads page.

**Player Actions Available at Dawn:**
- **Read Journal:** Review all persistent information (discoveries, theories, NPC states).
- **Review Active Threads:** 2-3 suggested investigation paths based on current game state.
- **View Map:** See all 10 locations, travel time estimates, danger indicators.
- **Begin Day:** Close journal and start Day Phase timer.

**What Cannot Be Done at Dawn:**
- Travel to any location (must first start the day)
- Interact with NPCs (none present in cottage)
- Spend or earn Insight (economy paused until day starts)

**Active Threads System:**
The Journal always displays 2-3 active threads based on game state. These are not quests—they are suggested avenues of investigation generated from unsealed hypotheses and incomplete NPC relationships.

**Thread Generation Rules:**
1. If Resonance with any NPC is 1-4: "Learn more about [NPC name]'s secret"
2. If environmental clue discovered but not understood: "Investigate [clue location]"
3. If NPC gave partial information: "Ask [NPC] about [topic]"
4. If approaching ending threshold: "Confront [key decision point]"

### 5.3 Phase 2: Day Phase (Core Exploration)

**Duration:** 18 in-game hours (0:00 - 18:00), tracked in 15-minute increments.

**Time Advancement:**
- Moving between adjacent locations: 15 minutes
- Moving between non-adjacent locations: 30 minutes (must path through intermediate)
- Initiating NPC dialogue: 0 minutes (dialogue itself has no time cost)
- Examining environmental object: 15 minutes
- Completing dialogue tree: Variable (0-15 minutes based on length)
- Resting at cottage: Restores HP, costs 60 minutes

**Location Adjacency Map:**
```
                    Coastal Cliffs (9)
                          │
                    Manor Ruins (8)
                          │
    Apothecary (5)──Village Square (2)──Chapel (7)
          │               │               │
       Forge (4)    Lighthouse Ext (3)    │
                          │               │
                   Mechanism Room (10)    │
                          │               │
                   Harbour & Pier (6)─────┘
                          │
                  Keeper's Cottage (1)
```

**What Players CAN Do During Day Phase:**
- Travel between locations (costs time)
- Examine environmental objects (costs 15 min, may grant Insight)
- Initiate dialogue with present NPCs (no time cost for dialogue itself)
- Use Insight to unlock deeper dialogue options
- Make choices that affect NPC relationships
- Seal Insights (requires sufficient Insight, changes world state permanently)
- Read Journal at any time (pauses game)
- Open Map at any time (pauses game)

**What Players CANNOT Do During Day Phase:**
- Access the Mechanism Room before specific Insights are sealed (door is locked by supernatural barrier)
- Speak to NPCs not currently present at that location (NPCs have schedules)
- Reverse sealed Insights
- Skip time forward
- Fast travel (no teleportation mechanic exists)

**NPC Location Schedules:**

| Time Block | Orin | Nessa | Cael | Aldis | Mira | Petra |
|-----------|------|-------|------|-------|------|-------|
| 0:00-6:00 | Forge | Apothecary | Harbour | Chapel | Cliffs | Harbour |
| 6:00-12:00 | Forge | Village | Harbour (tidal) | Village | Manor | Village |
| 12:00-18:00 | Village | Apothecary | Harbour | Chapel | Cottage | Harbour |

**Tidal Schedule (Affects Cael and Harbour Access):**
- High Tide: 6:00-9:00 and 18:00-21:00 — Ferry can dock, Cael available
- Low Tide: 0:00-6:00 and 12:00-18:00 — Ferry inaccessible, Cael at pier but cannot leave
- Mid Tide: Other times — Ferry can dock but no passengers (Cael will explain this)

### 5.4 Phase 3: Dusk Transition

**Trigger:** Time reaches 18:00

**What Happens:**
1. Ambient light dims over 2 seconds (visual cue)
2. Warning chime plays (low bell tone, synthesized)
3. Text overlay: "Dusk falls. The lighthouse awaits."
4. Player has 2 hours (8 time units of 15 minutes) to reach the lighthouse exterior

**If Player is NOT at Lighthouse Exterior by 20:00:**
- Travel options become limited (only adjacent locations)
- At 20:00: Dark Night Phase triggers automatically

**If Player is at Lighthouse Exterior by 20:00:**
- Lighthouse repair minigame initiates (if components gathered)
- If successful: Light Night Phase triggers
- If failed/skipped: Dark Night Phase triggers

### 5.5 Lighthouse Repair Minigame

**Components Required:** The lighthouse requires 3 components to light. These are consumed each loop.

| Component | Found At | Acquisition |
|-----------|----------|-------------|
| **Wick** | Forge (Orin) | Given freely after Resonance 1 with Orin |
| **Oil** | Harbour (storage shed) | Examining shed, costs 15 minutes |
| **Lens Polish** | Apothecary (Nessa) | Given after any dialogue with Nessa |

**On First Loop:** Player has no components. Dark Night is guaranteed. This is intentional tutorial design.

**Repair Mechanic:**
1. Player accesses lighthouse console (automatic when at Lighthouse Exterior after 18:00 with all components)
2. Simple matching puzzle: arrange 3 component icons into correct slots (order: Oil → Wick → Lens)
3. Time limit: 30 seconds real-time
4. Success: Lighthouse ignites, Light Night begins
5. Failure: Components consumed anyway, Dark Night begins

**After Loop 3:** Player can choose to auto-light if all components present (skip minigame option).

### 5.6 Phase 4: Night Phase

#### Light Night (Lighthouse Successfully Lit)

**Duration:** 6 in-game hours (18:00 - 24:00), represented as single narrative scene

**What Happens:**
1. Scene: Player watches from cottage window as lighthouse beam sweeps the sea
2. Vision triggers (based on loop number and sealed Insights)
3. Vision reveals story information, often from perspective of previous Keepers
4. Vision ends with cryptic statement relevant to current investigation
5. Player may journal new information or seal new Insight if threshold met
6. Dawn triggers

**Vision Content by Loop:**

| Loop | Vision Content | Information Revealed |
|------|---------------|---------------------|
| 1-3 | Fragmentary: images of storm, drowning, lighthouse beam | Mood-setting, no concrete info |
| 4-6 | Keeper #3's perspective: "The mechanism must never stop" | Mechanism Room exists, hinted |
| 7-9 | Keeper #2 (Elias): "I didn't know what I was feeding" | The Vael requires something |
| 10-12 | Keeper #1 (Aldric): "We had no choice. It was the island or the world" | Original imprisonment revealed |
| 13+ | The Vael's perspective: "I was trying to help them" | Moral complexity, twist preparation |

#### Dark Night (Lighthouse Failed to Light)

**Duration:** 6 in-game hours, represented as distress sequence

**What Happens:**
1. Scene: Darkness. Waves crashing. Shapes moving in periphery.
2. The Vael whispers (text overlay, no voice): fragmented, unsettling, sometimes helpful
3. Consequence roll: 50% chance of one of the following:
   - NPC disturbance (one NPC's dialogue changes next loop, they "dreamed of something")
   - Environmental change (one location becomes slightly more dangerous)
   - Insight penalty (lose 10% of current Insight)
   - Nothing visible (the dread is the consequence)
4. If 3+ Dark Nights in a row: Major consequence (NPC death or location lockout)
5. Dawn triggers

**The Vael's Whispers (Examples):**
- "They called me monster. I called them children."
- "The beam doesn't keep me in. It keeps you out."
- "Ask the ferryman what he carries."
- "Keeper. Keeper. You're the seventh. The seventh never lasted."

### 5.7 Loop Reset (Dawn of New Loop)

**What Persists Across Loops (Exhaustive List):**

| Category | Specific Data Persisted |
|----------|------------------------|
| **Journal** | All discoveries, all theories, all notes player has made |
| **Sealed Insights** | All Insights that have been sealed (cannot be unsealed) |
| **NPC Resonance** | Current Resonance level (0-5) with each NPC |
| **NPC Consequence Flags** | Hidden flags tracking betrayals, lies, specific choices |
| **Resonance Bank** | Accumulated Resonance points not yet spent |
| **Archives** | All Archive meta-unlocks purchased with Resonance |
| **Loop Counter** | Total loops completed |
| **Dark Night Counter** | Consecutive Dark Nights (resets on Light Night) |
| **Ending Flags** | Progress toward each of 5 endings |
| **World State Changes** | Permanent changes from sealed Insights (e.g., door opened, NPC dead) |

**What Resets Each Loop (Exhaustive List):**

| Category | Specific Data Reset |
|----------|---------------------|
| **Player Position** | Always start at Keeper's Cottage |
| **Time** | Always reset to 0:00 (dawn) |
| **Loop Insight** | Current loop's Insight count resets to 0 |
| **NPC Positions** | All NPCs return to their default schedule positions |
| **Consumables** | Wick, Oil, Lens Polish must be re-gathered |
| **Environmental Objects** | All examinable objects reset to unexamined state |
| **Active Dialogues** | Any in-progress dialogue trees reset to beginning |
| **Quest Progress** | Quest steps reset (but quest rewards, once earned, persist) |

### 5.8 Death Within a Loop

**What Causes Death:**
- Remaining at Coastal Cliffs during Dark Night (environmental hazard)
- Entering Mechanism Room without proper Insights (supernatural barrier)
- Triggering specific NPC hostility (Sister Aldis if she discovers certain truths)
- 3 consecutive Dark Nights with no other actions (island claims you)

**Death Consequences:**
- 20% of current loop's Insight is lost permanently
- Loop resets immediately to Dawn
- Journal gains entry: "I died. [Cause of death]. The island remembers."
- All other persistent data unchanged

**Death is NOT Required:** Game can be completed with zero deaths if player is careful.

---

## 6. Complete Mechanics Reference

### 6.1 Insight (Per-Loop Currency)

**What It Is:** Insight represents understanding gained within a single loop. It is the primary spending currency for unlocking deeper NPC dialogues, sealing hypotheses, and purchasing certain interactions.

**How It Is Earned:**

| Source | Amount | Frequency |
|--------|--------|-----------|
| First visit to new location | 5-15 (based on danger) | Once per location, ever |
| Examining environmental object | 2-5 | Once per object, per loop |
| Completing NPC dialogue node | 3-8 | Once per unique node, ever |
| Quest completion | 20-50 | Once per quest, ever |
| Light Night vision | 5-10 | Once per unique vision, ever |
| Dark Night whisper (sometimes) | 2-5 | Variable, not guaranteed |

**Anti-Exploit Measures:**
- First-visit bonuses are one-time-ever, tracked permanently
- Dialogue nodes flag as "heard" permanently; repeating gives 0 Insight
- Environmental objects grant Insight only once per loop (reset, but diminishing returns apply)
- Hard cap: 150 Insight maximum per loop

**Diminishing Returns:**
- After 120 Insight in a single loop: all sources grant 40% of base value (rounded down)
- After 150 Insight: all sources grant 0

**How It Is Spent:**

| Expenditure | Cost | Effect |
|-------------|------|--------|
| Unlock deeper NPC dialogue | 10-50 | Access new dialogue branch |
| Seal Insight Card | 25-75 | Make hypothesis permanent, change world state |
| Activate relic (if applicable) | 50-100 | Single-use powerful effect |

**Display:** Insight shown as number in top-right HUD: "Insight: 47/150"

**Death Tax:** On death, lose 20% of current loop Insight (e.g., die with 100 Insight, lose 20, respawn with 0 for new loop but total persistent Insight unchanged).

**Edge Cases:**
- If player has 0 Insight and needs to spend: action simply unavailable, greyed out
- If player hits 150 cap: sources show "(capped)" and grant 0
- If player dies at exactly 0 Insight: no penalty (can't lose what you don't have)

### 6.2 Resonance (Persistent Currency)

**What It Is:** Resonance is a persistent currency earned through NPC interactions and used to purchase Archive upgrades. Unlike Insight, Resonance survives all loops.

**How It Is Earned:**

| Source | Amount | Conditions |
|--------|--------|------------|
| Increasing NPC Resonance level | 10 per level | First time reaching each level with each NPC |
| Making choice aligned with NPC values | 5 | Max once per NPC per loop |
| Completing NPC questline | 25 | Once per NPC, ever |
| Reaching ending | 50 | Once per ending type |

**Bank Capacity:** Maximum 200 Resonance can be held. Excess is lost.

**How It Is Spent:** Resonance purchases Archive upgrades (see section 6.4).

**Display:** Resonance shown in Journal under "Archives" tab: "Resonance: 87/200"

**Edge Cases:**
- Earning Resonance while at cap: "Bank Full" warning, Resonance lost
- Spending below 0: impossible, purchases require exact amount
- NPC Resonance vs. currency Resonance: these are separate. NPC Resonance (0-5) represents relationship. Currency Resonance is spendable resource.

### 6.3 NPC Resonance (Relationship Score)

**What It Is:** Each NPC has a Resonance score from 0 to 5 representing the player's relationship depth with them. This is separate from spendable Resonance currency.

**How It Is Increased:**

| Action | Resonance Gained |
|--------|-----------------|
| Complete first dialogue tree | +1 (one-time) |
| Spend 25 Insight on deeper dialogue | +1 (max 1 per loop via spending) |
| Make choice aligned with NPC values | +1 (max 1 per loop via choices) |
| Complete NPC quest step | +1 (per step) |
| Give NPC relevant item/info | +1 (contextual) |

**Maximum per Loop:** NPC Resonance can increase by at most 2 per loop (natural gating to prevent rushing).

**How It Is Decreased:**
- Betray NPC's trust: -2 (permanent, cannot be undone)
- Make choice opposed to NPC values: -1 (max 1 per loop)
- Reveal NPC's secret to enemy: -3 (permanent, often triggers hostility)

**Resonance Unlocks:**

| Level | Effect |
|-------|--------|
| 0 | Basic dialogue only; NPC is wary |
| 1 | NPC shares surface-level information |
| 2 | NPC hints at deeper secrets; side quest may unlock |
| 3 | NPC becomes friendly; offers assistance |
| 4 | NPC reveals personal backstory |
| 5 | NPC shares final secret; special ending options may unlock |

**Display:** Shown in Journal under NPC tab as portrait + filled circles: "Orin: ●●●○○ (3/5)"

### 6.4 Archives (Permanent Meta-Unlocks)

**What It Is:** Archives are permanent upgrades purchased with Resonance currency. Once purchased, they persist across all future loops and playthroughs (unless player manually resets).

**Available Archive Unlocks:**

| Archive | Cost | Prerequisite | Effect |
|---------|------|--------------|--------|
| **Swift Legs** | 25 | None | Travel between adjacent locations costs 10 minutes instead of 15 |
| **Extended Day** | 50 | Swift Legs | Day Phase ends at 19:00 instead of 18:00 |
| **Deep Pockets** | 30 | None | Components (Wick, Oil, Polish) persist across one loop |
| **Keen Eyes** | 40 | Loop 5+ | Environmental objects highlight when approached |
| **Silver Tongue** | 35 | Any NPC at Resonance 3 | Insight cost for deeper dialogue reduced by 25% |
| **Death's Memory** | 60 | Died 3+ times | On death, retain 10% of current Insight instead of losing 20% |
| **Lighthouse Affinity** | 75 | Lit lighthouse 5+ times | Auto-light option available from Loop 1 |
| **Echo Sight** | 100 | Loop 10+ | See ghost Keepers in Mechanism Room earlier |
| **Vael's Whisper** | 100 | 5+ Dark Nights survived | Dark Night always grants Insight (no penalty roll) |
| **True Sight** | 150 | All above unlocked | See exact Resonance numbers for NPCs; see consequence flags |

**Display:** Archives shown as grid in Journal, purchased = lit, unpurchased = dim with cost shown.

### 6.5 The Journal

**What It Is:** The Journal is the player's persistent record of all discoveries, available at any time by pressing J or clicking the Journal icon.

**Journal Tabs:**

1. **Active Threads:** Shows 2-3 current investigation suggestions (auto-generated)
2. **Discoveries:** Chronological list of all facts learned, organized by category
3. **NPCs:** Portrait, name, current Resonance, key facts known about each
4. **Sealed Insights:** All hypotheses that have been sealed, with effects
5. **Map:** Island map with location status (visited/unvisited, danger level)
6. **Archives:** Meta-unlocks available and purchased

**How Discoveries Are Recorded:**
- Automatic: Any dialogue that reveals factual information creates a Discovery entry
- Automatic: Examining environment objects with information creates an entry
- Manual: Player can add custom notes to any Discovery (text field, max 200 characters)

**Active Thread Generation Logic:**
```
IF any NPC Resonance is 1-4 AND not at hostile:
  ADD thread: "Build trust with [NPC]"
  
IF environmental clue discovered but related Insight not sealed:
  ADD thread: "Investigate [clue subject]"
  
IF quest in progress but incomplete:
  ADD thread: "Complete [quest name]"
  
IF loop count >= 8 AND Mechanism Room not entered:
  ADD thread: "Find way into Mechanism Room"
  
IF ending conditions partially met:
  ADD thread: "Pursue [ending name] path"
```

**Display:** Journal uses book metaphor—pages flip left/right, tabs are bookmarks on page edges.

### 6.6 Insight Cards

**What They Are:** Insight Cards are hypotheses the player forms based on evidence. When enough evidence exists, an Insight Card can be "sealed," making the hypothesis permanent and changing the game world.

**How Cards Are Formed:**
1. Player discovers 2-3 related pieces of evidence (through dialogue, examination, visions)
2. System recognizes evidence cluster matches a potential Insight Card
3. Card appears in Journal under "Theories" (unsealed cards)
4. Player can view card: shows evidence and hypothesis

**Sealing an Insight Card:**
- Requires: All evidence for that card discovered
- Requires: Insight cost (25-75, varies by card significance)
- Action: Player clicks "Seal This Insight" button on card
- Effect: Card moves to Sealed Insights; world state changes permanently

**Insight Card Effects:**

| Effect Type | Example |
|-------------|---------|
| **Unlock Area** | "The Mechanism Room's purpose" unlocks Mechanism Room door |
| **Change NPC Dialogue** | "Orin's guilt" gives new dialogue options with Orin |
| **Reveal Secret** | "The Vael's nature" changes how The Vael communicates |
| **Enable Ending** | "The Truth" card required for Truth ending |

**Example Insight Card:**

> **The Ferryman's Burden**
> 
> Evidence:
> - Cael refuses to discuss the night of the storm
> - Shipping manifest missing entries for 3 weeks prior
> - Nessa mentioned "what Cael brought back"
> 
> Hypothesis: Cael transported something (or someone) related to the Keeper's disappearance.
> 
> Seal Cost: 45 Insight
> 
> Effect: New dialogue option with Cael; Harbour night events change.

### 6.7 Location Exploration

**Structure:** Each of 10 locations is a single "room" with:
- 1 background image
- 0-3 examinable objects (click to examine, costs 15 minutes)
- 0-2 NPCs present (based on schedule)
- 0-1 exits to adjacent locations

**Action Types Available at Locations:**

| Action | Time Cost | Result |
|--------|-----------|--------|
| Examine object | 15 min | Gain Insight, possibly discover clue |
| Talk to NPC | 0 min | Initiates dialogue system |
| Rest (Cottage only) | 60 min | Restore to full (if depleted by hazard) |
| Travel to adjacent | 15 min | Change location |
| Travel to non-adjacent | 30 min | Change location via path |

**Location Danger Levels:**

| Location | Danger Level | Effect |
|----------|-------------|--------|
| Keeper's Cottage | None | Safe always |
| Village Square | None | Safe always |
| Lighthouse Exterior | None | Safe always |
| The Forge | Low | None during day |
| The Apothecary | Low | None during day |
| Harbour & Pier | Low | Tidal restrictions only |
| The Chapel | Medium | Aldis may become hostile if certain truths known |
| Manor Ruins (East Wing) | Medium | Structural collapse risk (random 10% per visit, costs 30 min) |
| Coastal Cliffs | High | During Dark Night, 50% death risk |
| Mechanism Room | Extreme | Cannot enter without proper Insights; death if forced |

### 6.8 NPC Interaction (Dialogue System)

**Dialogue Structure:**
- Dialogue trees with branching paths
- Each NPC has 20-50 dialogue nodes total
- Nodes are flagged: heard/unheard, locked/unlocked
- Locked nodes require Insight spend or Resonance threshold

**Dialogue Node Types:**

| Type | Description |
|------|-------------|
| **Greeting** | Entry point, always available, changes based on Resonance |
| **Information** | Reveals facts, grants Insight, marks clue discovered |
| **Question** | Player asks NPC for specific information |
| **Deep Question** | Requires Insight spend or Resonance 3+ |
| **Choice** | Player makes decision affecting NPC relationship |
| **Quest Hook** | NPC offers quest, appears at Resonance threshold |
| **Final Truth** | Resonance 5 only, reveals NPC's deepest secret |

**Dialogue Flow:**
1. Player initiates dialogue (click on NPC)
2. Greeting node plays based on current Resonance
3. Player sees available response options (greyed if locked)
4. Selecting option: plays next node, may branch
5. Player can exit dialogue at any time (some branches have "point of no return" warnings)

**Sample Dialogue Tree (Orin, Resonance 0-1):**
```
GREETING: "Another Keeper, eh? They don't last long here."
  → "What do you mean?" (Information node)
      → "The last one vanished. Storm took him, they say."
  → "I need supplies." (Forge transaction)
      → "Wicks, I can make. Oil's at the harbour."
  → "Tell me about yourself." (Resonance gate: requires R1)
      → [Locked: "He seems unwilling to share."]
  → [Leave]
```

### 6.9 The Night Phase

**What Triggers Night:** Time reaching 18:00 (Dusk transition)

**Two Night States:**

**Light Night (Lighthouse Lit):**
- Duration: Single narrative scene (~60 seconds)
- Player watches from cottage window
- Vision plays (content based on loop/Insights, see section 5.6)
- May seal Insight if conditions met
- Ends with Dawn transition

**Dark Night (Lighthouse Dark):**
- Duration: Single narrative scene (~60 seconds)  
- Player experiences darkness, sounds, whispers
- The Vael may speak (random selection from pool)
- Consequence roll occurs:

| Roll (d100) | Outcome |
|-------------|---------|
| 01-30 | No visible consequence (dread only) |
| 31-50 | Lose 10% current Insight |
| 51-70 | One NPC's dialogue shifts next loop ("They dreamed something terrible") |
| 71-85 | One location becomes slightly more dangerous (+5% hazard) |
| 86-100 | Gain cryptic clue (The Vael reveals something useful) |

**Consecutive Dark Nights:**
- 3 in a row: Major consequence (specific NPC dies or location becomes inaccessible for 3 loops)
- 5 in a row: Corruption ending becomes achievable
- 7 in a row: Game-over state (island claims the Keeper; treated as special ending)

### 6.10 Build Archetypes

**What They Are:** Three playstyles that emerge from how players allocate attention and resources. No explicit "class selection"—archetypes are emergent based on behavior.

**The Witness (Observation Focus)**

*Optimizes for:* Environmental discovery, Archive completion, vision collection

| Characteristic | Description |
|----------------|-------------|
| **Primary Insight Sources** | Examining objects, exploration, visions |
| **Typical Loop Pattern** | Visit many locations quickly, examine everything, return for light |
| **Resonance Strategy** | Spread thin across many NPCs (R1-2 each) |
| **Archive Priority** | Keen Eyes, Echo Sight, Swift Legs |
| **Ending Affinity** | The Truth (requires maximum knowledge) |
| **Weakness** | May miss NPC-locked content; lower quest completion |

**The Confessor (Relationship Focus)**

*Optimizes for:* NPC Resonance, quest completion, dialogue unlocks

| Characteristic | Description |
|----------------|-------------|
| **Primary Insight Sources** | Dialogue, quest completion |
| **Typical Loop Pattern** | Visit 2-3 locations with target NPCs, deep dialogue |
| **Resonance Strategy** | Focus 2-3 NPCs to R5, others at R1 |
| **Archive Priority** | Silver Tongue, Extended Day |
| **Ending Affinity** | The Keeper's Peace (all NPC quests required) |
| **Weakness** | May miss environmental clues; slower exploration |

**The Scholar (Deduction Focus)**

*Optimizes for:* Insight Card sealing, puzzle solving, synthesis

| Characteristic | Description |
|----------------|-------------|
| **Primary Insight Sources** | Card sealing bonuses, synthesis discoveries |
| **Typical Loop Pattern** | Targeted investigation based on journal theories |
| **Resonance Strategy** | Situational—whatever unlocks needed evidence |
| **Archive Priority** | Death's Memory, True Sight |
| **Ending Affinity** | The Liberation (requires understanding Vael fully) |
| **Weakness** | May rush past story moments; less emotional engagement |

**Hybrid Play:** Most players blend archetypes. Pure archetype play reveals archetype-specific content but locks out other archetype content. All endings achievable by any archetype, but difficulty varies.

---

## 7. Difficulty & Balance

### 7.1 Difficulty Curve Across Loops

| Loop Range | Challenge Level | What Player Faces | Expected Death Rate |
|-----------|-----------------|-------------------|---------------------|
| 1-3 | Tutorial | Learning geography, NPC locations, basic rhythm | 30-40% (mostly Dark Nights) |
| 4-6 | Ramp-Up | First quests, first sealed Insights, light maintenance | 20-30% |
| 7-9 | Midgame | Mechanism Room access, ghost Keepers, moral choices begin | 25-35% |
| 10-12 | Late Game | Major revelations, NPC questlines concluding, ending paths diverge | 30-40% |
| 13-15 | Climax | Final choices, highest-stakes encounters | 20-30% (if playing carefully) |
| 16-18 | Resolution | Ending execution, epilogue collection | <20% |

### 7.2 Player-Controlled Risk Tiers

**Location Risk (Player Chooses Where to Go):**

| Tier | Locations | Reward | Risk |
|------|-----------|--------|------|
| Safe | Cottage, Village, Lighthouse | 5-10 Insight per object | 0% death |
| Low | Forge, Apothecary, Harbour | 8-15 Insight per object | <5% mishap |
| Medium | Chapel, Manor | 12-20 Insight per object | 10-20% mishap |
| High | Cliffs, Mechanism Room | 20-40 Insight per discovery | 30-50% death (conditional) |

**Time Risk (Player Chooses When to Return):**

| Return Time | Risk Level | Consequence |
|-------------|-----------|-------------|
| Before 17:00 | None | Always make lighthouse in time |
| 17:00-18:00 | Low | May need to skip last action |
| 18:00-19:00 | Medium | May not complete lighting |
| 19:00+ | High | Dark Night nearly guaranteed |

**NPC Risk (Player Chooses What to Say):**

| Choice Type | Risk | Potential Consequence |
|-------------|------|----------------------|
| Honest, supportive | None | Slower Resonance with conflicting NPCs |
| Neutral, evasive | Low | No consequence, but limited progress |
| Deceptive | Medium | If discovered, permanent -2 Resonance |
| Betraying trust | High | Permanent hostility, quest lockout |

### 7.3 Anti-Exploit Mechanisms

| Exploit Vector | Prevention Mechanism |
|---------------|---------------------|
| **Insight Farming** | One-time bonuses; 150/loop cap; 40% diminishing returns above 120 |
| **Resonance Rushing** | Max +2 Resonance per NPC per loop |
| **Death Abuse** | 20% Insight loss on death; consecutive Dark Nights have escalating consequences |
| **Dialogue Grinding** | Nodes flagged permanently; repeating gives 0 Insight |
| **Location Grinding** | Environmental objects reset but grant reduced Insight after first discovery |
| **Wiki Optimization** | Active Thread system adapts to player progress; no fixed "optimal route" |
| **Save Scumming** | Autosave after every significant action; no manual save slots |

### 7.4 Safety Nets

| Trigger | Safety Net |
|---------|-----------|
| **3 loops with <50 Insight each** | Hint system activates: "Perhaps try speaking with [accessible NPC]" |
| **Stuck at Resonance 0 with all NPCs** | One NPC (Nessa) will proactively approach player |
| **5 consecutive deaths** | Death's Memory archive unlocks at reduced cost (30 instead of 60) |
| **No Insight Cards sealed by loop 6** | First card sealing cost reduced to 10 Insight |
| **Mechanism Room inaccessible by loop 12** | Hint provided: specific Insight Card named |
| **Dark Night 7/7 (game over risk)** | Warning at Dark Night 5: "The island grows impatient. Light the beacon or all will be lost." |

### 7.5 The "Feel Fair" Contract

**The game promises the player:**

1. **Every death is avoidable:** No random instakills. All death conditions are telegraphed at least one action in advance.

2. **Every mystery is solvable:** All information required for all endings exists in-game. No external knowledge required.

3. **Every choice has visible consequence:** Player may not see consequence immediately, but within 2-3 loops, effects manifest.

4. **Mechanics are transparent:** Insight amounts, time costs, and Resonance thresholds are always visible. No hidden rolls.

5. **Time pressure is fair:** Player always has warning before Dusk. Auto-light exists for experienced players. Dark Night has graduated consequences.

---

## 8. Progression & Unlocks

### 8.1 Full Progression Map

```
LOOP 1-3: ORIENTATION
├── Learn all 10 locations
├── Meet all visible NPCs (not ghost Keepers)
├── Experience first Dark Night (mandatory on Loop 1)
├── Successfully light lighthouse (usually Loop 2-3)
├── Seal first Insight Card (usually "The Storm")
└── Resonance 1 with 3+ NPCs

LOOP 4-6: ESTABLISHMENT
├── Complete first NPC quest (usually Orin or Nessa)
├── Discover Mechanism Room exists (vision hint)
├── Reach Resonance 3 with 1-2 NPCs
├── Seal 3-5 Insight Cards
├── Purchase first Archive upgrade
└── Total Insight milestone: 300+

LOOP 7-9: DEEPENING
├── Enter Mechanism Room (requires Insight Card: "The Mechanism's Purpose")
├── Meet Elias (ghost Keeper #2)
├── Reach Resonance 5 with first NPC
├── Learn about The Vael's nature
├── Seal 6-8 Insight Cards total
└── Begin recognizing ending paths

LOOP 10-12: REVELATION
├── Meet Aldric (ghost Keeper #1, requires loop 8+)
├── Understand The Vael was wrongly imprisoned (major revelation)
├── All NPCs at Resonance 3+ (for Keeper's Peace path)
├── Seal 10-12 Insight Cards total
├── Choose primary ending path
└── Complete major NPC questlines

LOOP 13-15: CLIMAX
├── Meet Solen (ghost Keeper #3, requires loop 12+, specific path)
├── Face final moral choice
├── Achieve first ending
└── Unlock ending-specific epilogues

LOOP 16-18: (Optional) ALTERNATIVE ENDINGS
├── New Game+ available
├── Pursue different ending path
└── Complete NPC content missed in first run
```

### 8.2 Unlock Conditions

**By Loop Number:**

| Loop | Content Unlocked |
|------|-----------------|
| 1 | All safe locations accessible |
| 3 | Aldis becomes more talkative (Chapel content opens) |
| 5 | Manor Ruins East Wing stabilizes (safer exploration) |
| 8 | Aldric (ghost Keeper #1) visible in Mechanism Room |
| 10 | Coastal Cliffs night visions available |
| 12 | Solen (ghost Keeper #3) visible under specific conditions |

**By Insight Level:**

| Total Insight | Unlock |
|---------------|--------|
| 200 | Archive: Swift Legs available for purchase |
| 400 | Archive: Keen Eyes available for purchase |
| 600 | Access to secret area in Manor Ruins |
| 800 | The Vael begins responding to player choices |
| 1000 | Final ending content unlockable |

**By Sealed Insight Count:**

| Cards Sealed | Unlock |
|--------------|--------|
| 1 | "Theories" tab in Journal expands |
| 3 | NPCs reference your growing understanding in dialogue |
| 5 | Mechanism Room accessible |
| 7 | Ghost Keepers fully interactive (not just visions) |
| 10 | All ending paths available |
| 12 | "The Truth" ending specific requirements visible |

### 8.3 The 7 Key Insights for The Truth Ending

The Truth ending requires sealing all 7 of these specific Insight Cards:

| # | Insight Card Name | Evidence Required | Effect When Sealed |
|---|-------------------|-------------------|-------------------|
| 1 | **The Storm's Origin** | Weather log, Cael's testimony, Lighthouse records | Reveals storm was artificial, created to distract |
| 2 | **The Vael's Nature** | Three ghost Keeper testimonies, Chapel archives | Reveals The Vael is a guardian, not a monster |
| 3 | **The Original Imprisonment** | Aldric's confession, Manor ruins evidence, Mechanism blueprint | Reveals why islanders imprisoned The Vael |
| 4 | **The Keeper's Burden** | All 3 ghost Keeper stories completed | Reveals loop is punishment for all Keepers, not just player |
| 5 | **The Conspiracy's Heart** | Orin's secret, Aldis's ritual, Cael's cargo, Council records | Reveals island leadership maintains imprisonment knowingly |
| 6 | **The Mechanism's Design** | Full Mechanism Room exploration, engineering diagrams, Elias's expertise | Reveals lighthouse can be reconfigured, not just lit or dark |
| 7 | **The Third Way** | All above 6 cards + Resonance 5 with Mira + buried evidence recovered | Reveals The Vael can be awakened safely with proper ritual |

**Sealing Order:** Cards 1-5 can be sealed in any order. Card 6 requires Card 5. Card 7 requires all previous cards.

### 8.4 Archive Unlock Tree

```
[START: No Prerequisites]
├── Swift Legs (25 Resonance)
│   └── Extended Day (50 Resonance)
│       └── Lighthouse Affinity (75 Resonance) [+5 lit lighthouses]
│
├── Deep Pockets (30 Resonance)
│
├── Silver Tongue (35 Resonance) [+NPC at R3]
│
├── Keen Eyes (40 Resonance) [+Loop 5]
│   └── Echo Sight (100 Resonance) [+Loop 10]
│
├── Death's Memory (60 Resonance) [+3 deaths]
│   └── Vael's Whisper (100 Resonance) [+5 Dark Nights]
│
└── [ALL ABOVE] → True Sight (150 Resonance)
```

---

## 9. Endings

### 9.1 Ending Specifications

#### Ending 1: The Sacrifice

**Trigger Conditions:**
- Mechanism Room accessed
- Understand The Vael must remain imprisoned (Card: "The Vael's Nature" sealed)
- Choose "Maintain the Seal" at final choice
- NOT at Resonance 5 with any NPC who opposes imprisonment

**Narrative:**
The player chooses to contain The Vael forever, knowing it means all Keepers—past, present, and future—remain trapped in their loops. The player becomes part of the prison, another link in the chain. The lighthouse beam burns steady. The island persists. The sea claims no ships.

**What the Player Sees:**
- Cutscene: Player descends into Mechanism Room's heart
- Vision of all Keepers in their loops, aware of each other but unable to connect
- Final image: Player's ghost joins the other ghost Keepers
- Text: "The light burns. The island sleeps. You are remembered in every sunrise."

**NPC Epilogues:**
- Orin: "A new Keeper will come. I'll make them a wick."
- Nessa: "The cottage stays lit. Someone must be keeping it."
- Cael: "The ferry runs again. But I never take passengers to the lighthouse."
- Aldis: "The chapel bells ring for the lost. Always for the lost."

#### Ending 2: The Liberation

**Trigger Conditions:**
- Card sealed: "The Vael's Nature"
- Card sealed: "The Original Imprisonment"
- Choose "Break the Mechanism" at final choice
- At least one NPC at Resonance 5 who supports The Vael (Mira)

**Narrative:**
The player frees The Vael, shattering the lighthouse mechanism. The Vael rises—but it is not malevolent. It is exhausted, confused, ancient. It thanks the player and returns to the sea from which it was taken. But the mechanism's destruction unleashes the stored energy of centuries. The island begins to sink. The Vael, too weak to save everyone, carries whom it can.

**What the Player Sees:**
- Cutscene: Mechanism shatters in cascade of light
- The Vael's true form: vast, translucent, whale-like
- Island trembles, then floods
- Survivors on Cael's ferry, watching the lighthouse sink
- Text: "The prison is broken. The prisoner is free. What was the island's sin? Kindness, misunderstood."

**NPC Epilogues (Based on Resonance):**
- NPCs at R3+: Shown on ferry, survived
- NPCs at R2 or below: Fate uncertain ("Last seen at [location]")
- Aldis: Always dies (refuses to leave chapel as it floods)

#### Ending 3: The Truth

**Trigger Conditions:**
- All 7 Key Insight Cards sealed (see section 8.3)
- Resonance 5 with Mira
- Choose "Reconfigure the Mechanism" at final choice

**Narrative:**
The player discovers the lighthouse can be transformed. It doesn't have to imprison The Vael—it can put The Vael into a natural sleep, without pain, without Keepers sacrificing themselves. The original imprisoners didn't know this; the knowledge was lost. The player, through accumulated understanding, reconstructs the solution. The Vael sleeps. The Keepers are released. The island becomes ordinary.

**What the Player Sees:**
- Cutscene: Player adjusts Mechanism with ghost Keepers assisting
- Lighthouse beam changes from amber to soft green
- Ghost Keepers fade peacefully, smiling
- Morning arrives—but player doesn't loop. They're free.
- Text: "The truth was always there. It just needed someone patient enough to find it."

**NPC Epilogues:**
- All NPCs receive full resolution
- Orin: Opens forge to visitors from the mainland
- Nessa: Becomes head healer, no longer trades in secrets
- Cael: Retires from ferryman duty, opens a fishing school
- Aldis: Finds peace; chapel becomes memorial for the Keepers
- Mira: "I can stop digging. The guilt is finally buried."

#### Ending 4: The Corruption

**Trigger Conditions:**
- 5+ consecutive Dark Nights
- Card sealed: "The Vael's Nature"
- Choose "Accept The Vael's Offer" at final choice
- OR: Reach Resonance 5 with The Vael (yes, possible through Dark Night dialogue)

**Narrative:**
The player stops lighting the lighthouse deliberately. They let The Vael grow stronger. They begin hearing its voice clearly. The Vael offers a bargain: become its vessel, and escape the loop forever. The player accepts. They do not become possessed—they become something new. Half-human, half-ancient. The island belongs to them now.

**What the Player Sees:**
- Cutscene: Player walks into the darkened Mechanism Room
- The Vael surrounds them (shadow tendrils)
- Player's form changes—eyes become deep blue, skin pale
- They walk out to the lighthouse. The beam ignites green-black.
- Text: "The Keeper is the kept. The prisoner is the warden. You are both now."

**NPC Epilogues:**
- All NPCs flee the island or die mysteriously (based on Resonance)
- Aldis: "I always knew. I just prayed I was wrong."
- Orin: "The new Keeper doesn't need wicks. Doesn't need anything."
- Cael: Never returns; his ferry found drifting, empty

#### Ending 5: The Keeper's Peace (True Good Ending)

**Trigger Conditions:**
- Complete all 8 major NPC questlines
- Light lighthouse every single night (0 Dark Nights after gaining ability to light)
- Resonance 5 with at least 5 NPCs
- Card sealed: "The Third Way"
- All 7 Key Insight Cards sealed
- Choose "Unite Us All" at final choice

**Narrative:**
The player has done the impossible: earned trust of everyone, understood everything, and never let the light fail. This unlocks a hidden option. The NPCs, the ghost Keepers, and The Vael all gather at the lighthouse at dawn. Together, they perform a ritual that requires all participants to forgive each other. The loop breaks. The Vael awakens gently, forgives its captors, and departs. The ghost Keepers pass on. The living NPCs remember everything—and choose to remember the Keeper fondly.

**What the Player Sees:**
- Cutscene: All characters gather at lighthouse exterior at dawn
- Each NPC speaks a line of forgiveness or closure
- Ghost Keepers fade into golden light
- The Vael rises from the sea, ancient and kind, and nods before departing
- Player stands alone on the pier as ferry arrives—with passengers from the mainland
- Text: "The lighthouse still stands. But now it guides ships home, as it was always meant to."

**NPC Epilogues:**
- Extended epilogue for each NPC showing 10 years later
- All alive, all healed, all remember the Keeper's name

### 9.2 Mutual Exclusivity

| Ending | Incompatible With | Reason |
|--------|------------------|--------|
| The Sacrifice | The Liberation | One imprisons, one frees |
| The Liberation | The Truth | One destroys mechanism, one reconfigures |
| The Corruption | The Keeper's Peace | Corruption requires Dark Nights; Peace requires none |
| The Truth | The Corruption | Truth requires all 7 cards; Corruption forfeits some paths |
| The Keeper's Peace | All others | Requires perfect playthrough, excludes all shortcuts |

### 9.3 New Game+ Implications

After any ending:
- All Archives retained
- Journal discoveries reset
- NPC Resonance reset
- Insight Cards reset (must re-seal)
- Loop counter resets
- Ending-specific flag set (dialogue acknowledges previous ending vaguely)

**Post-Ending Dialogue Example (after Liberation, talking to Mira):**
> "You look familiar. Have we met? No, that's not quite right. I feel like I've *known* you. Or... someone like you."

---

## 10. Controls & Input

### 10.1 Input Mapping

| Action | Mouse/Touch | Keyboard | Context |
|--------|-------------|----------|---------|
| Move to location | Click on location (map) | Number keys 1-0 | When map is open |
| Examine object | Click on highlighted object | E | When object in view |
| Talk to NPC | Click on NPC portrait | T | When NPC present |
| Open Journal | Click Journal icon | J | Anytime |
| Open Map | Click Map icon | M | Anytime (pauses) |
| Select dialogue option | Click option text | 1-4 (option numbers) | During dialogue |
| Seal Insight Card | Click "Seal" button | Enter | When viewing card |
| Pause game | Click Pause icon | Escape | Anytime |
| Confirm action | Click Confirm | Enter | On confirmation dialogs |
| Cancel action | Click Cancel | Escape | On dialogs |
| Scroll text | Mouse wheel / drag | Arrow keys | In Journal, long dialogues |

### 10.2 UI Navigation

**Main HUD Elements:**
- Top-left: Current location name
- Top-right: Insight counter (e.g., "78/150"), time display (e.g., "14:30")
- Bottom-left: Journal button, Map button
- Bottom-right: Pause button
- Center: Main view (location artwork + interactive elements)

**Map Screen:**
- Locations shown as nodes on stylized island map
- Lines connect adjacent locations
- Current location highlighted
- Click location to travel (shows time cost before confirming)
- NPCs shown as small icons at their current locations

**Journal Screen:**
- Tabbed interface (Active Threads, Discoveries, NPCs, Sealed Insights, Map, Archives)
- Each tab is a full page
- Navigation via tab headers or swipe/arrow keys
- Close via X button or J key

**Dialogue Screen:**
- NPC portrait on left
- Dialogue text in center panel
- Response options as buttons below (max 4 visible, scroll if more)
- Insight cost shown next to locked options (e.g., "[15 Insight] Ask about the storm")
- Exit option always present

### 10.3 Accessibility Considerations

| Feature | Implementation |
|---------|----------------|
| **Minimum Font Size** | All text 16px minimum; scalable to 24px via settings |
| **Color-Blind Safe** | Palette tested against protanopia/deuteranopia; critical info never color-only |
| **Full Mouse Control** | All actions completable with mouse alone; keyboard optional |
| **Text Descriptions** | All images have alt-text equivalent readable in accessibility mode |
| **No Reflex Requirements** | Lighthouse minigame has 30-second timer; can be extended to 60s in settings |
| **Pause Anytime** | Escape or pause button always available; no unpausable sequences |
| **Audio Cues Have Visual Equivalents** | Dusk chime accompanied by screen dim; whispers show text |
| **Reduced Motion Option** | Disables particle effects, screen shake, animated transitions |
| **High Contrast Mode** | Alternative palette with stronger value contrast |
| **Screen Reader Support** | All UI elements have aria-labels; game state describable as text |

---

## 11. Out of Scope

### 11.1 Features Deliberately Excluded

| Feature | Reason for Exclusion |
|---------|---------------------|
| **Combat System** | Violates core identity; mystery/knowledge game, not action |
| **Inventory Management** | Components tracked automatically; item management is busywork |
| **Crafting** | No resource gathering loop; contradicts exploration focus |
| **Skill Trees** | Progression is knowledge-based; stat increases inappropriate |
| **Multiple Save Slots** | Prevents save scumming; single autosave forces commitment |
| **Multiplayer/Online** | Single-player mystery experience; no social mechanics |
| **Procedural Generation** | Hand-crafted mystery requires fixed evidence placement |
| **Time Limits in Real Time** | Turn-based design; real-time pressure excluded except minigame |
| **Voice Acting** | File size constraint (single HTML); text conveys tone |
| **Full Animation** | Canvas-based; frame animations for key moments only |
| **Map Exploration (Walking)** | Locations are nodes, not traversable spaces; efficiency over immersion |
| **Weather System** | Atmospheric descriptions only; no mechanical weather effects |
| **Day/Night Lighting Cycle** | Single palette per phase (day/dusk/night) for consistency |
| **Economy (Money)** | Currency is Insight and Resonance; gold/items excluded |
| **Achievements System** | Endings are achievements; no external metagame |
| **Tutorial Mode** | Loop 1 IS tutorial; no separate mode needed |
| **Difficulty Settings** | Player-controlled risk system replaces difficulty modes |

### 11.2 Features for Potential Future Version

| Feature | Implementation Complexity | Value Added |
|---------|--------------------------|-------------|
| **New Game+ Difficulty Variants** | Low | Replayability for completionists |
| **Developer Commentary Mode** | Low | Audience engagement |
| **Additional Endings (Variant)** | Medium | Extended content for fans |
| **Second Island (Expansion)** | High | New mystery, ~50% more content |
| **Mobile-Optimized Version** | Medium | Accessibility, broader reach |
| **Community Translation Support** | Medium | Localization via JSON strings |
| **Speedrun Timer Mode** | Low | Community engagement |
| **Collector's Edition Content** | Low | Art gallery, music player, lore compendium |

---

## Appendix A: NPC Quick Reference

| NPC | Role | Location (Default) | Key Secret | Questline Summary |
|-----|------|-------------------|------------|-------------------|
| **Orin** | Blacksmith | The Forge | Participated in sealing a previous Keeper alive | "The Forge's Burden" — discover his guilt, choose to expose or forgive |
| **Nessa** | Apothecary | The Apothecary | Trades medicine for silence; knows what Cael transported | "The Healer's Ledger" — retrieve smuggling evidence, choose who to give it to |
| **Cael** | Ferryman | Harbour & Pier | Transported something tied to Keeper's disappearance | "The Ferryman's Cargo" — uncover what he carried and why |
| **Sister Aldis** | Clergy | The Chapel | Believes The Vael is sacred; will sabotage if she learns it's being harmed | "The Sister's Faith" — navigate her beliefs without triggering sabotage |
| **Mira** | Blind Mapmaker | Coastal Cliffs / Cottage | Buried evidence 30 years ago that proves The Vael's innocence | "The Mapmaker's Guilt" — help her retrieve what she hid |
| **Elias** | Ghost (Keeper #2) | Mechanism Room | Sacrificed travelers to The Vael out of fear | "The Second Keeper" — hear his confession, grant or deny peace |
| **Petra** | Elias's Daughter | Harbour | Doesn't know her father is a ghost in the lighthouse | "The Father's Shadow" — decide whether to tell her |
| **The Vael** | Entity | Dreams / Dark Nights | Was imprisoning something worse; wrongly imprisoned in its place | Central mystery; all paths converge here |

---

## Appendix B: Insight Card Complete List

| Card Name | Evidence Required | Seal Cost | Effect |
|-----------|-------------------|-----------|--------|
| The Storm | Weather log + Nessa's comment | 25 | Reveals storm was unnatural |
| Orin's Arrival | Forge ledger + Village records | 30 | Proves Orin lied about when he came |
| The Missing Manifest | Harbour records + Cael's deflection | 35 | Points to suspicious cargo |
| Nessa's Trade | Medicine bottle + Patient records | 30 | Reveals her information barter |
| The Ferryman's Burden | Cael's testimony + Manifest gaps | 45 | Unlocks Cael quest progression |
| The Chapel's Secret | Altar inscription + Aldis's prayer book | 40 | Reveals her Vael worship |
| The Buried Evidence | Mira's confession + Manor ruins map | 50 | Unlocks Manor East Wing content |
| The Mechanism's Purpose | Lighthouse blueprints + Elias's explanation | 45 | Unlocks Mechanism Room |
| The First Keeper's Sin | Aldric's ghost dialogue + Historical records | 55 | Reveals original imprisonment |
| The Vael's Nature | Three Keeper testimonies + Vael's dreams | 60 | Reveals Vael is not malevolent |
| The Original Imprisonment | First Keeper's Sin + Chapel archives | 60 | Reveals why Vael was imprisoned |
| The Keeper's Burden | All ghost Keeper stories complete | 65 | Reveals loop is punishment |
| The Conspiracy's Heart | Orin + Aldis + Cael + Council secrets | 70 | Reveals island-wide cover-up |
| The Mechanism's Design | Full Mechanism exploration + blueprints | 70 | Reveals reconfiguration possible |
| The Third Way | All above + Mira R5 + buried evidence | 75 | Unlocks True ending option |

---

## Appendix C: Time Budget Per Loop

| Activity | Time Cost | Notes |
|----------|-----------|-------|
| Adjacent location travel | 15 min | × 2 for non-adjacent |
| Examine environmental object | 15 min | Per object |
| Initiate NPC dialogue | 0 min | Dialogue has no cost |
| Complete dialogue tree | 0-15 min | Variable by length |
| Rest at cottage | 60 min | Full restoration |
| Lighthouse repair minigame | 0 min | Part of dusk transition |
| Seal Insight Card | 0 min | Instant action |
| Read Journal | 0 min | Game paused |
| View Map | 0 min | Game paused |

**Maximum Actions Per Day (Theoretical):** 18 hours ÷ 15 min = 72 time units. Practical maximum: 30-40 meaningful actions (travel + examine + travel pattern).

---

## Appendix D: Glossary

| Term | Definition |
|------|------------|
| **Loop** | One complete in-game day from Dawn to Dawn; player's position and consumables reset |
| **Insight** | Per-loop currency representing understanding; earned through discovery, spent on dialogue/sealing |
| **Resonance (Currency)** | Persistent currency earned through NPC relationships; spent on Archives |
| **Resonance (NPC)** | Relationship score (0-5) with individual NPCs; higher = deeper access |
| **Archives** | Permanent meta-unlocks purchased with Resonance currency |
| **Insight Card** | Hypothesis formed from evidence; can be sealed to make permanent and change world |
| **Sealed Insight** | An Insight Card that has been permanently locked in; cannot be undone |
| **The Vael** | Ancient entity imprisoned beneath the lighthouse; central mystery |
| **Keeper** | Lighthouse keeper; player's role; previous Keepers exist as ghosts |
| **Dark Night** | Failed to light lighthouse; consequences occur |
| **Light Night** | Successfully lit lighthouse; visions occur |
| **Active Thread** | Journal suggestion for current investigation path |
| **Ghost Keeper** | Spirit of previous Keeper trapped in loop (Elias, Aldric, Solen) |
| **Mechanism Room** | Heart of lighthouse; highest-stakes location |

---

**END OF MASTER GAME DESIGN DOCUMENT**

*Document maintained by: Design Lead*  
*Last updated: January 2025*  
*Version: 1.0 — Production Ready*
