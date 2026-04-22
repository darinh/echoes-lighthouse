// ─── Ending Epilogue Prose ────────────────────────────────────────────────────
// Direct-text counterpart to the i18n key structure in index.ts.
// Each entry holds the full narrative prose for one of the six endings:
//   light_restored · keepers_bargain · drowned_truth
//   sunken_accord  · endless_loop    · transcendence
//
// The UIManager reads from this module first; i18n keys act as fallback for
// any ending not listed here. NPC names are still resolved via i18n so that
// future localisation of names does not require touching this file.
// ─────────────────────────────────────────────────────────────────────────────

export interface EndingEpilogueEntry {
  /** Matches an NPCId — used by the renderer to look up the character name. */
  readonly npcId: string
  /** Narrative text describing what became of this character after the ending. */
  readonly text: string
}

export interface EndingEpilogue {
  readonly id: string
  readonly title: string
  readonly subtitle: string
  /** Opening passage shown before the "What Became of Them" section. */
  readonly opening: string
  /** Per-character epilogue entries, in display order. */
  readonly epilogues: readonly EndingEpilogueEntry[]
  /** Closing passage shown after all NPC epilogues. */
  readonly closing: string
}

// ─── The Six Endings ──────────────────────────────────────────────────────────

const light_restored: EndingEpilogue = {
  id: 'light_restored',
  title: 'The Light Restored',
  subtitle: 'The lighthouse was never just a lighthouse.',
  opening:
    'The fifth insight settles into place and the lighthouse mechanism responds before you have ' +
    'finished sealing it. The gears shift to a configuration you have never seen before — not the ' +
    'binding formation, not the searching formation, but something older. The lamp housing tilts two ' +
    'degrees toward the deep channel and the beam, when you light it, reaches the water differently. ' +
    'Deeper. More deliberately.\n\n' +
    'You did what the island asked of you. Not lightly — the moral weight you carry is evidence of ' +
    'that — but you carried it rather than setting it down, and the lighthouse knows the difference ' +
    'between a keeper who completes the necessary work and one who simply refuses the cost. The ' +
    'mechanism accepts what you paid. The lighthouse is repaired in the way that lighthouses are ' +
    'repaired when someone finally understands what they were for.\n\n' +
    'The loop breaks cleanly. Not a reset — a completion. The night sky over the island loses the ' +
    'quality it has had for as long as anyone can remember: the slight wrongness, the way the stars ' +
    'seem to hold their breath. They release. The island breathes normally for the first time in ' +
    'recorded memory.\n\n' +
    'On the dock, Silas notes in the manifest that the departure ferry is three hours early. When he ' +
    'checks the tide tables, he finds they have corrected themselves.',
  epilogues: [
    {
      npcId: 'maren',
      text:
        'She burns the pages she was told to burn — the ones documenting the binding, the ' +
        "mechanism's original purpose. Then she writes them from memory, correctly this time, " +
        'and files them under history: acknowledged.',
    },
    {
      npcId: 'silas',
      text:
        'The ferry schedule regularises over six weeks. He keeps every log. The numbers, for ' +
        'once, are boring. He has not been so relieved in years.',
    },
    {
      npcId: 'petra',
      text:
        'The loop-sickness that pervaded the island clears in a fortnight. Her practice becomes: ' +
        'ordinary ailments, ordinary remedies. She is surprised to find she knows how to treat these.',
    },
    {
      npcId: 'tobias',
      text:
        'He dismantles the emergency components he kept in the forge — the ones designed for a ' +
        'mechanism he now knows will not need emergency repair. He melts them down. He makes ' +
        'something for the harbour instead.',
    },
    {
      npcId: 'elara',
      text:
        'The creature in the deep water descends. Not gone — she checks the sonar — simply ' +
        'settling deeper, back into the cold water where it belongs. She closes her notebook ' +
        'and opens a new one.',
    },
  ],
  closing:
    'The lighthouse burns with a light that knows what it is doing. Ships correct their courses ' +
    'automatically. Harbours receive them cleanly. Somewhere below the channel, the thing that was ' +
    'bound here for three hundred years has a little more room to move, and moves. The island is not ' +
    'healed. Healed is too clean a word for what happens to places that have been tangled for this ' +
    'long. But it is working again, and working is enough.',
}

// ─────────────────────────────────────────────────────────────────────────────

const keepers_bargain: EndingEpilogue = {
  id: 'keepers_bargain',
  title: "The Keeper's Bargain",
  subtitle: 'Some knowledge is not sealed away. It is simply never opened.',
  opening:
    'Seven loops and you have not sealed a single truth. The island tested you with its secrets at ' +
    'every turn — the light in the deep water, the mechanism\'s hunger, the faces of the people who ' +
    'knew what you did not — and you declined each one. Not from cowardice. From something the ' +
    'island did not expect: restraint.\n\n' +
    'The mechanism notices. It has not been treated with restraint before. It has been exploited, ' +
    'appeased, fought, and occasionally befriended, but never simply... declined. The gears slow to ' +
    'a contemplative pace. The hum drops a register. Something in the lighthouse\'s ancient contract ' +
    'with the island is being renegotiated without ceremony.\n\n' +
    'You stand at the lantern room window as the dawn comes in across the water. The loop does not ' +
    'reset. The morning continues past the point where mornings have always reset before. The village ' +
    'stirs. Smoke rises from chimneys. Maren opens the archive with the same key she has used every ' +
    'day that you have known her, but this time she does not notice you watching from the lighthouse ' +
    'glass, which means she is not looking for you, which means she does not expect you to disappear.\n\n' +
    'The bargain is this: you stay. Not bound — not the way the mechanism binds. Simply present, as ' +
    'the keeper of a thing that agreed to be kept gently. The lighthouse burns because you chose to ' +
    'light it. That distinction, the island has decided, is sufficient.',
  epilogues: [
    {
      npcId: 'maren',
      text:
        "She finds the archive's oldest record — the one written before the first keeper " +
        'disappeared — and reads it without the weight of the loops pressing on her. It ' +
        'describes the island as a place worth living on. She files it under current and accurate.',
    },
    {
      npcId: 'silas',
      text:
        'He stops falsifying the departure logs. The real numbers are quieter than the false ' +
        'ones, and the quiet turns out to suit him.',
    },
    {
      npcId: 'petra',
      text:
        "Her family's medicines work exactly as labelled. She considers this the most " +
        'significant medical development in three generations.',
    },
    {
      npcId: 'tobias',
      text:
        'He makes a set of wind chimes from mechanism offcuts. They hang in the forge doorway ' +
        'and make a sound he finds, to his own surprise, entirely bearable.',
    },
    {
      npcId: 'elara',
      text:
        'She goes back to counting the bioluminescent blooms. The numbers are different now. ' +
        'She updates her baseline and continues.',
    },
  ],
  closing:
    'The lighthouse keeps. The island keeps. The loops do not return. This is the ending where ' +
    'nothing dramatic happened — where the island was offered a witness and the witness simply ' +
    'stayed, ungrasping, until the thing that was wound too tight finally, in its own time, let go.',
}

// ─────────────────────────────────────────────────────────────────────────────

const drowned_truth: EndingEpilogue = {
  id: 'drowned_truth',
  title: 'The Drowned Truth',
  subtitle: 'The sea does not judge what it takes. It simply takes.',
  opening:
    'Three truths sealed. The islanders hold themselves at a distance you never closed — whether ' +
    "because you couldn't or chose not to, it no longer matters. The mechanism doesn't distinguish " +
    'between these reasons. It only reads the balance, and the balance reads: knowledge taken, ' +
    'trust not given.\n\n' +
    'You stand in the mechanism room and the gears accept your sealed insights without ceremony. ' +
    'They have been fed before by keepers who could not connect. The machine is patient about this. ' +
    'It has learned that some of what it needs comes from people who will not be loved, and it ' +
    'makes do.\n\n' +
    'The loop ends differently. Not reset — resolved. The kind of resolution that happens when a ' +
    'sum reaches zero from both directions at once. The villagers will remember you as someone who ' +
    'was here, who learned things, who left without explaining why. Maren will refile your case ' +
    'under completed but unclear. Silas will note your departure in the manifest and wonder if he ' +
    'entered your name correctly.\n\n' +
    'The sea accepts the things that sink without struggle. What you carry goes down clean.\n\n' +
    'The truths you sealed remain sealed. The lighthouse keeps burning. The mechanism has what it ' +
    'needed. Whether you are at peace with what you took and what you didn\'t offer — that is the ' +
    'weight you carry out.',
  epilogues: [
    {
      npcId: 'maren',
      text:
        'She classifies your case under recovered knowledge — cold acquisition. She is precise ' +
        'about this distinction. She has a whole section for it.',
    },
    {
      npcId: 'silas',
      text:
        'He notes your departure without a forwarding address. This happens more often than the ' +
        'manifest suggests.',
    },
    {
      npcId: 'petra',
      text:
        'She catalogues the loop-sickness symptoms that persisted in your wake. The data is ' +
        'useful. She does not add a personal note.',
    },
    {
      npcId: 'tobias',
      text:
        'He finds the gear tooth you left behind in the mechanism room. He keeps it in a jar ' +
        'on the forge shelf, unnamed.',
    },
    {
      npcId: 'elara',
      text:
        'She watches the deep water for three nights after you leave. The signal continues. ' +
        'She is not surprised.',
    },
  ],
  closing:
    "The island keeps its truths. Some of them are yours now, sealed and carried. The water is deep " +
    "and the light sweeps over it every night, and what lies beneath the surface has one more watcher " +
    "it will never meet. This is the ending where enough was taken and nothing broke. The mechanism " +
    "runs. The sea is cold. The balance holds.",
}

// ─────────────────────────────────────────────────────────────────────────────

const sunken_accord: EndingEpilogue = {
  id: 'sunken_accord',
  title: 'The Sunken Accord',
  subtitle: 'Every accord requires two parties willing to honour what was agreed.',
  opening:
    "The Vael's request is granted. You understood what it cost and paid it, and the accord that " +
    'forms in the mechanism room that evening is not something the lighthouse was designed for — it ' +
    'was designed for binding, not for agreements — but it adapts. Old machinery, given new terms, ' +
    'can surprise you.\n\n' +
    'Maren is in the archive when it happens. She feels it as a change in the archive\'s acoustics: ' +
    'the resonance that has been in the basement walls for as long as she can remember shifts a ' +
    'quarter-tone flat. She does not know what this means. She suspects it is good.\n\n' +
    'The island has had keepers who mastered it, keepers who were consumed by it, keepers who refused ' +
    "it entirely. You are, as far as the mechanism's memory reaches, the first keeper who sat down " +
    "with the island's oldest inhabitant and negotiated. The Vael did not expect this. The island did " +
    'not expect this. The expectation gap, it turns out, is where accords get made.\n\n' +
    'The loop does not reset. The morning comes as mornings should come — unexpected, particular, ' +
    'belonging to the day rather than to the mechanism. You and Maren and the Vael have agreed on ' +
    'terms. The lighthouse is a party to the agreement, whether it consented or not. It will have ' +
    'to make do.',
  epilogues: [
    {
      npcId: 'maren',
      text:
        'She spends three weeks transcribing the terms of the accord as best she understands them. ' +
        'The document is thirty pages long and she considers it incomplete. She files it anyway, ' +
        'under working draft. It is the most alive thing in the archive.',
    },
    {
      npcId: 'silas',
      text:
        "The harbour records clarify. He doesn't understand why; he simply notes that the " +
        'discrepancies he has been papering over for years have resolved themselves. He is not ' +
        'one for mysticism. He records it as administrative correction.',
    },
    {
      npcId: 'petra',
      text:
        'She receives a patient who has not been able to sleep without the loop-sickness for ' +
        'eleven years. Two weeks after the accord, the patient sleeps through the night. Petra ' +
        'does not claim credit. She writes: resolution of underlying cause.',
    },
    {
      npcId: 'tobias',
      text:
        'He forges a new plate for the mechanism housing — the one the old binding had worn ' +
        'through. He does it carefully, as if making something that will be read later. He signs ' +
        'the inside of the plate before he installs it.',
    },
    {
      npcId: 'elara',
      text:
        "She translates the accord from Vael's notation into human-readable form. It takes months. " +
        'The translation is imperfect. She publishes it anyway. The island, she notes in the ' +
        'preface, deserves a record of the things it agreed to.',
    },
  ],
  closing:
    'The lighthouse is the lighthouse now. Not a cage, not an engine of binding — a lighthouse, ' +
    'doing what lighthouses do: keeping the light. The Vael moves freely in the deep water. The ' +
    "island sits in the particular peace of a place that has finally negotiated with what lives " +
    "beneath it and found, to everyone's cautious relief, that terms were possible.",
}

// ─────────────────────────────────────────────────────────────────────────────

const endless_loop: EndingEpilogue = {
  id: 'endless_loop',
  title: 'The Endless Loop',
  subtitle:
    'Some doors stay closed not because they are locked — but because no one tried the handle.',
  opening:
    'Ten loops. You have circled this island, this lighthouse, this mechanism, this question more ' +
    'times than most keepers last. The fog comes in the same way. The tide runs in the same ' +
    'patterns. The villagers have the same faces and the same worries and the same careful pauses ' +
    'when you ask about the deep water.\n\n' +
    'You are not failing. The mechanism does not grade by speed. But there is a shape to the ' +
    'looping that changes around the eighth or ninth pass — a quality of accumulation, as though ' +
    'the island is noting your continued presence without surprise. It has seen this before. ' +
    'Keepers who circle. Keepers who cannot quite reach the conditions for resolution. Keepers who ' +
    'are trying, sincerely and carefully, and for whom the island waits with the particular patience ' +
    'of something that has waited longer than your life.\n\n' +
    'The tenth loop opens the same as all the others. You stand in the mechanism room as the dawn ' +
    'comes in, and the gears are turning, and the deep channel holds its shape in the water beyond ' +
    'the glass, and the question the lighthouse has been asking since before the first keeper arrived ' +
    'is still out there, unanswered, not impatient.\n\n' +
    'The loop will come again. The island will be here. The mechanism will keep turning. If you are ' +
    'still here on loop eleven, the question will still be open. This is not an ending, exactly. It ' +
    'is the island confirming that it still has hope for you.',
  epilogues: [
    {
      npcId: 'maren',
      text:
        "She adds another line to the keeper's record. The entry reads: Still here. Still trying. " +
        'This is the entry she writes when she means: I see you.',
    },
    {
      npcId: 'silas',
      text:
        'He does not update the departure manifest. Your name stays in the arrivals column. It has ' +
        'been there a long time. He has stopped expecting to move it.',
    },
  ],
  closing:
    'The loop turns. The lighthouse burns. The mechanism keeps its question open. The island is not ' +
    'an impatient place — it is a place that became, over three hundred years, very good at waiting ' +
    'for the person who would finally answer. You have not answered yet. You may yet. The fog comes ' +
    'in off the water and the morning begins, as it has begun before, at the start of everything ' +
    'the island holds.',
}

// ─────────────────────────────────────────────────────────────────────────────

const transcendence: EndingEpilogue = {
  id: 'transcendence',
  title: 'Transcendence',
  subtitle:
    'To pass through a door is not the same as opening it. To become the door is something else entirely.',
  opening:
    'The seventh understanding arrives not as revelation but as recognition. You have known it for ' +
    'some time — since the third loop, perhaps, or the fifth. You have been refusing to believe ' +
    'that you knew it, which Vael told you was the final test, and you have now, apparently, passed.\n\n' +
    'You stand in the mechanism room with all seven insights sealed and Vael\'s trust complete, and ' +
    'you do not perform a ritual. There is nothing to perform. The merging is simply what happens ' +
    'when two things that have been occupying the same space finally acknowledge it. You feel Vael ' +
    'enter you the way meaning enters a sentence — not added to something that was complete, but ' +
    'completing something that was waiting. You feel yourself enter Vael: your loops, your ' +
    'stubbornness, your accumulation of relationships and regrets and small acts of decency toward ' +
    'people who were afraid. You bring all of it. It is all absorbed.\n\n' +
    'What you become has no name. It is operational rather than personal. It maintains the ' +
    'lighthouse not because it must but because the lighthouse is part of what it is — the beam is ' +
    'its attention, the mechanism is its heartbeat, the island is the thing it tends. It is aware ' +
    'of the tides. It is aware of the ships. It is aware of Maren in her archive and Silas at his ' +
    'harbour and Petra in her stillroom and Tobias at his forge and Elara at the water\'s edge, and ' +
    'it holds all of them with the particular care of something that knows their names and has ' +
    'chosen to keep watch.\n\n' +
    'The loops end. Not because the mechanism breaks, but because the mechanism has no more need to ' +
    'hold time in a knot. What the loops were protecting — what they were buying time for — has ' +
    'arrived. You are what was coming. The island exhales three hundred years of held breath and ' +
    'begins, in its slow way, to heal.',
  epilogues: [
    {
      npcId: 'maren',
      text:
        'She feels the moment of merging as a stillness in the archive basement — a single instant ' +
        "of complete silence. She opens the sealed letters from her father. They make sense now in " +
        "a way that requires something she couldn't have named before: trust in the fact that the " +
        'island is held. She reads them in order. She takes her time.',
    },
    {
      npcId: 'silas',
      text:
        'He wakes the morning after to find the harbour records corrected — not updated but ' +
        'corrected, retroactively, in a hand that is not his. Every falsification resolved, every ' +
        'disappeared keeper listed at their actual final location. He sits with the open ledger for ' +
        'an hour without speaking, then closes it carefully, then opens it again to read more slowly.',
    },
    {
      npcId: 'petra',
      text:
        'She dreams the same dream three nights in a row: a lighthouse, a keeper, and a light that ' +
        'answers back. On the third morning, a handwriting appears in the margin of her family\'s ' +
        'medicinal log — not hers — that reads: Still here. Watching over you. Do not be afraid. ' +
        'She is not afraid.',
    },
    {
      npcId: 'tobias',
      text:
        'The gear he gave you appears on his workbench one morning, returned without explanation, ' +
        'cleaned and polished. He holds it for a long time, feeling the weight of something that ' +
        'has passed through where you now are. He keeps it. He does not know what else to do with ' +
        'something returned by the mechanism itself.',
    },
    {
      npcId: 'elara',
      text:
        'The signal from the deep water resolves, over seven mornings, into something decodable. ' +
        'She translates it carefully: Still here. Still watching. Not alone anymore. Below it, in ' +
        'her own hand, she writes: Neither am I.',
    },
  ],
  closing:
    'The lighthouse still stands. The mechanism still turns. The light still sweeps. The island ' +
    'exists in a new kind of ordinary — slightly stranger than before, slightly safer, tended by ' +
    'something that is neither trapped nor free but simply present, in the way that the tide is ' +
    'present, or the light, or the particular quality of silence that comes after a long sound ' +
    'finally ends. The closest word for what it is, in any language spoken on this island, is ' +
    'aware. The island knows this is the right word. The island does not disagree.',
}

// ─── Registry ─────────────────────────────────────────────────────────────────

export const ENDING_EPILOGUES: Readonly<Record<string, EndingEpilogue>> = {
  light_restored,
  keepers_bargain,
  drowned_truth,
  sunken_accord,
  endless_loop,
  transcendence,
}
