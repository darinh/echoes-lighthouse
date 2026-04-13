import type { IGameState, LocationId } from '@/interfaces/index.js'
import type { IEventBus } from '@/interfaces/index.js'

/**
 * MovementSystem — Handles player location changes and discovery tracking.
 */
export class MovementSystem {
  constructor(private readonly eventBus: IEventBus) {}

  moveTo(state: IGameState, target: LocationId): IGameState {
    const wasDiscovered = state.player.discoveredLocations.has(target)
    const newDiscovered = new Set(state.player.discoveredLocations)
    newDiscovered.add(target)

    this.eventBus.emit('location.entered', { locationId: target })
    if (!wasDiscovered) {
      this.eventBus.emit('location.discovered', { locationId: target })
    }

    return {
      ...state,
      player: { ...state.player, currentLocation: target, discoveredLocations: newDiscovered },
    }
  }
}
