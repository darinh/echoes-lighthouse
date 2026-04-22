export interface QuestStep {
  id: string
  descriptionKey: string
  completedBy: { type: 'fact' | 'dialogue' | 'location' | 'examine' | 'world_flag'; value: string }
}

/**
 * A single condition within a multi-condition trigger.
 * All conditions in a `triggerConditions` array must be true simultaneously
 * (AND semantics) for the quest to start.
 */
export interface TriggerCondition {
  /** The kind of state this condition inspects. */
  type: 'world_flag' | 'npc_trust' | 'npc_resonance' | 'loop_count' | 'location' | 'item_in_inventory'
  /**
   * The specific value to test:
   * - `world_flag`       → flag name in `state.worldFlags`
   * - `npc_trust`        → NPC id in `state.player.trust`
   * - `npc_resonance`    → NPC id in `state.player.resonance`
   * - `loop_count`       → ignored (use `min` instead)
   * - `location`         → LocationId in `state.player.currentLocation`
   * - `item_in_inventory`→ ItemId in `state.inventory`
   */
  value: string
  /** Minimum numeric threshold for trust / resonance / loop_count checks. Defaults to 1. */
  min?: number
}

export interface QuestDefinition {
  id: string
  titleKey: string
  descriptionKey: string
  /**
   * Single-condition trigger (legacy). Used when `triggerConditions` is absent or empty.
   */
  triggerType: 'location_visit' | 'dialogue_tier' | 'automatic' | 'examine' | 'world_flag' | 'dialogue'
  triggerValue: string
  /**
   * Multi-condition trigger (AND logic). When present and non-empty, takes precedence
   * over `triggerType`/`triggerValue`. All conditions must evaluate to true simultaneously.
   */
  triggerConditions?: TriggerCondition[]
  steps: QuestStep[]
  rewardInsight: number
  rewardFact?: string
}
