// ─────────────────────────────────────────────────────────────────────────────
// Moral Dilemma definitions — 8 dilemmas from the GDD (§4 Moral Weight System)
//
// Each dilemma presents exactly two choices. The system resolves them via
// MoralWeightSystem and dispatches 'dilemma.choice.made' on the event bus.
// ─────────────────────────────────────────────────────────────────────────────

export interface MoralDilemmaChoice {
  id: string
  label: string              // Display text for button
  moralWeightDelta: number   // positive = more weight; applied to player.moralWeight
  worldFlagSet?: string
  trustEffects?: Array<{ npcId: string; delta: number }>
  resonanceEffects?: Array<{ npcId: string; delta: number }>
  insightDelta?: number
}

export interface MoralDilemma {
  id: string
  title: string
  description: string
  triggerEvent: string
  triggerCondition?: {
    requiredWorldFlag?: string
    requiredNpcId?: string
    requiredLocationId?: string
    requiredCardId?: string
    minNpcTrust?: { npcId: string; min: number }
    minNpcResonance?: { npcId: string; min: number }
    minLoopCount?: number
  }
  choices: [MoralDilemmaChoice, MoralDilemmaChoice]
}

export const DILEMMAS: MoralDilemma[] = [
  {
    id: 'plague_cure',
    title: 'A Vial of Mercy',
    description:
      'Thalia and Oren both need the last vial of cure. Whose suffering do you ease?',
    triggerEvent: 'dialogue.start',
    triggerCondition: { requiredNpcId: 'thalia', minLoopCount: 2 },
    choices: [
      {
        id: 'help_thalia',
        label: 'Give it to Thalia',
        moralWeightDelta: -5,
        trustEffects: [
          { npcId: 'thalia', delta: 2 },
          { npcId: 'oren', delta: -1 },
        ],
      },
      {
        id: 'help_oren',
        label: 'Give it to Oren',
        moralWeightDelta: 5,
        trustEffects: [
          { npcId: 'oren', delta: 2 },
          { npcId: 'thalia', delta: -1 },
        ],
      },
    ],
  },
  {
    id: 'rudds_cargo',
    title: 'The Sealed Package',
    description:
      "Rudd's package arrived. Its weight feels wrong. Do you open it, or deliver it sealed?",
    triggerEvent: 'item.taken',
    triggerCondition: { requiredWorldFlag: 'found_sealed_package' },
    choices: [
      {
        id: 'deliver_sealed',
        label: 'Deliver it sealed',
        moralWeightDelta: -5,
        trustEffects: [{ npcId: 'rudd', delta: 3 }],
        worldFlagSet: 'rudd_package_delivered',
      },
      {
        id: 'open_package',
        label: 'Open the package',
        moralWeightDelta: 10,
        worldFlagSet: 'rudd_package_opened',
      },
    ],
  },
  {
    id: 'cals_letter',
    title: 'The Letter',
    description:
      "Cal's letter reveals something Maren should know — but it would break her. Do you share it?",
    triggerEvent: 'dialogue.start',
    triggerCondition: { requiredNpcId: 'cal', requiredWorldFlag: 'cal_truth_revealed' },
    choices: [
      {
        id: 'share_letter',
        label: 'Share it with Maren',
        moralWeightDelta: 5,
        trustEffects: [{ npcId: 'maren', delta: 1 }],
        worldFlagSet: 'maren_told_truth',
      },
      {
        id: 'burn_letter',
        label: 'Burn the letter',
        moralWeightDelta: -10,
        trustEffects: [{ npcId: 'cal', delta: 2 }],
        worldFlagSet: 'letter_destroyed',
      },
    ],
  },
  {
    id: 'feeding_night',
    title: 'The Feeding Dark',
    description:
      'Vael grows strong on this dark night. You could weaken her — but the sailors she\'d claim might survive.',
    triggerEvent: 'loop.night',
    triggerCondition: { minLoopCount: 3 },
    choices: [
      {
        id: 'weaken_vael',
        label: 'Weaken Vael',
        moralWeightDelta: -5,
        resonanceEffects: [{ npcId: 'vael', delta: -2 }],
        worldFlagSet: 'vael_weakened',
      },
      {
        id: 'let_sailors_fend',
        label: 'Let them fend for themselves',
        moralWeightDelta: 10,
        worldFlagSet: 'sailors_endangered',
      },
    ],
  },
  {
    id: 'oren_ritual',
    title: 'The Chapel Rite',
    description:
      'Oren performs a ritual in the chapel. Something about it feels wrong. Do you interrupt?',
    triggerEvent: 'location.moved',
    triggerCondition: {
      requiredLocationId: 'chapel',
      minNpcTrust: { npcId: 'oren', min: 5 },
    },
    choices: [
      {
        id: 'respect_ritual',
        label: 'Respect the ritual, leave',
        moralWeightDelta: -5,
        trustEffects: [{ npcId: 'oren', delta: 2 }],
      },
      {
        id: 'interrupt_oren',
        label: 'Interrupt and confront Oren',
        moralWeightDelta: 8,
        worldFlagSet: 'oren_ritual_interrupted',
      },
    ],
  },
  {
    id: 'spirit_of_killer',
    title: 'The Bound Spirit',
    description:
      'The spirit in the binding card weeps. It killed, yes — but it suffered first. Compassion or justice?',
    triggerEvent: 'insight.card.sealed',
    triggerCondition: { requiredCardId: 'spirit_binding' },
    choices: [
      {
        id: 'release_spirit',
        label: 'Show compassion — release it',
        moralWeightDelta: -15,
        worldFlagSet: 'spirit_released',
      },
      {
        id: 'trap_spirit',
        label: 'Demand justice — trap it',
        moralWeightDelta: 10,
        worldFlagSet: 'spirit_trapped',
      },
    ],
  },
  {
    id: 'marens_father',
    title: "Her Father's Shadow",
    description:
      "The old journal reveals what happened to Maren's father. She deserves the truth — but it will hurt her.",
    triggerEvent: 'dialogue.start',
    triggerCondition: {
      requiredNpcId: 'maren',
      requiredWorldFlag: 'examined_old_journal',
    },
    choices: [
      {
        id: 'tell_maren',
        label: 'Tell Maren the truth',
        moralWeightDelta: 5,
        trustEffects: [{ npcId: 'maren', delta: -1 }],
        worldFlagSet: 'maren_told_about_father',
      },
      {
        id: 'protect_maren',
        label: 'Protect her from it',
        moralWeightDelta: -5,
        trustEffects: [{ npcId: 'maren', delta: 3 }],
        worldFlagSet: 'maren_protected',
      },
    ],
  },
  {
    id: 'vaels_request',
    title: "Vael's Price",
    description:
      "Vael asks for something only you can give. Granting it means her redemption. Refusing means her grief.",
    triggerEvent: 'dialogue.start',
    triggerCondition: {
      requiredNpcId: 'vael',
      minNpcResonance: { npcId: 'vael', min: 6 },
    },
    choices: [
      {
        id: 'grant_request',
        label: 'Grant her request',
        moralWeightDelta: -10,
        resonanceEffects: [{ npcId: 'vael', delta: 3 }],
        worldFlagSet: 'vael_request_granted',
      },
      {
        id: 'refuse_request',
        label: 'Refuse',
        moralWeightDelta: 8,
        worldFlagSet: 'vael_request_refused',
      },
    ],
  },
]
