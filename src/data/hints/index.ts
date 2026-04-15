export interface HintDefinition {
  id: string
  textKey: string           // i18n key
  triggerFlag: string       // worldFlag that triggers display (set by engine)
  dismissFlag: string       // worldFlag set when player dismisses (or auto-dismissed)
}

export const HINTS: HintDefinition[] = [
  { id: 'first_move',    textKey: 'hint.first_move',    triggerFlag: 'hint_trigger.first_move',    dismissFlag: 'hint_dismissed.first_move' },
  { id: 'first_examine', textKey: 'hint.first_examine', triggerFlag: 'hint_trigger.first_examine', dismissFlag: 'hint_dismissed.first_examine' },
  { id: 'first_npc',     textKey: 'hint.first_npc',     triggerFlag: 'hint_trigger.first_npc',     dismissFlag: 'hint_dismissed.first_npc' },
  { id: 'first_insight', textKey: 'hint.first_insight', triggerFlag: 'hint_trigger.first_insight', dismissFlag: 'hint_dismissed.first_insight' },
  { id: 'first_journal', textKey: 'hint.first_journal', triggerFlag: 'hint_trigger.first_journal', dismissFlag: 'hint_dismissed.first_journal' },
  { id: 'night_warning', textKey: 'hint.night_warning', triggerFlag: 'hint_trigger.night_warning', dismissFlag: 'hint_dismissed.night_warning' },
]
