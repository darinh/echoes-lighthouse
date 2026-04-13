# Echoes of the Lighthouse — Systems Design Document
**Version:** 1.0  
**Target:** Single-file HTML5 Canvas game, ~4,500-6,000 LOC  
**Designer:** Systems Architect  
**Date:** 2025

---

## Executive Summary

**Core Loop:** Explore cursed island → Encounter mysteries → Make choices → Gather knowledge → Die → Retain understanding → Progress deeper

**Primary Economy:** Knowledge fragments (not gold, not items)  
**Progression:** Persistent understanding unlocks new dialogue, areas, and choices  
**Death:** Resets position and time, preserves knowledge  
**Win Condition:** Solve the lighthouse mystery through accumulated understanding across multiple loops

---

## 1. PROGRESSION SYSTEM

### 1.1 Core Stats (The Keeper's Attributes)

**Physical Stats** (reset on death, govern immediate survival):
- **Stamina:** 0-100, drains with exploration, combat avoidance, sprinting
- **Light Reserves:** 0-100, your lantern fuel; darkness = danger
- **Health:** 3 hearts (binary: alive/dead, no grinding HP)

**Persistent Stats** (survive death, govern long-term progression):
- **Insight:** 0-999, measures accumulated knowledge fragments
- **Resonance:** 0-10 levels, unlocks deeper NPC dialogue tiers
- **Archive Mastery:** 0-7 domains (History, Occult, Maritime, Ecology, Alchemy, Cartography, Linguistics)

### 1.2 How Stats Are Earned

#### Insight (Primary Currency)
Earned by:
- **Discovery:** First-time location visit = 5-15 Insight (scaled by danger)
- **Dialogue:** Meaningful NPC conversation = 3-8 Insight (one-time per unique dialogue node)
- **Environmental Clues:** Examining objects with context = 2-5 Insight
- **Quest Completion:** 20-50 Insight based on complexity
- **Death Reflection:** Upon dying, gain 10% of current loop's Insight as bonus (encourages risk-taking)

**Anti-Exploit:** 
- Discovery Insight is one-time per location (tracks discovered locations across loops)
- Dialogue nodes are flagged; repeating same conversation = 0 Insight
- Environmental clues require different Archive domains to understand (forces broad exploration)
- Hard cap of 150 Insight per 24-hour loop before diminishing returns (60% reduction after cap)

#### Resonance (Relationship Depth)
Earned by:
- **Spending Insight with NPCs:** 50 Insight = +1 Resonance with that NPC
- **Moral Choices Aligned with NPC Values:** +1 Resonance (max 1 per loop per NPC)
- **Bringing NPCs Relevant Items:** +1 Resonance (items are contextual clues, not loot)

**Anti-Exploit:**
- Resonance caps at 10 per NPC
- Each Resonance level unlocks 1 new dialogue tier; tier 10 = full truth
- Cannot "buy" Resonance faster than 1 level per loop (time-gated trust)
- Choices that betray an NPC = permanent -2 Resonance (irreversible consequence)

#### Archive Mastery (Knowledge Domains)
Earned by:
- **Finding Codex Pages:** 7 domains × 10 pages each = 70 total collectibles
- **Pages persist across death** (they represent understanding, not objects)
- Each domain unlocks at 3/6/10 pages (novice/adept/master)

**Anti-Exploit:**
- Pages are hidden in contextually logical locations (Maritime pages near docks, Occult in ruins)
- Some pages require multi-loop coordination (NPC hints in Loop 1, access in Loop 2)
- No domain can reach Master before at least 3 other domains reach Novice (forces breadth)

### 1.3 Preventing Dominant Strategy

**No Grind Loop:**
- Insight per location/dialogue is one-time
- 24-hour loop limit before mandatory "sleep" (new day starts, position resets)
- Daily Insight cap with severe diminishing returns

**Forced Diversification:**
- Archive domain requirements for understanding clues (can't solve mysteries with just one domain)
- NPCs gate story progress at specific Resonance levels across multiple characters
- Some areas require minimum Archive Mastery to even comprehend what you're seeing

**Risk/Reward Tension:**
- High-Insight areas are dangerous (low light, environmental hazards)
- Can retreat to safety for low Insight, or push deeper for high Insight
- Death penalty: lose current loop's Insight if you don't bank it at Archive Desk (in lighthouse basement)

**Example Balance:**
- Loop 1 optimal play: ~80 Insight (safe exploration)
- Loop 5 optimal play: ~140 Insight (taking calculated risks)
- Loop 10 optimal play: ~150 Insight (hitting cap, must focus on Resonance/Archives)

---

## 2. KNOWLEDGE ECONOMY

### 2.1 Knowledge as Currency

**Insight Spending:**
- **Unlock Dialogue:** Spend 10-50 Insight to ask NPCs deeper questions
- **Restore Archive Pages:** Damaged pages cost 30 Insight to "restore" (piece together meaning)
- **Activate Relics:** Ancient objects require Insight to activate (50-100 per relic)
- **Fast Travel Beacons:** Unlock permanent respawn points (75 Insight each, 5 total beacons)

**Why This Feels Rewarding:**
- You're literally "spending understanding" to ask smarter questions
- Choices are meaningful: unlock dialogue NOW vs. save for relic?
- Visible cause-effect: spend Insight on NPC → learn secret → that secret unlocks new area

**Anti-Farm Design:**
1. **Insight Sources Are Finite:** Fixed number of locations/dialogues per loop
2. **Efficiency Curve:** Early Insight is easy (5-15 per discovery), late Insight is hard (requires synthesis)
3. **Carry-Over Cap:** Can only bank 200 Insight across death; rest is lost (encourages spending)
4. **Meaningful Sinks:** You'll need ~2,000 total Insight to "beat" the game; must prioritize spending

### 2.2 What "Knowing Something" Unlocks

#### Tier 1: Environmental Understanding
- **Novice Archive Mastery:** See basic clues (e.g., "strange markings")
- **Adept Archive Mastery:** Understand clues (e.g., "navigation symbols, coordinates 34.5N")
- **Master Archive Mastery:** Synthesize clues (e.g., "coordinates + tide chart = hidden cave entrance")

#### Tier 2: Social Unlocks
- **Resonance 0-3:** NPC gives surface-level info, deflects personal questions
- **Resonance 4-6:** NPC shares partial truth, reveals motivations
- **Resonance 7-9:** NPC becomes ally, offers unique aid (e.g., Keeper's Key, Safe House access)
- **Resonance 10:** NPC reveals final secret, may offer sacrifice/redemption choice

#### Tier 3: World State Changes
- **Knowing NPC's Fear:** Dialogue option to avoid triggering hostility
- **Knowing Ritual Sequence:** Can perform ritual correctly (wrong order = curse)
- **Knowing True Names:** Ancient entities can be bound/dismissed
- **Knowing the Lighthouse's Purpose:** Final choice becomes available

#### Tier 4: Meta-Progression
- **Total Insight Milestones:** 
  - 200: Unlock "Sprint" (move faster)
  - 500: Unlock "Second Chance" (revive once per loop at 1 HP)
  - 1000: Unlock "Time Sense" (see remaining hours in current loop)
  - 1500: Unlock "Echo Vision" (see ghosts of past loops)

### 2.3 Knowledge Value Decay Prevention

**Problem:** Knowledge games risk "I know everything, nothing matters" endgame.

**Solutions:**
1. **Branching Knowledge:** Knowing A might close path B forever (mutually exclusive insights)
2. **Knowledge Inference:** Knowing A + B reveals C automatically (rewards synthesis, not grind)
3. **False Knowledge:** Some NPCs lie; conflicting info requires player deduction
4. **Contextual Knowledge:** Same clue means different things in different locations
5. **Final Mystery Requires ALL 7 Archives at Master:** Can't skip domains

**Example:**
- Fisherman says: "The lighthouse keeper went mad during the red moon."
- Priest says: "There was no red moon; the keeper was always mad."
- Astronomer's Archive reveals: "Red moon is aurora event, happens every 19 years."
- **Player must deduce:** Keeper went mad 19 years ago, Priest is lying or arrived recently.

---

## 3. DIFFICULTY AND SCALING

### 3.1 Core Challenge Philosophy

**Not About:** Twitch reflexes, bullet-hell, combat mastery  
**About:** Resource management, navigation puzzles, dialogue choices, risk assessment

### 3.2 Difficulty Curve Design

#### Early Loops (1-3): Learn the Island
- **Goal:** Teach geography, introduce NPCs, discover safe paths
- **Challenge:** Limited light, stamina management, environmental hazards (fog, thorns, collapsing floors)
- **Death Risk:** 20-30% (forgiving but present)
- **Insight Available:** 60-100 per loop (safe exploration)

#### Mid Loops (4-8): Deepen Understanding
- **Goal:** Build Resonance, unlock Archive domains, access restricted areas
- **Challenge:** NPC moral choices, puzzle-locked doors, dangerous shortcuts
- **Death Risk:** 40-50% (real consequences for poor choices)
- **Insight Available:** 100-150 per loop (calculated risks)

#### Late Loops (9-15): Solve the Mystery
- **Goal:** Synthesize knowledge, make final choices, confront lighthouse entity
- **Challenge:** Time pressure (limited loops before "storm arrives"), moral dilemmas, sacrifice choices
- **Death Risk:** 60-70% (high stakes)
- **Insight Available:** 120-150 per loop (cap limits, must use Insight wisely)

### 3.3 Adaptive Difficulty (Player-Controlled)

**Risk Dials (Player Chooses):**

1. **Light vs. Speed:**
   - High lantern setting: See clearly, burn 2 fuel/minute (safe, slow Insight)
   - Low lantern setting: Dim vision, burn 0.5 fuel/minute (risky, fast traversal)

2. **Dialogue Honesty:**
   - Tell truth to NPC: Gain trust (+Resonance), but reveal your knowledge (NPC may act differently)
   - Lie to NPC: Preserve secrecy, but lose trust opportunity

3. **Exploration Depth:**
   - Stay in "Coastal Zone": Safe, low Insight (5-10 per location)
   - Enter "Ruins Zone": Moderate danger, medium Insight (10-20 per location)
   - Explore "Abyssal Zone": High danger, high Insight (20-40 per location)

4. **Banking Frequency:**
   - Return to lighthouse often to bank Insight: Safe but time-consuming (uses 30min per trip)
   - Explore for full loop without banking: Risk losing everything on death

**Skill Expression:**
- Expert players can navigate dangerous zones in low light, maximizing Insight/hour
- Cautious players can achieve same total Insight over more loops, trading time for safety
- Both paths are viable; neither is "correct"

### 3.4 Preventing "Too Easy" Failure Mode

**Anti-Cheese Mechanisms:**
1. **Insight Cap:** Can't grind infinitely; must make smart spending choices
2. **Time Limit:** 24-hour loop forces efficiency; can't dawdle
3. **Mutual Exclusivity:** Some choices lock out others (can't have everything)
4. **Perfect Information Denial:** Never show exact Insight values for unexplored areas (prevents wiki optimization)
5. **Dynamic NPC Reactions:** If you're "too powerful" (high Resonance with everyone), NPCs start suspecting you

### 3.5 Preventing "Too Hard" Failure Mode

**Safety Nets:**
1. **Guaranteed Insight:** First 50 Insight per loop is nearly impossible to fail (tutorial zones always safe)
2. **Checkpoint System:** Fast travel beacons = safe respawn points
3. **Hint System:** Archive Desk shows "% complete" per domain, guides next steps
4. **Meta-Progression:** Total Insight milestones unlock permanent abilities (Sprint, Second Chance)
5. **No Fail States:** Can't softlock; even wrong choices give Insight ("learned what doesn't work")

**Difficulty Floor:**
- Minimum viable loop: 30 minutes, 40 Insight, zero deaths
- Target average loop: 90 minutes, 100 Insight, 1-2 deaths
- Expert loop: 120 minutes, 150 Insight, 3-4 calculated deaths

---

## 4. QUEST DESIGN PRINCIPLES

### 4.1 Core Rules for Quest Validity

**Rule 1: The Giver Cannot Do It Themselves (MUST BE EXPLICIT)**

Every quest includes one of these conditions:
- **Physical Constraint:** NPC is injured, elderly, imprisoned, bound by curse
- **Knowledge Constraint:** NPC lacks Archive domain mastery to understand what's needed
- **Social Constraint:** NPC is ostracized, feared, forbidden from entering area
- **Temporal Constraint:** NPC tried and failed in past; only Keeper's loop power can retry
- **Moral Constraint:** NPC cannot morally do the task (e.g., kill someone) but you can choose

**Rule 2: Quest Must Reveal Knowledge**

Every quest completion grants:
- Minimum 20 Insight
- 1+ Archive pages OR 1+ unique dialogue node
- New understanding that unlocks something else (no dead-end quests)

**Rule 3: Quest Has Failure State with Consequences**

Not "try again," but "this outcome is now locked":
- NPC dies if you fail
- Location becomes inaccessible
- Different knowledge path opens (failure = alternative truth)

### 4.2 Three Concrete Quest Examples

---

#### **QUEST 1: The Cartographer's Lament**

**Giver:** Magnus, elderly cartographer with shaking hands (degenerative nerve condition)

**Setup Dialogue:**
> "I spent forty years mapping this cursed island. Every cove, every ruin. But my hands... I can barely hold a pen now. There's one place I never mapped—the Drowned Chapel, submerged at high tide. I need the measurements: width, depth, orientation. My legacy is incomplete without it."

**Why Magnus Can't Do It:**
- **Physical:** Cannot swim due to age/condition; Drowned Chapel requires diving
- **Temporal:** High tide window is only 3 hours per day; Magnus moves too slowly
- **Knowledge:** Needs Cartography domain to take accurate measurements (you can learn this; he cannot teach while drowning)

**Objectives:**
1. Reach Drowned Chapel during high tide (requires timing, stamina management)
2. Measure 3 dimensions using Cartographer's Tools (Archive: Cartography Novice required)
3. Return to Magnus within same loop (or data is "lost to the fog")

**Failure States:**
- **Drown in chapel:** Lose loop, Magnus assumes you abandoned him (-2 Resonance)
- **Measure incorrectly:** Magnus realizes, refuses further help (-1 Resonance, no Insight)
- **Miss tide window:** Must wait for next loop; Magnus grows more despondent each failure

**Success Rewards:**
- +40 Insight
- +2 Resonance with Magnus
- Unlocks Magnus's Master Map (reveals all fast travel beacon locations)
- **Archive Page:** Cartography 7/10 (found in chapel while measuring)

**Moral Dimension:**
- Chapel contains drowned corpse of Magnus's son (he doesn't mention this)
- Can lie about what you saw, or tell truth (+Resonance but breaks Magnus emotionally)
- Truth path unlocks different quest: "Bury My Son" (high stakes, high reward)

---

#### **QUEST 2: The Warden's Confession**

**Giver:** Elara, former prison warden, exiled from Lighthouse Village

**Setup Dialogue:**
> "I kept a prisoner in the lighthouse basement. The Council said he was too dangerous for trial. I was ordered to execute him... but I didn't. I locked him in and fled. That was five years ago. Now I dream of his screams. I need to know: is he still alive? I cannot go back. They'll hang me on sight."

**Why Elara Can't Do It:**
- **Social:** Exiled; village guards will attack on sight (you're neutral, can pass freely)
- **Moral:** Consumed by guilt; cannot face the prisoner even if physically possible
- **Temporal:** Prisoner's cell requires Lighthouse Basement Key (held by Head Keeper who trusts you, not Elara)

**Objectives:**
1. Gain Resonance 4 with Head Keeper to be granted basement access
2. Navigate lighthouse basement (dangerous; flooded levels, collapsing stairs)
3. Locate Cell 7
4. Report findings to Elara

**Branching Outcomes:**

**A) Prisoner is Alive (Skeleton with Journal):**
- Journal reveals: prisoner was innocent, framed by Council member
- Elara's guilt transforms to rage; she plans revenge
- **Choice:** Give journal to Elara (she kills Council member, village chaos) OR withhold journal (Elara finds peace in ignorance)

**B) Prisoner is Dead (Corpse):**
- Elara finds closure; shares her own Archive knowledge (Occult domain)
- **Choice:** Tell her truth OR tell her "he forgave you in the end" (lie, but merciful)

**C) Cell is Empty (Prisoner Escaped):**
- Mystery deepens: where is he? (unlocks new questline)
- Elara panics; refuses further interaction until you find him

**Failure States:**
- **Caught by guards:** Village hostility increases; future quests harder
- **Head Keeper refuses access:** Must find alternative path (lockpicking = Alchemy domain check)

**Success Rewards:**
- +50 Insight
- +3 Resonance with Elara (if outcome is honest)
- **Archive Page:** Occult 4/10 (prisoner's journal contains ritual notes)
- Unlocks Lighthouse Basement as explorable zone (huge Insight potential)

**Moral Dimension:**
- Truth vs. Mercy: Does Elara deserve peace or justice?
- Revealing prisoner's innocence destabilizes village (hurts many to help one)
- Withholding info preserves status quo but denies justice

---

#### **QUEST 3: The Tide Caller's Bargain**

**Giver:** Silas, hermit who lives in the Tidal Caves

**Setup Dialogue:**
> "The sea speaks to those who listen. I've learned its tongue—Maritime lore, elder rites. But the sea demands a price. My daughter drowned twenty years ago. The sea keeps her bones. If I retrieve them, I can bury her properly... but I've tried. Every time I dive, the current pulls me back. The sea will not let ME take her. But you? You're not bound by the old pacts. The sea doesn't know you yet."

**Why Silas Can't Do It:**
- **Supernatural:** Bound by ancient pact; sea physically repels him from the bones (environmental hazard triggers only for him)
- **Temporal:** Loop power is unique to Keeper; Silas is "stuck" in linear time
- **Knowledge:** Knowing the location isn't enough; requires Ecology domain to navigate riptides

**Objectives:**
1. Learn dive location from Silas (requires Maritime Archive Novice to understand coordinates)
2. Dive during Dead Low Tide (only 1-hour window per loop)
3. Navigate underwater maze using Ecology knowledge (riptide patterns)
4. Retrieve daughter's skull (symbolic relic)
5. Return to Silas

**Complications:**
- **Skull is Cursed:** Carrying it drains Stamina at 2x rate; must hurry
- **Sea Entities:** Ghostly apparitions appear; not hostile but disturbing (sanity flavor)
- **Alternative Discovery:** Find evidence daughter's death was NOT an accident (murder)

**Branching Outcomes:**

**A) Return Skull to Silas (Ignore Murder Evidence):**
- Silas buries daughter; grants Sea Blessing (can breathe underwater for 60 seconds)
- +2 Resonance
- +30 Insight

**B) Confront Silas with Murder Evidence:**
- Silas confesses: he killed her (mercy kill; she was "possessed by lighthouse entity")
- **Choice:** Forgive OR condemn
  - Forgive: Silas shares final secret (lighthouse entity's weakness), +5 Resonance
  - Condemn: Silas becomes hostile, quest fails, but you keep evidence (useful later)

**C) Keep Skull, Don't Return to Silas:**
- Skull functions as relic (spend 100 Insight to activate: "Speak with Dead" ability)
- Silas becomes enemy; attacks on sight
- Locks out Silas's questline but opens alternative path via skull

**Failure States:**
- **Drown in caves:** Standard death, lose loop
- **Miss tide window:** Skull is unreachable this loop; Silas grows impatient (-1 Resonance)

**Success Rewards:**
- +30-50 Insight (based on choice)
- **Archive Page:** Maritime 5/10 OR Ecology 6/10 (depending on path)
- Sea Blessing ability OR Speak with Dead relic
- Moral weight: did you enable a murderer's redemption?

**Moral Dimension:**
- Mercy vs. Justice: Silas killed his daughter to "save" her; was it right?
- Truth vs. Closure: Silas deserves peace, but daughter deserves justice
- Personal Gain: Keeping skull is mechanically powerful but morally dubious

---

### 4.3 Quest Design Template (For Additional Quests)

Every quest must fill this template:

```
QUEST NAME: [Short, evocative title]
GIVER: [Name, role, 1-sentence description]
CONSTRAINT: [Why they can't do it themselves - pick 1-2 from list above]

OBJECTIVES: [3-5 steps, must include at least 1 skill check]

BRANCHING OUTCOMES: [Minimum 2 paths based on player choice]
- Path A: [Consequence, rewards]
- Path B: [Consequence, rewards]

FAILURE STATE: [What happens if player fails, how it locks future content]

REWARDS:
- Insight: [20-50]
- Resonance: [+1 to +3 with relevant NPC]
- Archive Page: [Domain + number]
- Unlocks: [Location, ability, or knowledge]

MORAL DIMENSION: [Central tension, no clear "right" answer]
```

---

## 5. MORAL CHOICE SYSTEM MECHANICS

### 5.1 Design Principles

**No Karma Meter:** Players should not see "Good: 40, Evil: 60"  
**No Binary Morality:** Choices are situational, not aligned to cosmic good/evil  
**Consequences, Not Judgments:** World reacts, player decides meaning

### 5.2 How the System Tracks Choices

#### Invisible Flags (Backend Tracking)

Every meaningful choice sets 1-3 flags:

```javascript
// Example: Elara's Quest (Prisoner outcome)
choices: {
  ER_Q1_TOLD_TRUTH: true/false,
  ER_Q1_PRISONER_FATE: "alive"/"dead"/"escaped",
  ER_Q1_GAVE_JOURNAL: true/false
}
```

#### NPC Memory System

Each NPC tracks:
- **Resonance Score:** 0-10 (visible to player as relationship tiers)
- **Trust Flags:** Array of choices aligned/misaligned with NPC values (invisible)
- **Betrayal Count:** How many times player acted against NPC's core beliefs (invisible)

**Example:**
```javascript
// Elara's values
values: {
  TRUTH: high,       // Elara values honesty above all
  MERCY: medium,     // Elara can forgive but needs closure
  JUSTICE: low       // Elara doesn't seek revenge (initially)
}

// Player tells truth about prisoner being innocent
if (player.choice === "TELL_TRUTH") {
  elara.resonance += 2;           // Visible
  elara.trust_flags.push("TRUTH"); // Invisible
}

// Player withholds journal (lies by omission)
if (player.choice === "WITHHOLD_JOURNAL") {
  elara.resonance += 0;           // No visible change YET
  elara.betrayal_count += 1;      // Invisible ticking bomb
}
```

### 5.3 What Changes in the World

#### Tier 1: Immediate NPC Reactions (Dialogue)

- **Low Betrayal (<2):** NPC continues normally, slightly cooler tone
- **Medium Betrayal (2-3):** NPC mentions "I thought I could trust you" (subtle warning)
- **High Betrayal (4+):** NPC refuses further interaction, may become hostile

**Example:**
- Loop 5: You lie to Magnus about his son's fate
- Loop 7: Magnus's dialogue shifts: "You helped me once. I want to believe you're good."
- Loop 9: If you lied again, Magnus: "I don't know who you are anymore. Leave."

#### Tier 2: Environmental Changes (World State)

Choices ripple through the island:

**Example Chain:**
1. **Choice:** Give prisoner's journal to Elara
2. **Result:** Elara kills Council Member Aldric (happens off-screen, you find body next loop)
3. **Ripple:** Village holds emergency council; elects new leader (varies by other choices)
4. **World Change:** Village gates close at sunset (new safety rule); restricts exploration

**Example Chain 2:**
1. **Choice:** Tell Silas you forgive him for daughter's murder
2. **Result:** Silas performs Sea Blessing ritual on village docks
3. **Ripple:** Villagers witness ritual; some are frightened, some are awed
4. **World Change:** Village splits into "Believers" (trust Silas) and "Fearful" (shun him); changes NPC dialogue trees

#### Tier 3: Threshold Events (Major Shifts)

Certain choices accumulate; at thresholds, world shifts dramatically:

**Threshold Example: "Island's Judgment"**

Track player's choices across ALL NPCs:
- **Compassionate Choices:** 8+
- **Ruthless Choices:** 8+
- **Balanced/Neutral:** Neither threshold

**At Loop 12 (pre-endgame):**

- **Compassionate Path:** Island's curse "softens"; environmental hazards reduce by 30%, NPCs offer aid
- **Ruthless Path:** Island's curse "hardens"; new dangers appear, NPCs become suspicious
- **Balanced Path:** Island remains neutral; player gets no help but no extra punishment

**Mechanical Impact:**
- Compassionate: Easier navigation, more hints, "help" events (NPC rescues you if health drops to 0 once)
- Ruthless: Harder navigation, fewer hints, "trap" events (false clues, ambushes)
- Balanced: Standard difficulty

### 5.4 Expressing Morality Without a Meter

#### Visual Indicators (Environmental)

- **Lighthouse Beam Color:** 
  - Many compassionate choices: Beam glows warmer (amber/gold tones)
  - Many ruthless choices: Beam glows colder (blue/violet tones)
  - Balanced: Standard white beam

- **NPC Body Language:**
  - High trust: NPCs face you directly, open postures
  - Low trust: NPCs turn away, crossed arms, furtive glances

- **Weather Patterns:**
  - Compassionate: Fog lifts slightly, more clear days
  - Ruthless: Storms intensify, darker skies

#### Audio Cues

- **Lighthouse Foghorn:**
  - Compassionate: Lower, calmer tone
  - Ruthless: Higher, more urgent tone

- **Ambient Sound:**
  - Compassionate: Seabirds, gentle waves
  - Ruthless: Crow caws, harsh wind

#### Dialogue Reflection

NPCs don't say "You're evil" but DO reflect on your reputation:

- **Compassionate Reputation:**
  - "I heard you helped Magnus. Good soul, that one."
  - "You've been kind. This island needs more of that."

- **Ruthless Reputation:**
  - "People talk. They say you can't be trusted."
  - "You've got a cold look in your eyes. I've seen it before."

### 5.5 Branching Endgame Based on Accumulated Choices

**Final Choice: The Lighthouse Entity's Offer**

> "You've learned the truth. I am not evil; I am a prison guard. The thing I contain would end your world. But I am tired. You could take my place—become the new Keeper, eternal and aware. Or you could destroy me, free the entity, and let fate decide. Or... you could find another way."

**Available Options Based on Choices:**

1. **Accept Eternal Duty** (Always available)
   - Become new lighthouse entity; loop forever
   - "Bittersweet" ending

2. **Destroy and Release** (Always available)
   - Free the entity; world ends (or does it?)
   - "Apocalyptic" ending

3. **Bind the Entity with NPC Aid** (Requires 3+ NPCs at Resonance 8+, Compassionate path)
   - NPCs perform ritual together; entity is re-bound permanently
   - You retain mortality, NPCs sacrifice memories
   - "Heroic Sacrifice" ending

4. **Merge with Entity** (Requires 5+ Archive Domains at Master, Ruthless path)
   - Use forbidden knowledge to merge; gain entity's power
   - Become a god, but lose humanity
   - "Transcendence" ending

5. **The Third Way** (Requires ALL 7 Archive Domains at Master, Balanced path, specific quest outcomes)
   - Discover the entity is not singular; it's a fragment of something broken
   - Reconstruct the original entity; lighthouse transforms into beacon of hope
   - "True" ending

**Outcome Narration:**
- Each ending shows ripple effects on NPCs you helped/hurt
- Compassionate path: NPCs thrive but forget you (sacrifice)
- Ruthless path: NPCs suffer but you achieve power (corruption)
- Balanced path: World is saved, you are remembered (legacy)

---

## 6. RETENTION MECHANICS

### 6.1 Session Hook (Opens the Game)

**Problem:** Player closed game yesterday; why reopen today?

**Solution: Daily Mystery Prompt**

On game boot, show:

```
╔════════════════════════════════════════════╗
║  ECHOES OF THE LIGHTHOUSE - DAY [X]        ║
║                                            ║
║  Last Loop: [Last session summary]         ║
║  "You died at the Drowned Chapel."         ║
║                                            ║
║  New Discovery Available:                  ║
║  "A letter appeared under your door."      ║
║                                            ║
║  Press ENTER to begin loop [X+1]           ║
╚════════════════════════════════════════════╝
```

**Key Elements:**
1. **Continuity:** Remind player where they were, what they learned
2. **Curiosity Hook:** "New Discovery" = something changed while they were gone (not real-time, but creates illusion)
3. **Low Friction:** Single button press to resume

**Examples of "New Discoveries":**
- "Magnus left a map fragment on your doorstep." (Even if you didn't interact with Magnus; world moves without you)
- "The lighthouse beam turned red during the night." (Environmental mystery)
- "You found a journal entry in your own handwriting. You don't remember writing it." (Meta hook)

**Mechanical Impact:**
- 50% of "new discoveries" are flavor (no mechanical effect, pure atmosphere)
- 50% are real (new Archive page, new NPC location, new dialogue option)
- Player can't tell which is which without exploring → incentive to check

### 6.2 Stay Hook (Keeps Playing)

**Problem:** Player has been playing for 30 minutes; what prevents them from closing now?

**Solution: Micro-Milestone Chains**

Every 15-20 minutes of play, player hits a micro-milestone:

**Milestone Examples:**
- **Insight Thresholds:** "You've reached 50 Insight. Return to Archive to unlock new domain hint?"
- **Discovery Chains:** "You found 2/3 Maritime pages. The third is nearby..." (creates open loop)
- **NPC Cliffhangers:** "Elara says: 'Meet me at midnight. I'll tell you everything.'" (creates time-based goal)
- **Environmental Puzzles:** "This door requires Alchemy Adept. You're 1 page away." (creates short-term goal)

**Stay Mechanic: The "One More Thing" Loop**

Structure loops so completion of one goal immediately reveals next:

```
Complete Quest → Gain Insight → Hit Threshold → Unlock Archive Hint → 
Reveals New Location → Travel There → Find NPC → NPC Offers Quest → [LOOP]
```

**Session Length Targets:**
- **Short session:** 20-30 minutes (explore 1 zone, bank Insight, exit cleanly)
- **Medium session:** 45-60 minutes (complete 1 quest, hit 1 milestone)
- **Long session:** 90-120 minutes (full loop, multiple quests, major discovery)

**Clean Exit Points:**
- After banking Insight at Archive Desk (safe save point)
- After completing quest (narrative closure)
- After NPC Resonance increase (relationship progress)

**Dirty Exit Points (Create Return Urgency):**
- Mid-exploration in dangerous zone (unbanked Insight at risk)
- During NPC dialogue (mid-conversation save = awkward)
- After discovering major clue but before understanding it (open loop)

### 6.3 Return Hook (Brings Back Tomorrow)

**Problem:** Player had a good session, closed cleanly. Why come back tomorrow (not next week)?

**Solution: Future-Locked Content Notifications**

When player exits, show:

```
╔════════════════════════════════════════════╗
║  SESSION COMPLETE                          ║
║                                            ║
║  This Loop: 120 Insight earned             ║
║  Total Progress: 47% of knowledge unlocked ║
║                                            ║
║  TOMORROW:                                 ║
║  • Silas will reveal the Tide Caller's     ║
║    secret (Resonance 7 unlocked)           ║
║  • New area accessible: The Sunken Archive ║
║                                            ║
║  See you soon, Keeper.                     ║
╚════════════════════════════════════════════╝
```

**Key Elements:**
1. **Progress Validation:** Show what player achieved (dopamine hit)
2. **% Completion:** Creates completionist drive (47% → "I can hit 50% tomorrow")
3. **Specific Tomorrow Promises:** Not vague; exact new content available

**Tomorrow Promises (Auto-Generated Based on Progress):**

```javascript
// Backend logic
if (player.silas_resonance === 6) {
  promises.push("Silas will reveal Tide Caller's secret");
}

if (player.cartography_mastery === "adept" && !player.unlocked_sunken_archive) {
  promises.push("New area accessible: The Sunken Archive");
}

if (player.total_insight >= 450 && player.total_insight < 500) {
  promises.push("You're 50 Insight from unlocking Echo Vision ability");
}
```

**Weekly Hooks (For Longer Retention):**

Every 7 real-world days, trigger:

```
╔════════════════════════════════════════════╗
║  WEEKLY MYSTERY UNLOCKED                   ║
║                                            ║
║  The lighthouse keeper's journal has a     ║
║  new entry. It's dated... tomorrow.        ║
║                                            ║
║  [New questline available]                 ║
╚════════════════════════════════════════════╝
```

**Psychological Tactics:**
- **Zeigarnik Effect:** Incomplete tasks (47% progress, 2/3 pages) linger in memory
- **Variable Rewards:** Sometimes tomorrow brings huge reveal, sometimes small clue (creates anticipation)
- **Social Proof (If Multiplayer Elements Added Later):** "3,241 Keepers discovered the Abyssal Secret this week. Will you?"

---

## 7. BIGGEST BALANCE RISK & MITIGATION

### 7.1 The Risk: Knowledge Inflation Spiral

**Problem Statement:**

In traditional economies, currency inflates when supply exceeds sinks. In a knowledge economy, this manifests as:

1. **Early Abundance:** Players discover high-Insight sources (e.g., Drowned Chapel = 40 Insight)
2. **Repeated Exploitation:** Players farm same source across loops (if not prevented)
3. **Trivial Unlocks:** All dialogue/unlocks become affordable; choices lose weight
4. **Boredom Endgame:** Player has "too much knowledge" with nothing meaningful to spend it on
5. **Dominant Strategy Emerges:** Wiki guides show optimal route (farm Drowned Chapel 10x, skip rest of game)

**Why This Kills the Game:**
- Choices become meaningless (can afford everything)
- Exploration loses purpose (already have all Insight needed)
- Difficulty collapses (can unlock all safety mechanics early)
- Retention dies (nothing to work toward)

### 7.2 Concrete Mitigation: Multi-Layered Anti-Inflation System

#### Layer 1: Hard Caps (Supply Limitation)

```javascript
// Per-loop Insight cap
const INSIGHT_CAP_PER_LOOP = 150;
const DIMINISHING_RETURNS_THRESHOLD = 120;

function awardInsight(source, baseAmount) {
  if (currentLoopInsight >= INSIGHT_CAP_PER_LOOP) {
    return 0; // Hard cap
  }
  
  if (currentLoopInsight >= DIMINISHING_RETURNS_THRESHOLD) {
    // 60% reduction after threshold
    baseAmount *= 0.4;
  }
  
  // One-time sources (locations, dialogues)
  if (source.type === "discovery" && discoveredSources.includes(source.id)) {
    return 0; // Already discovered
  }
  
  currentLoopInsight += baseAmount;
  return baseAmount;
}
```

**Impact:**
- Cannot farm single source infinitely
- Must diversify exploration to hit cap
- Expert players hit cap faster, but can't exceed it

#### Layer 2: Carry-Over Penalty (Death Tax)

```javascript
// Banking system
const BANK_CAPACITY = 200; // Max Insight that survives death
const DEATH_TAX = 0.9; // Lose 90% of unbanked Insight on death

function onDeath() {
  const unbankedInsight = currentLoopInsight - bankedInsight;
  const lostInsight = Math.floor(unbankedInsight * DEATH_TAX);
  
  totalInsight = bankedInsight + (unbankedInsight - lostInsight);
  
  // Cap total banked Insight
  if (totalInsight > BANK_CAPACITY) {
    totalInsight = BANK_CAPACITY;
    showWarning("Bank is full. Spend Insight before next loop.");
  }
}
```

**Impact:**
- Encourages spending Insight before death (active economy)
- Banking requires returning to lighthouse (time cost, risk/reward decision)
- Cannot hoard indefinitely; must prioritize spending

#### Layer 3: Escalating Costs (Inflation-Resistant Sinks)

```javascript
// NPC dialogue unlock costs scale with Resonance
function getDialogueCost(npc, dialogueNode) {
  const baseCost = dialogueNode.baseCost; // e.g., 10 Insight
  const resonanceMultiplier = 1 + (npc.resonance * 0.5);
  
  return Math.floor(baseCost * resonanceMultiplier);
}

// Example:
// Resonance 0: 10 Insight for dialogue
// Resonance 5: 35 Insight for dialogue
// Resonance 10: 60 Insight for dialogue
```

**Impact:**
- Early dialogue is cheap (accessible to new players)
- Late dialogue is expensive (even with cap, must choose carefully)
- Creates meaningful tradeoff: unlock many shallow dialogues OR few deep dialogues

#### Layer 4: Mutually Exclusive Unlocks (Forced Prioritization)

```javascript
// Relic activation system
const relics = {
  SKULL_OF_SPEAKING: { cost: 100, effect: "Speak with Dead" },
  TIDE_COMPASS: { cost: 100, effect: "Predict tides" },
  LIGHT_SHARD: { cost: 100, effect: "Infinite lantern fuel" }
};

const RELIC_LIMIT_PER_PLAYTHROUGH = 2; // Can only activate 2 of 3

function activateRelic(relicId) {
  if (activatedRelics.length >= RELIC_LIMIT_PER_PLAYTHROUGH) {
    showError("You can only bond with 2 relics per playthrough.");
    return false;
  }
  
  if (totalInsight < relics[relicId].cost) {
    showError("Insufficient Insight.");
    return false;
  }
  
  totalInsight -= relics[relicId].cost;
  activatedRelics.push(relicId);
  return true;
}
```

**Impact:**
- Even with "infinite" Insight, player cannot have everything
- Builds replay value (different relic combos each playthrough)
- Prevents "I win" button (no single unlock trivializes game)

#### Layer 5: Dynamic Scarcity (Adaptive Economy)

```javascript
// If player is earning Insight too efficiently, world responds
function adjustInsightSources() {
  const averageInsightPerHour = totalInsight / totalHoursPlayed;
  
  if (averageInsightPerHour > 80) { // Target: 60-70
    // Player is too efficient; apply scarcity modifiers
    environmentalHazards += 0.2; // More danger
    npcDialogueCosts *= 1.1; // Slightly more expensive
    discoveryInsightModifier *= 0.9; // Slightly less rewarding
    
    // Notify player subtly
    showAmbientText("The island feels... resistant.");
  }
  
  if (averageInsightPerHour < 40) { // Player struggling
    // Ease up
    hintFrequency += 0.2;
    discoveryInsightModifier *= 1.1;
    
    showAmbientText("The fog parts, revealing a hidden path.");
  }
}
```

**Impact:**
- Self-balancing economy
- Prevents wiki optimization (dynamic adjustments invalidate static guides)
- Tailors difficulty to player skill (gracefully)

### 7.3 Verification Metrics (How to Know It's Working)

**Track These During Playtesting:**

1. **Insight Velocity:** Average Insight/hour across player base
   - **Target:** 60-70 Insight/hour
   - **Red Flag:** >100 Insight/hour (inflation detected)

2. **Spending Ratio:** Total Insight earned vs. total Insight spent
   - **Target:** 80-90% spent by endgame
   - **Red Flag:** <60% spent (not enough sinks)

3. **Choice Diversity:** % of players who unlock all major choices
   - **Target:** <30% unlock everything (scarcity working)
   - **Red Flag:** >60% unlock everything (no prioritization needed)

4. **Loop Count to Completion:** Average loops to reach endgame
   - **Target:** 12-18 loops
   - **Red Flag:** <8 loops (too easy) or >25 loops (too grindy)

5. **Player-Reported "Grind Feel":** Survey question: "Did you feel like you were grinding?"
   - **Target:** <20% say "yes"
   - **Red Flag:** >40% say "yes"

### 7.4 Emergency Patches (If Inflation Detected Post-Launch)

**If players discover exploit:**

**Option A: Hotfix Nerf**
```javascript
// Reduce specific source's output
if (source.id === "DROWNED_CHAPEL") {
  baseAmount = 20; // Down from 40
}
```

**Option B: Add New Sink**
```javascript
// Introduce expensive but desirable unlock
newUnlock("LOOP_SKIP_ABILITY", {
  cost: 500, // Massive sink
  effect: "Start new loop at hour 12 instead of hour 0"
});
```

**Option C: Retroactive Tax**
```javascript
// One-time adjustment for existing saves
if (totalInsight > 800 && !hasBeenTaxed) {
  totalInsight = Math.floor(totalInsight * 0.7);
  showMessage("The island's memories fade. Some knowledge is lost.");
  hasBeenTaxed = true;
}
```

---

## 8. IMPLEMENTATION PRIORITY

### Phase 1: Core Systems (Weeks 1-2)
- Insight earning/spending
- Death/banking mechanics
- Archive domain tracking
- NPC Resonance system

### Phase 2: Content (Weeks 3-5)
- 3 example quests (from Section 4)
- 5-7 NPCs with dialogue trees
- 10-15 explorable locations
- 70 Archive pages (placeholder text OK)

### Phase 3: Balance Tuning (Weeks 6-7)
- Implement caps and diminishing returns
- Playtest loop efficiency
- Adjust Insight values per source
- Test mutual exclusivity branches

### Phase 4: Retention Polish (Week 8)
- Daily hooks
- Exit summaries
- Micro-milestone chains
- Save/load with session tracking

---

## 9. SUCCESS CRITERIA

The systems are successful if:

1. **No Dominant Strategy:** Top 10% of players use 5+ different strategies to complete game
2. **Meaningful Choices:** Player surveys show >70% felt choices "mattered"
3. **Balanced Difficulty:** Average player completes game in 12-18 loops (8-12 hours total)
4. **Retention:** 60%+ of players who complete Loop 1 return for Loop 2
5. **No Exploits:** No reproducible method to earn >200 Insight/hour found in first month

---

## APPENDIX A: Quick Reference Tables

### Insight Costs Reference

| Unlock Type | Cost Range | Example |
|------------|-----------|---------|
| Basic NPC Dialogue | 10-20 | "Tell me about the lighthouse" |
| Deep NPC Dialogue | 30-50 | "What really happened 19 years ago?" |
| Relic Activation | 75-100 | Skull of Speaking |
| Fast Travel Beacon | 75 | Unlock checkpoint |
| Archive Page Restoration | 30 | Piece together damaged page |
| Meta-Progression Unlock | 200-500 | Sprint, Second Chance, etc. |

### Insight Earning Reference

| Source Type | Amount | Repeatability |
|------------|--------|---------------|
| First Location Discovery | 5-15 | One-time |
| NPC Dialogue (Meaningful) | 3-8 | One-time per node |
| Environmental Clue | 2-5 | One-time |
| Quest Completion | 20-50 | One-time |
| Death Bonus | 10% of loop | Every death |
| Archive Page Find | 0* | One-time (unlocks understanding, not direct Insight) |

### Archive Domain Unlock Thresholds

| Pages | Tier | Effect |
|-------|------|--------|
| 0-2 | Novice | See basic clues |
| 3-5 | Adept | Understand clues |
| 6-9 | Expert | Rare synthesis |
| 10 | Master | Full domain mastery |

### NPC Resonance Effects

| Level | Effect |
|-------|--------|
| 0-3 | Surface dialogue only |
| 4-6 | Personal story revealed |
| 7-9 | Becomes ally, offers aid |
| 10 | Final secret, sacrifice option |

---

**END OF DOCUMENT**

---

## DESIGNER NOTES

This system is designed for a **knowledge-driven roguelite** where:
- Combat is minimal/absent (survival via navigation, dialogue, choices)
- Progression is persistent understanding, not gear/stats
- Difficulty comes from resource management and moral weight, not reflexes
- Replay value comes from branching paths and mutual exclusivity

**Key balancing philosophy:**
- **Scarcity creates value:** Hard caps prevent inflation
- **Diversity prevents grind:** One-time sources force broad exploration
- **Consequences create weight:** Choices lock paths permanently
- **Clarity enables strategy:** Players understand costs/rewards, plan accordingly

This is designed for a **4,500-6,000 LOC implementation**. Every system has clear mechanical hooks for code. No hand-waving—these are implementable systems.

Good luck, Keeper.
