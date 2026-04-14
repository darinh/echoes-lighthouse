import type { ISystem, IGameState, IGameEvent, IEventBus, NPCId } from '@/interfaces/index.js'

// Tier thresholds: index = tier (1–10), value = trust required to unlock that tier.
const TIER_THRESHOLDS = [0, 10, 20, 35, 50, 65, 80, 100, 120, 150, 200] as const

// Per-NPC cap reduction applied on betrayal events (-20, minimum 0).
const BETRAYAL_CAP_REDUCTION = 20

/**
 * ResonanceSystem — Tracks per-NPC trust (raw currency) and resonance tiers.
 *
 * Trust is persistent across loops. Each NPC has a trust cap (starts at 200).
 * Betrayal permanently lowers a NPC's cap by 20 points.
 * When accumulated trust crosses a tier threshold the NPC's dialogueTier
 * is advanced and a `npc.tier.unlocked` event is emitted.
 */
export class ResonanceSystem implements ISystem {
  readonly name = 'ResonanceSystem'

  // Per-NPC trust caps (starts at 200, reduced by betrayals).
  private trustCaps: Map<NPCId, number> = new Map()

  constructor(private readonly eventBus: IEventBus) {}

  init(state: IGameState): IGameState {
    // Initialise caps from current state (supports save/load).
    for (const id of Object.keys(state.player.trust) as NPCId[]) {
      if (!this.trustCaps.has(id)) {
        this.trustCaps.set(id, 200)
      }
    }
    return state
  }

  update(state: IGameState, _deltaMs: number): IGameState {
    return state
  }

  onEvent(event: IGameEvent, state: IGameState): IGameState {
    switch (event.type) {
      case 'npc.trust.gained': return this.handleTrustGained(event, state)
      case 'npc.trust.lost':   return this.handleTrustLost(event, state)
      default:                 return state
    }
  }

  private handleTrustGained(event: IGameEvent, state: IGameState): IGameState {
    const { npcId, amount } = event.payload as { npcId: NPCId; amount: number }
    const cap = this.trustCaps.get(npcId) ?? 200
    const currentTrust = state.player.trust[npcId] ?? 0
    const newTrust = Math.min(cap, currentTrust + amount)

    const newState = this.applyTrust(state, npcId, newTrust)
    return newState
  }

  private handleTrustLost(event: IGameEvent, state: IGameState): IGameState {
    const { npcId, amount } = event.payload as { npcId: NPCId; amount: number }
    const isBetrayal = (event.payload as Record<string, unknown>).betrayal === true

    if (isBetrayal) {
      const currentCap = this.trustCaps.get(npcId) ?? 200
      this.trustCaps.set(npcId, Math.max(0, currentCap - BETRAYAL_CAP_REDUCTION))
    }

    const currentTrust = state.player.trust[npcId] ?? 0
    const newTrust = Math.max(0, currentTrust - amount)
    return this.applyTrust(state, npcId, newTrust)
  }

  private applyTrust(state: IGameState, npcId: NPCId, newTrust: number): IGameState {
    const previousTier = state.player.resonance[npcId] ?? 0
    const newTier = this.tierFromTrust(newTrust)

    const newTrustMap = { ...state.player.trust, [npcId]: newTrust }
    const newResonanceMap = { ...state.player.resonance, [npcId]: newTier }

    let newNpcStates = state.npcStates
    if (newTier !== previousTier) {
      const npcState = state.npcStates[npcId]
      if (npcState) {
        newNpcStates = {
          ...state.npcStates,
          [npcId]: { ...npcState, dialogueTier: newTier },
        }
        this.eventBus.emit('npc.tier.unlocked', { npcId, tier: newTier })
      }
    }

    return {
      ...state,
      player: {
        ...state.player,
        trust: newTrustMap,
        resonance: newResonanceMap,
      },
      npcStates: newNpcStates,
    }
  }

  private tierFromTrust(trust: number): number {
    let tier = 0
    for (let t = 1; t < TIER_THRESHOLDS.length; t++) {
      if (trust >= TIER_THRESHOLDS[t]) {
        tier = t
      } else {
        break
      }
    }
    return tier
  }
}
