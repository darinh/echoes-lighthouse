export type InsightCardId =
  | 'vael_origin'
  | 'mechanism_purpose'
  | 'light_source_truth'
  | 'keeper_betrayal'
  | 'spirit_binding'
  | 'island_history'
  | 'final_signal'
  | 'light_covenant'
  | 'warden_truth'
  | 'warden_identity'
  | 'warden_buried'

export interface InsightCard {
  id: InsightCardId
  titleKey: string
  descKey: string
  cost: number
  worldFlagRequired?: string
  /** Narrative thread this insight belongs to, if any. */
  threadId?: string
  /** 1-based position within the thread chain (lower = earlier in the story). */
  threadOrder?: number
}

export const INSIGHT_CARDS: InsightCard[] = [
  // ── Thread: vael_truth — The Vael's Story ────────────────────────────────
  {
    id: 'island_history',
    titleKey: 'insight.island_history.title',
    descKey: 'insight.island_history.desc',
    cost: 40,
    threadId: 'vael_truth',
    threadOrder: 1,
  },
  {
    id: 'vael_origin',
    titleKey: 'insight.vael_origin.title',
    descKey: 'insight.vael_origin.desc',
    cost: 80,
    threadId: 'vael_truth',
    threadOrder: 2,
  },
  {
    id: 'spirit_binding',
    titleKey: 'insight.spirit_binding.title',
    descKey: 'insight.spirit_binding.desc',
    cost: 60,
    worldFlagRequired: 'examined_binding_rune',
    threadId: 'vael_truth',
    threadOrder: 3,
  },
  {
    id: 'final_signal',
    titleKey: 'insight.final_signal.title',
    descKey: 'insight.final_signal.desc',
    cost: 100,
    worldFlagRequired: 'examined_keepers_last_log',
    threadId: 'vael_truth',
    threadOrder: 4,
  },

  // ── Thread: lighthouse_mystery — The Lighthouse Secret ────────────────────
  {
    id: 'mechanism_purpose',
    titleKey: 'insight.mechanism_purpose.title',
    descKey: 'insight.mechanism_purpose.desc',
    cost: 60,
    worldFlagRequired: 'examined_mechanism_symbols',
    threadId: 'lighthouse_mystery',
    threadOrder: 1,
  },
  {
    id: 'light_source_truth',
    titleKey: 'insight.light_source_truth.title',
    descKey: 'insight.light_source_truth.desc',
    cost: 70,
    worldFlagRequired: 'vael_surfacing_pattern',
    threadId: 'lighthouse_mystery',
    threadOrder: 2,
  },
  {
    id: 'keeper_betrayal',
    titleKey: 'insight.keeper_betrayal.title',
    descKey: 'insight.keeper_betrayal.desc',
    cost: 50,
    worldFlagRequired: 'examined_keepers_last_log',
    threadId: 'lighthouse_mystery',
    threadOrder: 3,
  },
  {
    id: 'light_covenant',
    titleKey: 'insight.light_covenant.title',
    descKey: 'insight.light_covenant.desc',
    cost: 65,
    worldFlagRequired: 'warden_cycle_known',
    threadId: 'lighthouse_mystery',
    threadOrder: 4,
  },

  // ── Thread: warden_awakening — The Warden Below ───────────────────────────
  {
    id: 'warden_identity',
    titleKey: 'insight.warden_identity.title',
    descKey: 'insight.warden_identity.desc',
    cost: 70,
    worldFlagRequired: 'warden_keepers_known',
    threadId: 'warden_awakening',
    threadOrder: 1,
  },
  {
    id: 'warden_truth',
    titleKey: 'insight.warden_truth.title',
    descKey: 'insight.warden_truth.desc',
    cost: 90,
    worldFlagRequired: 'warden_purpose_known',
    threadId: 'warden_awakening',
    threadOrder: 2,
  },
  {
    id: 'warden_buried',
    titleKey: 'insight.warden_buried.title',
    descKey: 'insight.warden_buried.desc',
    cost: 80,
    worldFlagRequired: 'warden_buried_known',
    threadId: 'warden_awakening',
    threadOrder: 3,
  },
]

// ── Thread metadata — display names for each thread ──────────────────────────
export interface InsightThread {
  id: string
  titleKey: string
}

export const INSIGHT_THREADS: InsightThread[] = [
  { id: 'vael_truth',          titleKey: 'insight.thread.vael_truth.title' },
  { id: 'lighthouse_mystery',  titleKey: 'insight.thread.lighthouse_mystery.title' },
  { id: 'warden_awakening',    titleKey: 'insight.thread.warden_awakening.title' },
]
