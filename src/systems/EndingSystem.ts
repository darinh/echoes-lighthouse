import type { ISystem, IGameState, IGameEvent, IEventBus } from '@/interfaces/index.js'

// ─── Ending condition evaluator ───────────────────────────────────────────────
// Priority order (highest first):
//   transcendence > light_restored > sunken_accord > keepers_bargain > drowned_truth > endless_loop

const ALL_SEVEN_INSIGHTS = [
  'light_source_truth',
  'vael_origin',
  'keeper_betrayal',
  'spirit_binding',
  'mechanism_purpose',
  'island_history',
  'final_signal',
] as const

/** Evaluate ending conditions against the current state and return the
 *  highest-priority matching ending ID, or null if none match yet. */
function evaluateEndings(state: IGameState): string | null {
  const { player, worldFlags } = state
  const sealed = player.sealedInsights
  const totalTrust = Object.values(player.trust).reduce((a, b) => a + b, 0)

  // 1. SECRET — Transcendence: all 7 insight cards sealed
  if (ALL_SEVEN_INSIGHTS.every(id => sealed.has(id))) return 'transcendence'

  // 2. The Light Restored: ≥5 sealed + lighthouse_repaired flag + moralWeight ≤ 30
  if (
    sealed.size >= 5 &&
    worldFlags.has('lighthouse_repaired') &&
    player.moralWeight <= 30
  ) return 'light_restored'

  // 3. The Sunken Accord: vael_request_granted flag + maren trust ≥ 5 + moralWeight −20…+20
  const marenTrust = player.trust['maren' as keyof typeof player.trust] ?? 0
  if (
    worldFlags.has('vael_request_granted') &&
    marenTrust >= 5 &&
    player.moralWeight >= -20 &&
    player.moralWeight <= 20
  ) return 'sunken_accord'

  // 4. The Keeper's Bargain: survived ≥7 loops, 0 insights sealed, moralWeight ≤ 20
  if (
    player.loopCount >= 7 &&
    sealed.size === 0 &&
    player.moralWeight <= 20
  ) return 'keepers_bargain'

  // 5. The Drowned Truth: ≥3 sealed + total NPC trust across all NPCs ≤ 10
  if (sealed.size >= 3 && totalTrust <= 10) return 'drowned_truth'

  // 6. The Endless Loop: ≥10 loops (gave-up / default ending)
  if (player.loopCount >= 10) return 'endless_loop'

  return null
}

export class EndingSystem implements ISystem {
  readonly name = 'EndingSystem'

  constructor(private readonly eventBus: IEventBus) {}

  init(state: IGameState): IGameState { return state }
  update(state: IGameState, _deltaMs: number): IGameState { return state }

  onEvent(event: IGameEvent, state: IGameState): IGameState {
    switch (event.type) {
      case 'loop.started':
      case 'loop.dawn':
      case 'insight.card.sealed':
      case 'npc.trust.changed':
      case 'npc.trust.gained':
      case 'npc.trust.up':
      case 'npc.trust.lost':
        return this.checkEndings(state)
      default:
        return state
    }
  }

  private checkEndings(state: IGameState): IGameState {
    if (state.phase === 'ending') return state
    const endingId = evaluateEndings(state)
    if (endingId !== null) {
      this.eventBus.emit('ending.triggered', { endingId })
    }
    return state
  }
}
