export type InsightCardId =
  | 'vael_origin'
  | 'mechanism_purpose'
  | 'light_source_truth'
  | 'keeper_betrayal'
  | 'spirit_binding'
  | 'island_history'
  | 'final_signal'

export interface InsightCard {
  id: InsightCardId
  titleKey: string
  descKey: string
  cost: number
  worldFlagRequired?: string
}

export const INSIGHT_CARDS: InsightCard[] = [
  {
    id: 'vael_origin',
    titleKey: 'insight.vael_origin.title',
    descKey: 'insight.vael_origin.desc',
    cost: 80,
  },
  {
    id: 'mechanism_purpose',
    titleKey: 'insight.mechanism_purpose.title',
    descKey: 'insight.mechanism_purpose.desc',
    cost: 60,
    worldFlagRequired: 'examined_mechanism_symbols',
  },
  {
    id: 'light_source_truth',
    titleKey: 'insight.light_source_truth.title',
    descKey: 'insight.light_source_truth.desc',
    cost: 70,
    worldFlagRequired: 'examined_lens_inscription',
  },
  {
    id: 'keeper_betrayal',
    titleKey: 'insight.keeper_betrayal.title',
    descKey: 'insight.keeper_betrayal.desc',
    cost: 50,
    worldFlagRequired: 'examined_keepers_last_log',
  },
  {
    id: 'spirit_binding',
    titleKey: 'insight.spirit_binding.title',
    descKey: 'insight.spirit_binding.desc',
    cost: 60,
    worldFlagRequired: 'examined_binding_rune',
  },
  {
    id: 'island_history',
    titleKey: 'insight.island_history.title',
    descKey: 'insight.island_history.desc',
    cost: 40,
  },
  {
    id: 'final_signal',
    titleKey: 'insight.final_signal.title',
    descKey: 'insight.final_signal.desc',
    cost: 100,
    worldFlagRequired: 'examined_keepers_last_log',
  },
]
